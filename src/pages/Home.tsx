import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Calendar, MapPin, Users, Play, Star, ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                Experience Colleges 
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Like Never Before
                </span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Step into the future of college exploration with our immersive VR tours. 
                Visit campuses across the country without leaving your city.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/book-tour"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-xl"
                >
                  Book Your Tour
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <button className="inline-flex items-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </button>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">100+</div>
                  <div className="text-sm text-blue-200">Colleges</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">5000+</div>
                  <div className="text-sm text-blue-200">Students Helped</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">3</div>
                  <div className="text-sm text-blue-200">Cities</div>
                </div>
              </div>
            </div>

            {/* Visual Placeholder */}
            <div className="relative">
              <div className="aspect-video bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl border border-white/20 flex items-center justify-center backdrop-blur-sm">
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="h-10 w-10 text-white ml-1" />
                  </div>
                  <p className="text-lg font-medium">VR Experience Preview</p>
                  <p className="text-sm text-blue-200 mt-2">Click to watch our virtual tour demo</p>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-20 animate-pulse delay-700"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Our Mission</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            We believe every student deserves the opportunity to explore their dream colleges, 
            regardless of distance or financial constraints. Through cutting-edge VR technology, 
            we're making college visits accessible, affordable, and more immersive than ever before. 
            Our mission is to democratize college exploration and help students make informed decisions 
            about their future education.
          </p>
          
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-sm font-medium">Accessible</span>
            </div>
            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
              <Star className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium">Immersive</span>
            </div>
            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
              <Star className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm font-medium">Affordable</span>
            </div>
            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
              <Star className="h-5 w-5 text-purple-500 mr-2" />
              <span className="text-sm font-medium">Innovative</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose 360 Hub Experience?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've reimagined college visits for the digital age, offering unparalleled access 
              and convenience for students and families.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* VR College Tours */}
            <div className="group p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Immersive VR Tours</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Experience campuses in stunning 360-degree detail. Walk through dorms, 
                classrooms, and facilities as if you're actually there. Our high-quality 
                VR technology makes virtual visits feel incredibly real.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  High-definition 360° video tours
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Interactive campus navigation
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Real-time Q&A with guides
                </li>
              </ul>
            </div>

            {/* Weekend Availability */}
            <div className="group p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Weekend Availability</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We understand families are busy. That's why we offer tours exclusively on 
                weekends, making it convenient for students and parents to explore colleges 
                together without missing school or work.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Saturday & Sunday sessions
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Flexible time slots
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Family-friendly scheduling
                </li>
              </ul>
            </div>

            {/* Multi-City Access */}
            <div className="group p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Multi-City Access</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                With locations in Atlanta, Detroit, and Flint, we're bringing VR college 
                experiences closer to you. No need to travel far – find a convenient 
                location and start exploring.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Atlanta, Georgia
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Detroit, Michigan
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Flint, Michigan
                </li>
              </ul>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
              <p className="text-xl text-blue-100 mb-6">
                Join thousands of students who've already discovered their dream colleges through VR.
              </p>
              <Link
                to="/book-tour"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Book Your Tour Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;