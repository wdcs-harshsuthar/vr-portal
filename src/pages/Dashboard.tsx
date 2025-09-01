import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, Clock, Users, Plus, Eye, CheckCircle, AlertCircle, XCircle, ChevronDown, ChevronUp, Heart, UserCheck } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, bookings, refreshBookings, retryAuth, isLoading } = useAuth();
  const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set());



  // Check if a booking can be modified (not past or current)
  const canModifyBooking = (bookingDate: string, bookingTime: string) => {
    const now = new Date();
    const bookingDateTime = new Date(bookingDate);
    
    // Parse time slot to get start time
    const timeMatch = bookingTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      const minute = parseInt(timeMatch[2]);
      const period = timeMatch[3];
      
      let adjustedHour = hour;
      if (period === 'PM' && hour !== 12) adjustedHour += 12;
      if (period === 'AM' && hour === 12) adjustedHour = 0;
      
      bookingDateTime.setHours(adjustedHour, minute, 0, 0);
    }
    
    // Add 1 hour 15 minutes to get end time
    const endTime = new Date(bookingDateTime.getTime() + (75 * 60 * 1000));
    
    return now < bookingDateTime; // Can modify if current time is before booking start time
  };

  // Toggle booking expansion
  const toggleBookingExpansion = (bookingId: string) => {
    const newExpanded = new Set(expandedBookings);
    if (newExpanded.has(bookingId)) {
      newExpanded.delete(bookingId);
    } else {
      newExpanded.add(bookingId);
    }
    setExpandedBookings(newExpanded);
  };

  // Get booking status with time context
  const getBookingStatusInfo = (booking: any) => {
    const canModify = canModifyBooking(booking.date, booking.timeSlot || booking.time_slot);
    
    if (booking.status === 'cancelled') {
      return { status: 'cancelled', canModify: false, message: 'Cancelled' };
    }
    
    if (!canModify) {
      return { status: 'completed', canModify: false, message: 'Completed' };
    }
    
    return { status: booking.status, canModify: true, message: 'Booked' };
  };

  // Get display status for user-friendly display
  const getDisplayStatus = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return 'Booked';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/bookings/${bookingId}/cancel`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        // Refresh bookings to show updated status
        await refreshBookings();
        alert('Booking cancelled successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'pending':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'pending':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.name || user?.email || 'User'}!
              </h1>
              <p className="text-blue-100 text-lg">
                Ready to explore more colleges? Your VR journey continues here.
              </p>
              {!user && (
                <div className="mt-4">
                  <button
                    onClick={retryAuth}
                    disabled={isLoading}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Loading...' : 'Retry Authentication'}
                  </button>
                </div>
              )}
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <Eye className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                    <p className="text-gray-600 text-sm">Total Bookings</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {bookings.filter(b => b.status === 'confirmed').length}
                    </p>
                    <p className="text-gray-600 text-sm">Confirmed Tours</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {bookings.reduce((sum, booking) => sum + booking.participants, 0)}
                    </p>
                    <p className="text-gray-600 text-sm">Total Participants</p>
                  </div>
                </div>
              </div>
            </div>

            {/* My Bookings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
                  <Link
                    to="/book-tour"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Book New Tour
                  </Link>
                </div>
              </div>

              <div className="p-6">
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-600 mb-6">Start your college exploration journey today!</p>
                    <Link
                      to="/book-tour"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Book Your First Tour
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => {
                      const statusInfo = getBookingStatusInfo(booking);
                      const isExpanded = expandedBookings.has(booking.id);
                      
                      return (
                        <div
                          key={booking.id}
                          className={`border border-gray-200 rounded-xl p-6 transition-all ${
                            statusInfo.canModify ? 'hover:shadow-md' : 'opacity-75'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-3">
                                <div className="flex items-center mr-3">
                                  <h3 className="text-lg font-semibold text-gray-900 mr-2">
                                    VR College Tour
                                  </h3>
                                  {booking.is_donor && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                      <Heart className="h-3 w-3 mr-1" />
                                      Donor
                                    </span>
                                  )}
                                </div>
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                    statusInfo.status
                                  )}`}
                                >
                                  {getStatusIcon(statusInfo.status)}
                                  <span className="ml-1">{getDisplayStatus(statusInfo.status)}</span>
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center text-gray-600">
                                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                  <span>{formatDate(booking.date)}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <MapPin className="h-4 w-4 mr-2 text-green-500" />
                                  <span>{booking.location}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Clock className="h-4 w-4 mr-2 text-purple-500" />
                                  <span>{booking.timeSlot || booking.time_slot}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Users className="h-4 w-4 mr-2 text-orange-500" />
                                  <span>
                                    {booking.participants} {booking.participants === 1 ? 'participant' : 'participants'}
                                  </span>
                                </div>
                              </div>

                              {/* Attendee Information */}
                              {booking.attendees && booking.attendees.length > 0 && (
                                <div className="mt-4">
                                  <button
                                    onClick={() => toggleBookingExpansion(booking.id)}
                                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    {isExpanded ? (
                                      <>
                                        <ChevronUp className="h-4 w-4 mr-1" />
                                        Hide Attendees
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="h-4 w-4 mr-1" />
                                        Show Attendees ({booking.attendees.filter(a => a.name || (a.firstName && a.lastName)).length})
                                      </>
                                    )}
                                  </button>
                                  
                                  {isExpanded && (
                                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                        <UserCheck className="h-4 w-4 mr-2 text-blue-500" />
                                        Attendees
                                      </h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {booking.attendees.map((attendee, index) => {
                                          const displayName = attendee.firstName && attendee.lastName 
                                            ? `${attendee.firstName} ${attendee.lastName}`
                                            : attendee.name;
                                          const initial = displayName ? displayName.charAt(0).toUpperCase() : '?';
                                          
                                          return (
                                            <div key={index} className="flex items-center space-x-3 p-2 bg-white rounded border">
                                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium text-blue-600">
                                                  {initial}
                                                </span>
                                              </div>
                                              <div className="flex-1">
                                                <p className="font-medium text-gray-900">{displayName}</p>
                                                {attendee.email && (
                                                  <p className="text-sm text-gray-600">{attendee.email}</p>
                                                )}
                                                {attendee.currentSchool && (
                                                  <p className="text-sm text-gray-600">{attendee.currentSchool}</p>
                                                )}
                                                {attendee.interest && (
                                                  <p className="text-xs text-blue-600">{attendee.interest}</p>
                                                )}
                                                {attendee.gpa && (
                                                  <p className="text-xs text-green-600">GPA: {attendee.gpa}</p>
                                                )}
                                                {attendee.grade && (
                                                  <p className="text-xs text-gray-500">{attendee.grade}</p>
                                                )}
                                                {attendee.school && (
                                                  <p className="text-xs text-gray-500">{attendee.school}</p>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* College Information */}
                              {booking.college_name && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                  <p className="text-sm text-blue-800">
                                    <strong>College:</strong> {booking.college_name}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="ml-4 flex flex-col items-end space-y-2">
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">
                                  ${(typeof booking.total_cost === 'string' ? parseFloat(booking.total_cost) : booking.total_cost).toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {booking.donation_tickets > 0 && `+${booking.donation_tickets} donation tickets`}
                                </div>
                              </div>
                              
                              {statusInfo.canModify ? (
                                <div className="flex space-x-2">
                                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                    Modify
                                  </button>
                                  <button 
                                    onClick={() => handleCancelBooking(booking.id)}
                                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">
                                  {statusInfo.status === 'completed' ? 'Past booking' : 'Cannot modify'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{user?.name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
              </div>
              <Link to="/profile" className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm">
                Edit Profile
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/book-tour"
                  className="block w-full text-left px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Plus className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Book New Tour</p>
                      <p className="text-sm text-gray-600">Schedule your next VR experience</p>
                    </div>
                  </div>
                </Link>
                
                <Link
                  to="/browse-colleges"
                  className="block w-full text-left px-4 py-3 bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg hover:from-green-100 hover:to-teal-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Eye className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Browse Colleges</p>
                      <p className="text-sm text-gray-600">Explore available institutions</p>
                    </div>
                  </div>
                </Link>

              </div>
            </div>

            {/* Support */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Our support team is here to help you make the most of your VR college tours.
              </p>
              <Link to="/contact-support" className="text-green-600 hover:text-green-800 font-medium text-sm">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;