# Database Files - MysticJewel E-Commerce Platform

Welcome to the MysticJewel database setup guide. This directory contains everything needed to set up and manage the complete e-commerce database.

## 📁 Files Overview

### 1. **complete_schema.sql** (Main File - Start Here!)
The complete, production-ready MySQL database schema with:
- ✅ 16 core tables with full relationships
- ✅ 40+ stored procedures for all operations
- ✅ Sample data and initial configuration
- ✅ Comprehensive indexes for performance
- ✅ Security features and constraints

**Size**: ~2000 lines of SQL code
**Time to Import**: ~10-30 seconds
**Supported**: MySQL 8.0+

**Quick Import**:
```bash
mysql -u root -p DynamicApiDb < complete_schema.sql
```

---

### 2. **DATABASE_DOCUMENTATION.md** (Complete Reference)
Detailed documentation covering:
- Full table schema with column descriptions
- All stored procedures with parameters and usage
- Data relationships and integrity rules
- Security features and audit logging
- Performance optimization techniques
- Integration guide for backend
- Troubleshooting section

**Best For**: Developers who need detailed information about database design

---

### 3. **QUICK_REFERENCE.md** (Developer Cheat Sheet)
Fast reference guide with:
- Common SQL queries and examples
- Procedure calls with actual syntax
- Analytics and reporting queries
- Data management operations
- Emergency procedures
- Common issues and solutions

**Best For**: Quick lookups while coding

---

### 4. **SCHEMA_SUMMARY.txt** (Executive Summary)
High-level overview with:
- Quick import instructions
- File structure breakdown
- Database contents summary
- Feature checklist
- Maintenance tasks
- Support information

**Best For**: Project managers and team overviews

---

### 5. **setup.sql** (Optional - If exists)
Legacy setup file for backward compatibility

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Import the Database
```bash
cd DynamicApi-Express-MYSQL/database
mysql -u root -p DynamicApiDb < complete_schema.sql
```

### Step 2: Verify Installation
```bash
mysql -u root -p DynamicApiDb
SHOW TABLES;
SELECT COUNT(*) FROM Categories;
```

### Step 3: Check Admin User
```sql
SELECT Email, Role FROM Users WHERE Role = 'admin';
-- Output: admin@mysticjewel.com | admin
```

### Step 4: Test a Procedure
```sql
CALL SP_GetCategories();
-- Should return 6 product categories
```

Done! 🎉 Your database is ready.

---

## 📊 Database Contents

### Tables (16)
| Category | Tables |
|----------|--------|
| **User Management** | Users, OTPVerification, Addresses |
| **Products** | Products, ProductImages, Categories |
| **Shopping** | Cart, Wishlist |
| **Orders** | Orders, OrderItems, CouponUsage |
| **Promotions** | Coupons, Banners, Testimonials |
| **Admin** | Inventory, ExecutionLogs, WebsiteSettings |

### Procedures (40+)
| Category | Count | Examples |
|----------|-------|----------|
| **Authentication** | 2 | SendOTP, VerifyOTP |
| **Products** | 4 | GetProducts, GetProductById, GetBestSellers |
| **Cart** | 5 | GetCart, AddCartItem, UpdateCartItem, RemoveCartItem, ClearCart |
| **Wishlist** | 3 | GetWishlist, AddWishlist, RemoveWishlist |
| **Orders** | 4 | CreateOrder, GetOrders, GetOrderDetails, CancelOrder |
| **Dashboard** | 6 | DashboardSummary, RevenueChart, TopProducts, etc. |
| **Management** | 12+ | ProductList, CategoryInsert, CouponUpdate, etc. |
| **Reports** | 3 | SalesReport, ProductReport, CustomerReport |

---

## 🔧 Common Tasks

