import express from 'express';
import { 
  createLesson,
  getLessonsByPath,
  getLesson,
  generateLessonVideo,
  updateLesson,
  deleteLesson,
  generateLessonsForPath,
  regenerateLessonContent
} from '../controllers/lessonController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All routes are protected

router.post('/', createLesson);
router.get('/path/:pathId', getLessonsByPath);
router.get('/:id', getLesson);
router.post('/:id/generate-video', generateLessonVideo);
router.post('/:id/regenerate', regenerateLessonContent);
router.put('/:id', updateLesson);
router.delete('/:id', deleteLesson);

// Learning path lesson generation
router.post('/generate/:pathId', generateLessonsForPath);
export default router;