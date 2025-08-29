import { createClient } from 'npm:@supabase/supabase-js@2';
import { verify } from 'npm:jsonwebtoken@9.0.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface VerifyRequest {
  token: string;
}

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-super-secret-jwt-key-change-in-production';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { token }: VerifyRequest = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify JWT token
    let decoded: JWTPayload;
    try {
      decoded = verify(token, JWT_SECRET) as JWTPayload;
    } catch (jwtError) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user data from database to ensure user still exists and is active
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, role, is_active')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found or inactive' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if role has changed since token was issued
    if (user.role !== decoded.role) {
      return new Response(
        JSON.stringify({ 
          error: 'Token invalid due to role change. Please login again.',
          requiresReauth: true 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({
        valid: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        permissions: {
          isAdmin: user.role === 'admin',
          canManageUsers: user.role === 'admin',
          canViewAllBookings: user.role === 'admin'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Token verification error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});