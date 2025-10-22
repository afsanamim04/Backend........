const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5800;

// CORS Configuration - Railway deployment ready
app.use(cors({
  origin: true,  // ✅ All domains allowed for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection with better error handling
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
  console.log('📊 Database:', mongoose.connection.name);
})
.catch((err) => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.log('🔧 Please check your MONGO_URI in environment variables');
});

// Global mongoose for routes
global.mongoose = mongoose;

// Routes Loading
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/post'));
app.use('/api/user', require('./routes/user'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/notifications', require('./routes/notification'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MBSTU Research Gate API is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    port: PORT,
    environment: process.env.NODE_ENV
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working successfully!',
    deployment: 'Railway',
    status: 'Active'
  });
});

// Backend code (Node.js/Express)
app.post('/api/auth/register', async (req, res) => {
  try {
    // User create logic...
    
    // Success response
    res.status(200).json({
      success: true,
      needsVerification: true,  // ✅ এই লাইন গুরুত্বপূর্ণ
      message: "Registration successful! Please verify your email."
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Welcome to MBSTU Research Gate Backend API',
    version: '1.0.0',
    documentation: 'Visit /api/health for status',
    deployed_on: 'Railway'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    available_routes: [
      '/api/health',
      '/api/test',
      '/api/auth',
      '/api/posts',
      '/api/user'
    ]
  });
});

// Server startup
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎯 Server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`📅 Started at: ${new Date().toLocaleString()}`);
  console.log(`=========================================\n`);
});

module.exports = app;