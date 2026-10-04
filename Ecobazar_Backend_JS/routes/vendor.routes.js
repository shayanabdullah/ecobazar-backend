import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { categoryCreateController, createSubCategory, deleteCategoryController, updateCategoryController, getSubCategory, getSubCategoryByCategory, getSubCategoryByCreatedBy, updateSubCategoryController, deleteSubCategoryController, } from "../controllers/categoryController.js";
const router = express.Router();
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
// Create subcategory
router.post("/create/subcategory", upload.single("image"), authMiddleware, createSubCategory);
// Get all subcategories
router.get("/subcategories", authMiddleware, getSubCategory);
// Get subcategories by category
router.get("/category/:categoryId/subcategories", authMiddleware, getSubCategoryByCategory);
// Get subcategories by created by
router.get("/user/:id/subcategories", authMiddleware, getSubCategoryByCreatedBy);
// Update subcategory
router.patch("/update/subcategory/:id", authMiddleware, upload.single("image"), updateSubCategoryController);
// Delete subcategory
router.delete("/delete/subcategory/:id", authMiddleware, deleteSubCategoryController);
export default router;
//# sourceMappingURL=vendor.routes.js.map