#!/usr/bin/env node

// Example showing how to use the database cleaning functions programmatically

const { cleaningOperations, connectDB } = require('./clean-database.js');
const mongoose = require('mongoose');

async function customDatabaseMaintenance() {
  try {
    console.log('🚀 Starting custom database maintenance...');
    
    // Connect to database (you can also use your own connection logic)
    await connectDB();
    
    // Show current database stats
    console.log('\n📊 Current Database State:');
    await cleaningOperations.showStats();
    
    // Example: Clean up test data and old incomplete records
    console.log('\n🧹 Performing maintenance tasks...');
    
    // Remove test/demo data
    await cleaningOperations.clearTestData();
    
    // Remove data older than 7 days
    await cleaningOperations.clearOldData(7);
    
    // Clean up orphaned records
    await cleaningOperations.removeOrphans();
    
    // Show updated stats
    console.log('\n📊 Database State After Cleanup:');
    await cleaningOperations.showStats();
    
    console.log('\n✅ Custom maintenance completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during maintenance:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the maintenance if this file is executed directly
if (require.main === module) {
  customDatabaseMaintenance();
}

module.exports = customDatabaseMaintenance;
