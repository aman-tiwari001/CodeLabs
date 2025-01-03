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
	console.log('Cookies from socket : ', cookies);
	const parsedCookies = cookies
		? Object.fromEntries(
				cookies.split('; ').map((cookie: string) => cookie.split('='))
		  )
		: {};

	console.log('Parsed cookies : ', parsedCookies);
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

	socket.on('execute-command', async (command: string, callback: Function) => {
		console.log('Command received: ', command);
		if (!validateCommand(command)) {
			callback('Error: Command not allowed');
			return;
		}

		try {
			const stream = await containerManager.executeCommand(container, command);

			// Stream output back to client
			stream.on('data', (chunk) => {
				callback(chunk.toString());
			});

			stream.on('end', () => {
				callback('\r\n');
			});
		} catch (err: any) {
			callback(`Error: ${err.message}`);
		}
	});

	socket.on('disconnect', async (reason: string) => {
		console.log(`Socket disconnected: ${reason}`);
		// clean ups
		await container.stop();
		fs.rmSync(`./user-projects/${userEmail}`, { recursive: true });
	});
};
