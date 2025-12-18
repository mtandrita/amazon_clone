const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Seller = require('../models/Seller')
const Admin = require('../models/Admin')

const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')
      req.user = await User.findById(decoded.id).select('-password')
      next()
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' })
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' })
  }
}

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next()
  } else {
    res.status(401).json({ message: 'Not authorized as admin' })
  }
}

// Seller authentication middleware
const protectSeller = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')
      
      // Check if this is a seller token
      if (decoded.role !== 'seller') {
        return res.status(401).json({ message: 'Not authorized as seller' })
      }

      req.seller = await Seller.findById(decoded.id).select('-password')
      
      if (!req.seller) {
        return res.status(401).json({ message: 'Seller not found' })
      }

      next()
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' })
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' })
  }
}

// Middleware to check if seller is verified
const verifiedSeller = (req, res, next) => {
  if (req.seller && req.seller.verified) {
    next()
  } else {
    res.status(403).json({ 
      message: 'Your seller account is not verified. Please wait for admin approval.' 
    })
  }
}

// Admin authentication middleware
const protectAdmin = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')
      
      // Check if this is an admin token
      if (decoded.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized as admin' })
      }

      req.admin = await Admin.findById(decoded.id).select('-password')
      
      if (!req.admin) {
        return res.status(401).json({ message: 'Admin not found' })
      }

      next()
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' })
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' })
  }
}

module.exports = { protect, admin, protectSeller, verifiedSeller, protectAdmin }
