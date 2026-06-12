# Quick Reference Guide - API Integration

## Import Patterns

### Services
```javascript
// Product Service
import { getProducts, getProductById, getBestSellers, getRecommendations } from '@/services/productService';

// Category Service
import { getCategories, getCategoryById } from '@/services/categoryService';

// Cart Service
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '@/services/cartService';

// Wishlist Service
import { getWishlist, addToWishlist, removeFromWishlist } from '@/services/wishlistService';

// Order Service
import { createOrder, getOrders, getOrderDetails, cancelOrder } from '@/services/orderService';

// Auth Service
import { sendOtp, verifyOtp, logout, getCurrentUser } from '@/api/authApi';
```

### Hooks
```javascript
// Auth Hook
import useAuth from '@/hooks/useAuth';

// Product Hooks
import { useProducts, useProduct, useBestSellers, useRecommendations } from '@/hooks/useProducts';

// Category Hooks
import { useCategories, useCategory } from '@/hooks/useCategories';

// Cart Hook
import useCart from '@/hooks/useCart';
// BUT use context instead:
import { useCartContext } from '@/context/CartContext';

// Wishlist Hook (internal)
// BUT use context instead:
import { useWishlistContext } from '@/context/WishlistContext';
```

### Context
```javascript
// Auth Context
import { useAuthContext } from '@/context/AuthContext';

// Cart Context
import { useCartContext } from '@/context/CartContext';

// Wishlist Context  
import { useWishlistContext } from '@/context/WishlistContext';
```

### Components
```javascript
// Loading States
import { LoadingState, LoadingSpinner } from '@/components/states/LoadingState';

// Error States
import { ErrorState, ErrorAlert } from '@/components/states/ErrorState';

// Empty States
import { EmptyState } from '@/components/states/EmptyState';

// Protected Route
import ProtectedRoute from '@/components/ProtectedRoute';
```

---

## Common Usage Examples

### 1. Fetching Products

```javascript
// Using service directly
const products = await getProducts({ category: 'Earrings', limit: 10 });

// Using hook
import { useProducts } from '@/hooks/useProducts';

function ProductList() {
  const { products, loading, error, fetchProducts } = useProducts();
  
  useEffect(() => {
    fetchProducts({ category: 'Earrings' });
  }, []);

  return (
    <>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </>
  );
}
```

### 2. Cart Management

```javascript
import { useCartContext } from '@/context/CartContext';

function CartButton({ product }) {
  const { addToCart, isInCart } = useCartContext();
  
  return (
    <button onClick={() => addToCart(product, 1)}>
      {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
    </button>
  );
}
```

### 3. Wishlist Management

```javascript
import { useWishlistContext } from '@/context/WishlistContext';

function WishlistButton({ product }) {
  const { toggleWishlist, isInWishlist } = useWishlistContext();
  const inWishlist = isInWishlist(product.id);
  
  return (
    <button 
      onClick={() => toggleWishlist(product)}
      className={inWishlist ? 'text-red-600' : 'text-gray-400'}
    >
      ❤️ Wishlist
    </button>
  );
}
```

### 4. Authentication

```javascript
import useAuth from '@/hooks/useAuth';
import { useAuthContext } from '@/context/AuthContext';

// In Login Page
function Login() {
  const { sendOTPEmail, isLoading, error } = useAuth();
  
  const handleLogin = async (email) => {
    const result = await sendOTPEmail(email);
    if (result.success) navigate('/verify-otp');
  };
}

// In Protected Component
function Dashboard() {
  const { user, isAuthenticated } = useAuthContext();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return <div>Welcome, {user.email}!</div>;
}
```

### 5. Error Handling

```javascript
// Global error (auto-handled by axios)
// - 401 errors redirect to login
// - Network errors show alert

// Component-level error
function MyComponent() {
  const [error, setError] = useState(null);

  try {
    const data = await getProducts();
  } catch (err) {
    setError(err.message);
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }
}
```

### 6. Protected Routes

```javascript
<Routes>
  <Route path="/login" element={<Login />} />
  
  {/* Public */}
  <Route path="/" element={<Home />} />
  
  {/* Protected */}
  <Route path="/wishlist" element={
    <ProtectedRoute>
      <Wishlist />
    </ProtectedRoute>
  } />
</Routes>
```

---

## Service API Reference

### Products
```javascript
// Get all products with filters
getProducts({
  category: 'Earrings',
  minPrice: 100,
  maxPrice: 1000,
  material: 'Gold plated',
  sortBy: 'price-low',
  search: 'golden',
  page: 1,
  limit: 20
})

// Get single product
getProductById(productId)

// Get best sellers
getBestSellers(limit = 6)

// Get recommendations
getRecommendations(productId, limit = 4)
```

### Categories
```javascript
// Get all categories
getCategories()

// Get single category
getCategoryById(categoryId)
```

### Cart
```javascript
// Get cart
getCart()

// Add to cart
addToCart(productId, quantity = 1)

// Update quantity
updateCartItem(productId, quantity)

// Remove from cart
removeFromCart(productId)

// Clear cart
clearCart()
```

### Wishlist
```javascript
// Get wishlist
getWishlist()

// Add to wishlist
addToWishlist(productId)

// Remove from wishlist
removeFromWishlist(productId)

// Check if in wishlist
isInWishlist(productId)
```

### Orders
```javascript
// Create order
createOrder({
  shippingAddress: '123 Main St',
  shippingCity: 'Mumbai',
  shippingState: 'Maharashtra',
  shippingZipCode: '400001',
  paymentMethod: 'UPI',
  notes: 'Optional'
})

// Get orders
getOrders({
  status: 'completed',
  startDate: '2026-01-01',
  endDate: '2026-06-30'
})

// Get order details
getOrderDetails(orderId)

// Cancel order
cancelOrder(orderId)
```

