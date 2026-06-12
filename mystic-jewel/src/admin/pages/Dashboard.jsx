import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import {
  getDashboardSummary,
  getRevenueChart,
  getTopProducts,
  getRecentOrders,
} from '../services/dashboardService';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

export const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [summaryData, productsData, ordersData] = await Promise.all([
        getDashboardSummary(),
        getTopProducts(5),
        getRecentOrders(5),
      ]);
      setSummary(summaryData);
      setTopProducts(productsData);
      setRecentOrders(ordersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <AdminLayout><LoadingSpinner fullScreen /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={`₹${summary?.totalRevenue || 0}`}
            color="bg-blue-600"
          />
          <StatCard
            icon={ShoppingCart}
            label="Total Orders"
            value={summary?.totalOrders || 0}
            color="bg-green-600"
          />
          <StatCard
            icon={Package}
            label="Total Products"
            value={summary?.totalProducts || 0}
            color="bg-purple-600"
          />
          <StatCard
            icon={Users}
            label="Total Customers"
            value={summary?.totalCustomers || 0}
            color="bg-orange-600"
          />
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Products</h2>
            <div className="space-y-3">
              {topProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center pb-3 border-b dark:border-gray-700">
                  <span className="text-gray-700 dark:text-gray-300">{product.name}</span>
                  <span className="text-blue-600 font-semibold">{product.sales || 0} sales</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Orders</h2>
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center pb-3 border-b dark:border-gray-700">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Order #{order.id}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.customerName}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-semibold">
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
