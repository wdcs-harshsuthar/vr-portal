import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, FileText, Users, Database, Globe, Phone, Mail, MapPin } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">Your privacy and data security are our top priorities</p>
          <p className="text-sm text-gray-500 mt-2">Last updated: August 29, 2025</p>
        </div>

        {/* Privacy Policy Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Lock className="h-6 w-6 text-blue-600 mr-3" />
              Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              At 360 Hub Experience, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our VR college tour 
              platform and related services.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              By using our services, you agree to the collection and use of information in accordance with this policy. 
              If you have any questions about this Privacy Policy, please contact us.
            </p>
          </div>

          {/* Information We Collect */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Database className="h-6 w-6 text-green-600 mr-3" />
              Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Account credentials and profile information</li>
                  <li>Booking preferences and tour selections</li>
                  <li>Payment information (processed securely through our payment partners)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Usage Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Device information and IP addresses</li>
                  <li>Browser type and operating system</li>
                  <li>Pages visited and features used</li>
                  <li>Interaction with our platform</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Eye className="h-6 w-6 text-purple-600 mr-3" />
              How We Use Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the collected information for various purposes:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide and maintain our VR college tour services</li>
              <li>Process bookings and manage your account</li>
              <li>Send important updates and notifications</li>
              <li>Improve our platform and user experience</li>
              <li>Ensure security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>

          {/* Information Sharing */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Users className="h-6 w-6 text-orange-600 mr-3" />
              Information Sharing and Disclosure
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>With your explicit consent</li>
              <li>To comply with legal requirements</li>
              <li>To protect our rights and safety</li>
              <li>With trusted service providers who assist in operating our platform</li>
              <li>In connection with a business transfer or merger</li>
            </ul>
          </div>

          {/* Data Security */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Shield className="h-6 w-6 text-red-600 mr-3" />
              Data Security
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement appropriate security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication measures</li>
              <li>Secure payment processing</li>
              <li>Employee training on data protection</li>
            </ul>
          </div>

          {/* Your Rights */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="h-6 w-6 text-indigo-600 mr-3" />
              Your Rights and Choices
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Access and review your personal information</li>
              <li>Update or correct inaccurate information</li>
              <li>Request deletion of your personal data</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent for data processing</li>
              <li>Request data portability</li>
            </ul>
          </div>

          {/* Cookies and Tracking */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Globe className="h-6 w-6 text-teal-600 mr-3" />
              Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your experience:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Essential cookies for platform functionality</li>
              <li>Analytics cookies to improve our services</li>
              <li>Preference cookies to remember your settings</li>
              <li>Marketing cookies for relevant content</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              You can control cookie settings through your browser preferences.
            </p>
          </div>

          {/* Third-Party Services */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our platform may contain links to third-party websites or integrate with third-party services. 
              We are not responsible for the privacy practices of these external services. 
              We encourage you to review their privacy policies before providing any personal information.
            </p>
          </div>

          {/* Children's Privacy */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our services are not intended for children under 13 years of age. 
              We do not knowingly collect personal information from children under 13. 
              If you are a parent or guardian and believe your child has provided us with personal information, 
              please contact us immediately.
            </p>
          </div>

          {/* Changes to Privacy Policy */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the "Last updated" date</li>
              <li>Sending email notifications for significant changes</li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Mail className="h-6 w-6 text-blue-600 mr-3" />
              Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-xl p-6 space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">Email: privacy@360hubexperience.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">Phone: +1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">Address: 123 VR Street, Digital City, DC 12345</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <Link
            to="/contact-support"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Contact Support
            <Mail className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
