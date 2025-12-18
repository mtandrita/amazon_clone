const express = require('express')
const router = express.Router()
const {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders
} = require('../controllers/orderController')
const { protect, admin } = require('../middleware/authMiddleware')

router.route('/')
  .post(protect, createOrder)
  .get(protect, admin, getOrders)

router.get('/myorders', protect, getMyOrders)
router.get('/:id', protect, getOrderById)
router.put('/:id/pay', protect, updateOrderToPaid)

module.exports = router
