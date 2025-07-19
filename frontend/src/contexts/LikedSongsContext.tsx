"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useUser } from './UserContext';

interface LikedSongsContextType {
  likedSongIds: string[];
  refreshLikedSongs: () => Promise<void>;
}

const LikedSongsContext = createContext<LikedSongsContextType | undefined>(undefined);

export const LikedSongsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userId } = useUser();
  const [likedSongIds, setLikedSongIds] = React.useState<string[]>([]);

  const fetchLikedSongs = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/likes/ids/${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setLikedSongIds(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch liked songs:', error);
    }
  };

  // Initial fetch
  React.useEffect(() => {
    if (userId) {
      fetchLikedSongs();
    }
  }, [userId]);

  return (
    <LikedSongsContext.Provider value={{ likedSongIds, refreshLikedSongs: fetchLikedSongs }}>
      {children}
    </LikedSongsContext.Provider>
  );
};

export const useLikedSongsContext = () => {
  const context = useContext(LikedSongsContext);
  if (context === undefined) {
    throw new Error('useLikedSongsContext must be used within a LikedSongsProvider');
  }
  return context;
};
