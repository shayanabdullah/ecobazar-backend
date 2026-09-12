import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { UserJwtPayload } from "../types/types.js";

const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is required.",
      });
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    ) as UserJwtPayload;

    if (decodedToken.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this route.",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

const vendorMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is required.",
      });
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    ) as UserJwtPayload;

    if (decodedToken.role === "user") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this route.",
      });
    }

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};
const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is required.",
      });
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    ) as UserJwtPayload;


    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

export {
  adminMiddleware,
  vendorMiddleware,
  userMiddleware
};