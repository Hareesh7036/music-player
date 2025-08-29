"use client";

import React, { useState } from "react";
import { Home, Search, Library, Heart, Music, LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const router = useRouter();
  const { logout } = useUser();
  const [isOpen, setIsOpen] = useState(false);

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

  const playlistItems = [{ id: "liked", label: "Liked Songs", icon: Heart }];

  return (
    <>
      {/* Top Bar (mobile only) */}
      <div className="flex items-center justify-between bg-black text-white px-5 py-4 fixed top-0 left-0 w-full z-50 md:hidden">
        <div className="flex items-center space-x-2">
          <Music className="text-green-500" size={28} />
          <h1 className="text-lg font-bold">MusicPlayer</h1>
        </div>
        {/* Menu toggle button */}
        <button onClick={() => setIsOpen(!isOpen)}>
          <Menu size={28} />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-65 bg-black text-white flex flex-col transform transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
         md:translate-x-0 md:sticky md:top-0 md:h-screen`}
      >
        {/* Sidebar content wrapper (scrollable) */}
        <div className="flex flex-col h-full overflow-y-auto pb-20 md:pb-4 pt-20 md:pt-0">
          {/* Desktop logo */}
          <div className="p-6 hidden md:flex items-center space-x-2">
            <Music className="text-green-500" size={32} />
            <h1 className="text-xl font-bold">MusicPlayer</h1>
          </div>

          <nav className="px-3 mt-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onViewChange(item.id);
                        setIsOpen(false); // auto close after Click
                      }}
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
            <ul className="space-y-2">
              {playlistItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onViewChange(item.id);
                        setIsOpen(false);
                      }}
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

          {/* Footer (sticks to bottom but Scrolls on mobile if needed) */}
          <div className="mt-auto border-t border-gray-800">
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full md:mt-10  flex items-center space-x-3 px-6 py-10 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>

            <div className="px-6 pb-4 md:pb-24">
              <p className="text-xs text-gray-400 md:mt-2">Music Player v1.0</p>
              <p className="text-xs text-gray-400 ">
                Built with Next.js & Elysia
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
