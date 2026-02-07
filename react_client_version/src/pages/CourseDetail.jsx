import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Chip,
  Avatar,
  Rating,
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  Paper,
  Tabs,
  Tab,
  useTheme,
  alpha,
} from '@mui/material';
import {
  PlayCircleOutline as PlayIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as VideoIcon,
  Article as DocumentIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  School as SchoolIcon,
  Verified as VerifiedIcon,
  KeyboardArrowRight as ArrowRightIcon,
  OndemandVideo as VideoLessonsIcon,
  FormatQuote as QuoteIcon,
} from '@mui/icons-material';
import { courseAPI } from '../services/api';

// Course Detail Page Component
const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDays, setExpandedDays] = useState([0]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setLoading(true);
        const response = await courseAPI.getDetail(id);
        setCourse(response.data);
      } catch (err) {
        console.error('Failed to fetch course:', err);
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseDetail();
    }
  }, [id]);

  const handleDayExpand = (dayIndex) => (event, isExpanded) => {
    setExpandedDays(
      isExpanded
        ? [...expandedDays, dayIndex]
        : expandedDays.filter((d) => d !== dayIndex)
    );
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getCategoryInfo = (major) => {
    switch (major?.toLowerCase()) {
      case 'english':
        return { color: '#2e7d32', bgColor: '#e8f5e9', label: 'English', gradient: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)' };
      case 'korea':
      case 'korean':
        return { color: '#e91e63', bgColor: '#fce4ec', label: 'Korean', gradient: 'linear-gradient(135deg, #e91e63 0%, #f48fb1 100%)' };
      default:
        return { color: '#1976d2', bgColor: '#e3f2fd', label: major || 'Course', gradient: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)' };
    }
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Free';
    return `${price.toLocaleString()} MMK`;
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
        <Box sx={{ bgcolor: '#1a1a2e', py: 4 }}>
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
              <Skeleton variant="rectangular" width={400} height={225} sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="90%" height={50} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                <Skeleton variant="text" width="70%" height={30} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                <Skeleton variant="text" width="40%" height={30} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
              </Box>
            </Stack>
          </Container>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 100, color: 'grey.300', mb: 3 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Course Not Found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            The course you're looking for doesn't exist or has been removed.
          </Typography>
          <Button variant="contained" size="large" onClick={() => navigate('/explore')}>
            Browse All Courses
          </Button>
        </Box>
      </Box>
    );
  }

  const categoryInfo = getCategoryInfo(course.major);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      {/* Hero Section - Similar to original layout */}
      <Box
        sx={{
          bgcolor: '#1a1a2e',
          color: 'white',
          py: { xs: 3, md: 4 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Breadcrumb */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3, opacity: 0.7 }}>
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer', '&:hover': { opacity: 1 } }}
              onClick={() => navigate('/')}
            >
              Home
            </Typography>
            <ArrowRightIcon sx={{ fontSize: 16 }} />
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer', '&:hover': { opacity: 1 } }}
              onClick={() => navigate('/explore')}
            >
              Courses
            </Typography>
            <ArrowRightIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2">{categoryInfo.label}</Typography>
          </Stack>

          {/* Main Hero Content - Preview Left, Content Right */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="flex-start">
            {/* Left - Preview Video/Image */}
            <Box
              sx={{
                width: { xs: '100%', md: 400 },
                flexShrink: 0,
              }}
            >
              {course.preview && course.preview !== '' ? (
                // Has preview video - show iframe
                <Box
                  sx={{
                    position: 'relative',
                    paddingTop: '56.25%',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <iframe
                    src={course.preview}
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                    title="Course Preview"
                  />
                </Box>
              ) : (
                // No preview video - show cover image
                <Box
                  sx={{
                    position: 'relative',
                    aspectRatio: '16/9',
                    bgcolor: course.backgroundColor || categoryInfo.color,
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  {/* Web cover as background if available */}
                  {course.webCover && (
                    <Box
                      component="img"
                      src={course.webCover}
                      alt={course.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                      }}
                    />
                  )}
                  
                  {/* Course icon positioned at bottom left (like original PHP) */}
                  {!course.webCover && course.coverUrl && (
                    <Box
                      component="img"
                      src={course.coverUrl}
                      alt={course.title}
                      sx={{
                        height: 100,
                        width: 100,
                        position: 'absolute',
                        bottom: 0,
                        left: 30,
                        objectFit: 'contain',
                      }}
                    />
                  )}
                </Box>
              )}
            </Box>

            {/* Right - Course Info */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  mb: 1.5,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  lineHeight: 1.3,
                }}
              >
                {course.title}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mb: 2,
                  opacity: 0.85,
                  lineHeight: 1.6,
                }}
              >
                {course.description}
              </Typography>

              {/* Rating */}
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ bgcolor: 'rgba(250,175,0,0.2)', px: 1, py: 0.25, borderRadius: 1 }}>
                  <StarIcon sx={{ fontSize: 18, color: '#faaf00' }} />
                  <Typography fontWeight={700} sx={{ color: '#faaf00' }}>
                    {course.rating?.toFixed(1)}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  ({course.totalReviews} ratings)
                </Typography>
              </Stack>

              {/* Students enrolled */}
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 2 }}>
                <PeopleIcon sx={{ fontSize: 18, opacity: 0.7 }} />
                <Typography variant="body2">
                  {course.enrolledStudents?.toLocaleString()} students enrolled
                </Typography>
              </Stack>

              {/* Buy Now Button */}
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/vip-plan')}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontWeight: 700,
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)',
                  boxShadow: '0 4px 14px rgba(46, 125, 50, 0.4)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(46, 125, 50, 0.5)',
                  },
                }}
              >
                Buy Now - {formatPrice(course.fee)}
              </Button>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Instructor Bar */}
      <Box
        sx={{
          bgcolor: '#f0f0f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          py: 2,
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            {/* Left - Instructor Info */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              onClick={() => navigate(`/instructor/${course.instructor?.id}`)}
              sx={{ cursor: 'pointer' }}
            >
              <Avatar
                src={course.instructor?.profile}
                sx={{ width: 48, height: 48 }}
              >
                {course.instructor?.name?.charAt(0)}
              </Avatar>
              <Box>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography fontWeight={600}>{course.instructor?.name}</Typography>
                  <VerifiedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                </Stack>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate(`/instructor/${course.instructor?.id}`)}
                  sx={{
                    mt: 0.5,
                    py: 0,
                    px: 1,
                    fontSize: '0.7rem',
                    borderRadius: 1,
                    textTransform: 'none',
                  }}
                >
                  View Teacher
                </Button>
              </Box>
            </Stack>

            {/* Right - Course Stats */}
            <Stack direction="row" spacing={3}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <VideoLessonsIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {course.lessonsCount} lessons
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <TimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {course.totalDuration}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Tab Navigation - Underline Highlight Style */}
      <Box
        sx={{
          bgcolor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          position: 'sticky',
          top: 64, // below navbar
          zIndex: 10,
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
            <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                bgcolor: 'primary.main',
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minWidth: 120,
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <Tab label="Course Content" />
            <Tab label="Reviews" />
          </Tabs>
        </Container>
      </Box>

      {/* Tab Content */}
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Course Content Tab */}
        {activeTab === 0 && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight={700}>
                Course Content
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {course.curriculum?.length || 0} sections • {course.lessonsCount} lessons • {course.totalDuration} total
              </Typography>
            </Stack>

            {course.curriculum?.map((day, dayIndex) => (
              <Accordion
                key={dayIndex}
                expanded={expandedDays.includes(dayIndex)}
                onChange={handleDayExpand(dayIndex)}
                elevation={0}
                sx={{
                  mb: 1.5,
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  borderRadius: '8px !important',
                  '&:before': { display: 'none' },
                  overflow: 'hidden',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    bgcolor: expandedDays.includes(dayIndex) ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.main',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                      }}
                    >
                      {day.day}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={600}>Day {day.day}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {day.lessonsCount} lectures • {day.totalDuration}
                      </Typography>
                    </Box>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <List disablePadding>
                    {day.lessons?.map((lesson) => (
                                <ListItem
                                  key={lesson.id}
                                  onClick={() => navigate(`/course/${id}/lesson/${lesson.id}`)}
                                  sx={{
                                    py: 1.5,
                                    px: 3,
                                    borderTop: '1px solid',
                                    borderColor: 'divider',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), pl: 4 },
                                  }}
                                >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {lesson.isVideo ? (
                            <VideoIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                          ) : (
                            <DocumentIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={lesson.title}
                          secondary={lesson.category}
                          primaryTypographyProps={{ fontSize: '0.9rem' }}
                          secondaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {lesson.formattedDuration}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {/* Reviews Tab */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
              Student Feedback
            </Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
              {/* Rating Summary - Left */}
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 2,
                  border: 'none',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                  textAlign: 'center',
                  minWidth: { md: 280 },
                }}
              >
                <Typography variant="h2" fontWeight={800} color="primary.main" sx={{ lineHeight: 1 }}>
                  {course.rating?.toFixed(1)}
                </Typography>
                <Rating value={course.rating || 0} precision={0.1} readOnly sx={{ my: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Course Rating
                </Typography>

                <Divider sx={{ my: 3 }} />

                {/* Rating Distribution */}
                <Stack spacing={1.5}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = course.ratingDistribution?.[star] || 0;
                    const percentage = course.totalReviews > 0
                      ? Math.round((count / course.totalReviews) * 100)
                      : 0;

                    return (
                      <Stack key={star} direction="row" alignItems="center" spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={0.25} sx={{ minWidth: 60 }}>
                          {[...Array(5)].map((_, i) => (
                            i < star ? (
                              <StarIcon key={i} sx={{ fontSize: 12, color: '#faaf00' }} />
                            ) : (
                              <StarBorderIcon key={i} sx={{ fontSize: 12, color: 'grey.300' }} />
                            )
                          ))}
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{
                            flex: 1,
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'grey.100',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              bgcolor: '#faaf00',
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 35 }}>
                          {percentage}%
                        </Typography>
                      </Stack>
                    );
                  })}
                </Stack>
              </Paper>

              {/* Reviews List - Right */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Reviews
                </Typography>
                {course.reviews?.length > 0 ? (
                  <Stack spacing={2}>
                    {course.reviews.map((review) => (
                      <Paper
                        key={review.id}
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          border: 'none',
                          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                        }}
                      >
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                          <Avatar src={review.learnerImage} sx={{ width: 44, height: 44 }}>
                            {review.learnerName?.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography fontWeight={600} fontSize="0.95rem">
                              {review.learnerName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {review.formattedTime}
                            </Typography>
                          </Box>
                        </Stack>
                        <Rating value={review.star} readOnly size="small" sx={{ mb: 1 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                          {review.review}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 2,
                      border: 'none',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                      textAlign: 'center',
                    }}
                  >
                    <QuoteIcon sx={{ fontSize: 40, color: 'grey.300', mb: 1 }} />
                    <Typography color="text.secondary">
                      No reviews yet. Be the first to review this course!
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Stack>
          </Box>
        )}

      </Container>
    </Box>
  );
};

export default CourseDetail;
