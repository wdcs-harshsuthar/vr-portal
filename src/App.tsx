import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
<<<<<<< HEAD
import BookTour from './pages/BookTour';
import BrowseColleges from './pages/BrowseColleges';
import AdminDashboard from './pages/AdminDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ContactSupport from './pages/ContactSupport';
=======
import AdminDashboard from './pages/AdminDashboard';
import BookTour from './pages/BookTour';
import AdminRoute from './components/AdminRoute';
>>>>>>> 8c9d782b51df86acdf3f79094d50305611f9cc65

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/contact-support" element={<ContactSupport />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/book-tour" 
                element={
                  <ProtectedRoute>
                    <BookTour />
                  </ProtectedRoute>
                } 
              />
<<<<<<< HEAD
              <Route path="/browse-colleges" element={<BrowseColleges />} />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={<AdminDashboard />} 
=======
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
>>>>>>> 8c9d782b51df86acdf3f79094d50305611f9cc65
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;