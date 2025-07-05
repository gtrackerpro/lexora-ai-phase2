import express from 'express';
import { register, login, getMe, updatePreferences, googleAuth, googleCallback } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/me', protect, getMe);
router.put('/me/preferences', protect, updatePreferences);

export default router;