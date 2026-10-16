import { Request, Response } from "express";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";
import subCategoryModel from "../models/subcategory.model.js";
import {
  sendAdminVendorProductCreatedEmail,
  sendSubCategoryRejectedEmail,
  sendVendorProductStatusEmail,
} from "../utils/emailSender.js";
import productModel from "../models/product.model.js";

const getAllUser = async (req: Request, res: Response) => {
  try {
    const users = await userModel.find({}).select("-password");
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

const activeUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const existUser = await userModel.findById(id);
    if (!existUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    if (existUser.status === "active") {
      return res.status(400).json({
        success: false,
        message: "User already active.",
      });
    }
    const updateUser = await userModel.findByIdAndUpdate(id, {
      status: "active",
    });
    return res.status(200).json({
      success: true,
      message: "User active successfully.",
      data: updateUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error." + (error as Error).message,
    });
  }
};
const inactiveUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const existUser = await userModel.findById(id);
    if (!existUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    if (existUser.status === "inactive") {
      return res.status(400).json({
        success: false,
        message: "User already inactive.",
      });
    }
    const updateUser = await userModel
      .findByIdAndUpdate(
        id,
        {
          status: "inactive",
        },
        {
          returnDocument: "after",
          runValidators: true,
        },
      )
      .select("-password");
    return res.status(200).json({
      success: true,
      message: "User inactive successfully.",
      data: updateUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error." + (error as Error).message,
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

const activeSubCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subcategory ID.",
      });
    }
    const subCategory = await subCategoryModel.findById(id);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found.",
      });
    }

    if (subCategory.status === "active") {
      return res.status(400).json({
        success: false,
        message: "Subcategory already active.",
      });
    }
    const updateSubCategory = await subCategoryModel.findByIdAndUpdate(id, {
      status: "active",
    });
    return res.status(200).json({
      success: true,
      message: "Subcategory active successfully.",
      data: updateSubCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error." + (error as Error).message,
    });
  }
};
const rejectSubCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subcategory ID.",
      });
    }
    const subCategory = (await subCategoryModel
      .findById(id)
      .populate("createdBy", "fullName email")
      .populate("category", "categoryName")) as any;
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found.",
      });
    }
    await sendSubCategoryRejectedEmail(
      subCategory.createdBy?.email,
      subCategory.createdBy?.fullName,
      subCategory.subCategoryName,
      subCategory.category.categoryName,
    );

    const updateSubCategory = await subCategoryModel.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Subcategory rejected successfully.",
      data: updateSubCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error." + (error as Error).message,
    });
  }
};

const activeProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (product.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Product already approved.",
      });
    }
    const updateProduct = await productModel.findByIdAndUpdate(productId, {
      status: "approved",
    },
  {
    returnDocument: "after",
  }).select("productName productCode description brand status createdBy").populate(
   [
     {
    path: "category",
    select: "-_id categoryName",
  },
{
  path: "subCategory",
  select: "-_id subCategoryName",
},
{
  path: "createdBy",
  select: "-_id fullName role",
},
   ]);

    try {
      const vendor = await userModel
        .findById(product.createdBy)
        .select("fullName email");

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: "Product creator not found.",
        });
      }
      await sendVendorProductStatusEmail(
        product.productName,
        product.productCode,
        vendor.fullName,
        vendor.email,
        "approved",
      );
    } catch (emailError) {
      console.error("vendor product notification failed:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Product approved successfully.",
      data: updateProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error." + (error as Error).message,
    });
  }
};
const rejectProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (product.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Product already rejected.",
      });
    }
    const updateProduct = await productModel.findByIdAndUpdate(productId, {
      status: "rejected",
    },
  {
    returnDocument: "after",
  }).select("productName productCode description brand createdBy status").populate(
   [
     {
    path: "category",
    select: "-_id categoryName",
  },
{
  path: "subCategory",
  select: "-_id subCategoryName",
},
{
  path: "createdBy",
  select: "-_id fullName role",
},
   ]);

   try {
      const vendor = await userModel
        .findById(product.createdBy)
        .select("fullName email");

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: "Product creator not found.",
        });
      }
      await sendVendorProductStatusEmail(
        product.productName,
        product.productCode,
        vendor.fullName,
        vendor.email,
        "rejected",
      );
    } catch (emailError) {
      console.error("vendor product notification failed:", emailError);
    }


    return res.status(200).json({
      success: true,
      message: "Product rejected successfully.",
      data: updateProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error." + (error as Error).message,
    });
  }
};

export {
  getAllUser,
  deleteUser,
  activeSubCategory,
  rejectSubCategory,
  activeUser,
  inactiveUser,
  activeProduct,
  rejectProduct,
};
