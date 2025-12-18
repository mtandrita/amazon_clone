import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaBox, 
  FaRupeeSign, 
  FaCheckCircle, 
  FaTimesCircle,
  FaUser,
  FaSignOutAlt,
  FaStore,
  FaTachometerAlt,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt
} from 'react-icons/fa'
import { useSeller } from '../context/SellerContext'
import formatINR from '../utils/formatCurrency'
import axios from 'axios'

const SellerDashboard = () => {
  const { seller, logout, getAuthHeader, refreshSellerData } = useSeller()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!seller) {
      navigate('/seller/login')
      return
    }
    fetchProducts()
    refreshSellerData()
  }, [seller, navigate])

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/seller/products', {
        headers: getAuthHeader()
      })
      setProducts(response.data)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
    setLoading(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
    // Update image preview for image URL
    if (name === 'imageUrl' && value) {
      setImagePreview(value)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFormErrors(prev => ({ ...prev, imageUrl: 'Please upload a valid image file' }))
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, imageUrl: 'Image size should be less than 5MB' }))
        return
      }
      // Create preview and convert to base64
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
    
    if (!productForm.title.trim()) {
      errors.title = 'Product title is required'
    } else if (productForm.title.trim().length < 3) {
      errors.title = 'Product title must be at least 3 characters'
    }

    if (!productForm.price) {
      errors.price = 'Price is required'
    } else if (parseFloat(productForm.price) <= 0) {
      errors.price = 'Price must be greater than 0'
    }

    if (!productForm.category) {
      errors.category = 'Please select a category'
    }

    if (!productForm.productDescription.trim()) {
      errors.productDescription = 'Product description is required'
    } else if (productForm.productDescription.trim().length < 20) {
      errors.productDescription = 'Description must be at least 20 characters'
    }

    if (!productForm.companyDescription.trim()) {
      errors.companyDescription = 'Company description is required'
    } else if (productForm.companyDescription.trim().length < 10) {
      errors.companyDescription = 'Company description must be at least 10 characters'
    }

    if (!productForm.imageUrl) {
      errors.imageUrl = 'Product image is required'
    }

    if (!productForm.countInStock) {
      errors.countInStock = 'Stock quantity is required'
    } else if (parseInt(productForm.countInStock) < 0) {
      errors.countInStock = 'Stock cannot be negative'
    }

    if (!productForm.brand.trim()) {
      errors.brand = 'Brand is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setProductForm({
      title: '',
      price: '',
      imageUrl: '',
      brand: '',
      category: 'electronics',
      productDescription: '',
      companyDescription: '',
      countInStock: ''
    })
    setFormErrors({})
    setImagePreview('')
    setEditingProduct(null)
    setShowAddModal(false)
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      setError('Please fix the validation errors before submitting')
      return
    }

    try {
      let finalImageUrl = productForm.imageUrl

      // If image is base64 (uploaded file), upload to Cloudinary first
      if (productForm.imageUrl.startsWith('data:')) {
        setUploading(true)
        try {
          const uploadResponse = await axios.post('/api/upload/base64', {
            image: productForm.imageUrl
          }, {
            headers: getAuthHeader()
          })
          finalImageUrl = uploadResponse.data.imageUrl
        } catch (uploadError) {
          setError('Failed to upload image. Please try again.')
          setUploading(false)
          return
        }
        setUploading(false)
      }

      const response = await axios.post('/api/seller/products', {
        title: productForm.title,
        price: parseFloat(productForm.price),
        category: productForm.category,
        imageUrl: finalImageUrl,
        productDescription: productForm.productDescription,
        companyDescription: productForm.companyDescription,
        brand: productForm.brand,
        countInStock: parseInt(productForm.countInStock)
      }, {
        headers: getAuthHeader()
      })
      setProducts([...products, response.data])
      setSuccess('Product added successfully!')
      resetForm()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add product')
    }
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      setError('Please fix the validation errors before submitting')
      return
    }

    try {
      let finalImageUrl = productForm.imageUrl

      // If image is base64 (new uploaded file), upload to Cloudinary first
      if (productForm.imageUrl.startsWith('data:')) {
        setUploading(true)
        try {
          const uploadResponse = await axios.post('/api/upload/base64', {
            image: productForm.imageUrl
          }, {
            headers: getAuthHeader()
          })
          finalImageUrl = uploadResponse.data.imageUrl
        } catch (uploadError) {
          setError('Failed to upload image. Please try again.')
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
      }, {
        headers: getAuthHeader()
      })
      setProducts(products.map(p => p._id === editingProduct._id ? response.data : p))
      setSuccess('Product updated successfully!')
      resetForm()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update product')
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return

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

  const openEditModal = (product) => {
    setProductForm({
      title: product.title,
      price: product.price.toString(),
      imageUrl: product.imageUrl,
      brand: product.brand || '',
      category: product.category,
      productDescription: product.productDescription,
      companyDescription: product.companyDescription || '',
      countInStock: product.countInStock.toString()
    })
    setImagePreview(product.imageUrl)
    setFormErrors({})
    setEditingProduct(product)
    setShowAddModal(true)
  }

  const handleLogout = () => {
    logout()
    navigate('/seller/login')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!seller) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-amazon-blue text-white min-h-screen fixed left-0 top-0">
        {/* Logo */}
        <div className="p-4 border-b border-amazon-light">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-amazon-orange">amazon</span>
            <span className="text-xl">.clone</span>
          </Link>
          <p className="text-xs text-gray-400 mt-1">Seller Central</p>
        </div>

        {/* Seller Info */}
        <div className="p-4 border-b border-amazon-light">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-amazon-orange rounded-full flex items-center justify-center">
              <FaStore className="text-amazon-blue text-xl" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-sm">{seller.businessName}</p>
              <div className="flex items-center mt-1">
                {seller.verified ? (
                  <span className="flex items-center text-xs text-green-400">
                    <FaCheckCircle className="mr-1" /> Verified
                  </span>
                ) : (
                  <span className="flex items-center text-xs text-yellow-400">
                    <FaTimesCircle className="mr-1" /> Pending
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-amazon-orange text-amazon-blue'
                    : 'hover:bg-amazon-light'
                }`}
              >
                <FaTachometerAlt className="mr-3" />
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-amazon-orange text-amazon-blue'
                    : 'hover:bg-amazon-light'
                }`}
              >
                <FaUser className="mr-3" />
                My Profile
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'products'
                    ? 'bg-amazon-orange text-amazon-blue'
                    : 'hover:bg-amazon-light'
                }`}
              >
                <FaBox className="mr-3" />
                My Products
              </button>
            </li>
            <li>
              <Link
                to="/seller/products"
                className="w-full flex items-center px-4 py-3 rounded-lg transition-colors hover:bg-amazon-light"
              >
                <FaBox className="mr-3" />
                Products Page
              </Link>
            </li>
            <li>
              <button
                onClick={() => {
                  if (seller.verified) {
                    setShowAddModal(true)
                  } else {
                    setError('Your account must be verified to add products')
                  }
                }}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  seller.verified
                    ? 'hover:bg-amazon-light'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <FaPlus className="mr-3" />
                Add Product
              </button>
            </li>
          </ul>

          {/* Logout Button */}
          <div className="mt-8 pt-4 border-t border-amazon-light">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-colors"
            >
              <FaSignOutAlt className="mr-3" />
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'profile' && 'My Profile'}
            {activeTab === 'products' && 'My Products'}
          </h1>
          <p className="text-gray-500 mt-1">Welcome back, {seller.businessName}</p>
        </div>

        {/* Verification Warning Banner */}
        {!seller.verified && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-bold text-amber-800">Account Verification Required</h3>
                <div className="mt-2 text-amber-700">
                  <p className="mb-2">Your seller account is pending verification by our admin team. Until your account is verified:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>You <strong>cannot add new products</strong> to the marketplace</li>
                    <li>You <strong>cannot edit or delete</strong> existing products</li>
                    <li>Your products will <strong>not be visible</strong> to customers</li>
                  </ul>
                  <p className="mt-3 text-sm">Verification typically takes 1-2 business days. If you have questions, please contact support.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-r-lg">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Products</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{products.length}</p>
                  </div>
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaBox className="text-blue-600 text-2xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Inventory Value</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">
                      {formatINR(products.reduce((acc, p) => acc + (p.price * p.countInStock), 0))}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                    <FaRupeeSign className="text-green-600 text-2xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Account Status</p>
                    <p className={`text-3xl font-bold mt-1 ${seller.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {seller.verified ? 'Verified' : 'Pending'}
                    </p>
                  </div>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    seller.verified ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    {seller.verified ? (
                      <FaCheckCircle className="text-green-600 text-2xl" />
                    ) : (
                      <FaTimesCircle className="text-yellow-600 text-2xl" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    if (seller.verified) {
                      setShowAddModal(true)
                    } else {
                      setError('Your account must be verified to add products')
                    }
                  }}
                  disabled={!seller.verified}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                    seller.verified
                      ? 'bg-amazon-orange hover:bg-yellow-500 text-amazon-blue'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaPlus className="mr-2" />
                  Add Product
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className="flex items-center px-6 py-3 rounded-lg font-medium bg-amazon-blue hover:bg-amazon-light text-white transition-colors"
                >
                  <FaBox className="mr-2" />
                  My Products
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-6 py-3 rounded-lg font-medium border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              </div>
            </div>

            {/* Recent Products */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">Recent Products</h2>
                <button onClick={() => setActiveTab('products')} className="text-blue-600 hover:underline text-sm">View All</button>
              </div>
              {products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaBox className="text-4xl mx-auto mb-2 text-gray-300" />
                  <p>No products yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {products.slice(0, 3).map(product => (
                    <div key={product._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <img src={product.imageUrl} alt={product.title} className="w-full h-32 object-contain mb-3" />
                      <h3 className="font-medium text-sm text-gray-800 line-clamp-2">{product.title}</h3>
                      <p className="text-amazon-orange font-bold mt-1">{formatINR(product.price)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-amazon-blue to-amazon-light rounded-t-xl">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-amazon-orange rounded-full flex items-center justify-center">
                  <FaStore className="text-amazon-blue text-3xl" />
                </div>
                <div className="ml-6 text-white">
                  <h2 className="text-2xl font-bold">{seller.businessName}</h2>
                  <div className="flex items-center mt-2">
                    {seller.verified ? (
                      <span className="flex items-center bg-green-500 text-white text-sm px-3 py-1 rounded-full">
                        <FaCheckCircle className="mr-1" /> Verified Seller
                      </span>
                    ) : (
                      <span className="flex items-center bg-yellow-500 text-white text-sm px-3 py-1 rounded-full">
                        <FaTimesCircle className="mr-1" /> Pending Verification
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                    <FaEnvelope className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-800">{seller.email}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                    <FaPhone className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-800">{seller.phone}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                    <FaMapMarkerAlt className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Business Address</p>
                    <p className="font-medium text-gray-800">{seller.address}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                    <FaCalendarAlt className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium text-gray-800">{seller.createdAt ? formatDate(seller.createdAt) : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {seller.description && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">About Business</h3>
                  <p className="text-gray-600">{seller.description}</p>
                </div>
              )}

              <div className={`mt-6 p-4 rounded-lg ${seller.verified ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className="flex items-center">
                  {seller.verified ? <FaCheckCircle className="text-green-500 text-2xl mr-3" /> : <FaTimesCircle className="text-yellow-500 text-2xl mr-3" />}
                  <div>
                    <p className={`font-bold ${seller.verified ? 'text-green-800' : 'text-yellow-800'}`}>
                      {seller.verified ? 'Your account is verified!' : 'Verification Pending'}
                    </p>
                    <p className={`text-sm ${seller.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {seller.verified ? 'You have full access to all seller features.' : 'Your account is under review. An admin will verify soon.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-500 text-sm">{products.length} products</p>
              <button
                onClick={() => { if (seller.verified) setShowAddModal(true); else setError('Your account must be verified to add products'); }}
                disabled={!seller.verified}
                className={`flex items-center px-4 py-2 rounded-lg font-medium ${seller.verified ? 'bg-amazon-orange hover:bg-yellow-500 text-amazon-blue' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
              >
                <FaPlus className="mr-2" /> Add Product
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amazon-orange"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <FaBox className="text-6xl mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Products Yet</h3>
                <p className="text-gray-500 mb-6">{seller.verified ? 'Start adding products to your store' : 'You can add products once your account is verified'}</p>
                {seller.verified && (
                  <button onClick={() => setShowAddModal(true)} className="bg-amazon-orange hover:bg-yellow-500 text-amazon-blue font-bold px-6 py-3 rounded-lg">
                    <FaPlus className="inline mr-2" /> Add Your First Product
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 font-medium text-gray-500">Product</th>
                      <th className="text-left py-4 px-4 font-medium text-gray-500">Price</th>
                      <th className="text-left py-4 px-4 font-medium text-gray-500">Stock</th>
                      <th className="text-left py-4 px-4 font-medium text-gray-500">Category</th>
                      <th className="text-right py-4 px-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <img src={product.imageUrl} alt={product.title} className="w-14 h-14 object-contain rounded-lg border mr-4" />
                            <div>
                              <p className="font-medium text-gray-800 line-clamp-1">{product.title}</p>
                              <p className="text-sm text-gray-500">{product.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4"><span className="font-bold text-gray-800">{formatINR(product.price)}</span></td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.countInStock > 10 ? 'bg-green-100 text-green-800' : product.countInStock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {product.countInStock} in stock
                          </span>
                        </td>
                        <td className="py-4 px-4"><span className="capitalize text-gray-600">{product.category}</span></td>
                        <td className="py-4 px-4">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => seller.verified ? openEditModal(product) : setError('Your account must be verified to edit products')} 
                              disabled={!seller.verified}
                              className={`p-2 rounded-lg ${seller.verified ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-400 cursor-not-allowed'}`}
                              title={seller.verified ? 'Edit product' : 'Verification required'}
                            >
                              <FaEdit />
                            </button>
                            <button 
                              onClick={() => seller.verified ? handleDeleteProduct(product._id) : setError('Your account must be verified to delete products')} 
                              disabled={!seller.verified}
                              className={`p-2 rounded-lg ${seller.verified ? 'text-red-600 hover:bg-red-50' : 'text-gray-400 cursor-not-allowed'}`}
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
            )}
          </div>
        )}
      </main>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {editingProduct ? 'Update your product details' : 'Fill in the details to add a new product'}
              </p>
            </div>

            <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Title */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Product Title *</label>
                  <input type="text" name="title" value={productForm.title} onChange={handleInputChange}
                    placeholder="Enter product title"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-orange ${formErrors.title ? 'border-red-500' : 'border-gray-300'}`} />
                  {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Price (₹) *</label>
                  <input type="number" name="price" value={productForm.price} onChange={handleInputChange} step="0.01" min="0"
                    placeholder="0.00"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-orange ${formErrors.price ? 'border-red-500' : 'border-gray-300'}`} />
                  {formErrors.price && <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>}
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Category *</label>
                  <select name="category" value={productForm.category} onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-orange ${formErrors.category ? 'border-red-500' : 'border-gray-300'}`}>
                    <option value="">Select a category</option>
                    <option value="electronics">Electronics</option>
                    <option value="fashion">Fashion</option>
                    <option value="home">Home & Kitchen</option>
                    <option value="books">Books</option>
                    <option value="sports">Sports & Outdoors</option>
                    <option value="beauty">Beauty & Personal Care</option>
                    <option value="toys">Toys & Games</option>
                    <option value="automotive">Automotive</option>
                    <option value="grocery">Grocery & Gourmet</option>
                    <option value="health">Health & Household</option>
                  </select>
                  {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Brand *</label>
                  <input type="text" name="brand" value={productForm.brand} onChange={handleInputChange}
                    placeholder="Enter brand name"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-orange ${formErrors.brand ? 'border-red-500' : 'border-gray-300'}`} />
                  {formErrors.brand && <p className="text-red-500 text-xs mt-1">{formErrors.brand}</p>}
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Stock Quantity *</label>
                  <input type="number" name="countInStock" value={productForm.countInStock} onChange={handleInputChange} min="0"
                    placeholder="0"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-orange ${formErrors.countInStock ? 'border-red-500' : 'border-gray-300'}`} />
                  {formErrors.countInStock && <p className="text-red-500 text-xs mt-1">{formErrors.countInStock}</p>}
                </div>

                {/* Product Image Upload */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Product Image *</label>
                  <div className="flex flex-col space-y-3">
                    {/* File Upload */}
                    <div className={`border-2 border-dashed rounded-lg p-4 text-center ${formErrors.imageUrl ? 'border-red-500' : 'border-gray-300'} hover:border-amazon-orange transition-colors`}>
                      <input type="file" id="imageUpload" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <label htmlFor="imageUpload" className="cursor-pointer">
                        <div className="flex flex-col items-center">
                          <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-gray-600">Click to upload image</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                        </div>
                      </label>
                    </div>
                    
                    {/* OR Divider */}
                    <div className="flex items-center">
                      <div className="flex-1 border-t border-gray-300"></div>
                      <span className="px-3 text-gray-500 text-sm">OR</span>
                      <div className="flex-1 border-t border-gray-300"></div>
                    </div>
                    
                    {/* URL Input */}
                    <input type="url" name="imageUrl" value={productForm.imageUrl.startsWith('data:') ? '' : productForm.imageUrl} 
                      onChange={handleInputChange}
                      placeholder="Enter image URL (https://example.com/image.jpg)"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-orange ${formErrors.imageUrl ? 'border-red-500' : 'border-gray-300'}`} />
                    
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="mt-2 relative inline-block">
                        <img src={imagePreview} alt="Preview" className="w-32 h-32 object-contain border rounded-lg" 
                          onError={() => { setImagePreview(''); setFormErrors(prev => ({ ...prev, imageUrl: 'Invalid image URL' })) }} />
                        <button type="button" onClick={() => { setImagePreview(''); setProductForm(prev => ({ ...prev, imageUrl: '' })) }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                  {formErrors.imageUrl && <p className="text-red-500 text-xs mt-1">{formErrors.imageUrl}</p>}
                </div>

                {/* Product Description */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Product Description *</label>
                  <textarea name="productDescription" value={productForm.productDescription} onChange={handleInputChange} rows="4"
                    placeholder="Describe your product in detail (features, specifications, benefits...)"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-orange ${formErrors.productDescription ? 'border-red-500' : 'border-gray-300'}`} />
                  <div className="flex justify-between mt-1">
                    {formErrors.productDescription && <p className="text-red-500 text-xs">{formErrors.productDescription}</p>}
                    <p className={`text-xs ml-auto ${productForm.productDescription.length < 20 ? 'text-gray-400' : 'text-green-600'}`}>
                      {productForm.productDescription.length}/20 min characters
                    </p>
                  </div>
                </div>

                {/* Company Description */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Company/Brand Description *</label>
                  <textarea name="companyDescription" value={productForm.companyDescription} onChange={handleInputChange} rows="3"
                    placeholder="Tell customers about your company or brand..."
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-orange ${formErrors.companyDescription ? 'border-red-500' : 'border-gray-300'}`} />
                  <div className="flex justify-between mt-1">
                    {formErrors.companyDescription && <p className="text-red-500 text-xs">{formErrors.companyDescription}</p>}
                    <p className={`text-xs ml-auto ${productForm.companyDescription.length < 10 ? 'text-gray-400' : 'text-green-600'}`}>
                      {productForm.companyDescription.length}/10 min characters
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-100">
                <button type="button" onClick={resetForm} disabled={uploading}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={uploading}
                  className="px-6 py-3 bg-amazon-orange hover:bg-yellow-500 text-amazon-blue font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                  {uploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-amazon-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    editingProduct ? 'Update Product' : 'Add Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerDashboard
