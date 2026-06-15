# Cloudinary Setup Guide

Complete guide for integrating Cloudinary with MysticJewel e-commerce platform.

## 📋 Table of Contents

1. [Cloudinary Account Setup](#cloudinary-account-setup)
2. [Frontend Configuration](#frontend-configuration)
3. [Backend Configuration](#backend-configuration)
4. [API Endpoints](#api-endpoints)
5. [Usage Examples](#usage-examples)
6. [File Upload Service](#file-upload-service)
7. [Troubleshooting](#troubleshooting)

---

## Cloudinary Account Setup

### Step 1: Create Cloudinary Account

1. Visit [Cloudinary](https://cloudinary.com)
2. Click "Sign Up Free"
3. Enter your email and password
4. Verify your email
5. Go to Dashboard

### Step 2: Get Your Credentials

In Cloudinary Dashboard:

1. **Cloud Name**: Found on Dashboard (e.g., `your-cloud-name`)
2. **API Key**: Go to Settings → API Keys
3. **API Secret**: Go to Settings → API Keys (Keep this secret!)
4. **Upload Preset**: Go to Upload → Add Upload Preset

### Step 3: Create Upload Preset

1. Go to Settings → Upload
2. Click "Add upload preset"
3. Set Mode: "Unsigned" (for frontend uploads)
4. Name: `mystic-jewel-uploads`
5. Folder: `mystic-jewel`
6. Save

---

## Frontend Configuration

### Step 1: Install Dependencies

```bash
cd mystic-jewel
npm install cloudinary axios
```

### Step 2: Create `.env.local` File

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=mystic-jewel-uploads
VITE_CLOUDINARY_API_KEY=your-api-key

# API Configuration
VITE_API_BASE_URL=http://localhost:3001
```

### Step 3: Verify Configuration

Create file: `src/utils/cloudinaryConfig.js`
- ✅ Already created with default exports
- ✅ Includes upload options for different file types
- ✅ File type restrictions configured

### Step 4: File Upload Service

File: `src/services/fileUploadService.js`
- ✅ Cloudinary upload function
- ✅ Multiple file uploads
- ✅ File validation
- ✅ Image URL optimization

### Step 5: Upload Hook

File: `src/hooks/useFileUpload.js`
- ✅ React hook for file uploads
- ✅ Progress tracking
- ✅ Error handling
- ✅ Toast notifications

### Step 6: File Uploader Component

File: `src/components/FileUploader.jsx`
- ✅ Drag and drop support
- ✅ Multiple file handling
- ✅ Progress bar
- ✅ File preview

---

## Backend Configuration

### Step 1: Install Dependencies

```bash
cd DynamicApi-Express-MYSQL
npm install cloudinary multer
```

### Step 2: Create `.env` File

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Other configurations...
```

### Step 3: Cloudinary Service

File: `src/services/cloudinaryService.js`
- ✅ Backend upload handler
- ✅ File deletion
- ✅ Metadata retrieval
- ✅ URL generation
- ✅ Responsive image URLs

### Step 4: Upload Controller

File: `src/controllers/uploadController.js`
- ✅ Single file upload endpoint
- ✅ Multiple file upload endpoint
- ✅ File deletion endpoints
- ✅ Metadata endpoint
- ✅ Storage stats endpoint

### Step 5: Upload Routes

File: `src/routes/uploadRoutes.js`
- ✅ All upload endpoints
- ✅ Swagger documentation
- ✅ Multer middleware
- ✅ File type validation

### Step 6: Register Routes in `index.js`

```javascript
const uploadRoutes = require('./routes/uploadRoutes');

// Add to Express app
app.use('/api/v1.0/upload', uploadRoutes);
```

---

## API Endpoints

### Upload Single File

```
POST /api/v1.0/upload
Content-Type: multipart/form-data

Parameters:
- file (File) - File to upload
- folder (string, optional) - Cloudinary folder (default: mystic-jewel/products)
- publicId (string, optional) - Custom public ID
- resourceType (string, optional) - Resource type (default: auto)

Response:
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "mystic-jewel/products/...",
    "width": 800,
    "height": 800,
    "size": 102400,
    "format": "jpg",
    "metadata": {
      "originalName": "product.jpg",
      "uploadedAt": "2024-06-15T10:30:00Z"
    }
  }
}
```

### Upload Multiple Files

```
POST /api/v1.0/upload/multiple
Content-Type: multipart/form-data

Parameters:
- files (File[]) - Array of files
- folder (string, optional) - Cloudinary folder
- resourceType (string, optional) - Resource type

Response:
{
  "success": true,
  "message": "3 files uploaded successfully",
  "data": [
    { url, publicId, width, height, size, format, metadata }
    // ... more files
  ]
}
```

### Delete File

```
POST /api/v1.0/upload/delete
Content-Type: application/json

Body:
{
  "publicId": "mystic-jewel/products/image123"
}

Response:
{
  "success": true,
  "message": "File deleted successfully",
  "data": { ... }
}
```

### Delete Multiple Files

```
POST /api/v1.0/upload/delete-multiple
Content-Type: application/json

Body:
{
  "publicIds": [
    "mystic-jewel/products/image1",
    "mystic-jewel/products/image2"
  ]
}

Response:
{
  "success": true,
  "message": "2 files deleted successfully",
  "data": { ... }
}
```

### Get File Metadata

```
GET /api/v1.0/upload/metadata/{publicId}

Response:
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "mystic-jewel/products/image123",
    "width": 800,
    "height": 800,
    "size": 102400,
    "format": "jpg",
    "created": "2024-06-15T10:30:00Z",
    "lastModified": "2024-06-15T10:30:00Z"
  }
}
```

### Get Responsive URLs

```
GET /api/v1.0/upload/responsive/{publicId}

Response:
{
  "success": true,
  "data": {
    "thumbnail": "https://res.cloudinary.com/.../w_150,h_150/image123",
    "small": "https://res.cloudinary.com/.../w_400,h_400/image123",
    "medium": "https://res.cloudinary.com/.../w_600,h_600/image123",
    "large": "https://res.cloudinary.com/.../w_800,h_800/image123",
    "full": "https://res.cloudinary.com/.../w_1200,h_1200/image123"
  }
}
```

### Get Storage Statistics (Admin Only)

```
GET /api/v1.0/upload/stats

Response:
{
  "success": true,
  "data": {
    "credits_used": 1234,
    "credits_limit": 25000,
    "assets_uploaded": 567,
    "last_updated": "2024-06-15T10:30:00Z"
  }
}
```

---

## Usage Examples

### Frontend - Upload Image in React Component

```jsx
import FileUploader from '../components/FileUploader';

function ProductImageUpload() {
  const handleSuccess = (files) => {
    console.log('Files uploaded:', files);
    // Save file URL to product
  };

  return (
    <FileUploader
      uploadType="images"
      maxFiles={5}
      onSuccess={handleSuccess}
    />
  );
}
```

### Frontend - Using Upload Hook Directly

```jsx
import useFileUpload from '../hooks/useFileUpload';

function ImageUpload() {
  const {
    uploading,
    progress,
    files,
    uploadFile,
    removeFile,
  } = useFileUpload({
    uploadType: 'productImages',
  });

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const result = await uploadFile(file, {
      caption: 'Product Image'
    });
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} disabled={uploading} />
      {uploading && <p>Progress: {progress}%</p>}
      {files.map((file, i) => (
        <div key={i}>
          <img src={file.url} alt="Uploaded" />
          <button onClick={() => removeFile(i)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
```

### Frontend - Get Optimized Image URLs

```jsx
import { getOptimizedImageUrl, getThumbnailUrl } from '../services/fileUploadService';

// Original image
const imageUrl = getOptimizedImageUrl(publicId);

// Thumbnail
const thumbUrl = getThumbnailUrl(publicId, 150);

// Custom transformation
const customUrl = getOptimizedImageUrl(publicId, {
  width: 500,
  height: 500,
  crop: 'fill',
  gravity: 'face',
});
```

### Frontend - Responsive Images

```jsx
import { getResponsiveImageUrls } from '../services/fileUploadService';

function ProductImage({ publicId }) {
  const urls = getResponsiveImageUrls(publicId);

  return (
    <img
      src={urls.desktop}
      srcSet={`
        ${urls.mobile} 400w,
        ${urls.tablet} 600w,
        ${urls.desktop} 800w,
        ${urls.full} 1200w
      `}
      sizes="(max-width: 600px) 400px, (max-width: 900px) 600px, 800px"
      alt="Product"
    />
  );
}
```

### Backend - Upload Handler

```javascript
const uploadController = require('../controllers/uploadController');
const uploadRoutes = require('../routes/uploadRoutes');

// In index.js
app.use('/api/v1.0/upload', uploadRoutes);
```

### Backend - Cloudinary Service

```javascript
const cloudinaryService = require('../services/cloudinaryService');

// Upload file
const result = await cloudinaryService.uploadFile(
  fileBuffer,
  'filename.jpg',
  'mystic-jewel/products'
);

// Delete file
await cloudinaryService.deleteFile('mystic-jewel/products/file123');

// Get responsive URLs
const urls = cloudinaryService.getResponsiveUrls('mystic-jewel/products/file123');
```

---

## File Upload Service

### Supported File Types

```javascript
// Images
- JPEG/JPG
- PNG
- WebP
- AVIF
Max Size: 5MB

// Documents
- PDF
- DOC/DOCX
Max Size: 10MB

// Videos
- MP4
- AVI
- MOV
- WMV
Max Size: 100MB
```

### Upload Options by Type

```javascript
// Product Images
folder: 'mystic-jewel/products/images'
transformations: 1000x1000, auto quality

// Category Images
folder: 'mystic-jewel/categories'
transformations: 500x500, auto quality

// Banners
folder: 'mystic-jewel/banners'
transformations: 1920x1080, auto quality

// Testimonials
folder: 'mystic-jewel/testimonials'
transformations: 300x300 thumb crop, face gravity

// Avatars
folder: 'mystic-jewel/avatars'
transformations: 200x200 thumb crop
```

---

## Troubleshooting

### Issue: "Cloudinary configuration missing"

**Solution:**
1. Check environment variables are set
2. Verify `.env` file in root directory
3. Restart dev server after adding .env

```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset
VITE_CLOUDINARY_API_KEY=your-api-key
```

### Issue: "Upload failed: Invalid file type"

**Solution:**
1. Check file MIME type
2. Ensure file extension matches MIME type
3. Check allowed types in FILE_TYPE_RESTRICTIONS

### Issue: "File size exceeds limit"

**Solution:**
1. Compress image before upload
2. Check file size: max 5MB for images, 100MB for videos
3. Use image compression tools

### Issue: "CORS error on upload"

**Solution:**
1. Check Cloudinary upload preset settings
2. Verify cloud name in environment variables
3. Ensure upload preset is set to "Unsigned"

### Issue: "Cannot delete file"

**Solution:**
1. File deletion must be done from backend
2. Use POST /api/v1.0/upload/delete endpoint
3. Verify you have permission to delete

### Issue: "Slow image loading"

**Solution:**
1. Use optimized URL transformations
2. Serve appropriate size for device
3. Use responsive image URLs
4. Enable WebP format: `fetch_format: 'auto'`

---

## Security Best Practices

1. ✅ **Keep API Secret Safe**: Never expose `CLOUDINARY_API_SECRET` in frontend
2. ✅ **Use Upload Presets**: Frontend uses preset, not API credentials
3. ✅ **Validate File Types**: Check MIME types on backend
4. ✅ **Limit File Sizes**: Set reasonable limits per file type
5. ✅ **Use HTTPS**: Always upload over HTTPS
6. ✅ **Delete Unused Files**: Regularly clean up old uploads
7. ✅ **Monitor Usage**: Check storage statistics monthly
8. ✅ **Backup Important Files**: Maintain separate backups

---

## Performance Optimization

1. **Image Optimization**
   - Use `quality: 'auto'` for automatic compression
   - Use `fetch_format: 'auto'` for WebP/AVIF format
   - Generate thumbnails and responsive sizes

2. **Caching**
   - Cloudinary URLs are cached by CDN
   - Use versioning for cache busting
   - Set appropriate cache headers

3. **Responsive Images**
   - Use srcset and sizes attributes
   - Serve different sizes for different devices
   - Use WebP format when supported

---

## Pricing

**Cloudinary Free Plan**:
- 25 GB storage
- 25 GB bandwidth/month
- Unlimited transformations
- Web optimization features

**See Cloudinary pricing for larger plans**

---

## Support

- Cloudinary Documentation: https://cloudinary.com/documentation
- Dashboard: https://cloudinary.com/console
- API Reference: https://cloudinary.com/documentation/cloudinary_api

---

**Status**: ✅ Setup Complete
**Version**: 1.0.0
**Last Updated**: June 2024
