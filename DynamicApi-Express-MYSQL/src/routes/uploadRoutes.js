/**
 * Upload Routes
 * Handles file upload/download/delete operations
 */

const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const { verifyAuth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// File size limits per use-case (bytes)
const FILE_LIMITS = {
    category: 3 * 1024 * 1024,   // 3 MB
    product: 5 * 1024 * 1024,    // 5 MB
    banner: 10 * 1024 * 1024,    // 10 MB
    profile: 2 * 1024 * 1024,    // 2 MB
    default: 10 * 1024 * 1024,   // 10 MB fallback
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const ALLOWED_ALL_TYPES = [
    ...ALLOWED_IMAGE_TYPES,
    'video/mp4', 'video/avi', 'video/quicktime',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const makeUpload = (type = 'default', imageOnly = false) => multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: FILE_LIMITS[type] || FILE_LIMITS.default },
    fileFilter: (req, file, cb) => {
        const allowed = imageOnly ? ALLOWED_IMAGE_TYPES : ALLOWED_ALL_TYPES;
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Allowed: ${allowed.join(', ')}`), false);
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
router.post('/', verifyAuth, makeUpload('product', true).single('file'), uploadController.uploadFile);
router.post('/multiple', verifyAuth, makeUpload('product', true).array('files', 10), uploadController.uploadMultipleFiles);
router.post('/category', verifyAuth, adminOnly, makeUpload('category', true).single('file'), uploadController.uploadFile);
router.post('/banner', verifyAuth, adminOnly, makeUpload('banner', true).single('file'), uploadController.uploadFile);
router.post('/profile', verifyAuth, makeUpload('profile', true).single('file'), uploadController.uploadFile);
router.post('/delete', verifyAuth, uploadController.deleteFile);
router.post('/delete-multiple', verifyAuth, uploadController.deleteMultipleFiles);
router.get('/metadata/:publicId', verifyAuth, uploadController.getMetadata);
router.get('/responsive/:publicId', verifyAuth, uploadController.getResponsiveUrls);
router.get('/stats', verifyAuth, adminOnly, uploadController.getStorageStats);

module.exports = router;
