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
    verifyOtp: {
        type: Number,
        default: 0,
    },
    verifyOtpExpire: {
        type: Number,
        default: 0,
    },
    isAccountVerified: {
        type: Boolean,
        default: false,
    },
    resetOtp: {
        type: Number,
        default: 0,
    },
    resetOtpExpire: {
        type: Number,
        default: 0,
    },
});
const userModel = model('user', userSchema);
export default userModel;
//# sourceMappingURL=userModel.js.map