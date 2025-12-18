# Amazon Clone - Ecommerce Website

A full-stack ecommerce website built with React and Node.js/Express.

![Amazon Clone](https://via.placeholder.com/800x400?text=Amazon+Clone+Ecommerce)

## Features

- 🛒 **Shopping Cart** - Add, remove, and update product quantities
- 🔍 **Product Search** - Search and filter products by category
- 👤 **User Authentication** - Register, login, and manage account
- 💳 **Checkout Process** - Complete order with shipping details
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ⭐ **Product Ratings** - View product ratings and reviews

## Tech Stack

### Frontend
- React 18 with Vite
- React Router for navigation
- Context API for state management
- Tailwind CSS for styling
- Axios for API calls
- React Icons

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

## Project Structure

```
amazonclone/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── Header.jsx
│   │   │   └── ProductCard.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Checkout.jsx
│   │   ├── context/       # React Context
│   │   │   ├── CartContext.jsx
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── public/
├── server/                 # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── config/            # Configuration
│   └── server.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB (optional - works with sample data)

### Installation

1. **Install all dependencies:**
   ```bash
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

2. **Configure environment (optional):**
   ```bash
   # In server folder, copy .env.example to .env
   cp server/.env.example server/.env
   # Edit the .env file with your MongoDB URI
   ```

### Running the Application

1. **Start the backend server:**
   ```bash
   cd server
   npm run dev
   ```
   Server runs on http://localhost:5000

2. **Start the frontend (in a new terminal):**
   ```bash
   cd client
   npm run dev
   ```
   Frontend runs on http://localhost:3000

### Quick Start (Demo Mode)

The app works without MongoDB! Sample products are loaded automatically for demo purposes.

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/myorders` - Get user orders
- `GET /api/orders/:id` - Get order by ID

## Development

### Frontend Development
```bash
cd client
npm run dev
```

### Backend Development
```bash
cd server
npm run dev
```

## License

This project is for educational purposes.

## Acknowledgments

- Inspired by Amazon's ecommerce platform
- Built with modern web technologies
