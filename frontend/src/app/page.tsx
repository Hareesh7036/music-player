"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import SongList from "@/components/SongList";
import MusicPlayer from "@/components/MusicPlayer";
import LikedSongs from "@/components/LikedSongs";
import { Search, Upload } from "lucide-react";
import { useRef } from "react";

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

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeView, setActiveView] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [repeatMode, setRepeatMode] = useState<"none" | "one" | "all">("none");
  const [shuffleMode, setShuffleMode] = useState(false);

  // Fetch songs from API
  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/api/songs");
      if (response.data.success) {
        setSongs(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch songs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSongSelect = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    // Increment play count
    incrementPlayCount(song._id);
  };

  const incrementPlayCount = async (songId: string) => {
    try {
      await axios.patch(`http://localhost:8000/api/songs/${songId}/play`);
      // Update local state
      setSongs((prevSongs) =>
        prevSongs.map((song) =>
          song._id === songId
            ? { ...song, playCount: song.playCount + 1 }
            : song
        )
      );
    } catch (error) {
      console.error("Failed to increment play count:", error);
    }
  };

  const handleNext = () => {
    if (!currentSong || songs.length === 0) return;

    const currentIndex = songs.findIndex(
      (song) => song._id === currentSong._id
    );
    let nextIndex;
    if (shuffleMode) {
      nextIndex = Math.floor(Math.random() * songs.length);
    } else {
      if (currentIndex === songs.length - 1) {
        // If it's the last song
        if (repeatMode === "all") {
          // If repeat all is on, go to the first song
          nextIndex = 0;
        } else {
          // In repeat one mode, stay on the current song
          return;
        }
      } else {
        // Go to the next song
        nextIndex = currentIndex + 1;
      }
    }
    // Play the next song
    handleSongSelect(songs[nextIndex]);
  };

  const handlePrevious = () => {
    if (!currentSong || songs.length === 0) return;

    const currentIndex = songs.findIndex(
      (song) => song._id === currentSong._id
    );
    let prevIndex;
    if (shuffleMode) {
      prevIndex = Math.floor(Math.random() * songs.length);
    } else {
      prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    }
    handleSongSelect(songs[prevIndex]);
  };

  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSongEnd = () => {
    if (!currentSong) return;

    const currentIndex = songs.findIndex(
      (song) => song._id === currentSong._id
    );
    const isLastSong = currentIndex === songs.length - 1;

    if (isLastSong && repeatMode !== "all") {
      // If it's the last song and repeat is off, stop playback
      setIsPlaying(false);
      return;
    }

    // Calculate next song index
    let nextIndex;
    if (isLastSong && repeatMode === "all") {
      // If it's the last song and repeat all is on, go to first song
      nextIndex = 0;
    } else {
      // Otherwise go to next song
      if (shuffleMode) {
        nextIndex = Math.floor(Math.random() * songs.length);
      } else {
        nextIndex = currentIndex + 1;
      }
    }

    // If we have a valid next song, play it
    if (songs[nextIndex]) {
      handleSongSelect(songs[nextIndex]);
    } else {
      // If no next song and not repeating, stop playback
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.album &&
        song.album.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderContent = () => {
    switch (activeView) {
      case "liked":
        return (
          <div className="space-y-6">
            <LikedSongs
              currentSong={currentSong}
              isPlaying={isPlaying}
              onSongSelect={handleSongSelect}
              onTogglePlay={togglePlay}
            />
          </div>
        );
      case "search":
        return (
          <div className="space-y-6">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search for songs, artists, or albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <SongList
              songs={filteredSongs}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onSongSelect={handleSongSelect}
              onTogglePlay={togglePlay}
            />
          </div>
        );
      case "library":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Your Library</h2>
            <SongList
              songs={songs}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onSongSelect={handleSongSelect}
              onTogglePlay={togglePlay}
            />
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Hello Buddy!</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-white text-lg">Loading songs...</div>
              </div>
            ) : (
              <SongList
                songs={songs}
                currentSong={currentSong}
                isPlaying={isPlaying}
                onSongSelect={handleSongSelect}
                onTogglePlay={togglePlay}
              />
            )}
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex">
      {/* Sidebar */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 pb-32 overflow-hidden">
          {renderContent()}
        </main>

        {/* Music Player */}
        <div className="relative">
          <MusicPlayer
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            currentSong={currentSong}
            playlist={songs}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSongEnd={handleSongEnd}
            isFirstSong={
              currentSong
                ? songs.findIndex((s) => s._id === currentSong._id) === 0
                : true
            }
            isLastSong={
              currentSong
                ? songs.findIndex((s) => s._id === currentSong._id) ===
                  songs.length - 1
                : true
            }
            repeatMode={repeatMode}
            onRepeatModeChange={setRepeatMode}
            shuffleMode={shuffleMode}
            onShuffleModeChange={setShuffleMode}
          />
        </div>
      </div>
    </div>
  );
}
