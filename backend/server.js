const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, getDBStatus } = require('./config/database');
const studentRoutes = require('./routes/studentRoutes');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Attempt connection to MongoDB Atlas
connectDB();

// Robust CORS Middleware - Allow all origins for the API
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

// Explicit CORS Headers fallback & Preflight handling
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route - architecture overview
app.get('/', (req, res) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    status: 'online',
    tier: 'Application / Business Logic Layer (Tier 2)',
    host: 'Render',
    database: {
      status: dbStatus.isConnected ? 'connected' : 'disconnected/connecting',
      databaseName: dbStatus.databaseName,
    },
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

// Health check endpoint for Render monitoring
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      connected: dbStatus.isConnected,
      readyState: dbStatus.readyState,
    },
  });
});

// Middleware to verify database connectivity before running CRUD
app.use('/api/students', (req, res, next) => {
  const dbStatus = getDBStatus();
  if (!dbStatus.isConnected) {
    // Attempt reconnect in background
    connectDB();
    // If not connected yet
    if (!dbStatus.isConnected) {
      console.warn('Request to /api/students while MongoDB is not fully connected. Attempting reconnection...');
    }
  }
  next();
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
  console.error('Unhandled server error:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : (err.stack || err),
  });
});

// Port configuration (Render passes PORT via process.env.PORT)
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`=================================================`);
  console.log(` Student Management API running on ${HOST}:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Tier: Application Layer (Render)`);
  console.log(`=================================================`);
});

// Graceful rejection handling
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});
