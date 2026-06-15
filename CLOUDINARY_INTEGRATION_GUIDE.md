# Cloudinary File Upload Integration Guide

Complete guide for integrating Cloudinary file upload service into the MysticJewel e-commerce platform.

---

## 📋 Table of Contents

1. [Quick Setup](#quick-setup)
2. [Configuration](#configuration)
3. [Frontend Integration](#frontend-integration)
4. [Backend Integration](#backend-integration)
5. [API Endpoints](#api-endpoints)
6. [Usage Examples](#usage-examples)
7. [Troubleshooting](#troubleshooting)
8. [Security Considerations](#security-considerations)

---

## 🚀 Quick Setup

### Step 1: Install Dependencies (Backend)

```bash
cd DynamicApi-Express-MYSQL
npm install cloudinary multer
```

### Step 2: Get Cloudinary Credentials

1. **Create Free Account**: Visit https://cloudinary.com/users/register/free
2. **Get Credentials**:
   - Cloud Name: Available in Dashboard
   - API Key: Available in Settings > Credentials
   - API Secret: Available in Settings > Credentials
3. **Create Upload Preset**:
   - Go to Settings > Upload > Add upload preset
   - Set name (e.g., `mystic-jewel-unsigned`)
   - Mode: **Unsigned** (for frontend)
   - Click Save

### Step 3: Configure Environment Variables

**Backend (.env)**:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Frontend (.env.local)**:
```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset
VITE_CLOUDINARY_API_KEY=your-api-key
```

### Step 4: Verify Route Registration

Check that `uploadRoutes` are registered in `src/index.js`:

```javascript
const uploadRoutes = require('./routes/uploadRoutes');
// ...
app.use('/api/v1.0/upload', uploadRoutes);
```

### Step 5: Install Packages & Restart

```bash
npm install  # Install cloudinary and multer
npm run dev  # Restart backend
```

---

## ⚙️ Configuration

### Frontend Configuration

**File**: `src/utils/cloudinaryConfig.js`

Defines upload options for different file types:

```javascript
export const UPLOAD_OPTIONS = {
  productImages: {
    folder: 'mystic-jewel/products/images',
    transformation: [1000x1000, auto quality, auto format]
  },
  categoryImages: {
    folder: 'mystic-jewel/categories',
    transformation: [500x500, auto quality]
  },
  bannerImages: {
    folder: 'mystic-jewel/banners',
    transformation: [1920x1080, auto quality]
  },
  testimonialImages: {
    folder: 'mystic-jewel/testimonials',
    transformation: [300x300 thumb, face gravity]
  }
}
```

### Backend Configuration

**File**: `src/services/cloudinaryService.js`

Configures Cloudinary SDK:

```javascript
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

---

## 💻 Frontend Integration

### Method 1: Using FileUploader Component (Recommended)

**Best for**: Product images, category images, banners

```jsx
import { useState } from 'react';
import FileUploader from '../components/FileUploader';

export const Products = () => {
  const [uploadedUrls, setUploadedUrls] = useState([]);

  const handleUploadSuccess = (uploadedFiles) => {
    // uploadedFiles contains: [{ url, publicId, size, dimensions }, ...]
    const urls = uploadedFiles.map(file => file.url);
    setUploadedUrls(prev => [...prev, ...urls]);
  };

  return (
    <div>
      {/* Other form fields */}

      {/* File Upload Component */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-700">
          Product Images
        </label>
        <FileUploader
          uploadType="productImages"
          maxFiles={5}
          onSuccess={handleUploadSuccess}
          onError={(error) => console.error(error)}
        />

        {/* Display uploaded images */}
        {uploadedUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {uploadedUrls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Product ${idx + 1}`}
                className="w-full h-32 object-cover rounded"
              />
            ))}
          </div>
        )}
      </div>

      {/* Submit button */}
      <button
        onClick={() => {
          // Save product with images
          submitProduct({
            ...formData,
            images: uploadedUrls,
          });
        }}
      >
        Save Product
      </button>
    </div>
  );
};
```

### Method 2: Using useFileUpload Hook

**Best for**: Custom UI, more control

```jsx
import { useFileUpload } from '../hooks/useFileUpload';

export const ProductForm = () => {
  const {
    uploading,
    progress,
    files,
    error,
    uploadFile,
    uploadFiles,
    removeFile,
    clearFiles,
  } = useFileUpload({
    uploadType: 'productImages',
    maxFiles: 5,
  });

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    const results = await uploadFiles(selectedFiles);
    // results = [{ url, publicId, dimensions, size }, ...]
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={handleFileSelect}
        disabled={uploading}
      />

      {uploading && <div>Progress: {progress}%</div>}

      {files.map(file => (
        <div key={file.id}>
          <img src={file.url} alt="uploaded" />
          <button onClick={() => removeFile(file.id)}>Remove</button>
        </div>
      ))}

      <button onClick={clearFiles}>Clear All</button>
    </div>
  );
};
```

### Method 3: Using File Upload Service

**Best for**: Direct API control, custom logic

```jsx
import {
  uploadToCloudinary,
  uploadMultipleFiles,
  getResponsiveImageUrls,
  getThumbnailUrl,
} from '../services/fileUploadService';

export const MyComponent = () => {
  const handleUpload = async (file) => {
    try {
      // Single upload
      const result = await uploadToCloudinary(file, 'productImages', {
        caption: 'Product Image',
      });

      console.log('URL:', result.url);
      console.log('Public ID:', result.publicId);
      console.log('Dimensions:', result.dimensions);

      // Get responsive URLs (5 sizes)
      const responsiveUrls = await getResponsiveImageUrls(result.publicId);
      // Returns: { thumbnail, small, medium, large, full }

      // Get thumbnail
      const thumbUrl = getThumbnailUrl(result.publicId);

      // Use URLs in your component
      return result.url;
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <button onClick={() => handleUpload(file)}>
      Upload Image
    </button>
  );
};
```

---

## 🔧 Backend Integration

### Step 1: Verify Routes are Registered

**File**: `src/index.js`

```javascript
const uploadRoutes = require('./routes/uploadRoutes');
// ...
app.use('/api/v1.0/upload', uploadRoutes);
```

### Step 2: Use Cloudinary Service in Controllers

```javascript
// src/controllers/productController.js
const cloudinaryService = require('../services/cloudinaryService');

const createProduct = async (req, res) => {
  try {
    // Upload image if provided
    let imageUrl = null;
    if (req.file) {
      const uploadResult = await cloudinaryService.uploadFile(
        req.file.buffer,
        req.file.originalname,
        'mystic-jewel/products',
        { tags: ['product'] }
      );
      imageUrl = uploadResult.url;
    }

    // Save product with image URL to database
    // ...
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Step 3: Use in Stored Procedures

Backend automatically stores uploaded image URLs in database:

```sql
-- SP_ProductInsert stores the image URL
INSERT INTO Products (ProductName, Images, ...)
VALUES (?, 'https://cloudinary.com/...', ...);
```

---

## 🔌 API Endpoints

### 1. Upload Single File

**POST** `/api/v1.0/upload`

Request:
```bash
curl -X POST http://localhost:3000/api/v1.0/upload \
  -F "file=@product.jpg" \
  -F "folder=mystic-jewel/products"
```

Response:
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/.../product_abc123.jpg",
  "publicId": "mystic-jewel/products/product_abc123",
  "width": 1000,
  "height": 1000,
  "size": 245000,
  "format": "jpg"
}
```

### 2. Upload Multiple Files

**POST** `/api/v1.0/upload/multiple`

Request:
```bash
curl -X POST http://localhost:3000/api/v1.0/upload/multiple \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  -F "folder=mystic-jewel/products"
```

Response:
```json
{
  "success": true,
  "count": 2,
  "files": [
    { "url": "...", "publicId": "...", ... },
    { "url": "...", "publicId": "...", ... }
  ]
}
```

### 3. Delete File

**POST** `/api/v1.0/upload/delete`

Request:
```bash
curl -X POST http://localhost:3000/api/v1.0/upload/delete \
  -H "Content-Type: application/json" \
  -d '{"publicId": "mystic-jewel/products/product_abc123"}'
```

Response:
```json
{
  "success": true,
  "result": "ok"
}
```

### 4. Delete Multiple Files

**POST** `/api/v1.0/upload/delete-multiple`

Request:
```bash
curl -X POST http://localhost:3000/api/v1.0/upload/delete-multiple \
  -H "Content-Type: application/json" \
  -d '{"publicIds": ["id1", "id2", "id3"]}'
```

### 5. Get File Metadata

**GET** `/api/v1.0/upload/metadata/{publicId}`

Response:
```json
{
  "url": "https://...",
  "publicId": "mystic-jewel/products/...",
  "width": 1000,
  "height": 1000,
  "size": 245000,
  "format": "jpg",
  "createdAt": "2024-06-15T10:30:00Z"
}
```

### 6. Get Responsive URLs

**GET** `/api/v1.0/upload/responsive/{publicId}`

Response:
```json
{
  "thumbnail": "https://.../c_scale,w_150/...",
  "small": "https://.../c_scale,w_400/...",
  "medium": "https://.../c_scale,w_600/...",
  "large": "https://.../c_scale,w_800/...",
  "full": "https://.../image.jpg"
}
```

### 7. Get Storage Statistics

**GET** `/api/v1.0/upload/stats` (Admin only)

Response:
```json
{
  "creditsUsed": 52000000,
  "creditsLimit": 100000000,
  "creditsPercentage": 52,
  "assetsCount": 245
}
```

---

## 📝 Usage Examples

### Example 1: Product Admin Panel

```jsx
// admin/pages/Products.jsx
import FileUploader from '../../components/FileUploader';
import { createProduct } from '../services/productService';

export const Products = () => {
  const [imageUrls, setImageUrls] = useState([]);

  const handleUploadSuccess = (files) => {
    const urls = files.map(f => f.url);
    setImageUrls(urls);
  };

  const handleSubmit = async (formData) => {
    await createProduct({
      ...formData,
      images: imageUrls,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label>Product Images</label>
        <FileUploader
          uploadType="productImages"
          maxFiles={5}
          onSuccess={handleUploadSuccess}
        />
      </div>

      <button onClick={() => handleSubmit(formData)}>
        Create Product
      </button>
    </div>
  );
};
```

### Example 2: Responsive Images

```jsx
import { getResponsiveImageUrls } from '../services/fileUploadService';

const ProductImage = ({ publicId }) => {
  const [urls, setUrls] = useState(null);

  useEffect(() => {
    getResponsiveImageUrls(publicId).then(setUrls);
  }, [publicId]);

  if (!urls) return <div>Loading...</div>;

  return (
    <img
      srcSet={`
        ${urls.thumbnail} 150w,
        ${urls.small} 400w,
        ${urls.medium} 600w,
        ${urls.large} 800w
      `}
      src={urls.full}
      sizes="(max-width: 600px) 100vw, 600px"
      alt="Product"
    />
  );
};
```

### Example 3: Upload with Metadata

```jsx
const handleUpload = async (file) => {
  const result = await uploadToCloudinary(
    file,
    'productImages',
    {
      caption: 'Premium Gold Bracelet',
      tags: ['bracelet', 'gold', 'featured'],
      metadata: {
        productId: '12345',
        category: 'Bracelets',
      },
    }
  );

  return result.url;
};
```

---

## 🐛 Troubleshooting

### Issue 1: "Missing Cloudinary Credentials"

**Error**: Warning about missing `VITE_CLOUDINARY_CLOUD_NAME`

**Solution**:
1. Check `.env.local` file exists
2. Verify all variables are set:
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_UPLOAD_PRESET`
3. Restart development server

### Issue 2: "Invalid Upload Preset"

**Error**: 400 error when uploading

**Solution**:
1. Go to Cloudinary Dashboard
2. Settings > Upload > Check preset exists
3. Ensure preset is **Unsigned**
4. Copy exact preset name to `.env.local`
5. Restart frontend dev server

### Issue 3: "Network Error" on Upload

**Error**: Upload fails with network error

**Solution**:
1. Check backend is running: `npm run dev`
2. Verify CORS configuration in `.env`
3. Check file size doesn't exceed limits (100MB)
4. Check network tab in browser DevTools

### Issue 4: "Unauthorized: Missing Credentials"

**Error**: Backend upload endpoints return 401

**Solution**:
1. Check `.env` has Cloudinary credentials
2. Verify `CLOUDINARY_API_SECRET` is set
3. Restart backend server: `npm run dev`

### Issue 5: "File Type Not Allowed"

**Error**: Upload rejected for valid file type

**Solution**:
1. Check MIME type is in allowed list (uploadRoutes.js)
2. Verify file extension matches content
3. Check file isn't corrupted

---

## 🔒 Security Considerations

### Frontend Security

✅ **Use Unsigned Upload Presets**
- Frontend uploads don't need API secret
- Credentials are safe in browser

✅ **Validate File Types**
- MIME type checking in browser
- Server-side validation in backend

✅ **File Size Limits**
- Max 100MB per file
- Enforced client and server side

### Backend Security

✅ **Keep API Secret Safe**
- Never expose `CLOUDINARY_API_SECRET` to frontend
- Store only in `.env` file
- Add `.env` to `.gitignore`

✅ **Authenticate Delete Endpoints**
- Only authenticated users can delete
- Check user permissions before deletion
- Audit all deletions

✅ **Validate User Input**
- Sanitize folder names
- Validate public IDs
- Check file metadata

### Best Practices

1. **Use Upload Presets**
   - Predefined security rules
   - Limit file types
   - Restrict folder paths

2. **Monitor Storage**
   - Check monthly usage
   - Delete unused files
   - Set up alerts

3. **Enable Logging**
   - Log all uploads
   - Log all deletions
   - Monitor for abuse

4. **Regular Backups**
   - Export important files
   - Keep local copies
   - Test restore process

---

## 📚 Additional Resources

### Cloudinary Documentation
- [Cloudinary Main Docs](https://cloudinary.com/documentation)
- [Upload Presets](https://cloudinary.com/documentation/upload_presets)
- [Image Transformations](https://cloudinary.com/documentation/image_transformations)
- [API Reference](https://cloudinary.com/documentation/cloudinary_api)

### Project Documentation
- [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) - Complete setup guide
- [CLOUDINARY_INSTALLATION.md](./CLOUDINARY_INSTALLATION.md) - Step-by-step installation

### React/JavaScript
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [React Hooks](https://react.dev/reference/react)

---

## ✅ Integration Checklist

- [ ] Create Cloudinary free account
- [ ] Get Cloud Name, API Key, API Secret
- [ ] Create unsigned upload preset
- [ ] Update `.env.example` with Cloudinary config
- [ ] Update `.env.local.example` with frontend config
- [ ] Run `npm install cloudinary multer` in backend
- [ ] Verify uploadRoutes registered in `src/index.js`
- [ ] Test single file upload with curl
- [ ] Test multiple file upload with curl
- [ ] Test delete endpoint with curl
- [ ] Integrate FileUploader into Products page
- [ ] Integrate FileUploader into Category page
- [ ] Integrate FileUploader into Banner page
- [ ] Test file upload from admin UI
- [ ] Verify images display correctly
- [ ] Test responsive image URLs
- [ ] Monitor storage usage
- [ ] Set up backup strategy

---

## 🎯 Next Steps

1. **Complete Setup**: Follow steps in Quick Setup section
2. **Test Endpoints**: Use curl examples to test each endpoint
3. **Integrate Frontend**: Add FileUploader to admin pages
4. **Test UI**: Upload files from admin dashboard
5. **Monitor**: Check Cloudinary dashboard for uploads
6. **Optimize**: Configure responsive image sizes
7. **Deploy**: Set production environment variables
8. **Backup**: Set up automated backup strategy

---

**Version**: 1.0.0  
**Last Updated**: June 2024  
**Status**: ✅ Production Ready
