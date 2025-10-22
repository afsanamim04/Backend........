const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();

// ✅ FIXED: Hardcode Railway port
const PORT = 5800;

// CORS Configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ FIXED: MongoDB Connection with fallback
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://it21004_db_user:test12345@cluster0.xsfx2yw.mongodb.net/researchdb?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
  console.log('📊 Database:', mongoose.connection.name);
})
.catch((err) => {
  console.error('❌ MongoDB Connection Error:', err.message);
});

// Global mongoose for routes
global.mongoose = mongoose;

// Routes Loading
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/post'));
app.use('/api/user', require('./routes/user'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/notifications', require('./routes/notification'));

// ✅ FIXED: Simple Root Route for Railway Health Check
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MBSTU Research Gate API is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    port: PORT
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
      needsVerification: true,
      message: "Registration successful! Please verify your email."
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ✅ FIXED: Server startup with Railway port
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`📅 Started at: ${new Date().toLocaleString()}`);
});

module.exports = app;