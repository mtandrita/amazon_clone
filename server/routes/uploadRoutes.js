const express = require('express')
const router = express.Router()
const { handleUpload, deleteImage, getPublicIdFromUrl } = require('../config/cloudinary')
const { protectSeller } = require('../middleware/authMiddleware')

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private (Seller)
router.post('/', protectSeller, handleUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' })
    }

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: req.file.path,
      publicId: req.file.filename
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ message: 'Failed to upload image' })
  }
})

// @desc    Upload base64 image to Cloudinary
// @route   POST /api/upload/base64
// @access  Private (Seller)
router.post('/base64', protectSeller, async (req, res) => {
  try {
    const { image } = req.body
    
    if (!image) {
      return res.status(400).json({ message: 'No image data provided' })
    }

    const { cloudinary } = require('../config/cloudinary')
    
    const result = await cloudinary.uploader.upload(image, {
      folder: 'amazonclone/products',
      transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }]
    })

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
      publicId: result.public_id
    })
  } catch (error) {
    console.error('Base64 upload error:', error)
    res.status(500).json({ message: 'Failed to upload image' })
  }
})

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload
// @access  Private (Seller)
router.delete('/', protectSeller, async (req, res) => {
  try {
    const { imageUrl } = req.body
    
    if (!imageUrl) {
      return res.status(400).json({ message: 'No image URL provided' })
    }

    const publicId = getPublicIdFromUrl(imageUrl)
    
    if (publicId) {
      await deleteImage(publicId)
    }

    res.json({ message: 'Image deleted successfully' })
  } catch (error) {
    console.error('Delete error:', error)
    res.status(500).json({ message: 'Failed to delete image' })
  }
})

module.exports = router
