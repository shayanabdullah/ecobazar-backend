import express from 'express';
import {categoryUserController, updateUserProfile} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
const router = express.Router();


/**
 * @swagger
 * /api/v1/user/profile/edit/{id}:
 *   patch:
 *     summary: Update user profile
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Shayan Abdullah
 *               email:
 *                 type: string
 *                 example: shayan@example.com
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       401:
 *         description: Invalid or missing authentication token
 *       403:
 *         description: User is not authorized to update this profile
 *       404:
 *         description: User not found
 *       409:
 *         description: Email is already in use
 */
router.patch("/profile/edit/:id", authMiddleware, updateUserProfile);
// temporary
router.post("/category/create", authMiddleware, upload.single("image"), categoryUserController);
// temporary

export default router;