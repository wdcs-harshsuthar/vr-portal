import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51234567890abcdef'; // This is a placeholder

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, string>;
}

export const createPaymentIntent = async (paymentData: PaymentData) => {
  try {
    // In a real application, this would call your backend to create a payment intent
    // For testing purposes, we'll simulate the payment process
    
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Payment intent creation error:', error);
    throw error;
  }
};

export const processTestPayment = async (amount: number): Promise<{ success: boolean; paymentId?: string; error?: string }> => {
  // Simulate payment processing for testing
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate successful payment 90% of the time
      if (Math.random() > 0.1) {
        resolve({
          success: true,
          paymentId: `pi_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
      } else {
        resolve({
          success: false,
          error: 'Payment declined - insufficient funds (test mode)'
        });
      }
    }, 2000); // Simulate 2-second processing time
  });
};