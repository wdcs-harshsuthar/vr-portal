import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { loginUser, signupUser, logoutUser, getCurrentUser, User } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  bookings: any[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  refreshBookings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          await loadUserBookings(currentUser.id);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const loadUserBookings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setBookings(data);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await loginUser({ email, password });

      if (result.success && result.user) {
        setUser(result.user);
        await loadUserBookings(result.user.id);
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const result = await signupUser({ email, password, name });

      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Signup failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Starting logout process...');
      
      // Clear user state immediately
      setUser(null);
      setBookings([]);
      
      // Call logout function to clear server-side session
      await logoutUser();
      
      console.log('Logout completed, redirecting to login...');
      
      // Force redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state and redirect
      setUser(null);
      setBookings([]);
      window.location.href = '/login';
    }
  };

  const refreshBookings = async () => {
    if (user) {
      await loadUserBookings(user.id);
    }
  };

  const value: AuthContextType = {
    user,
    bookings,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
    refreshBookings,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};