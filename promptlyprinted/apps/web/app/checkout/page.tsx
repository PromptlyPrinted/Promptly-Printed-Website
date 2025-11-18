'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CheckoutItem {
  productId: number;
  name: string;
  price: number;
  copies: number;
  images: Array<{ url: string }>;
  color: string;
  size: string;
  designUrl?: string;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
}

// Declare Square types
declare global {
  interface Window {
    Square?: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [squareLoaded, setSquareLoaded] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'shipping' | 'payment'>('shipping');
  const cardRef = useRef<any>(null);
  const applePayRef = useRef<any>(null);
  const googlePayRef = useRef<any>(null);
  const [applePayAvailable, setApplePayAvailable] = useState(false);
  const [googlePayAvailable, setGooglePayAvailable] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    type: string;
    value: number;
    discountAmount: number;
  } | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [validatingDiscount, setValidatingDiscount] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: 'GB',
  });

  useEffect(() => {
    // Get items from localStorage
    const cartItems = localStorage.getItem('cartItems');
    if (cartItems) {
      try {
        const parsedItems = JSON.parse(cartItems);
        setItems(parsedItems);
      } catch (e) {
        console.error('Failed to parse cart items:', e);
        setError('Failed to load cart items');
      }
    } else {
      setError('No items in cart');
    }

    // Load Square SDK dynamically - use production or sandbox based on SQUARE_ENVIRONMENT
    const script = document.createElement('script');
    const isProduction = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === 'production';
    script.src = isProduction
      ? 'https://web.squarecdn.com/v1/square.js'
      : 'https://sandbox.web.squarecdn.com/v1/square.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      console.log('Square SDK loaded');
      setSquareLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Square SDK');
      setError('Failed to load payment processor');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup payment instances per Square docs
      const cleanup = async () => {
        try {
          if (cardRef.current) {
            await cardRef.current.destroy();
          }
          if (applePayRef.current) {
            await applePayRef.current.destroy();
          }
          if (googlePayRef.current) {
            await googlePayRef.current.destroy();
          }
        } catch (e) {
          console.error('Error cleaning up payment instances:', e);
        }
      };
      cleanup();

      // Remove script
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const initializeSquarePayments = async () => {
    if (!window.Square) {
      console.error('Square.js failed to load');
      return;
    }

    const applicationId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

    if (!applicationId || applicationId === 'sandbox') {
      console.error('Square Application ID not configured properly');
      setError(
        'Payment system not configured. Please add your Square Application ID to environment variables. For now, you can use the fallback payment method.'
      );
      return;
    }

    try {
      const payments = window.Square.payments(applicationId, locationId);

      // Initialize Card payment
      const card = await payments.card();
      await card.attach('#card-container');
      cardRef.current = card;

      // Create payment request for digital wallets
      const paymentRequest = payments.paymentRequest({
        countryCode: shippingAddress.country || 'GB',
        currencyCode: 'GBP',
        total: {
          amount: calculateTotal().toFixed(2),
          label: 'Total',
        },
      });

      // Initialize Apple Pay if available
      try {
        const applePay = await payments.applePay(paymentRequest);
        await applePay.attach('#apple-pay-button');
        applePayRef.current = applePay;
        setApplePayAvailable(true);
        console.log('Apple Pay initialized successfully');

        // Set up Apple Pay click handler per Square docs
        const applePayButtonTarget = document.getElementById('apple-pay-button');
        if (applePayButtonTarget) {
          applePayButtonTarget.onclick = async (event) => {
            event.preventDefault();
            await handleDigitalWalletPayment('applePay');
          };
        }
      } catch (e) {
        console.log('Apple Pay not available:', e);
      }

      // Initialize Google Pay if available
      try {
        const googlePay = await payments.googlePay(paymentRequest);
        // Attach with customization options per Square docs
        await googlePay.attach('#google-pay-button', {
          buttonColor: 'black',
          buttonSizeMode: 'fill',
          buttonType: 'long',
        });
        googlePayRef.current = googlePay;
        setGooglePayAvailable(true);
        console.log('Google Pay initialized successfully');

        // Set up Google Pay click handler per Square docs
        const googlePayButtonTarget = document.getElementById('google-pay-button');
        if (googlePayButtonTarget) {
          googlePayButtonTarget.onclick = async (event) => {
            event.preventDefault();
            await handleDigitalWalletPayment('googlePay');
          };
        }
      } catch (e) {
        console.log('Google Pay not available:', e);
      }

      console.log('Square payment form initialized');
    } catch (e) {
      console.error('Failed to initialize Square payments:', e);
      setError('Direct card payment is not available in development mode due to CORS restrictions. Please use the secure payment link below.');
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + item.price * item.copies, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = appliedDiscount?.discountAmount || 0;
    return subtotal - discount;
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }

    setValidatingDiscount(true);
    setDiscountError(null);

    try {
      const response = await fetch('/api/checkout/validate-discount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: discountCode.trim(),
          orderAmount: calculateSubtotal(),
        }),
      });

      const data = await response.json();

      if (data.valid && data.discountCode) {
        setAppliedDiscount(data.discountCode);
        setDiscountError(null);
      } else {
        setDiscountError(data.error || 'Invalid discount code');
        setAppliedDiscount(null);
      }
    } catch (err) {
      console.error('Discount validation error:', err);
      setDiscountError('Failed to validate discount code');
      setAppliedDiscount(null);
    } finally {
      setValidatingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError(null);
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStep('payment');
    // Initialize Square payments when moving to payment step
    setTimeout(() => initializeSquarePayments(), 100);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardRef.current) {
      setError('Payment form not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Tokenize the card details
      const result = await cardRef.current.tokenize();

      if (result.status === 'OK') {
        const token = result.token;
        console.log('Payment token:', token);

        // Send payment to backend
        const response = await fetch('/api/checkout/complete-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceId: token,
            items,
            shippingAddress,
            discountCode: appliedDiscount?.code,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Payment failed');
        }

        const data = await response.json();

        // Clear cart
        localStorage.removeItem('cartItems');

        // Redirect to success page
        router.push(`/checkout/success?orderId=${data.orderId}`);
      } else {
        console.error('Tokenization errors:', result.errors);
        throw new Error(result.errors?.[0]?.message || 'Failed to process card');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment processing failed');
      setLoading(false);
    }
  };

  const handleDigitalWalletPayment = async (paymentMethod: 'applePay' | 'googlePay') => {
    const paymentRef = paymentMethod === 'applePay' ? applePayRef : googlePayRef;
    const paymentName = paymentMethod === 'applePay' ? 'Apple Pay' : 'Google Pay';

    if (!paymentRef.current) {
      setError(`${paymentName} not initialized`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Tokenize per Square documentation
      const tokenResult = await paymentRef.current.tokenize();

      if (tokenResult.status === 'OK') {
        console.log(`${paymentName} token:`, tokenResult.token);

        // Send payment token to backend
        const response = await fetch('/api/checkout/complete-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceId: tokenResult.token,
            items,
            shippingAddress,
            discountCode: appliedDiscount?.code,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || data.error || 'Payment failed');
        }

        const data = await response.json();

        // Clear cart and redirect to success page
        localStorage.removeItem('cartItems');
        router.push(`/checkout/success?orderId=${data.orderId}`);
      } else {
        // Handle tokenization failure per Square docs
        let errorMessage = `Tokenization failed: ${tokenResult.status}`;
        if (tokenResult.errors) {
          errorMessage += ` - ${JSON.stringify(tokenResult.errors)}`;
          console.error(`${paymentName} tokenization errors:`, tokenResult.errors);
        }
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error(`${paymentName} payment error:`, err);
      setError(err instanceof Error ? err.message : `${paymentName} payment processing failed`);
      setLoading(false);
    }
  };

  const handleFallbackPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          shippingAddress,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Checkout failed');
      }

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during checkout');
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(price);
  };

  if (error && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cart Empty</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Secure Checkout</h1>
            <p className="text-gray-600 mt-2">
              {paymentStep === 'shipping' ? 'Shipping Information' : 'Payment Details'}
            </p>

            {/* Progress indicator */}
            <div className="flex justify-center items-center mt-4 gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                paymentStep === 'shipping' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
              }`}>
                {paymentStep === 'payment' ? '✓' : '1'}
              </div>
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                paymentStep === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-lg p-6 lg:order-2 h-fit sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    {item.images && item.images[0] && (
                      <div className="relative w-24 h-24 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={item.images[0].url}
                          alt={item.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">Color: {item.color}</p>
                      <p className="text-sm text-gray-600">Size: {item.size}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.copies}</p>
                      {item.designUrl && (
                        <p className="text-sm text-blue-600">Custom Design</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.price * item.copies)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code Input */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="space-y-2">
                  {!appliedDiscount ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => {
                          setDiscountCode(e.target.value.toUpperCase());
                          setDiscountError(null);
                        }}
                        placeholder="Discount code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      />
                      <button
                        onClick={handleApplyDiscount}
                        disabled={validatingDiscount || !discountCode.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                      >
                        {validatingDiscount ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-green-900">{appliedDiscount.code}</span>
                      </div>
                      <button
                        onClick={handleRemoveDiscount}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  {discountError && (
                    <p className="text-sm text-red-600">{discountError}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(calculateSubtotal())}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedDiscount.code})</span>
                    <span>-{formatPrice(appliedDiscount.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Calculated at next step</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure SSL Encrypted Payment</span>
              </div>
            </div>

            {/* Forms */}
            <div className="bg-white rounded-lg shadow-lg p-6 lg:order-1">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {paymentStep === 'shipping' ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
                  <form onSubmit={handleShippingSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          required
                          value={shippingAddress.firstName}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="John"
                        />
                      </div>

                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          required
                          value={shippingAddress.lastName}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={shippingAddress.email}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="john.doe@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        required
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="+44 7700 900000"
                        pattern="[+]?[0-9\s\-\(\)]+"
                        title="Please enter a valid phone number with country code"
                      />
                      <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +44 for UK)</p>
                    </div>

                    <div>
                      <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        id="addressLine1"
                        required
                        value={shippingAddress.addressLine1}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div>
                      <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        id="addressLine2"
                        value={shippingAddress.addressLine2}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Apartment, suite, etc."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          id="city"
                          required
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="London"
                        />
                      </div>

                      <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          required
                          value={shippingAddress.postalCode}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="SW1A 1AA"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                        Country *
                      </label>
                      <select
                        id="country"
                        required
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="GB">United Kingdom</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="ES">Spain</option>
                        <option value="IT">Italy</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                    >
                      Continue to Payment
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
                    <button
                      onClick={() => setPaymentStep('shipping')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      ← Edit Shipping
                    </button>
                  </div>

                  {/* Shipping Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Shipping To:</h3>
                    <p className="text-sm text-gray-600">
                      {shippingAddress.firstName} {shippingAddress.lastName}<br />
                      {shippingAddress.addressLine1}<br />
                      {shippingAddress.addressLine2 && <>{shippingAddress.addressLine2}<br /></>}
                      {shippingAddress.city}, {shippingAddress.postalCode}<br />
                      {shippingAddress.email}
                    </p>
                  </div>

                  {error && (error.includes('Application ID') || error.includes('CORS') || error.includes('development mode')) ? (
                    // Show fallback payment button if Square SDK not configured
                    <div className="space-y-6">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800 mb-2">
                          <strong>Note:</strong> Square's Web SDK has CORS restrictions on localhost. Click below to continue with a secure hosted payment page.
                        </p>
                        <p className="text-xs text-yellow-700 mt-2">
                          💡 In production (deployed site), the card form will work directly on this page.
                        </p>
                      </div>

                      <button
                        onClick={handleFallbackPayment}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          `Continue to Secure Payment - ${formatPrice(calculateTotal())}`
                        )}
                      </button>

                      <p className="text-sm text-gray-500 text-center">
                        You'll be redirected to a secure payment page
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handlePaymentSubmit} className="space-y-6">
                      {/* Digital Wallet Buttons */}
                      {(applePayAvailable || googlePayAvailable) && (
                        <div className="space-y-3">
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-2 bg-white text-gray-500">Express Checkout</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            {applePayAvailable && (
                              <div
                                id="apple-pay-button"
                                className="h-12 rounded-lg overflow-hidden cursor-pointer"
                              ></div>
                            )}
                            {googlePayAvailable && (
                              <div
                                id="google-pay-button"
                                className="h-12 rounded-lg overflow-hidden cursor-pointer"
                              ></div>
                            )}
                          </div>

                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-2 bg-white text-gray-500">Or pay with card</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Card Payment Form */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Details *
                        </label>
                        <div
                          id="card-container"
                          className="border border-gray-300 rounded-lg p-4 min-h-[120px] bg-white"
                        ></div>
                        <p className="text-xs text-gray-500 mt-2">
                          Test Card: 4111 1111 1111 1111 | CVV: 111 | Any future expiry
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !squareLoaded}
                        className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Processing Payment...
                          </span>
                        ) : (
                          `Pay ${formatPrice(calculateTotal())}`
                        )}
                      </button>

                      <p className="text-sm text-gray-500 text-center">
                        By placing your order, you agree to our Terms of Service and Privacy Policy
                      </p>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
