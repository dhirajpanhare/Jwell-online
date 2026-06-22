/**
 * Upload Controller
 * Handles file upload and deletion operations
 */

const cloudinaryService = require('../services/cloudinaryService');
const logger = require('../utils/logger');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
}).single('file');

/**
 * Upload file to Cloudinary
 * POST /api/v1.0/upload
 */
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    const {
      folder = 'mystic-jewel/products',
      publicId,
      resourceType = 'auto',
      tags,
    } = req.body;

    // Upload to Cloudinary
    const result = await cloudinaryService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      folder,
      {
        publicId,
        resourceType,
        tags: tags ? tags.split(',') : undefined,
      }
    );

    // Log to database
    logger.info(`File uploaded: ${result.publicId} by user ${req.user?.UserId || 'anonymous'}`);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: result,
    });
  } catch (error) {
    logger.error('Upload failed:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message,
    });
  }
};

/**
 * Upload multiple files
 * POST /api/v1.0/upload/multiple
 */
const uploadMultipleFiles = async (req, res) => {
  try {
    // Handle multiple file uploads using multer array
    upload.array('files', 10)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: 'File upload failed',
          error: err.message,
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files provided',
        });
      }

      try {
        const {
          folder = 'mystic-jewel/products',
          resourceType = 'auto',
          tags,
        } = req.body;

        const uploadPromises = req.files.map(file =>
          cloudinaryService.uploadFile(
            file.buffer,
            file.originalname,
            folder,
            {
              resourceType,
              tags: tags ? tags.split(',') : undefined,
            }
          )
        );

        const results = await Promise.all(uploadPromises);

        logger.info(`${results.length} files uploaded by user ${req.user?.UserId || 'anonymous'}`);

        res.json({
          success: true,
          message: `${results.length} files uploaded successfully`,
          data: results,
        });
      } catch (uploadError) {
        logger.error('Multiple upload failed:', uploadError);
        res.status(500).json({
          success: false,
          message: 'File upload failed',
          error: uploadError.message,
        });
      }
    });
  } catch (error) {
    logger.error('Upload handler error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message,
    });
  }
};

/**
 * Delete file from Cloudinary
 * POST /api/v1.0/upload/delete
 */
const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required',
      });
    }

    // Delete from Cloudinary
    const result = await cloudinaryService.deleteFile(publicId);

    logger.info(`File deleted: ${publicId} by user ${req.user?.UserId || 'anonymous'}`);

    res.json({
      success: true,
      message: 'File deleted successfully',
      data: result,
    });
  } catch (error) {
    logger.error('Delete failed:', error);
    res.status(500).json({
      success: false,
      message: 'File deletion failed',
      error: error.message,
    });
  }
};

/**
 * Delete multiple files
 * POST /api/v1.0/upload/delete-multiple
 */
const deleteMultipleFiles = async (req, res) => {
  try {
    const { publicIds } = req.body;

    if (!Array.isArray(publicIds) || publicIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Public IDs array is required',
      });
    }

    // Delete from Cloudinary
    const result = await cloudinaryService.deleteMultipleFiles(publicIds);

    logger.info(`${publicIds.length} files deleted by user ${req.user?.UserId || 'anonymous'}`);

    res.json({
      success: true,
      message: `${publicIds.length} files deleted successfully`,
      data: result,
    });
  } catch (error) {
    logger.error('Multiple delete failed:', error);
    res.status(500).json({
      success: false,
      message: 'File deletion failed',
      error: error.message,
    });
  }
};

/**
 * Get file metadata
 * GET /api/v1.0/upload/metadata/:publicId
 */
const getMetadata = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required',
      });
    }

    const result = await cloudinaryService.getFileMetadata(publicId);

    res.json({
      success: true,
      data: result.metadata,
    });
  } catch (error) {
    logger.error('Metadata fetch failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file metadata',
      error: error.message,
    });
  }
};

/**
 * Get storage statistics
 * GET /api/v1.0/upload/stats
 */
const getStorageStats = async (req, res) => {
  try {
    // Admin only
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const result = await cloudinaryService.getStorageStats();

    res.json({
      success: true,
      data: result.usage,
    });
  } catch (error) {
    logger.error('Stats fetch failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get storage statistics',
      error: error.message,
    });
  }
};

/**
 * Get responsive URLs for image
 * GET /api/v1.0/upload/responsive/:publicId
 */
const getResponsiveUrls = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required',
      });
    }

    const urls = cloudinaryService.getResponsiveUrls(publicId);

    res.json({
      success: true,
      data: urls,
    });
  } catch (error) {
    logger.error('Responsive URLs fetch failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get responsive URLs',
      error: error.message,
    });
  }
};

module.exports = {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  deleteMultipleFiles,
  getMetadata,
  getStorageStats,
  getResponsiveUrls,
};
