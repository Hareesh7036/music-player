"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Heart,
  Shuffle,
  Repeat,
} from "lucide-react";
import { useLikedSongs } from "../hooks/useLikedSongs";

interface Song {
  _id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  filePath: string;
  coverImage?: string;
}

interface MusicPlayerProps {
  currentSong: Song | null;
  playlist: Song[];
  onNext: () => void;
  onPrevious: () => void;
  onSongEnd: () => void;
}

export default function MusicPlayer({
  currentSong,
  playlist,
  onNext,
  onPrevious,
  onSongEnd,
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"none" | "one" | "all">("none");
  const [likingState, setLikingState] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Like functionality
  const { toggleLike, isLiked } = useLikedSongs();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.play();
    setIsPlaying(true);
  }, [currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      onSongEnd();
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onSongEnd]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current || !currentSong) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const newTime = (parseFloat(e.target.value) / 100) * currentSong.duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLikeToggle = async (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!currentSong) return;

    setLikingState(true);

    try {
      const result = await toggleLike(currentSong._id);
      if (!result.success) {
        console.error("Failed to toggle like:", result.error);
        // You could add a toast notification here
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLikingState(false);
    }
  };

  const progress = currentSong ? (currentTime / currentSong.duration) * 100 : 0;

  if (!currentSong) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4">
        <div className="text-center text-gray-400">
          Select a song to start playing
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 shadow-2xl">
      <audio
        ref={audioRef}
        src={`http://localhost:8000${currentSong.filePath}`}
        onLoadedData={() => setCurrentTime(0)}
      />

      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Song Info */}
        <div className="flex items-center space-x-4 flex-1">
          <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
            {currentSong.coverImage ? (
              <img
                src={`http://localhost:8000${currentSong.coverImage}`}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400 text-xs">No Cover</div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold truncate">{currentSong.title}</h3>
            <p className="text-gray-400 text-sm truncate">
              {currentSong.artist}
            </p>
          </div>
          <button
            onClick={handleLikeToggle}
            disabled={likingState}
            className={`transition-colors ${
              currentSong && isLiked(currentSong._id)
                ? "text-red-500 hover:text-red-400"
                : "text-gray-400 hover:text-white"
            } ${likingState ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Heart
              size={20}
              fill={
                currentSong && isLiked(currentSong._id)
                  ? "currentColor"
                  : "none"
              }
            />
          </button>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center space-y-2 flex-2">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`transition-colors ${
                isShuffle ? "text-green-500" : "text-gray-400 hover:text-white"
              }`}
            >
              <Shuffle size={20} />
            </button>
            <button
              onClick={onPrevious}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <SkipBack size={24} />
            </button>
            <button
              onClick={togglePlay}
              className="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              onClick={onNext}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <SkipForward size={24} />
            </button>
            <button
              onClick={() =>
                setRepeatMode(
                  repeatMode === "none"
                    ? "all"
                    : repeatMode === "all"
                    ? "one"
                    : "none"
                )
              }
              className={`transition-colors ${
                repeatMode !== "none"
                  ? "text-green-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Repeat size={20} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2 w-full max-w-md">
            <span className="text-xs text-gray-400">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-xs text-gray-400">
              {formatTime(currentSong.duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2 flex-1 justify-end">
          <Volume2 size={20} className="text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>
    </div>
  );
}
