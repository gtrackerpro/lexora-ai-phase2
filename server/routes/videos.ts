import express from 'express';
import { 
  getVideosByLesson,
  getVideo,
  updateVideoStatus,
  deleteVideo
} from '../controllers/videoController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All routes are protected

router.get('/lesson/:lessonId', getVideosByLesson);
router.get('/:id', getVideo);
router.put('/:id/status', updateVideoStatus);
router.delete('/:id', deleteVideo);

export default router;