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
    } finally {
      setIsLoading(false);
    }
  };

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
      </div>
    </div>
  );
};

export default BookTour;

