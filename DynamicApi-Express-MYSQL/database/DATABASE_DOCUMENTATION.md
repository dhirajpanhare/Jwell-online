# MysticJewel E-Commerce Database Documentation

## 📋 Overview

Complete, production-ready MySQL database schema for the MysticJewel artificial jewellery e-commerce platform. Includes 20+ tables, 40+ stored procedures, and comprehensive audit logging.

**Database Name**: `DynamicApiDb`
**Version**: 1.0.0
**MySQL Version**: 8.0+
**Charset**: UTF-8 MB4 (supports emojis and international characters)

---

## 🚀 Quick Start

### Import Database Schema

```bash
# Option 1: Using command line
mysql -u root -p DynamicApiDb < database/complete_schema.sql

# Option 2: Using MySQL client
mysql -u root -p
CREATE DATABASE DynamicApiDb CHARACTER SET utf8mb4;
USE DynamicApiDb;
SOURCE /path/to/database/complete_schema.sql;
```

### Verify Installation

```sql
-- Check tables created
SHOW TABLES;

-- Check stored procedures
SHOW PROCEDURE STATUS WHERE db = 'DynamicApiDb';

-- Check sample data
SELECT * FROM Categories;
SELECT * FROM WebsiteSettings LIMIT 5;
```

---

## 📊 Database Schema Structure

### Core Entities Diagram

```
Users (1) -----> (M) Orders
  |
  +-----> (M) Cart
  |
  +-----> (M) Wishlist
  |
  +-----> (M) Addresses
  |
  +-----> (M) ProductReviews

Orders (1) -----> (M) OrderItems
  |
  +-----> (M) CouponUsage

Products (1) -----> (M) ProductImages
  |
  +-----> (M) OrderItems
  |
  +-----> (M) ProductReviews
  |
  +-----> (M) Cart
  |
  +-----> (M) Wishlist
  |
  +-----> (M) Inventory

Categories (1) -----> (M) Products
```

---

## 📑 Table Reference

### 1. Users Table
**Purpose**: Store customer and admin accounts

| Column | Type | Notes |
|--------|------|-------|
| UserId | INT | Primary Key, Auto Increment |
| Email | VARCHAR(255) | UNIQUE, Indexed |
| PasswordHash | VARCHAR(255) | bcryptjs hash |
| FirstName | VARCHAR(100) | Optional |
| LastName | VARCHAR(100) | Optional |
| PhoneNumber | VARCHAR(20) | Optional |
| Role | ENUM | 'customer' or 'admin' |
| IsActive | BOOLEAN | Account status |
| IsEmailVerified | BOOLEAN | Email verification flag |
| CreatedAt | DATETIME | Account creation date |
| UpdatedAt | DATETIME | Last updated |
| LastLoginAt | DATETIME | Last login timestamp |

**Indexes**: Email, Role, CreatedAt

---

### 2. OTPVerification Table
**Purpose**: Store one-time passwords for email authentication

| Column | Type | Notes |
|--------|------|-------|
| OTPId | INT | Primary Key |
| Email | VARCHAR(255) | Indexed |
| OTPCode | VARCHAR(10) | 6-digit code |
| ExpiresAt | DATETIME | Expiry time |
| IsUsed | BOOLEAN | Used flag |
| CreatedAt | DATETIME | Creation time |

**Indexes**: Email, ExpiresAt

---

### 3. Categories Table
**Purpose**: Product categories (Earrings, Necklaces, etc.)

| Column | Type | Notes |
|--------|------|-------|
| CategoryId | INT | Primary Key |
| CategoryName | VARCHAR(100) | UNIQUE |
| CategorySlug | VARCHAR(100) | URL-friendly slug, UNIQUE |
| Description | TEXT | Optional |
| ParentCategoryId | INT | For subcategories |
| ImageUrl | VARCHAR(500) | Category image |
| DisplayOrder | INT | Sort order |
| IsActive | BOOLEAN | Active flag |
| CreatedAt | DATETIME | Creation date |
| UpdatedAt | DATETIME | Last updated |

**Indexes**: Slug, ParentCategoryId, IsActive

---

### 4. Products Table
**Purpose**: Artificial jewellery products

