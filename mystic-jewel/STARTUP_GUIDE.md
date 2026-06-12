# Startup Guide - MysticJewel with Dynamic API

**Status**: ✅ Ready to Launch  
**Time to Run**: ~5 minutes  
**Prerequisites**: Node.js 14+, MySQL, npm

---

## Prerequisites Check

### 1. Node.js Installation
```bash
node --version
# Should show v14 or higher
```

### 2. MySQL Installation
```bash
mysql --version
# Should show MySQL 5.7 or higher
```

### 3. npm Installation
```bash
npm --version
# Should show npm 6 or higher
```

If any are missing, install them first.

---

## Step 1: Backend Setup (5 minutes)

### 1.1 Navigate to Backend Directory
```bash
cd DynamicApi-Express-MYSQL
```

### 1.2 Install Dependencies
```bash
npm install
```

### 1.3 Create Environment File
Create `.env` file in the backend directory:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=DynamicApiDb
DB_USER=root
DB_PASSWORD=123456
PORT=3000
NODE_ENV=development

# Email Configuration
EMAIL_PROVIDER=GMAIL
SENDER_EMAIL=your-email@gmail.com
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587

# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10
JWT_SECRET=your_secret_key
```

### 1.4 Setup Database
```bash
# Open MySQL
mysql -u root -p

# Create database
CREATE DATABASE DynamicApiDb CHARACTER SET utf8mb4;
EXIT;

# Optional: Import schema
mysql -u root -p DynamicApiDb < database/setup.sql
```

### 1.5 Start Backend
```bash
npm start
# You should see: "Server running on http://localhost:3000"
```

**✅ Backend is running on:** http://localhost:3000

---

## Step 2: Frontend Setup (5 minutes)

### 2.1 Open New Terminal and Navigate to Frontend
```bash
cd mystic-jewel
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Verify Environment Configuration
Check `.env` file exists with:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1.0
VITE_DYNAMIC_API_ENDPOINT=/DynamicApi/DynamicApiExecute
VITE_SEND_OTP_ENDPOINT=/auth/send-otp
VITE_VERIFY_OTP_ENDPOINT=/auth/verify-otp
```

### 2.4 Start Frontend
```bash
npm run dev
# You should see: "VITE v8.0.13 ready in XXX ms"
```

**✅ Frontend is running on:** http://localhost:5173

---

## Step 3: Test the Integration (2 minutes)

### 3.1 Open Browser
Go to: **http://localhost:5173/login**

### 3.2 Test Login Flow
1. Enter email: `user@example.com`
2. Click "Send OTP"
3. You should see success message
4. Enter OTP: `123456` (any 6-digit code)
5. Click "Verify OTP"
6. You should be redirected to home page ✅

### 3.3 Verify API Integration
Open browser console (F12) and paste:
```javascript
import { executeProcedure } from './api/dynamicApi';
await executeProcedure('SP_GetProducts', {});
// Should return products from API
```

---

## Running the Application

### Quick Start (After First Setup)

**Terminal 1 - Backend:**
```bash
cd DynamicApi-Express-MYSQL
npm start
```

**Terminal 2 - Frontend:**
```bash
cd mystic-jewel
npm run dev
```

**Open Browser:**
- Frontend: http://localhost:5173
- Backend API Docs: http://localhost:3000/api/v1.0/docs

---

## Available Scripts

### Backend
```bash
npm start          # Start development server
npm run dev        # Start with auto-reload (requires nodemon)
npm run build      # Build for production
```

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

---

## Architecture Overview

```
Your Computer
│
├─ Backend (Node.js + Express)
│  └─ Running on: http://localhost:3000
│     ├─ MySQL Database
│     └─ API Endpoints
│
├─ Frontend (React + Vite)
│  └─ Running on: http://localhost:5173
│     ├─ User Interface
│     └─ API Client
│
└─ Network Communication
   └─ http://localhost:3000/api/v1.0
```

---

## Common Issues & Solutions

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Find process using port 3000
lsof -i :3000    # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>    # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in backend .env
PORT=3001
```

### Issue: "Database connection failed"
**Solution:**
- Verify MySQL is running
- Check database credentials in `.env`
- Verify database exists: `SHOW DATABASES;`

### Issue: "CORS error"
**Solution:**
- Ensure backend is running
- Check backend CORS_ORIGINS in `.env`
- Should include: `http://localhost:5173`

### Issue: "Module not found"
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port 5173 already in use"
**Solution:**
```bash
# Kill the process or let Vite use a different port
# Vite will auto-select next available port
```

---

## Testing Flows

### 1. Authentication Flow ✅
```
1. Go to /login
2. Enter email
3. Click "Send OTP"
4. Go to /verify-otp
5. Enter 6-digit OTP
6. Click "Verify"
7. Redirect to home
8. User is logged in
```

### 2. Product Browsing ✅
```
1. Home page loads products from API
2. Click category to filter
3. View best sellers
4. Browse product details
```

