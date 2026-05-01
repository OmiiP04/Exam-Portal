const { pool } = require('../config/db');

// Create a new exam
const createExam = async (req, res) => {
  try {
    const { title, subject, duration, totalMarks, passingMarks, instructions, questions } = req.body;
    const teacherId = req.user.id;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert exam
      const [examResult] = await connection.query(
        'INSERT INTO exams (title, subject, duration, total_marks, passing_marks, instructions, teacher_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, subject, duration, totalMarks, passingMarks, instructions, teacherId]
      );

      // Insert questions
      for (const question of questions) {
        // Ensure options is an array and convert to JSON string
        const options = Array.isArray(question.options) ? question.options : question.options.split(',').map(opt => opt.trim());
        console.log(`Storing options for question:`, options);
        
        await connection.query(
          'INSERT INTO exam_questions (exam_id, question, options, correct_answer, marks) VALUES (?, ?, ?, ?, ?)',
          [examResult.insertId, question.question, JSON.stringify(options), question.correctAnswer, question.marks]
        );
      }

      await connection.commit();
      connection.release();

      res.status(201).json({
        success: true,
        message: 'Exam created successfully',
        examId: examResult.insertId
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error creating exam:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: `Failed to create exam: ${error.message}`
    });
  }
};

// Get all exams for a teacher
const getTeacherExams = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const [exams] = await pool.query(
      'SELECT * FROM exams WHERE teacher_id = ? ORDER BY created_at DESC',
      [teacherId]
    );

    res.json({
      success: true,
      exams
    });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exams'
    });
  }
};

// Get exam results
const getExamResults = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const [results] = await pool.query(`
      SELECT 
        er.id,
        s.username as student_name,
        s.prn_number,
        e.title as exam_title,
        er.score,
        e.total_marks,
        e.passing_marks,
        er.completion_time,
        er.submitted_at
      FROM exam_results er
      JOIN exams e ON er.exam_id = e.id
      JOIN students s ON er.student_id = s.id
      WHERE e.teacher_id = ?
      ORDER BY er.submitted_at DESC
    `, [teacherId]);

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results'
    });
  }
};

// Delete an exam
const deleteExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const teacherId = req.user.id;

    const [result] = await pool.query(
      'DELETE FROM exams WHERE id = ? AND teacher_id = ?',
      [examId, teacherId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete exam'
    });
  }
};

// Get exam details with questions
const getExamDetails = async (req, res) => {
  try {
    const { examId } = req.params;
    const teacherId = req.user.id;

    // Get exam details
    const [exams] = await pool.query(
      'SELECT * FROM exams WHERE id = ? AND teacher_id = ?',
      [examId, teacherId]
    );

    if (exams.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found or unauthorized'
      });
    }

    // Get exam questions
    const [questions] = await pool.query(
      'SELECT * FROM exam_questions WHERE exam_id = ?',
      [examId]
    );

    // Parse JSON options
    const parsedQuestions = questions.map(q => ({
      ...q,
      options: JSON.parse(q.options)
    }));

    res.json({
      success: true,
      exam: {
        ...exams[0],
        questions: parsedQuestions
      }
    });
  } catch (error) {
    console.error('Error fetching exam details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam details'
    });
  }
};

module.exports = {
  createExam,
  getTeacherExams,
  getExamResults,
  deleteExam,
  getExamDetails
}; 