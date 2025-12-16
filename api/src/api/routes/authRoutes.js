import express from 'express';
const router = express.Router();
import authController from '../controllers/authController.js';
import validateToken from '../middlewares/validateToken.js';

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/request-password-reset', authController.requestPasswordReset);

// Protected routes
router.get('/profile', validateToken, authController.getProfile);
router.put('/profile', validateToken, authController.updateProfile);
router.post('/change-password', validateToken, authController.changePassword);
router.get('/verify-token', validateToken, authController.verifyToken);

export default router;
