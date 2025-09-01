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
  college_id?: number;
  college_name?: string;
  is_donor?: boolean;
  attendees?: any[];
}

interface AuthContextType {
  user: User | null;
  bookings: Booking[];
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string; message?: string }>;
  signup: (credentials: SignupCredentials) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  refreshBookings: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  retryAuth: () => Promise<void>;
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

  // Fetch user bookings from API
  const fetchBookings = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, cannot fetch bookings');
        return [];
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/bookings`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 401) {
        console.log('Token expired, clearing auth data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setBookings([]);
        return [];
      }

      if (!response.ok) {
        console.error('Failed to fetch bookings:', response.status);
        return [];
      }

      const data = await response.json();
      
      if (data.success && data.bookings) {
        // Transform time_slot to timeSlot for consistency
        const transformedData = data.bookings.map((booking: any) => ({
          ...booking,
          timeSlot: booking.time_slot
        }));
        return transformedData;
      }

      return [];
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

  // Retry authentication
  const retryAuth = async () => {
    setIsLoading(true);
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
      console.error('Error retrying auth:', error);
      setUser(null);
      setBookings([]);
    } finally {
      setIsLoading(false);
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
    isAdmin: user?.role === 'admin',
    isLoading,
    refreshBookings,
    refreshProfile,
    retryAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};