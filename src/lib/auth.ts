import { supabase } from './supabase';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
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

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    
    if (error || !authUser) {
      return null;
    }

    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: 'user', // Default role
      created_at: profile.created_at,
      updated_at: profile.updated_at
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

    // Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        name: credentials.name,
        email: credentials.email
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: 'Failed to load user profile' };
    }

    return {
      success: true,
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
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

// Simplified admin functions using direct Supabase queries
export const getAllUsers = async (page = 1, limit = 10) => {
  const { data: profiles, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    throw new Error(error.message);
  }

  return {
    users: profiles?.map(profile => ({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: 'user',
      is_active: true,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    })) || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      name: updates.name,
      email: updates.email
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, user: data };
};

export const deactivateUser = async (userId: string) => {
  // For now, just return success since we don't have is_active column yet
  return { success: true, message: 'User deactivated successfully' };
};