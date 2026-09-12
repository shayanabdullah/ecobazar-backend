import express from 'express';
import adminController from '../controllers/adminController.js';
const router = express.Router();

router.post('/delete/products', adminController)

export default router;