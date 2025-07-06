import React from 'react';
import { useNavigate } from 'react-router-dom';
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
import EnhancedLearningStreak from '../components/Dashboard/EnhancedLearningStreak';
import Grid from '../components/Common/Grid';
import LoadingCard, { LoadingGrid } from '../components/Common/LoadingCard';
import ErrorState from '../components/Common/ErrorState';
import Layout from '../components/Layout/Layout';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Fetch real data using custom hooks
  const { data: topics, isLoading: topicsLoading, error: topicsError, refetch: refetchTopics } = useTopics();
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useProgressAnalytics();

  const handleCreateNewTopic = () => {
    navigate('/create-topic');
  };

  const handleContinueTopic = (topicId: string) => {
    navigate(`/learning/${topicId}`);
  };

  // Calculate stats from real data
  const statsData = analytics ? {
    totalHours: analytics.totalHours,
    completedLessons: analytics.completedLessons,
    currentStreak: analytics.currentStreak,
    achievements: Math.floor(analytics.completedLessons / 5) // 1 achievement per 5 lessons
  } : null;

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

      {/* Stats Grid */}
      <div className="space-y-6">
        {analyticsLoading ? (
          <Grid cols={4} gap="md" className="mb-8">
            {Array.from({ length: 4 }).map((_, index) => (
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
          <Grid cols={4} gap="md">
            <StatsCard
              title="Total Learning Hours"
              value={statsData.totalHours.toString()}
              change="+2.5 this week"
              changeType="positive"
              icon={Clock}
              color="primary"
              index={0}
            />
            <StatsCard
              title="Lessons Completed"
              value={statsData.completedLessons.toString()}
              change="+3 this week"
              changeType="positive"
              icon={BookOpen}
              color="green"
              index={1}
            />
            <StatsCard
              title="Current Streak"
              value={`${statsData.currentStreak} days`}
              change={statsData.currentStreak > 0 ? "Keep it up!" : "Start today!"}
              changeType={statsData.currentStreak > 0 ? "positive" : "neutral"}
              icon={Zap}
              color="orange"
              index={2}
            />
            <StatsCard
              title="Achievements"
              value={statsData.achievements.toString()}
              change="+1 this month"
              changeType="positive"
              icon={Award}
              color="purple"
              index={3}
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
          <EnhancedLearningStreak />
          <div className="glass-card">
            <div className="flex items-center space-x-2 mb-6">
              <Target className="h-5 w-5 text-primary-400" />
              <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <button
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
              </button>
              
              <button
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
              </button>
              
              <button
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
              </button>
            </div>
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
          <button className="w-full mt-4 btn-ghost py-2 text-sm">
            <div className="flex items-center justify-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Join Community</span>
            </div>
          </button>
        </div>
      </Grid>
      </div>
    </Layout>
  );
};

export default Dashboard;