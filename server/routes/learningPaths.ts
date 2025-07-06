import express from 'express';
import { 
  createLearningPath, 
  getLearningPathsByTopic, 
  getLearningPath 
} from '../controllers/learningPathController';
import { generateLessonsForPath } from '../controllers/lessonController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All routes are protected

router.post('/', createLearningPath);
router.get('/topic/:topicId', getLearningPathsByTopic);
router.get('/:id', getLearningPath);
router.post('/:pathId/generate-lessons', generateLessonsForPath);

export default router;