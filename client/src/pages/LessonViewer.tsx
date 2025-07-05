import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  CheckCircle,
  BookOpen,
  MessageSquare,
  Clock,
  Target
} from 'lucide-react';
import { lessonsAPI, progressAPI, videosAPI } from '../services/api';
import toast from 'react-hot-toast';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [video, setVideo] = useState<Video | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript' | 'notes'>('overview');

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
      } catch (error) {
        console.error('Failed to fetch lesson:', error);
        toast.error('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [video]);

  const togglePlay = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
  };

  const toggleMute = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    videoElement.muted = !videoElement.muted;
    setIsMuted(videoElement.muted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const time = (parseFloat(e.target.value) / 100) * duration;
    videoElement.currentTime = time;
    setCurrentTime(time);
  };

  const updateProgress = async () => {
    if (!lesson || !id) return;

    const watchedPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
    const completed = watchedPercentage >= 90; // Consider completed if 90% watched

    try {
      await progressAPI.updateProgress({
        lessonId: id,
        learningPathId: lesson.learningPathId,
        topicId: lesson.topicId,
        videoId: video?._id,
        watchedPercentage,
        completed,
        notes: notes.split('\n').filter(note => note.trim())
      });

      if (completed && !progress?.completed) {
        toast.success('Lesson completed! 🎉');
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
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
              <div className="relative">
                <video
                  ref={videoRef}
                  src={video.videoUrl}
                  className="w-full aspect-video bg-black"
                  onTimeUpdate={updateProgress}
                />
                
                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="space-y-3">
                    {/* Progress Bar */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={duration > 0 ? (currentTime / duration) * 100 : 0}
                      onChange={handleSeek}
                      className="w-full h-1 bg-dark-600 rounded-lg appearance-none cursor-pointer slider"
                    />
                    
                    {/* Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={togglePlay}
                          className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                          {isPlaying ? (
                            <Pause className="h-6 w-6 text-white" />
                          ) : (
                            <Play className="h-6 w-6 text-white ml-0.5" />
                          )}
                        </button>
                        
                        <button
                          onClick={toggleMute}
                          className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                          {isMuted ? (
                            <VolumeX className="h-5 w-5 text-white" />
                          ) : (
                            <Volume2 className="h-5 w-5 text-white" />
                          )}
                        </button>
                        
                        <span className="text-white text-sm">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                          <RotateCcw className="h-5 w-5 text-white" />
                        </button>
                        <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                          <Maximize className="h-5 w-5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-dark-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <p className="text-white">
                    {video?.status === 'generating' ? 'Generating video...' : 'Video not available'}
                  </p>
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
  );
};

export default LessonViewer;