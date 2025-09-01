import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Eye, User } from 'lucide-react';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, isAdmin, logout } = useAuth();

  // Check for admin authentication and update state
  useEffect(() => {
    const checkAdminAuth = () => {
      const adminToken = localStorage.getItem('adminToken');
      const adminUser = localStorage.getItem('adminUser');
      const regularToken = localStorage.getItem('token');
      const regularUser = localStorage.getItem('user');
      
      // Check if there are admin tokens OR if regular user has admin role
      let isAdmin = !!(adminToken && adminUser);
      
      if (!isAdmin && regularUser) {
        try {
          const userData = JSON.parse(regularUser);
          isAdmin = userData.role === 'admin';
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      
      setIsAdminAuthenticated(isAdmin);
    };

    // Check on mount
    checkAdminAuth();

    // Listen for storage changes
    const handleStorageChange = () => {
      checkAdminAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check when location changes (for navigation)
    checkAdminAuth();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  // Hide navigation completely on admin login page
  if (location.pathname === '/admin/login') {
    return null;
  }

  const handleLogout = () => {
    // Handle both regular user and admin logout
    if (isAdminAuthenticated) {
      // Admin logout
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setIsAdminAuthenticated(false);
      window.location.href = '/admin/login';
    } else {
      // Regular user logout
      logout().then(() => {
        // Logout function now handles redirect internally
      }).catch(() => {
        // Logout function handles errors internally
      });
    }
    setIsMenuOpen(false);
  };

  // Determine if user is admin (either from AuthContext or admin localStorage)
  const isUserAdmin = isAdmin || isAdminAuthenticated;
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          {!isUserAdmin ? (
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">360 Hub Experience</span>
            </Link>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Admin Panel</span>
            </div>
          )}
          
          {/* Spacer for admin users to center the title */}
          {isUserAdmin && <div className="flex-1"></div>}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isUserAdmin ? (
              // Regular user navigation
              <>
                {!isAuthenticated ? (
                  // Not logged in - show Home, About, Login, Signup
                  <>
                    <Link
                      to="/"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/') 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      Home
                    </Link>
                    <Link
                      to="/about-us"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/about-us') 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      About
                    </Link>
                    <Link
                      to="/login"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/login') 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        isActive('/signup')
                          ? 'bg-blue-600 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      }`}
                    >
                      Sign Up
                    </Link>
                  </>
                ) : (
                  // Logged in regular user - show Dashboard, Book Tour, Logout
                  <>
                    <Link
                      to="/dashboard"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/dashboard') 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/book-tour"
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        isActive('/book-tour')
                          ? 'bg-blue-600 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      }`}
                    >
                      Book Tour
                    </Link>
                    <Link
                      to="/profile"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/profile') 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <User className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                )}
              </>
            ) : (
              // Admin user navigation - only show Admin Dashboard and Logout
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin/dashboard') 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Admin Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          {/* Spacer for admin users on mobile to center the title */}
          {isUserAdmin && <div className="md:hidden flex-1"></div>}
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
              {!isUserAdmin ? (
                // Regular user mobile navigation
                <>
                  {!isAuthenticated ? (
                    // Not logged in - show Home, About, Login, Signup
                    <>
                      <Link
                        to="/"
                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                          isActive('/') 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Home
                      </Link>
                      <a
                        href="#about"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        About
                      </a>
                      <Link
                        to="/login"
                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                          isActive('/login') 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="block mx-3 mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  ) : (
                    // Logged in regular user - show Dashboard, Book Tour, Logout
                    <>
                      <Link
                        to="/dashboard"
                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                          isActive('/dashboard') 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/book-tour"
                        className="block mx-3 mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Book Tour
                      </Link>
                      <Link
                        to="/profile"
                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                          isActive('/profile') 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <User className="h-5 w-5 mr-2" />
                          Profile
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </>
                  )}
                </>
              ) : (
                // Admin user mobile navigation - only show Admin Dashboard and Logout
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/admin/dashboard') 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;