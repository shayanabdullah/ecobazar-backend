import express from 'express';
import { registrationController, loginController, verifyController, forgotPasswordController, resetPasswordController } from '../controllers/authControllers.js';
const router = express.Router();
router.post('/registration', registrationController);
router.post('/login', loginController);
router.post('/verify/:token', verifyController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password/:token', resetPasswordController);
export default router;
//# sourceMappingURL=authRoutes.js.map