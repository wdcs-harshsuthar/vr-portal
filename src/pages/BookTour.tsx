import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Calendar from '../components/Calendar';
import { MapPin, Clock, Users, DollarSign, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';

const BookTour: React.FC = () => {
  const { user, refreshBookings } = useAuth();
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [participants, setParticipants] = useState(1);
  const [donationTickets, setDonationTickets] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const locations = [
    { value: 'atlanta', label: 'Atlanta, GA', address: '123 Peachtree St, Atlanta, GA 30309' },
    { value: 'detroit', label: 'Detroit, MI', address: '456 Woodward Ave, Detroit, MI 48226' },
    { value: 'flint', label: 'Flint, MI', address: '789 Saginaw St, Flint, MI 48502' }
  ];

  const timeSlots = [
    { value: '10:00-11:30', label: '10:00 AM - 11:30 AM' },
    { value: '12:00-13:30', label: '12:00 PM - 1:30 PM' },
    { value: '14:00-15:30', label: '2:00 PM - 3:30 PM' },
    { value: '16:00-17:30', label: '4:00 PM - 5:30 PM' }
  ];

  const baseCost = 25; // $25 per participant
  const donationCost = 5; // $5 per donation ticket
  const totalCost = (participants * baseCost) + (donationTickets * donationCost);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedLocation || !selectedTimeSlot) {
      setError('Please fill in all required fields');
      return;
    }

    if (!user) {
      setError('You must be logged in to book a tour');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const bookingData = {
        user_id: user.id,
        date: selectedDate.toISOString().split('T')[0],
        location: selectedLocation,
        time_slot: selectedTimeSlot,
        participants,
        donation_tickets: donationTickets,
        total_cost: totalCost,
        status: 'pending'
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const result = await response.json();
      
      if (result.success) {
        setSuccess(true);
        await refreshBookings();
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(result.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your VR college tour has been successfully booked. You'll receive a confirmation email shortly.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">{selectedDate?.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="font-medium">{locations.find(l => l.value === selectedLocation)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">{timeSlots.find(t => t.value === selectedTimeSlot)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span>Participants:</span>
                  <span className="font-medium">{participants}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total Cost:</span>
                  <span>${totalCost}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Your VR College Tour</h1>
          <p className="text-xl text-gray-600">
            Choose your preferred date, location, and time for an immersive college experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tour Details</h2>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
                <div className="text-red-600 text-sm">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <MapPin className="inline h-4 w-4 mr-2" />
                  Select Location
                </label>
                <div className="space-y-3">
                  {locations.map((location) => (
                    <label key={location.value} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="location"
                        value={location.value}
                        checked={selectedLocation === location.value}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{location.label}</div>
                        <div className="text-sm text-gray-500">{location.address}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Time Slot Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Clock className="inline h-4 w-4 mr-2" />
                  Select Time Slot
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {timeSlots.map((slot) => (
                    <label key={slot.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="timeSlot"
                        value={slot.value}
                        checked={selectedTimeSlot === slot.value}
                        onChange={(e) => setSelectedTimeSlot(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-900">{slot.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Participants */}
              <div>
                <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-2" />
                  Number of Participants
                </label>
                <select
                  id="participants"
                  value={participants}
                  onChange={(e) => setParticipants(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
                  ))}
                </select>
              </div>

              {/* Donation Tickets */}
              <div>
                <label htmlFor="donationTickets" className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-2" />
                  Donation Tickets (Optional)
                </label>
                <select
                  id="donationTickets"
                  value={donationTickets}
                  onChange={(e) => setDonationTickets(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[0, 1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>
                      {num === 0 ? 'No donation tickets' : `${num} donation ${num === 1 ? 'ticket' : 'tickets'} (+$${num * donationCost})`}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Help support students who can't afford tours
                </p>
              </div>

              {/* Cost Summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-3">Cost Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tour tickets ({participants} × $25)</span>
                    <span>${participants * baseCost}</span>
                  </div>
                  {donationTickets > 0 && (
                    <div className="flex justify-between">
                      <span>Donation tickets ({donationTickets} × $5)</span>
                      <span>${donationTickets * donationCost}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${totalCost}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !selectedDate || !selectedLocation || !selectedTimeSlot}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Booking Tour...' : `Book Tour - $${totalCost}`}
              </button>
            </form>
          </div>

          {/* Calendar */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              <CalendarIcon className="inline h-6 w-6 mr-2" />
              Select Date
            </h2>
            <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
            
            {selectedDate && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-blue-800 font-medium">
                  Selected: {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            {/* Tour Information */}
            <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Included</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  90-minute immersive VR experience
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Tours of 3-5 different colleges
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Interactive Q&A with college representatives
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  College information packets
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Refreshments and snacks
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookTour;