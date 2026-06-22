/**
 * Cloudinary Configuration
 * Uses Cloudinary Upload Widget (unsigned uploads via upload preset)
 */

export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
};

// Folder per upload context
export const UPLOAD_FOLDERS = {
  product: 'mystic-jewel/products',
  category: 'mystic-jewel/categories',
  banner: 'mystic-jewel/banners',
  mobileBanner: 'mystic-jewel/banners/mobile',
  testimonial: 'mystic-jewel/testimonials',
  avatar: 'mystic-jewel/avatars',
};

export default CLOUDINARY_CONFIG;
