import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from './config/database';
import User from './models/User';
import Topic from './models/Topic';
import LearningPath from './models/LearningPath';
import Lesson from './models/Lesson';
import Progress from './models/Progress';

// Load environment variables
dotenv.config();

// Demo data
const demoUsers = [
  {
    email: 'demo@lexora.ai',
    password: 'demo123',
    displayName: 'Demo User',
    authProvider: 'local',
    preferences: {
      genderVoice: 'neutral',
      learningStyle: 'visual'
    }
  },
  {
    email: 'john@example.com',
    password: 'password123',
    displayName: 'John Doe',
    authProvider: 'local',
    preferences: {
      genderVoice: 'male',
      learningStyle: 'auditory'
    }
  }
];

const demoTopics = [
  {
    title: 'Python Programming Fundamentals',
    description: 'Learn Python from scratch with hands-on projects and real-world applications. Perfect for beginners who want to start their programming journey.',
    tags: ['python', 'programming', 'beginner', 'coding', 'software development']
  },
  {
    title: 'Web Development with React',
    description: 'Master modern web development using React, JavaScript, and related technologies. Build responsive and interactive web applications.',
    tags: ['react', 'javascript', 'web development', 'frontend', 'html', 'css']
  },
  {
    title: 'Data Science and Analytics',
    description: 'Dive into data science with Python, pandas, and machine learning. Learn to analyze data and build predictive models.',
    tags: ['data science', 'python', 'machine learning', 'analytics', 'pandas', 'numpy']
  },
  {
    title: 'Digital Marketing Mastery',
    description: 'Comprehensive guide to digital marketing including SEO, social media, content marketing, and paid advertising strategies.',
    tags: ['digital marketing', 'seo', 'social media', 'content marketing', 'advertising']
  }
];

const demoLearningPaths = [
  {
    title: 'Python Programming Masterclass',
    description: 'A comprehensive 8-week journey through Python programming, from basic syntax to advanced concepts and real-world projects.',
    weeks: 8,
    estimatedTotalHours: 40,
    difficulty: 'Beginner',
    goal: 'Master Python programming fundamentals and build practical applications including web scrapers, data analysis tools, and automation scripts.'
  },
  {
    title: 'React Development Bootcamp',
    description: 'Learn to build modern web applications with React, including hooks, state management, and deployment strategies.',
    weeks: 10,
    estimatedTotalHours: 50,
    difficulty: 'Intermediate',
    goal: 'Build professional-grade React applications with modern development practices and deploy them to production.'
  },
  {
    title: 'Data Science Foundations',
    description: 'Introduction to data science concepts, tools, and techniques using Python and popular libraries.',
    weeks: 12,
    estimatedTotalHours: 60,
    difficulty: 'Intermediate',
    goal: 'Develop skills in data analysis, visualization, and basic machine learning to solve real-world problems.'
  },
  {
    title: 'Digital Marketing Strategy',
    description: 'Complete digital marketing course covering all major channels and strategies for business growth.',
    weeks: 6,
    estimatedTotalHours: 30,
    difficulty: 'Beginner',
    goal: 'Create and execute effective digital marketing campaigns across multiple channels to drive business results.'
  }
];

