import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminVerifyOTP from './pages/AdminVerifyOTP';
import AdminProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// Lazy load pages
const AdminDashboard = lazy(() => import('./pages/Dashboard'));

// Placeholder pages (to be implemented)
const AdminPagePlaceholder = ({ title }) => (
  <div className="p-6">
    <h1 className="text-3xl font-bold">{title}</h1>
    <p className="text-gray-600 mt-2">Coming soon...</p>
  </div>
);

export const AdminRouter = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/verify-otp" element={<AdminVerifyOTP />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <AdminProtectedRoute>
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <Dashboard />
            </Suspense>
          </AdminProtectedRoute>
        }
      />

      {/* Placeholder Routes */}
      <Route
        path="/products"
        element={
          <AdminProtectedRoute>
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <Products />
            </Suspense>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <AdminProtectedRoute>
            <AdminPagePlaceholder title="Categories Management" />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <AdminProtectedRoute>
            <AdminPagePlaceholder title="Orders Management" />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <AdminProtectedRoute>
            <AdminPagePlaceholder title="Customers Management" />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/coupons"
        element={
          <AdminProtectedRoute>
            <AdminPagePlaceholder title="Coupons Management" />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/banners"
        element={
          <AdminProtectedRoute>
            <AdminPagePlaceholder title="Banners Management" />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/testimonials"
        element={
          <AdminProtectedRoute>
            <AdminPagePlaceholder title="Testimonials Management" />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <AdminProtectedRoute>
            <AdminPagePlaceholder title="Inventory Management" />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <AdminProtectedRoute>
            <AdminPagePlaceholder title="Reports & Analytics" />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <AdminProtectedRoute>
            <AdminPagePlaceholder title="Website Settings" />
          </AdminProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRouter;
