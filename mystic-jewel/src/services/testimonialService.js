import { executeProcedure } from '../api/dynamicApi';

/**
 * Mock testimonials - can be replaced with API call to SP_GetTestimonials
 */
const mockTestimonials = [
  {
    id: 1,
    quote: 'Loved it..! The earrings are so lightweight and beautiful. Got so many compliments at my friend\'s wedding!',
    name: 'Priya Sharma',
    rating: 5,
  },
  {
    id: 2,
    quote: 'Amazing quality! The necklace looks exactly like the picture. Very happy with my purchase.',
    name: 'Anjali Verma',
    rating: 5,
  },
  {
    id: 3,
    quote: 'Fast delivery and excellent packaging. The jewellery is stunning and doesn\'t feel heavy at all.',
    name: 'Neha Patel',
    rating: 5,
  },
  {
    id: 4,
    quote: 'Best artificial jewellery I\'ve bought online! The gold plating is perfect and it\'s hypoallergenic.',
    name: 'Riya Gupta',
    rating: 5,
  },
];

/**
 * Fetch testimonials
 * Note: Backend procedure (SP_GetTestimonials) not yet implemented
 * Using mock data for now
 */
export const getTestimonials = async () => {
  try {
    // Try to fetch from API if procedure is implemented
    try {
      const result = await executeProcedure('SP_GetTestimonials', {});
      return Array.isArray(result) ? result : result?.data || mockTestimonials;
    } catch (error) {
      // If API fails, use mock data
      console.log('Using mock testimonials');
      return mockTestimonials;
    }
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return mockTestimonials;
  }
};

export default {
  getTestimonials,
};
