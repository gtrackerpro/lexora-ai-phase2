import express from 'express';
import { 
  createTopic, 
  getTopics, 
  getTopic, 
  updateTopic, 
  deleteTopic,
  searchTopics
} from '../controllers/topicController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All routes are protected

router.route('/')
  .post(createTopic)
  .get(getTopics);

router.route('/search')
  .get(searchTopics);

router.route('/:id')
  .get(getTopic)
  .put(updateTopic)
  .delete(deleteTopic);

export default router;