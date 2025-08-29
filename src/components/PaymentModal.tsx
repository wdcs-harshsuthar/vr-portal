import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, Lock, CheckCircle, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentSuccess: () => void;
  bookingData: any;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  amount, 
  onPaymentSuccess,
  bookingData 
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [errorMessage, setErrorMessage] = useState('');

  // Test card numbers for Stripe
  const testCards = [
    { number: '4242424242424242', name: 'Visa (Success)', type: 'visa' },
    { number: '4000000000000002', name: 'Visa (Declined)', type: 'visa' },
    { number: '5555555555554444', name: 'Mastercard (Success)', type: 'mastercard' },
    { number: '4000000000009995', name: 'Visa (Insufficient Funds)', type: 'visa' }
  ];

  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    zip: ''
  });

  const [upiData, setUpiData] = useState({
    upiId: ''
  });

  useEffect(() => {
    if (isOpen) {
      setPaymentStatus('pending');
      setErrorMessage('');
      setCardData({ number: '', expiry: '', cvc: '', name: '', zip: '' });
      setUpiData({ upiId: '' });
    }
  }, [isOpen]);

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'number') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }

    // Format expiry date
    if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
    }

    setCardData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleUpiInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpiData({ upiId: e.target.value });
  };

  const validateCardForm = () => {
    if (!cardData.number.replace(/\s/g, '') || !cardData.expiry || !cardData.cvc || !cardData.name || !cardData.zip) {
      setErrorMessage('Please fill in all card details');
      return false;
    }
    return true;
  };

  const validateUpiForm = () => {
    if (!upiData.upiId) {
      setErrorMessage('Please enter UPI ID');
      return false;
    }
    return true;
  };

  const simulatePayment = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Simulate payment processing
      if (paymentMethod === 'card') {
        // Check if it's a test declined card
        const cardNumber = cardData.number.replace(/\s/g, '');
        if (cardNumber === '4000000000000002') {
          throw new Error('Your card was declined. Please try a different card.');
        }
        if (cardNumber === '4000000000009995') {
          throw new Error('Your card has insufficient funds.');
        }
      }

      // Simulate successful payment
      setPaymentStatus('success');
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
      }, 2000);

    } catch (error: any) {
      setPaymentStatus('failed');
      setErrorMessage(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'card') {
      if (!validateCardForm()) return;
    } else {
      if (!validateUpiForm()) return;
    }

    await simulatePayment();
  };

  const selectTestCard = (card: any) => {
    setCardData(prev => ({
      ...prev,
      number: card.number.replace(/(\d{4})/g, '$1 ').trim(),
      name: 'Test User',
      expiry: '12/25',
      cvc: '123',
      zip: '12345'
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Payment Method Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setPaymentMethod('card')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              paymentMethod === 'card'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CreditCard className="h-5 w-5 inline mr-2" />
            Credit/Debit Card
          </button>
          <button
            onClick={() => setPaymentMethod('upi')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              paymentMethod === 'upi'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Smartphone className="h-5 w-5 inline mr-2" />
            UPI
          </button>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount Display */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-gray-600 text-sm">Total Amount</p>
            <p className="text-3xl font-bold text-gray-900">${amount}</p>
          </div>

          {paymentMethod === 'card' ? (
            /* Card Payment Form */
            <div className="space-y-4">
              {/* Test Cards */}
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm font-medium text-blue-900 mb-3">Test Cards (Stripe)</p>
                <div className="space-y-2">
                  {testCards.map((card, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectTestCard(card)}
                      className="block w-full text-left p-2 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <span className="text-xs font-mono text-blue-700">{card.number}</span>
                      <span className="text-xs text-blue-600 ml-2">({card.name})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  name="number"
                  value={cardData.number}
                  onChange={handleCardInputChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Card Details Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiry"
                    value={cardData.expiry}
                    onChange={handleCardInputChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVC
                  </label>
                  <input
                    type="text"
                    name="cvc"
                    value={cardData.cvc}
                    onChange={handleCardInputChange}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={cardData.name}
                  onChange={handleCardInputChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* ZIP Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zip"
                  value={cardData.zip}
                  onChange={handleCardInputChange}
                  placeholder="12345"
                  maxLength={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          ) : (
            /* UPI Payment Form */
            <div className="space-y-4">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-green-700">
                  <Smartphone className="h-4 w-4 inline mr-2" />
                  UPI payments are processed securely through your preferred UPI app
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UPI ID
                </label>
                <input
                  type="text"
                  name="upiId"
                  value={upiData.upiId}
                  onChange={handleUpiInputChange}
                  placeholder="username@upi"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 text-sm">{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {paymentStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-700 text-sm">Payment successful! Redirecting...</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing || paymentStatus === 'success'}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all ${
              isProcessing || paymentStatus === 'success'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105'
            } flex items-center justify-center space-x-2`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing Payment...</span>
              </>
            ) : paymentStatus === 'success' ? (
              <>
                <CheckCircle className="h-5 w-5" />
                <span>Payment Successful!</span>
              </>
            ) : (
              <>
                <Lock className="h-5 w-5" />
                <span>Pay ${amount}</span>
              </>
            )}
          </button>

          {/* Security Notice */}
          <div className="text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center">
              <Lock className="h-3 w-3 mr-1" />
              Secure payment powered by Stripe
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