const demoLessons = [
  // Python Programming Lessons (Week 1)
  {
    title: 'Introduction to Python and Setup',
    week: 1,
    day: 1,
    content: `Welcome to Python programming! Python is one of the most popular and versatile programming languages in the world. In this lesson, we'll cover:

1. What is Python and why is it popular?
2. Installing Python on your system
3. Setting up a development environment
4. Writing your first Python program
5. Understanding the Python interpreter

Python is known for its simple, readable syntax that makes it perfect for beginners. It's used in web development, data science, artificial intelligence, automation, and much more.

Let's start by installing Python from python.org and setting up a code editor like VS Code or PyCharm.`,
    script: `Hello and welcome to your first Python programming lesson! I'm excited to guide you through this amazing journey into the world of programming.

Python is truly one of the most beginner-friendly programming languages out there. Its syntax is clean, readable, and almost like writing in plain English. That's why millions of developers around the world choose Python for everything from web development to artificial intelligence.

Today, we're going to get you set up with everything you need to start coding. First, we'll install Python on your computer. Then we'll choose a great code editor that will make your programming experience smooth and enjoyable.

By the end of this lesson, you'll have written your very first Python program and understand how the Python interpreter works. Don't worry if some concepts seem new - we'll take it step by step, and I'll be here to guide you through everything.

Let's dive in and start your programming adventure!`,
    objectives: [
      'Install Python on your system',
      'Set up a development environment',
      'Write and run your first Python program',
      'Understand basic Python syntax',
      'Learn how to use the Python interpreter'
    ],
    status: 'finalized'
  },
  {
    title: 'Variables and Data Types',
    week: 1,
    day: 2,
    content: `In this lesson, we'll explore Python's fundamental building blocks: variables and data types.

Variables are containers that store data values. In Python, you don't need to declare the type of variable - Python figures it out automatically!

Key topics covered:
1. Creating and naming variables
2. Basic data types: strings, integers, floats, booleans
3. Type conversion and checking
4. Variable scope and best practices
5. Common mistakes to avoid

Examples:
- name = "Alice"  # String
- age = 25        # Integer
- height = 5.6    # Float
- is_student = True  # Boolean

We'll also learn about Python's dynamic typing system and how to check variable types using the type() function.`,
    script: `Great job on completing your first lesson! Now let's dive into one of the most important concepts in programming: variables and data types.

Think of variables as labeled boxes where you can store different kinds of information. In Python, creating a variable is as simple as giving it a name and assigning a value. The beautiful thing about Python is that it automatically figures out what type of data you're storing.

We have several basic data types in Python. Strings for text, like someone's name. Integers for whole numbers, like someone's age. Floats for decimal numbers, like someone's height. And booleans for true or false values, like whether someone is a student.

What makes Python special is its dynamic typing. You don't have to tell Python "this is a number" or "this is text" - it's smart enough to figure it out on its own. This makes Python code much cleaner and easier to read than many other programming languages.

Let's explore these concepts with some hands-on examples and see how variables make our programs dynamic and flexible!`,
    objectives: [
      'Understand what variables are and how to create them',
      'Learn about different data types in Python',
      'Practice type conversion between different data types',
      'Understand variable naming conventions',
      'Learn to check variable types using built-in functions'
    ],
    status: 'finalized'
  }
];

