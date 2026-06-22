import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Plus, Minus, Truck, RotateCcw, Shield } from 'lucide-react';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { productApi } from '../api/dynamicApiService';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [selectedImage, setSelectedImage] = useState(0);

  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    loadProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const [productRes, recsRes] = await Promise.all([
        productApi.getProductById(id),
        productApi.getRecommendations(id, 4),
      ]);

      // getProductById returns first item of data array
      const prod = productRes?.data || productRes;
      setProduct(prod);

      const recs = Array.isArray(recsRes?.data) ? recsRes.data : Array.isArray(recsRes) ? recsRes : [];
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-offwhite py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded"></div>)}
              </div>
            </div>
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-offwhite py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link to="/products" className="text-teal hover:underline">Back to products</Link>
        </div>
      </div>
    );
  }

  // Support both real API fields and potential mock fields
  const name = product.ProductName || product.name || '';
  const price = product.Price || product.price || 0;
  const description = product.Description || product.description || '';
  const category = product.CategoryName || product.category || '';
  const material = product.Material || product.material || '';
  const rating = product.AverageRating || product.rating || 0;
  const productId = product.ProductId || product.id;

  // Build images array from API or fallback
  const rawImages = product.ProductImages || product.images || [];
  const images = rawImages.length > 0
    ? rawImages.map(img => img.ImageUrl || img.url || img)
    : [product.ImageUrl || product.image || 'https://via.placeholder.com/400x400?text=No+Image'];

  return (
    <div className="min-h-screen bg-offwhite py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6 text-gray-600">
          <Link to="/" className="hover:text-teal">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-teal">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{name}</span>
        </nav>

        {/* Product Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Images */}
          <div>
            <div className="bg-white rounded-lg overflow-hidden mb-4 card-shadow">
              <img src={images[selectedImage]} alt={name} className="w-full aspect-square object-cover" />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded overflow-hidden border-2 ${selectedImage === index ? 'border-teal' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg p-6 card-shadow">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>
            <p className="text-gray-600 mb-4">{category}</p>

            {rating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-gold text-gold' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="font-semibold">{rating}</span>
              </div>
            )}

            <div className="mb-6">
              <span className="text-4xl font-bold text-maroon">₹{parseFloat(price).toFixed(2)}</span>
              <p className="text-sm text-gray-600 mt-1">Inclusive of all taxes</p>
            </div>

            {material && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Material</p>
                <span className="px-4 py-2 bg-offwhite rounded-lg inline-block font-semibold">{material}</span>
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Quantity</p>
              <div className="flex items-center gap-4">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 bg-offwhite rounded-lg hover:bg-gray-200">
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2 bg-offwhite rounded-lg hover:bg-gray-200">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <button onClick={handleAddToCart} className="flex-1 btn-primary flex items-center justify-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                {isInCart(productId) ? 'Added to Cart' : 'Add to Cart'}
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-lg border-2 transition-colors ${isInWishlist(productId) ? 'bg-maroon border-maroon text-white' : 'border-gray-300 hover:border-maroon hover:text-maroon'}`}
              >
                <Heart className={`w-6 h-6 ${isInWishlist(productId) ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button onClick={handleBuyNow} className="w-full btn-secondary mb-6">
              Buy Now
            </button>

            <div className="space-y-3 border-t pt-6">
              <div className="flex items-center gap-3 text-sm"><Truck className="w-5 h-5 text-teal" /><span>Free shipping on orders above ₹999</span></div>
              <div className="flex items-center gap-3 text-sm"><RotateCcw className="w-5 h-5 text-teal" /><span>Easy 15-day returns & exchange</span></div>
              <div className="flex items-center gap-3 text-sm"><Shield className="w-5 h-5 text-teal" /><span>100% quality assured</span></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg p-6 card-shadow mb-16">
          <div className="flex gap-6 border-b mb-6">
            {['details', 'shipping', 'returns'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`pb-3 font-semibold capitalize ${activeTab === tab ? 'text-teal border-b-2 border-teal' : 'text-gray-600 hover:text-teal'}`}>
                {tab === 'details' ? 'Product Details' : tab}
              </button>
            ))}
          </div>
          {activeTab === 'details' && (
            <div>
              <p className="text-gray-700 mb-4">{description}</p>
              <ul className="space-y-2 text-gray-700">
                {material && <li>• Material: {material}</li>}
                {category && <li>• Category: {category}</li>}
                <li>• Hypoallergenic and skin-friendly</li>
                <li>• Handcrafted by Indian artisans</li>
              </ul>
            </div>
          )}
          {activeTab === 'shipping' && (
            <div className="text-gray-700 space-y-3">
              <p>• Free shipping on orders above ₹999</p>
              <p>• Standard delivery: 5-7 business days</p>
              <p>• Express delivery available at checkout</p>
            </div>
          )}
          {activeTab === 'returns' && (
            <div className="text-gray-700 space-y-3">
              <p>• Easy 15-day return and exchange policy</p>
              <p>• Products must be unused and in original packaging</p>
              <p>• Refund processed within 7-10 business days</p>
            </div>
          )}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map(rec => (
                <ProductCard key={rec.ProductId || rec.id} product={rec} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
