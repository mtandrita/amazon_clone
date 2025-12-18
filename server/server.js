const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

// Load environment variables
dotenv.config()

// Connect to database
connectDB()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/products', require('./routes/productRoutes'))
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/orders', require('./routes/orderRoutes'))
app.use('/api/seller', require('./routes/sellerRoutes'))
app.use('/api/upload', require('./routes/uploadRoutes'))
app.use('/api/admin', require('./routes/adminRoutes'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
