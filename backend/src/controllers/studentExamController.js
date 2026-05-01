const { pool } = require('../config/db');

// Get available exams for student
const getAvailableExams = async (req, res) => {
  try {
    const studentId = req.user.id;
    console.log('Fetching exams for student:', studentId);

    // Get exams that student hasn't taken yet
    const [exams] = await pool.query(`
      SELECT 
        id,
        title,
        subject,
        duration,
        total_marks as totalMarks
      FROM exams e
      WHERE NOT EXISTS (
        SELECT 1 
        FROM exam_results er 
        WHERE er.exam_id = e.id 
        AND er.student_id = ?
      )
      ORDER BY e.created_at DESC
    `, [studentId]);

    console.log('Found exams:', exams);

    res.json({
      success: true,
      exams: exams.map(exam => ({
        ...exam,
        _id: exam.id.toString() // Ensure consistent ID format
      }))
    });
  } catch (error) {
    console.error('Error fetching available exams:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available exams',
      error: error.message
    });
  }
};

// Get exam for student to take
const getExamToTake = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;

    console.log(`Fetching exam ${examId} for student ${studentId}`);

    // Check if student has already taken this exam
    const [existingResult] = await pool.query(
      'SELECT id FROM exam_results WHERE exam_id = ? AND student_id = ?',
      [examId, studentId]
    );

    if (existingResult.length > 0) {
      console.log(`Student ${studentId} has already taken exam ${examId}`);
      return res.status(400).json({
        success: false,
        message: 'You have already taken this exam'
      });
    }

    // Get exam details without correct answers
    const [exams] = await pool.query(
      'SELECT id, title, subject, duration, total_marks, passing_marks, instructions FROM exams WHERE id = ?',
      [examId]
    );

    if (exams.length === 0) {
      console.log(`Exam ${examId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    console.log(`Found exam: ${JSON.stringify(exams[0])}`);

    // Get questions without correct answers
    const [questions] = await pool.query(`
      SELECT 
        id,
        question,
        options,
        marks
      FROM exam_questions 
      WHERE exam_id = ?
    `, [examId]);

    console.log(`Found ${questions.length} questions for exam ${examId}`);
    console.log('Raw questions data:', JSON.stringify(questions, null, 2));

    // Parse options - handle both JSON strings and arrays
    const parsedQuestions = questions.map(q => {
      console.log(`Processing question ${q.id}, options:`, q.options);
      let parsedOptions = q.options;
      
      // If options is already an array, use it as is
      if (Array.isArray(q.options)) {
        console.log(`Options is already an array for question ${q.id}:`, q.options);
      } else {
        try {
          // Try to parse as JSON if it's a string
          parsedOptions = JSON.parse(q.options);
          console.log(`Successfully parsed options as JSON for question ${q.id}:`, parsedOptions);
        } catch (error) {
          // If JSON parsing fails, treat as comma-separated string
          console.log(`JSON parsing failed for question ${q.id}, trying comma-separated format`);
          parsedOptions = q.options.split(',').map(opt => opt.trim());
          console.log(`Parsed options as comma-separated for question ${q.id}:`, parsedOptions);
        }
      }

      return {
        ...q,
        options: parsedOptions
      };
    });

    console.log('Final parsed questions:', JSON.stringify(parsedQuestions, null, 2));

    res.json({
      success: true,
      exam: {
        ...exams[0],
        questions: parsedQuestions
      }
    });
  } catch (error) {
    console.error('Error fetching exam:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam',
      error: error.message
    });
  }
};

// Submit exam
const submitExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { answers, completionTime } = req.body;
    const studentId = req.user.id;

    // Check if student has already taken this exam
    const [existingResult] = await pool.query(
      'SELECT id FROM exam_results WHERE exam_id = ? AND student_id = ?',
      [examId, studentId]
    );

    if (existingResult.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already taken this exam'
      });
    }

    // Get exam questions with correct answers
    const [questions] = await pool.query(
      'SELECT id, correct_answer, marks FROM exam_questions WHERE exam_id = ?',
      [examId]
    );

    // Calculate score
    let totalScore = 0;
    questions.forEach(question => {
      const studentAnswer = answers[question.id];
      if (studentAnswer === question.correct_answer) {
        totalScore += question.marks;
      }
    });

    // Save result
    await pool.query(
      'INSERT INTO exam_results (exam_id, student_id, score, completion_time) VALUES (?, ?, ?, ?)',
      [examId, studentId, totalScore, completionTime]
    );

    res.json({
      success: true,
      message: 'Exam submitted successfully',
      score: totalScore
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit exam'
    });
  }
};

module.exports = {
  getAvailableExams,
  getExamToTake,
  submitExam
}; 