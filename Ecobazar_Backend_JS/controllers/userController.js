import userModel from "../models/userModel.js";
const updateUserProfile = async (req, res) => {
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
            const updateFields = {};
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
        const updateFields = {};
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
    }
    catch (error) {
        console.error("Update user profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to update profile at this time.",
        });
    }
};
export { updateUserProfile };
//# sourceMappingURL=userController.js.map