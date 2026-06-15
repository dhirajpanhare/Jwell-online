# DynamicApi Express MySQL - Backend API

A production-ready, enterprise-grade backend API built with Express.js and MySQL for the MysticJewel e-commerce platform. Features dynamic stored procedure execution, JWT authentication with email OTP, comprehensive Swagger documentation, and audit logging.

## 🎯 Project Overview

**Backend Status**: ✅ Production-Ready
**Version**: 1.0.0
**Architecture**: Layered Enterprise Architecture
**Purpose**: RESTful API for MysticJewel Artificial Jewellery E-Commerce Platform

This is the backend API service that powers the MysticJewel frontend and admin panel, handling all business logic, database operations, authentication, and data management for an artificial jewellery e-commerce platform.

---

## 📦 Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Runtime** | Node.js | 14+ |
| **Framework** | Express.js | 4.18+ |
| **Database** | MySQL | 8.0+ |
| **Database Driver** | mysql2/promise | 3.6+ |
| **Authentication** | JWT (jsonwebtoken) | 9.0+ |
| **Email Service** | Nodemailer | 6.9+ |
| **Security** | bcryptjs | 2.4+ |
| **CORS** | cors | 2.8+ |
| **Documentation** | Swagger/OpenAPI | 4.6+ |
| **Dev Tools** | Nodemon | latest |
| **Testing** | Jest | latest |

---

## ✨ Core Features

### Authentication & Security
- ✅ Email OTP-based authentication
- ✅ JWT token management (secure, expiring tokens)
- ✅ Password hashing with bcryptjs
- ✅ Parameterized queries (SQL injection protection)
- ✅ CORS with configurable origins
- ✅ Request payload validation

### Dynamic API Execution
- ✅ Execute any stored procedure dynamically
- ✅ Flexible parameter handling with custom separators
- ✅ Automatic parameter parsing and type conversion
- ✅ Transaction support for complex operations
- ✅ Metadata extraction from procedures

### Monitoring & Auditing
- ✅ Execution logging of all API calls
- ✅ Performance tracking (execution time)
- ✅ Error logging with stack traces
- ✅ User activity audit trail
- ✅ Comprehensive logging across all layers

### API Documentation
- ✅ Interactive Swagger UI
- ✅ OpenAPI specification
- ✅ JSDoc comments on all endpoints
- ✅ Request/response examples
- ✅ Parameter documentation

### Database
- ✅ Connection pooling (10 concurrent connections)
- ✅ Automatic reconnection
- ✅ Async/await support
- ✅ Prepared statements
- ✅ Transaction support

---

## 🚀 Quick Start

### Prerequisites
- Node.js 14 or higher
- MySQL 8.0 or higher
- npm or yarn package manager

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd DynamicApi-Express-MYSQL
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure `.env` file**
   ```env
   # Database Configuration
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=123456
   DB_NAME=DynamicApiDb

   # Email Configuration (Gmail SMTP)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password

   # JWT Configuration
   JWT_SECRET=your_very_secure_jwt_secret_key_here
   JWT_EXPIRY=24h

   # CORS Configuration (Comma-separated URLs)
   CORS_ORIGINS=http://localhost:5173,http://localhost:4200,http://localhost:3000

   # Server Configuration
   PORT=3001
   NODE_ENV=development
   ```

5. **Create MySQL database**
   ```bash
   mysql -u root -p < database/setup.sql
   ```
   Or manually:
   ```sql
   CREATE DATABASE IF NOT EXISTS DynamicApiDb;
   USE DynamicApiDb;
   -- Tables will be created by setup.sql
   ```

### Running the Server

#### Development Mode (with auto-reload)
```bash
npm run dev
```
Server starts on `http://localhost:3001`

#### Production Mode
```bash
npm start
```

#### Check Server Health
```bash
curl http://localhost:3001/health
```

---

## 📚 API Documentation

### Interactive Swagger UI
Once server is running, visit:
```
http://localhost:3001/api/v1.0/docs
```

### OpenAPI Specification
```
http://localhost:3001/swagger.json
```

---

## 🔌 API Endpoints

### Authentication Endpoints

#### 1. Send OTP
Sends a one-time password to the user's email.

```http
POST /api/v1.0/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "email": "user@example.com"
  }
}
```

#### 2. Verify OTP
Verifies the OTP and returns a JWT token for authenticated requests.

```http
POST /api/v1.0/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "email": "user@example.com",
      "userId": "123"
    }
  }
}
```

### Dynamic API Endpoint

#### Execute Stored Procedure
Executes any stored procedure with dynamic parameters.

```http
POST /api/v1.0/DynamicApi/DynamicApiExecute
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "stringOne": "productId=1|userId=5",
  "stringTwo": "|",
  "stringThree": "=",
  "stringFour": "SP_GetProducts"
}
```

**Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `stringOne` | string | Key-value pairs (format: `key1=val1<sep>key2=val2`) | Required |
| `stringTwo` | string | Parameter separator | `\|` |
| `stringThree` | string | Key-value separator | `=` |
| `stringFour` | string | Stored Procedure name | Required |

**Response:**
```json
{
  "success": true,
  "message": "Procedure executed successfully",
  "data": {
    "results": [...procedure results...],
    "executionTime": 45
  }
}
```

### System Endpoints

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-06-15T10:30:00Z"
}
```

---

## 📂 Project Structure

```
DynamicApi-Express-MYSQL/
├── src/
│   ├── index.js                           # Main server entry point
│   │                                      # Middleware setup, DB config, server startup
│   │
│   ├── config/
│   │   ├── database.js                   # MySQL connection pool setup
│   │   └── swagger.js                    # Swagger/OpenAPI documentation config
│   │
│   ├── routes/
│   │   ├── apiRoutes.js                  # API endpoint definitions
│   │   │                                 # Dynamic API and other endpoints
│   │   └── authRoutes.js                 # Authentication (OTP/JWT) routes
│   │
│   ├── controllers/
│   │   └── dynamicApiController.js       # HTTP request/response handlers
│   │                                     # Input validation, service invocation
│   │
│   ├── services/
│   │   ├── dynamicApiService.js          # Business logic orchestration
│   │   │                                 # Parameter parsing, execution tracking
│   │   ├── storedProcedureExecutor.js    # Direct MySQL procedure execution
│   │   │                                 # Parameterized queries, result processing
│   │   ├── transactionExecutor.js        # Multi-statement transaction support
│   │   ├── procedureMetadataExtractor.js # Extract procedure info from DB
│   │   └── emailService.js               # Email/OTP sending via Nodemailer
│   │
│   ├── middleware/
│   │   ├── auth.js                       # JWT verification middleware
│   │   │                                 # Token validation, user context
│   │   └── errorHandler.js               # Global error handling
│   │                                     # 404, exception catching, response formatting
│   │
│   ├── utils/
│   │   ├── logger.js                     # Logging utility
│   │   │                                 # Info, error, warn, debug levels
│   │   └── procedurePayloadGenerator.js  # Dynamic payload construction
│   │
│   └── worker.js                         # Cloudflare Workers adapter (optional)
│
├── database/
│   └── setup.sql                         # Database schema and tables
│
├── .env                                  # Environment variables (gitignored)
├── .env.example                          # Environment template
├── package.json                          # Dependencies and scripts
├── package-lock.json                     # Locked dependency versions
├── wrangler.toml                         # Cloudflare Workers config (optional)
├── worker.js                             # Cloudflare Workers deployment (optional)
├── .gitignore                            # Git ignore rules
└── README.md                             # This file
```

---

## 🏗️ Architecture

### Layered Architecture (Enterprise Pattern)

```
┌─────────────────────────────────────────┐
│   HTTP Layer (Express App)              │
│   - Middleware setup                    │
│   - CORS, JSON parsing                  │
│   - Database pools                      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Routes Layer                          │
│   - Endpoint definitions                │
│   - JSDoc/Swagger docs                  │
│   - Route-to-controller mapping         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Controllers Layer                     │
│   - HTTP request handling               │
│   - Input validation                    │
│   - Service invocation                  │
│   - Response formatting                 │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Services Layer                        │
│   - Business logic                      │
│   - Parameter parsing                   │
│   - Execution tracking                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Database Layer                        │
│   - MySQL operations                    │
│   - Parameterized queries               │
│   - Transaction management              │
└─────────────────────────────────────────┘

Supported by:
├── Middleware Layer (Auth, Error handling)
└── Utilities Layer (Logging, Helpers)
```

---

## 🔐 Security Features

### SQL Injection Prevention
- ✅ Parameterized queries using `?` placeholders
- ✅ No string concatenation in queries
- ✅ Input validation before execution

### Authentication
- ✅ JWT token-based auth
- ✅ Email OTP verification
- ✅ Token expiry (24 hours default)
- ✅ Secure token storage

### Password Security
- ✅ bcryptjs hashing (10 salt rounds)
- ✅ Never store plain passwords
- ✅ Always hash before storing

### CORS Protection
- ✅ Configurable origin whitelist
- ✅ Credentials support
- ✅ Method restrictions (GET, POST, OPTIONS)
- ✅ Header validation

### Data Protection
- ✅ Environment variable usage
- ✅ Secrets never in code
- ✅ Production config separation

---

## 🗄️ Database Schema

### Key Tables
- **Users** - User accounts, emails, password hashes
- **ExecutionLogs** - API call audit trail
- **Products** - Jewellery items, prices, inventory
- **Orders** - Customer orders, totals, status
- **OrderItems** - Individual items in orders
- **Cart** - Shopping cart items per user
- **Wishlist** - Saved products per user
- **Categories** - Product categories
- **Coupons** - Discount codes

### Connection Pool Settings
| Setting | Value | Purpose |
|---------|-------|---------|
| Connection Limit | 10 | Max concurrent connections |
| Queue Limit | 0 | Unlimited queued requests |
| Wait for Connections | true | Wait when pool exhausted |
| Enable Keep Alive | true | Prevent connection timeout |

---

## 📋 Example: Adding a New Stored Procedure

### 1. Create in MySQL
```sql
CREATE PROCEDURE SP_GetCustomerOrders(
    IN p_customerId INT
)
BEGIN
    SELECT * FROM Orders WHERE CustomerId = p_customerId;
