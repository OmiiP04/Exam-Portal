const express = require('express');
const router = express.Router();
const { register, login, teacherRegister, teacherLogin } = require('../controllers/authController');

// Student routes
router.post('/register', register);
router.post('/login', login);

// Teacher routes
router.post('/teacher/register', teacherRegister);
router.post('/teacher/login', teacherLogin);

module.exports = router; 