import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Video, Target, TrendingUp, Clock, Award } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import StatsCard from '../components/Dashboard/StatsCard';
import TopicCard from '../components/Dashboard/TopicCard';
import RecentActivity from '../components/Dashboard/RecentActivity';
import { useAuth } from '../contexts/AuthContext';
import { topicsAPI } from '../services/api';
import { Topic } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await topicsAPI.getAll();
        if (response.success) {
          setTopics(response.topics);
        }
      } catch (error) {
        console.error('Failed to fetch topics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const handleTopicClick = (topic: Topic) => {
    navigate(`/topics/${topic._id}`);
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.displayName}! 👋
          </h1>
          <p className="text-primary-100">
            Ready to continue your learning journey? You have 3 lessons waiting for you.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Active Topics"
            value={topics.length}
            icon={BookOpen}
            change="+2 this week"
            changeType="positive"
            color="primary"
          />
          <StatsCard
            title="Lessons Completed"
            value="24"
            icon={Target}
            change="+5 this week"
            changeType="positive"
            color="success"
          />
          <StatsCard
            title="Videos Watched"
            value="18"
            icon={Video}
            change="3.2 hours"
            changeType="neutral"
            color="secondary"
          />
          <StatsCard
            title="Learning Streak"
            value="7 days"
            icon={Award}
            change="Personal best!"
            changeType="positive"
            color="accent"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Topics Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Your Topics</h2>
              <button
                onClick={() => navigate('/create-topic')}
                className="text-primary-400 hover:text-primary-300 text-sm font-medium"
              >
                Create New Topic
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-dark-900 border border-dark-700 rounded-xl p-6 animate-pulse">
                    <div className="h-4 bg-dark-700 rounded mb-2"></div>
                    <div className="h-3 bg-dark-700 rounded mb-4"></div>
                    <div className="h-2 bg-dark-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : topics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topics.map((topic) => (
                  <TopicCard
                    key={topic._id}
                    topic={topic}
                    progress={Math.floor(Math.random() * 100)}
                    totalLessons={Math.floor(Math.random() * 20) + 5}
                    completedLessons={Math.floor(Math.random() * 15)}
                    onClick={() => handleTopicClick(topic)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-dark-900 border border-dark-700 rounded-xl p-8 text-center">
                <BookOpen className="w-12 h-12 text-dark-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No topics yet</h3>
                <p className="text-dark-400 mb-4">
                  Create your first learning topic to get started with personalized AI lessons.
                </p>
                <button
                  onClick={() => navigate('/create-topic')}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Your First Topic
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RecentActivity />
            
            {/* Quick Actions */}
            <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/create-topic')}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg transition-colors text-left"
                >
                  Create New Topic
                </button>
                <button className="w-full bg-dark-800 hover:bg-dark-700 text-white py-2 px-4 rounded-lg transition-colors text-left">
                  Upload Avatar
                </button>
                <button className="w-full bg-dark-800 hover:bg-dark-700 text-white py-2 px-4 rounded-lg transition-colors text-left">
                  Voice Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;