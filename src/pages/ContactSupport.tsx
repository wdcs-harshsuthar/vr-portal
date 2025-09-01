import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Clock, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Eye,
  Calendar,
  Users,
  CreditCard,
  Shield,
  Globe
} from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const ContactSupport: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: "How do I book a VR college tour?",
      answer: "To book a VR college tour, simply navigate to the 'Book Tour' page, select your preferred date (weekends only), choose a location, pick a time slot, specify the number of participants, and proceed to checkout. You'll need to create an account or log in to complete your booking.",
      category: "booking"
    },
    {
      id: 2,
      question: "What equipment do I need for a VR tour?",
      answer: "You'll need a VR headset (Oculus Quest, HTC Vive, or similar), a stable internet connection, and a computer or mobile device. We recommend using a VR headset for the most immersive experience, but desktop viewing is also available.",
      category: "technical"
    },
    {
      id: 3,
      question: "Can I cancel or reschedule my tour?",
      answer: "Yes, you can cancel or reschedule your tour up to 24 hours before the scheduled time. Simply go to your dashboard, find your booking, and use the modify or cancel options. Refunds are processed within 5-7 business days.",
      category: "booking"
    },
    {
      id: 4,
      question: "How much does a VR tour cost?",
      answer: "VR tours cost $40 per participant. We also offer donation options to support other students' access to college exploration. The total cost depends on the number of participants and any additional donations you choose to make.",
      category: "pricing"
    },
    {
      id: 5,
      question: "What colleges are available for VR tours?",
      answer: "We offer VR tours of hundreds of colleges and universities across the United States. You can browse our complete list on the 'Browse Colleges' page, which includes HBCUs, public universities, private colleges, and technical schools.",
      category: "colleges"
    },
    {
      id: 6,
      question: "Is my personal information secure?",
      answer: "Absolutely! We use industry-standard encryption and security measures to protect your personal information. We never sell your data to third parties and only use it to provide our services. Read our Privacy Policy for complete details.",
      category: "security"
    },
    {
      id: 7,
      question: "What if I experience technical issues during my tour?",
      answer: "If you encounter technical issues, our support team is available 24/7. You can contact us through live chat, email, or phone. We'll help you resolve the issue or reschedule your tour if necessary.",
      category: "technical"
    },
    {
      id: 8,
      question: "Can I book tours for groups or school visits?",
      answer: "Yes! We offer special group rates for schools, organizations, and large groups. Contact our support team to discuss group booking options, custom scheduling, and special pricing arrangements.",
      category: "booking"
    },
    {
      id: 9,
      question: "How long does a VR tour typically last?",
      answer: "A typical VR college tour lasts 30-45 minutes, depending on the college and your exploration pace. You can take your time to explore different areas, buildings, and campus features at your own leisure.",
      category: "experience"
    },
    {
      id: 10,
      question: "Do you offer tours in languages other than English?",
      answer: "Currently, our tours are primarily in English. However, we're working on adding multi-language support. If you need assistance in another language, our support team can help arrange accommodations.",
      category: "accessibility"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'booking', name: 'Booking & Tours', icon: Calendar },
    { id: 'technical', name: 'Technical Support', icon: Globe },
    { id: 'pricing', name: 'Pricing & Payment', icon: CreditCard },
    { id: 'colleges', name: 'Colleges & Universities', icon: Users },
    { id: 'security', name: 'Privacy & Security', icon: Shield }
  ];

  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">360 Hub Experience</span>
            </Link>
            <Link
              to="/"
              className="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Support</h1>
          <p className="text-xl text-gray-600">We're here to help with any questions or issues</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Support</h3>
                    <p className="text-gray-600">support@360hubexperience.com</p>
                    <p className="text-sm text-gray-500 mt-1">Response within 2-4 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone Support</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-500 mt-1">Available 24/7</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Office Address</h3>
                    <p className="text-gray-600">123 VR Street, Digital City, DC 12345</p>
                    <p className="text-sm text-gray-500 mt-1">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Support Hours</h3>
                    <p className="text-gray-600">24/7 Technical Support</p>
                    <p className="text-sm text-gray-500 mt-1">Business hours for general inquiries</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                    <option>General Inquiry</option>
                    <option>Technical Support</option>
                    <option>Booking Assistance</option>
                    <option>Billing Question</option>
                    <option>Feedback</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Describe your question or issue..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              
              {/* Category Filter */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                          selectedCategory === category.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      {expandedFAQ === faq.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Links</h2>
              <div className="space-y-3">
                <Link
                  to="/privacy-policy"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">Privacy Policy</span>
                </Link>
                <Link
                  to="/book-tour"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Book a Tour</span>
                </Link>
                <Link
                  to="/browse-colleges"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">Browse Colleges</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;

