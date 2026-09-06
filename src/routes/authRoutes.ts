import express, { type Request, type Response, type NextFunction } from 'express';
import { registration } from '../controllers/authControllers.js'
const router = express.Router();

router.post('/registration', registration)

export default router;