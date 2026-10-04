import userModel from "../models/userModel.js";
import mongoose from "mongoose";
import subCategoryModel from "../models/subcategory.model.js";
import { sendSubCategoryRejectedEmail } from "../utils/emailSender.js";
const getAllUser = async (req, res) => {
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};
const deleteUser = async (req, res) => {
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error." + error.message,
        });
    }
};
const activeSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error." + error.message,
        });
    }
};
const rejectSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subcategory ID.",
            });
        }
        const subCategory = await subCategoryModel
            .findById(id)
            .populate("createdBy", "fullName email")
            .populate("category", "categoryName");
        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: "Subcategory not found.",
            });
        }
        await sendSubCategoryRejectedEmail(subCategory.createdBy?.email, subCategory.createdBy?.fullName, subCategory.subCategoryName, subCategory.category.categoryName);
        const updateSubCategory = await subCategoryModel.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: "Subcategory rejected successfully.",
            data: updateSubCategory,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error." + error.message,
        });
    }
};
export { getAllUser, deleteUser, activeSubCategory, rejectSubCategory };
//# sourceMappingURL=adminController.js.map