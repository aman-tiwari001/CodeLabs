import 'dotenv/config';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import express, { Response } from 'express';
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
		origin: [
			'https://code-labs.tech',
			'https://www.code-labs.tech',
			'http://localhost:5173',
		],
		methods: ['GET', 'POST'],
		credentials: true,
	},
});

app.use(
	cors({
		origin: [
			'https://code-labs.tech',
			'https://www.code-labs.tech',
			'http://localhost:5173',
		],
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

app.get('/health', (_, res: Response) => {
	res.status(200).json({
		status: 'healthy',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	});
});

app.post('/api/auth', verifyJWT, setCookie, handleAuth);
app.post('/api/project', verifyJWT, initializeProject);
app.get('/api/projects', verifyJWT, getAllProjects);

app.all('*', (_, res: Response) => {
	res.status(404).send({
		error: 'Route not found',
		message: 'The requested endpoint does not exist',
	});
});

io.on('connection', socketController);

httpServer.listen(port, () => {
	console.log(`✅ Server is running on port ${port}`);
});
