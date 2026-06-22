import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Package, Users, AlertTriangle, Clock } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import {
  getDashboardSummary,
  getRevenueChart,
  getTopProducts,
  getRecentOrders,
} from '../services/dashboardService';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        {sub && <p className="text-xs text-orange-500 mt-1">{sub}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const orderStatusColor = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [summaryData, productsData, ordersData] = await Promise.all([
        getDashboardSummary(),
        getTopProducts(5),
        getRecentOrders(8),
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

  // SP_DashboardSummary returns: TotalOrders, TotalRevenue, TotalProducts, TotalCustomers, PendingOrders, LowStockProducts
  const s = summary || {};

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
            value={`₹${parseFloat(s.TotalRevenue || 0).toLocaleString('en-IN')}`}
            color="bg-blue-600"
          />
          <StatCard
            icon={ShoppingCart}
            label="Total Orders"
            value={s.TotalOrders || 0}
            color="bg-green-600"
            sub={s.PendingOrders ? `${s.PendingOrders} pending` : null}
          />
          <StatCard
            icon={Package}
            label="Total Products"
            value={s.TotalProducts || 0}
            color="bg-purple-600"
            sub={s.LowStockProducts ? `${s.LowStockProducts} low stock` : null}
          />
          <StatCard
            icon={Users}
            label="Total Customers"
            value={s.TotalCustomers || 0}
            color="bg-orange-600"
          />
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products — SP returns: ProductId, ProductName, SalesCount, Price, TotalRevenue */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Products</h2>
            {topProducts.length === 0 ? (
              <p className="text-gray-400 text-sm">No data available</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product) => (
                  <div key={product.ProductId} className="flex justify-between items-center pb-3 border-b dark:border-gray-700">
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 font-medium">{product.ProductName}</p>
                      <p className="text-xs text-gray-400">₹{product.Price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-600 font-semibold text-sm">{product.SalesCount || 0} sales</p>
                      <p className="text-xs text-gray-400">₹{parseFloat(product.TotalRevenue || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders — SP returns: OrderId, OrderNumber, OrderStatus, TotalAmount, OrderDate, CustomerEmail, ItemCount */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Orders</h2>
            {recentOrders.length === 0 ? (
              <p className="text-gray-400 text-sm">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.OrderId} className="flex justify-between items-center pb-3 border-b dark:border-gray-700">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm font-mono">#{order.OrderNumber}</p>
                      <p className="text-xs text-gray-400">{order.CustomerEmail}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${orderStatusColor[order.OrderStatus] || ''}`}>
                        {order.OrderStatus}
                      </span>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">₹{order.TotalAmount}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Alerts row */}
        {(s.PendingOrders > 0 || s.LowStockProducts > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {s.PendingOrders > 0 && (
              <div className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <span className="font-semibold">{s.PendingOrders}</span> orders are waiting to be processed.
                </p>
              </div>
            )}
            {s.LowStockProducts > 0 && (
              <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800 dark:text-red-200">
                  <span className="font-semibold">{s.LowStockProducts}</span> products are running low on stock.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
