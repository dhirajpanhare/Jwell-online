import axiosInstance from './axiosInstance';
import { getAuthToken } from './authApi';

const BASE_ENDPOINT = '/DynamicApi/DynamicApiExecute';

const buildParams = (params, separator = '|', keyValueSep = '=') => {
  if (!params || Object.keys(params).length === 0) return '';
  return Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}${keyValueSep}${encodeURIComponent(String(value))}`)
    .join(separator);
};

const executeProcedure = async (procedureName, params = {}) => {
  const paramString = buildParams(params);

  const response = await axiosInstance.post(BASE_ENDPOINT, {
    stringOne: paramString,
    stringTwo: '|',
    stringThree: '=',
    stringFour: procedureName,
  });

  if (response.data?.status === false) {
    throw new Error(response.data?.message || `Procedure ${procedureName} failed`);
  }

  return response.data;
};

/**
 * PRODUCT PROCEDURES
 */

export const productApi = {
  getProducts: async (filters = {}) => {
    return executeProcedure('SP_GetProducts', {
      p_CategoryId: filters.category || null,   // SP expects p_CategoryId not p_Category
      p_SearchText: filters.search || null,      // SP expects p_SearchText not p_Search
      p_MinPrice:   filters.minPrice || null,
      p_MaxPrice:   filters.maxPrice || null,
      p_SortBy:     filters.sortBy || null,
      p_Limit:      filters.limit || 20,
      p_Offset:     filters.page ? (filters.page - 1) * (filters.limit || 20) : 0  // SP uses Offset not Page
    });
  },

  getProductById: async (productId) => {
    const response = await executeProcedure('SP_GetProductById', {
      p_ProductId: productId
    });
    // SP_GetProductById returns multiple result sets, extract the first one
    return {
      ...response,
      data: Array.isArray(response.data) ? response.data[0] : response.data
    };
  },

  getBestSellers: async (limit = 6) => {
    return executeProcedure('SP_GetBestSellers', {
      p_Limit: limit
    });
  },

  getRecommendations: async (productId, limit = 4) => {
    return executeProcedure('SP_GetRecommendations', {
      p_ProductId: productId,
      p_Limit: limit
    });
  }
};

/**
 * CATEGORY PROCEDURES
 */

export const categoryApi = {
  getCategories: async () => {
    return executeProcedure('SP_GetCategories', {});
  },

  getCategoryById: async (categoryId) => {
    return executeProcedure('SP_GetCategoryById', {
      p_CategoryId: categoryId
    });
  }
};

/**
 * CART PROCEDURES
 */

export const cartApi = {
  getCart: async (userId) => {
    return executeProcedure('SP_GetCart', {
      p_UserId: userId
    });
  },

  addCartItem: async (userId, productId, quantity) => {
    return executeProcedure('SP_AddCartItem', {
      p_UserId: userId,
      p_ProductId: productId,
      p_Quantity: quantity
    });
  },

  // SP_UpdateCartItem(p_CartItemId, p_UserId, p_Quantity) — uses CartItemId not ProductId
  updateCartItem: async (cartItemId, userId, quantity) => {
    return executeProcedure('SP_UpdateCartItem', {
      p_CartItemId: cartItemId,
      p_UserId: userId,
      p_Quantity: quantity
    });
  },

  // SP_RemoveCartItem(p_CartItemId, p_UserId) — uses CartItemId not ProductId
  removeCartItem: async (cartItemId, userId) => {
    return executeProcedure('SP_RemoveCartItem', {
      p_CartItemId: cartItemId,
      p_UserId: userId
    });
  },

  clearCart: async (userId) => {
    return executeProcedure('SP_ClearCart', {
      p_UserId: userId
    });
  }
};

/**
 * WISHLIST PROCEDURES
 */

export const wishlistApi = {
  getWishlist: async (userId) => {
    return executeProcedure('SP_GetWishlist', {
      p_UserId: userId
    });
  },

  // DB SP is SP_AddToWishlist, not SP_AddWishlist
  addWishlist: async (userId, productId) => {
    return executeProcedure('SP_AddToWishlist', {
      p_UserId: userId,
      p_ProductId: productId
    });
  },

  // DB SP is SP_RemoveFromWishlist, not SP_RemoveWishlist
  removeWishlist: async (userId, productId) => {
    return executeProcedure('SP_RemoveFromWishlist', {
      p_UserId: userId,
      p_ProductId: productId
    });
  }
};

/**
 * ORDER PROCEDURES
 */

export const orderApi = {
  createOrder: async (userId, shippingDetails, paymentMethod, notes = '') => {
    return executeProcedure('SP_CreateOrder', {
      p_UserId: userId,
      p_ShippingAddress: shippingDetails.address,
      p_ShippingCity: shippingDetails.city,
      p_ShippingState: shippingDetails.state,
      p_ShippingZipCode: shippingDetails.zipCode,
      p_PaymentMethod: paymentMethod,
      p_Notes: notes
    });
  },

  getOrders: async (userId, status = null, page = 1, limit = 10) => {
    return executeProcedure('SP_GetOrders', {
      p_UserId: userId,
      p_Status: status,
      p_Page: page,
      p_Limit: limit
    });
  },

  getOrderDetails: async (orderId) => {
    return executeProcedure('SP_GetOrderDetails', {
      p_OrderId: orderId
    });
  },

  cancelOrder: async (userId, orderId) => {
    return executeProcedure('SP_CancelOrder', {
      p_UserId: userId,
      p_OrderId: orderId
    });
  }
};

/**
 * ADMIN DASHBOARD PROCEDURES
 */

export const adminDashboardApi = {
  getSummary: async () => {
    return executeProcedure('SP_DashboardSummary', {});
  },

  getRevenueChart: async (timeRange = 'month') => {
    return executeProcedure('SP_DashboardRevenueChart', {
      p_TimeRange: timeRange
    });
  },

  getOrdersChart: async (timeRange = 'month') => {
    return executeProcedure('SP_DashboardOrdersChart', {
      p_TimeRange: timeRange
    });
  },

  getTopProducts: async (limit = 5) => {
    return executeProcedure('SP_DashboardTopProducts', {
      p_Limit: limit
    });
  },

  getTopCategories: async (limit = 5) => {
    return executeProcedure('SP_DashboardTopCategories', {
      p_Limit: limit
    });
  },

  getRecentOrders: async (limit = 10) => {
    return executeProcedure('SP_DashboardRecentOrders', {
      p_Limit: limit
    });
  }
};

/**
 * ADMIN ORDER MANAGEMENT PROCEDURES
 */

export const adminOrderApi = {
  getOrderList: async (status = null, startDate = null, endDate = null, page = 1, limit = 20) => {
    return executeProcedure('SP_OrderList', {
      p_Status: status,
      p_StartDate: startDate,
      p_EndDate: endDate,
      p_Page: page,
      p_Limit: limit
    });
  },

  getOrderDetails: async (orderId) => {
    return executeProcedure('SP_OrderDetails', {
      p_OrderId: orderId
    });
  },

  updateOrderStatus: async (orderId, status) => {
    return executeProcedure('SP_OrderStatusUpdate', {
      p_OrderId: orderId,
      p_Status: status
    });
  },

  getOrderItems: async (orderId) => {
    return executeProcedure('SP_OrderItems', {
      p_OrderId: orderId
    });
  }
};

/**
 * ADMIN PRODUCT MANAGEMENT PROCEDURES
 */

export const adminProductApi = {
  getProductList: async (categoryId = null, status = null, search = null, page = 1, limit = 20) => {
    return executeProcedure('SP_GetProducts', {
      p_CategoryId: categoryId,
      p_SearchText: search,
      p_MinPrice: null,
      p_MaxPrice: null,
      p_SortBy: null,
      p_Limit: limit,
      p_Offset: (page - 1) * limit
    });
  },

  insertProduct: async (productData) => {
    return executeProcedure('SP_SaveProduct', {
      p_ProductId: 0,
      p_ProductName: productData.name,
      p_ProductSlug: productData.slug,
      p_Description: productData.description,
      p_DetailedDescription: productData.detailedDescription || '',
      p_CategoryId: productData.categoryId,
      p_SKU: productData.sku || '',
      p_Price: productData.price,
      p_DiscountPercentage: productData.discountPercentage || 0,
      p_Stock: productData.stockQuantity || 0,
      p_Material: productData.material || '',
      p_Color: productData.color || '',
      p_Size: productData.size || '',
      p_Weight: productData.weight || '',
      p_IsFeatured: productData.isFeatured ? 1 : 0,
      p_IsActive: productData.isActive !== false ? 1 : 0,
      p_Tags: productData.tags || '',
      p_UpdatedBy: productData.updatedBy || 0
    });
  },

  updateProduct: async (productId, productData) => {
    return executeProcedure('SP_SaveProduct', {
      p_ProductId: productId,
      p_ProductName: productData.name,
      p_ProductSlug: productData.slug || '',
      p_Description: productData.description || '',
      p_DetailedDescription: productData.detailedDescription || '',
      p_CategoryId: productData.categoryId,
      p_SKU: productData.sku || '',
      p_Price: productData.price,
      p_DiscountPercentage: productData.discountPercentage || 0,
      p_Stock: productData.stockQuantity || 0,
      p_Material: productData.material || '',
      p_Color: productData.color || '',
      p_Size: productData.size || '',
      p_Weight: productData.weight || '',
      p_IsFeatured: productData.isFeatured ? 1 : 0,
      p_IsActive: productData.isActive !== false ? 1 : 0,
      p_Tags: productData.tags || '',
      p_UpdatedBy: productData.updatedBy || 0
    });
  },

  deleteProduct: async (productId) => {
    return executeProcedure('SP_DeleteProduct', {
      p_ProductId: productId,
      p_UpdatedBy: 0
    });
  }
};

/**
 * ADMIN CATEGORY MANAGEMENT PROCEDURES
 */

export const adminCategoryApi = {
  getCategoryList: async () => {
    return executeProcedure('SP_GetAllCategoriesAdmin', {});
  },

  insertCategory: async (categoryData) => {
    return executeProcedure('SP_SaveCategory', {
      p_CategoryId: 0,
      p_CategoryName: categoryData.name,
      p_CategorySlug: categoryData.slug,
      p_Description: categoryData.description || '',
      p_ParentCategoryId: categoryData.parentCategoryId || 0,
      p_ImageUrl: categoryData.imageUrl || '',
      p_ImagePublicId: categoryData.imagePublicId || '',
      p_DisplayOrder: categoryData.displayOrder || 0,
      p_IsActive: categoryData.isActive !== false ? 1 : 0,
      p_UpdatedBy: categoryData.updatedBy || 0
    });
  },

  updateCategory: async (categoryId, categoryData) => {
    return executeProcedure('SP_SaveCategory', {
      p_CategoryId: categoryId,
      p_CategoryName: categoryData.name,
      p_CategorySlug: categoryData.slug || '',
      p_Description: categoryData.description || '',
      p_ParentCategoryId: categoryData.parentCategoryId || 0,
      p_ImageUrl: categoryData.imageUrl || '',
      p_ImagePublicId: categoryData.imagePublicId || '',
      p_DisplayOrder: categoryData.displayOrder || 0,
      p_IsActive: categoryData.isActive !== false ? 1 : 0,
      p_UpdatedBy: categoryData.updatedBy || 0
    });
  },

  deleteCategory: async (categoryId) => {
    return executeProcedure('SP_DeleteCategory', {
      p_CategoryId: categoryId,
      p_UpdatedBy: 0
    });
  }
};

/**
 * ADMIN COUPON MANAGEMENT PROCEDURES
 */

export const adminCouponApi = {
  getCouponList: async () => {
    return executeProcedure('SP_GetCoupons', {});
  },

  insertCoupon: async (couponData) => {
    return executeProcedure('SP_SaveCoupon', {
      p_CouponId: 0,
      p_CouponCode: couponData.code,
      p_Description: couponData.description || '',
      p_DiscountType: couponData.discountType,
      p_DiscountValue: couponData.discountValue,
      p_MaxDiscount: couponData.maxDiscount || null,
      p_MinPurchaseAmount: couponData.minimumOrder || null,
      p_UsageLimit: couponData.usageLimit || null,
      p_PerUserLimit: couponData.perUserLimit || 1,
      p_ValidFrom: couponData.startDate,
      p_ValidTill: couponData.endDate,
      p_IsActive: couponData.isActive !== false ? 1 : 0,
      p_UpdatedBy: couponData.updatedBy || 0
    });
  },

  updateCoupon: async (couponId, couponData) => {
    return executeProcedure('SP_SaveCoupon', {
      p_CouponId: couponId,
      p_CouponCode: couponData.code,
      p_Description: couponData.description || '',
      p_DiscountType: couponData.discountType,
      p_DiscountValue: couponData.discountValue,
      p_MaxDiscount: couponData.maxDiscount || null,
      p_MinPurchaseAmount: couponData.minimumOrder || null,
      p_UsageLimit: couponData.usageLimit || null,
      p_PerUserLimit: couponData.perUserLimit || 1,
      p_ValidFrom: couponData.startDate,
      p_ValidTill: couponData.endDate,
      p_IsActive: couponData.isActive !== false ? 1 : 0,
      p_UpdatedBy: couponData.updatedBy || 0
    });
  },

  deleteCoupon: async (couponId) => {
    return executeProcedure('SP_DeleteCoupon', {
      p_CouponId: couponId,
      p_UpdatedBy: 0
    });
  },

  validateCoupon: async (couponCode, userId, cartTotal) => {
    return executeProcedure('SP_ValidateCoupon', {
      p_CouponCode: couponCode,
      p_UserId: userId,
      p_CartTotal: cartTotal
    });
  }
};

/**
 * ADMIN BANNER MANAGEMENT PROCEDURES
 */

export const adminBannerApi = {
  getBannerList: async () => {
    return executeProcedure('SP_BannerList', {});
  },

  insertBanner: async (bannerData) => {
    return executeProcedure('SP_BannerInsert', {
      p_BannerTitle: bannerData.title,
      p_BannerType: bannerData.type || 'default',
      p_ImageUrl: bannerData.imageUrl,
      p_MobileImageUrl: bannerData.mobileImageUrl,
      p_LinkUrl: bannerData.linkUrl || '',
      p_ButtonText: bannerData.buttonText || '',
      p_StartDate: bannerData.startDate,
      p_EndDate: bannerData.endDate
    });
  },

  updateBanner: async (bannerId, bannerData) => {
    return executeProcedure('SP_BannerUpdate', {
      p_BannerId: bannerId,
      p_BannerTitle: bannerData.title,
      p_ImageUrl: bannerData.imageUrl,
      p_MobileImageUrl: bannerData.mobileImageUrl,
      p_LinkUrl: bannerData.linkUrl || '',
      p_ButtonText: bannerData.buttonText || '',
      p_DisplayOrder: bannerData.displayOrder || 0,
      p_IsActive: bannerData.isActive !== undefined ? bannerData.isActive : true
    });
  },

  deleteBanner: async (bannerId) => {
    return executeProcedure('SP_BannerDelete', {
      p_BannerId: bannerId
    });
  }
};

/**
 * CUSTOMER MANAGEMENT PROCEDURES
 */

export const customerApi = {
  getCustomerList: async (status = null, page = 1, limit = 10) => {
    return executeProcedure('SP_CustomerList', {
      p_Status: status,
      p_Page: page,
      p_Limit: limit
    });
  },

  getCustomerOrders: async (userId) => {
    return executeProcedure('SP_CustomerOrders', {
      p_UserId: userId
    });
  },

  deleteCustomer: async (customerId) => {
    return executeProcedure('SP_CustomerDelete', {
      p_CustomerId: customerId
    });
  },

  getCustomerById: async (customerId) => {
    return executeProcedure('SP_CustomerById', {
      p_CustomerId: customerId
    });
  }
};

/**
 * VALIDATION PROCEDURES
 */

export const validationApi = {
  checkEmailExists: async (email) => {
    return executeProcedure('SP_CheckEmailExists', {
      p_Email: email
    });
  },

  checkMobileExists: async (phoneNumber) => {
    return executeProcedure('SP_CheckMobileExists', {
      p_PhoneNumber: phoneNumber
    });
  }
};

export default {
  executeProcedure,
  buildParams,
  productApi,
  categoryApi,
  cartApi,
  wishlistApi,
  orderApi,
  customerApi,
  adminDashboardApi,
  adminOrderApi,
  adminProductApi,
  adminCategoryApi,
  adminCouponApi,
  adminBannerApi,
  validationApi
};
