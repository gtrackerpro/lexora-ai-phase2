import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Settings,
  Loader2,
  SkipBack,
  SkipForward
} from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  autoPlay?: boolean;
  startTime?: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  onProgress,
  onComplete,
  autoPlay = false,
  startTime = 0
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      if (onProgress) {
        const progress = (video.currentTime / video.duration) * 100;
        onProgress(progress);
      }
    };

    const updateDuration = () => {
      setDuration(video.duration);
      setIsLoading(false);
      if (startTime > 0) {
        video.currentTime = startTime;
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    
    const handleEnded = () => {
      setIsPlaying(false);
      if (onComplete) onComplete();
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoUrl, onProgress, onComplete, startTime]);

  useEffect(() => {
    if (autoPlay && videoRef.current && !isLoading) {
      videoRef.current.play();
    }
  }, [autoPlay, isLoading]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const time = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = time;
    setCurrentTime(time);
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  return (
    <div 
      className="relative bg-black rounded-xl overflow-hidden group"
      onMouseMove={showControlsTemporarily}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full aspect-video"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50"
          >
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
              <p className="text-white text-lg">Loading video...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4">
              <h3 className="text-white font-semibold text-lg">{title}</h3>
            </div>

            {/* Center Play Button */}
            {!isPlaying && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="bg-white/20 backdrop-blur-md rounded-full p-6 border border-white/30 hover:bg-white/30 transition-all duration-200">
                  <Play className="h-12 w-12 text-white ml-1" />
                </div>
              </motion.button>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="space-y-3">
                {/* Progress Bar */}
                <div className="group/progress">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={duration > 0 ? (currentTime / duration) * 100 : 0}
                    onChange={handleSeek}
                    className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider group-hover/progress:h-2 transition-all duration-200"
                  />
                </div>

                {/* Control Buttons */}
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
                      onClick={() => skipTime(-10)}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <SkipBack className="h-5 w-5 text-white" />
                    </button>

                    <button
                      onClick={() => skipTime(10)}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <SkipForward className="h-5 w-5 text-white" />
                    </button>

                    <div className="flex items-center space-x-2 group/volume">
                      <button
                        onClick={toggleMute}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="h-5 w-5 text-white" />
                        ) : (
                          <Volume2 className="h-5 w-5 text-white" />
                        )}
                      </button>
                      
                      <div className="w-0 group-hover/volume:w-20 overflow-hidden transition-all duration-200">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                          className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>

                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      >
                        <Settings className="h-5 w-5 text-white" />
                      </button>

                      <AnimatePresence>
                        {showSettings && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-md rounded-lg p-3 min-w-[150px]"
                          >
                            <div className="space-y-2">
                              <p className="text-white text-sm font-medium">Playback Speed</p>
                              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                <button
                                  key={rate}
                                  onClick={() => changePlaybackRate(rate)}
                                  className={`block w-full text-left px-2 py-1 text-sm rounded transition-colors ${
                                    playbackRate === rate
                                      ? 'bg-primary-600 text-white'
                                      : 'text-white/80 hover:bg-white/10'
                                  }`}
                                >
                                  {rate}x
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button
                      onClick={toggleFullscreen}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      {isFullscreen ? (
                        <Minimize className="h-5 w-5 text-white" />
                      ) : (
                        <Maximize className="h-5 w-5 text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoPlayer;