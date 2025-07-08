import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTopics, useProgressAnalytics } from '../hooks';
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
// import EnhancedLearningStreak from '../components/Dashboard/EnhancedLearningStreak';
import Grid from '../components/Common/Grid';
import LoadingCard, { LoadingGrid } from '../components/Common/LoadingCard';
import ErrorState from '../components/Common/ErrorState';
import Layout from '../components/Layout/Layout';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Fetch real data using custom hooks
  const { data: topics, isLoading: topicsLoading, error: topicsError, refetch: refetchTopics } = useTopics();
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useProgressAnalytics();
  
  const statsData = analytics ? {
    totalHours: analytics.totalHours || 0,
    completedLessons: analytics.completedLessons || 0,
    currentStreak: analytics.currentStreak || 0,
    achievements: analytics.achievements || 0
  } : null;

  const handleCreateNewTopic = () => {
    navigate('/create-topic');
  };

  const handleContinueTopic = (topicId: string) => {
    navigate(`/learning/${topicId}`);
  };


  return (
    <Layout>
      <div className="space-y-8 pb-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-xl bg-dark-900 border border-dark-800">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <img 
                    src="/lexora-logo.png" 
                    alt="Lexora" 
                    className="h-6 w-6 object-contain"
                  />
                  <span className="text-primary-400 font-medium">Welcome back!</span>
                </div>
                <h1 className="text-3xl font-bold text-white">
                  Ready to learn something <span className="text-primary-400">amazing today?</span>
                </h1>
                <p className="text-dark-300 text-lg max-w-2xl">
                  Continue your personalized learning journey with AI-powered lessons.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button onClick={handleCreateNewTopic} className="btn-primary px-4 py-2">
                  <Plus className="h-5 w-5 mr-2" />
                  <span>New Learning Path</span>
                </button>
                <button className="btn-secondary px-4 py-2">
                  <Brain className="h-5 w-5 mr-2" />
                  <span>AI Recommendations</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Stats Grid - Simplified */}
      <div className="space-y-6">
        {analyticsLoading ? (
          <Grid cols={3} gap="md" className="mb-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <LoadingCard key={index} height="h-32" />
            ))}
          </Grid>
        ) : analyticsError ? (
          <ErrorState 
            title="Failed to load statistics"
            message="We couldn't load your learning statistics. Please try again."
            onRetry={() => window.location.reload()}
            className="py-8"
          />
        ) : statsData ? (
          <Grid cols={3} gap="md">
            <StatsCard
              title="Learning Hours"
              value={statsData.totalHours.toString()}
              change="+2.5 this week"
              changeType="positive"
              icon={Clock}
              color="primary"
              index={0}
            />
            <StatsCard
              title="Completed Lessons"
              value={statsData.completedLessons.toString()}
              change="+3 this week"
              changeType="positive"
              icon={BookOpen}
              color="green"
              index={1}
            />
            <StatsCard
              title="Learning Streak"
              value={`${statsData.currentStreak} days`}
              change={statsData.currentStreak > 0 ? "Keep it up!" : "Start today!"}
              changeType={statsData.currentStreak > 0 ? "positive" : "neutral"}
              icon={Zap}
              color="orange"
              index={2}
            />
          </Grid>
        ) : null}
      </div>

      {/* Main Content Grid */}
      <Grid cols={3} gap="lg" responsive={false} className="lg:grid-cols-3">
        {/* Learning Paths */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Your Learning Paths</h2>
              <p className="text-dark-400 mt-1">Continue where you left off</p>
            </div>
            <button 
              onClick={() => navigate('/topics')}
              className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
            >
              View All
            </button>
          </div>
          
          {topicsLoading ? (
            <LoadingGrid count={4} />
          ) : topicsError ? (
            <ErrorState 
              title="Failed to load learning paths"
              message="We couldn't load your learning paths. Please try again."
              onRetry={refetchTopics}
              className="py-12"
            />
          ) : topics && topics.length > 0 ? (
            <Grid cols={2} gap="md">
              {topics.slice(0, 4).map((topic, index) => (
                <TopicCard
                  key={topic._id}
                  title={topic.title}
                  description={topic.description}
                  topic={topic}
                  progress={0} // Will be calculated from progress data
                  totalLessons={0} // Will be fetched from lessons
                  completedLessons={0} // Will be calculated from progress
                  estimatedTime="6 weeks" // Default estimate
                  difficulty="Beginner" // Default difficulty
                  rating={4.5} // Default rating
                  onContinue={() => handleContinueTopic(topic._id)}
                  index={index}
                />
              ))}
            </Grid>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-dark-600 mx-auto mb-4" />
              <p className="text-dark-400 mb-6">Create your first AI-powered learning path to get started</p>
              <button
                onClick={handleCreateNewTopic}
                className="btn-primary px-6 py-3"
              >
                Create Learning Path
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <RecentActivity />
          
          {/* Learning Streak */}
          <div className="glass-card">
            <div className="flex items-center space-x-2 mb-6">
              <Zap className="h-5 w-5 text-primary-400" />
              <h3 className="text-lg font-semibold text-white">Learning Streak</h3>
            </div>
            {analyticsLoading ? (
              <LoadingCard height="h-32" />
            ) : analyticsError ? (
              <div className="text-center py-8">
                <p className="text-dark-400 text-sm">Unable to load streak data</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-primary-400 mb-2">
                    {statsData?.currentStreak || 0}
                  </div>
                  <p className="text-dark-300">days in a row</p>
                </div>
                <div className="flex justify-center space-x-1 mb-4">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < (statsData?.currentStreak || 0) && (statsData?.currentStreak || 0) > 0 
                          ? 'bg-primary-500' 
                          : 'bg-dark-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-center text-primary-400 text-sm">
                  {(statsData?.currentStreak || 0) > 0 ? 'Keep it up! 🔥' : 'Start your streak today! 🌟'}
                </p>
              </>
            )}
          </div>
          
          <div className="glass-card">
            <div className="flex items-center space-x-2 mb-6">
              <Plus className="h-5 w-5 text-primary-400" />
              <h3 className="text-lg font-semibold text-white">Quick Start</h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleCreateNewTopic}
                className="w-full flex items-center space-x-3 p-4 text-left hover:bg-dark-800/50 rounded-xl transition-all duration-200 group"
              >
                <div className="p-2 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 group-hover:from-primary-400 group-hover:to-primary-500 transition-all duration-200">
                  <Plus className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-white font-medium">Create Learning Path</span>
                  <p className="text-dark-400 text-sm">Start a new topic</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Grid>
      </div>
    </Layout>
  );
};

export default Dashboard;