import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import express, { Request, Response } from 'express';
import { initializeProject } from './controller/project';
import { fetchAndDownloadFolder } from './config/firebase-admin';

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

app.use(express.json());
app.get('/', (req: Request, res: Response) => {
	res.status(200).send('Welcome to the CodeLabs 🚀');
});

app.post('/api/create-project', initializeProject);

io.on('connection', async (socket) => {
	const projectId = socket.handshake.query.projectId;
    console.log('projectId : ', projectId);
	const res = await fetchAndDownloadFolder(
		`${projectId}`,
		`./user-projects/${projectId}`
	);
    console.log('res : ', res);
});

httpServer.listen(port, () => {
	console.log(`✅ Server is running on port ${port}`);
});
