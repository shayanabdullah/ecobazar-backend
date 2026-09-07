import { Request, Response } from "express";
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserJwtPayload } from "../types/types.js";
import { verifyEmail } from "./../services/emailSender.js";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const registrationController = async (req: Request, res: Response) => {
  const { fullName, email, password, confirmPassword, terms } = req.body;

  const existingUser = await userModel.findOne({ email });

  if (!fullName || !email || !password || !confirmPassword || !terms) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required information to continue.",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "The passwords you entered do not match.",
    });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address.",
    });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 8 characters and contain an uppercase letter, a lowercase letter, a number, and a special character.",
    });
  }
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "An account with this email address already exists.",
    });
  }
  const hashedpassword = await bcrypt.hash(password, 10);
  const user = await new userModel({
    fullName,
    email,
    password: hashedpassword,
    terms,
  }).save();

  const userPayload: UserJwtPayload = {
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const verificationToken = jwt.sign(
    userPayload,
    process.env.JWT_ACCESS_SECRET as string,
    {
      expiresIn: "7d",
    },
  );

  await verifyEmail(user.email, verificationToken);

  return res.status(201).json({
    success: true,
    message: "Your account has been created successfully. Welcome to EcoBazar!",
  });
};

const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
}

export { registrationController, loginController };
