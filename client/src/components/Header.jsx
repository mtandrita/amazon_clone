import { Link } from 'react-router-dom'
import { FaShoppingCart, FaSearch, FaUser } from 'react-icons/fa'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const Header = () => {
  const { cartCount } = useCart()
  const { user, logout } = useAuth()

  return (
    <header className="bg-amazon-blue text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-amazon-orange">amazon</span>
          <span className="text-xl">.clone</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 mx-4 max-w-2xl">
          <div className="flex">
            <select className="px-2 py-2 bg-gray-200 text-gray-700 rounded-l-md text-sm">
              <option>All</option>
              <option>Electronics</option>
              <option>Books</option>
              <option>Fashion</option>
              <option>Home</option>
            </select>
            <input
              type="text"
              placeholder="Search products..."
              className="flex-1 px-4 py-2 text-gray-700 focus:outline-none"
            />
            <button className="px-4 py-2 bg-amazon-orange hover:bg-yellow-500 rounded-r-md">
              <FaSearch className="text-amazon-blue" />
            </button>
          </div>
        </div>

        {/* Account & Cart */}
        <div className="flex items-center space-x-6">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm">Hello, {user.name}</span>
              <button
                onClick={logout}
                className="text-sm hover:text-amazon-orange"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex flex-col hover:text-amazon-orange">
              <span className="text-xs">Hello, Sign in</span>
              <span className="font-bold text-sm">Account & Lists</span>
            </Link>
          )}

          <Link to="/cart" className="flex items-center hover:text-amazon-orange">
            <div className="relative">
              <FaShoppingCart className="text-2xl" />
              <span className="absolute -top-2 -right-2 bg-amazon-orange text-amazon-blue text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            </div>
            <span className="ml-1 font-bold">Cart</span>
          </Link>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-amazon-light px-4 py-2">
        <ul className="flex justify-between text-sm">
          <div className="flex space-x-6">
            <li><Link to="/" className="hover:text-amazon-orange">All</Link></li>
            <li><Link to="/?category=electronics" className="hover:text-amazon-orange">Electronics</Link></li>
            <li><Link to="/?category=fashion" className="hover:text-amazon-orange">Fashion</Link></li>
            <li><Link to="/?category=home" className="hover:text-amazon-orange">Home & Kitchen</Link></li>
            <li><Link to="/?category=books" className="hover:text-amazon-orange">Books</Link></li>
            <li><Link to="/?category=sports" className="hover:text-amazon-orange">Sports</Link></li>
          </div>
          <li>
            <Link to="/seller/login" className="hover:text-amazon-orange font-medium">
              Sell on Amazon
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
