import { NextFunction, Request, Response } from 'express';
import { decode, verify } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

declare module 'express-serve-static-core' {
  interface Request {
	user?: any;
  }
}

const client = jwksClient({
	jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

const getAuth0Key = async (header: any): Promise<string> => {
	try {
		const key = await client.getSigningKey(header?.kid);
		return key.getPublicKey();
	} catch (err: any) {
		throw new Error(`Error retrieving signing key: ${err.message}`);
	}
};

export const verifyJWT = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const token =
			req.cookies.auth_token || req.headers.authorization?.split(' ')[1];
		if (!token) {
			res.status(400).json({ success: false, message: 'Token not provided' });
			return;
		}
		console.log("cookies  - ",req.cookies)
		const header = decode(token, { complete: true })?.header;
		console.log('decoded token header - ', header);
		const auth0key = await getAuth0Key(header);
		console.log('auth0key - ', auth0key);
		const decoded = verify(token, auth0key, {
			algorithms: ['RS256'],
			// audience :,
			issuer: 'https://' + process.env.AUTH0_DOMAIN + '/',
		});
		req.user = decoded;
		console.log('decoded : ', decoded);
		next();
	} catch (error: any) {
		console.log('Invalid token', error);
		res.status(500).json({ success: false, message: error.message });
	}
};
