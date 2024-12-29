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

app.get('/', (req: Request, res: Response) => {
	// console.log(req.headers['user-agent'])
	// console.log(req.headers['origin'])
	// console.log(req.headers['referer'])
	// console.log(req.headers['x-forwarded-for'], req.connection.remoteAddress)
	res.status(200).send('Welcome to the CodeLabs 🚀');
});
app.post('/api/auth', verifyJWT, setCookie, handleAuth);
app.post('/api/create-project', verifyJWT, initializeProject);
app.get('/api/get-projects', verifyJWT, getAllProjects);

io.on('connection', socketController);

httpServer.listen(port, () => {
	console.log(`✅ Server is running on port ${port}`);
});