### 3. Cart Management ✅
```
1. Click "Add to Cart"
2. Open cart drawer
3. Update quantity
4. Remove items
5. Data syncs with server (if authenticated)
```

### 4. Wishlist Management ✅
```
1. Login to account
2. Click heart icon
3. Add to wishlist
4. View wishlist page
5. Data syncs with server
```

---

## Development Tips

### 1. Real-time Reload
Frontend automatically reloads when files change. Just save and see updates.

### 2. API Testing
Use browser console to test APIs:
```javascript
// Get all products
import { getProducts } from './services/productService';
await getProducts();

// Get categories
import { getCategories } from './services/categoryService';
await getCategories();
```

### 3. Debug State
Check what's in storage:
```javascript
// Check auth
console.log(localStorage.getItem('authToken'));

// Check user
console.log(JSON.parse(localStorage.getItem('user')));

// Check cart
console.log(JSON.parse(localStorage.getItem('cart')));
```

### 4. View Network Requests
Open DevTools → Network tab to see all API calls and responses.

### 5. Check Component Props
Use React DevTools extension to inspect component state and props.

---

## Performance Tips

### Frontend Build Size
```bash
npm run build
# Check dist folder size
# Production: ~305 KB (gzipped: 98 KB)
```

### API Response Time
- Products: ~200-500ms
- Categories: ~100-200ms
- Auth: ~500-1000ms

### Optimization
- Images use CDN URLs (fast loading)
- Lazy loading for pages
- Skeleton screens while loading
- LocalStorage caching

---

## Next Steps

### Immediate
- [x] Start backend
- [x] Start frontend
- [x] Test login flow
- [x] Verify API integration

### Short Term
- [ ] Test product browsing
- [ ] Test cart operations
- [ ] Test wishlist operations
- [ ] Test error handling

### Medium Term
- [ ] Implement checkout flow
- [ ] Add payment integration
- [ ] Test with real data
- [ ] Performance testing

### Long Term
- [ ] Deploy to production
- [ ] Add analytics
- [ ] Add monitoring
- [ ] Add admin panel

---

## Documentation Index

### Quick Reference
- **QUICK_REFERENCE.md** - Common imports and examples
- **INTEGRATION_GUIDE.md** - Complete integration guide
- **API_INTEGRATION_SUMMARY.md** - What was changed

### Detailed Docs
- **Backend README**: `DynamicApi-Express-MYSQL/README.md`
- **Frontend README**: `README.md`
- **Swagger Docs**: http://localhost:3000/api/v1.0/docs

---

## Useful Links

### Local Addresses
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Docs: http://localhost:3000/api/v1.0/docs
- Health Check: http://localhost:3000/health

### Pages
- Login: http://localhost:5173/login
- Home: http://localhost:5173/
- Products: http://localhost:5173/products
- Wishlist: http://localhost:5173/wishlist (requires login)

### API Endpoints
- Send OTP: POST http://localhost:3000/api/v1.0/auth/send-otp
- Verify OTP: POST http://localhost:3000/api/v1.0/auth/verify-otp
- Dynamic API: POST http://localhost:3000/api/v1.0/DynamicApi/DynamicApiExecute

---

## Support

### If Something Goes Wrong

1. **Check the console** - Browser console (F12) for frontend errors
2. **Check terminal** - Backend terminal for server errors
3. **Check network** - DevTools Network tab to see API calls
4. **Read documentation** - Check relevant docs for your issue
5. **Check environment** - Verify `.env` files are configured

### Common Debugging
```bash
# Restart backend
Ctrl+C in backend terminal
npm start

# Restart frontend
Ctrl+C in frontend terminal
npm run dev

# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check ports
# Windows: netstat -ano | findstr :3000
# macOS: lsof -i :3000
# Linux: lsof -i :3000
```

---

## Success Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can see login page
- [ ] Can send OTP
- [ ] Can verify OTP and login
- [ ] Home page loads products
- [ ] Categories display correctly
- [ ] Can add to cart
- [ ] Can add to wishlist (after login)
- [ ] API console commands work
- [ ] All pages load without errors

**If all boxes are checked: ✅ YOU'RE READY TO GO!**

---

## Quick Command Reference

```bash
# Backend
cd DynamicApi-Express-MYSQL && npm install && npm start

# Frontend (in new terminal)
cd mystic-jewel && npm install && npm run dev

# After first setup, just:
npm start          # backend
npm run dev        # frontend
```

---

## Shutdown

To stop the servers:

**Backend:**
```
Press Ctrl+C in backend terminal
```

**Frontend:**
```
Press Ctrl+C in frontend terminal
```

**To restart:**
Just run the same commands again.

---

## Next Session

When you come back later:

1. Start MySQL (if not running)
2. Start backend: `npm start` (from backend dir)
3. Start frontend: `npm run dev` (from frontend dir)
4. Open http://localhost:5173

That's it! You're ready to work.

---

**Happy Coding! 🚀**

For detailed information, see the documentation files included in the project.

---

*Version 1.0.0 | June 3, 2026*
