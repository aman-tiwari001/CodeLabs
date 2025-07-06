const admin = require('firebase-admin');
const serviceAccount = require('./fb_secrets.json');
const { initializeApp } = require('firebase-admin/app');
const fs = require('fs');
const path = require('path');

const firebaseConfig = {
	apiKey: process.env.apiKey,
	authDomain: process.env.authDomain,
	projectId: process.env.projectId,
	storageBucket: process.env.storageBucket,
	messagingSenderId: process.env.messagingSenderId,
	appId: process.env.appId,
	measurementId: process.env.measurementId,
	credential: admin.credential.cert(serviceAccount),
};

initializeApp(firebaseConfig);

const bucket = admin.storage().bucket();

// Function to recursively upload a directory
const uploadDirectory = async (localPath, bucketBasePath) => {
	const entries = fs.readdirSync(localPath, { withFileTypes: true });

	for (const entry of entries) {
		const fullLocalPath = path.join(localPath, entry.name);
		// Get the path relative to the base directory we're uploading
		const relativePath = path.relative(localPath, fullLocalPath);
		// Create the full bucket path by joining the base path and relative path
		const bucketPath = path.posix.join(bucketBasePath, relativePath);

		if (entry.isDirectory()) {
			// Recursively upload subdirectories with the same bucket path
			await uploadDirectory(fullLocalPath, bucketPath);
		} else {
			// Upload individual file
			try {
				console.log(`Uploading: ${fullLocalPath} -> ${bucketPath}`);
				await bucket.upload(fullLocalPath, {
					destination: bucketPath,
				});
				console.log(`✓ Uploaded: ${entry.name}`);
			} catch (error) {
				console.error(`Error uploading ${entry.name}:`, error);
			}
		}
	}
};

const updateContentOnStorageBucket = async (filePath, techStack) => {
	console.log('Starting upload to storage bucket:', filePath);
	try {
		const stats = fs.statSync(filePath);

		if (stats.isDirectory()) {
			// If it's a directory, use recursive upload
			await uploadDirectory(filePath, `bases/${techStack}`);
			console.log('Directory upload completed successfully');
		} else {
			// If it's a single file, upload directly
			const fileName = path.basename(filePath);
			await bucket.upload(filePath, {
				destination: `bases/${techStack}/${fileName}`,
			});
			console.log('Single file uploaded successfully');
		}
	} catch (error) {
		console.error('Error updating content on storage bucket:', error);
		throw error;
	}
};

// Start the upload process
updateContentOnStorageBucket('D:\\bases\\nextjs', 'nextjs')
	.then(() => console.log('Upload process completed'))
	.catch((error) => console.error('Upload failed:', error));
