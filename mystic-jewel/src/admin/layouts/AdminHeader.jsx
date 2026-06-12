import { useNavigate } from 'react-router-dom';
import { LogOut, Moon, Sun, Bell } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useTheme } from '../context/ThemeContext';

export const AdminHeader = () => {
  const { user, logout } = useAdminAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative">
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-600"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
