import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface ExamResult {
  id: number;
  student_name: string;
  prn_number: string;
  exam_title: string;
  score: number;
  total_marks: number;
  passing_marks: number;
  completion_time: number;
  submitted_at: string;
}

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const ViewResults: React.FC = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<ExamResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [prnSearch, setPrnSearch] = useState('');
  const [selectedExam, setSelectedExam] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageScore: 0,
    passRate: 0,
  });

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    filterResults();
  }, [searchTerm, prnSearch, selectedExam, results]);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/exams/results', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setResults(response.data.results);
      setFilteredResults(response.data.results);
      
      // Extract unique exam titles
      const uniqueExams = Array.from<string>(new Set<string>(response.data.results.map((r: ExamResult) => r.exam_title)));
      setExams(uniqueExams);
      
      // Calculate statistics
      calculateStats(response.data.results);
      
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch results');
      setLoading(false);
    }
  };

  const calculateStats = (results: ExamResult[]) => {
    const uniqueStudents = new Set(results.map(r => r.student_name)).size;
    const avgScore = results.reduce((acc, curr) => 
      acc + (curr.score / curr.total_marks) * 100, 0) / results.length;
    const passCount = results.filter(r => r.score >= r.passing_marks).length;
    const passRate = (passCount / results.length) * 100;

    setStats({
      totalStudents: uniqueStudents,
      averageScore: Math.round(avgScore * 10) / 10,
      passRate: Math.round(passRate * 10) / 10,
    });
  };

  const filterResults = () => {
    let filtered = [...results];
    
    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.exam_title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (prnSearch) {
      filtered = filtered.filter(result =>
        result.prn_number && result.prn_number.toString().includes(prnSearch)
      );
    }
    
    if (selectedExam !== 'all') {
      filtered = filtered.filter(result => result.exam_title === selectedExam);
    }
    
    setFilteredResults(filtered);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const statCards: StatCard[] = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      color: '#FF0080',
    },
    {
      title: 'Average Score',
      value: `${stats.averageScore}%`,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#7928CA',
    },
    {
      title: 'Pass Rate',
      value: `${stats.passRate}%`,
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      color: '#3B82F6',
    },
  ];

  if (loading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4, backgroundColor: '#f5f5f5' }}>
      <Container>
        <Typography
          variant="h4"
          sx={{ mb: 4, fontWeight: 700 }}
        >
          Exam Results
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

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  background: 'white',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Box
                  sx={{
                    borderRadius: '50%',
                    width: 60,
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: `${card.color}15`,
                    color: card.color,
                    mr: 2,
                  }}
                >
                  {card.icon}
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {card.title}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {card.value}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by student name or exam title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                placeholder="Search by PRN number..."
                value={prnSearch}
                onChange={(e) => setPrnSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      #
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Exam</InputLabel>
                <Select
                  value={selectedExam}
                  label="Filter by Exam"
                  onChange={(e) => setSelectedExam(e.target.value)}
                >
                  <MenuItem value="all">All Exams</MenuItem>
                  {exams.map((exam) => (
                    <MenuItem key={exam} value={exam}>{exam}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>PRN Number</TableCell>
                  <TableCell>Exam Title</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Total Marks</TableCell>
                  <TableCell>Percentage</TableCell>
                  <TableCell>Time Taken (min)</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted On</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredResults
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>{result.student_name}</TableCell>
                      <TableCell>{result.prn_number}</TableCell>
                      <TableCell>{result.exam_title}</TableCell>
                      <TableCell>{result.score}</TableCell>
                      <TableCell>{result.total_marks}</TableCell>
                      <TableCell>
                        {((result.score / result.total_marks) * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>{result.completion_time}</TableCell>
                      <TableCell>
                        <Chip
                          label={result.score >= result.passing_marks ? 'PASS' : 'FAIL'}
                          color={result.score >= result.passing_marks ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(result.submitted_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredResults.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default ViewResults; 