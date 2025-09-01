import { apiPost, apiGet, apiPatch } from './api';

export interface CreateBookingData {
  user_id: string;
  date: string;
  location: string;
  time_slot: string;
  participants: number;
  donation_tickets: number;
  total_cost: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  college_id?: number;
  college_name?: string;
  is_donor?: boolean;
  attendees?: any[];
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
  college_id?: number;
  college_name?: string;
  is_donor?: boolean;
  attendees?: any[];
}

export const createBooking = async (bookingData: CreateBookingData): Promise<{ success: boolean; booking?: Booking; error?: string }> => {
  const result = await apiPost<{ booking: Booking }>('/bookings', bookingData);
  
  if (result.success && result.data?.booking) {
    return { success: true, booking: result.data.booking };
  }
  
  return { success: false, error: result.error || 'Failed to create booking' };
};

export const getUserBookings = async (userId: string): Promise<{ success: boolean; bookings?: Booking[]; error?: string }> => {
  const result = await apiGet<{ bookings: Booking[] }>('/bookings');
  
  if (result.success && result.data?.bookings) {
    return { success: true, bookings: result.data.bookings };
  }
  
  return { success: false, error: result.error || 'Failed to fetch bookings' };
};

export const updateBookingStatus = async (bookingId: string, status: 'pending' | 'confirmed' | 'cancelled'): Promise<{ success: boolean; error?: string }> => {
  const result = await apiPatch(`/bookings/${bookingId}`, { status });
  return { success: result.success, error: result.error };
};

export const cancelBooking = async (bookingId: string): Promise<{ success: boolean; error?: string }> => {
  const result = await apiPatch(`/bookings/${bookingId}/cancel`, {});
  return { success: result.success, error: result.error };
};

export const getAllBookings = async (): Promise<{ success: boolean; bookings?: Booking[]; error?: string }> => {
  const result = await apiGet<{ bookings: Booking[] }>('/bookings');
  
  if (result.success && result.data?.bookings) {
    return { success: true, bookings: result.data.bookings };
  }
  
  return { success: false, error: result.error || 'Failed to fetch bookings' };
};