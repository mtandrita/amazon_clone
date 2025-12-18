const jwt = require('jsonwebtoken')
const Admin = require('../models/Admin')
const Seller = require('../models/Seller')

const generateToken = (id) => {
  return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d'
  })
}

// @desc    Register admin (should be restricted in production)
// @route   POST /api/admin/register
// @access  Public (should be protected in production)
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body

    const adminExists = await Admin.findOne({ email })

    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' })
    }

    const admin = await Admin.create({
      name,
      email,
      password
    })

    if (admin) {
      res.status(201).json({
        token: generateToken(admin._id),
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body

    const admin = await Admin.findOne({ email })

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        token: generateToken(admin._id),
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      })
    } else {
      res.status(401).json({ message: 'Invalid email or password' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private (Admin)
const getAdminProfile = async (req, res) => {
  try {
    res.json({
      _id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get all sellers
// @route   GET /api/admin/sellers
// @access  Private (Admin)
const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find({})
      .select('-password')
      .sort({ createdAt: -1 })
    
    res.json(sellers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get pending sellers (not verified)
// @route   GET /api/admin/sellers/pending
// @access  Private (Admin)
const getPendingSellers = async (req, res) => {
  try {
    const sellers = await Seller.find({ verified: false })
      .select('-password')
      .sort({ createdAt: -1 })
    
    res.json(sellers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Approve seller
// @route   PUT /api/admin/sellers/:id/approve
// @access  Private (Admin)
const approveSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id)

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' })
    }

    seller.verified = true
    await seller.save()

    res.json({
      message: 'Seller approved successfully',
      seller: {
        _id: seller._id,
        businessName: seller.businessName,
        email: seller.email,
        verified: seller.verified
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Reject seller (set verified to false)
// @route   PUT /api/admin/sellers/:id/reject
// @access  Private (Admin)
const rejectSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id)

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' })
    }

    seller.verified = false
    await seller.save()

    res.json({
      message: 'Seller rejected',
      seller: {
        _id: seller._id,
        businessName: seller.businessName,
        email: seller.email,
        verified: seller.verified
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete seller
// @route   DELETE /api/admin/sellers/:id
// @access  Private (Admin)
const deleteSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id)

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' })
    }

    await Seller.deleteOne({ _id: req.params.id })

    res.json({ message: 'Seller deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    const Product = require('../models/Product')
    const User = require('../models/User')
    const Order = require('../models/Order')

    const totalSellers = await Seller.countDocuments()
    const verifiedSellers = await Seller.countDocuments({ verified: true })
    const pendingSellers = await Seller.countDocuments({ verified: false })
    const totalProducts = await Product.countDocuments()
    const totalUsers = await User.countDocuments()
    const totalOrders = await Order.countDocuments()

    res.json({
      totalSellers,
      verifiedSellers,
      pendingSellers,
      totalProducts,
      totalUsers,
      totalOrders
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  getAllSellers,
  getPendingSellers,
  approveSeller,
  rejectSeller,
  deleteSeller,
  getDashboardStats
}
