import express from 'express';
import { updateUserProfile } from '../controllers/userController.js';
const router = express.Router();
router.patch('/profile/edit/:id', updateUserProfile);
export default router;
//# sourceMappingURL=userRoutes.js.map