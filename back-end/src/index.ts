import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import express, { Request, Response } from 'express';
import {
	fetchFileContent,
	fetchFolderStructure,
	initializeProject,
	updateContentOnServer,
} from './controller/project';
import { fetchAndDownloadFolder, updateContentOnStorageBucket } from './config/firebase-admin';
import { handleAuth } from './controller/user';
import connectDB from './config/db';

const app = express();
const port = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: ['http://localhost:5173'],
		methods: ['GET', 'POST'],
	},
});

app.use(
	cors({
		origin: ['http://localhost:5173'],
		methods: ['GET', 'POST'],
	})
);

connectDB();

app.use(express.json());
app.get('/', (req: Request, res: Response) => {
	res.status(200).send('Welcome to the CodeLabs 🚀');
});

app.post('/api/auth', handleAuth)
app.post('/api/create-project', initializeProject);

io.on('connection', async (socket) => {
	const projectId = socket.handshake.query.projectId;
	await fetchAndDownloadFolder(`${projectId}`, `./user-projects/${projectId}`);
	socket.emit('folder-structure', {
		structure: await fetchFolderStructure(`./user-projects/${projectId}`),
	});
	socket.on('fetch-folder-contents', async (folderPath: string) => {
		socket.emit('folder-contents', {
			folder: await fetchFolderStructure(folderPath),
		});
	});
	socket.on('fetch-file-content', async (filePath: string) => {
		socket.emit('file-content', {
			content: fetchFileContent(filePath),
		});
	});
	socket.on('update-file-content', async (data) => {
		await updateContentOnServer(data.filePath, data.content);
		await updateContentOnStorageBucket(projectId as string, data.filePath);
		socket.emit('file-content-updated', {
			message: 'File content updated successfully',
		});
	});
});

httpServer.listen(port, () => {
	console.log(`✅ Server is running on port ${port}`);
});
