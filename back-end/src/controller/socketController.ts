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
import fs from 'fs';

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
			`${userEmail}/${projectId}`,
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
	}

	// Creating a docker container for the user
	const containerManager = new ContainerManager();
	const container = await containerManager.createContainer(
		userEmail,
		projectId
	);
	await container.start();

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

	socket.on('execute-command', async (command: string) => {
		console.log('Command received: ', command);
		if (!validateCommand(command)) {
			socket.emit('command-output', 'Error: Command not allowed');
			return;
		}

		try {
			const stream = await containerManager.executeCommand(container, command);
			// Stream output back to client
			stream.on('data', (chunk) => {
				console.log('Chunk : ', chunk.toString());
				// callback(chunk.toString());
				socket.emit('command-output', chunk.toString());
			});

			stream.on('end', () => {
				console.log('Stream ended');
				socket.emit('command-output', '\r');
			});
		} catch (err: any) {
			console.log('term Error : ', err.message)
			socket.emit('command-output', `Error: ${err.message}`);
		}
	});

	socket.on('disconnect', async (reason: string) => {
		console.log(`Socket disconnected: ${reason}`);
		// clean ups
		// await container.stop();
		// fs.rmSync(`./user-projects/${userEmail}`, { recursive: true });
	});
};
