import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AdminContext = createContext()

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminInfo')
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/admin/login', { email, password })
      const adminData = {
        ...response.data.admin,
        token: response.data.token
      }
      setAdmin(adminData)
      localStorage.setItem('adminInfo', JSON.stringify(adminData))
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('/api/admin/register', { name, email, password })
      const adminData = {
        ...response.data.admin,
        token: response.data.token
      }
      setAdmin(adminData)
      localStorage.setItem('adminInfo', JSON.stringify(adminData))
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    setAdmin(null)
    localStorage.removeItem('adminInfo')
  }

  const getAuthHeader = () => {
    return admin?.token ? { Authorization: `Bearer ${admin.token}` } : {}
  }

  const value = {
    admin,
    loading,
    login,
    register,
    logout,
    getAuthHeader
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

export default AdminContext
