const Product = require('../models/Product')

// Sample products for demo
const sampleProducts = [
  {
    _id: '1',
    name: 'Apple iPhone 15 Pro Max - 256GB - Natural Titanium',
    price: 1199.99,
    image: 'https://via.placeholder.com/300x300?text=iPhone+15',
    brand: 'Apple',
    category: 'electronics',
    description: 'The latest iPhone with A17 Pro chip',
    rating: 4.5,
    numReviews: 2847,
    countInStock: 10
  },
  {
    _id: '2',
    name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    price: 349.99,
    image: 'https://via.placeholder.com/300x300?text=Sony+Headphones',
    brand: 'Sony',
    category: 'electronics',
    description: 'Industry-leading noise cancellation',
    rating: 4.8,
    numReviews: 5623,
    countInStock: 25
  },
  {
    _id: '3',
    name: 'Samsung 65" Class OLED 4K Smart TV',
    price: 1799.99,
    image: 'https://via.placeholder.com/300x300?text=Samsung+TV',
    brand: 'Samsung',
    category: 'electronics',
    description: 'Stunning OLED display',
    rating: 4.7,
    numReviews: 1234,
    countInStock: 5
  },
  {
    _id: '4',
    name: 'Nike Air Max 270 Running Shoes',
    price: 159.99,
    image: 'https://via.placeholder.com/300x300?text=Nike+Shoes',
    brand: 'Nike',
    category: 'fashion',
    description: 'Comfortable running shoes',
    rating: 4.3,
    numReviews: 892,
    countInStock: 50
  },
  {
    _id: '5',
    name: 'The Complete JavaScript Course 2024',
    price: 49.99,
    image: 'https://via.placeholder.com/300x300?text=JS+Book',
    brand: 'Tech Books',
    category: 'books',
    description: 'Learn JavaScript from scratch',
    rating: 4.9,
    numReviews: 3421,
    countInStock: 100
  },
  {
    _id: '6',
    name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
    price: 89.99,
    image: 'https://via.placeholder.com/300x300?text=Instant+Pot',
    brand: 'Instant Pot',
    category: 'home',
    description: 'Multi-functional cooker',
    rating: 4.6,
    numReviews: 7854,
    countInStock: 30
  }
]

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query
    let query = {}

    if (category) {
      query.category = category
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { productDescription: { $regex: search, $options: 'i' } }
      ]
    }

    const products = await Product.find(query)
      .populate('sellerId', 'businessName email')
      .sort({ createdAt: -1 })

    if (products.length === 0) {
      // Return sample products if database is empty
      let filtered = sampleProducts
      if (category) {
        filtered = filtered.filter(p => p.category === category)
      }
      if (search) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(search.toLowerCase())
        )
      }
      return res.json(filtered)
    }

    res.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    // Return sample products on error
    res.json(sampleProducts)
  }
}

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (product) {
      res.json(product)
    } else {
      // Check sample products
      const sampleProduct = sampleProducts.find(p => p._id === req.params.id)
      if (sampleProduct) {
        return res.json(sampleProduct)
      }
      res.status(404).json({ message: 'Product not found' })
    }
  } catch (error) {
    const sampleProduct = sampleProducts.find(p => p._id === req.params.id)
    if (sampleProduct) {
      return res.json(sampleProduct)
    }
    res.status(404).json({ message: 'Product not found' })
  }
}

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const product = new Product({
      name: 'Sample Product',
      price: 0,
      image: 'https://via.placeholder.com/300x300',
      brand: 'Sample Brand',
      category: 'electronics',
      countInStock: 0,
      numReviews: 0,
      description: 'Sample description'
    })

    const createdProduct = await product.save()
    res.status(201).json(createdProduct)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, image, brand, category, countInStock } = req.body

    const product = await Product.findById(req.params.id)

    if (product) {
      product.name = name || product.name
      product.price = price || product.price
      product.description = description || product.description
      product.image = image || product.image
      product.brand = brand || product.brand
      product.category = category || product.category
      product.countInStock = countInStock || product.countInStock

      const updatedProduct = await product.save()
      res.json(updatedProduct)
    } else {
      res.status(404).json({ message: 'Product not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (product) {
      await Product.deleteOne({ _id: req.params.id })
      res.json({ message: 'Product removed' })
    } else {
      res.status(404).json({ message: 'Product not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
}
