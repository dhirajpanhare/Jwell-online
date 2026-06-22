import { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cartApi } from '../api/dynamicApiService';
import { useAuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    if (!user?.userId) {
      navigate('/login');
      return;
    }
    loadCart();
  }, [user, navigate]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await cartApi.getCart(user?.userId);
      const items = Array.isArray(data) ? data : data?.data || [];
      setCartItems(items);
    } catch (error) {
      toast.error('Failed to load cart');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Find cart item by ProductId to get CartItemId
    const cartItem = cartItems.find(item => item.ProductId === productId);
    if (!cartItem) {
      toast.error('Item not found in cart');
      return;
    }

    setUpdating(productId);
    try {
      // SP_UpdateCartItem expects (p_CartItemId, p_UserId, p_Quantity)
      await cartApi.updateCartItem(cartItem.CartItemId, user?.userId, newQuantity);
      setCartItems(prev =>
        prev.map(item =>
          item.ProductId === productId ? { ...item, Quantity: newQuantity } : item
        )
      );
    } catch (error) {
      toast.error('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!window.confirm('Remove this item from cart?')) return;
    
    // Find cart item by ProductId to get CartItemId
    const cartItem = cartItems.find(item => item.ProductId === productId);
    if (!cartItem) {
      toast.error('Item not found in cart');
      return;
    }

    try {
      // SP_RemoveCartItem expects (p_CartItemId, p_UserId)
      await cartApi.removeCartItem(cartItem.CartItemId, user?.userId);
      setCartItems(prev => prev.filter(item => item.ProductId !== productId));
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Clear your entire cart?')) return;
    try {
      await cartApi.clearCart(user?.userId);
      setCartItems([]);
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.Price * item.Quantity), 0);
  const shippingFree = subtotal >= 999;
  const shipping = shippingFree ? 0 : 99;
  const gst = Math.round((subtotal + shipping) * 0.18 * 100) / 100;
  const total = subtotal + shipping + gst;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Shopping Cart</h1>
          <p className="text-gray-600 dark:text-gray-400">{cartItems.length} item(s) in cart</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Add some beautiful jewelry to get started!</p>
            <Link
              to="/shop"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                {cartItems.map(item => (
                  <div key={item.ProductId} className="flex gap-4 p-6 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.ProductImage}
                        alt={item.ProductName}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Link
                            to={`/product/${item.ProductId}`}
                            className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {item.ProductName}
                          </Link>
                          {item.SKU && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">SKU: {item.SKU}</p>
                          )}
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">₹{item.Price.toFixed(2)}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(item.ProductId, item.Quantity - 1)}
                            disabled={updating === item.ProductId || item.Quantity <= 1}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={item.Quantity}
                            onChange={(e) => handleUpdateQuantity(item.ProductId, parseInt(e.target.value))}
                            className="w-12 text-center border-0 bg-transparent text-gray-900 dark:text-white focus:outline-none"
                          />
                          <button
                            onClick={() => handleUpdateQuantity(item.ProductId, item.Quantity + 1)}
                            disabled={updating === item.ProductId}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.ProductId)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition"
                          title="Remove from cart"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Subtotal</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        ₹{(item.Price * item.Quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Clear Cart Button */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                  <button
                    onClick={handleClearCart}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg font-medium transition"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <div className="text-right">
                      <span className={shippingFree ? 'text-green-600 dark:text-green-400 font-semibold' : ''}>
                        ₹{shipping.toFixed(2)}
                      </span>
                      {shippingFree && <p className="text-xs text-green-600 dark:text-green-400">FREE SHIPPING</p>}
                      {!shippingFree && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Free on orders ≥ ₹999
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>GST (18%)</span>
                    <span>₹{gst.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="text-2xl font-bold text-blue-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition mb-4"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </button>

                {/* Continue Shopping */}
                <Link
                  to="/shop"
                  className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Continue Shopping
                </Link>

                {/* Promo Code Section */}
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Have a promo code?</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Apply promo codes at checkout
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
