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

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes); // For /api/users/me routes
app.use('/api/topics', topicRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/assets', assetRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Lexora API is running',
    timestamp: new Date().toISOString()
  });
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