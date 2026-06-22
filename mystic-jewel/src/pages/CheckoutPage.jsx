import { useState, useEffect } from 'react';
import { ChevronRight, Lock, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cartApi, orderApi } from '../api/dynamicApiService';
import { useAuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  // Form states
  const [currentStep, setCurrentStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Shipping Address
  const [shippingData, setShippingData] = useState({
    fullName: user?.Name || '',
    phoneNumber: user?.MobileNumber || '',
    email: user?.Email || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [shippingErrors, setShippingErrors] = useState({});

  // Billing Address
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billingData, setBillingData] = useState({
    fullName: user?.Name || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });
  
  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState('standard');
  
  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  
  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  useEffect(() => {
    if (!user?.userId) {
      navigate('/login');
      return;
    }
    loadCart();
  }, [user, navigate]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await cartApi.getCart(user?.userId);
      const items = Array.isArray(data) ? data : data?.data || [];
      
      if (items.length === 0) {
        toast.error('Your cart is empty');
        navigate('/cart');
        return;
      }
      
      setCartItems(items);
    } catch (error) {
      toast.error('Failed to load cart');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const validateShipping = () => {
    const errors = {};
    if (!shippingData.fullName.trim()) errors.fullName = 'Full name required';
    if (!shippingData.phoneNumber.trim()) errors.phoneNumber = 'Phone number required';
    if (!shippingData.address.trim()) errors.address = 'Address required';
    if (!shippingData.city.trim()) errors.city = 'City required';
    if (!shippingData.state.trim()) errors.state = 'State required';
    if (!shippingData.zipCode.trim()) errors.zipCode = 'Zip code required';
    
    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingData(prev => ({ ...prev, [name]: value }));
    if (shippingErrors[name]) {
      setShippingErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Enter a coupon code');
      return;
    }

    try {
      // For now, hardcode some test coupons
      // In production, validate against database
      const testCoupons = {
        'WELCOME50': { discount: 50, type: 'fixed' },
        'SAVE20': { discount: 20, type: 'percentage' },
        'FREEDOM': { discount: 100, type: 'fixed' },
      };

      const coupon = testCoupons[couponCode.toUpperCase()];
      
      if (!coupon) {
        toast.error('Invalid coupon code');
        return;
      }

      const discount = coupon.type === 'percentage' 
        ? Math.round((subtotal * coupon.discount / 100) * 100) / 100
        : coupon.discount;

      setCouponDiscount(discount);
      setCouponApplied(true);
      toast.success(`Coupon applied! Discount: ₹${discount.toFixed(2)}`);
    } catch (error) {
      toast.error('Failed to apply coupon');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponApplied(false);
    toast.success('Coupon removed');
  };

  const handlePlaceOrder = async () => {
    if (!validateShipping()) {
      setCurrentStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        address: shippingData.address,
        city: shippingData.city,
        state: shippingData.state,
        zipCode: shippingData.zipCode,
      };

      const response = await orderApi.createOrder(
        user?.userId,
        orderData,
        paymentMethod,
        `Shipping Method: ${shippingMethod}`
      );

      if (response?.OrderId || response?.data?.OrderId) {
        // Clear cart
        await cartApi.clearCart(user?.userId);
        
        toast.success('Order placed successfully!');
        navigate(`/order-confirmation/${response.OrderId || response.data.OrderId}`);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to place order');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.Price * item.Quantity), 0);
  const shippingCost = shippingMethod === 'express' ? 199 : (subtotal >= 999 ? 0 : 99);
  const gst = Math.round((subtotal + shippingCost) * 0.18 * 100) / 100;
  const total = subtotal + shippingCost + gst - couponDiscount;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Address */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center mb-6 cursor-pointer" onClick={() => setCurrentStep(1)}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                  1
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shipping Address</h2>
                {currentStep > 1 && <ChevronRight className="w-5 h-5 text-green-600 ml-auto" />}
              </div>

              {currentStep >= 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={shippingData.fullName}
                        onChange={handleShippingChange}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                      {shippingErrors.fullName && <p className="text-red-500 text-xs mt-1">{shippingErrors.fullName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={shippingData.phoneNumber}
                        onChange={handleShippingChange}
                        placeholder="9876543210"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                      {shippingErrors.phoneNumber && <p className="text-red-500 text-xs mt-1">{shippingErrors.phoneNumber}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={shippingData.email}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={shippingData.address}
                      onChange={handleShippingChange}
                      placeholder="123 Main Street"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                    {shippingErrors.address && <p className="text-red-500 text-xs mt-1">{shippingErrors.address}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingData.city}
                        onChange={handleShippingChange}
                        placeholder="Mumbai"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                      {shippingErrors.city && <p className="text-red-500 text-xs mt-1">{shippingErrors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={shippingData.state}
                        onChange={handleShippingChange}
                        placeholder="Maharashtra"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                      {shippingErrors.state && <p className="text-red-500 text-xs mt-1">{shippingErrors.state}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Zip Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={shippingData.zipCode}
                        onChange={handleShippingChange}
                        placeholder="400001"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                      {shippingErrors.zipCode && <p className="text-red-500 text-xs mt-1">{shippingErrors.zipCode}</p>}
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                  >
                    Continue to Shipping
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Shipping & Billing */}
            {currentStep >= 2 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center mb-6 cursor-pointer" onClick={() => setCurrentStep(2)}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                    2
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shipping Method</h2>
                  {currentStep > 2 && <ChevronRight className="w-5 h-5 text-green-600 ml-auto" />}
                </div>

                <div className="space-y-4">
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900" onClick={() => setShippingMethod('standard')}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="shipping"
                        value="standard"
                        checked={shippingMethod === 'standard'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <label className="ml-3 text-gray-900 dark:text-white font-medium cursor-pointer flex-grow">
                        Standard Shipping (3-5 days)
                      </label>
                      <span className="text-gray-600 dark:text-gray-400">
                        {subtotal >= 999 ? 'FREE' : '₹99'}
                      </span>
                    </div>
                  </div>

                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900" onClick={() => setShippingMethod('express')}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="shipping"
                        value="express"
                        checked={shippingMethod === 'express'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <label className="ml-3 text-gray-900 dark:text-white font-medium cursor-pointer flex-grow flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Express Shipping (1-2 days)
                      </label>
                      <span className="text-gray-600 dark:text-gray-400">₹199</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentStep(3)}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition mt-4"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Method */}
            {currentStep >= 3 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center mb-6">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                    3
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Method</h2>
                </div>

                <div className="space-y-4">
                  {['credit_card', 'debit_card', 'upi', 'netbanking'].map((method) => (
                    <div key={method} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900" onClick={() => setPaymentMethod(method)}>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="payment"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4"
                        />
                        <label className="ml-3 text-gray-900 dark:text-white font-medium cursor-pointer flex-grow capitalize">
                          {method.replace('_', ' ')}
                        </label>
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Your payment is secure and encrypted
                </p>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto border-b border-gray-200 dark:border-gray-700 pb-4">
                {cartItems.map(item => (
                  <div key={item.ProductId} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.ProductName} x {item.Quantity}
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      ₹{(item.Price * item.Quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                {!couponApplied ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Promo code"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-green-50 dark:bg-green-900 p-3 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">{couponCode}</p>
                      <p className="text-xs text-green-700 dark:text-green-200">Discount: ₹{couponDiscount.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Calculations */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>₹{shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>GST (18%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-2xl text-blue-600">₹{Math.max(0, total).toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={submitting || currentStep < 3}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-bold transition flex items-center justify-center gap-2"
              >
                {submitting ? 'Processing...' : 'Place Order'}
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                You will be redirected to payment gateway
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
