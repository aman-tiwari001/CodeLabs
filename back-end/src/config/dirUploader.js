const admin = require("firebase-admin");
const { initializeApp } = require("firebase-admin/app");
const fs = require("fs");
const path = require("path");

const serviceAccount = JSON.parse(
  process.env.FB_SECRETS_JSON || '{}'
);

if (Object.keys(serviceAccount).length === 0) {
  console.error('Firebase credentials are not set in environment variables.');
  console.error('Exiting application...');
  process.exit(1);
}

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

const uploadDirectory = async (localPath, bucketBasePath) => {
  const entries = fs.readdirSync(localPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullLocalPath = path.join(localPath, entry.name);
    const relativePath = path.relative(localPath, fullLocalPath);
    const bucketPath = path.posix.join(bucketBasePath, relativePath);

    if (entry.isDirectory()) {
      await uploadDirectory(fullLocalPath, bucketPath);
    } else {
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
  console.log("Starting upload to storage bucket:", filePath);
  try {
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      await uploadDirectory(filePath, `bases/${techStack}`);
      console.log("Directory upload completed successfully");
    } else {
      const fileName = path.basename(filePath);
      await bucket.upload(filePath, {
        destination: `bases/${techStack}/${fileName}`,
      });
      console.log("Single file uploaded successfully");
    }
  } catch (error) {
    console.error("Error updating content on storage bucket:", error);
    throw error;
  }
};

updateContentOnStorageBucket("D:\\bases\\nextjs", "nextjs")
  .then(() => console.log("Upload process completed"))
  .catch((error) => console.error("Upload failed:", error));
