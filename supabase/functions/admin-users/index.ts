import { createClient } from 'npm:@supabase/supabase-js@2';
import { verify } from 'npm:jsonwebtoken@9.0.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-super-secret-jwt-key-change-in-production';

async function verifyAdminToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);
  const decoded = verify(token, JWT_SECRET) as JWTPayload;
  
  if (decoded.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return decoded;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    await verifyAdminToken(authHeader);

    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    switch (req.method) {
      case 'GET':
        // Get all users or specific user
        if (userId) {
          const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, role, is_active, created_at, updated_at')
            .eq('id', userId)
            .single();

          if (error) {
            return new Response(
              JSON.stringify({ error: 'User not found' }),
              { 
                status: 404, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }

          return new Response(
            JSON.stringify({ user }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // Get all users with pagination
          const page = parseInt(url.searchParams.get('page') || '1');
          const limit = parseInt(url.searchParams.get('limit') || '10');
          const offset = (page - 1) * limit;

          const { data: users, error, count } = await supabase
            .from('users')
            .select('id, name, email, role, is_active, created_at, updated_at', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

          if (error) {
            throw error;
          }

          return new Response(
            JSON.stringify({ 
              users: users || [],
              pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
              }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'PUT':
        // Update user
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'User ID is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const updateData = await req.json();
        const allowedFields = ['name', 'email', 'role', 'is_active'];
        const filteredData = Object.keys(updateData)
          .filter(key => allowedFields.includes(key))
          .reduce((obj, key) => {
            obj[key] = updateData[key];
            return obj;
          }, {} as any);

        if (Object.keys(filteredData).length === 0) {
          return new Response(
            JSON.stringify({ error: 'No valid fields to update' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(filteredData)
          .eq('id', userId)
          .select('id, name, email, role, is_active, updated_at')
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ error: 'Failed to update user' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'User updated successfully',
            user: updatedUser 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'DELETE':
        // Deactivate user (soft delete)
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'User ID is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const { error: deactivateError } = await supabase
          .from('users')
          .update({ is_active: false })
          .eq('id', userId);

        if (deactivateError) {
          return new Response(
            JSON.stringify({ error: 'Failed to deactivate user' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        // Remove all sessions for the user
        await supabase
          .from('user_sessions')
          .delete()
          .eq('user_id', userId);

        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'User deactivated successfully' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            status: 405, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

  } catch (error) {
    console.error('Admin users error:', error);
    
    if (error.message.includes('Admin access required') || error.message.includes('authorization')) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});