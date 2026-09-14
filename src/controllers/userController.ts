import { Request, Response } from "express";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { UserJwtPayload } from "../types/types.js";

const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, email, status } = req.body;

    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required to access this resource.",
      });
    }
    const decoded = jwt.verify(
      token as string,
      process.env.JWT_ACCESS_SECRET as string,
    ) as UserJwtPayload;

    const user = await userModel.findById(id);
    const sameEmail = await userModel.findOne({ email: email });
    
    if (sameEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use.",
      });
    }

    if (decoded.role === "user" && decoded._id !== id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this profile.",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (decoded.role === "user") {
      const updateFields: {
        fullName?: string;
        email?: string;
      } = {};

      if (fullName !== undefined) {
        updateFields.fullName = fullName;
      }

      if (email !== undefined) {
        updateFields.email = email;
      }

      const updatedUser = await userModel.findByIdAndUpdate(id, updateFields, {
        returnDocument: "after",
      });

      return res.status(200).json({
        success: true,
        message: "User profile updated successfully.",
        data: {
          fullName: updatedUser?.fullName,
          email: updatedUser?.email,
        },
      });
    }

    const updateFields: {
      fullName?: string;
      email?: string;
      status?: string;
    } = {};

    if (fullName !== undefined) {
      updateFields.fullName = fullName;
    }

    if (email !== undefined) {
      updateFields.email = email;
    }

    if (status !== undefined) {
      updateFields.status = status;
    }

    const updatedUser = await userModel.findByIdAndUpdate(id, updateFields, {
      returnDocument: "after",
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        fullName: updatedUser?.fullName,
        email: updatedUser?.email,
        status: updatedUser?.status,
      },
    });
  } catch (error: any) {
    console.error("Update user profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile at this time.",
    });
  }
};
export { updateUserProfile };
