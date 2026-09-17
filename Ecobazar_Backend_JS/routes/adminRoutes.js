import express from "express";
import { approveCategory, deleteUser, getAllUser, rejectCategory, } from "../controllers/adminController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { categoryCreateController, deleteCategoryController, updateCategoryController, } from "../controllers/categoryController.js";
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
/**
 * @swagger
 * /api/v1/admin/category/create:
 *   post:
 *     summary: Create a new category
 *     description: Creates a new category with an uploaded image.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - categoryName
 *               - slug
 *               - image
 *             properties:
 *               categoryName:
 *                 type: string
 *                 example: Fresh Fruits
 *               slug:
 *                 type: string
 *                 example: fresh-fruits
 *               description:
 *                 type: string
 *                 example: Fresh and healthy fruits
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Required fields are missing or category already exists
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/category/create", authMiddleware, upload.single("image"), categoryCreateController);
/**
 * @swagger
 * /api/v1/admin/category/edit/{id}:
 *   patch:
 *     summary: Update a category
 *     description: Updates category information and optionally replaces the category image.
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
 *         description: Category ID
 *         example: 68c123456789abcdef123456
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               categoryName:
 *                 type: string
 *                 example: Fresh Fruits
 *               slug:
 *                 type: string
 *                 example: fresh-fruits
 *               description:
 *                 type: string
 *                 example: Fresh and healthy fruits
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *                   - reject
 *                 example: active
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Invalid category ID or request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.patch("/category/edit/:id", authMiddleware, upload.single("image"), updateCategoryController);
/**
 * @swagger
 * /api/v1/admin/category/delete/{id}:
 *   post:
 *     summary: Delete a category
 *     description: Permanently deletes a category by its ID.
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
 *         description: Category ID
 *         example: 68c123456789abcdef123456
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.post("/category/delete/:id", authMiddleware, deleteCategoryController);
// temporary
router.patch("/category/approve/:id", approveCategory);
router.patch("/category/reject/:id", rejectCategory);
// temporary
export default router;
//# sourceMappingURL=adminRoutes.js.map