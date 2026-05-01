import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

const CreateExam: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [examDetails, setExamDetails] = useState({
    title: '',
    subject: '',
    duration: '',
    totalMarks: '',
    passingMarks: '',
    instructions: '',
  });
  const [questions, setQuestions] = useState<Question[]>([{
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    marks: 1
  }]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleExamDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExamDetails({
      ...examDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    if (field === 'options') {
      newQuestions[index][field] = value;
    } else {
      (newQuestions[index] as any)[field] = value;
    }
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        marks: 1
      }
    ]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/exams/create',
        {
          ...examDetails,
          questions
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSuccess('Exam created successfully!');
        // Reset form
        setExamDetails({
          title: '',
          subject: '',
          duration: '',
          totalMarks: '',
          passingMarks: '',
          instructions: '',
        });
        setQuestions([{
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          marks: 1
        }]);
        setActiveStep(0);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create exam');
    }
  };

  const steps = ['Exam Details', 'Add Questions', 'Review & Submit'];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderExamDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Exam Title"
          name="title"
          value={examDetails.title}
          onChange={handleExamDetailsChange}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Subject"
          name="subject"
          value={examDetails.subject}
          onChange={handleExamDetailsChange}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Duration (minutes)"
          name="duration"
          type="number"
          value={examDetails.duration}
          onChange={handleExamDetailsChange}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Total Marks"
          name="totalMarks"
          type="number"
          value={examDetails.totalMarks}
          onChange={handleExamDetailsChange}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Passing Marks"
          name="passingMarks"
          type="number"
          value={examDetails.passingMarks}
          onChange={handleExamDetailsChange}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Instructions"
          name="instructions"
          multiline
          rows={4}
          value={examDetails.instructions}
          onChange={handleExamDetailsChange}
        />
      </Grid>
    </Grid>
  );

  const renderQuestions = () => (
    <Box>
      {questions.map((question, questionIndex) => (
        <Paper key={questionIndex} sx={{ p: 3, mb: 3, position: 'relative' }}>
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => removeQuestion(questionIndex)}
            disabled={questions.length === 1}
          >
            <DeleteIcon />
          </IconButton>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={`Question ${questionIndex + 1}`}
                value={question.question}
                onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                required
              />
            </Grid>
            
            {question.options.map((option, optionIndex) => (
              <Grid item xs={12} sm={6} key={optionIndex}>
                <TextField
                  fullWidth
                  label={`Option ${optionIndex + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                  required
                />
              </Grid>
            ))}

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Correct Answer</InputLabel>
                <Select
                  value={question.correctAnswer}
                  label="Correct Answer"
                  onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', e.target.value)}
                >
                  {question.options.map((_, index) => (
                    <MenuItem key={index} value={index}>Option {index + 1}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Marks"
                type="number"
                value={question.marks}
                onChange={(e) => handleQuestionChange(questionIndex, 'marks', parseInt(e.target.value))}
                required
              />
            </Grid>
          </Grid>
        </Paper>
      ))}
      
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addQuestion}
        sx={{ mt: 2 }}
      >
        Add Question
      </Button>
    </Box>
  );

  const renderReview = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Exam Details</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Title:</strong> {examDetails.title}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Subject:</strong> {examDetails.subject}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Duration:</strong> {examDetails.duration} minutes</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Total Marks:</strong> {examDetails.totalMarks}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography><strong>Instructions:</strong> {examDetails.instructions}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" gutterBottom>Questions</Typography>
      {questions.map((question, index) => (
        <Paper key={index} sx={{ p: 3, mb: 2 }}>
          <Typography><strong>Question {index + 1}:</strong> {question.question}</Typography>
          <Typography><strong>Options:</strong></Typography>
          {question.options.map((option, optIndex) => (
            <Typography key={optIndex} sx={{ ml: 2 }}>
              {optIndex + 1}. {option} {optIndex === question.correctAnswer && '(Correct)'}
            </Typography>
          ))}
          <Typography><strong>Marks:</strong> {question.marks}</Typography>
        </Paper>
      ))}
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', py: 4, backgroundColor: '#f5f5f5' }}>
      <Container>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Create New Exam
          </Typography>

          {(error || success) && (
            <Alert 
              severity={error ? "error" : "success"} 
              sx={{ mb: 3 }}
              onClose={() => {
                setError('');
                setSuccess('');
              }}
            >
              {error || success}
            </Alert>
          )}

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mt: 4 }}>
            {activeStep === 0 && renderExamDetails()}
            {activeStep === 1 && renderQuestions()}
            {activeStep === 2 && renderReview()}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                Back
              </Button>
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    color="primary"
                  >
                    Create Exam
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    color="primary"
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CreateExam; 