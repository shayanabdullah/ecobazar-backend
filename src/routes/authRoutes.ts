import express from 'express';
import { registrationController, loginController, sendOtpController, forgotPasswordController, resetPasswordController, verifyOtpController } from '../controllers/authControllers.js'
import { authMiddleware } from '../middleware/authMiddleware.js';
const router = express.Router();


/**
 * @swagger
 * /api/v1/auth/registration:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - confirmPassword
 *               - terms
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Shayan Abdullah
 *               email:
 *                 type: string
 *                 example: shayan@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *               confirmPassword:
 *                 type: string
 *                 example: Password123!
 *               terms:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid registration data
 *       409:
 *         description: Email already exists
 */
router.post("/registration", registrationController);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: shayan@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: Authentication failed
 */
router.post("/login", loginController);

/**
 * @swagger
 * /api/v1/auth/send/otp:
 *   post:
 *     summary: Send account verification OTP
 *     description: Sends a 6-digit verification code to the authenticated user's email address.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 68c123456789abcdef123456
 *                 description: MongoDB ID of the user whose account needs to be verified.
 *     responses:
 *       200:
 *         description: Verification OTP sent successfully
 *       400:
 *         description: Account is already verified or required details are missing
 *       404:
 *         description: User account not found
 *       500:
 *         description: Internal server error
 */
router.post("/send/otp", authMiddleware, sendOtpController);


/**
 * @swagger
 * /api/v1/auth/verify/otp:
 *   post:
 *     summary: Verify user account with OTP
 *     description: Verifies the authenticated user's email address using the OTP sent to their email.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - otp
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 68c123456789abcdef123456
 *                 description: MongoDB ID of the user.
 *               otp:
 *                 type: string
 *                 example: "482731"
 *                 description: 6-digit verification code sent to the user's email.
 *     responses:
 *       200:
 *         description: Account verified successfully
 *       400:
 *         description: Invalid, expired, or missing verification code
 *       404:
 *         description: User account not found
 *       500:
 *         description: Internal server error
 */
router.post("/verify/otp", authMiddleware, verifyOtpController);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: shayan@example.com
 *     responses:
 *       200:
 *         description: Password reset request processed successfully
 *       404:
 *         description: User not found
 */
router.post("/forgot-password", authMiddleware, forgotPasswordController);

/**
 * @swagger
 * /api/v1/auth/reset-password/{token}:
 *   post:
 *     summary: Reset user password
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmPassword
 *             properties:
 *               password:
 *                 type: string
 *                 example: NewPassword123!
 *               confirmPassword:
 *                 type: string
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired reset token
 */
router.post("/reset-password/:token", authMiddleware, resetPasswordController);

export default router;
