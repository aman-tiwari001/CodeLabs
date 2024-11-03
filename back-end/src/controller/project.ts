import { Request, Response } from 'express';
import { copyFolderInBucket } from '../config/firebase-admin';

export const initializeProject = async (req: Request, res: Response) => {
	try {
		const { projectId, techstack } = req.body;
		if (!projectId || !techstack) {
			res.status(400).json({ message: 'Please provide all the fields' });
			return;
		}
		await copyFolderInBucket(`base/${techstack}`, `${projectId}`);
		res.status(200).json({ message: 'Project initialized successfully' });
	} catch (error) {
		console.error('Error initializing project:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const testFunc = async (req: Request, res: Response) => {
	res.status(200).send('Welcome to the CodeLabs 🚀');
};
