import express from 'express';
import { 
  uploadAsset,
  getUserAssets,
  getAsset,
  deleteAsset,
  updateAssetUsage
} from '../controllers/assetController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All routes are protected

router.post('/upload', uploadAsset);
router.get('/', getUserAssets);
router.get('/:id', getAsset);
router.delete('/:id', deleteAsset);
router.put('/:id/usage', updateAssetUsage);

export default router;