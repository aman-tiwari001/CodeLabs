import { Request, Response } from 'express';
import User from '../models/user';

export const handleAuth = async (req: Request, res: Response) => {
	try {
		const { name, email, picture, sub } = req.body;

    if(!name || !email || !sub) {
      res.status(400).json({
				success: false,
				message: 'Missing fields!',
			});
      return;
    }

		//check if user exist
		const user = await User.findOne({ email });
		if (!user) {
			const newUser = await User.create({ name, email, picture, sub });
			res.status(200).json({
				success: true,
				message: 'User registered successfully',
				result: newUser,
			});
      return;
		}
		res.status(200).json({
			success: true,
			message: 'User logged in successfully',
			result: user,
		});
	} catch (error: any) {
		console.log('Error regsitering user', error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};
