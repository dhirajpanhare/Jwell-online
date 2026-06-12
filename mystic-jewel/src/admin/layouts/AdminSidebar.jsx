import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  List,
  ShoppingCart,
  Users,
  Ticket,
  Image,
  MessageSquare,
  Boxes,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Products', icon: Package, path: '/admin/products' },
  { label: 'Categories', icon: List, path: '/admin/categories' },
  { label: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
  { label: 'Customers', icon: Users, path: '/admin/customers' },
  { label: 'Coupons', icon: Ticket, path: '/admin/coupons' },
  { label: 'Banners', icon: Image, path: '/admin/banners' },
  { label: 'Testimonials', icon: MessageSquare, path: '/admin/testimonials' },
  { label: 'Inventory', icon: Boxes, path: '/admin/inventory' },
  { label: 'Reports', icon: BarChart3, path: '/admin/reports' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

export const AdminSidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useTheme();
  const location = useLocation();

  return (
    <aside
      className={`${
        sidebarCollapsed ? 'w-20' : 'w-64'
      } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {!sidebarCollapsed && <h1 className="text-xl font-bold text-blue-600">Admin</h1>}
        <button
          onClick={toggleSidebar}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={sidebarCollapsed ? item.label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
