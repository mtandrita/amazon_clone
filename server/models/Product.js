const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['electronics', 'fashion', 'home', 'books', 'sports', 'beauty', 'toys', 'automotive', 'grocery', 'health'],
      message: '{VALUE} is not a valid category'
    }
  },
  imageUrl: {
    type: String,
    required: [true, 'Product image is required']
  },
  productDescription: {
    type: String,
    required: [true, 'Product description is required'],
    minlength: [20, 'Description must be at least 20 characters']
  },
  companyDescription: {
    type: String,
    required: [true, 'Company description is required'],
    minlength: [10, 'Company description must be at least 10 characters']
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Seller ID is required']
  },
  // Additional useful fields
  brand: {
    type: String,
    default: ''
  },
  countInStock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Index for faster queries
productSchema.index({ sellerId: 1 })
productSchema.index({ category: 1 })
productSchema.index({ title: 'text', productDescription: 'text' })

module.exports = mongoose.model('Product', productSchema)
