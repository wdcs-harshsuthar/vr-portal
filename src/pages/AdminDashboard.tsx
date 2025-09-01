import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Eye, 
  Clock, 
  Building,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  BarChart3,
  FileText,
  Shield,
  X
} from 'lucide-react';

interface AdminUser {
  id: string;
  username: string;
  role: string;
}

interface Booking {
  id: string;
  user_name: string;
  user_email: string;
  date: string;
  location: string;
  time_slot: string;
  participants: number;
  donation_tickets: number;
  total_cost: number;
  status: string;
  college_id?: string;
  college_name?: string;
  is_donor: boolean;
  created_at: string;
  attendees: Array<{
    name: string;
    grade?: string;
    school?: string;
  }>;
}

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  thisMonthBookings: number;
  thisMonthRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    thisMonthBookings: 0,
    thisMonthRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    checkAdminAuth();
    fetchDashboardData();
  }, []);

  const checkAdminAuth = () => {
    const adminToken = localStorage.getItem('adminToken');
    const adminUserData = localStorage.getItem('adminUser');
    
    if (!adminToken || !adminUserData) {
      navigate('/admin/login');
      return;
    }

    try {
      setAdminUser(JSON.parse(adminUserData));
    } catch (error) {
      navigate('/admin/login');
    }
  };

  const fetchDashboardData = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      console.log('Admin token:', adminToken ? 'Present' : 'Missing');
      
      // Fetch bookings
      console.log('Fetching bookings from:', `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/bookings`);
      const bookingsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/bookings`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      console.log('Bookings response status:', bookingsResponse.status);
      console.log('Bookings response ok:', bookingsResponse.ok);

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        console.log('Bookings data received:', bookingsData);
        setBookings(bookingsData.bookings);
        calculateStats(bookingsData.bookings);
      } else {
        const errorData = await bookingsResponse.text();
        console.error('Bookings response error:', errorData);
      }

      // Fetch stats
      console.log('Fetching stats from:', `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/stats`);
      const statsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      console.log('Stats response status:', statsResponse.status);
      console.log('Stats response ok:', statsResponse.ok);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Stats data received:', statsData);
        setStats(statsData);
      } else {
        const errorData = await statsResponse.text();
        console.error('Stats response error:', errorData);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (bookingsData: Booking[]) => {
    const totalBookings = bookingsData.length;
    const pendingBookings = bookingsData.filter(b => b.status === 'pending').length;
    const totalRevenue = bookingsData.reduce((sum, b) => sum + b.total_cost, 0);
    
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const thisMonthBookings = bookingsData.filter(b => {
      const bookingDate = new Date(b.created_at);
      return bookingDate.getMonth() === thisMonth && bookingDate.getFullYear() === thisYear;
    }).length;
    
    const thisMonthRevenue = bookingsData.filter(b => {
      const bookingDate = new Date(b.created_at);
      return bookingDate.getMonth() === thisMonth && bookingDate.getFullYear() === thisYear;
    }).reduce((sum, b) => sum + b.total_cost, 0);

    setStats({
      totalBookings,
      pendingBookings,
      confirmedBookings: 0,
      totalRevenue,
      thisMonthBookings,
      thisMonthRevenue
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };



  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.college_name && booking.college_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <Calendar className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getDisplayStatus = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return 'Booked';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-green-600">{stats.thisMonthBookings}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
                      <div>
            <h2 className="text-xl font-bold text-gray-900">Bookings Management</h2>
            <p className="text-sm text-gray-600">Manage all VR tour bookings</p>
          </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    College
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.user_name}</div>
                        <div className="text-sm text-gray-500">{new Date(booking.created_at).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{new Date(booking.date).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{booking.time_slot}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{booking.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {booking.college_name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{booking.participants}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${booking.total_cost}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1">{getDisplayStatus(booking.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-base text-gray-900">{selectedBooking.user_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-base text-gray-900">{selectedBooking.user_email}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date</p>
                      <p className="text-base text-gray-900">{new Date(selectedBooking.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Time Slot</p>
                      <p className="text-base text-gray-900">{selectedBooking.time_slot}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="text-base text-gray-900">{selectedBooking.location}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">College</p>
                      <p className="text-base text-gray-900">{selectedBooking.college_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                        {getStatusIcon(selectedBooking.status)}
                        <span className="ml-1">{getDisplayStatus(selectedBooking.status)}</span>
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Booking Type</p>
                      <p className="text-base text-gray-900">{selectedBooking.is_donor ? 'Donor/Sponsor' : 'Parent/Guardian'}</p>
                    </div>
                  </div>
                </div>

                {/* Participants & Payment */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Participants & Payment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Participants</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedBooking.participants}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Donation Tickets</p>
                      <p className="text-2xl font-bold text-green-600">{selectedBooking.donation_tickets}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Cost</p>
                      <p className="text-2xl font-bold text-red-600">${selectedBooking.total_cost}</p>
                    </div>
                  </div>
                </div>

                {/* Attendees List */}
                {selectedBooking.attendees && selectedBooking.attendees.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Attendees ({selectedBooking.attendees.filter(a => a.name).length})</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {selectedBooking.attendees.map((attendee, index) => (
                          attendee.name && (
                            <div key={index} className="bg-white p-3 rounded-lg border">
                              <p className="font-medium text-gray-900">{attendee.name}</p>
                              {attendee.grade && <p className="text-sm text-gray-600">Grade: {attendee.grade}</p>}
                              {attendee.school && <p className="text-sm text-gray-600">School: {attendee.school}</p>}
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Process */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Process</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          Payment Completed
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          Total amount of ${selectedBooking.total_cost} has been processed successfully.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Timeline */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">Booking Created</p>
                        <p className="text-sm text-gray-500">{new Date(selectedBooking.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">Payment Processed</p>
                        <p className="text-sm text-gray-500">Payment completed successfully</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">Session Scheduled</p>
                        <p className="text-sm text-gray-500">{new Date(selectedBooking.date).toLocaleDateString()} at {selectedBooking.time_slot}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
