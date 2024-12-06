import mongoose from 'mongoose';

const connectDB = async () => {
	try {
		await mongoose.connect(
			process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codelabs'
		);
		console.log('✅ Connected to database!');
	} catch (error) {
		console.log('Unable to connect to database!', error);
		process.exit(0);
	}
};

export default connectDB;