### Add a New Product
```sql
CALL SP_ProductInsert(
    'Gold Earrings',           -- ProductName
    'gold-earrings',           -- ProductSlug
    'Beautiful earrings',      -- Description
    'Premium gold earrings',   -- ShortDescription
    1,                         -- CategoryId (Earrings)
    299.99,                    -- Price
    399.99,                    -- CompareAtPrice
    'GOLD-001',                -- SKU
    'Gold Plating',            -- Material
    50                         -- StockQuantity
);
```

### Create an Order
```sql
CALL SP_CreateOrder(
    1,                         -- UserId
    '123 Main Street',         -- ShippingAddress
    'Mumbai',                  -- ShippingCity
    'Maharashtra',             -- ShippingState
    '400001',                  -- ShippingZipCode
    'UPI',                     -- PaymentMethod
    'Please deliver after 5 PM'  -- Notes
);
```

### Get Dashboard Statistics
```sql
CALL SP_DashboardSummary();
-- Returns: Orders, Revenue, Products, Customers, Pending Orders, Low Stock
```

### View Sales Report
```sql
CALL SP_SalesReport('2024-01-01', '2024-12-31');
-- Returns: Daily sales, orders, revenue, taxes, discounts
```

See **QUICK_REFERENCE.md** for more examples.

---

## 📈 Key Features

✅ **Full-Text Search**: Search products by name or description
✅ **Automatic Calculations**: Tax, shipping, discounts computed automatically
✅ **Stock Management**: Real-time inventory tracking with low-stock alerts
✅ **Coupon System**: Usage limits, date-based validity, discount calculation
✅ **Order Lifecycle**: From pending → processing → shipped → delivered
✅ **Audit Trail**: All API calls logged with timestamps
✅ **Multi-Role**: Support for customers and admins
✅ **Data Integrity**: Foreign keys, constraints, referential integrity
✅ **Performance**: Optimized indexes and query patterns
✅ **Scalability**: Designed for 100K+ products and 1M+ orders

---

## 🔐 Security

✅ Parameterized queries prevent SQL injection
✅ Password hashing with bcryptjs
✅ OTP-based email authentication
✅ Audit logging of all operations
✅ Role-based access control
✅ Data validation and constraints
✅ Secure timestamp tracking

---

## 📊 Sample Data Included

### Categories (6)
- Earrings
- Necklaces
- Rings
- Maang Tikka
- Bangles
- Anklets

### Admin User
- Email: `admin@mysticjewel.com`
- Password: `password123` (hashed)
- Role: `admin`

### Website Settings (10+)
- Site name, tagline, contact info
- Shipping thresholds & tax rates
- Social media links
- Currency settings

---

## 💾 Backup & Restore

### Create Backup
```bash
mysqldump -u root -p DynamicApiDb > backup_$(date +%Y%m%d).sql
```

### Restore from Backup
```bash
mysql -u root -p DynamicApiDb < backup_20240615.sql
```

### Automated Daily Backup
```bash
# Add to crontab
0 2 * * * mysqldump -u root -pPASSWORD DynamicApiDb > /backups/db_$(date +\%Y\%m\%d).sql
```

---

## 🐛 Troubleshooting

### Issue: "Table already exists"
**Solution**: Drop database first
```sql
DROP DATABASE DynamicApiDb;
-- Then re-import complete_schema.sql
```

### Issue: "Foreign key constraint error"
**Solution**: Ensure parent records exist. Check with:
```sql
SELECT * FROM Categories;
SELECT * FROM Users;
```

### Issue: "Slow product search"
**Solution**: Rebuild fulltext index
```sql
REPAIR TABLE Products;
OPTIMIZE TABLE Products;
```

