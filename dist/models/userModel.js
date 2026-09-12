import mongoose from "mongoose";
const { Schema, model } = mongoose;
const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    terms: {
        type: Boolean,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    isAccountVerified: {
        type: Boolean,
        default: false,
    },
});
const userModel = model('user', userSchema);
export default userModel;
//# sourceMappingURL=userModel.js.map