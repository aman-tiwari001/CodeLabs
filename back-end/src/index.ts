import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import { getAllProjects, initializeProject } from './controller/project';
import { handleAuth } from './controller/user';
import connectDB from './config/db';
import { verifyJWT } from './middleware/verifyJWT';
import { setCookie } from './middleware/setCookie';
import { socketController } from './controller/socketController';

const app = express();
const port = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: ['http://localhost:5173'],
		methods: ['GET', 'POST'],
		credentials: true,
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

app.get('/', (_, res: Response) => {
	res.status(200).send('Welcome to the CodeLabs 🚀');
});

app.post('/api/auth', verifyJWT, setCookie, handleAuth);
app.post('/api/project', verifyJWT, initializeProject);
app.get('/api/projects', verifyJWT, getAllProjects);

app.all('*', (_, res: Response) => {
	res.status(404).send('404 | Route not found');
});

io.on('connection', socketController);

httpServer.listen(port, () => {
	console.log(`✅ Server is running on port ${port}`);
});
