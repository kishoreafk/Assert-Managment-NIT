"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, AuthContextType } from "@/types";
import { login as apiLogin, logout as apiLogout } from "@/lib/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const initializeAuth = () => {
      try {
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (userData && token) {
          try {
            const user = JSON.parse(userData);
            setUser(user);
            setIsAuthenticated(true);
          } catch (parseError) {
            console.error("Error parsing user data:", parseError);
            // Clear corrupted data
            localStorage.removeItem("user");
            localStorage.removeItem("token");
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear all auth data on error
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
