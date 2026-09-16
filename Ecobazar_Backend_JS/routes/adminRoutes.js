import express from 'express';
import { approveCategory, deleteUser, getAllUser, rejectCategory } from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { categoryController } from '../controllers/categoryController.js';
const router = express.Router();
/**
 * @swagger
 * /api/v1/admin/all-users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all users
 *       401:
 *         description: Invalid or missing authentication token
 *       403:
 *         description: Admin access required
 */
router.get("/all-users", getAllUser);
/**
 * @swagger
 * /api/v1/admin/delete/user/{id}:
 *   post:
 *     summary: Delete a user
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Invalid or missing authentication token
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.post("/delete/user/:id", deleteUser);
router.post("/category/create", authMiddleware, upload.single("image"), categoryController);
// temporary
router.patch("/category/approve/:id", approveCategory);
router.patch("/category/reject/:id", rejectCategory);
// temporary
export default router;
//# sourceMappingURL=adminRoutes.js.map