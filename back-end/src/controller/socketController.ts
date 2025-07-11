import {
	fetchAndDownloadFolder,
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

export const socketController = async (socket: any) => {
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
		await fetchAndDownloadFolder(
			`user-projects/${userEmail}/${projectId}`,
			`./user-projects/${userEmail}/${projectId}`
		);
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
	} // Creating a docker container for the user
	const containerManager = new ContainerManager();
	let container, shellSession, shellStream;

	try {
		container = await containerManager.createContainer(userEmail, projectId);
		await container.start();

		// Create a persistent shell session for this socket
		shellSession = await containerManager.createShellSession(
			container,
			socket.id
		);
		shellStream = await shellSession.start({
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
		socket.emit('command-output', `/${projectId}$ `);
	}, 1000);

	// Handle shell output
	let lastCommand = '';
	shellStream.on('data', (chunk) => {
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

	shellStream.on('error', (err) => {
		console.error('Shell stream error:', err);
		socket.emit('command-output', `Error: ${err.message}\r\n`);
	});

	socket.on('refresh-project-structure', async (callback: Function) => {
		const structure = await fetchFolderStructure(
			`./user-projects/${userEmail}/${projectId}`
		);
		callback({ structure });
	});

	socket.on(
		'fetch-folder-contents',
		async (folderPath: string, callback: Function) => {
			const folderStructure = await fetchFolderStructure(folderPath);
			callback({ folder: folderStructure });
		}
	);

	socket.on(
		'fetch-file-content',
		async (filePath: string, callback: Function) => {
			const content = fetchFileContent(filePath);
			callback({ content });
		}
	);

	socket.on(
		'update-file-content',
		async (data: { filePath: string; content: string }, callback: Function) => {
			await updateContentOnServer(data.filePath, data.content);
			await updateContentOnStorageBucket(projectId as string, data.filePath);
			callback({ message: 'File content updated successfully' });
		}
	);
	socket.on('execute-command', async (command: string, callback: Function) => {
		console.log('Command received: ', command);

		// Handle Ctrl+C
		if (command === '\x03') {
			shellStream.write('\x03');
			setTimeout(() => {
				shellStream.write('echo -ne "\\r/${projectId}$ "\n');
			}, 100);
			return;
		}

		// Handle empty command
		if (!command.trim()) {
			socket.emit('command-output', '\r\n/${projectId}$ ');
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
		console.log(`Socket disconnected: ${reason}`);
		// clean ups
		containerManager.removeShellSession(socket.id);
		// await container.stop();
		// fs.rmSync(`./user-projects/${userEmail}`, { recursive: true });
	});
};
