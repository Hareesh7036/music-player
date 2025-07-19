"use client";

import React, { useState, useEffect } from "react";
import { Heart, Play, Pause, MoreHorizontal, Clock } from "lucide-react";
import { useLikedSongs } from "../hooks/useLikedSongs";

interface Song {
  _id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  filePath: string;
  coverImage?: string;
  playCount: number;
  createdAt: string;
}

interface LikedSongsProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onSongSelect: (song: Song) => void;
  onTogglePlay: () => void;
}

export default function LikedSongs({
  currentSong,
  isPlaying,
  onSongSelect,
  onTogglePlay,
}: LikedSongsProps) {
  const { getLikedSongs, toggleLike, isLiked } = useLikedSongs();
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likingStates, setLikingStates] = useState<{ [key: string]: boolean }>(
    {}
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleLikeToggle = async (songId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    setLikingStates((prev) => ({ ...prev, [songId]: true }));

    try {
      const result = await toggleLike(songId);
      if (result.success) {
        // Remove the song from the liked songs list if it was unliked
        if (!result.isLiked) {
          setLikedSongs((prev) => prev.filter((song) => song._id !== songId));
        }
      } else {
        console.error("Failed to toggle like:", result.error);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLikingStates((prev) => ({ ...prev, [songId]: false }));
    }
  };

  const fetchLikedSongs = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getLikedSongs();
      if (result.success) {
        setLikedSongs(result.data || []);
      } else {
        setError(result.error || "Failed to fetch liked songs");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedSongs();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 text-white rounded-lg p-8">
        <div className="flex items-center justify-center">
          hj
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-3">Loading your liked songs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 text-white rounded-lg p-8">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium mb-2">
            Error loading liked songs
          </h3>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button
            onClick={fetchLikedSongs}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-b from-red-600 to-red-800">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
            <Heart size={32} fill="white" className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Liked Songs</h1>
            <p className="text-red-200 mt-1">{likedSongs.length} songs</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      {likedSongs.length > 0 && (
        <div className="p-6 border-b border-gray-700">
          <button
            onClick={() => onSongSelect(likedSongs[0])}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-medium transition-colors flex items-center space-x-2"
          >
            <Play size={20} fill="white" />
            <span>Play</span>
          </button>
        </div>
      )}

      {/* Song List Header */}
      {likedSongs.length > 0 && (
        <div className="grid grid-cols-12 gap-4 p-4 text-gray-400 text-sm font-medium border-b border-gray-700">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Album</div>
          <div className="col-span-2">Date Added</div>
          <div className="col-span-1">
            <Clock size={16} />
          </div>
          <div className="col-span-1"></div>
        </div>
      )}

      {/* Song List */}
      <div className="max-h-96 overflow-y-auto">
        {likedSongs.map((song, index) => {
          const isCurrentSong = currentSong?._id === song._id;

          return (
            <div
              key={song._id}
              className={`grid grid-cols-12 gap-4 p-3 hover:bg-gray-800 transition-colors group cursor-pointer ${
                isCurrentSong ? "bg-gray-800" : ""
              }`}
              onClick={() => onSongSelect(song)}
            >
              {/* Track Number / Play Button */}
              <div className="col-span-1 flex items-center">
                {isCurrentSong && isPlaying ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePlay();
                    }}
                    className="text-green-500 hover:text-green-400"
                  >
                    <Pause size={16} />
                  </button>
                ) : isCurrentSong ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePlay();
                    }}
                    className="text-green-500 hover:text-green-400"
                  >
                    <Play size={16} />
                  </button>
                ) : (
                  <div className="relative">
                    <span className="text-gray-400 group-hover:hidden">
                      {index + 1}
                    </span>
                    <Play
                      size={16}
                      className="text-white hidden group-hover:block absolute top-0 left-0"
                    />
                  </div>
                )}
              </div>

              {/* Song Info */}
              <div className="col-span-5 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                  {song.coverImage ? (
                    <img
                      src={`http://localhost:8000${song.coverImage}`}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-500 text-xs">♪</div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4
                    className={`font-medium truncate ${
                      isCurrentSong ? "text-green-500" : "text-white"
                    }`}
                  >
                    {song.title}
                  </h4>
                  <p className="text-gray-400 text-sm truncate">
                    {song.artist}
                  </p>
                </div>
              </div>

              {/* Album */}
              <div className="col-span-2 flex items-center">
                <span className="text-gray-400 text-sm truncate">
                  {song.album || "Unknown Album"}
                </span>
              </div>

              {/* Date Added */}
              <div className="col-span-2 flex items-center">
                <span className="text-gray-400 text-sm">
                  {formatDate(song.createdAt)}
                </span>
              </div>

              {/* Duration */}
              <div className="col-span-1 flex items-center">
                <span className="text-gray-400 text-sm">
                  {formatTime(song.duration)}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-1 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className={`p-1 transition-colors text-red-500 hover:text-red-400 ${
                    likingStates[song._id]
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={(e) => handleLikeToggle(song._id, e)}
                  disabled={likingStates[song._id]}
                  title="Remove from favorites"
                >
                  <Heart size={16} fill="currentColor" />
                </button>
                <button className="text-gray-400 hover:text-white p-1 ml-1">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {likedSongs.length === 0 && (
        <div className="p-8 text-center text-gray-400">
          <div className="text-6xl mb-4">💔</div>
          <h3 className="text-lg font-medium mb-2">No liked songs yet</h3>
          <p className="text-sm">
            Songs you like will appear here. Start by clicking the heart icon on
            any song!
          </p>
        </div>
      )}
    </div>
  );
}
