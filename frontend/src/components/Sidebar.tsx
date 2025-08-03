"use client";

import React from "react";
import {
  Home,
  Search,
  Library,
  Plus,
  Heart,
  Music,
  Headphones,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const router = useRouter();
  const { logout } = useUser();

  const handleLogout = () => {
    try {
      logout();
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie =
          c.trim().split("=")[0] +
          "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
      });
      window.location.href = "/login";
      window.location.reload();
    }
  };
  const menuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "search", label: "Search", icon: Search },
    { id: "library", label: "Your Library", icon: Library },
  ];

  const playlistItems = [
    { id: "liked", label: "Liked Songs", icon: Heart },
    { id: "recently-played", label: "Recently Played", icon: Headphones },
  ];

  return (
    <div className="w-64 bg-black text-white h-full flex flex-col pb-20">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <Music className="text-green-500" size={32} />
          <h1 className="text-xl font-bold">MusicPlayer</h1>
        </div>
      </div>

      <nav className="px-3">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    activeView === item.id
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3 mt-6">
        <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
          <Plus size={20} />
          <span className="font-medium">Create Playlist</span>
        </button>
      </div>

      <div className="px-3 mt-6">
        <ul className="space-y-2">
          {playlistItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    activeView === item.id
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-auto border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>

        <div className="p-4">
          <div className="text-xs text-gray-400">
            <p>Music Player v1.0</p>
            <p className="mt-1">Built with Next.js & Elysia</p>
          </div>
        </div>
      </div>
    </div>
  );
}
