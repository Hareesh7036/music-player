'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  _id: string;
  username: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  userId: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // For now, we'll use a default user ID for demo purposes
  // In a real app, this would come from authentication
  const defaultUserId = '687b4efb1d70870c9bb31e60'; // Valid MongoDB ObjectId from backend

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('musicPlayerUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Set default user if parsing fails
        const defaultUser: User = {
          _id: defaultUserId,
          username: 'Demo User',
          email: 'demo@musicplayer.com'
        };
        setUser(defaultUser);
        localStorage.setItem('musicPlayerUser', JSON.stringify(defaultUser));
      }
    } else {
      // Set default user if none exists
      const defaultUser: User = {
        _id: defaultUserId,
        username: 'Demo User',
        email: 'demo@musicplayer.com'
      };
      setUser(defaultUser);
      localStorage.setItem('musicPlayerUser', JSON.stringify(defaultUser));
    }
  }, []);

  // Update localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('musicPlayerUser', JSON.stringify(user));
    }
  }, [user]);

  const value: UserContextType = {
    user,
    setUser,
    userId: user?._id || defaultUserId
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
