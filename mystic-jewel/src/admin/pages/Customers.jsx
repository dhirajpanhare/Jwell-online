import { useState, useEffect } from 'react';
import { Eye, Trash2, Search, X } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import toast from 'react-hot-toast';
import { customerApi } from '../../api/dynamicApiService';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerApi.getCustomerList(null, currentPage, itemsPerPage);
      setCustomers(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      toast.error('Failed to load customers');
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (customer) => {
    setSelectedCustomer(customer);
    try {
      const orders = await customerApi.getCustomerOrders(customer.UserId || customer.id);
      setCustomerOrders(Array.isArray(orders) ? orders : orders?.data || []);
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Failed to load customer details');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer? This will also delete their order history.')) return;

    try {
      await customerApi.deleteCustomer(customerId);
      toast.success('Customer deleted successfully');
      await loadCustomers();
    } catch (error) {
      toast.error(error.message || 'Failed to delete customer');
    }
  };

  // Filter and paginate
  const filteredCustomers = customers.filter(customer =>
    (customer.UserName || customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.Email || customer.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.Phone || customer.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayCustomers = filteredCustomers.slice(0, itemsPerPage);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customers</h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* Customers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : displayCustomers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Name</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Email</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Phone</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Total Orders</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Total Spent</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Joined</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {displayCustomers.map((customer) => {
                      const joinDate = new Date(customer.CreatedAt || customer.createdAt || Date.now());
                      return (
                        <tr key={customer.UserId || customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                            {customer.UserName || customer.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                            {customer.Email || customer.email || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                            {customer.Phone || customer.phone || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                            {customer.TotalOrders || customer.totalOrders || 0}
                          </td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                            ₹{parseFloat(customer.TotalSpent || customer.totalSpent || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs">
                            {joinDate.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleViewDetails(customer)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCustomer(customer.UserId || customer.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No customers found</p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Details Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedCustomer?.UserName || 'Customer'} - Details
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Name</label>
                    <p className="text-gray-900 dark:text-white">{selectedCustomer?.UserName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Email</label>
                    <p className="text-gray-900 dark:text-white break-all">{selectedCustomer?.Email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Phone</label>
                    <p className="text-gray-900 dark:text-white">{selectedCustomer?.Phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Member Since</label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(selectedCustomer?.CreatedAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Order History</h3>
                {customerOrders.length > 0 ? (
                  <div className="space-y-2 border-t border-b border-gray-200 dark:border-gray-700 py-3">
                    {customerOrders.map((order, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0">
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium">Order #{order.OrderNumber || order.id}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                            {new Date(order.CreatedAt || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-900 dark:text-white font-medium">
                            ₹{parseFloat(order.TotalAmount || 0).toFixed(2)}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            (order.OrderStatus || 'pending') === 'delivered'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {order.OrderStatus || 'pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No orders yet</p>
                )}
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedCustomer?.TotalOrders || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Lifetime Value</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{parseFloat(selectedCustomer?.TotalSpent || 0).toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Customers;
