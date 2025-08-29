<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, Clock, Users, CreditCard, AlertCircle, CheckCircle, Building, Target, ChevronRight, ChevronLeft, ArrowRight, GraduationCap } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

interface College {
  id: number;
  name: string;
  location: string;
  type: string;
  programs: string[];
  description: string;
  image: string;
}

interface BookingData {
  date: string;
  location: string;
  time: string;
  participants: number;
  donationTickets: number;
}

const BookTour: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);

  const [bookingData, setBookingData] = useState<BookingData>({
    date: '',
    location: '',
    time: '',
    participants: 1,
    donationTickets: 0
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Check if college was selected from Browse Colleges
  useEffect(() => {
    if (location.state?.selectedCollege) {
      const college = location.state.selectedCollege;
      setSelectedCollege(college);
    }
  }, [location.state]);

  const locations = [
    { id: 'atlanta', name: 'Atlanta, GA', subtitle: 'VR Experience Center' },
    { id: 'detroit', name: 'Detroit, MI', subtitle: 'VR Experience Center' },
    { id: 'flint', name: 'Flint, MI', subtitle: 'VR Experience Center' }
  ];

  const timeSlots = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM'
  ];

  const donationOptions = [
    { value: 0, label: 'No donation' },
    { value: 1, label: '1 ticket ($40)' },
    { value: 2, label: '2 tickets ($80)' },
    { value: 3, label: '3 tickets ($120)' },
    { value: 5, label: '5 tickets ($200)' }
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateAvailable = (date: Date) => {
    return date >= new Date() && isWeekend(date);
  };

  const handleDateSelect = (date: Date) => {
    if (isDateAvailable(date)) {
      setSelectedDate(date);
      setBookingData(prev => ({
        ...prev,
        date: date.toISOString().split('T')[0]
      }));
    }
  };

  const handleLocationSelect = (locationId: string) => {
    setBookingData(prev => ({
      ...prev,
      location: locationId
    }));
  };

  const handleTimeSelect = (time: string) => {
    setBookingData(prev => ({
      ...prev,
      time
    }));
  };

  const handleParticipantsChange = (participants: number) => {
    if (participants < 1 || participants > 10) return;
    setBookingData(prev => ({
      ...prev,
      participants
    }));
  };

  const handleDonationChange = (donationTickets: number) => {
    setBookingData(prev => ({
      ...prev,
      donationTickets
    }));
  };

  const getBaseCost = () => {
    return 40; // $40 per participant
  };

  const getDonationCost = () => {
    return bookingData.donationTickets * 40;
  };

  const getTotalCost = () => {
    const baseCost = getBaseCost() * bookingData.participants;
    const donationCost = getDonationCost();
    return baseCost + donationCost;
  };

  const isFormComplete = () => {
    return bookingData.date && bookingData.location && bookingData.time && bookingData.participants > 0;
  };

  const handleSubmit = async () => {
    if (!isFormComplete()) {
      setMessage({ type: 'error', text: 'Please complete all required fields before proceeding.' });
      return;
    }

    // Open payment modal instead of directly submitting
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      console.log('Token found:', token ? 'Yes' : 'No');
      
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication required. Please login again.' });
        navigate('/login');
        return;
      }

      const bookingPayload = {
        date: bookingData.date,
        location: locations.find(loc => loc.id === bookingData.location)?.name || bookingData.location,
        time_slot: bookingData.time,
        participants: bookingData.participants,
        donation_tickets: bookingData.donationTickets,
        total_cost: getTotalCost(),
        college_id: selectedCollege?.id || undefined,
        college_name: selectedCollege?.name || undefined
      };

      console.log('Sending booking data:', bookingPayload);
      console.log('API URL:', `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/bookings`);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingPayload),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('API Response:', { status: response.status, data });

      if (response.ok) {
        setMessage({ type: 'success', text: 'VR Tour booked successfully! Redirecting to dashboard...' });
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        const errorMessage = data.error || data.details?.[0]?.msg || 'Failed to book VR tour';
        setMessage({ type: 'error', text: errorMessage });
        console.error('Booking failed:', data);
      }
    } catch (error) {
      console.error('Booking error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
=======
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createBooking } from '../lib/bookings';
import Calendar from '../components/Calendar';
import { loadStripe } from '@stripe/stripe-js';
import { 
  MapPin, 
  Clock, 
  Users, 
  DollarSign, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  CreditCard,
  X,
  Smartphone
} from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51234567890abcdef'); // Replace with your Stripe publishable key

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
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [cardDetails, setCardDetails] = useState({
    number: '4242424242424242',
    expiry: '12/25',
    cvc: '123',
    name: 'Test User'
  });
  const [upiId, setUpiId] = useState('test@upi');

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

  const handleBookNow = () => {
    if (!selectedDate || !selectedLocation || !selectedTimeSlot) {
      setError('Please fill in all required fields');
      return;
    }

    if (!user) {
      setError('You must be logged in to book a tour');
      return;
    }

    setError('');
    setShowPaymentForm(true);
  };

  const processPayment = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate payment success (90% success rate for testing)
      const paymentSuccess = Math.random() > 0.1;
      
      if (!paymentSuccess) {
        throw new Error('Payment failed. Please try again.');
      }

      // Create booking after successful payment
      const bookingData = {
        user_id: user!.id,
        date: selectedDate!.toISOString().split('T')[0],
        location: selectedLocation,
        time_slot: selectedTimeSlot,
        participants,
        donation_tickets: donationTickets,
        total_cost: totalCost,
        status: 'confirmed' as const
      };

      const bookingResult = await createBooking(bookingData);
      
      if (!bookingResult.success) {
        throw new Error(bookingResult.error || 'Failed to create booking');
      }

      setSuccess(true);
      await refreshBookings();
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
>>>>>>> 8c9d782b51df86acdf3f79094d50305611f9cc65
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDayName = (day: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Your VR College Tour</h1>
          <p className="text-xl text-gray-600">Experience college campuses in virtual reality</p>
        </div>

        {/* Selected College Info */}
        {selectedCollege && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-200">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Building className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedCollege.name}</h3>
                <p className="text-gray-600 mb-2">{selectedCollege.description}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCollege.programs.slice(0, 3).map((program, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {program}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Date Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Select Your Date</h2>
                  <p className="text-gray-600">Available on weekends only.</p>
                </div>
              </div>

              {/* Calendar */}
              <div className="bg-gray-50 rounded-xl p-6">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => changeMonth('prev')}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900">{getMonthName(currentMonth)}</h3>
                  <button
                    onClick={() => changeMonth('next')}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {getDaysInMonth(currentMonth).map((date, index) => (
                    <div key={index} className="text-center">
                      {date ? (
                        <button
                          onClick={() => handleDateSelect(date)}
                          disabled={!isDateAvailable(date)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                            selectedDate && selectedDate.toDateString() === date.toDateString()
                              ? 'bg-green-600 text-white border-2 border-white shadow-lg'
                              : isDateAvailable(date)
                              ? 'bg-green-100 text-green-800 hover:bg-green-200 border-2 border-green-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {date.getDate()}
                        </button>
                      ) : (
                        <div className="w-10 h-10"></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center space-x-6 mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-100 border-2 border-green-200 rounded"></div>
                    <span className="text-sm text-gray-600">Available (Weekends)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-100 rounded"></div>
                    <span className="text-sm text-gray-600">Unavailable</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span className="text-sm text-gray-600">Selected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Choose Location</h2>
                  <p className="text-gray-600">Select your nearest VR experience center.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {locations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location.id)}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      bookingData.location === location.id
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{location.name}</h3>
                    <p className="text-gray-600">{location.subtitle}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Select Time</h2>
                  <p className="text-gray-600">Choose your preferred time slot.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className={`py-3 px-4 rounded-xl border-2 transition-all ${
                      bookingData.time === time
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Number of Participants</h2>
                  <p className="text-gray-600">How many students will be joining?</p>
                </div>
              </div>

              <select
                value={bookingData.participants}
                onChange={(e) => handleParticipantsChange(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Student' : 'Students'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Summary</h2>

              {/* Summary Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">
                    {bookingData.location ? locations.find(loc => loc.id === bookingData.location)?.name : 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">
                    {bookingData.time || 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Participants:</span>
                  <span className="font-medium">{bookingData.participants}</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Pricing</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Per ticket:</span>
                    <span>$40</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Participants ({bookingData.participants}):</span>
                    <span>${bookingData.participants * 40}</span>
                  </div>
                  <div className="flex justify-between font-bold text-blue-600 text-lg">
                    <span>Total:</span>
                    <span>${getTotalCost()}</span>
                  </div>
                </div>
              </div>

              {/* Donation Section */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Support Other Students</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Help make college exploration accessible to more students by donating tickets.
                </p>
                <select
                  value={bookingData.donationTickets}
                  onChange={(e) => handleDonationChange(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {donationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleSubmit}
                disabled={!isFormComplete() || isLoading}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all ${
                  isFormComplete()
                    ? 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105'
                    : 'bg-gray-400 cursor-not-allowed'
                } flex items-center justify-center space-x-2`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              {/* Policy */}
              <p className="text-xs text-gray-500 text-center mt-4">
                Secure payment processing • Cancel anytime up to 24 hours before
              </p>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`fixed top-4 right-4 p-4 rounded-xl shadow-lg max-w-md z-50 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-500 border border-red-200 text-red-700'
          }`}>
            <div className="flex items-center space-x-3">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          amount={getTotalCost()}
          onPaymentSuccess={handlePaymentSuccess}
          bookingData={bookingData}
        />
=======
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
              Your VR college tour has been booked and paid for. You'll receive a confirmation email shortly.
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
                  <span>Amount Paid:</span>
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

            <div className="space-y-6">
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

              {/* Book Now Button */}
              <button
                onClick={handleBookNow}
                disabled={!selectedDate || !selectedLocation || !selectedTimeSlot}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <CalendarIcon className="h-5 w-5 mr-2" />
                Book Now - ${totalCost}
              </button>
            </div>
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

            {/* Payment Security Notice */}
            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-800">Secure Payment</p>
                  <p className="text-xs text-green-600">
                    Your payment is processed securely through Stripe
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form Modal */}
        {showPaymentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Payment Details</h3>
                  <button
                    onClick={() => setShowPaymentForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Choose Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${
                        paymentMethod === 'card'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard className="h-6 w-6 mb-2" />
                      <span className="font-medium">Card</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${
                        paymentMethod === 'upi'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Smartphone className="h-6 w-6 mb-2" />
                      <span className="font-medium">UPI</span>
                    </button>
                  </div>
                </div>

                {/* Card Payment Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="4242 4242 4242 4242"
                      />
                      <p className="text-xs text-gray-500 mt-1">Use test card: 4242424242424242</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVC
                        </label>
                        <input
                          type="text"
                          value={cardDetails.cvc}
                          onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="123"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                )}

                {/* UPI Payment Form */}
                {paymentMethod === 'upi' && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        UPI ID
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="yourname@upi"
                      />
                      <p className="text-xs text-gray-500 mt-1">Use test UPI: test@upi</p>
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tour Date:</span>
                      <span className="font-medium">{selectedDate?.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-medium">{locations.find(l => l.value === selectedLocation)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Participants:</span>
                      <span className="font-medium">{participants}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-lg">
                      <span>Total Amount:</span>
                      <span>${totalCost}</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Payment Button */}
                <button
                  onClick={processPayment}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-green-700 hover:to-blue-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Pay ${totalCost}
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  This is a test payment. No real money will be charged.
                </p>
              </div>
            </div>
          </div>
        )}
>>>>>>> 8c9d782b51df86acdf3f79094d50305611f9cc65
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default BookTour;

=======
export default BookTour;
>>>>>>> 8c9d782b51df86acdf3f79094d50305611f9cc65
