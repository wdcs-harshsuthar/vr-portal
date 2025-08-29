import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { getUserBookings, type Booking } from '../lib/bookings';
import { 
  loginUser, 
  signupUser, 
  logoutUser, 
  getCurrentUser,
  getUserPermissions,
  type LoginCredentials, 
  type SignupCredentials,
  type User,
  type UserPermissions
} from '../lib/auth';

interface Booking {
  user: User | null;
  permissions: UserPermissions | null;
  bookings: Booking[];
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string; message?: string }>;
  signup: (credentials: SignupCredentials) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  refreshBookings: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
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

  // Fetch user bookings
  const fetchBookings = async (userId: string) => {
    try {
      const result = await getUserBookings(userId);
      return result.success ? result.bookings || [] : [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  };

  // Refresh user permissions
  const refreshPermissions = async () => {
    const userPermissions = await getUserPermissions();
    setPermissions(userPermissions);
  };

  // Refresh bookings
  const refreshBookings = async () => {
    if (user) {
      const result = await getUserBookings(user.id);
      if (result.success) {
        setBookings(result.bookings || []);
      }
    }
  };

  // Refresh user profile
  const refreshProfile = async () => {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      await refreshPermissions();
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          
          // Get user permissions
          const userPermissions = await getUserPermissions();
          setPermissions(userPermissions);
          
          // Fetch user bookings
          const userBookings = await fetchBookings(currentUser.id);
          setBookings(userBookings);
        } else {
          setUser(null);
          setPermissions(null);
          setBookings([]);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setPermissions(null);
        setBookings([]);
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
          role: 'user',
          created_at: session.user.created_at,
          updated_at: session.user.updated_at
        };
        
        setUser(userData);
        
        const userPermissions = await getUserPermissions();
        setPermissions(userPermissions);
        
        const userBookings = await fetchBookings(userData.id);
        setBookings(userBookings);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setPermissions(null);
        setBookings([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const result = await loginUser(credentials);
      return result;
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    try {
      const result = await signupUser(credentials);
      return result;
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Error logging out:', error);
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
    isAdmin: permissions?.isAdmin || false,
    isLoading,
    refreshBookings,
    refreshProfile,
    refreshPermissions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};