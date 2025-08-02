import {
	deleteFileFromBucket,
	fetchAndDownloadFolder,
	renameFileInBucket,
	updateContentOnStorageBucket,
} from '../config/firebase-admin';
import { ContainerManager, validateCommand } from '../docker/containerManager';
import { verifyJWTForSocket } from '../middleware/verifyJWT';
import { UserType } from '../models/user';
import {
	fetchFileContent,
	fetchFolderStructure,
	updateContentOnServer,
} from './project';
import fs from 'fs';

export const socketController = async (socket: any) => {
	const socketTimeouts = new Map<string, NodeJS.Timeout>();
	const socketContainers = new Map<
		string,
		{
			containerManager: ContainerManager;
			container: any;
			shellSession: any;
			shellStream: any;
		}
	>();
	const projectId = socket.handshake.query.projectId;
	const cookies = socket.handshake.headers.cookie;

	const parsedCookies = cookies
		? Object.fromEntries(
				cookies.split('; ').map((cookie: string) => cookie.split('='))
		  )
		: {};

	const verifyRes = await verifyJWTForSocket(parsedCookies.auth_token);

	let userEmail: string;

	if (verifyRes) {
		userEmail = (verifyRes.user as UserType).email;
		const projectPath = `./user-projects/${userEmail}/${projectId}`;

		if (socketTimeouts.has(userEmail + projectId)) {
			clearTimeout(socketTimeouts.get(userEmail + projectId)!);
			socketTimeouts.delete(userEmail + projectId);
		}

		if (!fs.existsSync(projectPath)) {
			await fetchAndDownloadFolder(
				`user-projects/${userEmail}/${projectId}`,
				`./user-projects/${userEmail}/${projectId}`
			);
		}

		socket.emit('folder-structure', {
			structure: await fetchFolderStructure(
				`./user-projects/${userEmail}/${projectId}`
			),
		});
	} else {
		console.log('Invalid token in socket');
		socket.emit('auth-error', { msg: 'Invalid token' });
		socket.disconnect();
		return;
	}

	// Creating a docker container for the user
	let containerManager = null,
		container = null,
		shellSession = null,
		shellStream = null;

	const session = socketContainers.get(userEmail + projectId);

	if (session && session.containerManager) {
		containerManager = session?.containerManager;
		container = session?.container;
		shellSession = session?.shellSession;
		shellStream = session?.shellStream;
		socketContainers.delete(userEmail + projectId);
	} else {
		containerManager = new ContainerManager();
	}

	try {
		container = container
			? container
			: await containerManager.createContainer(userEmail, projectId);
		await container.start();

		// Create a persistent shell session for this socket
		shellSession = shellSession
			? shellSession
			: await containerManager.createShellSession(container, socket.id);

		shellStream = shellStream
			? shellStream
			: await shellSession.start({
					Detach: false,
					Tty: true,
					hijack: true,
			  });
	} catch (error: any) {
		console.error('Container/Shell creation error:', error);
		socket.emit(
			'command-output',
			`Error: Failed to create container - ${error.message}\r\n`
		);
		return;
	}

	// Initialize the shell with proper settings
	shellStream.write(`cd /${projectId}\n`);
	shellStream.write(`export PS1='/${projectId}\\$ '\n`);
	shellStream.write(`clear\n`);

	// Wait for initialization then send initial prompt
	setTimeout(() => {
		socket.emit('command-output', '');
	}, 1000);

	// Handle shell output
	let lastCommand = '';
	shellStream.on('data', (chunk: any) => {
		const output = chunk.toString();

		// Filter out initialization noise
		if (
			output.includes(`cd /${projectId}`) ||
			output.includes(`export PS1=`) ||
			output.includes(`clear`) ||
			output.trim() === lastCommand
		) {
			return;
		}

		// Replace any # with $ in prompts
		let formattedOutput = output.replace(/#/g, '$');

		socket.emit('command-output', formattedOutput);
	});

	shellStream.on('end', () => {
		socket.emit('command-output', '\r\n');
	});

	shellStream.on('error', (err: any) => {
		console.error('Shell stream error:', err);
		socket.emit('command-output', `Error: ${err.message}\r\n`);
	});

	socket.on('refresh-project-structure', async (callback: Function) => {
		try {
			const structure = await fetchFolderStructure(
				`./user-projects/${userEmail}/${projectId}`
			);
			callback({ success: true, structure });
		} catch (error) {
			console.error('Error fetching folder structure:', error);
			callback({ success: false, error: 'Failed to fetch folder structure' });
		}
	});

	socket.on(
		'fetch-folder-contents',
		async (folderPath: string, callback: Function) => {
			try {
				const folderStructure = await fetchFolderStructure(folderPath);
				callback({ success: true, folder: folderStructure });
			} catch (error) {
				console.error('Error fetching folder contents:', error);
				callback({ success: false, error: 'Failed to fetch folder contents' });
			}
		}
	);

	socket.on(
		'fetch-file-content',
		async (filePath: string, callback: Function) => {
			try {
				const content = fetchFileContent(filePath);
				callback({ success: true, content });
			} catch (error) {
				console.error('Error fetching file content:', error);
				callback({ success: false, error: 'Failed to fetch file content' });
			}
		}
	);

	socket.on(
		'update-file-content',
		async (data: { filePath: string; content: string }, callback: Function) => {
			try {
				await updateContentOnServer(data.filePath, data.content);
				await updateContentOnStorageBucket(projectId as string, data.filePath);
				callback({
					success: true,
					message: 'File content updated successfully',
				});
			} catch (error) {
				console.error('Error updating file content:', error);
				callback({ success: false, error: 'Failed to update file content' });
			}
		}
	);

	socket.on(
		'create-file',
		async (data: { path: string; type: string }, callback: Function) => {
			try {
				const exists = fs.existsSync(data.path);

				if (exists) {
					return callback({
						success: false,
						error: 'File or folder already exists.',
					});
				}

				if (data.type === 'file') {
					fs.writeFileSync(data.path, '');
					await updateContentOnStorageBucket(projectId as string, data.path);
				} else if (data.type === 'dir') {
					fs.mkdirSync(data.path, { recursive: true });
				} else {
					return callback({ success: false, error: 'Invalid type' });
				}

				callback({ success: true });
			} catch (err) {
				console.error('Error creating file/folder:', err);
				callback({ success: false, error: 'Internal server error' });
			}
		}
	);

	socket.on(
		'delete-file',
		async (
			data: { path: string; type: 'file' | 'dir' },
			callback: Function
		) => {
			try {
				if (!fs.existsSync(data.path)) {
					return callback({ success: false, error: 'File not found' });
				}
				fs.rmSync(data.path, { recursive: true, force: true });
				await deleteFileFromBucket(data.path.slice(2), data.type);
				callback({ success: true });
			} catch (err) {
				console.error('Error deleting file:', err);
				callback({ success: false, error: 'Internal server error' });
			}
		}
	);

	socket.on(
		'rename-file',
		async (
			data: { oldPath: string; newPath: string; type: 'file' | 'dir' },
			callback: Function
		) => {
			try {
				if (!fs.existsSync(data.oldPath)) {
					return callback({ success: false, error: 'File not found' });
				}
				fs.renameSync(data.oldPath, data.newPath);
				console.log(`Renaming file from ${data.oldPath} to ${data.newPath}`);
				await renameFileInBucket(
					data.oldPath.slice(2),
					data.newPath.slice(2),
					data.type
				);
				callback({ success: true });
			} catch (err) {
				console.error('Error renaming file:', err);
				callback({ success: false, error: 'Internal server error' });
			}
		}
	);

	socket.on('execute-command', async (command: string, callback: Function) => {
		console.log('Command received: ', command);

		// Handle Ctrl+C
		if (command === '\x03') {
			shellStream.write('\x03');
			setTimeout(() => {
				shellStream.write(`/${projectId}$ `);
			}, 100);
			return;
		}

		// Handle empty command
		if (!command.trim()) {
			socket.emit('command-output', `/${projectId}$ `);
			return;
		}

		// Validate command
		if (!validateCommand(command.trim())) {
			socket.emit(
				'command-output',
				`\r\nError: Command not allowed\r\n/${projectId}$ `
			);
			return;
		}

		try {
			lastCommand = command.trim();
			shellStream.write(command.trim() + '\n');
		} catch (err: any) {
			console.log('Terminal Error: ', err.message);
			socket.emit(
				'command-output',
				`\r\nError: ${err.message}\r\n/${projectId}$ `
			);
		}
		if (
			['npm', 'npx', 'mkdir', 'touch', 'rmdir', 'rm', 'cp', 'ls'].includes(
				command.trim().split(' ')[0]
			)
		)
			callback();
	});
	socket.on('disconnect', async (reason: string) => {
		try {
			console.log(`Socket disconnected: ${reason}`);
			const timeout = setTimeout(async () => {
				// clean ups
				containerManager.removeShellSession(socket.id);
				await container.stop();
				if (fs.existsSync(`./user-projects/${userEmail}/${projectId}`))
					fs.rmSync(`./user-projects/${userEmail}`, { recursive: true });
			}, 120000);

			socketTimeouts.set(userEmail + projectId, timeout);
			socketContainers.set(userEmail + projectId, {
				containerManager,
				container,
				shellSession,
				shellStream,
			});
		} catch (error) {
			console.error('Error during socket disconnect:', error);
		}
	});
};
