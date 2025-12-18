const jwt = require('jsonwebtoken')
const Seller = require('../models/Seller')

const generateToken = (id) => {
  return jwt.sign({ id, role: 'seller' }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d'
  })
}

// @desc    Register a new seller
// @route   POST /api/seller/register
// @access  Public
const registerSeller = async (req, res) => {
  try {
    const { businessName, email, password, phone, address, description } = req.body

    const sellerExists = await Seller.findOne({ email })

    if (sellerExists) {
      return res.status(400).json({ message: 'Seller account already exists with this email' })
    }

    const seller = await Seller.create({
      businessName,
      email,
      password,
      phone,
      address,
      description,
      verified: false
    })

    if (seller) {
      res.status(201).json({
        token: generateToken(seller._id),
        seller: {
          _id: seller._id,
          businessName: seller.businessName,
          email: seller.email,
          phone: seller.phone,
          address: seller.address,
          description: seller.description,
          verified: seller.verified
        }
      })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Auth seller & get token
// @route   POST /api/seller/login
// @access  Public
const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body

    const seller = await Seller.findOne({ email })

    if (seller && (await seller.matchPassword(password))) {
      res.json({
        token: generateToken(seller._id),
        seller: {
          _id: seller._id,
          businessName: seller.businessName,
          email: seller.email,
          phone: seller.phone,
          address: seller.address,
          description: seller.description,
          verified: seller.verified
        }
      })
    } else {
      res.status(401).json({ message: 'Invalid email or password' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get seller profile
// @route   GET /api/seller/profile
// @access  Private (Seller)
const getSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller._id).populate('products')

    if (seller) {
      res.json({
        _id: seller._id,
        businessName: seller.businessName,
        email: seller.email,
        phone: seller.phone,
        address: seller.address,
        description: seller.description,
        verified: seller.verified,
        products: seller.products,
        createdAt: seller.createdAt
      })
    } else {
      res.status(404).json({ message: 'Seller not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update seller profile
// @route   PUT /api/seller/profile
// @access  Private (Seller)
const updateSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller._id)

    if (seller) {
      seller.businessName = req.body.businessName || seller.businessName
      seller.phone = req.body.phone || seller.phone
      seller.address = req.body.address || seller.address
      seller.description = req.body.description || seller.description

      if (req.body.password) {
        seller.password = req.body.password
      }

      const updatedSeller = await seller.save()

      res.json({
        _id: updatedSeller._id,
        businessName: updatedSeller.businessName,
        email: updatedSeller.email,
        phone: updatedSeller.phone,
        address: updatedSeller.address,
        description: updatedSeller.description,
        verified: updatedSeller.verified
      })
    } else {
      res.status(404).json({ message: 'Seller not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get seller's products
// @route   GET /api/seller/products
// @access  Private (Seller)
const getSellerProducts = async (req, res) => {
  try {
    const Product = require('../models/Product')
    const products = await Product.find({ sellerId: req.seller._id }).sort({ createdAt: -1 })
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Add product (only verified sellers)
// @route   POST /api/seller/products
// @access  Private (Verified Seller)
const addProduct = async (req, res) => {
  try {
    if (!req.seller.verified) {
      return res.status(403).json({ 
        message: 'Your seller account is not verified yet. Please wait for admin approval to add products.' 
      })
    }

    const Product = require('../models/Product')
    const { title, price, imageUrl, brand, category, productDescription, companyDescription, countInStock } = req.body

    const product = new Product({
      title,
      price,
      imageUrl,
      brand: brand || '',
      category,
      productDescription,
      companyDescription,
      countInStock: countInStock || 0,
      sellerId: req.seller._id,
      rating: 0,
      numReviews: 0
    })

    const createdProduct = await product.save()

    // Add product to seller's products array
    await Seller.findByIdAndUpdate(req.seller._id, {
      $push: { products: createdProduct._id }
    })

    res.status(201).json(createdProduct)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update seller's product
// @route   PUT /api/seller/products/:id
// @access  Private (Verified Seller)
const updateProduct = async (req, res) => {
  try {
    if (!req.seller.verified) {
      return res.status(403).json({ 
        message: 'Your seller account is not verified yet.' 
      })
    }

    const Product = require('../models/Product')
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    // Check if product belongs to this seller
    if (product.sellerId && product.sellerId.toString() !== req.seller._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' })
    }

    const { title, price, imageUrl, brand, category, productDescription, companyDescription, countInStock } = req.body

    product.title = title || product.title
    product.price = price !== undefined ? price : product.price
    product.imageUrl = imageUrl || product.imageUrl
    product.brand = brand !== undefined ? brand : product.brand
    product.category = category || product.category
    product.productDescription = productDescription || product.productDescription
    product.companyDescription = companyDescription !== undefined ? companyDescription : product.companyDescription
    product.countInStock = countInStock !== undefined ? countInStock : product.countInStock

    const updatedProduct = await product.save()
    res.json(updatedProduct)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete seller's product
// @route   DELETE /api/seller/products/:id
// @access  Private (Verified Seller)
const deleteProduct = async (req, res) => {
  try {
    const Product = require('../models/Product')
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    // Check if product belongs to this seller
    if (product.sellerId && product.sellerId.toString() !== req.seller._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' })
    }

    await Product.deleteOne({ _id: req.params.id })

    // Remove product from seller's products array
    await Seller.findByIdAndUpdate(req.seller._id, {
      $pull: { products: req.params.id }
    })

    res.json({ message: 'Product removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  registerSeller,
  loginSeller,
  getSellerProfile,
  updateSellerProfile,
  getSellerProducts,
  addProduct,
  updateProduct,
  deleteProduct
}
