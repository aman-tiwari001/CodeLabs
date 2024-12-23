import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import {
	fetchFileContent,
	fetchFolderStructure,
	getAllProjects,
	initializeProject,
	updateContentOnServer,
} from './controller/project';
import {
	fetchAndDownloadFolder,
	updateContentOnStorageBucket,
} from './config/firebase-admin';
import { handleAuth } from './controller/user';
import connectDB from './config/db';
import { verifyJWT } from './middleware/verifyJWT';
import { setCookie } from './middleware/setCookie';

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
		credentials: true,
	})
);

connectDB();

app.use(cookieParser());
app.use(express.json());
app.get('/', (req: Request, res: Response) => {
	// console.log(req.headers['user-agent'])
	// console.log(req.headers['origin'])
	// console.log(req.headers['referer'])
	// console.log(req.headers['x-forwarded-for'], req.connection.remoteAddress)
	res.status(200).send('Welcome to the CodeLabs 🚀');
});

app.post('/api/auth', verifyJWT, setCookie, handleAuth);
app.post('/api/create-project', verifyJWT, initializeProject);
app.get('/api/get-projects', verifyJWT, getAllProjects)
app.get('/api/test', (req, res) => {
	console.log(req.cookies);
	res.send({ cookie: req.cookies?.auth_token });
});

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
