'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  isLoading?: boolean;
}

export function VideoPlayer({ videoUrl, thumbnailUrl, isLoading }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 10);
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="w-full aspect-video bg-[#141414] rounded-lg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#00E599] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#888888]">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="w-full aspect-video bg-[#141414] rounded-lg flex items-center justify-center border-2 border-dashed border-[#2A2A2A]">
        <div className="text-center">
          <p className="text-[#888888]">No video generated yet</p>
          <p className="text-sm text-[#555555] mt-1">Generate this scene to see the video</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full bg-black rounded-lg overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        className="w-full aspect-video"
        onClick={togglePlay}
      />
      
      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-16 h-16 bg-[#00E599] rounded-full flex items-center justify-center hover:scale-105 transition-transform">
            <Play className="w-8 h-8 text-black ml-1" />
          </div>
        </div>
      )}
      
      {/* Controls Bar */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-12 pb-4 px-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress Bar */}
        <div className="mb-3">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-[#333] rounded-full appearance-none cursor-pointer hover:h-1.5 transition-all"
            style={{
              background: `linear-gradient(to right, #00E599 0%, #00E599 ${(currentTime / (duration || 1)) * 100}%, #333 ${(currentTime / (duration || 1)) * 100}%, #333 100%)`
            }}
          />
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Skip Backward */}
            <button 
              onClick={skipBackward}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
              title="Skip back 10s"
            >
              <SkipBack className="w-4 h-4 text-white" />
            </button>
            
            {/* Play/Pause */}
            <button 
              onClick={togglePlay}
              className="w-8 h-8 bg-[#00E599] rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-black" />
              ) : (
                <Play className="w-4 h-4 text-black ml-0.5" />
              )}
            </button>
            
            {/* Skip Forward */}
            <button 
              onClick={skipForward}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
              title="Skip forward 10s"
            >
              <SkipForward className="w-4 h-4 text-white" />
            </button>
            
            {/* Time Display */}
            <div className="text-sm text-white font-mono ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Volume Control */}
            <div className="flex items-center gap-2 group">
              <button 
                onClick={toggleMute}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-[#333] rounded-full appearance-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `linear-gradient(to right, #00E599 0%, #00E599 ${(isMuted ? 0 : volume) * 100}%, #333 ${(isMuted ? 0 : volume) * 100}%, #333 100%)`
                }}
              />
            </div>
            
            {/* Fullscreen */}
            <button 
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
              title="Fullscreen"
            >
              <Maximize className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
