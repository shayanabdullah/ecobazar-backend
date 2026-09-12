import { Request, Response } from "express";
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserJwtPayload } from "../types/types.js";
import {
  sendForgotPasswordEmail,
  sendVerificationEmail,
} from "../utils/emailSender.js";

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

  await sendVerificationEmail(user.email, user.fullName, verificationToken);

  return res.status(201).json({
    success: true,
    message: "Your account has been created successfully. Welcome to EcoBazar!",
  });
};

const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  }

  const passwordCompare = bcrypt.compareSync(password, user.password);

  if (!passwordCompare) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  }
  const accessToken = jwt.sign(
    {
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET as string,
    {
      expiresIn: "7d",
    },
  );

  return res.status(200).json({
    success: true,
    message: "Login successful.",
    data: {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
    accessToken: accessToken,
  });
};

const verifyController = async (req: Request, res: Response) => {
  const { token } = req.params;
  const decodedToken = jwt.verify(
    token as string,
    process.env.JWT_ACCESS_SECRET as string,
  ) as UserJwtPayload;

  if (!decodedToken) {
    return res.status(400).json({
      success: false,
      message: "Invalid token.",
    });
  }

  const user = await userModel.findOneAndUpdate(
    { _id: decodedToken._id },
    {
      isAccountVerified: true,
    },
  );

  return res.status(200).json({
    success: true,
    message: "Account verification successful.",
  });
};

const forgotPasswordController = async (req: Request, res: Response) => {
  const { email } = req.body;

  const existingUser = await userModel.findOne({ email });

  if (!existingUser) {
    return res.status(400).json({
      success: false,
      message:
        "We couldn't find an account associated with this email address.",
    });
  }

  const resetPasswordToken = jwt.sign(
    {
      _id: existingUser._id.toString(),
      email: existingUser.email,
    },
    process.env.JWT_ACCESS_SECRET as string,
    {
      expiresIn: "10m",
    },
  );

  await sendForgotPasswordEmail(
    email,
    existingUser.fullName,
    resetPasswordToken,
  );

  return res.status(200).json({
    success: true,
    message:
      "We've sent password reset instructions to your email address. Please check your inbox.",
  });
};

const resetPasswordController = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;


  const decodedToken = jwt.verify(token as string, process.env.JWT_ACCESS_SECRET as string) as UserJwtPayload;

   if(!decodedToken){
    return res.status(400).json({
      success: false,
      message: "Invalid token.",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "The passwords you entered do not match.",
    });
  }
   const hashedpassword = await bcrypt.hash(newPassword, 10);

await userModel.findOneAndUpdate({ _id: decodedToken._id }, {password: hashedpassword});


  return res.status(200).json({
    success: true,
    message:
      "Password reset successful.",
  });
};
export {
  registrationController,
  loginController,
  verifyController,
  forgotPasswordController,
  resetPasswordController,
};
