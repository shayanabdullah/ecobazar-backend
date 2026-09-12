import express from 'express';
import { registrationController, loginController, verifyController } from '../controllers/authControllers.js';
const router = express.Router();
router.post('/registration', registrationController);
router.post('/login', loginController);
router.post('/verify/:token', verifyController);
export default router;
//# sourceMappingURL=authRoutes.js.map