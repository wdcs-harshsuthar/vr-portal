import { supabase } from './supabase';

export interface CreateBookingData {
  user_id: string;
  date: string;
  location: string;
  time_slot: string;
  participants: number;
  donation_tickets: number;
  total_cost: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface Booking {
  id: string;
  user_id: string;
  date: string;
  location: string;
  time_slot: string;
  participants: number;
  donation_tickets: number;
  total_cost: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export const createBooking = async (bookingData: CreateBookingData): Promise<{ success: boolean; booking?: Booking; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      return { success: false, error: 'Failed to create booking' };
    }

    return { success: true, booking: data };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const getUserBookings = async (userId: string): Promise<{ success: boolean; bookings?: Booking[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return { success: false, error: 'Failed to fetch bookings' };
    }

    return { success: true, bookings: data || [] };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const updateBookingStatus = async (bookingId: string, status: 'pending' | 'confirmed' | 'cancelled'): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      console.error('Error updating booking:', error);
      return { success: false, error: 'Failed to update booking' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating booking:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const getAllBookings = async (): Promise<{ success: boolean; bookings?: Booking[]; error?: string }> => {
  try {
    const { data, error } = await supabase
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
      console.error('Error fetching all bookings:', error);
      return { success: false, error: 'Failed to fetch bookings' };
    }

    return { success: true, bookings: data || [] };
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};