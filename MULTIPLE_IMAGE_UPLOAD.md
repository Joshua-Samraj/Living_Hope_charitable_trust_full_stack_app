# Multiple Image Upload Feature

## Overview
The gallery system now supports uploading multiple images at once with automatic image compression. All uploaded images will share the same title, category, and description but will be stored as separate entries in the database.

## Features

### Backend Improvements
- **Multiple File Upload**: Support for uploading up to 10 images simultaneously
- **Image Compression**: Automatic server-side compression using Sharp library
- **Size Optimization**: Images are resized to max 1024x1024 pixels and compressed to JPEG format
- **Base64 Storage**: Compressed images are stored as base64 strings in MongoDB

### Frontend Improvements
- **Multiple File Selection**: File input now supports selecting multiple images
- **Client-side Compression**: Additional compression using browser-image-compression library
- **Upload Progress**: Real-time progress indicators during compression and upload
- **Image Previews**: Grid layout showing all selected images before upload
- **Batch Processing**: All images processed and uploaded in a single request

## Technical Details

### Backend Changes
1. **Sharp Integration**: Added Sharp library for server-side image compression
2. **Multer Configuration**: Updated to handle multiple files (`upload.array('files', 10)`)
3. **Compression Function**: New `compressImage()` function that:
   - Resizes images to fit within 1024x1024 pixels
   - Converts to JPEG format with 80% quality
   - Maintains aspect ratio

### Frontend Changes
1. **File Handling**: Updated to handle FileList and convert to array
2. **Compression**: Client-side compression before upload to reduce bandwidth
3. **UI Improvements**: 
   - Multiple file selection support
   - Grid-based image previews
   - Progress indicators
   - File count display

## Usage

### For Admins
1. Navigate to Admin Dashboard → Gallery tab
2. Click "Upload Multiple Images"
3. Fill in the common details (title, category, description)
4. Select multiple images using the file picker
5. Preview selected images in the grid
6. Click upload to process and store all images

### API Endpoints
- `POST /gallery` - Upload multiple images (new behavior)
- `POST /gallery/single` - Upload single image (backward compatibility)

## File Size Limits
- **Client-side**: Images compressed to max 1MB each
- **Server-side**: 10MB total upload limit
- **Final storage**: Optimized JPEG format with base64 encoding

## Database Schema
Each image is stored as a separate document with:
- Same title, category, and description
- Unique `_id` for each image
- Compressed image data as base64 string
- JPEG content type
- Base64 storage type marker

## Benefits
1. **Efficiency**: Upload multiple related images in one operation
2. **Storage Optimization**: Automatic compression reduces storage requirements
3. **User Experience**: Batch operations save time for content managers
4. **Bandwidth Optimization**: Client and server-side compression reduces upload time
5. **Consistency**: All related images share the same metadata