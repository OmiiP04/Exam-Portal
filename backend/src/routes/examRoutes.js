const express = require('express');
const router = express.Router();
const { 
  createExam, 
  getTeacherExams, 
  getExamResults, 
  deleteExam, 
  getExamDetails 
} = require('../controllers/examController');
const { authenticateTeacher } = require('../middleware/auth');

// All routes are protected with teacher authentication
router.use(authenticateTeacher);

// Create a new exam
router.post('/create', createExam);

// Get all exams for a teacher
router.get('/teacher', getTeacherExams);

// Get exam results
router.get('/results', getExamResults);

// Delete an exam
router.delete('/:examId', deleteExam);

// Get exam details with questions
router.get('/:examId', getExamDetails);

module.exports = router; 