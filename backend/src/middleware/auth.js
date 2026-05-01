const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const authenticateTeacher = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if user exists and is a teacher
    const [teachers] = await pool.query(
      'SELECT id, username, email FROM teachers WHERE id = ?',
      [decoded.id]
    );

    if (teachers.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

    // Add user info to request
    req.user = teachers[0];
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

const authenticateStudent = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (err) {
      console.log('Token verification failed:', err.message);
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }
    
    // Check if user exists and is a student
    const [students] = await pool.query(
      'SELECT id, username, email FROM students WHERE id = ?',
      [decoded.id]
    );

    if (students.length === 0) {
      console.log('No student found with id:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'User not found or unauthorized'
      });
    }

    // Add user info to request
    req.user = students[0];
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

module.exports = {
  authenticateTeacher,
  authenticateStudent
}; 