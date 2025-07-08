import { Request, Response } from 'express';
import Topic from '../models/Topic';
import Lesson from '../models/Lesson';
import LearningPath from '../models/LearningPath';
import { createSearchRegex, parsePaginationParams } from '../utils/helpers';

// @desc    Global search across all content types
// @route   GET /api/search
// @access  Private
export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { q: query, type, difficulty, tags } = req.query;
    const { page, limit, skip } = parsePaginationParams(req);

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchRegex = createSearchRegex(query);
    const userId = req.user?._id;
    
    let results: any[] = [];
    let total = 0;

    // Search based on type filter
    if (!type || type === 'all') {
      // Search across all content types
      const [topics, lessons, learningPaths] = await Promise.all([
        searchTopics(searchRegex, userId, difficulty, tags),
        searchLessons(searchRegex, userId, difficulty),
        searchLearningPaths(searchRegex, userId, difficulty)
      ]);

      results = [
        ...topics.map(item => ({ ...item.toObject(), type: 'topic' })),
        ...lessons.map(item => ({ ...item.toObject(), type: 'lesson' })),
        ...learningPaths.map(item => ({ ...item.toObject(), type: 'path' }))
      ];
      
      total = results.length;
      
      // Sort by relevance (simple scoring based on title matches)
      results.sort((a, b) => {
        const aScore = getRelevanceScore(a, query);
        const bScore = getRelevanceScore(b, query);
        return bScore - aScore;
      });

      // Apply pagination
      results = results.slice(skip, skip + limit);
    } else {
      // Search specific content type
      switch (type) {
        case 'topic':
          const topics = await searchTopics(searchRegex, userId, difficulty, tags);
          results = topics.map(item => ({ ...item.toObject(), type: 'topic' }));
          total = results.length;
          break;
        case 'lesson':
          const lessons = await searchLessons(searchRegex, userId, difficulty);
          results = lessons.map(item => ({ ...item.toObject(), type: 'lesson' }));
          total = results.length;
          break;
        case 'path':
          const paths = await searchLearningPaths(searchRegex, userId, difficulty);
          results = paths.map(item => ({ ...item.toObject(), type: 'path' }));
          total = results.length;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid search type'
          });
      }
    }

    res.status(200).json({
      success: true,
      count: results.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      results
    });
  } catch (error) {
    console.error('Global Search Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform search'
    });
  }
};

// Helper function to search topics
async function searchTopics(searchRegex: RegExp, userId: any, difficulty?: any, tags?: any) {
  const searchConditions: any = {
    createdBy: userId,
    $or: [
      { title: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
      { tags: { $in: [searchRegex] } }
    ]
  };

  if (difficulty && typeof difficulty === 'string') {
    searchConditions.difficulty = difficulty;
  }

  if (tags && typeof tags === 'string') {
    const tagArray = tags.split(',').map((tag: string) => tag.trim());
    searchConditions.tags = { $in: tagArray };
  }

  return await Topic.find(searchConditions)
    .populate('createdBy', 'displayName')
    .sort({ createdAt: -1 })
    .limit(50); // Limit to prevent too many results
}

// Helper function to search lessons
async function searchLessons(searchRegex: RegExp, userId: any, difficulty?: any) {
  const searchConditions: any = {
    userId: userId,
    $or: [
      { title: { $regex: searchRegex } },
      { content: { $regex: searchRegex } },
      { objectives: { $in: [searchRegex] } }
    ]
  };

  return await Lesson.find(searchConditions)
    .populate('learningPathId', 'title')
    .sort({ createdAt: -1 })
    .limit(50);
}

// Helper function to search learning paths
async function searchLearningPaths(searchRegex: RegExp, userId: any, difficulty?: any) {
  const searchConditions: any = {
    userId: userId,
    $or: [
      { title: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
      { goal: { $regex: searchRegex } }
    ]
  };

  if (difficulty && typeof difficulty === 'string') {
    searchConditions.difficulty = difficulty;
  }

  return await LearningPath.find(searchConditions)
    .populate('topicId', 'title')
    .sort({ createdAt: -1 })
    .limit(50);
}

// Simple relevance scoring
function getRelevanceScore(item: any, query: string): number {
  let score = 0;
  const queryLower = query.toLowerCase();
  
  // Title matches get highest score
  if (item.title?.toLowerCase().includes(queryLower)) {
    score += 10;
  }
  
  // Description matches get medium score
  if (item.description?.toLowerCase().includes(queryLower)) {
    score += 5;
  }
  
  // Tag matches get lower score
  if (item.tags?.some((tag: string) => tag.toLowerCase().includes(queryLower))) {
    score += 3;
  }
  
  // Content matches (for lessons) get medium score
  if (item.content?.toLowerCase().includes(queryLower)) {
    score += 4;
  }
  
  return score;
}

// @desc    Get recent searches for user
// @route   GET /api/search/recent
// @access  Private
export const getRecentSearches = async (req: Request, res: Response) => {
  try {
    // For now, return empty array. In a real app, you'd store this in Redis or database
    res.status(200).json({
      success: true,
      searches: []
    });
  } catch (error) {
    console.error('Get Recent Searches Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent searches'
    });
  }
};

// @desc    Save search query
// @route   POST /api/search/recent
// @access  Private
export const saveSearch = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // For now, just return success. In a real app, you'd store this in Redis or database
    res.status(200).json({
      success: true,
      message: 'Search saved'
    });
  } catch (error) {
    console.error('Save Search Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save search'
    });
  }
};