| Column | Type | Notes |
|--------|------|-------|
| ProductId | INT | Primary Key |
| ProductName | VARCHAR(255) | Product name |
| ProductSlug | VARCHAR(255) | URL-friendly, UNIQUE |
| Description | TEXT | Full description |
| ShortDescription | VARCHAR(500) | Brief description |
| CategoryId | INT | Foreign Key |
| Price | DECIMAL(10,2) | Current selling price |
| CompareAtPrice | DECIMAL(10,2) | Strikethrough price |
| CostPrice | DECIMAL(10,2) | Cost to business |
| SKU | VARCHAR(100) | Stock Keeping Unit |
| Material | VARCHAR(100) | Material type |
| Weight | DECIMAL(8,2) | Weight in grams |
| Dimensions | VARCHAR(100) | Size dimensions |
| Color | VARCHAR(50) | Product color |
| IsHypoallergenic | BOOLEAN | Hypoallergenic flag |
| IsBestseller | BOOLEAN | Bestseller flag |
| IsNew | BOOLEAN | New product flag |
| IsFeatured | BOOLEAN | Featured product flag |
| StockQuantity | INT | Current stock |
| LowStockThreshold | INT | Low stock alert level |
| IsActive | BOOLEAN | Active flag |
| ViewCount | INT | Product views |
| SalesCount | INT | Units sold |
| AverageRating | DECIMAL(3,2) | Average rating (0-5) |
| ReviewCount | INT | Number of reviews |
| MetaTitle | VARCHAR(200) | SEO title |
| MetaDescription | VARCHAR(500) | SEO description |
| MetaKeywords | VARCHAR(500) | SEO keywords |
| CreatedAt | DATETIME | Creation date |
| UpdatedAt | DATETIME | Last updated |

**Indexes**: Slug, CategoryId, IsActive, IsBestseller, Price, Stock, Fulltext Search

---

### 5. ProductImages Table
**Purpose**: Multiple images per product

| Column | Type | Notes |
|--------|------|-------|
| ImageId | INT | Primary Key |
| ProductId | INT | Foreign Key |
| ImageUrl | VARCHAR(500) | Image URL |
| AltText | VARCHAR(255) | Alt text for accessibility |
| DisplayOrder | INT | Image order |
| IsPrimary | BOOLEAN | Primary/thumbnail image |
| CreatedAt | DATETIME | Upload date |

**Indexes**: ProductId, IsPrimary

---

### 6. Cart Table
**Purpose**: Shopping cart items

| Column | Type | Notes |
|--------|------|-------|
| CartId | INT | Primary Key |
| UserId | INT | Foreign Key |
| ProductId | INT | Foreign Key |
| Quantity | INT | Item quantity |
| Price | DECIMAL(10,2) | Unit price at time of add |
| CreatedAt | DATETIME | Added to cart |
| UpdatedAt | DATETIME | Last modified |

**Unique Constraint**: (UserId, ProductId)

---

### 7. Wishlist Table
**Purpose**: User's saved/favorite products

| Column | Type | Notes |
|--------|------|-------|
| WishlistId | INT | Primary Key |
| UserId | INT | Foreign Key |
| ProductId | INT | Foreign Key |
| CreatedAt | DATETIME | Added to wishlist |

**Unique Constraint**: (UserId, ProductId)

---

### 8. Orders Table
**Purpose**: Customer orders

| Column | Type | Notes |
|--------|------|-------|
| OrderId | INT | Primary Key |
| UserId | INT | Foreign Key |
| OrderNumber | VARCHAR(50) | Unique order reference |
| OrderStatus | ENUM | pending, processing, shipped, delivered, cancelled, refunded |
| PaymentStatus | ENUM | pending, paid, failed, refunded |
| PaymentMethod | VARCHAR(50) | UPI, Card, COD |
| SubtotalAmount | DECIMAL(10,2) | Products subtotal |
| ShippingAmount | DECIMAL(10,2) | Shipping cost |
| TaxAmount | DECIMAL(10,2) | Tax/GST (18%) |
| DiscountAmount | DECIMAL(10,2) | Coupon discount |
| TotalAmount | DECIMAL(10,2) | Final total |
| CouponCode | VARCHAR(50) | Applied coupon |
| ShippingAddress | TEXT | Delivery address |
| ShippingCity | VARCHAR(100) | Delivery city |
| ShippingState | VARCHAR(100) | Delivery state |
| ShippingZipCode | VARCHAR(20) | Delivery ZIP |
| ShippingCountry | VARCHAR(100) | Delivery country |
| CustomerNotes | TEXT | Customer notes |
| AdminNotes | TEXT | Admin notes |
| OrderDate | DATETIME | Order creation |
| ShippedAt | DATETIME | Shipping date |
| DeliveredAt | DATETIME | Delivery date |
| CancelledAt | DATETIME | Cancellation date |
| UpdatedAt | DATETIME | Last updated |

