import { NextFunction, Request, Response } from 'express';

export const setCookie = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const authToken = req.headers.authorization?.split(' ')[1];
	if (authToken) {
		res.cookie('auth_token', authToken, {
			httpOnly: true,
			secure: true, // Change it to true when deploying to prod
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			sameSite: 'strict',
		});
	} else {
		res.status(401).json({ success: false, message: 'Token not provided' });
		return;
	}
	next();
};
