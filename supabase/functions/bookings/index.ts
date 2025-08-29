import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface CreateBookingRequest {
  user_id: string;
  date: string;
  location: string;
  time_slot: string;
  participants: number;
  donation_tickets: number;
  total_cost: number;
  status: 'pending' | 'confirmed' | 'cancelled';
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

    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');

    switch (req.method) {
      case 'GET':
        // Get bookings for a specific user or all bookings
        if (userId) {
          const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) {
            return new Response(
              JSON.stringify({ success: false, error: 'Failed to fetch bookings' }),
              { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }

          return new Response(
            JSON.stringify({ success: true, bookings: bookings || [] }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // Get all bookings (admin only)
          const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
              *,
              users (
                name,
                email
              )
            `)
            .order('created_at', { ascending: false });

          if (error) {
            return new Response(
              JSON.stringify({ success: false, error: 'Failed to fetch bookings' }),
              { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }

          return new Response(
            JSON.stringify({ success: true, bookings: bookings || [] }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'POST':
        // Create new booking
        const bookingData: CreateBookingRequest = await req.json();

        // Validate required fields
        if (!bookingData.user_id || !bookingData.date || !bookingData.location || !bookingData.time_slot) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing required fields' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        // Check if user already has a booking for the same date and time
        const { data: existingBooking } = await supabase
          .from('bookings')
          .select('id')
          .eq('user_id', bookingData.user_id)
          .eq('date', bookingData.date)
          .eq('time_slot', bookingData.time_slot)
          .eq('location', bookingData.location)
          .single();

        if (existingBooking) {
          return new Response(
            JSON.stringify({ success: false, error: 'You already have a booking for this date and time' }),
            { 
              status: 409, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        // Create the booking
        const { data: newBooking, error: insertError } = await supabase
          .from('bookings')
          .insert([bookingData])
          .select()
          .single();

        if (insertError) {
          console.error('Database insert error:', insertError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to create booking' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            booking: newBooking,
            message: 'Booking created successfully' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'PUT':
        // Update booking status
        const bookingId = url.searchParams.get('id');
        const { status } = await req.json();

        if (!bookingId || !status) {
          return new Response(
            JSON.stringify({ success: false, error: 'Booking ID and status are required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const { data: updatedBooking, error: updateError } = await supabase
          .from('bookings')
          .update({ status })
          .eq('id', bookingId)
          .select()
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to update booking' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            booking: updatedBooking,
            message: 'Booking updated successfully' 
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
    console.error('Bookings API error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});