import userModel from "../models/userModel.js";
import categoryModel from "../models/categoryModel.js";
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
// temporary
const approveCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const existingCategory = await categoryModel.findOne({ id });
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'id is required'
            });
        }
        await categoryModel.findByIdAndUpdate(id, { status: 'active' }, { returnDocument: 'after' });
        return res.status(200).json({
            success: true,
            message: 'category approved successfully!'
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        });
    }
};
const rejectCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'id is required'
            });
        }
        const category = await categoryModel.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }
        return res.status(200).json({
            success: true,
            message: 'category rejected!'
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        });
    }
};
// temporary
export { getAllUser, deleteUser, approveCategory, rejectCategory };
//# sourceMappingURL=adminController.js.map