import express from 'express';
import { deleteUser, getAllUser } from '../controllers/adminController.js';
const router = express.Router();
router.get('/all-users', getAllUser);
router.post('/delete/user/:id', deleteUser);
export default router;
//# sourceMappingURL=adminRoutes.js.map