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
  role: string;
  created_at: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const getCurrentUser = async (): Promise<User | null> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
  }
  
  try {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      localStorage.removeItem('token');
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    localStorage.removeItem('token');
    return null;
  }
};

export const signupUser = async (
  credentials: SignupCredentials
): Promise<{ success: boolean; user?: User; message?: string; error?: string }> => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Signup failed' };
    }

    // Store token and user data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return { success: true, user: data.user, message: data.message };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

export const loginUser = async (
  credentials: LoginCredentials
): Promise<{ success: boolean; user?: User; message?: string; error?: string }> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Login failed' };
    }

    // Store token and user data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    // If user is admin, also store admin tokens
    if (data.user.role === 'admin') {
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
    }

    return { success: true, user: data.user, message: data.message };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

export const logoutUser = async () => {
  const token = localStorage.getItem('token');
  
  if (token) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  // Clear local storage (including admin tokens)
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};