**Indexes**: UserId, OrderNumber, OrderStatus, OrderDate

---

### 9. OrderItems Table
**Purpose**: Individual items in orders

| Column | Type | Notes |
|--------|------|-------|
| OrderItemId | INT | Primary Key |
| OrderId | INT | Foreign Key |
| ProductId | INT | Foreign Key |
| ProductName | VARCHAR(255) | Product name snapshot |
| SKU | VARCHAR(100) | SKU snapshot |
| Quantity | INT | Quantity ordered |
| UnitPrice | DECIMAL(10,2) | Price per unit |
| TotalPrice | DECIMAL(10,2) | Quantity × UnitPrice |
| CreatedAt | DATETIME | Item added date |

**Indexes**: OrderId, ProductId

---

### 10. Coupons Table
**Purpose**: Discount coupons

| Column | Type | Notes |
|--------|------|-------|
| CouponId | INT | Primary Key |
| CouponCode | VARCHAR(50) | UNIQUE coupon code |
| Description | VARCHAR(255) | Coupon description |
| DiscountType | ENUM | 'percentage' or 'fixed' |
| DiscountValue | DECIMAL(10,2) | Discount amount/% |
| MinimumOrderAmount | DECIMAL(10,2) | Minimum purchase required |
| MaximumDiscountAmount | DECIMAL(10,2) | Max discount cap |
| UsageLimit | INT | Total usage limit |
| UsageCount | INT | Current usages |
| PerUserLimit | INT | Uses per user |
| StartDate | DATETIME | Coupon start date |
| EndDate | DATETIME | Coupon expiry date |
| IsActive | BOOLEAN | Active flag |
| CreatedAt | DATETIME | Creation date |
| UpdatedAt | DATETIME | Last updated |

**Indexes**: Code, IsActive, Dates

---

### 11. Banners Table
**Purpose**: Promotional banners for homepage

| Column | Type | Notes |
|--------|------|-------|
| BannerId | INT | Primary Key |
| BannerTitle | VARCHAR(255) | Banner title |
| BannerType | ENUM | hero, promotional, category |
| ImageUrl | VARCHAR(500) | Desktop image |
| MobileImageUrl | VARCHAR(500) | Mobile image |
| AltText | VARCHAR(255) | Alt text |
| LinkUrl | VARCHAR(500) | Link destination |
| ButtonText | VARCHAR(100) | CTA button text |
| DisplayOrder | INT | Sort order |
| StartDate | DATETIME | Display start |
| EndDate | DATETIME | Display end |
| IsActive | BOOLEAN | Active flag |
| CreatedAt | DATETIME | Creation date |
| UpdatedAt | DATETIME | Last updated |

---

### 12. Testimonials Table
**Purpose**: Customer testimonials/reviews

| Column | Type | Notes |
|--------|------|-------|
| TestimonialId | INT | Primary Key |
| CustomerName | VARCHAR(100) | Customer name |
| CustomerImage | VARCHAR(500) | Customer photo |
| Rating | INT | 1-5 stars |
| ReviewText | TEXT | Review content |
| ProductId | INT | Product reference |
| DisplayOrder | INT | Sort order |
| IsActive | BOOLEAN | Active flag |
| CreatedAt | DATETIME | Creation date |
| UpdatedAt | DATETIME | Last updated |

---

### 13. Addresses Table
**Purpose**: User shipping/billing addresses

