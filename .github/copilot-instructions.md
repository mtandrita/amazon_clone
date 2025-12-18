# Amazon Clone - Ecommerce Website

## Project Overview
A full-stack ecommerce website built with React and Node.js/Express with MongoDB.

## Tech Stack
- **Frontend**: React 18, React Router, Context API, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens

## Project Structure
```
amazonclone/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context for state management
│   │   └── utils/         # Utility functions
│   └── public/
├── server/                 # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── config/            # Configuration files
└── README.md
```

## Development Guidelines
- Use functional components with React Hooks
- Follow RESTful API conventions
- Use environment variables for sensitive data
- Implement proper error handling
