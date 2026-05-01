const express = require('express');
const router = express.Router();
const { 
  getAvailableExams,
  getExamToTake,
  submitExam
} = require('../controllers/studentExamController');
const { authenticateStudent } = require('../middleware/auth');

// All routes are protected with student authentication
router.use(authenticateStudent);

// Get available exams
router.get('/', getAvailableExams);

// Get specific exam for taking
router.get('/:examId/take', getExamToTake);

// Submit exam
router.post('/:examId/submit', submitExam);

module.exports = router; 