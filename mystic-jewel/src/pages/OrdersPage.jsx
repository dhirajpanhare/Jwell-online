import { useState, useEffect } from 'react';
import { Eye, Trash2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderApi } from '../api/dynamicApiService';
import { useAuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const OrdersPage = () => {
  const { user } = useAuthContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getOrders(user?.userId);
      const ordersList = Array.isArray(data) ? data : data?.data || [];
      setOrders(ordersList);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (order) => {
    try {
      const details = await orderApi.getOrderDetails(order.OrderId);
      const orderData = Array.isArray(details) ? details[0] : details?.data?.[0] || details;
      setSelectedOrder(orderData);
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Failed to load order details');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await orderApi.cancelOrder(user?.userId, orderId);
      toast.success('Order cancelled successfully');
      await loadOrders();
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchSearch = order.OrderId?.toString().includes(searchTerm) ||
      order.TotalAmount?.toString().includes(searchTerm);
    const matchStatus = statusFilter === 'all' || (order.Status?.toLowerCase() === statusFilter.toLowerCase());
    return matchSearch && matchStatus;
  });

  const statusBadgeColor = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">{orders.length} order(s) found</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4 flex-col sm:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No orders found</p>
            <Link
              to="/shop"
              className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Order #</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Date</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Amount</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Status</th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredOrders.map((order) => (
                    <tr key={order.OrderId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                        #{order.OrderId}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {new Date(order.CreatedAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">
                        ₹{order.TotalAmount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          statusBadgeColor[order.Status?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {order.Status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(order)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {order.Status?.toLowerCase() === 'pending' && (
                            <button
                              onClick={() => handleDeleteOrder(order.OrderId)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition"
                              title="Cancel order"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Order #{selectedOrder.OrderId}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Order Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedOrder.CreatedAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize inline-block ${
                    statusBadgeColor[selectedOrder.Status?.toLowerCase()] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedOrder.Status}
                  </span>
                </div>
              </div>

              {selectedOrder.OrderItems && selectedOrder.OrderItems.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="font-semibold text-gray-900 dark:text-white mb-3">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.OrderItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {item.ProductName} x {item.Quantity}
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          ₹{(item.Price * item.Quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900 dark:text-white">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{selectedOrder.TotalAmount?.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">Shipping Address</p>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedOrder.ShippingAddress}<br />
                  {selectedOrder.ShippingCity}, {selectedOrder.ShippingState} {selectedOrder.ShippingZipCode}
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 p-6 border-t border-gray-200 dark:border-gray-600 flex gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition"
              >
                Close
              </button>
              <Link
                to={`/order-confirmation/${selectedOrder.OrderId}`}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center font-semibold transition"
              >
                View Full Details
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
