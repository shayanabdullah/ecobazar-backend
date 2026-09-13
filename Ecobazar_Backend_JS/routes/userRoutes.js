import express from 'express';
import { updateUserProfile } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
const router = express.Router();
router.patch('/profile/edit/:id', authMiddleware, updateUserProfile);
export default router;
//# sourceMappingURL=userRoutes.js.map