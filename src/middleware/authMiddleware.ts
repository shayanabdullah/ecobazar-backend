import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserJwtPayload } from "../types/types.js";

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {refreshToken} = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required to access this resource.",
      });
    }

    const token = refreshToken;

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string,
    ) as UserJwtPayload;

   req.user = {
  userId: decoded.userId,
  email: decoded.email,
  role: decoded.role,
};

    next();
  } catch (error: any) {
    console.log(error);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication failed. Please try again later.",
      error: error.message,
    });
  }
};



export { authMiddleware };