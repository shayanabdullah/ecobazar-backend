import { Request, Response } from "express";
import userModel from "../models/userModel.js";

const getAllUser = async (req: Request, res: Response) => {
  const users = await userModel.find({}).select("-password");
  try {
    if (!users) {
      return res.status(404).json({
        success: false,
        message: "No users found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: `All ${users.length} users retrieved successfully`,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    const deletedUser = await userModel.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: `User ${user.email} deleted successfully.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error." + (error as Error).message,
    });
  }
};

export { getAllUser, deleteUser };
