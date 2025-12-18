const express = require('express')
const router = express.Router()
const {
  registerSeller,
  loginSeller,
  getSellerProfile,
  updateSellerProfile,
  getSellerProducts,
  addProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/sellerController')
const { protectSeller, verifiedSeller } = require('../middleware/authMiddleware')

// Public routes
router.post('/register', registerSeller)
router.post('/login', loginSeller)

// Protected seller routes
router.get('/profile', protectSeller, getSellerProfile)
router.put('/profile', protectSeller, updateSellerProfile)

// Product management routes
router.get('/products', protectSeller, getSellerProducts)

// These routes require verified seller
router.post('/products', protectSeller, verifiedSeller, addProduct)
router.put('/products/:id', protectSeller, verifiedSeller, updateProduct)
router.delete('/products/:id', protectSeller, verifiedSeller, deleteProduct)

module.exports = router
