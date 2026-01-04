import 'dotenv/config';
import express, { Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
import { handleAuth } from './controller/user';
import { deleteProject, getAllProjects, initializeProject } from './controller/project';
import { socketController } from './controller/socketController';
import { setCookie } from './middleware/setCookie';
import { verifyJWT } from './middleware/verifyJWT';
import { askAI } from './controller/ai';

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;
const httpServer = createServer(app);

// Configure WebSocket server
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

// Configure CORS middleware
app.use(
	cors({
		origin: [
			'https://code-labs.tech',
			'https://www.code-labs.tech',
			'http://localhost:5173',
		],
		methods: ['GET', 'POST', 'DELETE'],
		credentials: true,
	})
);

// Connect to database
connectDB();

// Middlewares
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());

// Routes
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
app.delete('/api/project/:projectId', verifyJWT, deleteProject);
app.post('/api/ai/ask', verifyJWT, askAI);

// 404 Not Found handler
app.all('*', (_, res: Response) => {
	res.status(404).send({
		error: 'Route not found',
		message: 'The requested endpoint does not exist',
	});
});

// WebSocket connection handler
io.on('connection', socketController);

// Start HTTP server
httpServer.listen(port, () => {
	console.log(`✅ Server is running on port ${port}`);
});
