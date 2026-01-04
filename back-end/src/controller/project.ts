import fs from 'fs';
import { Request, Response } from 'express';
import { copyFolderInBucket, deleteFileFromBucket, deleteFolderFromBucket } from '../config/firebase-admin';
import User from '../models/user';
import path from 'path';

export const initializeProject = async (req: Request, res: Response) => {
	try {
		const { name, techStack } = req.body;
		if (!name || !techStack) {
			res
				.status(400)
				.json({ success: false, message: 'Please provide all the fields' });
			return;
		}
		if (name.length < 3 || name.length > 30) {
			res.status(400).json({
				success: false,
				message: 'Project name must be between 3 and 50 characters',
			});
			return;
		}
		if (
			techStack !== 'blank' &&
			techStack !== 'react' &&
			techStack !== 'node' &&
			techStack !== 'express' &&
			techStack !== 'nextjs'
		) {
			res.status(400).json({ success: false, message: 'Invalid tech stack' });
			return;
		}

		const user = await User.findOne({ email: req.user.email });
		if (!user) {
			res.status(404).json({ success: false, message: 'User not found' });
			return;
		}
		const projectExists = await User.findOne({
			projects: { $elemMatch: { name } },
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

		if (techStack === 'blank') {
			// Create an empty project folder for blank projects
			await copyFolderInBucket(
				`bases/blank`,
				`user-projects/${req.user.email}/${name}`
			);
		} else {
			await copyFolderInBucket(
				`bases/${techStack}`,
				`user-projects/${req.user.email}/${name}`
			);
		}

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

export const deleteProject = async (req: Request, res: Response) => {
	try {
		const user = await User.findOne({ email: req.user.email });
		if (!user) {
			res.status(404).json({ success: false, message: 'User not found' });
			return;
		}

		const { projectId } = req.params;
    if (!projectId) {
      res.status(400).json({ success: false, message: 'Project ID is required' });
      return;
    }
    
    console.log(projectId)

    await deleteFolderFromBucket(
      `user-projects/${req.user.email}/${projectId}`
    );
    console.log(`Deleted project directory user-projects/${req.user.email}/${projectId} from bucket`);

		await User.updateOne(
			{ email: req.user.email },
			{ $pull: { projects: { name: projectId } } }
		);

		res
			.status(200)
			.json({
				success: true,
				result: user.projects,
				message: 'Project deleted successfully',
			});
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
		return null;
	}
};

export const updateContentOnServer = (filePath: string, content: string) => {
	// Update content in the server
	return new Promise((resolve, reject) => {
		const dir = path.dirname(filePath); // Extract the folder path
		// Ensure the directory exists
		fs.mkdir(dir, { recursive: true }, (err) => {
			if (err) {
				return reject(err);
			}

			// Write the file
			fs.writeFile(filePath, content, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve('File content updated successfully');
				}
			});
		});
	});
};
