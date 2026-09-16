import { Request, Response } from "express";
import userModel from "../models/userModel.js";
import categoryModel from "../models/categoryModel.js";
import uploadToCloudinary from "../utils/cloudinaryUpload.js";
import { sendEmailToAdminForCreateCategory } from "../utils/emailSender.js";

const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, email, status } = req.body;

    const user = await userModel.findById(id);
    const sameEmail = await userModel.findOne({ email: email });
    if (sameEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use.",
      });
    }

    if (req.user.role === "user" && req.user._id !== id) {
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

    if (req.user.role === "user") {
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

// temporary
const categoryUserController = async (req: Request, res: Response) => {
  try {
    const { categoryName, slug, description } = req.body;

    const img = req?.file;

    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug is required.",
      });
    }

    if (!img) {
      return res.status(400).json({
        success: false,
        message: "Category image is required.",
      });
    }

    const existingName = await categoryModel.findOne({
      categoryName: categoryName.trim().toLowerCase(),
    });

    if (existingName) {
      return res.status(409).json({
        success: false,
        message: "Category already exists.",
      });
    }

    const existingSlug = await categoryModel.findOne({
      slug: slug.trim().toLowerCase(),
    });

    if (existingSlug) {
      return res.status(409).json({
        success: false,
        message: "Slug already exists.",
      });
    }

    const { publicId, imgUrl } = await uploadToCloudinary(
      img.path,
      "ecobazar/categories",
    );

    const category = await categoryModel.create({
      categoryName: categoryName.trim().toLowerCase(),
      slug: slug.trim().toLowerCase(),
      description:
        description?.trim() || "Explore our products in this category.",
      image: imgUrl,
      imagePublicId: publicId,
    });

    await sendEmailToAdminForCreateCategory(
      process.env.ADMIN_EMAIL!,
      "EcoBazar Admin",
      category._id.toString(),
      category.categoryName.toLowerCase(),
    );

    return res.status(201).json({
      success: true,
      message: "Category created successfully. Please wait for Admin to approve your category",
      data: category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create category at this time.",
    });
  }
};
// temporary

export { updateUserProfile, categoryUserController };
