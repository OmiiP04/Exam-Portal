import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
  useTheme,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    // Add scroll animation for elements
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      title: 'For Students',
      description: 'Take exams, view results, and track your progress',
      icon: <SchoolIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      action: () => navigate('/student/login'),
    },
    {
      title: 'For Teachers',
      description: 'Create exams, manage questions, and evaluate results',
      icon: <PersonIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      action: () => navigate('/teacher/login'),
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6B46C1 0%, #3B82F6 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background shapes */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: 0.1,
          zIndex: 0,
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            animation: 'float 6s infinite ease-in-out',
          },
          '&::before': {
            background: '#FF0080',
            top: '-100px',
            left: '-100px',
          },
          '&::after': {
            background: '#7928CA',
            bottom: '-100px',
            right: '-100px',
            animationDelay: '-3s',
          },
          '@keyframes float': {
            '0%, 100%': {
              transform: 'translate(0, 0)',
            },
            '50%': {
              transform: 'translate(30px, 30px)',
            },
          },
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', py: 8 }}>
        {/* Hero Section */}
        <Paper
          elevation={6}
          className="animate-on-scroll"
          sx={{
            p: 6,
            mb: 6,
            textAlign: 'center',
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            transform: 'translateY(50px)',
            opacity: 0,
            transition: 'all 0.6s ease-out',
            '&.show': {
              transform: 'translateY(0)',
              opacity: 1,
            },
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 900,
              background: 'linear-gradient(45deg, #FF0080 30%, #7928CA 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              mb: 2,
            }}
          >
            Welcome to Exam Portal
          </Typography>
          <Typography
            variant="h5"
            sx={{ mb: 4, maxWidth: '800px', mx: 'auto', color: 'text.secondary' }}
          >
            A modern platform for conducting and taking online examinations
          </Typography>
          
          <KeyboardArrowDownIcon 
            sx={{
              fontSize: 40,
              color: 'primary.main',
              animation: 'bounce 2s infinite',
              '@keyframes bounce': {
                '0%, 20%, 50%, 80%, 100%': {
                  transform: 'translateY(0)',
                },
                '40%': {
                  transform: 'translateY(10px)',
                },
                '60%': {
                  transform: 'translateY(5px)',
                },
              },
            }}
          />
        </Paper>

        {/* Features Section */}
        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                className="animate-on-scroll"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  transform: `translateY(${50}px)`,
                  opacity: 0,
                  transition: 'all 0.6s ease-out',
                  transitionDelay: `${index * 0.2}s`,
                  '&.show': {
                    transform: 'translateY(0)',
                    opacity: 1,
                  },
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
                  <Box
                    sx={{
                      transform: 'scale(1)',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    component="h2"
                    gutterBottom
                    sx={{ mt: 2, fontWeight: 'bold' }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button
                    variant="contained"
                    onClick={feature.action}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #FF0080 30%, #7928CA 90%)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 16px rgba(255,0,128,0.3)',
                      },
                    }}
                  >
                    Get Started
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Footer */}
        <Box 
          sx={{ 
            mt: 8, 
            textAlign: 'center', 
            color: 'white',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Typography 
            variant="body2"
            sx={{
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              opacity: 0.9,
            }}
          >
            © 2024 Exam Portal. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage; 