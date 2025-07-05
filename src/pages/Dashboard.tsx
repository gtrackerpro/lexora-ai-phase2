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
  Calendar
} from 'lucide-react';
import StatsCard from '../components/Dashboard/StatsCard';
import TopicCard from '../components/Dashboard/TopicCard';
import RecentActivity from '../components/Dashboard/RecentActivity';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const mockTopics = [
    {
      id: '1',
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
      title: 'Data Science with Python',
      description: 'Dive into data analysis, visualization, and machine learning using Python and popular libraries.',
      progress: 0,
      totalLessons: 56,
      completedLessons: 0,
      estimatedTime: '12 weeks',
      difficulty: 'Intermediate' as const,
      rating: 4.7,
    },
  ];

  const handleContinueTopic = (topicId: string) => {
    navigate(`/learning/${topicId}`);
  };

  const handleCreateNewTopic = () => {
    navigate('/create-topic');
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome back!</h1>
          <p className="text-dark-400 mt-2">Continue your learning journey with personalized AI-powered lessons.</p>
        </div>
        <button
          onClick={handleCreateNewTopic}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>New Learning Path</span>
        </button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatsCard
          title="Total Learning Hours"
          value="127.5"
          change="+12.5 this week"
          changeType="positive"
          icon={Clock}
          color="primary"
        />
        <StatsCard
          title="Lessons Completed"
          value="89"
          change="+7 this week"
          changeType="positive"
          icon={BookOpen}
          color="green"
        />
        <StatsCard
          title="Current Streak"
          value="15 days"
          change="Personal best!"
          changeType="positive"
          icon={Zap}
          color="orange"
        />
        <StatsCard
          title="Achievements"
          value="24"
          change="+3 this month"
          changeType="positive"
          icon={Award}
          color="purple"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Learning Paths */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Your Learning Paths</h2>
            <button className="text-primary-400 hover:text-primary-300 text-sm font-medium">
              View All
            </button>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {mockTopics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <TopicCard
                  title={topic.title}
                  description={topic.description}
                  progress={topic.progress}
                  totalLessons={topic.totalLessons}
                  completedLessons={topic.completedLessons}
                  estimatedTime={topic.estimatedTime}
                  difficulty={topic.difficulty}
                  rating={topic.rating}
                  onContinue={() => handleContinueTopic(topic.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <RecentActivity />
          
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-dark-700 rounded-lg transition-colors">
                <Target className="h-5 w-5 text-primary-400" />
                <span className="text-white">Set Learning Goals</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-dark-700 rounded-lg transition-colors">
                <Calendar className="h-5 w-5 text-green-400" />
                <span className="text-white">Schedule Study Time</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-dark-700 rounded-lg transition-colors">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                <span className="text-white">View Progress Report</span>
              </button>
            </div>
          </motion.div>

          {/* Learning Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card bg-gradient-to-br from-primary-600 to-primary-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Zap className="h-6 w-6 text-yellow-300" />
              <h3 className="text-lg font-semibold text-white">Learning Streak</h3>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">15</div>
              <p className="text-primary-100">Days in a row</p>
              <p className="text-primary-200 text-sm mt-2">Keep it up! You're on fire! 🔥</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;