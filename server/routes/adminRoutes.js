const express = require('express')
const router = express.Router()
const {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  getAllSellers,
  getPendingSellers,
  approveSeller,
  rejectSeller,
  deleteSeller,
  getDashboardStats
} = require('../controllers/adminController')
const { protectAdmin } = require('../middleware/authMiddleware')

// Public routes
router.post('/register', registerAdmin)
router.post('/login', loginAdmin)

// Protected routes (require admin authentication)
router.get('/profile', protectAdmin, getAdminProfile)
router.get('/stats', protectAdmin, getDashboardStats)
router.get('/sellers', protectAdmin, getAllSellers)
router.get('/sellers/pending', protectAdmin, getPendingSellers)
router.put('/sellers/:id/approve', protectAdmin, approveSeller)
router.put('/sellers/:id/reject', protectAdmin, rejectSeller)
router.delete('/sellers/:id', protectAdmin, deleteSeller)

module.exports = router
