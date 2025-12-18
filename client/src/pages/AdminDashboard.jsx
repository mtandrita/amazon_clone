import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  FaUsers, 
  FaBox, 
  FaShoppingCart, 
  FaStore,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSignOutAlt,
  FaShieldAlt,
  FaTrash,
  FaEye
} from 'react-icons/fa'
import { useAdmin } from '../context/AdminContext'
import axios from 'axios'

const AdminDashboard = () => {
  const { admin, logout, getAuthHeader } = useAdmin()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login')
      return
    }
    fetchData()
  }, [admin, navigate])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, sellersRes] = await Promise.all([
        axios.get('/api/admin/stats', { headers: getAuthHeader() }),
        axios.get('/api/admin/sellers', { headers: getAuthHeader() })
      ])
      setStats(statsRes.data)
      setSellers(sellersRes.data)
    } catch (error) {
      setError('Failed to fetch data')
    }
    setLoading(false)
  }

  const handleApproveSeller = async (sellerId) => {
    try {
      await axios.put(`/api/admin/sellers/${sellerId}/approve`, {}, {
        headers: getAuthHeader()
      })
      setSellers(sellers.map(s => 
        s._id === sellerId ? { ...s, verified: true } : s
      ))
      setSuccess('Seller approved successfully!')
      setTimeout(() => setSuccess(''), 3000)
      // Refresh stats
      const statsRes = await axios.get('/api/admin/stats', { headers: getAuthHeader() })
      setStats(statsRes.data)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to approve seller')
    }
  }

  const handleRejectSeller = async (sellerId) => {
    try {
      await axios.put(`/api/admin/sellers/${sellerId}/reject`, {}, {
        headers: getAuthHeader()
      })
      setSellers(sellers.map(s => 
        s._id === sellerId ? { ...s, verified: false } : s
      ))
      setSuccess('Seller rejected')
      setTimeout(() => setSuccess(''), 3000)
      // Refresh stats
      const statsRes = await axios.get('/api/admin/stats', { headers: getAuthHeader() })
      setStats(statsRes.data)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reject seller')
    }
  }

  const handleDeleteSeller = async (sellerId) => {
    if (!window.confirm('Are you sure you want to delete this seller? This action cannot be undone.')) return

    try {
      await axios.delete(`/api/admin/sellers/${sellerId}`, {
        headers: getAuthHeader()
      })
      setSellers(sellers.filter(s => s._id !== sellerId))
      setSuccess('Seller deleted successfully')
      setTimeout(() => setSuccess(''), 3000)
      // Refresh stats
      const statsRes = await axios.get('/api/admin/stats', { headers: getAuthHeader() })
      setStats(statsRes.data)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete seller')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!admin) {
    return null
  }

  const pendingSellers = sellers.filter(s => !s.verified)
  const verifiedSellers = sellers.filter(s => s.verified)

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-amazon-blue text-white min-h-screen fixed left-0 top-0">
        <div className="p-4 border-b border-amazon-light">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-amazon-orange">amazon</span>
            <span className="text-xl">.clone</span>
          </Link>
          <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
        </div>

        <div className="p-4 border-b border-amazon-light">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-amazon-orange rounded-full flex items-center justify-center">
              <FaShieldAlt className="text-amazon-blue text-xl" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-sm">{admin.name}</p>
              <span className="text-xs text-green-400">Administrator</span>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'dashboard' ? 'bg-amazon-orange text-amazon-blue' : 'hover:bg-amazon-light'
                }`}
              >
                <FaBox className="mr-3" />
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('pending')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'pending' ? 'bg-amazon-orange text-amazon-blue' : 'hover:bg-amazon-light'
                }`}
              >
                <FaClock className="mr-3" />
                Pending Sellers
                {pendingSellers.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {pendingSellers.length}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('sellers')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'sellers' ? 'bg-amazon-orange text-amazon-blue' : 'hover:bg-amazon-light'
                }`}
              >
                <FaStore className="mr-3" />
                All Sellers
              </button>
            </li>
          </ul>

          <div className="mt-8 pt-4 border-t border-amazon-light">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 rounded-lg hover:bg-red-600 transition-colors"
            >
              <FaSignOutAlt className="mr-3" />
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button onClick={() => setError('')} className="float-right">&times;</button>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amazon-orange"></div>
              </div>
            ) : stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FaStore className="text-2xl text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-500 text-sm">Total Sellers</p>
                      <p className="text-2xl font-bold">{stats.totalSellers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <FaCheckCircle className="text-2xl text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-500 text-sm">Verified Sellers</p>
                      <p className="text-2xl font-bold">{stats.verifiedSellers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <FaClock className="text-2xl text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-500 text-sm">Pending Approval</p>
                      <p className="text-2xl font-bold">{stats.pendingSellers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <FaBox className="text-2xl text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-500 text-sm">Total Products</p>
                      <p className="text-2xl font-bold">{stats.totalProducts}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <FaUsers className="text-2xl text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-500 text-sm">Total Users</p>
                      <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <FaShoppingCart className="text-2xl text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-500 text-sm">Total Orders</p>
                      <p className="text-2xl font-bold">{stats.totalOrders}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Pending Sellers */}
            {pendingSellers.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Pending Seller Approvals
                </h2>
                <div className="space-y-4">
                  {pendingSellers.slice(0, 5).map(seller => (
                    <div key={seller._id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium">{seller.businessName}</p>
                        <p className="text-sm text-gray-500">{seller.email}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveSeller(seller._id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectSeller(seller._id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pending Sellers Tab */}
        {activeTab === 'pending' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Pending Seller Approvals</h1>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amazon-orange"></div>
              </div>
            ) : pendingSellers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">No pending seller approvals</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Business Name</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Phone</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Registered</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pendingSellers.map(seller => (
                      <tr key={seller._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-800">{seller.businessName}</p>
                            <p className="text-xs text-gray-500">{seller.address}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{seller.email}</td>
                        <td className="px-6 py-4 text-gray-600">{seller.phone}</td>
                        <td className="px-6 py-4 text-gray-600">{formatDate(seller.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleApproveSeller(seller._id)}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                              title="Approve"
                            >
                              <FaCheckCircle />
                            </button>
                            <button
                              onClick={() => handleDeleteSeller(seller._id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                              title="Delete"
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

        {/* All Sellers Tab */}
        {activeTab === 'sellers' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">All Sellers</h1>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amazon-orange"></div>
              </div>
            ) : sellers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <FaStore className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No sellers registered yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Business Name</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Phone</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Products</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sellers.map(seller => (
                      <tr key={seller._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-800">{seller.businessName}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{seller.email}</td>
                        <td className="px-6 py-4 text-gray-600">{seller.phone}</td>
                        <td className="px-6 py-4">
                          {seller.verified ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                              <FaCheckCircle className="mr-1" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                              <FaClock className="mr-1" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{seller.products?.length || 0}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end space-x-2">
                            {seller.verified ? (
                              <button
                                onClick={() => handleRejectSeller(seller._id)}
                                className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200"
                                title="Revoke Verification"
                              >
                                <FaTimesCircle />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleApproveSeller(seller._id)}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                title="Approve"
                              >
                                <FaCheckCircle />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteSeller(seller._id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                              title="Delete"
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
    </div>
  )
}

export default AdminDashboard
