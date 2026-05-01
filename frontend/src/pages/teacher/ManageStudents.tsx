import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Chip,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PendingIcon from '@mui/icons-material/Pending';
import axios from 'axios';

interface Student {
  id: number;
  username: string | null;
  email: string | null;
  prn_number: string;
  created_at: string;
}

const ManageStudents: React.FC = () => {
  const [prnNumber, setPrnNumber] = useState('');
  const [error, setError] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<{success: boolean, students: Student[]}>(
        'http://localhost:5000/api/student',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents(response.data.students);
    } catch (err: any) {
      setError('Failed to fetch students');
    }
  };

  const filteredStudents = students.filter((student) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      student.prn_number.toLowerCase().includes(searchLower) ||
      (student.email?.toLowerCase().includes(searchLower) || false) ||
      (student.username?.toLowerCase().includes(searchLower) || false)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post<{success: boolean, student: Student}>(
        'http://localhost:5000/api/student/add-by-prn', 
        { prn_number: prnNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage('Student PRN added successfully');
      setSnackbarOpen(true);
      setPrnNumber('');
      fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add student');
    }
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/student/${studentToDelete.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage('Student deleted successfully');
      setSnackbarOpen(true);
      fetchStudents();
    } catch (err: any) {
      setError('Failed to delete student');
    }
    setDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  const getRegistrationStatus = (student: Student) => {
    if (student.username && student.email) {
      return (
        <Tooltip title="Registered">
          <Chip
            icon={<HowToRegIcon />}
            label="Registered"
            color="success"
            size="small"
          />
        </Tooltip>
      );
    }
    return (
      <Tooltip title="Pending Registration">
        <Chip
          icon={<PendingIcon />}
          label="Pending"
          color="warning"
          size="small"
        />
      </Tooltip>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4, backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="lg">
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Add New Student
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            Enter the student's PRN number to create their account
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="PRN Number"
              value={prnNumber}
              onChange={(e) => setPrnNumber(e.target.value)}
              placeholder="Enter PRN number"
              variant="outlined"
              sx={{ mb: 3 }}
              autoFocus
            />

            <Button 
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={!prnNumber.trim()}
            >
              ADD STUDENT
            </Button>
          </form>
        </Paper>

        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">
              Manage Students
            </Typography>
            <TextField
              placeholder="Search by PRN, username, or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: '300px' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>PRN Number</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Added On</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.prn_number}</TableCell>
                    <TableCell>
                      {student.username || '-'}
                    </TableCell>
                    <TableCell>
                      {student.email || '-'}
                    </TableCell>
                    <TableCell>
                      {getRegistrationStatus(student)}
                    </TableCell>
                    <TableCell>
                      {new Date(student.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Delete Student">
                        <IconButton 
                          onClick={() => handleDeleteClick(student)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body1" sx={{ py: 3, color: 'text.secondary' }}>
                        No students found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Student</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this student? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageStudents; 