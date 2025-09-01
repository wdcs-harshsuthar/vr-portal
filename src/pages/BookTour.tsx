import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Clock, Users, CreditCard, AlertCircle, CheckCircle, Building, Target, ChevronRight, ChevronLeft, ArrowRight, GraduationCap } from 'lucide-react';
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

interface Attendee {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  currentSchool: string;
  interest: string;
  gpa: string;
  emailConsent: boolean;
  grade?: string;
  school?: string;
}

interface BookingData {
  date: string;
  location: string;
  time: string;
  participants: number;
  donationTickets: number;
  attendees: Attendee[];
  isDonor: boolean;
  selectedLocationAddress?: string;
}

interface SessionData {
  date: string;
  location: string;
  timeSlot: string;
  currentParticipants: number;
  maxParticipants: number;
}

const BookTour: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshBookings } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);

  const [bookingData, setBookingData] = useState<BookingData>({
    date: '',
    location: '',
    time: '',
    participants: 1,
    donationTickets: 0,
    attendees: [],
    isDonor: false
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Check if college was selected from Browse Colleges
  useEffect(() => {
    if (location.state?.selectedCollege) {
      const college = location.state.selectedCollege;
      setSelectedCollege(college);
    }
  }, [location.state]);

  // Fetch session availability when date or location changes
  useEffect(() => {
    if (selectedDate && bookingData.location) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      fetchSessionAvailability(dateStr, bookingData.location);
    }
  }, [selectedDate, bookingData.location]);

  // Adjust participant count when time slot changes and there aren't enough spots
  useEffect(() => {
    if (bookingData.time) {
      const availableSpots = getAvailableSpots(bookingData.time);
      if (bookingData.participants > availableSpots && availableSpots > 0) {
        setBookingData(prev => ({
          ...prev,
          participants: availableSpots
        }));
      }
    }
  }, [bookingData.time, sessionData]);

  const locations = [
    { 
      id: 'atlanta', 
      name: 'Atlanta, GA', 
      subtitle: 'VR Experience Center',
      address: '123 Peachtree Street, Atlanta, GA 30303'
    },
    { 
      id: 'detroit', 
      name: 'Detroit, MI', 
      subtitle: 'VR Experience Center',
      address: '456 Woodward Avenue, Detroit, MI 48226'
    },
    { 
      id: 'flint', 
      name: 'Flint, MI', 
      subtitle: 'VR Experience Center',
      address: '789 Saginaw Street, Flint, MI 48502'
    }
  ];

  const interestOptions = [
    'Four-year colleges (including HBCUs and Ivy League)',
    'Technical colleges',
    'Trade schools',
    'All of the above'
  ];

  const gpaOptions = Array.from({ length: 31 }, (_, i) => {
    const gpa = (1.0 + i * 0.1).toFixed(1);
    return gpa;
  });

  const timeSlots = [
    '9:00 AM - 10:15 AM',
    '10:30 AM - 11:45 AM', 
    '12:00 PM - 1:15 PM',
    '1:30 PM - 2:45 PM'
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
    const selectedLocation = locations.find(loc => loc.id === locationId);
    setBookingData(prev => ({
      ...prev,
      location: locationId,
      selectedLocationAddress: selectedLocation?.address
    }));
  };

  const handleTimeSelect = (time: string) => {
    setBookingData(prev => ({
      ...prev,
      time
    }));
  };

  const handleParticipantsChange = (participants: number) => {
    const maxAllowed = bookingData.isDonor ? 1000 : 100; // Donors unlimited (practical limit), Parents 100
    if (participants < 1 || participants > maxAllowed) return;
    
    setBookingData(prev => {
      // Adjust attendees array based on new participant count
      const newAttendees = [...prev.attendees];
      
      if (participants > newAttendees.length) {
        // Add empty attendees
        for (let i = newAttendees.length; i < participants; i++) {
          newAttendees.push({ 
            name: '', 
            firstName: '', 
            lastName: '', 
            email: '', 
            currentSchool: '', 
            interest: '', 
            gpa: '', 
            emailConsent: false,
            grade: '', 
            school: '' 
          });
        }
      } else {
        // Remove extra attendees
        newAttendees.splice(participants);
      }
      
      return {
        ...prev,
        participants,
        attendees: newAttendees
      };
    });
  };

  const handleAttendeeChange = (index: number, field: keyof Attendee, value: string | boolean) => {
    setBookingData(prev => ({
      ...prev,
      attendees: prev.attendees.map((attendee, i) => 
        i === index ? { ...attendee, [field]: value } : attendee
      )
    }));
  };

  const handleUserTypeChange = (isDonor: boolean) => {
    setBookingData(prev => ({
      ...prev,
      isDonor,
      // Reset participants if switching to parent mode and exceeding 100
      participants: isDonor ? prev.participants : Math.min(prev.participants, 100),
      attendees: isDonor ? prev.attendees : prev.attendees.slice(0, 100)
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
    const basicComplete = bookingData.date && bookingData.location && bookingData.time && bookingData.participants > 0;
    
    // For non-donors, require all profile fields for all attendees
    if (!bookingData.isDonor) {
      const allProfilesComplete = bookingData.attendees.slice(0, bookingData.participants).every(attendee => 
        attendee.firstName.trim() && 
        attendee.lastName.trim() && 
        attendee.email.trim() && 
        attendee.currentSchool.trim() && 
        attendee.interest && 
        attendee.gpa
      );
      return basicComplete && allProfilesComplete;
    }
    
    return basicComplete;
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
        college_name: selectedCollege?.name || undefined,
        is_donor: bookingData.isDonor,
        attendees: bookingData.attendees.slice(0, bookingData.participants)
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
        // Close payment modal
        setIsPaymentModalOpen(false);
        
        // Show success message
        setMessage({ type: 'success', text: 'VR Tour booked successfully! Redirecting to dashboard...' });
        
        // Refresh bookings to include the new one
        await refreshBookings();
        
        // Reset form
        setBookingData({
          date: '',
          location: '',
          time: '',
          participants: 1,
          donationTickets: 0,
          attendees: [],
          isDonor: false
        });
        setSelectedDate(null);
        setSelectedCollege(null);
        
        // Redirect to dashboard after a short delay
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



  // Fetch session availability for a specific date and location
  const fetchSessionAvailability = async (date: string, location: string) => {
    setLoadingSessions(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/bookings/availability?date=${date}&location=${location}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSessionData(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching session availability:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Get available spots for a specific time slot
  const getAvailableSpots = (timeSlot: string): number => {
    if (!selectedDate || !bookingData.location) return 25; // Default to 25 if no data

    const session = sessionData.find(s => 
      s.date === selectedDate.toISOString().split('T')[0] && 
      s.location === bookingData.location && 
      s.timeSlot === timeSlot
    );

    return session ? Math.max(0, session.maxParticipants - session.currentParticipants) : 25;
  };

  // Check if a session is full
  const isSessionFull = (timeSlot: string): boolean => {
    return getAvailableSpots(timeSlot) === 0;
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

              {/* Location Address Display */}
              {bookingData.selectedLocationAddress && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 mb-1">Location Address:</h4>
                      <p className="text-sm text-blue-800">{bookingData.selectedLocationAddress}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Time Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Select Time</h2>
                  <p className="text-gray-600">Choose your preferred time slot. Each session is 1 hour 15 minutes (includes training time).</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {timeSlots.filter(time => !isSessionFull(time)).map((time) => {
                  const availableSpots = getAvailableSpots(time);
                  const maxParticipants = 25;
                  const isLowAvailability = availableSpots <= 5;
                  
                  return (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      disabled={availableSpots < bookingData.participants}
                      className={`py-4 px-4 rounded-xl border-2 transition-all text-center ${
                        bookingData.time === time
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                          : availableSpots < bookingData.participants
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-sm font-medium">{time}</div>
                      <div className={`text-xs mt-1 ${
                        isLowAvailability ? 'text-orange-600' : 'text-gray-500'
                      }`}>
                        {availableSpots} of {maxParticipants} spots available
                        {isLowAvailability && ' (Limited!)'}
                      </div>
                      {loadingSessions && (
                        <div className="text-xs text-blue-500 mt-1">Loading...</div>
                      )}
                    </button>
                  );
                })}
                {timeSlots.filter(time => !isSessionFull(time)).length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No available time slots for this date and location.</p>
                    <p className="text-sm mt-1">Please select a different date or location.</p>
                  </div>
                )}
              </div>
            </div>

            {/* User Type Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Booking Type</h2>
                  <p className="text-gray-600">Are you booking as a parent or making a donation?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => handleUserTypeChange(false)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    !bookingData.isDonor
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Parent/Guardian</h3>
                  <p className="text-gray-600 text-sm">Booking for your children</p>
                  <p className="text-gray-500 text-xs mt-2">• Max 100 students</p>
                  <p className="text-gray-500 text-xs">• Session capacity limits apply</p>
                </button>
                
                <button
                  onClick={() => handleUserTypeChange(true)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    bookingData.isDonor
                      ? 'border-green-500 bg-green-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Donor/Sponsor</h3>
                  <p className="text-gray-600 text-sm">Sponsoring students' experiences</p>
                  <p className="text-gray-500 text-xs mt-2">• Unlimited participants</p>
                  <p className="text-gray-500 text-xs">• Choose specific location to support</p>
                </button>
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
                  <p className="text-gray-600">
                    {bookingData.isDonor 
                      ? "How many students would you like to sponsor?"
                      : "How many students will be joining? (Max 100 per booking)"
                    }
                  </p>
                </div>
              </div>

              <select
                value={bookingData.participants}
                onChange={(e) => handleParticipantsChange(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {(() => {
                  let maxParticipants;
                  
                  if (bookingData.isDonor) {
                    // Donors can select unlimited participants (practical limit of 1000)
                    maxParticipants = 1000;
                  } else {
                    // Parents limited to available spots or 100, whichever is smaller
                    if (!bookingData.time) {
                      maxParticipants = 100;
                    } else {
                      const maxAvailable = getAvailableSpots(bookingData.time);
                      maxParticipants = Math.max(1, Math.min(100, maxAvailable));
                    }
                  }
                  
                  const options = [];
                  // For donors, show increments of 10 for large numbers to avoid huge dropdown
                  if (bookingData.isDonor && maxParticipants > 50) {
                    for (let i = 1; i <= 50; i++) {
                      options.push(
                        <option key={i} value={i}>
                          {i} {i === 1 ? 'Student' : 'Students'}
                        </option>
                      );
                    }
                    // Add larger increments
                    for (let i = 60; i <= 200; i += 10) {
                      options.push(
                        <option key={i} value={i}>
                          {i} Students
                        </option>
                      );
                    }
                    // Add even larger increments
                    for (let i = 250; i <= 1000; i += 50) {
                      options.push(
                        <option key={i} value={i}>
                          {i} Students
                        </option>
                      );
                    }
                  } else {
                    // Normal dropdown for parents or small donor amounts
                    for (let i = 1; i <= Math.min(maxParticipants, 100); i++) {
                      options.push(
                        <option key={i} value={i}>
                          {i} {i === 1 ? 'Student' : 'Students'}
                        </option>
                      );
                    }
                  }
                  
                  return options;
                })()}
              </select>
              {bookingData.time && !bookingData.isDonor && getAvailableSpots(bookingData.time) < 25 && (
                <p className="mt-2 text-sm text-orange-600">
                  Only {getAvailableSpots(bookingData.time)} spots available for this time slot.
                </p>
              )}
            </div>

            {/* Attendee Details */}
            {bookingData.participants > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Attendee Information</h2>
                    <p className="text-gray-600">
                      {bookingData.isDonor 
                        ? "Provide details for students you're sponsoring (optional)"
                        : "Enter details for each student attending"
                      }
                    </p>
                  </div>
                </div>

                <div className="space-y-6 max-h-96 overflow-y-auto">
                  {bookingData.attendees.map((attendee, index) => (
                    <div key={index} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Student {index + 1} Profile</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name {!bookingData.isDonor && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="text"
                            value={attendee.firstName}
                            onChange={(e) => handleAttendeeChange(index, 'firstName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter first name"
                            required={!bookingData.isDonor}
                          />
                        </div>

                        {/* Last Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name {!bookingData.isDonor && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="text"
                            value={attendee.lastName}
                            onChange={(e) => handleAttendeeChange(index, 'lastName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter last name"
                            required={!bookingData.isDonor}
                          />
                        </div>

                        {/* Email Address */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address {!bookingData.isDonor && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="email"
                            value={attendee.email}
                            onChange={(e) => handleAttendeeChange(index, 'email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="student@email.com"
                            required={!bookingData.isDonor}
                          />
                        </div>

                        {/* Current School */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current School {!bookingData.isDonor && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="text"
                            value={attendee.currentSchool}
                            onChange={(e) => handleAttendeeChange(index, 'currentSchool', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter school name"
                            required={!bookingData.isDonor}
                          />
                        </div>

                        {/* Interest Dropdown */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Educational Interest {!bookingData.isDonor && <span className="text-red-500">*</span>}
                          </label>
                          <select
                            value={attendee.interest}
                            onChange={(e) => handleAttendeeChange(index, 'interest', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required={!bookingData.isDonor}
                          >
                            <option value="">Select interest</option>
                            {interestOptions.map((option, i) => (
                              <option key={i} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>

                        {/* GPA Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            GPA {!bookingData.isDonor && <span className="text-red-500">*</span>}
                          </label>
                          <select
                            value={attendee.gpa}
                            onChange={(e) => handleAttendeeChange(index, 'gpa', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required={!bookingData.isDonor}
                          >
                            <option value="">Select GPA</option>
                            {gpaOptions.map((gpa, i) => (
                              <option key={i} value={gpa}>{gpa}</option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            All GPAs are accepted; we use GPA to tailor your experience at the hub.
                          </p>
                        </div>

                        {/* Email Consent */}
                        <div className="md:col-span-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={attendee.emailConsent}
                              onChange={(e) => handleAttendeeChange(index, 'emailConsent', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              Can we have colleges email your student?
                            </span>
                          </label>
                        </div>

                        {/* Legacy fields for backward compatibility */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Grade/Year (Optional)
                          </label>
                          <input
                            type="text"
                            value={attendee.grade || ''}
                            onChange={(e) => handleAttendeeChange(index, 'grade', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 12th Grade"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            School (Optional)
                          </label>
                          <input
                            type="text"
                            value={attendee.school || ''}
                            onChange={(e) => handleAttendeeChange(index, 'school', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="School name"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {bookingData.participants > 5 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      📝 Tip: You can fill in the details later if needed. For now, just the number of participants is required to proceed.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Summary</h2>

              {/* Summary Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Type:</span>
                  <span className={`font-medium ${bookingData.isDonor ? 'text-green-600' : 'text-blue-600'}`}>
                    {bookingData.isDonor ? 'Donor/Sponsor' : 'Parent/Guardian'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
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
                {bookingData.attendees.some(a => a.firstName || a.name) && (
                  <div className="border-t pt-4">
                    <span className="text-gray-600 text-sm">Attendees:</span>
                    <div className="mt-2 max-h-32 overflow-y-auto">
                      {bookingData.attendees.filter(a => a.firstName || a.name).map((attendee, index) => (
                        <div key={index} className="text-sm text-gray-700 py-1">
                          {attendee.firstName && attendee.lastName 
                            ? `${attendee.firstName} ${attendee.lastName}`
                            : attendee.name
                          }
                          {attendee.grade && ` (${attendee.grade})`}
                          {attendee.interest && ` - ${attendee.interest}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

