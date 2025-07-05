import express from 'express';
import { 
  updateProgress,
  getUserProgress,
  getLessonProgress,
  addProgressNote,
  getLearningAnalytics
} from '../controllers/progressController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All routes are protected

router.post('/', updateProgress);
router.get('/user', getUserProgress);
router.get('/lesson/:lessonId', getLessonProgress);
router.post('/:id/notes', addProgressNote);
router.get('/analytics', getLearningAnalytics);

export default router;