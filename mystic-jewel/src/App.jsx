import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import AnnouncementBar from './components/layouts/AnnouncementBar';
import Header from './components/layouts/Header';
import Footer from './components/layouts/Footer';
import MobileBottomNav from './components/layouts/MobileBottomNav';
import CartDrawer from './components/CartDrawer';
import ProtectedRoute from './components/ProtectedRoute';
import { getAuthToken } from './api/authApi';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const ProductList = lazy(() => import('./pages/ProductList'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Login = lazy(() => import('./pages/Login'));
const VerifyOTP = lazy(() => import('./pages/VerifyOTP'));

// Full page loading skeleton
const PageLoader = () => (
  <div className="min-h-screen bg-offwhite flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="flex flex-col min-h-screen">
              {/* Show header and navigation only on non-auth pages */}
              <AuthRouteWrapper />

              <main className="flex-1">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/verify-otp" element={<VerifyOTP />} />

                    {/* Protected Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route
                      path="/wishlist"
                      element={
                        <ProtectedRoute>
                          <Wishlist />
                        </ProtectedRoute>
                      }
                    />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </main>

              <AuthRouteFooter />
              <CartDrawerWrapper isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

// Component to conditionally show header/nav
function AuthRouteWrapper() {
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      setShowHeader(!path.includes('/login') && !path.includes('/verify-otp'));
    };

    window.addEventListener('popstate', handleRouteChange);
    handleRouteChange();

    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  if (!showHeader) return null;

  return (
    <>
      <AnnouncementBar />
      <Header onCartOpen={() => document.dispatchEvent(new CustomEvent('openCart'))} />
    </>
  );
}

// Component to conditionally show footer
function AuthRouteFooter() {
  const [showFooter, setShowFooter] = useState(true);

  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      setShowFooter(!path.includes('/login') && !path.includes('/verify-otp'));
    };

    window.addEventListener('popstate', handleRouteChange);
    handleRouteChange();

    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  if (!showFooter) return null;

  return (
    <>
      <Footer />
      <MobileBottomNav onCartOpen={() => document.dispatchEvent(new CustomEvent('openCart'))} />
    </>
  );
}

// Component for cart drawer
function CartDrawerWrapper({ isCartOpen, setIsCartOpen }) {
  useEffect(() => {
    const handleOpenCart = () => setIsCartOpen(true);
    document.addEventListener('openCart', handleOpenCart);
    return () => document.removeEventListener('openCart', handleOpenCart);
  }, [setIsCartOpen]);

  const path = window.location.pathname;
  if (path.includes('/login') || path.includes('/verify-otp')) return null;

  return <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />;
}

export default App;
