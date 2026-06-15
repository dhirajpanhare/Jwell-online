# Database Quick Reference Guide

## 🚀 Quick Import

```bash
mysql -u root -p DynamicApiDb < complete_schema.sql
```

## 📊 Key Tables Summary

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| Users | User accounts | UserId, Email, Role |
| Products | Jewellery items | ProductId, Price, Stock |
| Categories | Product categories | CategoryId, CategoryName |
| Orders | Customer orders | OrderId, OrderNumber, TotalAmount |
| OrderItems | Order line items | OrderItemId, ProductId, Quantity |
| Cart | Shopping carts | CartId, UserId, ProductId |
| Wishlist | Saved products | WishlistId, UserId, ProductId |
| Coupons | Discount codes | CouponId, CouponCode, DiscountValue |
| Banners | Marketing banners | BannerId, ImageUrl |
| Testimonials | Customer reviews | TestimonialId, Rating, ReviewText |

## 🔌 Top 10 Procedures

### Customer Facing

```sql
-- Get products with filters
CALL SP_GetProducts('earrings', 100.00, 500.00, NULL, 'price_asc', NULL, 1, 20);

-- Get product details
CALL SP_GetProductById(1);

-- Add to cart
CALL SP_AddCartItem(123, 1, 1);

-- Create order
CALL SP_CreateOrder(123, '123 Main St', 'Mumbai', 'Maharashtra', '400001', 'UPI', '');

-- Get orders
CALL SP_GetOrders(123, NULL, 1, 10);
```

### Admin Facing

```sql
-- Dashboard summary
CALL SP_DashboardSummary();

-- List products
CALL SP_ProductList(NULL, 'active', NULL, 1, 20);

-- Insert product
CALL SP_ProductInsert('New Earring', 'new-earring', 'Description', 'Short desc', 1, 299.99, 399.99, 'SKU001', 'Gold', 100);

-- List orders
CALL SP_OrderList(NULL, NULL, NULL, 1, 20);

-- Sales report
CALL SP_SalesReport('2024-01-01', '2024-12-31');
```

## 💾 Common Data Operations

### Create Sample Product

```sql
INSERT INTO Products (
    ProductName, ProductSlug, Description, ShortDescription,
    CategoryId, Price, Material, StockQuantity
) VALUES (
    'Gold Earrings', 'gold-earrings', 'Beautiful gold-plated earrings',
    'Gold-plated earrings', 1, 299.99, 'Gold Plating', 50
);

-- Get inserted ID
SELECT LAST_INSERT_ID() AS ProductId;
```

### Add Product Image

```sql
INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary)
VALUES (1, 'https://example.com/image1.jpg', TRUE);
```

### Add Testimonial

```sql
INSERT INTO Testimonials (CustomerName, Rating, ReviewText, ProductId)
VALUES ('Priya Sharma', 5, 'Absolutely love these earrings!', 1);
```

### Update Product Stock

```sql
CALL SP_InventoryAdjust(1, 10, 'Restocking', 1);
```

## 📈 Analytics Queries

### Total Revenue
```sql
SELECT SUM(TotalAmount) AS TotalRevenue
FROM Orders
WHERE OrderStatus != 'cancelled';
```

### Monthly Sales
```sql
SELECT 
    DATE_FORMAT(OrderDate, '%Y-%m') AS Month,
    COUNT(*) AS Orders,
    SUM(TotalAmount) AS Revenue
FROM Orders
WHERE OrderStatus != 'cancelled'
GROUP BY DATE_FORMAT(OrderDate, '%Y-%m')
ORDER BY Month DESC;
```

### Top Selling Products
```sql
SELECT 
    p.ProductName,
    SUM(oi.Quantity) AS UnitsSold,
    SUM(oi.TotalPrice) AS Revenue
FROM OrderItems oi
INNER JOIN Products p ON oi.ProductId = p.ProductId
GROUP BY p.ProductId
ORDER BY Revenue DESC
LIMIT 10;
```

### Customer Lifetime Value
```sql
SELECT 
    u.Email,
    COUNT(DISTINCT o.OrderId) AS Orders,
    SUM(o.TotalAmount) AS LifetimeValue
FROM Users u
LEFT JOIN Orders o ON u.UserId = o.UserId AND o.OrderStatus != 'cancelled'
WHERE u.Role = 'customer'
GROUP BY u.UserId
ORDER BY LifetimeValue DESC;
```

### Inventory Status
```sql
SELECT 
    ProductName,
    StockQuantity,
    LowStockThreshold,
    CASE 
        WHEN StockQuantity <= LowStockThreshold THEN 'LOW STOCK'
        WHEN StockQuantity <= 0 THEN 'OUT OF STOCK'
        ELSE 'OK'
    END AS Status
FROM Products
WHERE IsActive = TRUE
ORDER BY StockQuantity ASC;
```

## 🔐 User Management

### Create Admin User
```sql
INSERT INTO Users (Email, PasswordHash, FirstName, Role, IsEmailVerified)
VALUES ('newadmin@mysticjewel.com', '$2a$10$...', 'New Admin', 'admin', TRUE);
```

