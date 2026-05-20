import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden card-shadow">
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {product.isLightweight && (
            <span className="absolute top-2 left-2 bg-teal text-white text-xs px-2 py-1 rounded">
              Lightweight
            </span>
          )}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
              isInWishlist(product.id)
                ? 'bg-maroon text-white'
                : 'bg-white text-gray-600 hover:bg-maroon hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{product.category}</p>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-4 h-4 fill-gold text-gold" />
            <span className="text-sm font-medium">{product.rating}</span>
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-maroon">₹{product.price}</span>
            <button
              onClick={handleAddToCart}
              className={`p-2 rounded-lg transition-colors ${
                isInCart(product.id)
                  ? 'bg-teal text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-teal hover:text-white'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Skeleton Loader
export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg overflow-hidden card-shadow animate-pulse">
      <div className="aspect-square bg-gray-200"></div>
      <div className="p-4">
        <div className="h-5 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
