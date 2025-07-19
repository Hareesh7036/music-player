import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';

export interface LikedSongsState {
  likedSongIds: string[];
  isLoading: boolean;
  error: string | null;
}

export const useLikedSongs = () => {
  const { userId } = useUser();
  const [state, setState] = useState<LikedSongsState>({
    likedSongIds: [],
    isLoading: true,
    error: null
  });

  // Fetch liked song IDs for the user
  const fetchLikedSongs = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch(`http://localhost:8000/api/likes/ids/${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          likedSongIds: result.data || [],
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to fetch liked songs',
          isLoading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      }));
    }
  }, [userId]);

  // Toggle like status for a song
  const toggleLike = useCallback(async (songId: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/likes/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, songId }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        const isLiked = result.data.isLiked;
        
        setState(prev => ({
          ...prev,
          likedSongIds: isLiked 
            ? [...prev.likedSongIds, songId]
            : prev.likedSongIds.filter(id => id !== songId)
        }));
        
        return { success: true, isLiked, message: result.data.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }, [userId]);

  // Check if a song is liked
  const isLiked = useCallback((songId: string) => {
    return state.likedSongIds.includes(songId);
  }, [state.likedSongIds]);

  // Get all liked songs with full details
  const getLikedSongs = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/likes/user/${userId}`);
      const result = await response.json();
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }, [userId]);

  // Load liked songs on mount
  useEffect(() => {
    fetchLikedSongs();
  }, [fetchLikedSongs]);

  return {
    likedSongIds: state.likedSongIds,
    isLoading: state.isLoading,
    error: state.error,
    toggleLike,
    isLiked,
    getLikedSongs,
    refetch: fetchLikedSongs
  };
};
