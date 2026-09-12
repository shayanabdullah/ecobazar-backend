import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../services/emailSender.js";
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const registrationController = async (req, res) => {
    const { fullName, email, password, confirmPassword, terms } = req.body;
    const existingUser = await userModel.findOne({ email });
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
            message: "Password must be at least 8 characters and contain an uppercase letter, a lowercase letter, a number, and a special character.",
        });
    }
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
    const userPayload = {
        _id: user._id.toString(),
        email: user.email,
        role: user.role,
    };
    const verificationToken = jwt.sign(userPayload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: "7d",
    });
    await sendVerificationEmail(user.email, user.fullName, verificationToken);
    return res.status(201).json({
        success: true,
        message: "Your account has been created successfully. Welcome to EcoBazar!",
    });
};
const loginController = async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password.",
        });
    }
    const passwordCompare = bcrypt.compareSync(password, user.password);
    if (!passwordCompare) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password.",
        });
    }
    return res.status(200).json({
        success: true,
        message: "Login successful. Welcome back!",
        data: {
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        },
    });
};
const verifyController = async (req, res) => {
    const { token } = req.params;
    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (!decodedToken) {
        return res.status(400).json({
            success: false,
            message: "Invalid token.",
        });
    }
    const user = await userModel.findOneAndUpdate({ _id: decodedToken._id }, {
        isAccountVerified: true,
    });
    return res.status(200).json({
        success: true,
        message: "Account verification successful.",
    });
};
export { registrationController, loginController, verifyController };
//# sourceMappingURL=authControllers.js.map