| Column | Type | Notes |
|--------|------|-------|
| AddressId | INT | Primary Key |
| UserId | INT | Foreign Key |
| AddressType | ENUM | shipping, billing, both |
| FirstName | VARCHAR(100) | First name |
| LastName | VARCHAR(100) | Last name |
| PhoneNumber | VARCHAR(20) | Phone number |
| AddressLine1 | VARCHAR(255) | Address line 1 |
| AddressLine2 | VARCHAR(255) | Address line 2 |
| City | VARCHAR(100) | City |
| State | VARCHAR(100) | State |
| ZipCode | VARCHAR(20) | ZIP code |
| Country | VARCHAR(100) | Country |
| IsDefault | BOOLEAN | Default address flag |
| CreatedAt | DATETIME | Creation date |
| UpdatedAt | DATETIME | Last updated |

---

### 14. ExecutionLogs Table
**Purpose**: API execution audit trail

| Column | Type | Notes |
|--------|------|-------|
| LogId | INT | Primary Key |
| ProcedureName | VARCHAR(255) | Stored procedure name |
| Parameters | TEXT | Input parameters |
| ExecutionTime | INT | Time in milliseconds |
| Status | VARCHAR(50) | success, error, warning |
| ErrorMessage | TEXT | Error details |
| UserId | INT | User who called it |
| IPAddress | VARCHAR(50) | Request IP |
| CreatedAt | DATETIME | Execution time |

**Indexes**: Procedure, CreatedAt, Status

---

### 15. Inventory Table
**Purpose**: Product inventory tracking

| Column | Type | Notes |
|--------|------|-------|
| InventoryId | INT | Primary Key |
| ProductId | INT | Foreign Key |
| TransactionType | ENUM | purchase, sale, adjustment, return |
| Quantity | INT | Transaction quantity |
| PreviousStock | INT | Stock before transaction |
| NewStock | INT | Stock after transaction |
| Notes | VARCHAR(255) | Transaction notes |
| CreatedBy | INT | User who created |
| CreatedAt | DATETIME | Transaction date |

---

## 🔧 Stored Procedures Reference

### Authentication Procedures

#### SP_SendOTP(p_Email, p_OTPCode, p_ExpiryMinutes)
- **Purpose**: Send OTP for email verification
- **Parameters**:
  - `p_Email`: User email
  - `p_OTPCode`: 6-digit OTP code
  - `p_ExpiryMinutes`: OTP expiry duration
- **Returns**: Success message

#### SP_VerifyOTP(p_Email, p_OTPCode)
- **Purpose**: Verify OTP and create/update user
- **Parameters**:
  - `p_Email`: User email
  - `p_OTPCode`: OTP to verify
- **Returns**: User details if successful, error if invalid
- **Side Effects**: Creates user if doesn't exist, marks OTP as used

---

### Product Procedures

#### SP_GetProducts(p_Category, p_MinPrice, p_MaxPrice, p_Material, p_SortBy, p_Search, p_Page, p_Limit)
- **Purpose**: Get products with filters and sorting
- **Filters**: Category, Price range, Material, Full-text search
- **Sorting**: price_asc, price_desc, rating, newest
- **Returns**: Product list with images
- **Pagination**: Default 20 per page

#### SP_GetProductById(p_ProductId)
- **Purpose**: Get single product details
- **Side Effects**: Increments view count
- **Returns**: Product details, images, category

#### SP_GetBestSellers(p_Limit)
- **Purpose**: Get best-selling products
- **Returns**: Top products by sales count and rating

#### SP_GetRecommendations(p_ProductId, p_Limit)
- **Purpose**: Get similar products in same category
- **Returns**: Recommended products

---

### Cart Procedures

#### SP_GetCart(p_UserId)
- **Purpose**: Get user's cart items
- **Returns**: Cart items with product details

#### SP_AddCartItem(p_UserId, p_ProductId, p_Quantity)
- **Purpose**: Add product to cart
- **Validation**: Checks stock availability
- **Side Effects**: Creates cart item or updates quantity

#### SP_UpdateCartItem(p_UserId, p_ProductId, p_Quantity)
- **Purpose**: Update item quantity
- **Validation**: Checks stock availability

