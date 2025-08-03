import { NextFunction, Request, Response } from "express";
import { decode, verify } from "jsonwebtoken";
import jwksClient from "jwks-rsa";

declare module "express-serve-static-core" {
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
  next: NextFunction,
) => {
  try {
    const token =
      req.cookies.auth_token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      const cookies = req.cookies;
      // if (cookies) {
      // 	Object.keys(cookies).forEach((cookieName) => {
      // 		res.clearCookie(cookieName);
      // 	});
      // }
      res.clearCookie("auth_token");
      res.clearCookie("access_token");
      res.status(400).json({ success: false, message: "Token not provided" });
      return;
    }
    const header = decode(token, { complete: true })?.header;
    const auth0key = await getAuth0Key(header);
    const decoded = verify(token, auth0key, {
      algorithms: ["RS256"],
      issuer: "https://" + process.env.AUTH0_DOMAIN + "/",
    });
    req.user = decoded;
    next();
  } catch (error: any) {
    console.log("Invalid token", error);
    const cookies = req.cookies;
    if (cookies) {
      res.clearCookie("auth_token");
      res.clearCookie("access_token");
      // Object.keys(cookies).forEach((cookieName) => {
      // 	res.clearCookie(cookieName);
      // });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyJWTForSocket = async (token: string) => {
  try {
    if (!token) {
      return false;
    }
    const header = decode(token, { complete: true })?.header;
    const auth0key = await getAuth0Key(header);
    const decoded = verify(token, auth0key, {
      algorithms: ["RS256"],
      issuer: "https://" + process.env.AUTH0_DOMAIN + "/",
    });
    console.log("Socket token verified");
    return { success: true, user: decoded };
  } catch (error: any) {
    console.log("Invalid token", error);
    return false;
  }
};
