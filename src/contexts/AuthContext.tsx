import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { getUserBookings, type Booking } from '../lib/bookings';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at?: string;
  updated_at?: string;
}

interface UserPermissions {
  isAdmin: boolean;
  canManageUsers: boolean;
  canViewAllBookings: boolean;
}

interface AuthContextType {
  user: User | null;
  permissions: UserPermissions | null;
  bookings: Booking[];
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
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role: 'user'
          };
          
          setUser(userData);
          setPermissions({
            isAdmin: false,
            canManageUsers: false,
            canViewAllBookings: false
          });

          // Load bookings
          const result = await getUserBookings(userData.id);
          if (result.success) {
            setBookings(result.bookings || []);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userData: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: 'user'
        };
        
        setUser(userData);
        setPermissions({
          isAdmin: false,
          canManageUsers: false,
          canViewAllBookings: false
        });

        // Load bookings
        const result = await getUserBookings(userData.id);
        if (result.success) {
          setBookings(result.bookings || []);
        }
        
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setPermissions(null);
        setBookings([]);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
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
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Signup failed' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshBookings = async () => {
    if (user) {
      const result = await getUserBookings(user.id);
      if (result.success) {
        setBookings(result.bookings || []);
      }
    }
  };

  const value: AuthContextType = {
    user,
    permissions,
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