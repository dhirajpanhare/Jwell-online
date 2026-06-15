/**
 * Upload Routes
 * Handles file upload/download/delete operations
 */

const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    // Allowed MIME types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'video/mp4',
      'video/avi',
      'video/quicktime',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
});

/**
 * @swagger
 * /api/v1.0/upload:
 *   post:
 *     summary: Upload single file to Cloudinary
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 default: mystic-jewel/products
 *               publicId:
 *                 type: string
 *               resourceType:
 *                 type: string
 *                 default: auto
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: No file provided or invalid file
 *       500:
 *         description: Upload failed
 */
router.post('/', upload.single('file'), uploadController.uploadFile);

/**
 * @swagger
 * /api/v1.0/upload/multiple:
 *   post:
 *     summary: Upload multiple files to Cloudinary
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               folder:
 *                 type: string
 *                 default: mystic-jewel/products
 *               resourceType:
 *                 type: string
 *                 default: auto
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *       400:
 *         description: No files provided or invalid files
 *       500:
 *         description: Upload failed
 */
router.post('/multiple', upload.array('files', 10), uploadController.uploadMultipleFiles);

/**
 * @swagger
 * /api/v1.0/upload/delete:
 *   post:
 *     summary: Delete file from Cloudinary
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               publicId:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       400:
 *         description: Public ID is required
 *       500:
 *         description: Deletion failed
 */
router.post('/delete', uploadController.deleteFile);

/**
 * @swagger
 * /api/v1.0/upload/delete-multiple:
 *   post:
 *     summary: Delete multiple files from Cloudinary
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               publicIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 required: true
 *     responses:
 *       200:
 *         description: Files deleted successfully
 *       400:
 *         description: Public IDs array is required
 *       500:
 *         description: Deletion failed
 */
router.post('/delete-multiple', uploadController.deleteMultipleFiles);

/**
 * @swagger
 * /api/v1.0/upload/metadata/{publicId}:
 *   get:
 *     summary: Get file metadata from Cloudinary
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File metadata retrieved
 *       400:
 *         description: Public ID is required
 *       500:
 *         description: Failed to get metadata
 */
router.get('/metadata/:publicId', uploadController.getMetadata);

/**
 * @swagger
 * /api/v1.0/upload/responsive/{publicId}:
 *   get:
 *     summary: Get responsive image URLs from Cloudinary
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Responsive URLs retrieved
 *       400:
 *         description: Public ID is required
 *       500:
 *         description: Failed to get URLs
 */
router.get('/responsive/:publicId', uploadController.getResponsiveUrls);

/**
 * @swagger
 * /api/v1.0/upload/stats:
 *   get:
 *     summary: Get Cloudinary storage statistics (Admin only)
 *     tags: [Upload]
 *     responses:
 *       200:
 *         description: Storage statistics retrieved
 *       403:
 *         description: Access denied
 *       500:
 *         description: Failed to get statistics
 */
router.get('/stats', uploadController.getStorageStats);

module.exports = router;
