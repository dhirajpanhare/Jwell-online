/**
 * Cloudinary Service
 * Backend service for Cloudinary operations
 */

const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer to upload
 * @param {string} filename - Original filename
 * @param {string} folder - Cloudinary folder path
 * @param {object} options - Additional upload options
 * @returns {Promise<object>} Upload result
 */
const uploadFile = async (fileBuffer, filename, folder = 'mystic-jewel', options = {}) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: options.publicId || filename.split('.')[0],
          resource_type: options.resourceType || 'auto',
          tags: options.tags || ['mystic-jewel'],
          quality: 'auto',
          fetch_format: 'auto',
          ...options,
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            logger.info(`File uploaded successfully: ${result.public_id}`);
            resolve({
              success: true,
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              size: result.bytes,
              format: result.format,
              metadata: {
                originalName: filename,
                uploadedAt: new Date().toISOString(),
              },
            });
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    logger.error('File upload failed:', error);
    throw error;
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Public ID of the file
 * @returns {Promise<object>} Deletion result
 */
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`File deleted successfully: ${publicId}`);
    return {
      success: true,
      publicId,
      result,
    };
  } catch (error) {
    logger.error('File deletion failed:', error);
    throw error;
  }
};

/**
 * Delete multiple files from Cloudinary
 * @param {string[]} publicIds - Array of public IDs
 * @returns {Promise<object>} Deletion results
 */
const deleteMultipleFiles = async (publicIds) => {
  try {
    const results = await Promise.all(
      publicIds.map(publicId => cloudinary.uploader.destroy(publicId))
    );
    logger.info(`${publicIds.length} files deleted successfully`);
    return {
      success: true,
      deleted: publicIds.length,
      results,
    };
  } catch (error) {
    logger.error('Multiple file deletion failed:', error);
    throw error;
  }
};

/**
 * Get file metadata from Cloudinary
 * @param {string} publicId - Public ID of the file
 * @returns {Promise<object>} File metadata
 */
const getFileMetadata = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      success: true,
      metadata: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        size: result.bytes,
        format: result.format,
        created: result.created_at,
        lastModified: result.last_updated,
      },
    };
  } catch (error) {
    logger.error('Failed to get file metadata:', error);
    throw error;
  }
};

/**
 * Generate optimized image URL
 * @param {string} publicId - Public ID of the image
 * @param {object} transformations - Transformation options
 * @returns {string} Optimized URL
 */
const getOptimizedUrl = (publicId, transformations = {}) => {
  try {
    const defaultTransformations = {
      quality: 'auto',
      fetch_format: 'auto',
      ...transformations,
    };

    return cloudinary.url(publicId, defaultTransformations);
  } catch (error) {
    logger.error('Failed to generate optimized URL:', error);
    throw error;
  }
};

/**
 * Generate responsive image URLs
 * @param {string} publicId - Public ID of the image
 * @returns {object} Object with URLs for different sizes
 */
const getResponsiveUrls = (publicId) => {
  try {
    return {
      thumbnail: getOptimizedUrl(publicId, {
        width: 150,
        height: 150,
        crop: 'fill',
        gravity: 'auto',
      }),
      small: getOptimizedUrl(publicId, {
        width: 400,
        height: 400,
        crop: 'fill',
        gravity: 'auto',
      }),
      medium: getOptimizedUrl(publicId, {
        width: 600,
        height: 600,
        crop: 'fill',
        gravity: 'auto',
      }),
      large: getOptimizedUrl(publicId, {
        width: 800,
        height: 800,
        crop: 'fill',
        gravity: 'auto',
      }),
      full: getOptimizedUrl(publicId, {
        width: 1200,
        height: 1200,
        crop: 'fill',
        gravity: 'auto',
      }),
    };
  } catch (error) {
    logger.error('Failed to generate responsive URLs:', error);
    throw error;
  }
};

/**
 * List resources in a folder
 * @param {string} folder - Folder path
 * @param {number} maxResults - Maximum number of results
 * @returns {Promise<object>} List of resources
 */
const listResourcesByFolder = async (folder, maxResults = 100) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: maxResults,
    });
    return {
      success: true,
      resources: result.resources,
      total: result.resources.length,
    };
  } catch (error) {
    logger.error('Failed to list resources:', error);
    throw error;
  }
};

/**
 * Get storage usage statistics
 * @returns {Promise<object>} Storage usage data
 */
const getStorageStats = async () => {
  try {
    const result = await cloudinary.api.usage();
    return {
      success: true,
      usage: {
        credits_used: result.credits_used,
        credits_limit: result.credits_limit,
        assets_uploaded: result.resources || 0,
        last_updated: new Date().toISOString(),
      },
    };
  } catch (error) {
    logger.error('Failed to get storage stats:', error);
    throw error;
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  deleteMultipleFiles,
  getFileMetadata,
  getOptimizedUrl,
  getResponsiveUrls,
  listResourcesByFolder,
  getStorageStats,
};
