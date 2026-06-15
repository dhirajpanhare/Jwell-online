# Cloudinary Integration - Installation Guide

Step-by-step installation guide for Cloudinary file upload service.

## 🚀 Quick Installation

### Frontend Setup (5 minutes)

```bash
# Navigate to frontend
cd mystic-jewel

# No new dependencies needed! 
# Cloudinary upload is done via API calls (no SDK required)
# We use native fetch API
```

### Backend Setup (5 minutes)

```bash
# Navigate to backend
cd DynamicApi-Express-MYSQL

# Install Cloudinary and Multer
npm install cloudinary multer

# If using npm v7+, you may need:
npm install --save cloudinary multer
```

---

## 📋 Files Created

### Frontend Files (4 files)

1. **`src/utils/cloudinaryConfig.js`**
   - Configuration for Cloudinary
   - Upload options for different file types
   - File type restrictions
   - URL builder utility

2. **`src/services/fileUploadService.js`**
   - Upload to Cloudinary function
   - Multiple file uploads
   - File validation
   - Image optimization utilities
   - URL generation helpers

3. **`src/hooks/useFileUpload.js`**
   - React hook for file uploads
   - Progress tracking
   - Error handling
   - Toast notifications

4. **`src/components/FileUploader.jsx`**
   - Reusable upload component
   - Drag and drop support
   - Progress bar
   - File preview

### Backend Files (3 files)

1. **`src/services/cloudinaryService.js`**
   - Backend Cloudinary operations
   - File upload/delete functions
   - URL generation
   - Storage statistics

2. **`src/controllers/uploadController.js`**
   - Upload endpoints handlers
   - File validation
   - Response formatting
   - Error handling

3. **`src/routes/uploadRoutes.js`**
   - All upload endpoints
   - Swagger documentation
   - Multer middleware
   - File type validation

---

## 🔧 Configuration Steps

### Step 1: Get Cloudinary Credentials

1. Sign up at [Cloudinary](https://cloudinary.com)
2. Go to Dashboard
3. Copy **Cloud Name** and **API Key**
4. Go to Settings → API Keys → Copy **API Secret**
5. Create upload preset (Settings → Upload):
   - Name: `mystic-jewel-uploads`
   - Mode: Unsigned
   - Folder: `mystic-jewel`

### Step 2: Frontend Configuration

Create/update `mystic-jewel/.env.local`:

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=mystic-jewel-uploads
VITE_CLOUDINARY_API_KEY=your-api-key

# API Base URL
VITE_API_BASE_URL=http://localhost:3001
```

### Step 3: Backend Configuration

Update `DynamicApi-Express-MYSQL/.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Other existing config...
PORT=3001
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=123456
DB_NAME=DynamicApiDb
```

### Step 4: Register Backend Routes

In `DynamicApi-Express-MYSQL/src/index.js`, add:

```javascript
// Add near the top with other imports
const uploadRoutes = require('./routes/uploadRoutes');

// Add after other routes (around line 100-120)
app.use('/api/v1.0/upload', uploadRoutes);

// Register before error handlers
// ...rest of route registrations...
```

---

## 📦 Package Versions

### Frontend (No additional packages!)

```json
{
  "dependencies": {
    "axios": "^1.16.1",          // Already installed
    "lucide-react": "^1.16.0",   // Already installed
    "react": "^19.2.6",          // Already installed
    "react-hot-toast": "^2.6.0"  // Already installed
  }
}
```

### Backend

```json
{
  "dependencies": {
    "cloudinary": "^1.40.0",     // NEW - Add this
    "multer": "^1.4.5-lts.1"     // NEW - Add this
    // ... other dependencies
  }
}
```

---

## ✅ Verification Checklist

### Frontend Setup

- [ ] Copy all 4 frontend files to correct locations
- [ ] Create `.env.local` file with Cloudinary credentials
- [ ] Verify environment variables are loaded (check console)
- [ ] No errors in browser console

### Backend Setup

- [ ] Install cloudinary and multer: `npm install cloudinary multer`
- [ ] Copy 3 backend files to correct locations
- [ ] Update `.env` with Cloudinary credentials
- [ ] Register upload routes in `src/index.js`
- [ ] Restart backend server

### Test Upload

**Frontend Test:**
```javascript
// In browser console
import { uploadToCloudinary } from './services/fileUploadService.js';

// Get a file from input
const file = document.getElementById('fileInput').files[0];
const result = await uploadToCloudinary(file, 'images');
console.log(result);
```

**Backend Test:**
```bash
curl -X POST http://localhost:3001/api/v1.0/upload \
  -F "file=@test-image.jpg" \
  -F "folder=mystic-jewel/test"
```

---

## 🎯 Usage Examples

### Upload Image in React

```jsx
import FileUploader from '../components/FileUploader';

function ProductEditor() {
  return (
    <FileUploader
      uploadType="productImages"
      maxFiles={5}
      onSuccess={(files) => {
        console.log('Uploaded:', files);
        // Save to product
      }}
    />
  );
}
```

### Upload Using Hook

```jsx
import useFileUpload from '../hooks/useFileUpload';

function ImageUpload() {
  const { uploadFile, files, uploading } = useFileUpload();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    await uploadFile(file);
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} disabled={uploading} />
      {files.map(f => <img key={f.url} src={f.url} />)}
    </div>
  );
}
```

### API Request (From Backend)

```javascript
const cloudinaryService = require('../services/cloudinaryService');

