import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
} from '@mui/material';
import {
  CreateOutlined as CreateIcon,
  PeopleOutline as PeopleIcon,
  AssessmentOutlined as AssessmentIcon,
} from '@mui/icons-material';

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();

  const dashboardOptions = [
    {
      title: 'Create Exam',
      description: 'Create and manage new exams for your students',
      icon: <CreateIcon sx={{ fontSize: 48 }} />,
      path: '/teacher/create-exam',
      color: '#FF0080',
    },
    {
      title: 'Manage Students',
      description: 'View and manage student information',
      icon: <PeopleIcon sx={{ fontSize: 48 }} />,
      path: '/teacher/manage-students',
      color: '#7928CA',
    },
    {
      title: 'View Results',
      description: 'Check student exam results and performance',
      icon: <AssessmentIcon sx={{ fontSize: 48 }} />,
      path: '/teacher/view-results',
      color: '#3B82F6',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6B46C1 0%, #3B82F6 100%)',
        py: 8,
      }}
    >
      <Container>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            color: 'white',
            mb: 6,
            textAlign: 'center',
            fontWeight: 700,
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          Teacher Dashboard
        </Typography>

        <Grid container spacing={4}>
          {dashboardOptions.map((option, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 20px rgba(0,0,0,0.2)`,
                  },
                }}
                onClick={() => navigate(option.path)}
              >
                <Box
                  sx={{
                    color: option.color,
                    mb: 2,
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'scale(1.1)' },
                  }}
                >
                  {option.icon}
                </Box>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: option.color,
                  }}
                >
                  {option.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 3,
                    color: 'text.secondary',
                  }}
                >
                  {option.description}
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    mt: 'auto',
                    background: `linear-gradient(45deg, ${option.color} 30%, ${option.color}dd 90%)`,
                    color: 'white',
                    '&:hover': {
                      background: `linear-gradient(45deg, ${option.color}dd 30%, ${option.color} 90%)`,
                    },
                  }}
                >
                  Get Started
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default TeacherDashboard; 