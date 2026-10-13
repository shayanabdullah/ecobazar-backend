import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { vendorMiddleware } from '../middleware/roleMiddleware.js';
import { createProductController } from '../controllers/product.controller.js';
import upload from '../middleware/uploadMiddleware.js';
const router = express.Router();
// products routes
// create product
router.post('/create', upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 8 }
]), authMiddleware, vendorMiddleware, createProductController);
export default router;
//# sourceMappingURL=products.routes.js.map