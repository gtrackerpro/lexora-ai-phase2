import dotenv from 'dotenv';

// Load environment variables from .env file FIRST
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database';
import errorHandler from './middleware/errorHandler';
import './config/passport'; // Initialize passport configuration AFTER env vars are loaded

// Route imports
import authRoutes from './routes/auth';
import topicRoutes from './routes/topics';
import learningPathRoutes from './routes/learningPaths';
import lessonRoutes from './routes/lessons';
import videoRoutes from './routes/videos';
import progressRoutes from './routes/progress';
import assetRoutes from './routes/assets';
import userRoutes from './routes/users';
import searchRoutes from './routes/search';

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS - Enhanced configuration for proper preflight handling
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Lexora API is running',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to check assets
app.get('/api/debug/assets', async (req, res) => {
  try {
    const { default: Asset } = await import('./models/Asset');
    const assets = await Asset.find({}).sort({ createdAt: -1 }).limit(10);
    res.json({
      success: true,
      count: assets.length,
      assets: assets.map((asset: any) => ({
        _id: asset._id,
        type: asset.type,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        userId: asset.userId,
        createdAt: asset.createdAt
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Debug endpoint to check lesson and user data
app.get('/api/debug/lesson/:id', async (req, res) => {
  try {
    const { default: Lesson } = await import('./models/Lesson');
    const { default: User } = await import('./models/User');
    const lesson = await Lesson.findById(req.params.id);
    const users = await User.find({}).select('_id email displayName avatarId voiceId').limit(5);
    
    res.json({
      success: true,
      lesson: lesson ? {
        _id: lesson._id,
        title: lesson.title,
        userId: lesson.userId,
        script: lesson.script ? `${lesson.script.substring(0, 100)}...` : 'No script',
        hasScript: !!lesson.script
      } : null,
      users: users.map((user: any) => ({
        _id: user._id,
        email: user.email,
        displayName: user.displayName,
        avatarId: user.avatarId,
        voiceId: user.voiceId
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handler
app.use(errorHandler);

// Handle unhandled routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Lexora API Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log(`Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});