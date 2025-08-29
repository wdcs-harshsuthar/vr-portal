import { supabase } from './supabase';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
}

export interface UserPermissions {
  isAdmin: boolean;
  canManageUsers: boolean;
  canViewAllBookings: boolean;
}

// Hash password function
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    
    if (error || !authUser) {
      return null;
    }

    return {
      id: authUser.id,
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      email: authUser.email || '',
      role: 'user',
      created_at: authUser.created_at,
      updated_at: authUser.updated_at
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const getUserPermissions = async (): Promise<UserPermissions | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    return {
      isAdmin: user.role === 'admin',
      canManageUsers: user.role === 'admin',
      canViewAllBookings: user.role === 'admin'
    };
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return null;
  }
};

export const signupUser = async (credentials: SignupCredentials): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name,
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Failed to create account' };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        name: credentials.name,
        email: credentials.email,
        role: 'user'
      },
      message: 'Account created successfully'
    };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Login failed' };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
        email: data.user.email || '',
        role: 'user'
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Admin functions - simplified for now
export const getAllUsers = async (page = 1, limit = 10) => {
  // Return mock data for now since we're using Supabase Auth
  return {
    users: [],
    pagination: {
      page,
      limit,
      total: 0,
      totalPages: 0
    }
  };
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  return { success: true, user: null };
};

export const deactivateUser = async (userId: string) => {
  return { success: true, message: 'User deactivated successfully' };
};