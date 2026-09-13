import jwt from "jsonwebtoken";
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication is required to access this resource.",
            });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: "Your session has expired. Please log in again.",
            });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token.",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Authentication failed. Please try again later.",
        });
    }
};
export { authMiddleware };
//# sourceMappingURL=authMiddleware.js.map