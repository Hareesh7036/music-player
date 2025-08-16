"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useUser } from "./UserContext";

interface LikedSongsContextType {
  likedSongIds: string[];
  refreshLikedSongs: () => Promise<void>;
}

const LikedSongsContext = createContext<LikedSongsContextType | undefined>(
  undefined
);

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const LikedSongsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { userId } = useUser();
  const [likedSongIds, setLikedSongIds] = React.useState<string[]>([]);

  const fetchLikedSongs = React.useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/likes/ids/${userId}`);
      const result = await response.json();

      if (result.success) {
        setLikedSongIds(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch liked songs:", error);
    }
  }, [userId]);

  // Initial fetch
  React.useEffect(() => {
    if (userId) {
      fetchLikedSongs();
    }
  }, [userId, fetchLikedSongs]);

  return (
    <LikedSongsContext.Provider
      value={{ likedSongIds, refreshLikedSongs: fetchLikedSongs }}
    >
      {children}
    </LikedSongsContext.Provider>
  );
};

export const useLikedSongsContext = () => {
  const context = useContext(LikedSongsContext);
  if (context === undefined) {
    throw new Error(
      "useLikedSongsContext must be used within a LikedSongsProvider"
    );
  }
  return context;
};
