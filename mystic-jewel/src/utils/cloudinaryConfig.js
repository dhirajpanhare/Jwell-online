/**
 * Cloudinary Configuration Module
 * Centralized configuration for Cloudinary SDK
 */

import { CldUploadWidget } from 'next-cloudinary';

// Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || 'your-api-key',
};

// Validation
if (!CLOUDINARY_CONFIG.cloudName || CLOUDINARY_CONFIG.cloudName === 'your-cloud-name') {
  console.warn('⚠️ Cloudinary configuration missing. Please set VITE_CLOUDINARY_CLOUD_NAME environment variable.');
}

if (!CLOUDINARY_CONFIG.uploadPreset || CLOUDINARY_CONFIG.uploadPreset === 'your-upload-preset') {
  console.warn('⚠️ Cloudinary upload preset missing. Please set VITE_CLOUDINARY_UPLOAD_PRESET environment variable.');
}

// Upload options for different file types
export const UPLOAD_OPTIONS = {
  // Image uploads
  images: {
    folder: 'mystic-jewel/products',
    resource_type: 'auto',
    transformation: [
      { width: 800, height: 800, crop: 'fill', gravity: 'auto' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    tags: ['product-image', 'mystic-jewel'],
    eager: [
      { width: 400, height: 400, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
      { width: 150, height: 150, crop: 'fill', quality: 'auto', fetch_format: 'auto' }
    ],
  },

  // Product images
  productImages: {
    folder: 'mystic-jewel/products/images',
    resource_type: 'auto',
    transformation: [
      { width: 1000, height: 1000, crop: 'fill', gravity: 'auto' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    tags: ['product', 'mystic-jewel'],
  },

  // Category images
  categoryImages: {
    folder: 'mystic-jewel/categories',
    resource_type: 'auto',
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: 'auto' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    tags: ['category', 'mystic-jewel'],
  },

  // Banner images
  bannerImages: {
    folder: 'mystic-jewel/banners',
    resource_type: 'auto',
    transformation: [
      { width: 1920, height: 1080, crop: 'fill', gravity: 'auto' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    tags: ['banner', 'mystic-jewel'],
  },

  // Mobile banner images
  mobileBannerImages: {
    folder: 'mystic-jewel/banners/mobile',
    resource_type: 'auto',
    transformation: [
      { width: 800, height: 1200, crop: 'fill', gravity: 'auto' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    tags: ['banner', 'mobile', 'mystic-jewel'],
  },

  // Testimonial images
  testimonialImages: {
    folder: 'mystic-jewel/testimonials',
    resource_type: 'auto',
    transformation: [
      { width: 300, height: 300, crop: 'thumb', gravity: 'face' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    tags: ['testimonial', 'mystic-jewel'],
  },

  // Avatar/Profile images
  avatarImages: {
    folder: 'mystic-jewel/avatars',
    resource_type: 'auto',
    transformation: [
      { width: 200, height: 200, crop: 'thumb', gravity: 'face' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    tags: ['avatar', 'profile', 'mystic-jewel'],
  },

  // Documents
  documents: {
    folder: 'mystic-jewel/documents',
    resource_type: 'auto',
    tags: ['document', 'mystic-jewel'],
  },

  // Videos
  videos: {
    folder: 'mystic-jewel/videos',
    resource_type: 'video',
    transformation: [
      { width: 800, crop: 'scale' },
      { quality: 'auto:best' }
    ],
    tags: ['video', 'mystic-jewel'],
  },
};

// File type restrictions
export const FILE_TYPE_RESTRICTIONS = {
  images: {
    allowed: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    maxSize: 5 * 1024 * 1024, // 5MB
    extensions: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
  },
  documents: {
    allowed: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize: 10 * 1024 * 1024, // 10MB
    extensions: ['pdf', 'doc', 'docx'],
  },
  videos: {
    allowed: ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo'],
    maxSize: 100 * 1024 * 1024, // 100MB
    extensions: ['mp4', 'avi', 'mov', 'wmv'],
  },
};

// Cloudinary URL builder utility
export const buildCloudinaryUrl = (publicId, transformations = {}) => {
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
  const transformationString = Object.entries(transformations)
    .map(([key, value]) => `${key}_${value}`)
    .join(',');
  
  return transformationString 
    ? `${baseUrl}/${transformationString}/${publicId}` 
    : `${baseUrl}/${publicId}`;
};

export default CLOUDINARY_CONFIG;