// Clear existing data
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Topic.deleteMany({});
    await LearningPath.deleteMany({});
    await Lesson.deleteMany({});
    await Progress.deleteMany({});
    console.log('✅ Existing data cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

// Seed users
const seedUsers = async () => {
  try {
    const users = [];
    
    for (const userData of demoUsers) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = await User.create({
        ...userData,
        password: hashedPassword
      });
      
      users.push(user);
    }
    
    console.log(`✅ Created ${users.length} demo users`);
    return users;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

// Seed topics
const seedTopics = async (users: any[]) => {
  try {
    const topics = [];
    
    for (let i = 0; i < demoTopics.length; i++) {
      const topicData = demoTopics[i];
      const user = users[i % users.length]; // Distribute topics among users
      
      const topic = await Topic.create({
        ...topicData,
        createdBy: user._id
      });
      
      topics.push(topic);
    }
    
    console.log(`✅ Created ${topics.length} demo topics`);
    return topics;
  } catch (error) {
    console.error('❌ Error seeding topics:', error);
    throw error;
  }
};

// Seed learning paths
const seedLearningPaths = async (users: any[], topics: any[]) => {
  try {
    const learningPaths = [];
    
    for (let i = 0; i < demoLearningPaths.length; i++) {
      const pathData = demoLearningPaths[i];
      const user = users[i % users.length];
      const topic = topics[i];
      
      const learningPath = await LearningPath.create({
        ...pathData,
        topicId: topic._id,
        userId: user._id
      });
      
      learningPaths.push(learningPath);
    }
    
    console.log(`✅ Created ${learningPaths.length} demo learning paths`);
    return learningPaths;
  } catch (error) {
    console.error('❌ Error seeding learning paths:', error);
    throw error;
  }
};

// Seed lessons
const seedLessons = async (users: any[], topics: any[], learningPaths: any[]) => {
  try {
    const lessons = [];
    
    // Create lessons for the first learning path (Python Programming)
    const pythonPath = learningPaths[0];
    const pythonTopic = topics[0];
    const user = users[0];
    
    for (const lessonData of demoLessons) {
      const lesson = await Lesson.create({
        ...lessonData,
        learningPathId: pythonPath._id,
        topicId: pythonTopic._id,
        userId: user._id
      });
      
      lessons.push(lesson);
    }
    
    // Create some additional lessons for other paths
    const additionalLessons = [
      {
        title: 'Introduction to React Components',
        week: 1,
        day: 1,
        content: 'Learn the fundamentals of React components and JSX syntax.',
        script: 'Welcome to React development! Today we\'ll explore the building blocks of React applications.',
        objectives: ['Understand React components', 'Learn JSX syntax', 'Create your first component'],
        learningPathId: learningPaths[1]._id,
        topicId: topics[1]._id,
        userId: users[0]._id,
        status: 'finalized'
      },
      {
        title: 'Data Analysis with Pandas',
        week: 1,
        day: 1,
        content: 'Introduction to data manipulation and analysis using the Pandas library.',
        script: 'Let\'s dive into the world of data science with Pandas, Python\'s most powerful data analysis library.',
        objectives: ['Install and import Pandas', 'Load data from CSV files', 'Basic data exploration'],
        learningPathId: learningPaths[2]._id,
        topicId: topics[2]._id,
        userId: users[0]._id,
        status: 'finalized'
      }
    ];
    
    for (const lessonData of additionalLessons) {
      const lesson = await Lesson.create(lessonData);
      lessons.push(lesson);
    }
    
    console.log(`✅ Created ${lessons.length} demo lessons`);
    return lessons;
  } catch (error) {
    console.error('❌ Error seeding lessons:', error);
    throw error;
  }
};

// Seed progress data
const seedProgress = async (users: any[], lessons: any[], learningPaths: any[], topics: any[]) => {
  try {
    const progressEntries = [];
    
    // Create some progress for the demo user
    const demoUser = users[0];
    
    // Complete first lesson
    const firstLesson = lessons[0];
    const progress1 = await Progress.create({
      userId: demoUser._id,
      lessonId: firstLesson.lessonId || firstLesson._id,
      learningPathId: firstLesson.learningPathId,
      topicId: firstLesson.topicId,
      watchedPercentage: 100,
      completed: true,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      notes: ['Great introduction to Python!', 'Setup was straightforward'],
      revisits: [{
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        watchedPercent: 100
      }]
    });
    progressEntries.push(progress1);
    
    // Partially complete second lesson
    if (lessons.length > 1) {
      const secondLesson = lessons[1];
      const progress2 = await Progress.create({
        userId: demoUser._id,
        lessonId: secondLesson.lessonId || secondLesson._id,
        learningPathId: secondLesson.learningPathId,
        topicId: secondLesson.topicId,
        watchedPercentage: 65,
        completed: false,
        notes: ['Variables are easier than I thought'],
        revisits: [{
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          watchedPercent: 65
        }]
      });
      progressEntries.push(progress2);
    }
    
    console.log(`✅ Created ${progressEntries.length} progress entries`);
    return progressEntries;
  } catch (error) {
    console.error('❌ Error seeding progress:', error);
    throw error;
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await clearDatabase();
    
    // Seed data in order
    const users = await seedUsers();
    const topics = await seedTopics(users);
    const learningPaths = await seedLearningPaths(users, topics);
    const lessons = await seedLessons(users, topics, learningPaths);
    const progress = await seedProgress(users, lessons, learningPaths, topics);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('Email: demo@lexora.ai');
    console.log('Password: demo123');
    console.log('\n📊 Seeded Data Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Topics: ${topics.length}`);
    console.log(`- Learning Paths: ${learningPaths.length}`);
    console.log(`- Lessons: ${lessons.length}`);
    console.log(`- Progress Entries: ${progress.length}`);
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;