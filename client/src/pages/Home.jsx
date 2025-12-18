import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import ProductCard from '../components/ProductCard'
import { FaChevronRight, FaExclamationTriangle, FaRedo } from 'react-icons/fa'

// Category display names
const categoryNames = {
  electronics: 'Electronics',
  fashion: 'Fashion',
  home: 'Home & Kitchen',
  books: 'Books',
  sports: 'Sports & Outdoors',
  beauty: 'Beauty & Personal Care',
  toys: 'Toys & Games',
  automotive: 'Automotive',
  grocery: 'Grocery',
  health: 'Health & Wellness'
}

const Home = () => {
  const [products, setProducts] = useState([])
  const [groupedProducts, setGroupedProducts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = '/api/products'
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (search) params.append('search', search)
      if (params.toString()) url += `?${params.toString()}`

      const response = await axios.get(url)
      const fetchedProducts = response.data

      setProducts(fetchedProducts)

      // Group products by category
      const grouped = fetchedProducts.reduce((acc, product) => {
        const cat = product.category || 'other'
        if (!acc[cat]) {
          acc[cat] = []
        }
        acc[cat].push(product)
        return acc
      }, {})
      setGroupedProducts(grouped)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Failed to load products. Please try again.')
      setProducts([])
      setGroupedProducts({})
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [category, search])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-amazon-blue to-amazon-light text-white rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">Welcome to Amazon Clone</h1>
          <p className="text-sm sm:text-base lg:text-lg mb-3 sm:mb-4 opacity-90">Discover amazing deals on millions of products</p>
          <Link 
            to="/"
            className="inline-block bg-amazon-orange hover:bg-yellow-500 text-amazon-blue font-bold py-2 px-4 sm:px-6 rounded-full text-sm sm:text-base transition-colors"
          >
            Shop Now
          </Link>
        </div>

        {/* Search Results Title */}
        {search && (
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold">
              Search results for: <span className="text-amazon-orange">"{search}"</span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">{products.length} products found</p>
          </div>
        )}

        {/* Single Category View */}
        {category && !search && (
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold capitalize">
              {categoryNames[category] || category}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">{products.length} products</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6 text-center">
            <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-3" />
            <p className="text-red-700 font-medium mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="inline-flex items-center px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors"
            >
              <FaRedo className="mr-2" /> Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6">
            {/* Loading skeleton for products grid */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <div className="bg-gray-200 rounded-lg h-32 sm:h-40"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amazon-orange"></div>
            </div>
          </div>
        ) : products.length === 0 && !error ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-gray-300 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-6 text-sm sm:text-base">
              {search 
                ? `We couldn't find any products matching "${search}"`
                : category 
                  ? `No products available in ${categoryNames[category] || category}`
                  : 'No products available at the moment'
              }
            </p>
            <Link 
              to="/" 
              className="inline-block bg-amazon-orange hover:bg-yellow-500 text-amazon-blue font-bold py-2 px-6 rounded-full transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        ) : category || search ? (
          /* Flat grid when viewing single category or search */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          /* Grouped by category when viewing all */
          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            {Object.entries(groupedProducts).map(([cat, catProducts]) => (
              <div key={cat} className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-amazon-blue">
                    {categoryNames[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </h2>
                  <Link 
                    to={`/?category=${cat}`}
                    className="flex items-center text-amazon-orange hover:text-yellow-600 text-xs sm:text-sm font-medium"
                  >
                    See all <FaChevronRight className="ml-1" size={10} />
                  </Link>
                </div>

                {/* Category Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {catProducts.slice(0, 5).map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {catProducts.length > 5 && (
                  <div className="text-center mt-4">
                    <Link 
                      to={`/?category=${cat}`}
                      className="text-amazon-orange hover:underline text-xs sm:text-sm"
                    >
                      View all {catProducts.length} products in {categoryNames[cat] || cat}
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
