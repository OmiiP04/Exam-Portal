import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import HomePage from './pages/HomePage';
import StudentLogin from './pages/student/StudentLogin';
import StudentRegister from './pages/student/StudentRegister';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentExams from './pages/student/StudentExams';
import TakeExam from './pages/student/TakeExam';
import TeacherLogin from './pages/teacher/TeacherLogin';
import TeacherRegister from './pages/teacher/TeacherRegister';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CreateExam from './pages/teacher/CreateExam';
import ManageStudents from './pages/teacher/ManageStudents';
import ViewResults from './pages/teacher/ViewResults';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
    },
    secondary: {
      main: '#FF4081',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// PrivateRoute component to protect teacher routes
const TeacherPrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  if (!token || userType !== 'teacher') {
    return <Navigate to="/teacher/login" />;
  }
  
  return element;
};

// PrivateRoute component to protect student routes
const StudentPrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    return <Navigate to="/student/login" />;
  }
  
  return element;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* Student Routes */}
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/register" element={<StudentRegister />} />
          <Route 
            path="/student/dashboard" 
            element={<StudentPrivateRoute element={<StudentDashboard />} />} 
          />
          <Route 
            path="/student/exams" 
            element={<StudentPrivateRoute element={<StudentExams />} />} 
          />
          <Route 
            path="/student/exam/:examId" 
            element={<StudentPrivateRoute element={<TakeExam />} />} 
          />

          {/* Teacher Routes */}
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route path="/teacher/register" element={<TeacherRegister />} />
          <Route 
            path="/teacher/dashboard" 
            element={<TeacherPrivateRoute element={<TeacherDashboard />} />} 
          />
          <Route 
            path="/teacher/create-exam" 
            element={<TeacherPrivateRoute element={<CreateExam />} />} 
          />
          <Route 
            path="/teacher/manage-students" 
            element={<TeacherPrivateRoute element={<ManageStudents />} />} 
          />
          <Route 
            path="/teacher/view-results" 
            element={<TeacherPrivateRoute element={<ViewResults />} />} 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
