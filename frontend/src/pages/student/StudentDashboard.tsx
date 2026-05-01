import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
} from '@mui/material';
import { AssignmentOutlined as ExamIcon } from '@mui/icons-material';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/student/login');
    }
  }, [navigate]);

  const handleExamClick = () => {
    navigate('/student/exams');
  };

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
            Student Dashboard
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <Card
                elevation={3}
                sx={{
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                  },
                }}
              >
                <CardActionArea onClick={handleExamClick}>
                  <CardContent
                    sx={{
                      textAlign: 'center',
                      py: 4,
                    }}
                  >
                    <ExamIcon
                      sx={{
                        fontSize: 48,
                        color: '#7928CA',
                        mb: 2,
                      }}
                    />
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{
                        fontWeight: 600,
                        color: '#333',
                      }}
                    >
                      Exams
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      View and take available exams
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default StudentDashboard; 