---

## Hook API Reference

### useAuth()
```javascript
const {
  user,                  // Current user object
  isLoading,            // Loading state
  error,                // Error message
  otpSent,              // OTP sent flag
  otpEmail,             // Email for OTP
  sendOTPEmail,         // async (email) => { success, error }
  verifyOTPCode,        // async (email, otp) => { success, user, error }
  logoutUser,           // () => void
  checkAuth,            // () => boolean
  isAuthenticated,      // boolean
  token                 // JWT token
} = useAuth();
```

### useProducts()
```javascript
const {
  products,             // Array of products
  loading,              // Loading state
  error,                // Error message
  fetchProducts         // async (filters) => products
} = useProducts();
```

### useProduct(productId)
```javascript
const {
  product,              // Single product
  loading,              // Loading state
  error                 // Error message
} = useProduct(productId);
```

### useBestSellers(limit = 6)
```javascript
const {
  products,             // Best seller products
  loading,              // Loading state
  error                 // Error message
} = useBestSellers();
```

### useRecommendations(productId, limit = 4)
```javascript
const {
  products,             // Recommended products
  loading,              // Loading state
  error                 // Error message
} = useRecommendations(productId);
```

### useCategories()
```javascript
const {
  categories,           // All categories
  loading,              // Loading state
  error                 // Error message
} = useCategories();
```

### useCart() [Hook - rarely used directly]
```javascript
const {
  cartItems,            // Array of items
  addItem,              // (product, qty) => void
  updateItem,           // (productId, qty) => void
  removeItem,           // (productId) => void
  clearCart,            // () => void
  getTotal,             // () => number
  getCount,             // () => number
  isInCart,             // (productId) => boolean
  syncCart              // () => Promise
} = useCart();
```

---

## Context API Reference

### useAuthContext()
```javascript
const {
  user,                 // { id, email }
  isAuthenticated,      // boolean
  sendOTPEmail,         // async (email) => result
  verifyOTPCode,        // async (email, otp) => result
  logoutUser            // () => void
} = useAuthContext();
```

### useCartContext()
```javascript
const {
  cartItems,            // Array of items
  addToCart,            // (product, qty) => void
  removeFromCart,       // (productId) => void
  updateQuantity,       // (productId, qty) => void
  clearCart,            // () => void
  getCartTotal,         // () => number
  getCartCount,         // () => number
  isInCart              // (productId) => boolean
} = useCartContext();
```

### useWishlistContext()
```javascript
const {
  wishlistItems,        // Array of items
  addToWishlist,        // (product) => void
  removeFromWishlist,   // (productId) => void
  toggleWishlist,       // (product) => void
  isInWishlist,         // (productId) => boolean
  clearWishlist         // () => void
} = useWishlistContext();
```

---

## Component States

### Loading State
```javascript
// Full page
<LoadingState 
  message="Loading..."
  fullScreen={true}
/>

// Inline
<LoadingSpinner size="md" inline={true} />

// Sizes: 'sm' | 'md' | 'lg'
```

### Error State
```javascript
// Full page
<ErrorState 
  message="Error loading products"
  onRetry={() => refetch()}
  fullScreen={true}
/>

// Alert
<ErrorAlert 
  message="Something went wrong"
  dismissible={true}
  onClose={handleClose}
/>
```

### Empty State
```javascript
<EmptyState 
  title="No products found"
  message="Browse our collection"
  actionText="Shop Now"
  actionLink="/products"
  fullScreen={false}
/>
```

---

## Environment Variables

```env
# API Base Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1.0

# Endpoints
VITE_DYNAMIC_API_ENDPOINT=/DynamicApi/DynamicApiExecute
VITE_SEND_OTP_ENDPOINT=/auth/send-otp
VITE_VERIFY_OTP_ENDPOINT=/auth/verify-otp
```

Access in code:
```javascript
import.meta.env.VITE_API_BASE_URL
```

---

## Common Patterns

### Loading + Data + Error
```javascript
const { data, loading, error } = useSomeHook();

if (loading) return <LoadingState />;
if (error) return <ErrorState message={error} />;
if (!data?.length) return <EmptyState />;

return <div>{/* render data */}</div>;
```

### Authenticated Action
```javascript
const { isAuthenticated } = useAuthContext();

const handleAction = async () => {
  if (!isAuthenticated) {
    navigate('/login');
    return;
  }
  // Perform action
};
```

### Sync on Login
```javascript
const { isAuthenticated } = useAuthContext();
const { syncCart } = useCart();

useEffect(() => {
  if (isAuthenticated) {
    syncCart();
  }
}, [isAuthenticated]);
```

---

## Troubleshooting

### "useWishlist is not a function"
```javascript
// ❌ Wrong - naming conflict with hook
import { useWishlist } from '@/hooks/useWishlist';

// ✅ Correct - use context instead
import { useWishlistContext } from '@/context/WishlistContext';
```

### "Token not attached to request"
```javascript
// Token is auto-attached by axiosInstance interceptor
// Make sure you're using the configured axiosInstance
import axiosInstance from '@/api/axiosInstance';
```

### "Wishlist not syncing with server"
```javascript
// Make sure user is authenticated
const { isAuthenticated } = useAuthContext();
if (!isAuthenticated) return; // Can't sync wishlist offline
```

### "CORS error"
- Check backend `.env` has correct `CORS_ORIGINS`
- Make sure backend is running on `http://localhost:3000`
- Update `.env` if backend URL changed

---

**Last Updated**: June 2026  
**Version**: 1.0.0
