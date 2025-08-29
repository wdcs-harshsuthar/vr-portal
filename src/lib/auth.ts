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
  created_at: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

if (!SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL environment variable is not set');
}

export const getCurrentUser = async (): Promise<User | null> => {
  const sessionToken = localStorage.getItem('sessionToken');
  const userData = localStorage.getItem('user');
  
  if (!sessionToken || !userData) {
    return null;
  }
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('user');
    return null;
  }
};

export const signupUser = async (name: string, email: string, password: string) => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ 
      name: credentials.name, 
      email: credentials.email, 
      password: credentials.password 
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Signup failed');
  }

  // Store user data and session token
  localStorage.setItem('sessionToken', data.sessionToken);
  localStorage.setItem('user', JSON.stringify(data.user));

  return data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  // Store user data and session token
  localStorage.setItem('sessionToken', data.sessionToken);
  localStorage.setItem('user', JSON.stringify(data.user));

  return data;
};

export const logoutUser = async () => {
  const sessionToken = localStorage.getItem('sessionToken');
  if (!sessionToken) return;

  try {
    await fetch(`${SUPABASE_URL}/functions/v1/auth-logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ sessionToken }),
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('user');
  }
};