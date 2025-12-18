import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const SellerContext = createContext()

export const SellerProvider = ({ children }) => {
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('sellerToken')
    const sellerData = localStorage.getItem('seller')
    if (token && sellerData) {
      setSeller(JSON.parse(sellerData))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const response = await axios.post('/api/seller/login', { email, password })
    const { token, seller: sellerData } = response.data
    localStorage.setItem('sellerToken', token)
    localStorage.setItem('seller', JSON.stringify(sellerData))
    setSeller(sellerData)
    return sellerData
  }

  const register = async (formData) => {
    const response = await axios.post('/api/seller/register', formData)
    const { token, seller: sellerData } = response.data
    localStorage.setItem('sellerToken', token)
    localStorage.setItem('seller', JSON.stringify(sellerData))
    setSeller(sellerData)
    return sellerData
  }

  const logout = () => {
    localStorage.removeItem('sellerToken')
    localStorage.removeItem('seller')
    setSeller(null)
  }

  const getAuthHeader = () => {
    const token = localStorage.getItem('sellerToken')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const refreshSellerData = async () => {
    try {
      const response = await axios.get('/api/seller/profile', {
        headers: getAuthHeader()
      })
      setSeller(response.data)
      localStorage.setItem('seller', JSON.stringify(response.data))
    } catch (error) {
      console.error('Failed to refresh seller data:', error)
    }
  }

  return (
    <SellerContext.Provider value={{ 
      seller, 
      login, 
      register, 
      logout, 
      loading, 
      getAuthHeader,
      refreshSellerData 
    }}>
      {children}
    </SellerContext.Provider>
  )
}

export const useSeller = () => useContext(SellerContext)
