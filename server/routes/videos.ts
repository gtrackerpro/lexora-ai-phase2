import express from 'express';
import { 
  getVideosByLesson,
  getVideo,
  updateVideoStatus,
  deleteVideo,
  getAvailableVoices,
  cleanupTempFiles,
  checkDIDHealth
} from '../controllers/videoController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All routes are protected

router.get('/voices', getAvailableVoices);
router.get('/did/health', checkDIDHealth);
router.post('/cleanup', cleanupTempFiles);
router.get('/lesson/:lessonId', getVideosByLesson);
router.get('/:id', getVideo);
router.put('/:id/status', updateVideoStatus);
router.delete('/:id', deleteVideo);

export default router;