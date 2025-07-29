"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  _id: string;
  username: string;
  email: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  userId: string;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const defaultUserId = "687b4efb1d70870c9bb31e60"; // Fallback user ID

  // Use a state to track if we're on the client
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect only runs on the client
    setIsClient(true);

    // Only access localStorage on the client side
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("musicPlayerUser");
      const token = localStorage.getItem("musicPlayerToken");

      if (storedUser && token) {
        try {
          // Verify token with backend
          const verifyToken = async () => {
            try {
              const response = await fetch(
                "http://localhost:8000/api/auth/verify",
                {
                  headers: { Authorization: `Bearer ${token}` },
                  credentials: "include",
                }
              );

              if (response.ok) {
                setUser(JSON.parse(storedUser));
              } else {
                // Token is invalid, clear storage
                localStorage.removeItem("musicPlayerUser");
                localStorage.removeItem("musicPlayerToken");
                setUser(null);
              }
            } catch (error) {
              console.error("Error verifying token:", error);
              localStorage.removeItem("musicPlayerUser");
              localStorage.removeItem("musicPlayerToken");
              setUser(null);
            }
          };

          verifyToken();
        } catch (error) {
          console.error("Error parsing stored user:", error);
          localStorage.removeItem("musicPlayerUser");
          localStorage.removeItem("musicPlayerToken");
          setUser(null);
        }
      } else {
        // No stored user or token
        setUser(null);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important for cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data: AuthResponse = await response.json();
      setUser(data.user);

      // Store in localStorage
      localStorage.setItem("musicPlayerUser", JSON.stringify(data.user));
      localStorage.setItem("musicPlayerToken", data.token);

      // Also set a cookie for server-side access
      document.cookie = `musicPlayerToken=${
        data.token
      }; path=/; sameSite=lax; ${
        window.location.protocol === "https:" ? "secure;" : ""
      }`;
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const data: AuthResponse = await response.json();
      setUser(data.user);
      localStorage.setItem("musicPlayerUser", JSON.stringify(data.user));
      localStorage.setItem("musicPlayerToken", data.token);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("musicPlayerToken");

      await fetch("http://localhost:8000/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("musicPlayerUser");
      localStorage.removeItem("musicPlayerToken");
    }
  };

  // Initialize user from localStorage or set default
  useEffect(() => {
    const initializeUser = async () => {
      const storedUser = localStorage.getItem("musicPlayerUser");
      const token = localStorage.getItem("musicPlayerToken");

      if (storedUser && token) {
        try {
          // Verify token with backend
          const response = await fetch(
            "http://localhost:8000/api/auth/verify",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.ok) {
            setUser(JSON.parse(storedUser));
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem("musicPlayerUser");
            localStorage.removeItem("musicPlayerToken");
          }
        } catch (error) {
          console.error("Error verifying token:", error);
          localStorage.removeItem("musicPlayerUser");
          localStorage.removeItem("musicPlayerToken");
        }
      }
    };

    initializeUser();
  }, []);

  const value: UserContextType = {
    user,
    setUser,
    userId: user?._id || defaultUserId,
    login,
    register,
    logout,
    loading,
    error,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
