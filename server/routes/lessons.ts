import express from 'express';
import { 
  createLesson,
  getLessonsByPath,
  getLesson,
  generateLessonVideo,
  updateLesson,
  deleteLesson
} from '../controllers/lessonController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All routes are protected

router.post('/', createLesson);
router.get('/path/:pathId', getLessonsByPath);
router.get('/:id', getLesson);
router.post('/:id/generate-video', generateLessonVideo);
router.put('/:id', updateLesson);
router.delete('/:id', deleteLesson);

export default router;