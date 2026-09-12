import jwt from "jsonwebtoken";
const adminMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is required.",
            });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        if (decodedToken.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this route.",
            });
        }
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
};
const vendorMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is required.",
            });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        if (decodedToken.role === "user") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this route.",
            });
        }
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
};
const userMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is required.",
            });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
};
export { adminMiddleware, vendorMiddleware, userMiddleware };
//# sourceMappingURL=roleMiddleware.js.map