#### SP_RemoveCartItem(p_UserId, p_ProductId)
- **Purpose**: Remove item from cart

#### SP_ClearCart(p_UserId)
- **Purpose**: Empty entire cart

---

### Order Procedures

#### SP_CreateOrder(p_UserId, p_ShippingAddress, p_ShippingCity, p_ShippingState, p_ShippingZipCode, p_PaymentMethod, p_Notes)
- **Purpose**: Create order from cart
- **Calculations**: 
  - Subtotal from cart
  - Free shipping if > 999
  - 18% GST tax
- **Side Effects**: 
  - Creates order
  - Creates order items from cart
  - Updates product stock and sales count
  - Clears cart
- **Returns**: Order details (ID, number, total, date)

#### SP_GetOrders(p_UserId, p_Status, p_Page, p_Limit)
- **Purpose**: Get user's orders with pagination
- **Filtering**: By status (pending, processing, shipped, delivered, cancelled)
- **Returns**: Order list

#### SP_GetOrderDetails(p_OrderId)
- **Purpose**: Get complete order with items
- **Returns**: Order info (2 result sets: order + items)

#### SP_CancelOrder(p_UserId, p_OrderId)
- **Purpose**: Cancel order if allowed
- **Validation**: Only cancels pending/processing orders
- **Side Effects**: Restores product stock

---

### Dashboard Procedures

#### SP_DashboardSummary()
- **Purpose**: Get KPI statistics
- **Returns**: 
  - Total orders
  - Total revenue
  - Total products
  - Total customers
  - Pending orders
  - Low stock products

#### SP_DashboardRevenueChart(p_TimeRange)
- **Purpose**: Get revenue trends
- **TimeRange**: 'week', 'month', 'year'
- **Returns**: Date-wise revenue data

#### SP_DashboardOrdersChart(p_TimeRange)
- **Purpose**: Get order trends
- **Returns**: Date-wise order count

#### SP_DashboardTopProducts(p_Limit)
- **Purpose**: Get top-selling products
- **Returns**: Product sales and revenue

#### SP_DashboardTopCategories(p_Limit)
- **Purpose**: Get top categories by revenue

#### SP_DashboardRecentOrders(p_Limit)
- **Purpose**: Get latest orders
- **Returns**: Recent order list with customer details

---

### Admin Management Procedures

#### Product Management
- `SP_ProductList`: List all products with filters
- `SP_ProductInsert`: Create new product
- `SP_ProductUpdate`: Update product details
- `SP_ProductDelete`: Delete product

#### Category Management
- `SP_CategoryList`: List all categories
- `SP_CategoryInsert`: Create category
- `SP_CategoryUpdate`: Update category
- `SP_CategoryDelete`: Delete category

#### Coupon Management
- `SP_CouponList`: List all coupons with status
- `SP_CouponInsert`: Create coupon
- `SP_CouponUpdate`: Update coupon
- `SP_CouponDelete`: Delete coupon
- `SP_ValidateCoupon`: Validate and calculate discount

#### Customer Management
- `SP_CustomerList`: List all customers with stats
- `SP_CustomerDetails`: Get customer orders and addresses

---

### Reporting Procedures

#### SP_SalesReport(p_StartDate, p_EndDate)
- **Purpose**: Get sales data for date range
- **Returns**: Daily sales summary (orders, revenue, items, tax, discount)

#### SP_ProductReport(p_CategoryId, p_Limit)
- **Purpose**: Get product performance metrics
- **Returns**: Units sold, revenue, conversion rate, rating

#### SP_CustomerReport()
- **Purpose**: Get customer analytics
- **Returns**: Customer lifetime value, order history, join date

---

### Settings Procedures

#### SP_SettingGet(p_SettingKey)
- **Purpose**: Get website setting by key

#### SP_SettingUpdate(p_SettingKey, p_SettingValue)
- **Purpose**: Update website setting

---

## 🛡️ Security Features

### Data Protection
- ✅ Parameterized queries prevent SQL injection
- ✅ Password hashing with bcryptjs
- ✅ OTP-based authentication
- ✅ Referential integrity with foreign keys
- ✅ Role-based access control (customer vs admin)

