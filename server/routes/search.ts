import express from 'express';
import { 
  globalSearch, 
  getRecentSearches, 
  saveSearch 
} from '../controllers/searchController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All routes are protected

// Global search route
router.route('/')
  .get(globalSearch);

// Recent searches routes
router.route('/recent')
  .get(getRecentSearches)
  .post(saveSearch);

export default router;
