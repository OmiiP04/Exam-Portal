import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

interface Exam {
  _id: string;
  title: string;
  duration: number;
  totalMarks: number;
  subject: string;
}

const StudentExams: React.FC = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/student/login');
      return;
    }

    const fetchExams = async () => {
      try {
        console.log('Fetching exams with token:', token);
        const response = await axios.get('http://localhost:5000/api/student/exams', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Server response:', response.data);
        
        if (response.data.success) {
          setExams(response.data.exams || []);
        } else {
          setError(response.data.message || 'Failed to load exams. Please try again later.');
        }
      } catch (err: any) {
        console.error('Error fetching exams:', err);
        console.error('Error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          headers: err.response?.headers
        });
        
        if (err.response) {
          // Server responded with an error
          if (err.response.status === 401) {
            setError('Your session has expired. Please login again.');
            navigate('/student/login');
          } else {
            setError(err.response.data?.message || 'Failed to load exams. Please try again later.');
          }
        } else if (err.request) {
          // Request was made but no response
          setError('Cannot connect to server. Please check your internet connection.');
        } else {
          // Something else happened
          setError('An unexpected error occurred. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [navigate]);

  const handleStartExam = (examId: string) => {
    console.log('Starting exam with ID:', examId);
    // Ensure we're using the numeric ID for the API call
    const numericId = examId.toString().replace(/\D/g, '');
    navigate(`/student/exam/${numericId}`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #6B46C1 0%, #3B82F6 100%)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6B46C1 0%, #3B82F6 100%)',
        py: 4,
      }}
    >
      <Container>
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              mb: 4,
              fontWeight: 700,
              textAlign: 'center',
              background: 'linear-gradient(45deg, #FF0080 30%, #7928CA 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
            }}
          >
            Available Exams
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 3, textAlign: 'center' }}>
              {error}
            </Typography>
          )}

          <Grid container spacing={3}>
            {exams.length === 0 ? (
              <Grid item xs={12}>
                <Typography textAlign="center" color="text.secondary">
                  No exams are currently available.
                </Typography>
              </Grid>
            ) : (
              exams.map((exam) => (
                <Grid item xs={12} sm={6} md={4} key={exam._id}>
                  <Card
                    elevation={3}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {exam.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Subject: {exam.subject}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Duration: {exam.duration} minutes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Marks: {exam.totalMarks}
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleStartExam(exam._id)}
                        sx={{
                          background: 'linear-gradient(45deg, #FF0080 30%, #7928CA 90%)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #FF0080 50%, #7928CA 100%)',
                          },
                        }}
                      >
                        Start Exam
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default StudentExams; 