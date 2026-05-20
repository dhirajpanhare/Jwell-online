import { lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import AnnouncementBar from './components/layouts/AnnouncementBar';
import Header from './components/layouts/Header';
import Footer from './components/layouts/Footer';
import MobileBottomNav from './components/layouts/MobileBottomNav';
import CartDrawer from './components/CartDrawer';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const ProductList = lazy(() => import('./pages/ProductList'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Wishlist = lazy(() => import('./pages/Wishlist'));

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
      <CartProvider>
        <WishlistProvider>
          <div className="flex flex-col min-h-screen">
            <AnnouncementBar />
            <Header onCartOpen={() => setIsCartOpen(true)} />
            
            <main className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                </Routes>
              </Suspense>
            </main>

            <Footer />
            <MobileBottomNav onCartOpen={() => setIsCartOpen(true)} />
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          </div>
        </WishlistProvider>
      </CartProvider>
    </Router>
  );
}

export default App;
