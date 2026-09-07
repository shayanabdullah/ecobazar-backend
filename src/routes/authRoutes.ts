import express from 'express';
import { registrationController } from '../controllers/authControllers.js'
const router = express.Router();

router.post('/registration', registrationController)

export default router;