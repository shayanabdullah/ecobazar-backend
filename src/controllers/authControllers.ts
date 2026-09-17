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
  try {
    const { fullName, email, password, confirmPassword, terms } = req.body;

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

    const existingUser = await userModel.findOne({ email });

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
        expiresIn: "15m",
      },
    );

    await sendVerificationEmail(user.email, user.fullName, verificationToken);

    return res.status(201).json({
      success: true,
      message:
        "Your account has been created successfully. Welcome to EcoBazar!",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};
const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);

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
        expiresIn: "15m",
      },
    );

    const refreshToken = jwt.sign(
      {
        _id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      process.env.JWT_REFRESH_SECRET as string,
      {
        expiresIn: "7d",
      },
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ?"none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};


const sendOtpController = async (req: Request, res: Response) => {
  try {
    const { userId } = req?.body;

    const existingUser = await userModel.findById(userId);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (existingUser.isAccountVerified) {
      return res.status(400).json({
        success: false,
        message: "Your account has already been verified.",
      });
    }

    const otp = String(
      Math.floor(100000 + Math.random() * 900000)
    );

    existingUser.verifyOtp = otp;
    existingUser.verifyOtpExpire = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await existingUser.save();

    await sendVerificationEmail(
      existingUser.email,
      existingUser.fullName,
      otp
    );

    return res.status(200).json({
      success: true,
      message:
        "A verification code has been sent to your email address. Please check your inbox.",
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "The verification session has expired. Please request a new code.",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "The verification session is invalid. Please request a new code.",
      });
    }

    console.error("Send OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send the verification code at this time. Please try again later.",
    });
  }
};

const verifyOtpController = async (req: Request, res: Response) => {
  try {
    const { userId, otp } = req.body;

  
    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "User ID and verification code are required.",
      });
    }

    // Find the user
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    
    if (user.isAccountVerified) {
      return res.status(400).json({
        success: false,
        message: "Your account has already been verified.",
      });
    }

   
    if (!user.verifyOtp || user.verifyOtp !== String(otp)) {
      return res.status(400).json({
        success: false,
        message: "The verification code is invalid.",
      });
    }
    if (
      !user.verifyOtpExpire ||
      user.verifyOtpExpire.getTime() < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "The verification code has expired. Please request a new code.",
      });
    }
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpire = new Date(0);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Your account has been verified successfully.",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify your account at this time. Please try again later.",
    });
  }
};

const forgotPasswordController = async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};
const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const { newPassword, confirmPassword } = req.body;

    const decodedToken = jwt.verify(
      token as string,
      process.env.JWT_ACCESS_SECRET as string,
    ) as UserJwtPayload;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "The passwords you entered do not match.",
      });
    }

    const hashedpassword = await bcrypt.hash(newPassword, 10);

    await userModel.findOneAndUpdate(
      { _id: decodedToken._id },
      { password: hashedpassword },
    );

    return res.status(200).json({
      success: true,
      message: "Password reset successful.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

export {
  registrationController,
  loginController,
  sendOtpController, 
  verifyOtpController,
  forgotPasswordController,
  resetPasswordController,
};
