import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle,
  BookOpen,
  MessageSquare,
  Clock,
  Target,
  Play,
  Loader2,
  Video as VideoIcon,
  AlertCircle
} from 'lucide-react';
import VideoPlayer from '../components/LessonViewer/VideoPlayer';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { lessonsAPI, progressAPI, videosAPI, authAPI } from '../services/api';
import { useAnalytics } from '../utils/analytics';
import toast from 'react-hot-toast';
import Layout from '../components/Layout/Layout';

interface Lesson {
  _id: string;
  title: string;
  content: string;
  script: string;
  objectives: string[];
  week: number;
  day: number;
}

interface Video {
  _id: string;
  videoUrl: string;
  audioUrl: string;
  durationSec: number;
  status: string;
}

interface Progress {
  _id: string;
  watchedPercentage: number;
  completed: boolean;
  notes: string[];
}

const LessonViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trackLessonStarted, trackLessonCompleted, trackVideoProgress } = useAnalytics();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [video, setVideo] = useState<Video | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript' | 'notes'>('overview');
  const [watchTime, setWatchTime] = useState(0);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Get user data for avatar/voice preferences
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authAPI.getMe();
        if (response.success) {
          setUser(response.user);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const [lessonResponse, progressResponse] = await Promise.all([
          lessonsAPI.getById(id),
          progressAPI.getLessonProgress(id)
        ]);

        if (lessonResponse.success) {
          setLesson(lessonResponse.lesson);
          if (lessonResponse.video) {
            setVideo(lessonResponse.video);
          }
        }

        if (progressResponse.success && progressResponse.progress) {
          setProgress(progressResponse.progress);
          setNotes(progressResponse.progress.notes.join('\n'));
        }
        
        // Track lesson started
        if (lessonResponse.success && lessonResponse.lesson) {
          trackLessonStarted(
            lessonResponse.lesson._id,
            lessonResponse.lesson.title,
            lessonResponse.lesson.topicId
          );
        }
      } catch (error) {
        console.error('Failed to fetch lesson:', error);
        toast.error('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleVideoProgress = (progressPercent: number) => {
    // Track video progress milestones
    trackVideoProgress(lesson?._id || '', progressPercent, video?.durationSec || 0);
  };
  
  const handleVideoComplete = async () => {
    if (!lesson || !id) return;

    const completed = true;
    const watchedPercentage = 100;

    try {
      await progressAPI.updateProgress({
        lessonId: id,
        learningPathId: lesson.learningPathId || '',
        topicId: lesson.topicId || '',
        videoId: video?._id,
        watchedPercentage,
        completed,
        notes: notes.split('\n').filter(note => note.trim())
      });

      if (completed && !progress?.completed) {
        toast.success('Lesson completed! 🎉');
        
        // Track lesson completion
        trackLessonCompleted(
          lesson._id,
          lesson.title,
          watchTime,
          watchedPercentage
        );
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const saveNotes = async () => {
    if (!progress?._id) return;

    try {
      await progressAPI.addNote(progress._id, notes);
      toast.success('Notes saved!');
    } catch (error) {
      console.error('Failed to save notes:', error);
      toast.error('Failed to save notes');
    }
  };

  const handleGenerateVideo = async () => {
    if (!lesson || !user) return;

    // Check if user has avatar and voice preferences
    if (!user.avatarId || !user.voiceId) {
      toast.error('Please set your avatar and voice preferences in Profile Settings first');
      return;
    }

    setGeneratingVideo(true);
    try {
      const response = await lessonsAPI.generateVideo(lesson._id, {
        avatarId: user.avatarId,
        voiceId: user.voiceId
      });

      if (response.success) {
        toast.success('Video generation started! This may take a few minutes.');
        setVideo(response.video);
        
        // Poll for video status updates
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await videosAPI.getById(response.video._id);
            if (statusResponse.success) {
              setVideo(statusResponse.video);
              
              if (statusResponse.video.status === 'completed') {
                clearInterval(pollInterval);
                toast.success('Video generation completed!');
                setGeneratingVideo(false);
              } else if (statusResponse.video.status === 'failed') {
                clearInterval(pollInterval);
                toast.error('Video generation failed. Please try again.');
                setGeneratingVideo(false);
              }
            }
          } catch (error) {
            console.error('Error polling video status:', error);
          }
        }, 5000); // Poll every 5 seconds

        // Clear interval after 10 minutes to prevent infinite polling
        setTimeout(() => {
          clearInterval(pollInterval);
          setGeneratingVideo(false);
        }, 600000);
      }
    } catch (error) {
      console.error('Video generation error:', error);
      toast.error('Failed to start video generation');
      setGeneratingVideo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" type="lesson" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Lesson Not Found</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4"
      >
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-white" />
        </button>
        <div className="flex-1">
          <div className="flex items-center space-x-2 text-sm text-dark-400 mb-1">
            <span>Week {lesson.week}</span>
            <span>•</span>
            <span>Day {lesson.day}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>
        </div>
        {progress?.completed && (
          <div className="flex items-center space-x-2 text-success-400">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Completed</span>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="glass-card p-0 overflow-hidden">
            {video && video.status === 'completed' ? (
              <VideoPlayer
                videoUrl={video.videoUrl}
                title={lesson.title}
                onProgress={handleVideoProgress}
                onComplete={handleVideoComplete}
                startTime={progress?.watchedPercentage ? (progress.watchedPercentage / 100) * video.durationSec : 0}
              />
            ) : video && video.status === 'generating' ? (
              <div className="aspect-video bg-dark-800 flex items-center justify-center">
                <div className="text-center">
                  <LoadingSpinner 
                    size="lg" 
                    type="video"
                    text="Generating your personalized video..."
                  />
                  <p className="text-dark-400 text-sm mt-4">
                    This may take a few minutes. You can continue with other lessons.
                  </p>
                </div>
              </div>
            ) : video && video.status === 'failed' ? (
              <div className="aspect-video bg-dark-800 flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-error-400 mx-auto mb-4" />
                  <p className="text-white text-lg mb-2">Video Generation Failed</p>
                  <p className="text-dark-400 text-sm mb-6">
                    There was an error generating your video. Please try again.
                  </p>
                  <button
                    onClick={handleGenerateVideo}
                    disabled={generatingVideo}
                    className="btn-primary px-6 py-3 flex items-center space-x-2 mx-auto"
                  >
                    {generatingVideo ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <VideoIcon className="h-4 w-4" />
                        <span>Retry Video Generation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-dark-800 flex items-center justify-center">
                <div className="text-center">
                  <VideoIcon className="h-16 w-16 text-dark-600 mx-auto mb-4" />
                  <p className="text-white text-lg mb-2">No Video Available</p>
                  <p className="text-dark-400 text-sm mb-6">
                    Generate a personalized video with your avatar and voice
                  </p>
                  <button
                    onClick={handleGenerateVideo}
                    disabled={generatingVideo || !user?.avatarId || !user?.voiceId}
                    className="btn-primary px-6 py-3 flex items-center space-x-2 mx-auto"
                  >
                    {generatingVideo ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        <span>Generate Video</span>
                      </>
                    )}
                  </button>
                  {(!user?.avatarId || !user?.voiceId) && (
                    <p className="text-warning-400 text-xs mt-2">
                      Set your avatar and voice in Profile Settings first
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Progress Card */}
          <div className="glass-card">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="h-5 w-5 text-primary-400" />
              <h3 className="font-semibold text-white">Your Progress</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-dark-400">Watched</span>
                <span className="text-primary-400 font-medium">
                  {Math.round(progress?.watchedPercentage || 0)}%
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progress?.watchedPercentage || 0}%` }}
                />
              </div>
              <div className="flex items-center space-x-2 text-sm text-dark-400">
                <Clock className="h-4 w-4" />
                <span>~15 min lesson</span>
              </div>
            </div>
          </div>

          {/* Lesson Content Tabs */}
          <div className="glass-card">
            <div className="flex space-x-1 mb-4 bg-dark-800 rounded-lg p-1">
              {[
                { id: 'overview', label: 'Overview', icon: BookOpen },
                { id: 'transcript', label: 'Transcript', icon: MessageSquare },
                { id: 'notes', label: 'Notes', icon: MessageSquare }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-dark-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {activeTab === 'overview' && (
                <div>
                  <h4 className="font-semibold text-white mb-3">Learning Objectives</h4>
                  <ul className="space-y-2">
                    {lesson.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success-400 mt-0.5 flex-shrink-0" />
                        <span className="text-dark-300">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'transcript' && (
                <div>
                  <h4 className="font-semibold text-white mb-3">Lesson Transcript</h4>
                  <div className="text-sm text-dark-300 leading-relaxed max-h-96 overflow-y-auto">
                    {lesson.script.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div>
                  <h4 className="font-semibold text-white mb-3">Your Notes</h4>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your notes here..."
                    className="w-full h-48 bg-dark-800 border border-dark-600 rounded-lg p-3 text-white placeholder-dark-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={saveNotes}
                    className="w-full mt-3 btn-primary py-2 text-sm"
                  >
                    Save Notes
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      </div>
    </Layout>
  );
};

export default LessonViewer;