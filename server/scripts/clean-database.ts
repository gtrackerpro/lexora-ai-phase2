#!/usr/bin/env ts-node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import User from '../models/User';
import Lesson from '../models/Lesson';
import Progress from '../models/Progress';
import Topic from '../models/Topic';
import LearningPath from '../models/LearningPath';
import Asset from '../models/Asset';
import Video from '../models/Video';

// Database connection
const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Cleaning functions
const cleaningOperations = {
  // Remove all collections
  async clearAll(): Promise<void> {
    console.log('🧹 Clearing all collections...');
    const collections = await mongoose.connection.db!.collections();
    
    for (const collection of collections) {
      const count = await collection.countDocuments();
      if (count > 0) {
        await collection.deleteMany({});
        console.log(`  ✅ Cleared ${collection.collectionName}: ${count} documents`);
      } else {
        console.log(`  ⏭️  ${collection.collectionName}: already empty`);
      }
    }
    console.log('🎉 All collections cleared!');
  },

  // Remove specific collections
  async clearUsers(): Promise<void> {
    console.log('👥 Clearing users...');
    const count = await User.countDocuments();
    await User.deleteMany({});
    console.log(`  ✅ Removed ${count} users`);
  },

  async clearLessons(): Promise<void> {
    console.log('📚 Clearing lessons...');
    const count = await Lesson.countDocuments();
    await Lesson.deleteMany({});
    console.log(`  ✅ Removed ${count} lessons`);
  },

  async clearProgress(): Promise<void> {
    console.log('📊 Clearing progress data...');
    const count = await Progress.countDocuments();
    await Progress.deleteMany({});
    console.log(`  ✅ Removed ${count} progress entries`);
  },

  async clearTopics(): Promise<void> {
    console.log('🏷️  Clearing topics...');
    const count = await Topic.countDocuments();
    await Topic.deleteMany({});
    console.log(`  ✅ Removed ${count} topics`);
  },

  async clearLearningPaths(): Promise<void> {
    console.log('🛤️  Clearing learning paths...');
    const count = await LearningPath.countDocuments();
    await LearningPath.deleteMany({});
    console.log(`  ✅ Removed ${count} learning paths`);
  },

  async clearAssets(): Promise<void> {
    console.log('🎨 Clearing assets...');
    const count = await Asset.countDocuments();
    await Asset.deleteMany({});
    console.log(`  ✅ Removed ${count} assets`);
  },

  async clearVideos(): Promise<void> {
    console.log('🎬 Clearing videos...');
    const count = await Video.countDocuments();
    await Video.deleteMany({});
    console.log(`  ✅ Removed ${count} videos`);
  },

  // Remove orphaned data
  async removeOrphans(): Promise<void> {
    console.log('🔍 Removing orphaned data...');
    
    // Remove lessons without valid learning paths or topics
    const orphanedLessons = await Lesson.find({
      $or: [
        { learningPathId: { $exists: false } },
        { topicId: { $exists: false } },
        { userId: { $exists: false } }
      ]
    });
    
    if (orphanedLessons.length > 0) {
      await Lesson.deleteMany({
        _id: { $in: orphanedLessons.map(l => l._id) }
      });
      console.log(`  ✅ Removed ${orphanedLessons.length} orphaned lessons`);
    }

    // Remove progress entries without valid references
    const orphanedProgress = await Progress.find({
      $or: [
        { userId: { $exists: false } },
        { lessonId: { $exists: false } },
        { learningPathId: { $exists: false } },
        { topicId: { $exists: false } }
      ]
    });
    
    if (orphanedProgress.length > 0) {
      await Progress.deleteMany({
        _id: { $in: orphanedProgress.map(p => p._id) }
      });
      console.log(`  ✅ Removed ${orphanedProgress.length} orphaned progress entries`);
    }

    console.log('🎉 Orphaned data cleanup completed!');
  },

  // Remove test/demo data
  async clearTestData(): Promise<void> {
    console.log('🧪 Clearing test/demo data...');
    
    // Remove demo users
    const demoUsers = await User.deleteMany({
      $or: [
        { email: /demo@/i },
        { email: /test@/i },
        { displayName: /demo/i },
        { displayName: /test/i }
      ]
    });
    console.log(`  ✅ Removed ${demoUsers.deletedCount} demo/test users`);

    // Remove draft lessons
    const draftLessons = await Lesson.deleteMany({ status: 'draft' });
    console.log(`  ✅ Removed ${draftLessons.deletedCount} draft lessons`);

    console.log('🎉 Test data cleanup completed!');
  },

  // Clean old data (older than specified days)
  async clearOldData(days: number = 30): Promise<void> {
    console.log(`🗓️  Clearing data older than ${days} days...`);
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Remove old progress entries
    const oldProgress = await Progress.deleteMany({
      createdAt: { $lt: cutoffDate },
      completed: false // Keep completed progress
    });
    console.log(`  ✅ Removed ${oldProgress.deletedCount} old incomplete progress entries`);

    // Remove old incomplete lessons
    const oldLessons = await Lesson.deleteMany({
      createdAt: { $lt: cutoffDate },
      status: { $ne: 'finalized' }
    });
    console.log(`  ✅ Removed ${oldLessons.deletedCount} old incomplete lessons`);

    console.log('🎉 Old data cleanup completed!');
  },

  // Database statistics
  async showStats(): Promise<void> {
    console.log('📊 Database Statistics:');
    console.log('========================');
    
    const stats = [
      { name: 'Users', count: await User.countDocuments() },
      { name: 'Topics', count: await Topic.countDocuments() },
      { name: 'Learning Paths', count: await LearningPath.countDocuments() },
      { name: 'Lessons', count: await Lesson.countDocuments() },
      { name: 'Progress Entries', count: await Progress.countDocuments() },
      { name: 'Assets', count: await Asset.countDocuments() },
      { name: 'Videos', count: await Video.countDocuments() }
    ];

    stats.forEach(stat => {
      console.log(`  ${stat.name.padEnd(20)}: ${stat.count}`);
    });

    // Additional insights
    const draftLessons = await Lesson.countDocuments({ status: 'draft' });
    const completedProgress = await Progress.countDocuments({ completed: true });
    const demoUsers = await User.countDocuments({ email: /demo@|test@/i });

    console.log('\n📈 Additional Insights:');
    console.log(`  ${'Draft Lessons'.padEnd(20)}: ${draftLessons}`);
    console.log(`  ${'Completed Progress'.padEnd(20)}: ${completedProgress}`);
    console.log(`  ${'Demo/Test Users'.padEnd(20)}: ${demoUsers}`);
  }
};

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  const operation = args[0];

  if (!operation) {
    console.log(`
🧹 Database Cleaning Tool
========================

Usage: npm run clean-db [operation] [options]

Operations:
  all              - Clear all collections (⚠️  DESTRUCTIVE)
  users            - Clear all users
  lessons          - Clear all lessons
  progress         - Clear all progress data
  topics           - Clear all topics
  paths            - Clear all learning paths
  assets           - Clear all assets
  videos           - Clear all videos
  orphans          - Remove orphaned/invalid data
  test             - Remove test/demo data
  old [days]       - Remove old data (default: 30 days)
  stats            - Show database statistics

Examples:
  npm run clean-db all
  npm run clean-db users
  npm run clean-db old 7
  npm run clean-db stats

⚠️  WARNING: Some operations are destructive and cannot be undone!
`);
    process.exit(0);
  }

  try {
    await connectDB();

    switch (operation.toLowerCase()) {
      case 'all':
        await cleaningOperations.clearAll();
        break;
      case 'users':
        await cleaningOperations.clearUsers();
        break;
      case 'lessons':
        await cleaningOperations.clearLessons();
        break;
      case 'progress':
        await cleaningOperations.clearProgress();
        break;
      case 'topics':
        await cleaningOperations.clearTopics();
        break;
      case 'paths':
        await cleaningOperations.clearLearningPaths();
        break;
      case 'assets':
        await cleaningOperations.clearAssets();
        break;
      case 'videos':
        await cleaningOperations.clearVideos();
        break;
      case 'orphans':
        await cleaningOperations.removeOrphans();
        break;
      case 'test':
        await cleaningOperations.clearTestData();
        break;
      case 'old':
        const days = parseInt(args[1]) || 30;
        await cleaningOperations.clearOldData(days);
        break;
      case 'stats':
        await cleaningOperations.showStats();
        break;
      default:
        console.log(`❌ Unknown operation: ${operation}`);
        console.log('Run without arguments to see available operations.');
        process.exit(1);
    }

    console.log('\n✨ Operation completed successfully!');

  } catch (error) {
    console.error('❌ Error during operation:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Export for use as a module
export { cleaningOperations, connectDB };

// Run if executed directly
if (require.main === module) {
  main();
}
