import {
	fetchAndDownloadFolder,
	updateContentOnStorageBucket,
} from '../config/firebase-admin';
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
	console.log('Cookies from socket : ', cookies);
	const parsedCookies = cookies
		? Object.fromEntries(
				cookies.split('; ').map((cookie: string) => cookie.split('='))
		  )
		: {};

	console.log('Parsed cookies : ', parsedCookies);

	const verifyRes = await verifyJWTForSocket(parsedCookies.auth_token);

	if (verifyRes) {
		const user = verifyRes.user as UserType;
		await fetchAndDownloadFolder(
			`${user.email}/${projectId}`,
			`./user-projects/${user.email}/${projectId}`
		);
		socket.emit('folder-structure', {
			structure: await fetchFolderStructure(
				`./user-projects/${user.email}/${projectId}`
			),
		});
	} else {
		console.log('Invalid token in socket');
		socket.emit('auth-error', { msg: 'Invalid token' });
		socket.disconnect();
	}

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
};
