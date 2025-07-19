'use client';

import React, { useState } from 'react';
import { Play, Pause, MoreHorizontal, Clock, Heart } from 'lucide-react';
import { useLikedSongs } from '../hooks/useLikedSongs';

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

interface SongListProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onSongSelect: (song: Song) => void;
  onTogglePlay: () => void;
}

export default function SongList({ songs, currentSong, isPlaying, onSongSelect, onTogglePlay }: SongListProps) {
  const { likedSongIds, toggleLike, isLiked, isLoading: likesLoading } = useLikedSongs();
  const [likingStates, setLikingStates] = useState<{ [key: string]: boolean }>({});

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleLikeToggle = async (songId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Set loading state for this specific song
    setLikingStates(prev => ({ ...prev, [songId]: true }));
    
    try {
      const result = await toggleLike(songId);
      if (!result.success) {
        console.error('Failed to toggle like:', result.error);
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      // Remove loading state
      setLikingStates(prev => ({ ...prev, [songId]: false }));
    }
  };

  return (
    <div className="bg-gray-900 text-white rounded-lg overflow-hidden">
      {/* Header */}
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

      {/* Song List */}
      <div className="max-h-96 overflow-y-auto">
        {songs.map((song, index) => {
          const isCurrentSong = currentSong?._id === song._id;
          
          return (
            <div
              key={song._id}
              className={`grid grid-cols-12 gap-4 p-3 hover:bg-gray-800 transition-colors group cursor-pointer ${
                isCurrentSong ? 'bg-gray-800' : ''
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
                  <h4 className={`font-medium truncate ${isCurrentSong ? 'text-green-500' : 'text-white'}`}>
                    {song.title}
                  </h4>
                  <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                </div>
              </div>

              {/* Album */}
              <div className="col-span-2 flex items-center">
                <span className="text-gray-400 text-sm truncate">
                  {song.album || 'Unknown Album'}
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
                  className={`p-1 transition-colors ${
                    isLiked(song._id) 
                      ? 'text-red-500 hover:text-red-400' 
                      : 'text-gray-400 hover:text-white'
                  } ${likingStates[song._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={(e) => handleLikeToggle(song._id, e)}
                  disabled={likingStates[song._id]}
                  title={isLiked(song._id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart 
                    size={16} 
                    fill={isLiked(song._id) ? 'currentColor' : 'none'}
                  />
                </button>
                <button className="text-gray-400 hover:text-white p-1">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {songs.length === 0 && (
        <div className="p-8 text-center text-gray-400">
          <div className="text-4xl mb-4">🎵</div>
          <h3 className="text-lg font-medium mb-2">No songs found</h3>
          <p className="text-sm">Upload some music to get started!</p>
        </div>
      )}
    </div>
  );
}
