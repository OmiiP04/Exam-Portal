const express = require('express');
const cors = require('cors');
const { pool, createTables, testConnection, initializeDatabase } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const examRoutes = require('./routes/examRoutes');
const studentExamRoutes = require('./routes/studentExamRoutes');
const studentRoutes = require('./routes/studentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database and start server
const initializeApp = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Initialize database
    await initializeDatabase();
    
    // Create tables if they don't exist
    await createTables();

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/exams', examRoutes);
    app.use('/api/student/exams', studentExamRoutes);
    app.use('/api/student', studentRoutes);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  }
};

initializeApp(); 