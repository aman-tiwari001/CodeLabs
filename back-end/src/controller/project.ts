import fs from 'fs';
import { Request, Response } from 'express';
import { copyFolderInBucket } from '../config/firebase-admin';
import User from '../models/user';

export const initializeProject = async (req: Request, res: Response) => {
	try {
		const { name, techStack } = req.body;
		if (!name || !techStack) {
			res
				.status(400)
				.json({ success: false, message: 'Please provide all the fields' });
			return;
		}
		const user = await User.findOne({ email: req.user.email });
		if (!user) {
			res.status(404).json({ success: false, message: 'User not found' });
			return;
		}
		const projectExists = await User.findOne({
			projects: { $elemMatch: { name: name } },
		});
		if (projectExists) {
			res.status(400).json({
				success: false,
				message: 'Project with this name already exists',
			});
			return;
		}
		user?.projects.push({ name, techStack, createdAt: new Date() });
		await user?.save();
		await copyFolderInBucket(`base/${techStack}`, `${name}`);
		res
			.status(200)
			.json({ success: true, message: 'Project initialized successfully' });
	} catch (error) {
		console.error('Error initializing project:', error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
};

export const getAllProjects = async (req: Request, res: Response) => {
	try {
		const user = await User.findOne({ email: req.user.email });
		if (!user) {
			res.status(404).json({ success: false, message: 'User not found' });
			return;
		}
		res.status(200).json({ success: true, result: user.projects });
	} catch (error) {
		res.status(500).json({ success: false, message: 'Internal server error' });
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

export const updateContentOnServer = (filePath: string, content: string) => {
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