### Issue: "Out of disk space"
**Solution**: Delete old execution logs
```sql
DELETE FROM ExecutionLogs 
WHERE CreatedAt < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

See **DATABASE_DOCUMENTATION.md** for more troubleshooting.

---

## 📖 Documentation Files

| File | Purpose | Best For |
|------|---------|----------|
| **DATABASE_DOCUMENTATION.md** | Detailed schema & procedures | Developers |
| **QUICK_REFERENCE.md** | Common queries & tasks | Quick lookups |
| **SCHEMA_SUMMARY.txt** | Overview & statistics | Managers |
| **README.md** | This file | Getting started |

---

## 🎯 Next Steps

1. ✅ **Import Database**
   ```bash
   mysql -u root -p DynamicApiDb < complete_schema.sql
   ```

2. ✅ **Test Connection**
   ```bash
   mysql -u root -p DynamicApiDb -e "SELECT COUNT(*) FROM Categories;"
   ```

3. ✅ **Configure Backend**
   - Update `.env` with DB credentials
   - Test procedures from Node.js

4. ✅ **Load Production Data**
   - Import products via script
   - Add promotional banners
   - Configure website settings

5. ✅ **Set Up Monitoring**
   - Enable query logging
   - Set up automated backups
   - Monitor ExecutionLogs

---

## 📞 Support

**Questions?**
1. Check **DATABASE_DOCUMENTATION.md** for technical details
2. Review **QUICK_REFERENCE.md** for common operations
3. Look up issue in **Troubleshooting** section
4. Check ExecutionLogs for error messages

**Need Custom Procedures?**
Modify complete_schema.sql and add new procedures following existing patterns.

---

## 📋 Database Specifications

| Specification | Value |
|---------------|-------|
| **Database Name** | DynamicApiDb |
| **Character Set** | utf8mb4 (Unicode) |
| **MySQL Version** | 8.0+ |
| **Tables** | 16 core tables |
| **Procedures** | 40+ |
| **Indexes** | 20+ |
| **Sample Data** | Categories, Admin, Settings |
| **Backup Size** | ~2 MB |
| **Import Time** | ~10-30 seconds |

---

## ✨ Features Highlight

### For Customers
- Browse products with filters
- Search by name, material, price
- Add to cart & wishlist
- OTP-based login
- View order history
- Apply coupons

### For Admins
- Dashboard with KPIs
- Product management (CRUD)
- Order tracking & updates
- Customer analytics
- Sales reports
- Inventory management
- Banner management
- Coupon configuration

### For System
- Full audit logging
- Real-time stock tracking
- Automatic tax calculation
- Referential integrity
- Performance optimization
- Scalable architecture

---

## 🎓 Learning Resources

**To understand the database:**
1. Start with **SCHEMA_SUMMARY.txt** for overview
2. Read **DATABASE_DOCUMENTATION.md** for details
3. Try queries from **QUICK_REFERENCE.md**
4. Study complete_schema.sql source code

**To integrate with backend:**
1. See backend README.md for setup
2. Check `src/services/` for procedure calls
3. Review API documentation in Swagger

---

## ⚡ Performance Tips

1. **Always backup** before major changes
2. **Use EXPLAIN** to optimize slow queries
3. **Monitor ExecutionLogs** for errors
4. **Archive old logs** monthly (90+ days)
5. **Rebuild indexes** quarterly
6. **Update statistics** regularly with ANALYZE TABLE

---

## 📅 Maintenance Checklist

**Weekly:**
- [ ] Check ExecutionLogs for errors
- [ ] Verify critical data integrity
- [ ] Monitor disk space

**Monthly:**
- [ ] Archive old execution logs
- [ ] Run ANALYZE TABLE on large tables
- [ ] Review sales reports

**Quarterly:**
- [ ] Full backup and restore test
- [ ] Check index fragmentation
- [ ] Optimize slow queries

---

## 🚀 Ready to Go!

Your complete e-commerce database is now available. Import it, test it, and start building!

**Next File to Check:**
→ **DATABASE_DOCUMENTATION.md** for detailed information
or
→ **QUICK_REFERENCE.md** for quick lookups

---

**Version**: 1.0.0
**Last Updated**: June 2024
**Status**: ✅ Production Ready
**License**: MIT

Happy coding! 🎉
