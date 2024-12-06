import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		match: [/^\S+@\S+\.\S+$/, 'Invalid email address!'],
	},
	picture: {
		type: String,
	},
	sub: {
		type: String,
		required: true,
		unique: true,
	},
	projects: [
		{
			projectId: {
				type: String,
				required: true,
				unique: true,
			},
			techstack: String,
		},
	],
});

const User = mongoose.model('User', UserSchema);
export default User;
