import { useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import { useLikedSongsContext } from '../contexts/LikedSongsContext';

export interface LikedSongsState {
  likedSongIds: string[];
  isLoading: boolean;
  error: string | null;
}

export const useLikedSongs = () => {
  const { userId } = useUser();
  const { likedSongIds, refreshLikedSongs } = useLikedSongsContext();
  
  // For backward compatibility
  const state = {
    likedSongIds,
    isLoading: false,
    error: null
  };

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
        // Refresh the liked songs list from the server
        await refreshLikedSongs();
        return { success: true, isLiked: result.data.isLiked, message: result.data.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }, [userId, refreshLikedSongs]);

  // Check if a song is liked
  const isLiked = useCallback((songId: string) => {
    return likedSongIds.includes(songId);
  }, [likedSongIds]);

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

  return {
    likedSongIds,
    isLoading: state.isLoading,
    error: state.error,
    toggleLike,
    isLiked,
    getLikedSongs,
    refetch: refreshLikedSongs
  };
};
