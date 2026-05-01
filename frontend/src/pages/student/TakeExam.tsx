import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid,
  IconButton,
  Badge,
  Stack,
  Snackbar,
} from '@mui/material';
import {
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  BookmarkBorder as MarkIcon,
  Bookmark as MarkedIcon,
  AccessTime as TimeIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface TimeFormat {
  time: string;
  color: string;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  marks: number;
}

interface Exam {
  id: number;
  title: string;
  subject: string;
  duration: number;
  total_marks: number;
  passing_marks: number;
  instructions: string;
  questions: Question[];
}

const TakeExam: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [markedQuestions, setMarkedQuestions] = useState<Set<number>>(new Set());
  const [timeAlert, setTimeAlert] = useState<string>('');
  const [showTimeAlert, setShowTimeAlert] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const MAX_WARNINGS = 3;
  const [showStartConfirm, setShowStartConfirm] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/student/login');
      return;
    }

    const fetchExam = async () => {
      try {
        console.log('Fetching exam with ID:', examId);
        const response = await axios.get(`http://localhost:5000/api/student/exams/${examId}/take`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          console.log('Exam data received:', response.data.exam);
          setExam(response.data.exam);
          setTimeLeft(response.data.exam.duration * 60); // Convert minutes to seconds
          // Automatically enter fullscreen mode when exam loads
          enterFullscreen();
        } else {
          setError(response.data.message || 'Failed to load exam');
        }
      } catch (err: any) {
        console.error('Error fetching exam:', err);
        console.error('Error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          headers: err.response?.headers
        });
        setError(err.response?.data?.message || 'Failed to load exam. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExam();
    }
  }, [examId, navigate]);

  useEffect(() => {
    if (!timeLeft || !exam) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        // Check time thresholds and show alerts
        if (prev === 300) { // 5 minutes left
          setTimeAlert('⚠️ 5 minutes remaining!');
          setShowTimeAlert(true);
        } else if (prev === 180) { // 3 minutes left
          setTimeAlert('⚠️ Only 3 minutes left!');
          setShowTimeAlert(true);
        } else if (prev === 60) { // 1 minute left
          setTimeAlert('⚠️ Final minute! Please submit your exam.');
          setShowTimeAlert(true);
        } else if (prev === 30) { // 30 seconds left
          setTimeAlert('⚠️ 30 seconds left! Exam will auto-submit.');
          setShowTimeAlert(true);
        }

        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, exam]);

  useEffect(() => {
    // Handle fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) {
        setShowSecurityWarning(true);
        setWarningCount(prev => prev + 1);
      }
    };

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowSecurityWarning(true);
        setWarningCount(prev => prev + 1);
      }
    };

    // Handle window focus
    const handleFocus = () => {
      if (!document.fullscreenElement) {
        setShowSecurityWarning(true);
        setWarningCount(prev => prev + 1);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Cleanup
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Auto-submit if max warnings reached
  useEffect(() => {
    if (warningCount >= MAX_WARNINGS) {
      handleSubmit();
    }
  }, [warningCount]);

  const handleAnswerChange = (questionId: number, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNextQuestion = () => {
    if (exam && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleMarkQuestion = (questionId: number) => {
    setMarkedQuestions(prev => {
      const newMarked = new Set(prev);
      if (newMarked.has(questionId)) {
        newMarked.delete(questionId);
      } else {
        newMarked.add(questionId);
      }
      return newMarked;
    });
  };

  const getQuestionStatus = (questionId: number, index: number) => {
    const isAnswered = answers[questionId] !== undefined;
    const isMarked = markedQuestions.has(questionId);
    const isCurrent = index === currentQuestionIndex;

    if (isCurrent) return 'current';
    if (isMarked && isAnswered) return 'marked-answered';
    if (isMarked) return 'marked';
    if (isAnswered) return 'answered';
    return 'not-attempted';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return '#1976d2';
      case 'marked-answered': return '#9c27b0';
      case 'marked': return '#ed6c02';
      case 'answered': return '#2e7d32';
      default: return '#d32f2f';
    }
  };

  const handleSubmit = async () => {
    if (!exam) return;

    setSubmitting(true);
    try {
      // Exit fullscreen before submitting
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/student/exams/${examId}/submit`,
        {
          answers,
          completionTime: exam.duration * 60 - timeLeft
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        navigate('/student/exams');
      }
    } catch (err: any) {
      console.error('Error submitting exam:', err);
      setError(err.response?.data?.message || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch (err) {
      console.error('Error entering fullscreen:', err);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Error exiting fullscreen:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!exam) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Failed to load exam'}
        </Alert>
      </Container>
    );
  }

  // Add start confirmation dialog
  if (showStartConfirm) {
    return (
      <Container sx={{ mt: 4 }}>
        <Dialog
          open={true}
          onClose={() => navigate('/student/exams')}
        >
          <DialogTitle>Start Exam</DialogTitle>
          <DialogContent>
            <Typography paragraph>
              You are about to start: {exam.title}
            </Typography>
            <Typography paragraph>
              Duration: {exam.duration} minutes
            </Typography>
            <Typography paragraph color="warning.main">
              Important: The exam will start in fullscreen mode. Please:
              - Close all other applications
              - Ensure you have a stable internet connection
              - Do not exit fullscreen mode during the exam
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => navigate('/student/exams')}>Cancel</Button>
            <Button 
              onClick={() => {
                setShowStartConfirm(false);
                enterFullscreen();
              }}
              variant="contained"
              color="primary"
            >
              Start Exam
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }

  const formatTime = (seconds: number): TimeFormat => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    let timeColor = '#2e7d32'; // green
    if (seconds <= 300) timeColor = '#ed6c02'; // orange
    if (seconds <= 60) timeColor = '#d32f2f'; // red
    
    return { 
      time: `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`,
      color: timeColor 
    };
  };

  return (
    <Box sx={{ py: 4, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Container>
        {/* Security Warning Dialog */}
        <Dialog 
          open={showSecurityWarning} 
          onClose={() => setShowSecurityWarning(false)}
        >
          <DialogTitle sx={{ color: 'error.main' }}>
            ⚠️ Security Warning
          </DialogTitle>
          <DialogContent>
            <Typography>
              Please maintain exam integrity:
              - Stay in fullscreen mode
              - Don't switch tabs or windows
              - Don't exit the exam window
            </Typography>
            <Typography color="error" sx={{ mt: 2 }}>
              Warning {warningCount} of {MAX_WARNINGS}. 
              The exam will be automatically submitted after {MAX_WARNINGS} warnings.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setShowSecurityWarning(false);
                enterFullscreen();
              }}
              variant="contained"
            >
              Return to Exam
            </Button>
          </DialogActions>
        </Dialog>

        <Grid container spacing={3}>
          {/* Question Palette */}
          <Grid item xs={12} md={3}>
            <Paper elevation={3} sx={{ p: 3, mb: 3, position: 'sticky', top: 20 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Question Palette
                </Typography>
                <IconButton 
                  onClick={isFullscreen ? exitFullscreen : enterFullscreen}
                  color="primary"
                >
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                {exam?.questions.map((q, index) => (
                  <Button
                    key={q.id}
                    variant={currentQuestionIndex === index ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setCurrentQuestionIndex(index)}
                    sx={{
                      minWidth: 0,
                      p: 1,
                      backgroundColor: currentQuestionIndex === index ? 'primary.main' : 'transparent',
                      color: currentQuestionIndex === index ? 'white' : getStatusColor(getQuestionStatus(q.id, index)),
                      borderColor: getStatusColor(getQuestionStatus(q.id, index)),
                    }}
                  >
                    {index + 1}
                  </Button>
                ))}
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Legend:</Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 16, height: 16, bgcolor: getStatusColor('current') }} />
                    <Typography variant="body2">Current</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 16, height: 16, bgcolor: getStatusColor('marked-answered') }} />
                    <Typography variant="body2">Marked & Answered</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 16, height: 16, bgcolor: getStatusColor('marked') }} />
                    <Typography variant="body2">Marked</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 16, height: 16, bgcolor: getStatusColor('answered') }} />
                    <Typography variant="body2">Answered</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 16, height: 16, bgcolor: getStatusColor('not-attempted') }} />
                    <Typography variant="body2">Not Attempted</Typography>
                  </Box>
                </Stack>
              </Box>
            </Paper>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={9}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" gutterBottom>
                  {exam?.title}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  bgcolor: formatTime(timeLeft).color + '10',
                  p: 1,
                  borderRadius: 1,
                }}>
                  <TimeIcon sx={{ color: formatTime(timeLeft).color }} />
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontFamily: 'monospace',
                      color: formatTime(timeLeft).color,
                      fontWeight: 'bold'
                    }}
                  >
                    {formatTime(timeLeft).time}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Subject: {exam?.subject}
              </Typography>
            </Paper>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {exam && exam.questions[currentQuestionIndex] && (
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Question {currentQuestionIndex + 1} of {exam.questions.length} ({exam.questions[currentQuestionIndex].marks} marks)
                  </Typography>
                  <IconButton
                    onClick={() => handleMarkQuestion(exam.questions[currentQuestionIndex].id)}
                    color={markedQuestions.has(exam.questions[currentQuestionIndex].id) ? 'warning' : 'default'}
                  >
                    {markedQuestions.has(exam.questions[currentQuestionIndex].id) ? <MarkedIcon /> : <MarkIcon />}
                  </IconButton>
                </Box>
                <Typography paragraph>{exam.questions[currentQuestionIndex].question}</Typography>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Select your answer:</FormLabel>
                  <RadioGroup
                    value={answers[exam.questions[currentQuestionIndex].id] ?? -1}
                    onChange={(e) => handleAnswerChange(exam.questions[currentQuestionIndex].id, parseInt(e.target.value))}
                  >
                    {exam.questions[currentQuestionIndex].options.map((option, optionIndex) => (
                      <FormControlLabel
                        key={optionIndex}
                        value={optionIndex}
                        control={<Radio />}
                        label={`${optionIndex + 1}. ${option}`}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button
                    startIcon={<PrevIcon />}
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setShowConfirmSubmit(true)}
                    disabled={submitting}
                  >
                    Submit Exam
                  </Button>
                  <Button
                    endIcon={<NextIcon />}
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === exam.questions.length - 1}
                  >
                    Next
                  </Button>
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>

        {/* Time Alert Snackbar */}
        <Snackbar
          open={showTimeAlert}
          autoHideDuration={6000}
          onClose={() => setShowTimeAlert(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setShowTimeAlert(false)} 
            severity="warning"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {timeAlert}
          </Alert>
        </Snackbar>

        <Dialog open={showConfirmSubmit} onClose={() => setShowConfirmSubmit(false)}>
          <DialogTitle>Confirm Submission</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to submit your exam? This action cannot be undone.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Summary:
              </Typography>
              <Typography>
                • Attempted: {Object.keys(answers).length} of {exam?.questions.length} questions
              </Typography>
              <Typography>
                • Marked for review: {markedQuestions.size} questions
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConfirmSubmit(false)}>Cancel</Button>
            <Button onClick={handleSubmit} color="primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default TakeExam; 