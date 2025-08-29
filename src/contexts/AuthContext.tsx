import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  loginUser, 
  signupUser, 
  logoutUser, 
  getCurrentUser,
  type LoginCredentials, 
  type SignupCredentials 
} from '../lib/auth';

interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

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
  bookings: Booking[];
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string; message?: string }>;
  signup: (credentials: SignupCredentials) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshBookings: () => Promise<void>;
  refreshProfile: () => Promise<void>;
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user bookings
  const fetchBookings = async (userId: string) => {
    try {
      const { data, error } = await import('../lib/supabase').then(m => m.supabase)
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
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          const userBookings = await fetchBookings(currentUser.id);
          setBookings(userBookings);
        } else {
          setUser(null);
          setBookings([]);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
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
      setBookings([]);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const value: AuthContextType = {
    user,
    bookings,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isLoading,
    refreshBookings,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};