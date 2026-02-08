import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

export const authRoutes = Router();

// Add auth routes here
authRoutes.post('/send-otp', authController.sendOtp);
authRoutes.post('/register', authController.register);
