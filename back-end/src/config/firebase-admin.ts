import admin from 'firebase-admin';
import { initializeApp, ServiceAccount } from 'firebase-admin/app';
import serviceAccount from './fb_secrets.json';
import path from 'path';
import fs from 'fs';

const firebaseConfig = {
	apiKey: process.env.apiKey,
	authDomain: process.env.authDomain,
	projectId: process.env.projectId,
	storageBucket: process.env.storageBucket,
	messagingSenderId: process.env.messagingSenderId,
	appId: process.env.appId,
	measurementId: process.env.measurementId,
	credential: admin.credential.cert(serviceAccount as ServiceAccount),
};

const app = initializeApp(firebaseConfig);

const bucket = admin.storage().bucket();

export const copyFileInBucket = async (
	sourcePath: string,
	destinationPath: string
) => {
	try {
		// References
		const sourceFile = bucket.file(sourcePath);
		const destinationFile = bucket.file(destinationPath);

		await sourceFile.copy(destinationFile);
		console.log(`File copied from ${sourcePath} to ${destinationPath}`);
	} catch (error) {
		console.error('Error copying file:', error);
	}
};

export const copyFolderInBucket = async (
	sourceFolder: string,
	destinationFolder: string
) => {
	try {
		const [files] = await bucket.getFiles({ prefix: sourceFolder });
		let fileCount = 0;

		const copyPromises = files.map(async (file) => {
			const destinationFilePath =
				destinationFolder + file.name.substring(sourceFolder.length);
			await file.copy(bucket.file(destinationFilePath));
			fileCount++;
			console.log(`Copied ${file.name} to ${destinationFilePath}`);
		});

		await Promise.all(copyPromises);
		console.log(fileCount + ' files copied successfully.');
	} catch (error) {
		console.error('Error copying files:', error);
	}
};

export async function downloadFile(filePath: string, localFilePath: string) {
	await bucket.file(filePath).download({ destination: localFilePath });
}

// Function to download entire directory structure
export const fetchAndDownloadFolder = async (
	remoteDir: string,
	localDir: string
) => {
	try {
		const [files] = await bucket.getFiles({ prefix: remoteDir });

		for (const file of files) {
			const filePath = file.name;
			const relativeFilePath = filePath.substring(remoteDir.length); // Get relative path
			const localFilePath = path.join(localDir, relativeFilePath);

			// If it's a file (not a directory), download it
			if (!filePath.endsWith('/')) {
				fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
				await downloadFile(filePath, localFilePath);
			} else {
				// if it is directory, create the empty dir
				fs.mkdirSync(localFilePath, { recursive: true });
			}
		}
	} catch (error) {
		console.error('Error downloading folder:', error);
	}
};

export const updateContentOnStorageBucket = async (
	projectId: string,
	filePath: string
) => {
	// Update content in the storage bucket
	console.log('Updating content on storage bucket:', filePath.slice(2));
	try {
		await bucket.upload(filePath, {
			destination: filePath.slice(2),
		});
	} catch (error) {
		console.error('Error updating content on storage bucket:', error);
	}
};

export const deleteFileFromBucket = async (
	filePath: string,
	type: 'file' | 'dir'
) => {
	try {
		// If it's a directory, recursively delete all files within it
		if (type === 'dir') {
			console.log(`Deleting directory: ${filePath}`);
			const [files] = await bucket.getFiles({ prefix: filePath });
			const deletePromises = files.map((file) => file.delete());
			await Promise.all(deletePromises);
			console.log(`Recursively deleted all files in directory: ${filePath}`);
			return;
		}
		await bucket.file(filePath).delete();
		console.log(`File deleted: ${filePath}`);
	} catch (error) {
		console.error('Error deleting file:', error);
	}
};

export const renameFileInBucket = async (
	filePath: string,
	newPath: string,
	type: 'file' | 'dir'
) => {
	try {
		// If it's a directory, rename all files within it
		if (type === 'dir') {
			console.log(`Renaming directory: ${filePath} to ${newPath}`);
			const [files] = await bucket.getFiles({ prefix: filePath });
			const renamePromises = files.map((file) => {
				const newFilePath = file.name.replace(filePath, newPath);
				return file.move(newFilePath);
			});
			await Promise.all(renamePromises);
			console.log(`Directory renamed: ${filePath} to ${newPath}`);
			return;
		}
		const file = bucket.file(filePath);
		const newFileName = filePath.replace(/\/$/, '');
		await file.move(newPath);
		console.log(`File renamed to: ${newFileName}`);
	} catch (error) {
		console.error('Error renaming file:', error);
	}
};
