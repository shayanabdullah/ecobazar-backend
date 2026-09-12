import express from 'express';
import userController from '../controllers/userController.js';
const router = express.Router();
router.get('/product', userController);
export default router;
//# sourceMappingURL=userRoutes.js.map