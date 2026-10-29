import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { categoryCreateController, createSubCategory, deleteCategoryController, updateCategoryController, getSubCategory, getSubCategoryByCategory, getSubCategoryByCreatedBy, updateSubCategoryController, deleteSubCategoryController, } from "../controllers/categoryController.js";
import { createExcelFile } from "../controllers/product.controller.js";
const router = express.Router();
/**
 * @swagger
 * /api/v1/vendor/category/create:
 *   post:
 *     summary: Create a new category
 *     description: Creates a new category with an uploaded image. The authenticated vendor is recorded as the creator.
 *     tags:
 *       - Vendor
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
 * /api/v1/vendor/category/edit/{id}:
 *   patch:
 *     summary: Update a category
 *     description: Updates category information and optionally replaces the category image.
 *     tags:
 *       - Vendor
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
 * /api/v1/vendor/category/delete/{id}:
 *   post:
 *     summary: Delete a category
 *     description: Permanently deletes a category by its ID.
 *     tags:
 *       - Vendor
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
/**
 * @swagger
 * /api/v1/vendor/create/subcategory:
 *   post:
 *     summary: Create a subcategory
 *     description: Creates a new subcategory. Vendors get an `inactive` status until admin approval.
 *     tags:
 *       - Vendor
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - subCategoryName
 *               - slug
 *               - category
 *               - image
 *             properties:
 *               subCategoryName:
 *                 type: string
 *                 example: Citrus Fruits
 *               slug:
 *                 type: string
 *                 example: citrus-fruits
 *               category:
 *                 type: string
 *                 description: MongoDB ObjectId of the parent category. Must be active.
 *                 example: 68c123456789abcdef123456
 *               description:
 *                 type: string
 *                 example: Fresh citrus fruits
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Subcategory created successfully
 *       400:
 *         description: Invalid subcategory data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/create/subcategory", upload.single("image"), authMiddleware, createSubCategory);
/**
 * @swagger
 * /api/v1/vendor/subcategories:
 *   get:
 *     summary: Get all subcategories
 *     description: Retrieves all active subcategories (bypassing admin-only restrictions).
 *     tags:
 *       - Vendor
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subcategories retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/subcategories", authMiddleware, getSubCategory);
/**
 * @swagger
 * /api/v1/vendor/category/{categoryId}/subcategories:
 *   get:
 *     summary: Get subcategories by category
 *     description: Retrieves subcategories belonging to a specific category (active only).
 *     tags:
 *       - Vendor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the category.
 *         example: 68c123456789abcdef123456
 *     responses:
 *       200:
 *         description: Subcategories retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/category/:categoryId/subcategories", authMiddleware, getSubCategoryByCategory);
/**
 * @swagger
 * /api/v1/vendor/user/{id}/subcategories:
 *   get:
 *     summary: Get subcategories by creator
 *     description: Retrieves subcategories created by a specific vendor.
 *     tags:
 *       - Vendor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the creator user.
 *         example: 68c123456789abcdef123456
 *     responses:
 *       200:
 *         description: Subcategories retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/user/:id/subcategories", authMiddleware, getSubCategoryByCreatedBy);
/**
 * @swagger
 * /api/v1/vendor/update/subcategory/{id}:
 *   patch:
 *     summary: Update a subcategory
 *     description: Updates subcategory information and optionally replaces the subcategory image.
 *     tags:
 *       - Vendor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subcategory ID
 *         example: 68c123456789abcdef123456
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               subCategoryName:
 *                 type: string
 *                 example: Citrus Fruits
 *               category:
 *                 type: string
 *                 example: 68c123456789abcdef123456
 *               description:
 *                 type: string
 *                 example: Fresh citrus fruits
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
 *         description: Subcategory updated successfully
 *       400:
 *         description: Invalid subcategory ID or request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subcategory not found
 *       500:
 *         description: Internal server error
 */
router.patch("/update/subcategory/:id", authMiddleware, upload.single("image"), updateSubCategoryController);
/**
 * @swagger
 * /api/v1/vendor/delete/subcategory/{id}:
 *   delete:
 *     summary: Delete a subcategory
 *     description: Permanently deletes a subcategory by its ID. Can only delete own (vendor) subcategories.
 *     tags:
 *       - Vendor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subcategory ID
 *         example: 68c123456789abcdef123456
 *     responses:
 *       200:
 *         description: Subcategory deleted successfully
 *       400:
 *         description: Invalid subcategory ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subcategory not found
 *       500:
 *         description: Internal server error
 */
router.delete("/delete/subcategory/:id", authMiddleware, deleteSubCategoryController);
/**
 * @swagger
 * /api/v1/vendor/create-excel:
 *   post:
 *     summary: Create Excel file
 *     description: Generates an Excel file from approved vendor-specific product data and writes it to disk.
 *     tags:
 *       - Vendor
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *               - location
 *             properties:
 *               fileName:
 *                 type: string
 *                 description: Name of the output Excel file (without extension).
 *                 example: vendor-products-2024
 *               location:
 *                 type: string
 *                 description: Absolute file system path where the Excel file will be written.
 *                 example: "C:\\exports"
 *               excelRowWidth:
 *                 type: integer
 *                 description: Optional column width for header rows.
 *                 example: 25
 *               excelTextColor:
 *                 type: string
 *                 description: Optional header text color (hex code). Defaults to `#FFFFFF`.
 *                 example: "#FFFFFF"
 *               excelFontWeight:
 *                 type: string
 *                 description: Optional header font weight. Defaults to `bold`.
 *                 example: bold
 *               excelBackgroundColor:
 *                 type: string
 *                 description: Optional header background color (hex code). Defaults to `#0E2841`.
 *                 example: "#0E2841"
 *     responses:
 *       200:
 *         description: Excel file created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Excel file created at C:\exports\vendor-products-2024.xlsx successfully.
 *       400:
 *         description: File name is required, or no products found in the database
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/create-excel", authMiddleware, createExcelFile);
export default router;
//# sourceMappingURL=vendor.routes.js.map