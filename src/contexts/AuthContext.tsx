import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { 
  loginUser, 
  signupUser, 
  logoutUser, 
  getCurrentUser,
  getUserPermissions,
  getAuthToken,
  type LoginCredentials, 
  type SignupCredentials,
  type User,
  type UserPermissions
} from '../lib/auth';

interface Booking {
  id: string;
  user_id: string;
  date: string;
  location: string;
  time_slot: string;
  timeSlot?: string;
  participants: number;
  donation_tickets: number;
  total_cost: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
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
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        return [];
      }

      // Transform time_slot to timeSlot for consistency
      const transformedData = (data || []).map(booking => ({
        ...booking,
        timeSlot: booking.time_slot
      }));

      return transformedData;
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
      const userBookings = await fetchBookings(user.id);
      setBookings(userBookings);
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
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const result = await loginUser(credentials);
      if (result.success && result.user) {
        setUser(result.user);
        
        // Get user permissions
        const userPermissions = await getUserPermissions();
        setPermissions(userPermissions);
        
        // Fetch user bookings
        const userBookings = await fetchBookings(result.user.id);
        setBookings(userBookings);
      }
      return result;
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    try {
      const result = await signupUser(credentials);
      if (result.success && result.user) {
        setUser(result.user);
        
        // Get user permissions
        const userPermissions = await getUserPermissions();
        setPermissions(userPermissions);
        
        // Fetch user bookings (will be empty for new users)
        const userBookings = await fetchBookings(result.user.id);
        setBookings(userBookings);
      }
      return result;
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setPermissions(null);
      setBookings([]);
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