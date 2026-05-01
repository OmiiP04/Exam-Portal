const express = require('express');
const router = express.Router();
const { 
    addStudentByPRN,
    getAllStudents,
    deleteStudent
} = require('../controllers/studentController');
const { authenticateTeacher } = require('../middleware/auth');

// All routes are protected with teacher authentication
router.use(authenticateTeacher);

// Add student by PRN
router.post('/add-by-prn', addStudentByPRN);

// Get all students
router.get('/', getAllStudents);

// Delete student
router.delete('/:id', deleteStudent);

module.exports = router; 