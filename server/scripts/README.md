# Database Cleaning Scripts

This directory contains scripts to help you clean and maintain your MongoDB database for the Lexora AI learning platform.

## 🧹 Available Scripts

### Main Cleaning Script
- **File**: `clean-database.js` (JavaScript) / `clean-database.ts` (TypeScript)
- **Purpose**: Comprehensive database cleaning with multiple operations

## 🚀 How to Use

### From the server directory:

```bash
# Basic usage - shows help
npm run clean-db

# Clear all collections (⚠️ DESTRUCTIVE)
npm run clean-db all

# Clear specific collections
npm run clean-db users
npm run clean-db lessons
npm run clean-db progress
npm run clean-db topics
npm run clean-db paths
npm run clean-db assets
npm run clean-db videos

# Maintenance operations
npm run clean-db orphans    # Remove orphaned/invalid data
npm run clean-db test       # Remove test/demo data
npm run clean-db old 7      # Remove data older than 7 days
npm run clean-db stats      # Show database statistics

# Using TypeScript version
npm run clean-db:ts stats
```

### From the root directory:

```bash
# Run through the main package.json
npm --prefix server run clean-db stats
npm --prefix server run clean-db test
```

## 📊 Operations Explained

### 🔴 Destructive Operations (Use with Caution!)

- **`all`** - Clears ALL collections in the database
- **`users`** - Removes all user accounts
- **`lessons`** - Removes all lessons
- **`progress`** - Removes all learning progress data
- **`topics`** - Removes all topics
- **`paths`** - Removes all learning paths
- **`assets`** - Removes all assets (avatars, voices, etc.)
- **`videos`** - Removes all video records

### 🟡 Maintenance Operations (Safe for Regular Use)

- **`orphans`** - Removes data with broken references (e.g., lessons without valid topics)
- **`test`** - Removes demo/test users and draft lessons
- **`old [days]`** - Removes incomplete data older than specified days (default: 30)

### 🟢 Information Operations (Read-only)

- **`stats`** - Shows database statistics and insights

## 🔧 Using in Your Own Code

You can also import and use the cleaning functions in your own Node.js scripts:

```javascript
// Using JavaScript version
const { cleaningOperations, connectDB } = require('./scripts/clean-database.js');

async function customCleanup() {
  await connectDB();
  
  // Show current stats
  await cleaningOperations.showStats();
  
  // Remove old incomplete data
  await cleaningOperations.clearOldData(7);
  
  // Clean up orphaned records
  await cleaningOperations.removeOrphans();
  
  await mongoose.connection.close();
}
```

```typescript
// Using TypeScript version
import { cleaningOperations, connectDB } from './scripts/clean-database';

async function customCleanup(): Promise<void> {
  await connectDB();
  
  // Show current stats
  await cleaningOperations.showStats();
  
  // Remove test data
  await cleaningOperations.clearTestData();
  
  await mongoose.connection.close();
}
```

## ⚠️ Important Safety Notes

1. **Always backup your database** before running destructive operations
2. **Test on development environment** first
3. **Double-check your MONGODB_URI** environment variable
4. Some operations cannot be undone!

## 🔐 Environment Requirements

Make sure your `.env` file in the server directory contains:

```env
MONGODB_URI=mongodb://localhost:27017/your-database-name
# or your MongoDB Atlas connection string
```

## 📈 Example Output

```bash
$ npm run clean-db stats

📡 MongoDB Connected: localhost:27017
📊 Database Statistics:
========================
  Users               : 15
  Topics              : 8
  Learning Paths      : 12
  Lessons             : 45
  Progress Entries    : 123
  Assets              : 28
  Videos              : 67

📈 Additional Insights:
  Draft Lessons       : 3
  Completed Progress  : 89
  Demo/Test Users     : 2

✨ Operation completed successfully!
🔌 Database connection closed
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Connection Error**: Check your `MONGODB_URI` in `.env`
2. **Model Import Error**: Make sure all model files exist in `../models/`
3. **Permission Error**: Ensure your MongoDB user has delete permissions

### Getting Help:

Run without arguments to see all available operations:
```bash
npm run clean-db
```