// Upload
const result = await cloudinaryService.uploadFile(
  fileBuffer,
  'product.jpg',
  'mystic-jewel/products'
);

// Get responsive URLs
const urls = cloudinaryService.getResponsiveUrls(result.publicId);

// Delete
await cloudinaryService.deleteFile(result.publicId);
```

---

## 🚀 Start Services

### Development

**Terminal 1 - Frontend:**
```bash
cd mystic-jewel
npm run dev
# Starts on http://localhost:5173
```

**Terminal 2 - Backend:**
```bash
cd DynamicApi-Express-MYSQL
npm run dev
# Starts on http://localhost:3001
```

### Test Upload Endpoint

Visit: `http://localhost:3001/api/v1.0/docs` → Find Upload endpoints

Or use curl:
```bash
curl -X POST http://localhost:3001/api/v1.0/upload \
  -F "file=@image.jpg" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📚 File Structure After Setup

```
mystic-jewel/
├── src/
│   ├── components/
│   │   ├── FileUploader.jsx          ← NEW
│   │   └── ...
│   ├── hooks/
│   │   ├── useFileUpload.js          ← NEW
│   │   └── ...
│   ├── services/
│   │   ├── fileUploadService.js      ← NEW
│   │   ├── productService.js
│   │   └── ...
│   ├── utils/
│   │   ├── cloudinaryConfig.js       ← NEW
│   │   └── ...
│   └── ...
├── .env.local                        ← CREATE THIS
└── package.json

DynamicApi-Express-MYSQL/
├── src/
│   ├── controllers/
│   │   ├── uploadController.js       ← NEW
│   │   └── ...
│   ├── routes/
│   │   ├── uploadRoutes.js           ← NEW
│   │   └── ...
│   ├── services/
│   │   ├── cloudinaryService.js      ← NEW
│   │   └── ...
│   ├── index.js                      ← UPDATE THIS
│   └── ...
├── .env                              ← UPDATE THIS
├── package.json                      ← Run: npm install
└── ...
```

---

## 🔍 Common Issues & Solutions

### Issue: "Cannot find module 'cloudinary'"

**Solution:**
```bash
cd DynamicApi-Express-MYSQL
npm install cloudinary multer
```

### Issue: Environment variables not loading

**Solution:**
1. Check .env file is in root directory
2. Verify variable names exactly match
3. Restart dev server after changing .env

### Issue: Upload fails with 403 error

**Solution:**
1. Check Cloudinary preset is "Unsigned"
2. Verify cloud name is correct
3. Check preset name matches env variable

### Issue: CORS error on upload

**Solution:**
1. Ensure backend is running on http://localhost:3001
2. Check CORS is enabled in backend
3. Verify API_BASE_URL in .env.local

---

## 📖 Next Steps

1. ✅ Install packages: `npm install cloudinary multer`
2. ✅ Set environment variables
3. ✅ Register upload routes
4. ✅ Test upload endpoint
5. ✅ Integrate FileUploader component
6. ✅ Update product service to use uploaded URLs
7. ✅ Add image upload to admin panel

---

## 🎓 Learning Resources

- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Upload Presets**: https://cloudinary.com/documentation/upload_presets
- **Transformations**: https://cloudinary.com/documentation/image_transformations
- **API Reference**: https://cloudinary.com/documentation/cloudinary_api

---

## 💡 Tips

1. **Performance**: Use responsive image URLs for different device sizes
2. **Cost**: Monitor storage usage in Cloudinary Dashboard
3. **Backup**: Maintain a backup of file URLs in database
4. **Optimization**: Enable auto quality and format compression
5. **Organization**: Use folder structure to organize uploads

---

**Installation Status**: ✅ Complete
**Time Required**: ~15 minutes
**Difficulty**: Easy
**Support**: See CLOUDINARY_SETUP.md for detailed usage

---

## ❓ Need Help?

1. Check CLOUDINARY_SETUP.md for detailed guide
2. Review example code in Usage Examples
3. Check Cloudinary Dashboard for account settings
4. Verify environment variables
5. Check browser console for errors
6. Check backend logs for API errors

---

**Happy uploading!** 🚀
