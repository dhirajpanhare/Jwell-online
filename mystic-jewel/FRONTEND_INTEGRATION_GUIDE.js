/**
 * PHASE 4 - Frontend Integration Guide
 * Complete guide showing how to use the dynamic API service with examples
 * 
 * This file demonstrates all the API operations available in the frontend
 * through the dynamicApiService.js
 */

// ============================================================================
// IMPORT STATEMENTS
// ============================================================================

import {
  productApi,
  categoryApi,
  cartApi,
  wishlistApi,
  orderApi,
  adminDashboardApi,
  adminOrderApi,
  adminProductApi,
  adminCategoryApi,
  adminCouponApi,
  executeProcedure,
  buildParams
} from './src/api/dynamicApiService';

// ============================================================================
// 1. PRODUCT OPERATIONS
// ============================================================================

/**
 * Get all products with filters
 * Usage in Components:
 */
async function getProductsExample() {
  try {
    const response = await productApi.getProducts({
      category: 'necklaces',
      minPrice: 1000,
      maxPrice: 50000,
      sortBy: 'price_asc',
      search: 'diamond',
      page: 1,
      limit: 20
    });

    if (response.status) {
      console.log('Products:', response.data);
      // response.data contains array of products
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Get single product details
 */
async function getProductByIdExample() {
  try {
    const response = await productApi.getProductById(123);
    
    if (response.status) {
      const product = response.data; // Direct product object
      console.log('Product Name:', product.ProductName);
      console.log('Price:', product.Price);
      // Use product details
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Get best selling products
 */
async function getBestSellersExample() {
  try {
    const response = await productApi.getBestSellers(10);
    
    if (response.status) {
      console.log('Best Sellers:', response.data);
      // response.data is array of best-selling products
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Get product recommendations
 */
async function getRecommendationsExample() {
  try {
    const response = await productApi.getRecommendations(
      123, // Current product ID
      6    // Number of recommendations
    );
    
    if (response.status) {
      console.log('Recommendations:', response.data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================================
// 2. CATEGORY OPERATIONS
// ============================================================================

/**
 * Get all categories
 */
async function getCategoriesExample() {
  try {
    const response = await categoryApi.getCategories();
    
    if (response.status) {
      console.log('Categories:', response.data);
      // response.data is array of categories
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Get single category
 */
async function getCategoryByIdExample() {
  try {
    const response = await categoryApi.getCategoryById(5);
    
    if (response.status) {
      console.log('Category:', response.data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================================
// 3. CART OPERATIONS
// ============================================================================

/**
 * Get user's cart
 */
async function getCartExample() {
  try {
    const response = await cartApi.getCart(userId);
    
    if (response.status) {
      const cartItems = response.data; // Array of cart items
      console.log(`Cart has ${cartItems.length} items`);
      
      // Calculate totals
      const total = cartItems.reduce((sum, item) => 
        sum + (item.Quantity * item.Price), 0
      );
      console.log('Total:', total);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Add product to cart
 */
async function addToCartExample() {
  try {
    const response = await cartApi.addCartItem(
      userId,   // User ID
      productId, // Product ID
      quantity   // Quantity (e.g., 1)
    );
    
    if (response.status) {
      console.log('Product added to cart');
      // Product added successfully
    } else {
      console.error('Failed:', response.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Update cart item quantity
 */
async function updateCartItemExample() {
  try {
    const response = await cartApi.updateCartItem(
      userId,
      productId,
      newQuantity
    );
    
    if (response.status) {
      console.log('Cart updated');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Remove item from cart
 */
async function removeFromCartExample() {
  try {
    const response = await cartApi.removeCartItem(userId, productId);
    
    if (response.status) {
      console.log('Item removed from cart');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Clear entire cart
 */
async function clearCartExample() {
  try {
    const response = await cartApi.clearCart(userId);
    
    if (response.status) {
      console.log('Cart cleared');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================================
// 4. WISHLIST OPERATIONS
// ============================================================================

/**
 * Get user's wishlist
 */
async function getWishlistExample() {
  try {
    const response = await wishlistApi.getWishlist(userId);
    
    if (response.status) {
      console.log('Wishlist items:', response.data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Add product to wishlist
 */
async function addToWishlistExample() {
  try {
    const response = await wishlistApi.addWishlist(userId, productId);
    
    if (response.status) {
      console.log('Product added to wishlist');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Remove from wishlist
 */
async function removeFromWishlistExample() {
  try {
    const response = await wishlistApi.removeWishlist(userId, productId);
    
    if (response.status) {
      console.log('Product removed from wishlist');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================================
// 5. ORDER OPERATIONS
// ============================================================================

/**
 * Create new order
 */
async function createOrderExample() {
  try {
    const response = await orderApi.createOrder(
      userId,
      {
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      },
      'credit_card', // Payment method
      'Please deliver in morning' // Notes (optional)
    );
    
    if (response.status) {
      const orderDetails = response.data;
      console.log('Order created:', orderDetails.OrderNumber);
    }
  } catch (error) {
    console.error('Error creating order:', error.message);
  }
}

/**
 * Get user's orders
 */
async function getOrdersExample() {
  try {
    const response = await orderApi.getOrders(
      userId,
      null,  // status filter (optional: 'pending', 'processing', 'shipped', etc.)
      1,     // page
      10     // limit
    );
    
    if (response.status) {
      console.log('Orders:', response.data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Get order details with items
 */
async function getOrderDetailsExample() {
  try {
    const response = await orderApi.getOrderDetails(orderId);
    
    if (response.status) {
      const details = response.data;
      console.log('Order:', details);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Cancel order
 */
async function cancelOrderExample() {
  try {
    const response = await orderApi.cancelOrder(userId, orderId);
    
    if (response.status) {
      console.log('Order cancelled successfully');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================================
// 6. ADMIN DASHBOARD OPERATIONS
// ============================================================================

/**
 * Get dashboard summary
 */
async function getDashboardSummaryExample() {
  try {
    const response = await adminDashboardApi.getSummary();
    
    if (response.status) {
      const data = response.data[0]; // First result set
      console.log('Total Orders:', data.TotalOrders);
      console.log('Total Revenue:', data.TotalRevenue);
      console.log('Total Products:', data.TotalProducts);
      console.log('Total Customers:', data.TotalCustomers);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Get revenue chart data
 */
async function getRevenueChartExample() {
  try {
    const response = await adminDashboardApi.getRevenueChart('month');
    
    if (response.status) {
      console.log('Revenue data:', response.data);
      // Use data for chart visualization
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Get top products
 */
async function getTopProductsExample() {
  try {
    const response = await adminDashboardApi.getTopProducts(5);
    
    if (response.status) {
      console.log('Top products:', response.data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================================
// 7. ADMIN ORDER MANAGEMENT
// ============================================================================

/**
 * Get all orders (admin view)
 */
async function getAdminOrderListExample() {
  try {
    const response = await adminOrderApi.getOrderList(
      'pending', // status filter
      null,      // startDate
      null,      // endDate
      1,         // page
      20         // limit
    );
    
    if (response.status) {
      console.log('Orders:', response.data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Update order status (admin)
 */
async function updateOrderStatusExample() {
  try {
    const response = await adminOrderApi.updateOrderStatus(
      orderId,
      'shipped' // New status
    );
    
    if (response.status) {
      console.log('Order status updated');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================================
// 8. ADMIN PRODUCT MANAGEMENT
// ============================================================================

/**
 * Get all products (admin view with filters)
 */
async function getAdminProductListExample() {
  try {
    const response = await adminProductApi.getProductList(
      null,        // categoryId
      'active',    // status
      'diamond',   // search
      1,           // page
      20           // limit
    );
    
    if (response.status) {
      console.log('Products:', response.data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Create new product (admin)
 */
async function createProductExample() {
  try {
    const response = await adminProductApi.insertProduct({
      name: 'Diamond Ring',
      slug: 'diamond-ring',
      description: 'Beautiful diamond ring...',
      shortDescription: 'Diamond ring',
      categoryId: 5,
      price: 25000,
      compareAtPrice: 30000,
      sku: 'DR-001',
      material: 'Gold',
      stockQuantity: 10
    });
    
    if (response.status) {
      console.log('Product created:', response.data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Update product (admin)
 */
async function updateProductExample() {
  try {
    const response = await adminProductApi.updateProduct(productId, {
      name: 'Updated Diamond Ring',
      description: 'Updated description...',
      shortDescription: 'Updated short description',
      categoryId: 5,
      price: 28000,
      compareAtPrice: 32000,
      material: 'Gold',
      stockQuantity: 15,
      isActive: true
    });
    
    if (response.status) {
      console.log('Product updated');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Delete product (admin)
 */
async function deleteProductExample() {
  try {
    const response = await adminProductApi.deleteProduct(productId);
    
    if (response.status) {
      console.log('Product deleted');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================================
// 9. ADMIN CATEGORY MANAGEMENT
// ============================================================================

/**
 * Get all categories (admin view)
 */
async function getAdminCategoryListExample() {
  try {
    const response = await adminCategoryApi.getCategoryList();
    
    if (response.status) {
      console.log('Categories:', response.data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Create category (admin)
 */
async function createCategoryExample() {
  try {
    const response = await adminCategoryApi.insertCategory({
      name: 'Necklaces',
      slug: 'necklaces',
      description: 'Beautiful necklaces...',
      parentCategoryId: null,
      imageUrl: 'https://example.com/necklaces.jpg'
    });
    
    if (response.status) {
      console.log('Category created:', response.data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================================
// 10. ADMIN COUPON MANAGEMENT
// ============================================================================

/**
 * Get all coupons (admin)
 */
async function getAdminCouponListExample() {
  try {
    const response = await adminCouponApi.getCouponList();
    
    if (response.status) {
      console.log('Coupons:', response.data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Create coupon (admin)
 */
async function createCouponExample() {
  try {
    const response = await adminCouponApi.insertCoupon({
      code: 'SUMMER20',
      description: '20% off summer collection',
      discountType: 'percentage',
      discountValue: 20,
      minimumOrder: 1000,
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      isActive: true
    });
    
    if (response.status) {
      console.log('Coupon created:', response.data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Validate coupon
 */
async function validateCouponExample() {
  try {
    const response = await adminCouponApi.validateCoupon(
      'SUMMER20',  // Coupon code
      userId,      // User ID
      5000         // Cart total
    );
    
    if (response.status) {
      const discount = response.data[0];
      console.log('Discount Amount:', discount.DiscountAmount);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================================
// 11. CUSTOM PROCEDURE EXECUTION
// ============================================================================

/**
 * Execute any stored procedure directly
 */
async function executeCustomProcedureExample() {
  try {
    // Method 1: Using executeProcedure directly
    const response = await executeProcedure('SP_CustomProcedure', {
      p_Param1: 'value1',
      p_Param2: 100
    });
    
    if (response.status) {
      console.log('Result:', response.data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Build parameters string manually
 */
async function buildParamsExample() {
  // Build parameter string manually
  const params = buildParams({
    p_ProductId: 5,
    p_Category: 'necklaces',
    p_Page: 1
  }, '|', '=');
  
  console.log('Params:', params);
  // Output: p_ProductId=5|p_Category=necklaces|p_Page=1
}

// ============================================================================
// USAGE IN REACT COMPONENTS
// ============================================================================

/**
 * Example React Component using dynamic API
 */

/*
import { useState, useEffect } from 'react';
import { productApi } from './api/dynamicApiService';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const response = await productApi.getProducts({
          page: 1,
          limit: 20,
          sortBy: 'newest'
        });
        
        if (response.status) {
          setProducts(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.ProductId}>
          <h3>{product.ProductName}</h3>
          <p>Price: ₹{product.Price}</p>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
*/

// ============================================================================
// RESPONSE FORMAT
// ============================================================================

/**
 * All API calls return responses in this format:
 * 
 * {
 *   status: boolean,           // true if successful
 *   message: string,           // Response message
 *   data: array | object | null, // Response data
 *   executionTime?: number     // Execution time in ms
 * }
 * 
 * Examples:
 * 
 * Success Response:
 * {
 *   "status": true,
 *   "message": "Success",
 *   "data": [...],
 *   "executionTime": 125
 * }
 * 
 * Error Response:
 * {
 *   "status": false,
 *   "message": "Insufficient stock",
 *   "data": []
 * }
 */

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Best practices for error handling
 */

async function errorHandlingExample() {
  try {
    // API call
    const response = await productApi.getProducts();
    
    // Check response status
    if (!response.status) {
      // Handle API error
      console.error('API Error:', response.message);
      // Show user-friendly error message
      return;
    }
    
    // Process successful response
    const products = response.data;
    console.log('Products:', products);
    
  } catch (error) {
    // Handle network or parsing errors
    console.error('Network Error:', error.message);
    // Show user-friendly error message
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  getProductsExample,
  getProductByIdExample,
  getBestSellersExample,
  getRecommendationsExample,
  getCategoriesExample,
  getCategoryByIdExample,
  getCartExample,
  addToCartExample,
  updateCartItemExample,
  removeFromCartExample,
  clearCartExample,
  getWishlistExample,
  addToWishlistExample,
  removeFromWishlistExample,
  createOrderExample,
  getOrdersExample,
  getOrderDetailsExample,
  cancelOrderExample,
  getDashboardSummaryExample,
  getRevenueChartExample,
  getTopProductsExample,
  getAdminOrderListExample,
  updateOrderStatusExample,
  getAdminProductListExample,
  createProductExample,
  updateProductExample,
  deleteProductExample,
  getAdminCategoryListExample,
  createCategoryExample,
  getAdminCouponListExample,
  createCouponExample,
  validateCouponExample,
  executeCustomProcedureExample,
  buildParamsExample,
  errorHandlingExample
};
