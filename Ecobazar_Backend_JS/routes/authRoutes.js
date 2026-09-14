import express from 'express';
import { registrationController, loginController, verifyController, forgotPasswordController, resetPasswordController } from '../controllers/authControllers.js';
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
 * /api/v1/auth/verify/{token}:
 *   post:
 *     summary: Verify user account
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Account verification token
 *     responses:
 *       200:
 *         description: Account verified successfully
 *       400:
 *         description: Invalid or expired verification token
 */
router.post("/verify/:token", verifyController);
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
router.post("/forgot-password", forgotPasswordController);
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
router.post("/reset-password/:token", resetPasswordController);
export default router;
//# sourceMappingURL=authRoutes.js.map