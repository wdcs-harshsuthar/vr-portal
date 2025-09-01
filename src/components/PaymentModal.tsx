import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise, testCards } from '../lib/stripe';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentSuccess: () => void;
  bookingData: any;
}

const PaymentForm: React.FC<{
  amount: number;
  onPaymentSuccess: () => void;
  onClose: () => void;
  bookingData: any;
}> = ({ amount, onPaymentSuccess, onClose, bookingData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');

  const [upiData, setUpiData] = useState({
    upiId: ''
  });

  const handleUpiInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpiData({ upiId: e.target.value });
  };

  const validateUpiForm = () => {
    if (!upiData.upiId) {
      setErrorMessage('Please enter UPI ID');
      return false;
    }
    return true;
  };

  const handleCardPayment = async () => {
    if (!stripe || !elements) {
      setErrorMessage('Stripe has not loaded yet. Please try again.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      // Create payment intent
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          description: `VR College Tour Booking - ${bookingData?.college_name || 'General Tour'}`,
          metadata: {
            bookingId: bookingData?.id || '',
            location: bookingData?.location || '',
            date: bookingData?.date || '',
            participants: bookingData?.participants?.toString() || '1'
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Confirm payment
      const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

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

  const simulateUpiPayment = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Simulate successful UPI payment
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
      await handleCardPayment();
    } else {
      if (!validateUpiForm()) return;
      await simulateUpiPayment();
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
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
                <div
                  key={index}
                  className="block w-full text-left p-2 rounded-lg bg-blue-100"
                >
                  <span className="text-xs font-mono text-blue-700">{card.number}</span>
                  <span className="text-xs text-blue-600 ml-2">({card.name})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stripe Card Element */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Details
            </label>
            <div className="border border-gray-300 rounded-xl p-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors">
              <CardElement options={cardElementOptions} />
            </div>
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
  );
};

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  amount, 
  onPaymentSuccess,
  bookingData 
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod('card');
    }
  }, [isOpen]);

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
        {paymentMethod === 'card' ? (
          <Elements stripe={stripePromise}>
            <PaymentForm
              amount={amount}
              onPaymentSuccess={onPaymentSuccess}
              onClose={onClose}
              bookingData={bookingData}
            />
          </Elements>
        ) : (
          <PaymentForm
            amount={amount}
            onPaymentSuccess={onPaymentSuccess}
            onClose={onClose}
            bookingData={bookingData}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentModal;

