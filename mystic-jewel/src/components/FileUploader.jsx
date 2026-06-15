/**
 * FileUploader Component
 * Reusable file upload component with drag-and-drop support
 */

import React, { useRef } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import useFileUpload from '../hooks/useFileUpload';

/**
 * FileUploader Component
 * @param {object} props - Component props
 * @param {string} props.uploadType - Type of upload (images, documents, videos)
 * @param {number} props.maxFiles - Maximum number of files to upload
 * @param {function} props.onSuccess - Callback when upload succeeds
 * @param {function} props.onError - Callback when upload fails
 * @param {string} props.className - Additional CSS classes
 */
const FileUploader = ({
  uploadType = 'images',
  maxFiles = 1,
  onSuccess,
  onError,
  className = '',
}) => {
  const fileInputRef = useRef(null);
  const dragRef = useRef(null);

  const {
    uploading,
    progress,
    files,
    error,
    handleFileInputChange,
    removeFile,
    clearFiles,
  } = useFileUpload({
    uploadType,
    maxFiles,
    onSuccess,
    onError,
  });

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragRef.current) {
      dragRef.current.classList.add('border-blue-500', 'bg-blue-50');
    }
  };

  // Handle drag leave
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragRef.current) {
      dragRef.current.classList.remove('border-blue-500', 'bg-blue-50');
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragRef.current) {
      dragRef.current.classList.remove('border-blue-500', 'bg-blue-50');
    }

    const droppedFiles = e.dataTransfer.files;
    if (fileInputRef.current) {
      fileInputRef.current.files = droppedFiles;
      const changeEvent = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(changeEvent);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        ref={dragRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 cursor-pointer transition-all hover:border-gray-400 hover:bg-gray-100"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          onChange={handleFileInputChange}
          disabled={uploading}
          className="hidden"
          accept={uploadType === 'images' ? 'image/*' : uploadType === 'videos' ? 'video/*' : '*'}
        />

        <div className="flex flex-col items-center justify-center">
          {uploading ? (
            <>
              <div className="w-12 h-12 mb-4 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-gray-700 font-medium mb-2">Uploading...</p>
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">{progress}%</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-700 font-medium mb-1">
                Drag and drop your files here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                {uploadType === 'images' && 'Supported formats: JPG, PNG, WebP (Max 5MB)'}
                {uploadType === 'videos' && 'Supported formats: MP4, AVI, MOV (Max 100MB)'}
                {uploadType === 'documents' && 'Supported formats: PDF, DOC, DOCX (Max 10MB)'}
              </p>
              {maxFiles > 1 && (
                <p className="text-sm text-gray-500 mt-1">
                  You can upload up to {maxFiles} files at once
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800">Upload Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Uploaded Files ({files.length})
          </h3>
          <div className="space-y-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.metadata?.originalName || 'File'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {file.url && (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate"
                        >
                          View File →
                        </a>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {files.length > 0 && (
            <button
              onClick={clearFiles}
              className="mt-4 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Clear All Files
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
