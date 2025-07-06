import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  TrendingUp,
  Award,
  Plus,
  Zap,
  Target,
  Calendar,
  Sparkles,
  Brain,
  Users,
  Globe
} from 'lucide-react';
import StatsCard from '../components/Dashboard/StatsCard';
import TopicCard from '../components/Dashboard/TopicCard';
import RecentActivity from '../components/Dashboard/RecentActivity';
import Layout from '../components/Layout/Layout';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const mockTopics = [
    {
      id: '1',
      _id: '1',
      title: 'Python Programming Masterclass',
      description: 'Learn Python from scratch to advanced concepts with hands-on projects and real-world applications.',
      progress: 65,
      totalLessons: 42,
      completedLessons: 27,
      estimatedTime: '6 weeks',
      difficulty: 'Beginner' as const,
      rating: 4.8,
    },
    {
      id: '2',
      _id: '2',
      title: 'Web Development Fundamentals',
      description: 'Master HTML, CSS, and JavaScript to build modern, responsive websites from the ground up.',
      progress: 30,
      totalLessons: 38,
      completedLessons: 11,
      estimatedTime: '8 weeks',
      difficulty: 'Beginner' as const,
      rating: 4.9,
    },
    {
      id: '3',
      _id: '3',
      title: 'Data Science with Python',
      description: 'Dive into data analysis, visualization, and machine learning using Python and popular libraries.',
      progress: 0,
      totalLessons: 56,
      completedLessons: 0,
      estimatedTime: '12 weeks',
      difficulty: 'Intermediate' as const,
      rating: 4.7,
    },
    {
      id: '4',
      _id: '4',
      title: 'Machine Learning Fundamentals',
      description: 'Understand the core concepts of machine learning and build your first AI models.',
      progress: 100,
      totalLessons: 32,
      completedLessons: 32,
      estimatedTime: '10 weeks',
      difficulty: 'Advanced' as const,
      rating: 4.9,
    },
  ];

  const handleContinueTopic = (topicId: string) => {
    navigate(`/learning/${topicId}`);
  };

  const handleCreateNewTopic = () => {
    navigate('/create-topic');
  };

  return (
    <Layout>
      <div className="space-y-8 pb-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-accent-600/20 to-primary-800/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
        <div className="relative p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center space-x-2"
              >
                <img 
                  src="/lexora-logo.png" 
                  alt="Lexora" 
                  className="h-6 w-6 object-contain"
                />
                <span className="text-primary-400 font-medium">Welcome back!</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl lg:text-5xl font-bold text-white"
              >
                Ready to learn something
                <span className="text-gradient block">amazing today?</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-dark-300 text-lg max-w-2xl"
              >
                Continue your personalized learning journey with AI-powered lessons tailored just for you.
              </motion.p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateNewTopic}
                className="btn-primary px-8 py-4 text-lg font-semibold group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center space-x-3">
                  <Plus className="h-6 w-6" />
                  <span>New Learning Path</span>
                </div>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary px-8 py-4 text-lg font-semibold"
              >
                <div className="flex items-center space-x-3">
                  <Brain className="h-6 w-6" />
                  <span>AI Recommendations</span>
                </div>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatsCard
          title="Total Learning Hours"
          value="127.5"
          change="+12.5 this week"
          changeType="positive"
          icon={Clock}
          color="primary"
          index={0}
        />
        <StatsCard
          title="Lessons Completed"
          value="89"
          change="+7 this week"
          changeType="positive"
          icon={BookOpen}
          color="green"
          index={1}
        />
        <StatsCard
          title="Current Streak"
          value="15 days"
          change="Personal best!"
          changeType="positive"
          icon={Zap}
          color="orange"
          index={2}
        />
        <StatsCard
          title="Achievements"
          value="24"
          change="+3 this month"
          changeType="positive"
          icon={Award}
          color="purple"
          index={3}
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Learning Paths */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between"
          >
            <div>
              <h2 className="text-2xl font-bold text-white">Your Learning Paths</h2>
              <p className="text-dark-400 mt-1">Continue where you left off</p>
            </div>
            <button className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors">
              View All
            </button>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockTopics.map((topic, index) => (
              <TopicCard
                key={topic.id}
                title={topic.title}
                description={topic.description}
                topic={topic}
                progress={topic.progress}
                totalLessons={topic.totalLessons}
                completedLessons={topic.completedLessons}
                estimatedTime={topic.estimatedTime}
                difficulty={topic.difficulty}
                rating={topic.rating}
                onContinue={() => handleContinueTopic(topic.id)}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <RecentActivity />
          
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card"
          >
            <div className="flex items-center space-x-2 mb-6">
              <Target className="h-5 w-5 text-primary-400" />
              <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                className="w-full flex items-center space-x-3 p-4 text-left hover:bg-dark-800/50 rounded-xl transition-all duration-200 group"
              >
                <div className="p-2 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 group-hover:from-primary-400 group-hover:to-primary-500 transition-all duration-200">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-white font-medium">Set Learning Goals</span>
                  <p className="text-dark-400 text-sm">Define your objectives</p>
                </div>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                className="w-full flex items-center space-x-3 p-4 text-left hover:bg-dark-800/50 rounded-xl transition-all duration-200 group"
              >
                <div className="p-2 rounded-lg bg-gradient-to-r from-success-500 to-success-600 group-hover:from-success-400 group-hover:to-success-500 transition-all duration-200">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-white font-medium">Schedule Study Time</span>
                  <p className="text-dark-400 text-sm">Plan your sessions</p>
                </div>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                className="w-full flex items-center space-x-3 p-4 text-left hover:bg-dark-800/50 rounded-xl transition-all duration-200 group"
              >
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 group-hover:from-blue-400 group-hover:to-blue-500 transition-all duration-200">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-white font-medium">View Progress Report</span>
                  <p className="text-dark-400 text-sm">Track your growth</p>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* Learning Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/30 to-accent-600/30"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <div className="relative p-6 text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="inline-block mb-4"
              >
                <Zap className="h-12 w-12 text-warning-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Learning Streak</h3>
              <div className="text-4xl font-bold text-gradient mb-3">15</div>
              <p className="text-dark-300 mb-4">Days in a row</p>
              
              {/* Streak Visualization */}
              <div className="flex justify-center space-x-2 mb-4">
                {[...Array(7)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className={`w-3 h-3 rounded-full ${
                      i < 5 ? 'bg-primary-500 shadow-glow-sm' : 'bg-dark-700'
                    }`}
                  />
                ))}
              </div>
              
              <p className="text-primary-400 text-sm font-medium">Keep it up! You're on fire! 🔥</p>
            </div>
          </motion.div>

          {/* Community Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-5 w-5 text-accent-400" />
              <h3 className="text-lg font-semibold text-white">Community</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-300">Global Learners</span>
                <span className="text-sm font-semibold text-accent-400">2.4M+</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-300">Lessons Completed Today</span>
                <span className="text-sm font-semibold text-success-400">156K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-300">Your Rank</span>
                <span className="text-sm font-semibold text-primary-400">#1,247</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="w-full mt-4 btn-ghost py-2 text-sm"
            >
              <div className="flex items-center justify-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Join Community</span>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default Dashboard;