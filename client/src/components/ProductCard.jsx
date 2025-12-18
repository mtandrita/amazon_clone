import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaStar, FaStarHalfAlt, FaRegStar, FaStore, FaImage } from 'react-icons/fa'
import { useCart } from '../context/CartContext'
import { formatPriceParts } from '../utils/formatCurrency'

// Default placeholder image
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNMTUwIDEyMEMxNDEuNzE2IDEyMCAxMzUgMTI2LjcxNiAxMzUgMTM1QzEzNSAxNDMuMjg0IDE0MS43MTYgMTUwIDE1MCAxNTBDMTU4LjI4NCAxNTAgMTY1IDE0My4yODQgMTY1IDEzNUMxNjUgMTI2LjcxNiAxNTguMjg0IDEyMCAxNTAgMTIwWiIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik0xODAgMTgwSDEyMEwxMzUgMTU1TDE0NSAxNjVMMTU1IDE1NUwxODAgMTgwWiIgZmlsbD0iIzlDQTNBRiIvPjwvc3ZnPg=='

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

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

  // Get product image URL with fallback
  const getImageUrl = () => {
    if (imageError) return PLACEHOLDER_IMAGE
    const url = product.imageUrl || product.image
    if (!url || url === '') return PLACEHOLDER_IMAGE
    return url
  }

  // Get seller business name (populated from backend)
  const sellerName = product.sellerId?.businessName || product.brand || 'Unknown Seller'
  
  // Get company description (first 50 chars)
  const companyInfo = product.companyDescription 
    ? product.companyDescription.substring(0, 50) + (product.companyDescription.length > 50 ? '...' : '')
    : null

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    addToCart(product)
    setTimeout(() => setIsAddingToCart(false), 500)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(true)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-3 sm:p-4 flex flex-col h-full group">
      <Link to={`/product/${product._id}`} className="block relative overflow-hidden rounded-lg bg-gray-50">
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
            <FaImage className="text-gray-300 text-4xl" />
          </div>
        )}
        <img
          src={getImageUrl()}
          alt={product.title || product.name || 'Product Image'}
          className={`w-full h-40 sm:h-48 object-contain transition-all duration-300 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      </Link>
      
      <div className="flex flex-col flex-1 mt-3">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-xs sm:text-sm font-medium text-gray-800 hover:text-amazon-orange line-clamp-2 mb-2 min-h-[2.5rem]">
            {product.title || product.name || 'Untitled Product'}
          </h3>
        </Link>

        {/* Seller/Company Info */}
        <div className="flex items-center text-xs text-gray-500 mb-1">
          <FaStore className="mr-1 text-amazon-light flex-shrink-0" />
          <span className="truncate">{sellerName}</span>
        </div>

        {/* Company Description */}
        {companyInfo && (
          <p className="text-xs text-gray-400 mb-2 line-clamp-1 hidden sm:block">
            {companyInfo}
          </p>
        )}

        <div className="flex items-center mb-2">
          <div className="flex text-xs sm:text-sm">{renderStars(product.rating)}</div>
          <span className="text-xs sm:text-sm text-blue-600 ml-1 sm:ml-2">({product.numReviews || 0})</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline mb-2">
            {(() => {
              const { symbol, wholeNumber, decimal } = formatPriceParts(product.price)
              return (
                <>
                  <span className="text-xs">{symbol}</span>
                  <span className="text-xl sm:text-2xl font-bold">{wholeNumber}</span>
                  {decimal && <span className="text-xs">{decimal}</span>}
                </>
              )
            })()}
          </div>

          {(product.countInStock || 0) > 0 ? (
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={`w-full font-bold py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm transition-all duration-200 ${
                isAddingToCart
                  ? 'bg-green-500 text-white'
                  : 'bg-amazon-orange hover:bg-yellow-500 text-amazon-blue'
              }`}
            >
              {isAddingToCart ? '✓ Added!' : 'Add to Cart'}
            </button>
          ) : (
            <button
              disabled
              className="w-full bg-gray-200 text-gray-500 font-bold py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm cursor-not-allowed"
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard
