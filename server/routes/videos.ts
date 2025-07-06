import express from 'express';
import { 
  getVideosByLesson,
  getVideo,
  updateVideoStatus,
  deleteVideo,
  getAvailableVoices,
  cleanupTempFiles,
  checkWav2LipHealth
} from '../controllers/videoController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All routes are protected

router.get('/voices', getAvailableVoices);
router.get('/wav2lip/health', checkWav2LipHealth);
router.get('/test-tts', async (req, res) => {
  try {
    const videoService = await import('../services/videoService').then(m => m.default);
    const testResult = await videoService.checkWav2LipHealth();
    
    res.status(200).json({
      success: testResult,
      message: testResult ? 'Wav2Lip service is working correctly' : 'Wav2Lip service test failed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Wav2Lip service test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
router.post('/cleanup', cleanupTempFiles);
router.get('/lesson/:lessonId', getVideosByLesson);
router.get('/:id', getVideo);
router.put('/:id/status', updateVideoStatus);
router.delete('/:id', deleteVideo);

export default router;