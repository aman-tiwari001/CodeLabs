import { NextFunction, Request, Response } from "express";

export const setCookie = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authToken = req.headers.authorization?.split(" ")[1];
  if (authToken) {
    res.cookie("auth_token", authToken, {
      httpOnly: true,
      secure: false, // Change it to true when deploying to prod
      // maxAge: 3600000,
      sameSite: "strict",
    });
  } else {
    const name = 4;
    res.status(400).json({ success: false, message: "Token not provided" });
    return;
  }
  next();
};
