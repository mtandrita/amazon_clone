import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaStar, FaStarHalfAlt, FaRegStar, FaCheck, FaStore, FaArrowLeft, FaImage, FaShoppingCart } from 'react-icons/fa'
import { useCart } from '../context/CartContext'
import { formatPriceParts } from '../utils/formatCurrency'
import axios from 'axios'

// Default placeholder image
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSI1MDAiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNMjUwIDIwMEMyMzYuMTkzIDIwMCAyMjUgMjExLjE5MyAyMjUgMjI1QzIyNSAyMzguODA3IDIzNi4xOTMgMjUwIDI1MCAyNTBDMjYzLjgwNyAyNTAgMjc1IDIzOC44MDcgMjc1IDIyNUMyNzUgMjExLjE5MyAyNjMuODA3IDIwMCAyNTAgMjAwWiIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik0zMDAgMzAwSDIwMEwyMjUgMjYwTDI0NSAyODBMMjYwIDI2MEwzMDAgMzAwWiIgZmlsbD0iIzlDQTNBRiIvPjwvc3ZnPg=='

const ProductDetail = () => {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addedToCart, setAddedToCart] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError(null)
      setImageLoaded(false)
      setImageError(false)
      
      try {
        const response = await axios.get(`/api/products/${id}`)
        setProduct(response.data)
      } catch (err) {
        console.error('Error fetching product:', err)
        setError(err.response?.data?.message || 'Failed to load product. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProduct()
  }, [id])

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating || 0)
    const hasHalfStar = (rating || 0) % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-amazon-orange" />)
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-amazon-orange" />)
    }
    const remaining = 5 - Math.ceil(rating || 0)
    for (let i = 0; i < remaining; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-amazon-orange" />)
    }
    return stars
  }

  const getImageUrl = () => {
    if (imageError) return PLACEHOLDER_IMAGE
    const url = product?.imageUrl || product?.image
    if (!url || url === '') return PLACEHOLDER_IMAGE
    return url
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
              <div className="bg-gray-200 rounded-lg h-64 sm:h-80 lg:h-96"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="h-12 bg-gray-200 rounded-full w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-x-4">
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-amazon-orange hover:bg-yellow-500 text-amazon-blue font-bold rounded-full"
              >
                <FaArrowLeft className="mr-2" /> Back to Home
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Not found state
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-amazon-orange hover:bg-yellow-500 text-amazon-blue font-bold rounded-full"
            >
              <FaArrowLeft className="mr-2" /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const sellerName = product.sellerId?.businessName || product.brand || 'Unknown Seller'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Breadcrumb */}
        <nav className="mb-4 sm:mb-6">
          <Link to="/" className="text-amazon-orange hover:underline text-sm flex items-center">
            <FaArrowLeft className="mr-2" /> Back to Products
          </Link>
        </nav>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Product Image */}
            <div className="relative bg-gray-50 rounded-lg p-4 flex items-center justify-center">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse rounded-lg">
                  <FaImage className="text-gray-300 text-6xl" />
                </div>
              )}
              <img
                src={getImageUrl()}
                alt={product.title || product.name}
                className={`max-w-full h-auto max-h-64 sm:max-h-80 lg:max-h-96 object-contain transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => { setImageError(true); setImageLoaded(true); }}
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-3">
                {product.title || product.name}
              </h1>

              {/* Seller Info */}
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <FaStore className="mr-2 text-amazon-light" />
                <span>Sold by <span className="text-amazon-orange font-medium">{sellerName}</span></span>
              </div>

              <div className="flex items-center mb-4">
                <div className="flex text-lg">{renderStars(product.rating || 0)}</div>
                <span className="text-blue-600 ml-2 text-sm sm:text-base">
                  {product.numReviews || 0} ratings
                </span>
              </div>

              <hr className="my-4" />

              <div className="mb-4">
                <span className="text-sm text-gray-500">Price:</span>
                <div className="flex items-baseline">
                  {(() => {
                    const { symbol, wholeNumber, decimal } = formatPriceParts(product.price)
                    return (
                      <>
                        <span className="text-sm">{symbol}</span>
                        <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                          {wholeNumber}
                        </span>
                        {decimal && <span className="text-sm">{decimal}</span>}
                      </>
                    )
                  })()}
                </div>
              </div>

              <p className="text-gray-700 mb-4 text-sm sm:text-base leading-relaxed">
                {product.productDescription || product.description || 'No description available.'}
              </p>

              {/* Company Description */}
              {product.companyDescription && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-bold text-gray-800 mb-2 text-sm">About the Seller:</h3>
                  <p className="text-gray-600 text-sm">{product.companyDescription}</p>
                </div>
              )}

              <hr className="my-4" />

              {/* Stock Status */}
              <div className="mb-4">
                {(product.countInStock || 0) > 0 ? (
                  <span className="text-green-600 font-bold flex items-center">
                    <FaCheck className="mr-2" /> In Stock ({product.countInStock} available)
                  </span>
                ) : (
                  <span className="text-red-600 font-bold">Out of Stock</span>
                )}
              </div>

              {/* Quantity Selector */}
              {(product.countInStock || 0) > 0 && (
                <div className="flex items-center mb-4">
                  <label className="mr-3 font-medium">Qty:</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                  >
                    {[...Array(Math.min(10, product.countInStock)).keys()].map(x => (
                      <option key={x + 1} value={x + 1}>{x + 1}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Add to Cart Button */}
              {(product.countInStock || 0) > 0 ? (
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-3 px-6 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center ${
                    addedToCart
                      ? 'bg-green-500 text-white'
                      : 'bg-amazon-orange hover:bg-yellow-500 text-amazon-blue'
                  }`}
                >
                  {addedToCart ? (
                    <>✓ Added to Cart</>
                  ) : (
                    <><FaShoppingCart className="mr-2" /> Add to Cart</>
                  )}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3 px-6 rounded-full font-bold text-lg bg-gray-300 text-gray-500 cursor-not-allowed"
                >
                  Out of Stock
                </button>
              )}

              {/* Category Tag */}
              {product.category && (
                <div className="mt-6">
                  <Link
                    to={`/?category=${product.category}`}
                    className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm hover:bg-gray-200 capitalize"
                  >
                    Browse more in {product.category}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
