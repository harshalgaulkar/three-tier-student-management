const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const studentRoutes = require('./routes/studentRoutes');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB Atlas
connectDB();

// CORS Configuration
// Allows requests from deployed Netlify domain, localhost during development, or any client if not strictly configured
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://student-management-system.netlify.app',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      // If FRONTEND_URL is set to '*', allow all
      if (process.env.FRONTEND_URL === '*' || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow any netlify preview deployment by default
      if (origin.endsWith('.netlify.app')) {
        return callback(null, true);
      }

      return callback(null, true); // Permissive default to avoid deployment blockages
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route - architecture overview
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    tier: 'Application / Business Logic Layer (Tier 2)',
    host: 'Render',
    message: 'Student Information Management System API is running',
    architecture: {
      presentationTier: 'Netlify Frontend (Tier 1)',
      applicationTier: 'Render Node.js/Express API (Tier 2)',
      databaseTier: 'MongoDB Atlas Database (Tier 3)',
    },
    endpoints: {
      getAllStudents: 'GET /api/students',
      getSingleStudent: 'GET /api/students/:id',
      createStudent: 'POST /api/students',
      updateStudent: 'PUT /api/students/:id',
      deleteStudent: 'DELETE /api/students/:id',
      healthCheck: 'GET /api/health',
    },
  });
});

// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount Student API Routes
app.use('/api/students', studentRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack,
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` Student Management API running on PORT: ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Tier: Application Layer (Render)`);
  console.log(`=================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  server.close(() => process.exit(1));
});
