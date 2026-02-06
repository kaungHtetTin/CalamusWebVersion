import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  CardMedia,
  Button,
  Stack,
  Chip,
  Skeleton,
  IconButton,
  Rating,
  Divider,
  Paper,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  MenuBook as CourseIcon,
  Star as StarIcon,
  Email as EmailIcon,
  AccessTime as TimeIcon,
  PlayLesson as LessonIcon,
} from '@mui/icons-material';
import { instructorAPI } from '../services/api';

// Responsive grid for courses
const ResponsiveGrid = ({ children, minCardWidth = 280 }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`,
      gap: 3,
    }}
  >
    {children}
  </Box>
);

// Course card for instructor's courses
const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  
  const getCategoryInfo = (major) => {
    switch (major?.toLowerCase()) {
      case 'english':
        return { color: '#2e7d32', bgColor: '#e8f5e9', label: 'English' };
      case 'korea':
      case 'korean':
        return { color: '#d32f2f', bgColor: '#ffebee', label: 'Korean' };
      default:
        return { color: '#1976d2', bgColor: '#e3f2fd', label: major || 'Course' };
    }
  };

  const categoryInfo = getCategoryInfo(course.major);
  
  const formatFee = (fee) => {
    if (!fee || fee === 0) return 'Free';
    return `${fee.toLocaleString()} MMK`;
  };

  return (
    <Card 
      onClick={() => navigate(`/course/${course.id}`)}
      sx={{ 
        cursor: 'pointer', 
        transition: 'all 0.3s ease',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': { 
          transform: 'translateY(-4px)', 
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        } 
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="div"
          sx={{
            aspectRatio: '16/9',
            backgroundColor: course.backgroundColor || categoryInfo.color,
            backgroundImage: course.webCover ? `url(${course.webCover})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!course.webCover && (
            <SchoolIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
          )}
        </CardMedia>
        
        <Chip
          label={categoryInfo.label}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            backgroundColor: 'rgba(255,255,255,0.95)',
            color: categoryInfo.color,
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        />
        
        <Chip
          label={formatFee(course.fee)}
          size="small"
          sx={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            backgroundColor: course.fee > 0 ? 'primary.main' : '#4caf50',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        />
      </Box>

      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom noWrap>
          {course.title}
        </Typography>
        
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Rating value={course.rating || 0} precision={0.5} size="small" readOnly />
          <Typography variant="body2" color="text.secondary">
            {course.rating?.toFixed(1) || '0.0'}
          </Typography>
        </Stack>
        
        <Stack direction="row" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <LessonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {course.lessonsCount || 0} lessons
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {course.duration || 0} days
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Stat card component
const StatCard = ({ icon, value, label, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      textAlign: 'center',
      flex: 1,
      minWidth: 120,
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: 2,
        backgroundColor: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 12px',
      }}
    >
      {React.cloneElement(icon, { sx: { color, fontSize: 24 } })}
    </Box>
    <Typography variant="h5" fontWeight={700} color={color}>
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Paper>
);

const InstructorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        setLoading(true);
        const response = await instructorAPI.getDetail(id);
        setInstructor(response.data);
      } catch (err) {
        console.error('Failed to fetch instructor:', err);
        setError('Failed to load instructor profile');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInstructor();
    }
  }, [id]);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 3 }} />
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Skeleton variant="rectangular" height={120} sx={{ flex: 1, borderRadius: 3 }} />
          <Skeleton variant="rectangular" height={120} sx={{ flex: 1, borderRadius: 3 }} />
          <Skeleton variant="rectangular" height={120} sx={{ flex: 1, borderRadius: 3 }} />
        </Stack>
        <Skeleton variant="text" height={40} width={200} sx={{ mb: 2 }} />
        <ResponsiveGrid>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={280} sx={{ borderRadius: 3 }} />
          ))}
        </ResponsiveGrid>
      </Box>
    );
  }

  if (error || !instructor) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error || 'Instructor not found'}
        </Typography>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Back Button */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, color: 'text.secondary' }}
      >
        Back
      </Button>

      {/* Instructor Header */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #43a047 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        />
        
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          alignItems={{ xs: 'center', sm: 'flex-start' }}
        >
          <Avatar
            sx={{
              width: 120,
              height: 120,
              fontSize: '3rem',
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '4px solid rgba(255,255,255,0.3)',
            }}
          >
            {instructor.name?.charAt(0) || 'I'}
          </Avatar>
          
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {instructor.name}
            </Typography>
            
            {instructor.specialty && (
              <Chip
                label={instructor.specialty}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 500,
                  mb: 2,
                }}
              />
            )}
            
            {instructor.bio && (
              <Typography
                variant="body1"
                sx={{ opacity: 0.9, maxWidth: 600, lineHeight: 1.7 }}
              >
                {instructor.bio}
              </Typography>
            )}
            
            {instructor.email && (
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
                <EmailIcon sx={{ fontSize: 18, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {instructor.email}
                </Typography>
              </Stack>
            )}
          </Box>
        </Stack>
      </Paper>

      {/* Stats */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <StatCard
          icon={<CourseIcon />}
          value={instructor.coursesCount || 0}
          label="Courses"
          color="#2e7d32"
        />
        <StatCard
          icon={<PeopleIcon />}
          value={instructor.totalStudents || 0}
          label="Students"
          color="#1976d2"
        />
        <StatCard
          icon={<StarIcon />}
          value="4.8"
          label="Avg Rating"
          color="#ed6c02"
        />
      </Stack>

      {/* Instructor's Courses */}
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Courses by {instructor.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Explore all courses taught by this instructor
        </Typography>

        {instructor.courses && instructor.courses.length > 0 ? (
          <ResponsiveGrid>
            {instructor.courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </ResponsiveGrid>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography color="text.secondary">
              No courses available from this instructor yet.
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default InstructorProfile;
