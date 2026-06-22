import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import AdminProtectedRoute from '../components/AdminProtectedRoute';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const Categories = lazy(() => import('./pages/Categories'));
const Orders = lazy(() => import('./pages/Orders'));
const Customers = lazy(() => import('./pages/Customers'));
const Coupons = lazy(() => import('./pages/Coupons'));
const Banners = lazy(() => import('./pages/Banners'));

const Fallback = <LoadingSpinner fullScreen />;

const guard = (Component) => (
  <AdminProtectedRoute>
    <Suspense fallback={Fallback}>
      <Component />
    </Suspense>
  </AdminProtectedRoute>
);

// Placeholder for pages coming in future phases
const Soon = ({ title }) => (
  <div className="p-6">
    <h1 className="text-3xl font-bold">{title}</h1>
    <p className="text-gray-500 mt-2">Coming soon...</p>
  </div>
);

export const AdminRouter = () => (
  <Routes>
    <Route path="/dashboard"   element={guard(Dashboard)} />
    <Route path="/products"    element={guard(Products)} />
    <Route path="/categories"  element={guard(Categories)} />
    <Route path="/orders"      element={guard(Orders)} />
    <Route path="/customers"   element={guard(Customers)} />
    <Route path="/coupons"     element={guard(Coupons)} />
    <Route path="/banners"     element={guard(Banners)} />

    {/* Future phases */}
    <Route path="/testimonials" element={<AdminProtectedRoute><Soon title="Testimonials" /></AdminProtectedRoute>} />
    <Route path="/inventory"    element={<AdminProtectedRoute><Soon title="Inventory" /></AdminProtectedRoute>} />
    <Route path="/reports"      element={<AdminProtectedRoute><Soon title="Reports & Analytics" /></AdminProtectedRoute>} />
    <Route path="/settings"     element={<AdminProtectedRoute><Soon title="Settings" /></AdminProtectedRoute>} />

    <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
  </Routes>
);

export default AdminRouter;
