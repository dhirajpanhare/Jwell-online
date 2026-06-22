import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Support both real API fields (ProductId, ProductName, Price) and mock fields (id, name, price)
  const productId = product.ProductId || product.id;
  const name = product.ProductName || product.name || '';
  const price = product.Price || product.price || 0;
  const category = product.CategoryName || product.category || '';
  const rating = product.AverageRating || product.rating || 0;
  const image =
    (product.ProductImages && product.ProductImages[0]?.ImageUrl) ||
    product.ImageUrl ||
    product.image ||
    'https://via.placeholder.com/300x300?text=No+Image';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <Link to={`/product/${productId}`} className="group block">
      <div className="bg-white rounded-lg overflow-hidden card-shadow hover:shadow-lg transition-shadow duration-300">
        {/* Image */}
        <div className="relative overflow-hidden aspect-square bg-gray-100">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'; }}
          />
          {/* Wishlist button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-2 right-2 p-2 rounded-full shadow transition-colors ${
              isInWishlist(productId)
                ? 'bg-maroon text-white'
                : 'bg-white text-gray-600 hover:bg-maroon hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isInWishlist(productId) ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{name}</h3>
          {category && <p className="text-sm text-gray-500 mb-2">{category}</p>}

          {rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-4 h-4 fill-gold text-gold" />
              <span className="text-sm font-medium">{parseFloat(rating).toFixed(1)}</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <span className="text-xl font-bold text-maroon">₹{parseFloat(price).toFixed(2)}</span>
            <button
              onClick={handleAddToCart}
              className={`p-2 rounded-lg transition-colors ${
                isInCart(productId)
                  ? 'bg-teal text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-teal hover:text-white'
              }`}
              title={isInCart(productId) ? 'In Cart' : 'Add to Cart'}
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const ProductCardSkeleton = () => (
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

export default ProductCard;
