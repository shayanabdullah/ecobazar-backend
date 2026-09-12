import express from 'express';
import vendorController from '../controllers/vendorController.js';
const router = express.Router();

router.post('/create/product', vendorController)
export default router;