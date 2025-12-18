import { Link } from 'react-router-dom'
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa'
import { useCart } from '../context/CartContext'
import formatINR from '../utils/formatCurrency'

const Cart = () => {
  const { items, removeFromCart, updateQuantity, cartTotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any items yet.</p>
          <Link
            to="/"
            className="inline-block bg-amazon-orange hover:bg-yellow-500 text-amazon-blue font-bold py-2 px-6 rounded-full"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            {items.map((item, index) => (
              <div key={item._id}>
                <div className="flex p-4">
                  {/* Product Image */}
                  <Link to={`/product/${item._id}`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-32 h-32 object-contain"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 ml-4">
                    <Link to={`/product/${item._id}`}>
                      <h3 className="text-lg font-medium text-gray-800 hover:text-amazon-orange">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-green-600 text-sm mt-1">In Stock</p>

                    {/* Quantity Controls */}
                    <div className="flex items-center mt-4">
                      <button
                        onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                        className="p-2 border rounded-l hover:bg-gray-100"
                      >
                        <FaMinus className="text-xs" />
                      </button>
                      <span className="px-4 py-1 border-t border-b">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="p-2 border rounded-r hover:bg-gray-100"
                      >
                        <FaPlus className="text-xs" />
                      </button>

                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="ml-4 text-red-500 hover:text-red-700 flex items-center"
                      >
                        <FaTrash className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <span className="text-lg font-bold">{formatINR(item.price * item.quantity)}</span>
                  </div>
                </div>
                {index < items.length - 1 && <hr />}
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Items ({items.reduce((acc, item) => acc + item.quantity, 0)})</span>
                <span>{formatINR(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
            </div>

            <hr className="my-4" />

            <div className="flex justify-between text-xl font-bold mb-6">
              <span>Total</span>
              <span>{formatINR(cartTotal)}</span>
            </div>

            <Link
              to="/checkout"
              className="block w-full bg-amazon-orange hover:bg-yellow-500 text-amazon-blue text-center font-bold py-3 px-6 rounded-full"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
