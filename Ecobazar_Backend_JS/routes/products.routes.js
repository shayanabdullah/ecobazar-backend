import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { vendorMiddleware } from '../middleware/roleMiddleware.js';
import { createProductController, editProducts, getAllProducts, getProductbyCategory, getProductbyCreatedBy, getProductbySubCategory, uploadBulkProducts } from '../controllers/product.controller.js';
import upload from '../middleware/uploadMiddleware.js';
import excelUpload from '../utils/multer.file.js';
const router = express.Router();
// products routes
// create product
/**
 * @swagger
 * /api/v1/products/create:
 *   post:
 *     summary: Create a product
 *     description: Creates a product with a thumbnail and up to 8 additional images. Vendors submit products in `pending` status; admins create `approved` products. Either a single-variation set of fields (price, compareAtPrice, stockQuantity, sku) OR a `variants` array must be supplied.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - thumbnail
 *               - productName
 *               - category
 *             properties:
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Main product thumbnail image (single file).
 *               images:
 *                 type: array
 *                 maxItems: 8
 *                 description: Up to 8 gallery images.
 *                 items:
 *                   type: string
 *                   format: binary
 *               productName:
 *                 type: string
 *                 example: Premium Indian Orange
 *               description:
 *                 type: string
 *                 example: Fresh and juicy oranges.
 *               brand:
 *                 type: string
 *                 example: FarmFresh
 *               manufacturer:
 *                 type: string
 *                 example: EcoFarms Ltd.
 *               countryOfOrigin:
 *                 type: string
 *                 example: India
 *               category:
 *                 type: string
 *                 description: MongoDB ObjectId of an existing active category.
 *                 example: 68c123456789abcdef123456
 *               subCategory:
 *                 type: string
 *                 description: MongoDB ObjectId of a subcategory belonging to `category`.
 *                 example: 68c123456789abcdef123457
 *               isMain:
 *                 type: integer
 *                 description: Index of the image to mark as main (0-based).
 *                 example: 0
 *               variants:
 *                 type: string
 *                 description: JSON-encoded array of product variants. Required when creating a variable product.
 *                 example: '[{"size":"250g","price":250,"stockQuantity":100},{"size":"500g","price":450,"stockQuantity":50}]'
 *               attributes:
 *                 type: string
 *                 description: JSON-encoded array of product attributes.
 *                 example: '[{"key":"color","label":"Color","value":"orange"}]'
 *               price:
 *                 type: number
 *                 description: Required for simple (non-variant) products.
 *                 example: 250
 *               compareAtPrice:
 *                 type: number
 *                 description: Optional compare-at (M.R.P.) price. Must be greater than `price`.
 *                 example: 300
 *               stockQuantity:
 *                 type: integer
 *                 description: Required for simple (non-variant) products.
 *                 example: 100
 *     responses:
 *       201:
 *         description: Product created successfully
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
 *                   example: Product created successfully.
 *                 data:
 *                   type: object
 *                   description: The created product document.
 *       400:
 *         description: Invalid product data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Vendor access required
 *       500:
 *         description: Internal server error
 */
router.post('/create', upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 8 }
]), authMiddleware, vendorMiddleware, createProductController);
// get all products
/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieves the product list.
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get("/", getAllProducts);
// get product by category
/**
 * @swagger
 * /api/v1/products/category/{categoryId}:
 *   get:
 *     summary: Get products by category
 *     tags:
 *       - Products
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
 *         description: Products retrieved successfully
 *       404:
 *         description: Category or products not found
 *       500:
 *         description: Internal server error
 */
router.get("/category/:categoryId", getProductbyCategory);
// get product by sub category
/**
 * @swagger
 * /api/v1/products/sub-category/{subCategoryId}:
 *   get:
 *     summary: Get products by subcategory
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: subCategoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Subcategory ID
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       404:
 *         description: Subcategory or products not found
 *       500:
 *         description: Internal server error
 */
router.get("/sub-category/:subCategoryId", getProductbySubCategory);
// get product by creator
/**
 * @swagger
 * /api/v1/products/{creatorId}:
 *   get:
 *     summary: Get products by creator
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: creatorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Creator user ID
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       404:
 *         description: No products found
 *       500:
 *         description: Internal server error
 */
router.get("/:creatorId", getProductbyCreatedBy);
// bulk upload products
/**
 * @swagger
 * /api/v1/products/bulk-upload:
 *   post:
 *     summary: Bulk upload products
 *     description: Uploads a file containing multiple products.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Product import file
 *     responses:
 *       200:
 *         description: Products uploaded successfully
 *       400:
 *         description: Invalid file or product data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Vendor access required
 *       500:
 *         description: Internal server error
 */
router.post("/bulk-upload", excelUpload.single("file"), authMiddleware, vendorMiddleware, uploadBulkProducts);
// editProducts
/**
 * @swagger
 * /api/v1/products/edit/{id}:
 *   post:
 *     summary: Edit a product
 *     description: Updates product images (sets main image, adds new gallery images, or deletes an image). Pass `isMain` (index) together with `deleteImg` flag to remove an image; otherwise `isMain` selects the main image.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *         example: 68c123456789abcdef123456
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New images to append to the product gallery.
 *               isMain:
 *                 type: integer
 *                 description: Zero-based index of the image to set as the main product image (or the image to act on).
 *                 example: 0
 *               deleteImg:
 *                 type: integer
 *                 description: When provided with `isMain`, signals that the image at the `isMain` index should be deleted.
 *     responses:
 *       200:
 *         description: Product updated successfully
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
 *                   example: Product edited successfully.
 *       400:
 *         description: Invalid product ID or request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Vendor access required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.post("/edit/:id", upload.fields([{ name: 'images' }]), authMiddleware, vendorMiddleware, editProducts);
export default router;
//# sourceMappingURL=products.routes.js.map