### Create Customer
```sql
INSERT INTO Users (Email, Role)
VALUES ('customer@example.com', 'customer');
```

### Check Recent Orders
```sql
SELECT 
    o.OrderNumber,
    u.Email,
    o.TotalAmount,
    o.OrderDate,
    o.OrderStatus
FROM Orders o
INNER JOIN Users u ON o.UserId = u.UserId
ORDER BY o.OrderDate DESC
LIMIT 20;
```

## 🎟️ Coupon Management

### Create Coupon
```sql
INSERT INTO Coupons (
    CouponCode, DiscountType, DiscountValue,
    MinimumOrderAmount, StartDate, EndDate
) VALUES (
    'SAVE20', 'percentage', 20.00,
    500.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)
);
```

### List Active Coupons
```sql
SELECT * FROM Coupons
WHERE IsActive = TRUE
    AND NOW() BETWEEN StartDate AND EndDate
    AND (UsageLimit IS NULL OR UsageCount < UsageLimit);
```

## 📋 Settings

### Get Setting
```sql
CALL SP_SettingGet('site_name');
```

### Update Setting
```sql
CALL SP_SettingUpdate('free_shipping_threshold', '1000');
```

### Common Settings
- `site_name`: Website name
- `site_tagline`: Website tagline
- `contact_email`: Contact email
- `contact_phone`: Contact phone
- `free_shipping_threshold`: Free shipping amount
- `currency_symbol`: Currency symbol
- `tax_percentage`: Tax rate

## 🔍 Debugging

### Check Execution Logs
```sql
SELECT 
    LogId,
    ProcedureName,
    ExecutionTime,
    Status,
    CreatedAt
FROM ExecutionLogs
WHERE Status = 'error'
ORDER BY CreatedAt DESC
LIMIT 20;
```

### Check Cart Items
```sql
SELECT 
    c.CartId,
    u.Email,
    p.ProductName,
    c.Quantity,
    c.Price,
    (c.Quantity * c.Price) AS TotalPrice
FROM Cart c
INNER JOIN Users u ON c.UserId = u.UserId
INNER JOIN Products p ON c.ProductId = p.ProductId;
```

### Check Wishlist
```sql
SELECT 
    u.Email,
    p.ProductName,
    p.Price,
    w.CreatedAt
FROM Wishlist w
INNER JOIN Users u ON w.UserId = u.UserId
INNER JOIN Products p ON w.ProductId = p.ProductId
ORDER BY w.CreatedAt DESC;
```

## 🗑️ Data Cleanup

### Clear Old Carts (30+ days)
```sql
DELETE FROM Cart
WHERE UpdatedAt < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### Delete Old Execution Logs (90+ days)
```sql
DELETE FROM ExecutionLogs
WHERE CreatedAt < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

### Reset Test Data
```sql
-- WARNING: This deletes all customer data
DELETE FROM Orders WHERE UserId IN (SELECT UserId FROM Users WHERE Role = 'customer');
DELETE FROM Cart WHERE UserId IN (SELECT UserId FROM Users WHERE Role = 'customer');
DELETE FROM Wishlist WHERE UserId IN (SELECT UserId FROM Users WHERE Role = 'customer');
DELETE FROM Users WHERE Role = 'customer';
```

## 📞 Emergency Procedures

### Restore from Backup
```bash
mysql -u root -p DynamicApiDb < backup_20240615.sql
```

### Check Database Integrity
```sql
CHECK TABLE Users, Products, Orders;
REPAIR TABLE Users, Products, Orders;
```

### Force Refresh Statistics
```sql
ANALYZE TABLE Products;
ANALYZE TABLE Orders;
ANALYZE TABLE OrderItems;
```

## 🎯 Common Procedures Cheat Sheet

| Need | Procedure | Example |
|------|-----------|---------|
| Send OTP | `SP_SendOTP` | `CALL SP_SendOTP('user@example.com', '123456', 10);` |
| Verify OTP | `SP_VerifyOTP` | `CALL SP_VerifyOTP('user@example.com', '123456');` |
| Get Products | `SP_GetProducts` | `CALL SP_GetProducts('earrings', NULL, 500, NULL, 'price_asc', NULL, 1, 20);` |
| Add to Cart | `SP_AddCartItem` | `CALL SP_AddCartItem(123, 1, 2);` |
| Create Order | `SP_CreateOrder` | `CALL SP_CreateOrder(123, 'Address', 'City', 'State', 'ZIP', 'UPI', '');` |
| Dashboard | `SP_DashboardSummary` | `CALL SP_DashboardSummary();` |
| Revenue Chart | `SP_DashboardRevenueChart` | `CALL SP_DashboardRevenueChart('month');` |
| Validate Coupon | `SP_ValidateCoupon` | `CALL SP_ValidateCoupon('SAVE20', 123, 1000);` |

---

**Pro Tips**:
1. Always backup before major changes
2. Use EXPLAIN to optimize slow queries
3. Monitor ExecutionLogs for errors
4. Keep inventory accurate in real-time
5. Archive old data regularly to keep DB performance optimal
