import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { vendorMiddleware } from '../middleware/roleMiddleware.js';
import { createProductController, getAllProducts, getProductbyCategory, getProductbySubCategory } from '../controllers/product.controller.js';
import upload from '../middleware/uploadMiddleware.js';
const router = express.Router();
// products routes
// create product
router.post('/create', upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 8 }
]), authMiddleware, vendorMiddleware, createProductController);
// get all products
router.get("/", getAllProducts);
// get product by category
router.get("/category/:categoryId", getProductbyCategory);
// get product by sub category
router.get("/sub-category/:subCategoryId", getProductbySubCategory);
export default router;
//# sourceMappingURL=products.routes.js.map