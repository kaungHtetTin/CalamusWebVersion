import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Rating,
  Divider,
  Paper,
  Container,
  Link,
  Breadcrumbs,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Email as EmailIcon,
  AccessTime as TimeIcon,
  PlayLesson as LessonIcon,
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { instructorAPI } from '../services/api';

// Responsive grid for courses
const ResponsiveGrid = ({ children }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(3, 1fr)',
        xl: 'repeat(4, 1fr)',
      },
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
        border: 'none',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        '&:hover': { 
          transform: 'translateY(-5px)', 
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
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
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
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
      <Box sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
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
      <Box sx={{ textAlign: 'center', py: 8, px: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error || 'Instructor not found'}
        </Typography>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  // DB stores full profile image link – use directly
  const instructorImageUrl = instructor.profileImage || null;

  return (
    <Box sx={{ pb: 3 }}>
      {/* Hero Section - consistent with Home / About */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: { xs: 0, md: 6 },
          overflow: 'hidden',
          mb: 4,
          mx: { xs: -2, sm: -3, md: 0 },
          minHeight: { xs: 'auto', md: 340 },
          display: 'flex',
          alignItems: 'center',
          background: '#1b5e20',
          backgroundImage: `
            radial-gradient(circle at 0% 0%, rgba(46, 125, 50, 0.8) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, rgba(27, 94, 32, 0.9) 0%, transparent 50%),
            url("https://www.transparenttextures.com/patterns/cubes.png")
          `,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
            filter: 'blur(60px)',
            animation: 'heroPulse 8s infinite alternate',
            '@keyframes heroPulse': {
              '0%': { transform: 'scale(1) translate(0, 0)' },
              '100%': { transform: 'scale(1.2) translate(-20px, 20px)' },
            },
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: { xs: 4, md: 5 } }}>
          <Breadcrumbs separator={<ChevronRightIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }} />} sx={{ mb: 2 }}>
            <Link component={RouterLink} to="/" underline="none" sx={{ color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
              <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} /> Home
            </Link>
            <Link component={RouterLink} to="/explore" underline="hover" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem' }}>
              Instructors
            </Link>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 600 }}>
              {instructor.name}
            </Typography>
          </Breadcrumbs>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 3, md: 4 }}
            alignItems={{ xs: 'center', sm: 'flex-start' }}
          >
            <Avatar
              src={instructorImageUrl || undefined}
              sx={{
                width: { xs: 100, md: 120 },
                height: { xs: 100, md: 120 },
                fontSize: '2.5rem',
                bgcolor: 'rgba(255,255,255,0.2)',
                border: '4px solid rgba(255,255,255,0.35)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              }}
            >
              {instructor.name?.charAt(0) || 'I'}
            </Avatar>

            <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
              {instructor.specialty && (
                <Chip
                  label={instructor.specialty}
                  size="small"
                  sx={{
                    mb: 1.5,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    letterSpacing: 0.5,
                  }}
                />
              )}
              <Typography
                variant="h4"
                sx={{
                  color: 'white',
                  fontWeight: 800,
                  mb: 1,
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                {instructor.name}
              </Typography>
              {instructor.bio && (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    maxWidth: 560,
                    lineHeight: 1.65,
                    mb: 2,
                    mx: { xs: 'auto', sm: 0 },
                  }}
                >
                  {instructor.bio}
                </Typography>
              )}
              {instructor.email && (
                <Stack direction="row" alignItems="center" spacing={1} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                  <EmailIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.9)' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {instructor.email}
                  </Typography>
                </Stack>
              )}

              <Stack
                direction="row"
                alignItems="center"
                spacing={3}
                sx={{ mt: 2.5, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}
              >
                <Box>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 800, mb: 0 }}>
                    {instructor.coursesCount || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                    Courses
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)', height: 36 }} />
                <Box>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 800, mb: 0 }}>
                    {instructor.totalStudents ?? 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                    Students
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)', height: 36 }} />
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <StarIcon sx={{ fontSize: 20, color: '#ffc107' }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 800 }}>
                    4.8
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', alignSelf: 'flex-end', mb: 0.3 }}>
                    Avg
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Back button - below hero */}
      <Container maxWidth="lg" sx={{ mb: 2 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
          sx={{ color: 'text.secondary' }}
        >
          Back
        </Button>
      </Container>

      {/* Instructor's Courses */}
      <Container maxWidth="lg">
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
                border: 'none',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}
            >
              <Typography color="text.secondary">
                No courses available from this instructor yet.
              </Typography>
            </Paper>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default InstructorProfile;
