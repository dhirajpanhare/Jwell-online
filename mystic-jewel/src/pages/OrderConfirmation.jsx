import { useState, useEffect } from 'react';
import { CheckCircle, Package, Truck, Calendar, MapPin } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderApi } from '../api/dynamicApiService';
import { useAuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.userId) {
      navigate('/login');
      return;
    }
    loadOrder();
  }, [user, orderId, navigate]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getOrderDetails(orderId);
      const orderData = Array.isArray(data) ? data[0] : data?.data?.[0] || data;
      
      if (!orderData) {
        toast.error('Order not found');
        navigate('/');
        return;
      }
      
      setOrder(orderData);
    } catch (error) {
      toast.error('Failed to load order details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Order not found</p>
          <Link to="/" className="text-blue-600 hover:text-blue-700">Return to Home</Link>
        </div>
      </div>
    );
  }

  const estimatedDelivery = new Date(order.CreatedAt || new Date());
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Banner */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 dark:bg-green-900 rounded-full p-4">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg inline-block">
            <p className="text-sm text-gray-600 dark:text-gray-400">Order Number</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
              #{order.OrderId || 'N/A'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Order Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Details
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Order Date</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {new Date(order.CreatedAt || new Date()).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium capitalize">
                  {order.Status || 'Pending'}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Payment Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium capitalize">
                  {order.PaymentStatus || 'Pending'}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Total Amount</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{(order.TotalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Shipping Details
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Shipping Address</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {order.ShippingAddress || 'N/A'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {order.ShippingCity}, {order.ShippingState} {order.ShippingZipCode}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Delivery</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {estimatedDelivery.toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">3-5 business days</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        {order.OrderItems && order.OrderItems.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Order Items</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-900 dark:text-white">Product</th>
                    <th className="px-4 py-2 text-left text-gray-900 dark:text-white">Quantity</th>
                    <th className="px-4 py-2 text-left text-gray-900 dark:text-white">Price</th>
                    <th className="px-4 py-2 text-right text-gray-900 dark:text-white">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {order.OrderItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{item.ProductName}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.Quantity}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">₹{item.Price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-gray-900 dark:text-white font-medium">
                        ₹{(item.Price * item.Quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>

          <div className="space-y-2">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>₹{((order.TotalAmount || 0) * 0.81).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Shipping</span>
              <span>₹{((order.TotalAmount || 0) * 0.1).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>GST (18%)</span>
              <span>₹{((order.TotalAmount || 0) * 0.18).toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between items-center">
              <span className="font-bold text-gray-900 dark:text-white">Total Amount</span>
              <span className="text-2xl font-bold text-blue-600">₹{(order.TotalAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 flex-col sm:flex-row">
          <Link
            to="/orders"
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-center transition"
          >
            View All Orders
          </Link>
          <Link
            to="/shop"
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
          <p className="text-blue-900 dark:text-blue-100 mb-3">
            <strong>Need help?</strong> We're here to assist you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="mailto:support@mysticjewel.com" className="text-blue-600 dark:text-blue-300 hover:underline">
              📧 support@mysticjewel.com
            </a>
            <a href="tel:+919876543210" className="text-blue-600 dark:text-blue-300 hover:underline">
              📞 +91 98765 43210
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
