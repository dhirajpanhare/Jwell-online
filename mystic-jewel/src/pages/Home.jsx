import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import TrustBadges from '../components/TrustBadges';
import { useBestSellers } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { getTestimonials } from '../services/testimonialService';

const Home = () => {
  const { products: bestSellers, loading: bestsellersLoading, error: bestsellersError } = useBestSellers(6);
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Fetch testimonials (can be mock or API)
  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const data = await getTestimonials();
        setTestimonials(data);
      } catch (error) {
        console.error('Error loading testimonials:', error);
        // Fallback to empty array
        setTestimonials([]);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  const nextTestimonial = () => {
    if (testimonials.length > 0) {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }
  };

  const prevTestimonial = () => {
    if (testimonials.length > 0) {
      setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }
  };

  const loading = bestsellersLoading || categoriesLoading || testimonialsLoading;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] bg-gradient-to-r from-maroon to-teal">
        <div className="absolute inset-0 bg-black/30"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1200&h=600&fit=crop)',
            backgroundBlendMode: 'overlay',
          }}
        ></div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Timeless Craft. Modern Grace.
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-100">
              Discover exquisite artificial jewellery that blends tradition with contemporary elegance
            </p>
            <Link to="/products" className="inline-block btn-primary text-lg">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Free Shipping Banner */}
      <div className="bg-gradient-to-r from-gold to-mustard text-maroon py-3 text-center font-semibold">
        Yay! Free Shipping on orders above ₹1299 🚀
      </div>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Shop by Category
          </h2>
          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-full mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : categoriesError ? (
            <div className="text-center text-red-600">
              Error loading categories
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category) => {
                const catId = category.CategoryId || category.id;
                const catName = category.CategoryName || category.name || '';
                const catImage = category.ImageUrl || category.image || 'https://via.placeholder.com/200x200?text=' + catName;
                return (
                  <Link
                    key={catId}
                    to={`/products?category=${encodeURIComponent(catName)}`}
                    className="group text-center"
                  >
                    <div className="aspect-square rounded-full overflow-hidden mb-4 card-shadow bg-gray-100">
                      <img
                        src={catImage}
                        alt={catName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={e => { e.target.src = 'https://via.placeholder.com/200x200?text=' + catName; }}
                      />
                    </div>
                    <h3 className="font-semibold text-lg group-hover:text-teal transition-colors">{catName}</h3>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-600">
              No categories available
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-16 bg-offwhite">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Best Sellers</h2>
            <Link
              to="/products"
              className="text-teal font-semibold hover:underline"
            >
              View All
            </Link>
          </div>
          {bestsellersLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : bestsellersError ? (
            <div className="text-center text-red-600">
              Error loading best sellers
            </div>
          ) : bestSellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product.ProductId || product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600">
              No products available
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-br from-blush/20 to-gold/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            What Our Customers Say
          </h2>
          {testimonialsLoading ? (
            <div className="max-w-3xl mx-auto animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ) : testimonials.length > 0 ? (
            <div className="max-w-3xl mx-auto relative">
              <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-lg md:text-xl italic text-gray-700 text-center mb-6">
                  "{testimonials[currentTestimonial]?.quote}"
                </p>
                <p className="text-center font-bold text-maroon">
                  - {testimonials[currentTestimonial]?.name}
                </p>
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentTestimonial ? 'bg-maroon w-6' : 'bg-gray-300'
                    }`}
                  ></button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-600">
              No testimonials available
            </div>
          )}
        </div>
      </section>

      {/* Festive Offer Banner */}
      <section className="py-12 bg-maroon text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            🎉 Diwali Special Offer! 🎉
          </h2>
          <p className="text-lg mb-4">
            Get 15% off on your first order
          </p>
          <p className="text-gold text-xl font-bold">
            Use code: DIWALI15
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
