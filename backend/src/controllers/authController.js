const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { username, email, password, prn_number } = req.body;

        // First check if the PRN number exists in the authorized students list
        const [authorizedStudents] = await pool.query(
            'SELECT * FROM students WHERE prn_number = ? AND password IS NULL',
            [prn_number]
        );

        if (authorizedStudents.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'This PRN number has not been authorized by a teacher. Please contact your teacher to get access.'
            });
        }

        // Check if user already exists with complete registration
        const [existingUsers] = await pool.query(
            'SELECT * FROM students WHERE (email = ? OR username = ?) AND password IS NOT NULL',
            [email, username]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update the existing student record with registration details
        const [result] = await pool.query(
            'UPDATE students SET username = ?, email = ?, password = ? WHERE prn_number = ?',
            [username, email, hashedPassword, prn_number]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to register student'
            });
        }

        // Get the student ID
        const [student] = await pool.query(
            'SELECT id FROM students WHERE prn_number = ?',
            [prn_number]
        );

        // Generate JWT token
        const token = jwt.sign(
            { id: student[0].id, username, email, role: 'student' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const [users] = await pool.query(
            'SELECT * FROM students WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email, role: 'student' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: 'student'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const teacherRegister = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if teacher already exists
        const [existingTeachers] = await pool.query(
            'SELECT * FROM teachers WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingTeachers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Teacher with this email or username already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new teacher
        const [result] = await pool.query(
            'INSERT INTO teachers (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        // Generate JWT token
        const token = jwt.sign(
            { id: result.insertId, username, email, role: 'teacher' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        res.status(201).json({
            success: true,
            message: 'Teacher registration successful',
            token
        });
    } catch (error) {
        console.error('Teacher registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const teacherLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find teacher by email
        const [teachers] = await pool.query(
            'SELECT * FROM teachers WHERE email = ?',
            [email]
        );

        if (teachers.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const teacher = teachers[0];

        // Check password
        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: teacher.id, username: teacher.username, email: teacher.email, role: 'teacher' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: teacher.id,
                username: teacher.username,
                email: teacher.email,
                role: 'teacher'
            }
        });
    } catch (error) {
        console.error('Teacher login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    register,
    login,
    teacherRegister,
    teacherLogin
}; 