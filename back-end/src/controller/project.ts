import fs from 'fs';
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

export const fetchFolderStructure = (sourcePath: string) => {
	return new Promise((resolve, reject) => {
		fs.readdir(sourcePath, { withFileTypes: true }, (err, files) => {
			if (err) {
				reject(err);
			} else {
				const folderStructure = files.map((file) => {
					return {
						type: file.isDirectory() ? 'dir' : 'file',
						name: file.name,
						path: `${sourcePath}/${file.name}`,
					};
				});
				resolve(folderStructure);
			}
		});
	});
};

export const fetchFileContent = (filePath: string) => {
	try {
		const fileContent = fs.readFileSync(filePath, 'utf8');
		return fileContent;
	} catch (error) {
		console.error('Error fetching file content:', error);
	}
};

export const updateContentOnServer = (
	filePath: string,
	content: string
) => {
	// Update content in the server
	return new Promise((resolve, reject) => {
		fs.writeFile(filePath, content, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve('File content updated successfully');
			}
		});
	});
};