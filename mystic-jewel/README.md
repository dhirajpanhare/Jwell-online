# MysticJewel - Artificial Jewellery Ecommerce Website

A modern, minimalist ecommerce frontend for artificial jewellery targeting Indian customers (females, aged 18-45). Built with React.js, Tailwind CSS, and inspired by Voylla and Adore By Priyanka.

## 🚀 Features

### Core Functionality
- **Product Catalog**: Browse through a curated collection of artificial jewellery
- **Advanced Filtering**: Filter by category, price range, and material
- **Product Search**: Quick search functionality
- **Shopping Cart**: Add/remove items, adjust quantities, view totals
- **Wishlist**: Save favorite items for later
- **Product Details**: Detailed product pages with image gallery, ratings, and specifications
- **Responsive Design**: Mobile-first approach with bottom navigation for mobile devices

### Performance Optimizations
- **Code Splitting**: Route-based lazy loading with React.lazy()
- **Skeleton Loaders**: Smooth loading experience for all async operations
- **Optimized Images**: Proper image sizing and lazy loading
- **Context API**: Efficient state management for cart and wishlist

### Design Features
- **Minimalist Aesthetic**: Clean, solid colors with Indian-inspired palette
- **Trust Signals**: "Made in India", "Free Shipping", "Customer Service" badges
- **Testimonials**: Customer reviews in Voylla-inspired format
- **Mobile Bottom Navigation**: Easy access to key features on mobile

## 🎨 Design System

### Color Palette
- **Maroon**: `#B22234` - Primary brand color
- **Teal**: `#008B8B` - Call-to-action buttons
- **Gold**: `#FFC000` - Accents and highlights
- **Mustard**: `#FFDB58` - Secondary accents
- **Blush Pink**: `#FFC0CB` - Soft highlights
- **Off-White**: `#F5F5F5` - Background

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800

## 📦 Tech Stack

- **Framework**: React.js 18+ with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **State Management**: React Context API

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+ and npm

### Installation Steps

1. **Clone the repository**
   ```bash
   cd mystic-jewel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
mystic-jewel/
├── src/
│   ├── api/
│   │   ├── axiosInstance.js      # Axios configuration
│   │   └── mockData.js            # Mock API with product data
│   ├── components/
│   │   ├── layouts/
│   │   │   ├── AnnouncementBar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── MobileBottomNav.jsx
│   │   ├── CartDrawer.jsx         # Sliding cart drawer
│   │   ├── ProductCard.jsx        # Product card with skeleton
│   │   └── TrustBadges.jsx        # Trust signal badges
│   ├── context/
│   │   ├── CartContext.jsx        # Shopping cart state
│   │   └── WishlistContext.jsx    # Wishlist state
│   ├── pages/
│   │   ├── Home.jsx               # Landing page (lazy loaded)
│   │   ├── ProductList.jsx        # Product listing with filters
│   │   ├── ProductDetail.jsx      # Product detail page
│   │   └── Wishlist.jsx           # Wishlist page
│   ├── App.jsx                    # Main app with routing
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles + Tailwind
├── public/
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

## 🎯 Key Components

### 1. Home Page
- Hero section with call-to-action
- Category grid (Earrings, Necklaces, Rings, Maang Tikka)
- Best sellers section
- Trust badges
- Customer testimonials carousel
- Festive offer banner

### 2. Product Listing Page
- Filterable product grid
- Sidebar filters (category, price, material)
- Sort options (popularity, price, rating)
- Responsive layout

### 3. Product Detail Page
- Image gallery with thumbnails
- Product information and pricing
- Quantity selector
- Add to cart / Buy now buttons
- Tabbed content (Details, Shipping, Returns)
- Product recommendations

### 4. Shopping Cart Drawer
- Slide-in drawer from right
- Item list with quantity controls
- Price breakdown (subtotal, shipping, tax)
- Free shipping progress indicator
- Checkout button

### 5. Wishlist Page
- Grid of saved products
- Move to cart functionality
- Clear all option

## 🔧 Configuration

### Mock Data
The application uses mock data defined in `src/api/mockData.js`. To connect to a real backend:

1. Update `axiosInstance.js` with your API base URL
2. Replace mock functions in `mockData.js` with real API calls
3. Adjust data structures as needed

### Styling
Customize colors in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      maroon: '#B22234',
      teal: '#008B8B',
      // ... add your colors
    },
  },
}
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (with bottom navigation)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🌟 Features Inspired by Reference Sites

### From Voylla
- "Loved it..!" testimonial format with star ratings
- Lightweight product badges
- Cart drawer design
- User-friendly product cards

### From Adore By Priyanka
- Trust badges ("Made in India", "Worldwide Shipping", etc.)
- Free shipping highlight bar
- Simplified FAQ approach
- Clean, minimalist design

## 🚀 Performance Features

1. **Route-based Code Splitting**: Each page is lazy-loaded
2. **Skeleton Loaders**: Smooth loading states for all async operations
3. **Optimized Re-renders**: Context API with proper memoization
4. **Local Storage**: Cart and wishlist persist across sessions

## 💳 Payment Methods Displayed
- UPI (PhonePe, GPay)
- Credit/Debit Cards
- Cash on Delivery (COD)

## 📞 Support & Contact

For questions or support, contact:
- Email: hello@mysticjewel.com
- Phone: +91 98765 43210
- Location: Mumbai, Maharashtra, India

## 📄 License

This project is created for demonstration purposes.

## 🎉 Special Offers

Current promotion: **DIWALI15** - Get 15% off on first order!

---

**Built with ❤️ in India**
