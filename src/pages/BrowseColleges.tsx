import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, MapPin, Users, GraduationCap, Star, Filter, Globe, Phone, Mail, Eye, ArrowRight, Play, Calendar } from 'lucide-react';

interface College {
  id: number;
  name: string;
  location: string;
  type: 'University' | 'HBCU' | 'Technical College' | 'Community College' | 'Trade School';
  enrollment: string;
  acceptanceRate: string;
  tuition: string;
  programs: string[];
  description: string;
  image: string;
  website: string;
  phone: string;
  email: string;
  vrTourAvailable: boolean;
  featured: boolean;
  rating: number;
}

const BrowseColleges: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [colleges, setColleges] = useState<College[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<College[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [isLoading, setIsLoading] = useState(true);

  // Sample college data based on College Match Pros concept
  const sampleColleges: College[] = [
    {
      id: 1,
      name: "Howard University",
      location: "Washington, DC",
      type: "HBCU",
      enrollment: "10,000+",
      acceptanceRate: "36%",
      tuition: "$28,000/year",
      programs: ["Business", "Engineering", "Medicine", "Arts", "Education"],
      description: "A prestigious Historically Black College and University offering comprehensive programs in various fields with a rich cultural heritage.",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=300&fit=crop",
      website: "https://howard.edu",
      phone: "(202) 806-6100",
      email: "admissions@howard.edu",
      vrTourAvailable: true,
      featured: true,
      rating: 4.8
    },
    {
      id: 2,
      name: "Georgia Institute of Technology",
      location: "Atlanta, GA",
      type: "University",
      enrollment: "32,000+",
      acceptanceRate: "18%",
      tuition: "$32,000/year",
      programs: ["Engineering", "Computer Science", "Business", "Architecture", "Sciences"],
      description: "A top-ranked public research university specializing in technology and engineering with cutting-edge facilities.",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=300&fit=crop",
      website: "https://gatech.edu",
      phone: "(404) 894-2000",
      email: "admissions@gatech.edu",
      vrTourAvailable: true,
      featured: true,
      rating: 4.9
    },
    {
      id: 3,
      name: "Atlanta Technical College",
      location: "Atlanta, GA",
      type: "Technical College",
      enrollment: "4,000+",
      acceptanceRate: "100%",
      tuition: "$8,000/year",
      programs: ["Automotive Technology", "Culinary Arts", "Healthcare", "Information Technology", "Construction"],
      description: "A comprehensive technical college providing hands-on training and career-focused education in high-demand fields.",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=300&fit=crop",
      website: "https://atlantatech.edu",
      phone: "(404) 225-4400",
      email: "info@atlantatech.edu",
      vrTourAvailable: true,
      featured: false,
      rating: 4.5
    },
    {
      id: 4,
      name: "Spelman College",
      location: "Atlanta, GA",
      type: "HBCU",
      enrollment: "2,100+",
      acceptanceRate: "39%",
      tuition: "$29,000/year",
      programs: ["Women's Studies", "Biology", "Economics", "Psychology", "Computer Science"],
      description: "A prestigious women's liberal arts college and HBCU known for academic excellence and leadership development.",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=300&fit=crop",
      website: "https://spelman.edu",
      phone: "(404) 681-3643",
      email: "admissions@spelman.edu",
      vrTourAvailable: true,
      featured: true,
      rating: 4.7
    },
    {
      id: 5,
      name: "DeVry University",
      location: "Chicago, IL",
      type: "University",
      enrollment: "15,000+",
      acceptanceRate: "100%",
      tuition: "$15,000/year",
      programs: ["Business", "Technology", "Healthcare", "Engineering", "Liberal Arts"],
      description: "A private university offering flexible online and on-campus programs designed for working professionals.",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=300&fit=crop",
      website: "https://devry.edu",
      phone: "(800) 334-8250",
      email: "admissions@devry.edu",
      vrTourAvailable: false,
      featured: false,
      rating: 4.2
    },
    {
      id: 6,
      name: "Lincoln Technical Institute",
      location: "Philadelphia, PA",
      type: "Trade School",
      enrollment: "2,500+",
      acceptanceRate: "100%",
      tuition: "$12,000/year",
      programs: ["Automotive", "HVAC", "Welding", "Electrical", "Medical Assisting"],
      description: "A career-focused trade school providing hands-on training in technical and skilled trades.",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=300&fit=crop",
      website: "https://lincolntech.edu",
      phone: "(215) 381-9400",
      email: "info@lincolntech.edu",
      vrTourAvailable: true,
      featured: false,
      rating: 4.3
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setColleges(sampleColleges);
      setFilteredColleges(sampleColleges);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterAndSortColleges();
  }, [searchTerm, selectedType, selectedLocation, sortBy, colleges]);

  const filterAndSortColleges = () => {
    let filtered = colleges.filter(college => {
      const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           college.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           college.programs.some(program => program.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = selectedType === 'all' || college.type === selectedType;
      const matchesLocation = selectedLocation === 'all' || college.location.includes(selectedLocation);
      
      return matchesSearch && matchesType && matchesLocation;
    });

    // Sort colleges
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'enrollment':
          return parseInt(b.enrollment.replace(/\D/g, '')) - parseInt(a.enrollment.replace(/\D/g, ''));
        case 'tuition':
          return parseInt(a.tuition.replace(/\D/g, '')) - parseInt(b.tuition.replace(/\D/g, ''));
        default:
          return 0;
      }
    });

    setFilteredColleges(filtered);
  };

  const handleBookVRTour = (college: College) => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Navigate to booking form with college pre-selected
    navigate('/book-tour', { state: { selectedCollege: college } });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'HBCU': return 'bg-purple-100 text-purple-800';
      case 'University': return 'bg-blue-100 text-blue-800';
      case 'Technical College': return 'bg-green-100 text-green-800';
      case 'Community College': return 'bg-yellow-100 text-yellow-800';
      case 'Trade School': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading colleges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - Matching Home.tsx style */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Discover Your Perfect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                College Match
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-3xl mx-auto">
              Explore colleges and universities across the country with our comprehensive database. 
              From prestigious universities to specialized trade schools, find the institution that fits your goals.
            </p>
            
            {/* Stats - Matching Home.tsx style */}
            <div className="flex flex-wrap justify-center gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{colleges.length}+</div>
                <div className="text-sm text-blue-200">Colleges</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">5+</div>
                <div className="text-sm text-blue-200">Institution Types</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">4</div>
                <div className="text-sm text-blue-200">Major Cities</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Find Your Perfect College</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search colleges, programs, locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="University">University</option>
                <option value="HBCU">HBCU</option>
                <option value="Technical College">Technical College</option>
                <option value="Community College">Community College</option>
                <option value="Trade School">Trade School</option>
              </select>

              {/* Location Filter */}
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Locations</option>
                <option value="Atlanta">Atlanta</option>
                <option value="Washington">Washington</option>
                <option value="Chicago">Chicago</option>
                <option value="Philadelphia">Philadelphia</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
                <option value="enrollment">Sort by Enrollment</option>
                <option value="tuition">Sort by Tuition</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                Showing {filteredColleges.length} of {colleges.length} colleges
              </p>
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-500">Active filters applied</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Colleges Grid Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredColleges.map((college) => (
              <div key={college.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {/* College Image */}
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={college.image}
                    alt={college.name}
                    className="w-full h-full object-cover"
                                      onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=300&fit=crop';
                  }}
                  />
                  {college.featured && (
                    <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold">
                      Featured
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-700">{college.rating}</span>
                  </div>
                </div>

                {/* College Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{college.name}</h3>
                  </div>

                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">{college.location}</span>
                  </div>

                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${getTypeColor(college.type)}`}>
                    {college.type}
                  </span>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{college.description}</p>

                  {/* Quick Stats - Matching Home.tsx style */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{college.enrollment}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      <span>{college.acceptanceRate}</span>
                    </div>
                  </div>

                  {/* Programs */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Popular Programs:</p>
                    <div className="flex flex-wrap gap-2">
                      {college.programs.slice(0, 3).map((program, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {program}
                        </span>
                      ))}
                      {college.programs.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{college.programs.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions - Matching Home.tsx button style */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleBookVRTour(college)}
                      disabled={!college.vrTourAvailable}
                      className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                        college.vrTourAvailable
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {college.vrTourAvailable ? 'Book VR Tour' : 'VR Tour Unavailable'}
                    </button>
                    
                    <button
                      onClick={() => window.open(college.website, '_blank')}
                      className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                      <Globe className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        <span>{college.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        <span>{college.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredColleges.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No colleges found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - Matching Home.tsx style */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Ready to Experience College Life?</h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Book your VR tour today and step into the future of college exploration. 
            Experience campuses like never before with our immersive virtual reality technology.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/book-tour"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-xl"
            >
              Book Your VR Tour
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button className="inline-flex items-center px-8 py-4 border-2 border-blue-500 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BrowseColleges;
