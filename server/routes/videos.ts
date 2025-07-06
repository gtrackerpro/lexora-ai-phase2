import express from 'express';
import { 
  getVideosByLesson,
  getVideo,
  updateVideoStatus,
  deleteVideo,
  getAvailableVoices,
  cleanupTempFiles
} from '../controllers/videoController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All routes are protected

router.get('/voices', getAvailableVoices);
router.get('/test-tts', async (req, res) => {
  try {
    const ttsService = await import('../services/ttsService').then(m => m.default);
    const testResult = await ttsService.testTTS();
    
    res.status(200).json({
      success: testResult,
      message: testResult ? 'TTS is working correctly' : 'TTS test failed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'TTS test failed',
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