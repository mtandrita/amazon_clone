import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaBox, 
  FaSearch,
  FaFilter,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaSort
} from 'react-icons/fa'
import { useSeller } from '../context/SellerContext'
import formatINR from '../utils/formatCurrency'
import axios from 'axios'

const SellerProducts = () => {
  const { seller, getAuthHeader } = useSeller()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [uploading, setUploading] = useState(false)

  const [productForm, setProductForm] = useState({
    title: '',
    price: '',
    imageUrl: '',
    brand: '',
    category: 'electronics',
    productDescription: '',
    companyDescription: '',
    countInStock: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [imagePreview, setImagePreview] = useState('')

  const categories = [
    'electronics', 'fashion', 'home', 'books', 'sports',
    'beauty', 'toys', 'automotive', 'grocery', 'health'
  ]

  useEffect(() => {
    if (!seller) {
      navigate('/seller/login')
      return
    }
    fetchProducts()
  }, [seller, navigate])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, searchTerm, categoryFilter, stockFilter, sortBy])

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/seller/products', {
        headers: getAuthHeader()
      })
      setProducts(response.data)
    } catch (error) {
      setError('Failed to fetch products')
      console.error('Failed to fetch products:', error)
    }
    setLoading(false)
  }

  const filterAndSortProducts = () => {
    let filtered = [...products]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(p => p.category === categoryFilter)
    }

    // Stock filter
    if (stockFilter === 'instock') {
      filtered = filtered.filter(p => p.countInStock > 0)
    } else if (stockFilter === 'outofstock') {
      filtered = filtered.filter(p => p.countInStock === 0)
    } else if (stockFilter === 'lowstock') {
      filtered = filtered.filter(p => p.countInStock > 0 && p.countInStock <= 10)
    }

    // Sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'name':
        filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
        break
      default:
        break
    }

    setFilteredProducts(filtered)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProductForm(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (name === 'imageUrl' && value) {
      setImagePreview(value)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormErrors(prev => ({ ...prev, imageUrl: 'Please upload a valid image file' }))
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, imageUrl: 'Image size should be less than 5MB' }))
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        setProductForm(prev => ({ ...prev, imageUrl: reader.result }))
        setFormErrors(prev => ({ ...prev, imageUrl: '' }))
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!productForm.title?.trim() || productForm.title.trim().length < 3) {
      errors.title = 'Product title must be at least 3 characters'
    }
    if (!productForm.price || parseFloat(productForm.price) <= 0) {
      errors.price = 'Price must be greater than 0'
    }
    if (!productForm.category) {
      errors.category = 'Please select a category'
    }
    if (!productForm.productDescription?.trim() || productForm.productDescription.trim().length < 20) {
      errors.productDescription = 'Description must be at least 20 characters'
    }
    if (!productForm.companyDescription?.trim() || productForm.companyDescription.trim().length < 10) {
      errors.companyDescription = 'Company description must be at least 10 characters'
    }
    if (!productForm.imageUrl) {
      errors.imageUrl = 'Product image is required'
    }
    if (!productForm.countInStock || parseInt(productForm.countInStock) < 0) {
      errors.countInStock = 'Valid stock quantity is required'
    }
    if (!productForm.brand?.trim()) {
      errors.brand = 'Brand name is required'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const openEditModal = (product) => {
    if (!seller.verified) {
      setError('Your account must be verified to edit products')
      return
    }
    setProductForm({
      title: product.title || '',
      price: product.price?.toString() || '',
      imageUrl: product.imageUrl || '',
      brand: product.brand || '',
      category: product.category || 'electronics',
      productDescription: product.productDescription || '',
      companyDescription: product.companyDescription || '',
      countInStock: product.countInStock?.toString() || ''
    })
    setImagePreview(product.imageUrl || '')
    setFormErrors({})
    setEditingProduct(product)
    setShowEditModal(true)
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      setError('Please fix the validation errors')
      return
    }

    try {
      let finalImageUrl = productForm.imageUrl

      if (productForm.imageUrl.startsWith('data:')) {
        setUploading(true)
        try {
          const uploadResponse = await axios.post('/api/upload/base64', {
            image: productForm.imageUrl
          }, { headers: getAuthHeader() })
          finalImageUrl = uploadResponse.data.imageUrl
        } catch (uploadError) {
          setError('Failed to upload image')
          setUploading(false)
          return
        }
        setUploading(false)
      }

      const response = await axios.put(`/api/seller/products/${editingProduct._id}`, {
        title: productForm.title,
        price: parseFloat(productForm.price),
        category: productForm.category,
        imageUrl: finalImageUrl,
        productDescription: productForm.productDescription,
        companyDescription: productForm.companyDescription,
        brand: productForm.brand,
        countInStock: parseInt(productForm.countInStock)
      }, { headers: getAuthHeader() })

      setProducts(products.map(p => p._id === editingProduct._id ? response.data : p))
      setSuccess('Product updated successfully!')
      setShowEditModal(false)
      setEditingProduct(null)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update product')
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!seller.verified) {
      setError('Your account must be verified to delete products')
      return
    }
    
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return

    try {
      await axios.delete(`/api/seller/products/${productId}`, {
        headers: getAuthHeader()
      })
      setProducts(products.filter(p => p._id !== productId))
      setSuccess('Product deleted successfully!')
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete product')
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setCategoryFilter('')
    setStockFilter('')
    setSortBy('newest')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!seller) return null

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-amazon-blue text-white py-4 px-6 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/seller/dashboard" className="flex items-center text-gray-300 hover:text-white mr-6">
              <FaArrowLeft className="mr-2" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold">My Products</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">
              {seller.verified ? (
                <span className="flex items-center text-green-400">
                  <FaCheckCircle className="mr-1" /> Verified Seller
                </span>
              ) : (
                <span className="flex items-center text-yellow-400">
                  <FaTimesCircle className="mr-1" /> Pending Verification
                </span>
              )}
            </span>
            <Link
              to="/seller/dashboard"
              onClick={() => { /* Will navigate to add product tab */ }}
              className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                seller.verified
                  ? 'bg-amazon-orange hover:bg-yellow-500 text-amazon-blue'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FaPlus className="mr-2" /> Add Product
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Verification Warning */}
        {!seller.verified && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <FaTimesCircle className="text-amber-500 text-xl mr-3" />
              <div>
                <p className="font-medium text-amber-800">Account Verification Required</p>
                <p className="text-sm text-amber-700">You cannot edit or delete products until your account is verified.</p>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title or brand..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-orange"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Stock Filter */}
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-orange"
              >
                <option value="">All</option>
                <option value="instock">In Stock</option>
                <option value="lowstock">Low Stock (≤10)</option>
                <option value="outofstock">Out of Stock</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-orange"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>

            {/* Reset Filters */}
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Reset
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>

        {/* Products Grid/Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amazon-orange"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FaBox className="text-6xl mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {products.length === 0 ? 'No Products Yet' : 'No Products Match Your Filters'}
            </h3>
            <p className="text-gray-500 mb-6">
              {products.length === 0 
                ? (seller.verified ? 'Start adding products to your store' : 'You can add products once your account is verified')
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {products.length > 0 && (
              <button onClick={resetFilters} className="text-amazon-orange hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Product</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Category</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Price</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Stock</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Added</th>
                    <th className="text-right py-4 px-6 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map(product => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <img 
                            src={product.imageUrl} 
                            alt={product.title} 
                            className="w-16 h-16 object-contain rounded-lg border bg-white mr-4" 
                          />
                          <div>
                            <p className="font-medium text-gray-800 line-clamp-1 max-w-xs">{product.title}</p>
                            <p className="text-sm text-gray-500">{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="capitalize text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-gray-800">{formatINR(product.price)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          product.countInStock > 10 
                            ? 'bg-green-100 text-green-800' 
                            : product.countInStock > 0 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-500 text-sm">
                        {formatDate(product.createdAt)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/product/${product._id}`}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="View Product"
                          >
                            <FaEye />
                          </Link>
                          <button 
                            onClick={() => openEditModal(product)}
                            disabled={!seller.verified}
                            className={`p-2 rounded-lg ${
                              seller.verified 
                                ? 'text-blue-600 hover:bg-blue-50' 
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            title={seller.verified ? 'Edit product' : 'Verification required'}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product._id)}
                            disabled={!seller.verified}
                            className={`p-2 rounded-lg ${
                              seller.verified 
                                ? 'text-red-600 hover:bg-red-50' 
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            title={seller.verified ? 'Delete product' : 'Verification required'}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Edit Product</h2>
                <p className="text-gray-500 text-sm mt-1">Update your product details</p>
              </div>
              <button 
                onClick={() => { setShowEditModal(false); setEditingProduct(null); }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Title */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Product Title *</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={productForm.title} 
                    onChange={handleInputChange}
                    placeholder="Enter product title"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-orange ${formErrors.title ? 'border-red-500' : 'border-gray-300'}`} 
                  />
                  {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Price (₹) *</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={productForm.price} 
                    onChange={handleInputChange} 
                    step="0.01" 
                    min="0"
                    placeholder="0.00"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-orange ${formErrors.price ? 'border-red-500' : 'border-gray-300'}`} 
                  />
                  {formErrors.price && <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>}
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Stock Quantity *</label>
                  <input 
                    type="number" 
                    name="countInStock" 
                    value={productForm.countInStock} 
                    onChange={handleInputChange} 
                    min="0"
                    placeholder="0"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-orange ${formErrors.countInStock ? 'border-red-500' : 'border-gray-300'}`} 
                  />
                  {formErrors.countInStock && <p className="text-red-500 text-xs mt-1">{formErrors.countInStock}</p>}
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Brand *</label>
                  <input 
                    type="text" 
                    name="brand" 
                    value={productForm.brand} 
                    onChange={handleInputChange}
                    placeholder="Brand name"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-orange ${formErrors.brand ? 'border-red-500' : 'border-gray-300'}`} 
                  />
                  {formErrors.brand && <p className="text-red-500 text-xs mt-1">{formErrors.brand}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Category *</label>
                  <select 
                    name="category" 
                    value={productForm.category} 
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-orange ${formErrors.category ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                  {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Product Image *</label>
                  <div className="flex items-start space-x-4">
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="w-24 h-24 object-contain border rounded-lg" />
                    )}
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">Or enter image URL:</p>
                      <input 
                        type="url" 
                        name="imageUrl" 
                        value={productForm.imageUrl?.startsWith('data:') ? '' : productForm.imageUrl}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none mt-1"
                      />
                    </div>
                  </div>
                  {formErrors.imageUrl && <p className="text-red-500 text-xs mt-1">{formErrors.imageUrl}</p>}
                </div>

                {/* Product Description */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Product Description *</label>
                  <textarea 
                    name="productDescription" 
                    value={productForm.productDescription} 
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Describe your product..."
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-orange ${formErrors.productDescription ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.productDescription && <p className="text-red-500 text-xs mt-1">{formErrors.productDescription}</p>}
                </div>

                {/* Company Description */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Company Description *</label>
                  <textarea 
                    name="companyDescription" 
                    value={productForm.companyDescription} 
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Brief description about your company..."
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-orange ${formErrors.companyDescription ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.companyDescription && <p className="text-red-500 text-xs mt-1">{formErrors.companyDescription}</p>}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
                <button 
                  type="button" 
                  onClick={() => { setShowEditModal(false); setEditingProduct(null); }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-3 bg-amazon-orange hover:bg-yellow-500 text-amazon-blue font-bold rounded-lg disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerProducts
