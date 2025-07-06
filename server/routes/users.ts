import express from 'express';
import { 
  getMe, 
  updatePreferences,
  getUserActivity,
  getUserStreak,
  getUserSummary
} from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All routes are protected

// User profile routes
router.get('/me', getMe);
router.put('/me/preferences', updatePreferences);

// User activity and analytics routes
router.get('/me/activity', getUserActivity);
router.get('/me/streak', getUserStreak);
router.get('/me/summary', getUserSummary);

export default router;