import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useTheme } from '../context/ThemeContext';

export const AdminLayout = ({ children }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark' : ''}`}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