END;
```

### 2. Call via API
```bash
curl -X POST http://localhost:3001/api/v1.0/DynamicApi/DynamicApiExecute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "stringOne": "customerId=123",
    "stringTwo": "|",
    "stringThree": "=",
    "stringFour": "SP_GetCustomerOrders"
  }'
```

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Manual API Testing with Postman
1. Import the OpenAPI spec from `/swagger.json`
2. Set `Authorization` header with JWT token
3. Test endpoints in Swagger UI or Postman
4. Check responses and execution logs

---

## 📊 Performance Optimization

### Connection Pooling
- Reuses 10 MySQL connections
- Automatic reconnection on failure
- Prevents connection exhaustion

### Async/Await
- Non-blocking operations
- Efficient resource usage
- Better error handling

### Logging
- Minimal performance impact
- Structured logging format
- Easy debugging and monitoring

### Query Optimization
- Parameterized queries (query caching)
- Connection pooling
- Efficient result processing

---

## 🚢 Deployment Guide

### Production Environment Setup

1. **Update `.env` for production**
   ```env
   NODE_ENV=production
   PORT=3001
   DB_HOST=prod-db-host
   DB_USER=prod_user
   DB_PASSWORD=secure_password_here
   JWT_SECRET=production_secret_key
   CORS_ORIGINS=https://yourdomain.com
   ```

2. **Install globally with PM2 (for process management)**
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name "mystjewel-api"
   pm2 save
   ```

3. **Setup with Docker**
   ```bash
   docker build -t mystjewel-api .
   docker run -p 3001:3001 --env-file .env mystjewel-api
   ```

### Deployment Platforms

#### Heroku
```bash
heroku create mystjewel-api
git push heroku main
```

#### AWS EC2
```bash
npm install -g pm2
pm2 start src/index.js --name "api"
pm2 startup
```

#### DigitalOcean App Platform
Push to GitHub and connect repository in App Platform dashboard.

---

## 🐛 Troubleshooting

### Issue: Database Connection Refused
```bash
# Check MySQL is running
mysql -u root -p
# Verify credentials in .env
# Ensure database exists: CREATE DATABASE DynamicApiDb;
```

### Issue: OTP Email Not Sending
```bash
# Enable Gmail Less Secure App Access OR use App Password
# Verify EMAIL_USER and EMAIL_PASSWORD in .env
# Check Nodemailer logs
```

### Issue: CORS Error
```bash
# Add your frontend URL to CORS_ORIGINS in .env
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
# Restart server
npm run dev
```

### Issue: Port Already in Use
```bash
# Use different port
PORT=3002 npm run dev

# Or kill existing process
# Windows: netstat -ano | findstr :3001
# Mac/Linux: lsof -i :3001 | kill -9 <PID>
```

### Issue: JWT Token Expired
```bash
# User needs to request new OTP and get new token
# Tokens expire after JWT_EXPIRY duration (default: 24h)
```

---

## 📝 Environment Variables Reference

```env
# Database
DB_HOST=127.0.0.1              # MySQL host
DB_PORT=3306                   # MySQL port
DB_USER=root                   # MySQL user
DB_PASSWORD=123456             # MySQL password
DB_NAME=DynamicApiDb           # Database name

# Email (Gmail)
EMAIL_SERVICE=gmail            # Email service
EMAIL_USER=your@gmail.com      # Gmail address
EMAIL_PASSWORD=app_password    # Gmail app password

# JWT
JWT_SECRET=secure_secret       # JWT signing secret
JWT_EXPIRY=24h                 # Token expiry

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Server
PORT=3001                      # Server port
NODE_ENV=development           # development/production
```

---

## 📖 Further Documentation

- **Database Schema**: See `database/setup.sql`
- **API Examples**: Check Swagger UI at `/api/v1.0/docs`
- **Frontend Integration**: See `../mystic-jewel/README.md`

---

## 📄 License

MIT License - Feel free to use this project for your needs.

---

## 👥 Support

For issues, questions, or feature requests:
1. Check existing documentation
2. Review error logs for debugging
3. Check `.env` configuration
4. Visit Swagger UI for endpoint docs
5. Create an issue on the repository

---

**Happy coding! 🚀**
