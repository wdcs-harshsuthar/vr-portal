import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  GraduationCap, 
  Users, 
  Globe, 
  Heart, 
  Target, 
  Award,
  MapPin,
  Clock,
  Shield,
  Zap,
  Star
} from 'lucide-react';

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About VR Portal
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Revolutionizing college exploration through immersive virtual reality technology
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              VR Portal integrates cutting-edge technology into education by utilizing virtual reality headsets 
              that enable students to tour colleges as if they were physically on campus. Since COVID, college 
              campus tours have declined significantly, with many students missing out on crucial college exploration opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Virtual Exploration</h3>
              <p className="text-gray-600">
                Experience college campuses from anywhere in the world through immersive VR technology
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Accessible Education</h3>
              <p className="text-gray-600">
                Make college exploration accessible to all students regardless of location or financial constraints
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Informed Decisions</h3>
              <p className="text-gray-600">
                Help students make informed college choices through comprehensive virtual experiences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p>
                  VR Portal was born out of a deep understanding of the crucial role exposure plays in shaping 
                  educational opportunities. We recognized that many students face limited access to college 
                  exploration, especially those from underserved communities.
                </p>
                <p>
                  "I hardly saw my counselor, and he knew little about the full range of college options available," 
                  recalls our founder. This lack of visibility and guidance inspired us to create a solution that 
                  would democratize college exploration.
                </p>
                <p>
                  Drawing from personal experiences and the challenges faced by countless students nationwide, 
                  we founded VR Portal to provide early knowledge and guidance for students seeking their ideal 
                  college match.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex items-center mb-4">
                  <GraduationCap className="h-8 w-8 mr-3" />
                  <h3 className="text-xl font-semibold">Our Vision</h3>
                </div>
                <p className="text-blue-100 leading-relaxed">
                  To create not only an exceptional college tour experience but also one that leaves a lasting 
                  impression. VR Portal allows students to explore multiple colleges across various states without 
                  ever leaving their city.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why Choose VR Portal?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We offer a safe, affordable, convenient, and revolutionary way to tour colleges, 
              reflecting the needs of our times.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Safe & Secure</h3>
              </div>
              <p className="text-gray-600">
                Explore campuses safely from the comfort of your home, eliminating travel risks and costs.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Zap className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Convenient</h3>
              </div>
              <p className="text-gray-600">
                Access multiple college tours anytime, anywhere, without the need for extensive travel planning.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Heart className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Affordable</h3>
              </div>
              <p className="text-gray-600">
                Save thousands on travel expenses while gaining comprehensive college insights.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Globe className="h-6 w-6 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Comprehensive</h3>
              </div>
              <p className="text-gray-600">
                Explore colleges across different states and regions in one unified platform.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-orange-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Time-Saving</h3>
              </div>
              <p className="text-gray-600">
                Efficiently compare multiple colleges without the time commitment of physical visits.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Star className="h-6 w-6 text-yellow-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Immersive</h3>
              </div>
              <p className="text-gray-600">
                Experience campus life through cutting-edge virtual reality technology.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Our Impact
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Given the overwhelming counselor-to-student ratios in high schools nationwide, 
              VR Portal strives to replicate a personalized counseling experience online while 
              creating a phenomenal virtual reality experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-blue-100">Colleges Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">States Covered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-blue-100">Students Served</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join us in taking your college tour into the metaverse. Discover your options, 
            find your fit, or simply explore different college campuses to broaden your exposure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/book-tour"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              <Eye className="h-5 w-5 mr-2" />
              Start Virtual Tour
            </Link>
            <Link
              to="/contact-support"
              className="inline-flex items-center px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
