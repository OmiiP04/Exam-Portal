const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

// Add student by PRN
const addStudentByPRN = async (req, res) => {
    try {
        const { prn_number } = req.body;

        // Check if student already exists
        const [existingStudent] = await pool.query(
            'SELECT * FROM students WHERE prn_number = ?',
            [prn_number]
        );

        if (existingStudent.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Student with this PRN number already exists'
            });
        }

        // Insert new student with only PRN number
        const [result] = await pool.query(
            'INSERT INTO students (prn_number) VALUES (?)',
            [prn_number]
        );

        res.status(201).json({
            success: true,
            message: 'Student PRN added successfully. Student can now register with this PRN.',
            student: {
                id: result.insertId,
                prn_number
            }
        });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add student'
        });
    }
};

// Get all students
const getAllStudents = async (req, res) => {
    try {
        const [students] = await pool.query(
            'SELECT id, username, email, prn_number, created_at FROM students ORDER BY created_at DESC'
        );

        res.json({
            success: true,
            students
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch students'
        });
    }
};

// Delete student
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            'DELETE FROM students WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete student'
        });
    }
};

module.exports = {
    addStudentByPRN,
    getAllStudents,
    deleteStudent
}; 