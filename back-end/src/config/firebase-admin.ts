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

export const copyFilesInBucket = async (
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
		// List files in the source folder including those in subdirectories
		const [files] = await bucket.getFiles({ prefix: sourceFolder });
		let fileCount = 0;

		// Copy each file to the new destination while preserving the folder structure
		const copyPromises = files.map(async (file) => {
			// destination file path by replacing the source folder prefix
			const destinationFilePath =
				destinationFolder + file.name.substring(sourceFolder.length);
			console.log('destinationFilePath : ', destinationFilePath);
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
	console.log(`Downloaded: ${filePath} -> ${localFilePath}`);
}

// Function to download entire directory structure
export async function fetchAndDownloadFolder(
	remoteDir: string,
	localDir: string
) {
	const [files] = await bucket.getFiles({ prefix: remoteDir });

	for (const file of files) {
		const filePath = file.name;
		const relativeFilePath = filePath.substring(remoteDir.length); // Get relative path
		const localFilePath = path.join(localDir, relativeFilePath);

		// If it's a file (not a directory), download it
		if (!filePath.endsWith('/')) {
			fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
			await downloadFile(filePath, localFilePath);
		} else { // if it is directory, create the empry dir
			fs.mkdirSync(localFilePath, { recursive: true });
		}
	}
}
