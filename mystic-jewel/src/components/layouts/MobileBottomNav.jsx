import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const MobileBottomNav = ({ onCartOpen }) => {
  const location = useLocation();
  const { getCartCount } = useCart();
  const { wishlistItems } = useWishlist();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2">
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 px-4 py-2 ${
            isActive('/') ? 'text-teal' : 'text-gray-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </Link>

        <Link
          to="/products"
          className={`flex flex-col items-center gap-1 px-4 py-2 ${
            isActive('/products') ? 'text-teal' : 'text-gray-600'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-xs">Search</span>
        </Link>

        <Link
          to="/wishlist"
          className={`flex flex-col items-center gap-1 px-4 py-2 relative ${
            isActive('/wishlist') ? 'text-teal' : 'text-gray-600'
          }`}
        >
          <Heart className="w-5 h-5" />
          {wishlistItems.length > 0 && (
            <span className="absolute top-1 right-2 bg-maroon text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {wishlistItems.length}
            </span>
          )}
          <span className="text-xs">Wishlist</span>
        </Link>

        <button
          className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600"
        >
          <User className="w-5 h-5" />
          <span className="text-xs">Profile</span>
        </button>

        <button
          onClick={onCartOpen}
          className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600 relative"
        >
          <ShoppingBag className="w-5 h-5" />
          {getCartCount() > 0 && (
            <span className="absolute top-1 right-2 bg-maroon text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {getCartCount()}
            </span>
          )}
          <span className="text-xs">Cart</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
