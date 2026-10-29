import express from "express";
import { activeProduct, activeUser, deleteUser, getAllUser, inactiveUser, rejectProduct } from "../controllers/adminController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { categoryCreateController, deleteCategoryController, getCategory, updateCategoryController, createSubCategory, getSubCategory, getSubCategoryByCategory, getSubCategoryByCreatedBy, updateSubCategoryController, deleteSubCategoryController, getCategoryByCreatedBy, } from "../controllers/categoryController.js";
import { rejectSubCategory, activeSubCategory } from "../controllers/adminController.js";
import { createExcelFile } from "../controllers/product.controller.js";
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
router.get("/all-users", authMiddleware, getAllUser);
/**
 * @swagger
 * /api/v1/admin/delete/user/{id}:
 *   post:
 *     summary: Delete a user
 *     description: Permanently deletes a user account by ID. Returns the deleted user's email in the response message.
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
 *         description: MongoDB ObjectId of the user to delete.
 *         example: 68c123456789abcdef123456
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   example: User john@example.com deleted successfully.
 *       401:
 *         description: Invalid or missing authentication token
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post("/delete/user/:id", authMiddleware, deleteUser);
/**
 * @swagger
 * /api/v1/admin/inactive/user/{id}:
 *   post:
 *     summary: Deactivate a user
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
 *         description: ID of the user to deactivate
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *       401:
 *         description: Invalid or missing authentication token
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.post("/inactive/user/:id", authMiddleware, inactiveUser);
/**
 * @swagger
 * /api/v1/admin/active/user/{id}:
 *   post:
 *     summary: Activate a user
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
 *         description: ID of the user to activate
 *     responses:
 *       200:
 *         description: User activated successfully
 *       401:
 *         description: Invalid or missing authentication token
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.post("/active/user/:id", authMiddleware, activeUser);
// Create category
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
router.post("/create/category", authMiddleware, upload.single("image"), categoryCreateController);
// Update category
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
// Delete category
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
// Get all categories
/**
 * @swagger
 * /api/v1/admin/categories:
 *   get:
 *     summary: Get all categories
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/categories", authMiddleware, getCategory);
// Get category by created by
/**
 * @swagger
 * /api/v1/admin/created-by/{userId}/category:
 *   get:
 *     summary: Get categories by creator
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Creator user ID
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No categories found
 *       500:
 *         description: Internal server error
 */
router.get("/created-by/:userId/category", authMiddleware, getCategoryByCreatedBy);
// Create subcategory
/**
 * @swagger
 * /api/v1/admin/create/subcategory:
 *   post:
 *     summary: Create a subcategory
 *     description: Creates a new subcategory. Admins always get an `active` status; vendors get `inactive` until approval. A notification email is sent to admins (admin-created) or to admins for vendor-created items.
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
// Get all subcategories
/**
 * @swagger
 * /api/v1/admin/subcategories:
 *   get:
 *     summary: Get all subcategories
 *     tags:
 *       - Admin
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
// Get subcategories by category
/**
 * @swagger
 * /api/v1/admin/category/{categoryId}/subcategories:
 *   get:
 *     summary: Get subcategories by category
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
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
// Get subcategories by created by
/**
 * @swagger
 * /api/v1/admin/user/{id}/subcategories:
 *   get:
 *     summary: Get subcategories by creator
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
 *         description: Creator user ID
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
 * /api/v1/admin/update/subcategory/{id}:
 *   patch:
 *     summary: Update a subcategory
 *     description: Updates subcategory information and optionally replaces the subcategory image.
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
 * /api/v1/admin/delete/subcategory/{id}:
 *   delete:
 *     summary: Delete a subcategory
 *     description: Permanently deletes a subcategory by its ID.
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
 *         description: Subcategory ID
 *         example: 68c123456789abcdef123456
 *     responses:
 *       200:
 *         description: Subcategory deleted successfully
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
 * /api/v1/admin/reject/subcategory/{id}:
 *   post:
 *     summary: Reject a subcategory
 *     description: Sends a rejection email to the vendor who created the subcategory and permanently deletes it.
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
 *         description: MongoDB ObjectId of the subcategory to reject.
 *         example: 68c123456789abcdef123456
 *     responses:
 *       200:
 *         description: Subcategory rejected successfully
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
 *                   example: Subcategory rejected successfully.
 *                 data:
 *                   type: object
 *                   description: The deleted subcategory document.
 *       400:
 *         description: Invalid subcategory ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subcategory not found
 *       500:
 *         description: Internal server error
 */
router.post("/reject/subcategory/:id", authMiddleware, rejectSubCategory);
/**
 * @swagger
 * /api/v1/admin/approve/subcategory/{id}:
 *   post:
 *     summary: Approve a subcategory
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
 *         description: Subcategory ID
 *         example: 68c123456789abcdef123456
 *     responses:
 *       200:
 *         description: Subcategory approved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subcategory not found
 *       500:
 *         description: Internal server error
 */
router.post("/approve/subcategory/:id", authMiddleware, activeSubCategory);
/**
 * @swagger
 * /api/v1/admin/approve/product/{productId}:
 *   post:
 *     summary: Approve a product
 *     description: Approves a pending product (sets status to `approved`) and sends a status notification email to the vendor who created it.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the product to approve.
 *         example: 68c123456789abcdef123456
 *     responses:
 *       200:
 *         description: Product approved successfully
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
 *                   example: Product approved successfully.
 *                 data:
 *                   type: object
 *                   description: The approved product document.
 *       400:
 *         description: Invalid product ID or product already approved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.post("/approve/product/:productId", authMiddleware, activeProduct);
/**
 * @swagger
 * /api/v1/admin/reject/product/{productId}:
 *   post:
 *     summary: Reject a product
 *     description: Rejects a product (sets status to `rejected`) and sends a status notification email to the vendor who created it.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the product to reject.
 *         example: 68c123456789abcdef123456
 *     responses:
 *       200:
 *         description: Product rejected successfully
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
 *                   example: Product rejected successfully.
 *                 data:
 *                   type: object
 *                   description: The rejected product document.
 *       400:
 *         description: Invalid product ID or product already rejected
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.post("/reject/product/:productId", authMiddleware, rejectProduct);
/**
 * @swagger
 * /api/v1/admin/create-excel:
 *   post:
 *     summary: Create Excel file
 *     description: Generates an Excel file from approved product data and writes it to disk. Vendors get their own products; admins get all approved products.
 *     tags:
 *       - Admin
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
 *                 example: products-export
 *               location:
 *                 type: string
 *                 description: File system path where the Excel file will be written. On Windows use forward slashes or double backslashes (e.g., "C:/exports" or "C:\\exports").
 *                 example: "C:/exports"
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
 *                   example: Excel file created at C:\exports\products-export.xlsx successfully.
 *       400:
 *         description: File name is required, or no products found in the database
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/create-excel", authMiddleware, createExcelFile);
export default router;
//# sourceMappingURL=adminRoutes.js.map