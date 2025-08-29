import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

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
  const [isLoading, setIsLoading] = useState(true); // Start with true to check session

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          setUser(null);
          setBookings([]);
        } else if (session?.user) {
          console.log('Found existing session:', session.user.id);
          const userData: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role: 'user'
          };
          setUser(userData);
          await loadUserBookings(userData.id);
        } else {
          console.log('No existing session found');
          setUser(null);
          setBookings([]);
        }
      } catch (error) {
        console.error('Session check error:', error);
        setUser(null);
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const userData: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: 'user'
        };
        setUser(userData);
        await loadUserBookings(userData.id);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        setBookings([]);
      }
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const loadUserBookings = async (userId: string) => {
    try {
      console.log('Loading bookings for user:', userId);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading bookings:', error);
      } else {
        console.log('Loaded bookings:', data?.length || 0);
        setBookings(data || []);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
      }

      console.log('Login successful:', data.user?.id);
      return { success: true };
    } catch (error) {
      console.error('Login catch error:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        return { success: false, error: error.message };
      }

      console.log('Signup successful:', data.user?.id);
      return { success: true };
    } catch (error) {
      console.error('Signup catch error:', error);
      return { success: false, error: 'Signup failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user...');
      setIsLoading(true);
      
      // Clear local state first
      setUser(null);
      setBookings([]);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
      } else {
        console.log('Logout successful');
      }
    } catch (error) {
      console.error('Logout catch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBookings = async () => {
    if (user?.id) {
      console.log('Refreshing bookings for user:', user.id);
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
    isAdmin: false,
    isLoading,
    refreshBookings,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};