### Audit Trail
- ✅ ExecutionLogs table tracks all API calls
- ✅ Timestamps on all tables
- ✅ User tracking for admin actions
- ✅ Error logging for debugging

### Data Integrity
- ✅ UNIQUE constraints on emails, slugs, codes
- ✅ CHECK constraints on ratings (1-5)
- ✅ Foreign key constraints
- ✅ NOT NULL constraints on critical fields

---

## 📈 Performance Optimization

### Indexes Created
- Product search: Fulltext index on ProductName, Description
- Filtering: Composite indexes on commonly filtered columns
- Sorting: Indexes on SalesCount, AverageRating, CreatedAt
- Foreign keys: Automatic indexes for referential integrity

### Query Optimization Tips

```sql
-- Use EXPLAIN to analyze queries
EXPLAIN SELECT * FROM Products WHERE Category = 'Earrings';

-- Check index usage
SHOW INDEX FROM Products;

-- Analyze table statistics
ANALYZE TABLE Products;
```

### Connection Pooling
- Connection limit: 10
- Recommended for high traffic

---

## 🔄 Data Integrity Rules

### Automatic Calculations
- Order total = Subtotal + Shipping + Tax - Discount
- Shipping = Free if > ₹999, else ₹50
- Tax = 18% of (Subtotal + Shipping)
- Coupon discount calculated based on type

### Stock Management
- Stock decreases when order created
- Stock restored if order cancelled
- Low stock alerts at configured threshold
- Negative stock prevented with validation

### Cascade Rules
- Delete category → cascades to products
- Delete product → cascades to cart, wishlist, images
- Delete user → cascades to orders, cart, wishlist

---

## 📥 Sample Data

### Pre-loaded Categories
- Earrings
- Necklaces
- Rings
- Maang Tikka
- Bangles
- Anklets

### Sample Admin User
- Email: `admin@mysticjewel.com`
- Password: `password123` (hashed)
- Role: `admin`

### Website Settings
- Site name: MysticJewel
- Contact email: hello@mysticjewel.com
- Free shipping threshold: ₹999
- Tax percentage: 18%
- Social media links configured

---

## 🔍 Database Maintenance

### Regular Backups
```bash
# Daily backup
mysqldump -u root -p DynamicApiDb > backup_$(date +%Y%m%d).sql

# Compress backup
gzip backup_*.sql

# Restore from backup
mysql -u root -p DynamicApiDb < backup_20240615.sql
```

### Monitoring Queries

```sql
-- Check table sizes
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'DynamicApiDb'
ORDER BY size_mb DESC;

-- Check slow queries
SELECT * FROM mysql.slow_log LIMIT 10;

-- Analyze table fragmentation
CHECK TABLE Products;
OPTIMIZE TABLE Products;
```

---

## 📖 Integration Guide

### Using Procedures from Backend

```javascript
// Example: Create order
const result = await executeProcedure('SP_CreateOrder', {
  p_UserId: 123,
  p_ShippingAddress: '123 Main St',
  p_ShippingCity: 'Mumbai',
  p_ShippingState: 'Maharashtra',
  p_ShippingZipCode: '400001',
  p_PaymentMethod: 'UPI',
  p_Notes: 'Please deliver after 5 PM'
});
```

---

## 🆘 Troubleshooting

### Common Issues

**Issue**: Foreign key constraint error
```sql
-- Check constraint
SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'Orders' AND COLUMN_NAME = 'UserId';

-- Temporarily disable constraints
SET FOREIGN_KEY_CHECKS = 0;
```

**Issue**: Slow product search
```sql
-- Rebuild fulltext index
REPAIR TABLE Products;

-- Rebuild all indexes
OPTIMIZE TABLE Products;
```

**Issue**: Out of disk space
```bash
# Check database size
du -sh /var/lib/mysql/DynamicApiDb/

# Archive old logs
DELETE FROM ExecutionLogs WHERE CreatedAt < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

---

## 📞 Support & Documentation

For more information:
- See `../README.md` for backend setup
- See `../documentation.md` for API integration
- Check `WebsiteSettings` table for configuration
- Review ExecutionLogs for debugging

---

**Last Updated**: June 2024
**Maintained by**: MysticJewel Development Team
