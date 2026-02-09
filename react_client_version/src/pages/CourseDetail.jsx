import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
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
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ThumbUpOutlined as ThumbUpIcon,
  ThumbUp as ThumbUpFilledIcon,
  MoreVert as MoreVertIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { courseAPI, ratingAPI } from '../services/api';

// Course Detail Page Component
const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDays, setExpandedDays] = useState([0]);
  const [activeTab, setActiveTab] = useState(0);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [ratingStar, setRatingStar] = useState(0);
  const [ratingReview, setRatingReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [reviewSort, setReviewSort] = useState('recent'); // 'recent', 'helpful', 'highest', 'lowest'
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewMenuAnchor, setReviewMenuAnchor] = useState(null);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getDetail(id, user?.phone || null);
      setCourse(response.data);
    } catch (err) {
      console.error('Failed to fetch course:', err);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCourseDetail();
    }
  }, [id, user?.phone]);

  // Sort reviews based on selected sort option
  const getSortedReviews = () => {
    if (!course?.reviews) return [];
    const reviews = [...course.reviews];
    
    switch (reviewSort) {
      case 'highest':
        return reviews.sort((a, b) => b.star - a.star);
      case 'lowest':
        return reviews.sort((a, b) => a.star - b.star);
      case 'recent':
      default:
        return reviews.sort((a, b) => b.time - a.time);
    }
  };

  // Open rating dialog for create or edit
  const handleOpenRatingDialog = (existingRating = null) => {
    if (existingRating) {
      setRatingStar(existingRating.star);
      setRatingReview(existingRating.review || '');
    } else {
      setRatingStar(0);
      setRatingReview('');
    }
    setRatingDialogOpen(true);
  };

  // Close rating dialog
  const handleCloseRatingDialog = () => {
    setRatingDialogOpen(false);
    setRatingStar(0);
    setRatingReview('');
  };

  // Submit rating (create or update)
  const handleSubmitRating = async () => {
    if (ratingStar === 0) {
      setSnackbar({ open: true, message: 'Please select a rating', severity: 'warning' });
      return;
    }

    setSubmittingRating(true);
    try {
      const userRating = course?.userRating;
      
      if (userRating) {
        // Update existing rating
        await ratingAPI.update(userRating.id, ratingStar, ratingReview);
        setSnackbar({ open: true, message: 'Rating updated successfully', severity: 'success' });
      } else {
        // Create new rating
        await ratingAPI.create(parseInt(id), ratingStar, ratingReview);
        setSnackbar({ open: true, message: 'Rating submitted successfully', severity: 'success' });
      }
      
      handleCloseRatingDialog();
      // Refresh course data to get updated ratings
      await fetchCourseDetail();
    } catch (err) {
      console.error('Failed to submit rating:', err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.error || 'Failed to submit rating', 
        severity: 'error' 
      });
    } finally {
      setSubmittingRating(false);
    }
  };

  // Delete rating
  const handleDeleteRating = async (reviewId = null) => {
    const ratingId = reviewId || course?.userRating?.id;
    if (!ratingId) return;
    
    if (!window.confirm('Are you sure you want to delete your rating?')) {
      return;
    }

    try {
      await ratingAPI.delete(ratingId);
      setSnackbar({ open: true, message: 'Rating deleted successfully', severity: 'success' });
      // Refresh course data
      await fetchCourseDetail();
    } catch (err) {
      console.error('Failed to delete rating:', err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.error || 'Failed to delete rating', 
        severity: 'error' 
      });
    }
  };

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

              {/* Progress Bar - Show if user has learned at least one lesson */}
              {isAuthenticated && course.learnedCount > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Your Progress
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ opacity: 0.9 }}>
                      {course.learnedCount} / {course.lessonsCount} lessons
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={course.progress || 0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)',
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.7, display: 'block' }}>
                    {course.progress || 0}% Complete
                  </Typography>
                </Box>
              )}

              {/* Buy Now Button */}
              <Button
                variant="contained"
                size="medium"
                onClick={() => navigate('/vip-plan')}
                sx={{
                  py: 1,
                  px: 3,
                  fontWeight: 600,
                  fontSize: '0.875rem',
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
                    {day.lessons?.map((lesson) => {
                      const isVip = lesson.isVip === true || lesson.isVip === 1;
                      const hasAccess = lesson.hasAccess !== false; // Default to true if not specified
                      const isLocked = isVip && !hasAccess;
                      
                      return (
                        <ListItem
                          key={lesson.id}
                          onClick={() => {
                            if (isLocked) {
                              // Navigate to VIP plan page if lesson is locked
                              navigate('/vip-plan');
                            } else {
                              navigate(`/course/${id}/lesson/${lesson.id}`);
                            }
                          }}
                          sx={{
                            py: 1.5,
                            px: 3,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                            cursor: isLocked ? 'not-allowed' : 'pointer',
                            opacity: isLocked ? 0.6 : 1,
                            transition: 'all 0.2s ease',
                            '&:hover': { 
                              bgcolor: isLocked 
                                ? alpha(theme.palette.error.main, 0.05) 
                                : alpha(theme.palette.primary.main, 0.05), 
                              pl: 4 
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            {isLocked ? (
                              <LockIcon sx={{ fontSize: 20, color: 'error.main' }} />
                            ) : lesson.isVideo ? (
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
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {lesson.learned === 1 && !isLocked && (
                              <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
                            )}
                            {isVip && !hasAccess && (
                              <Chip 
                                label="VIP" 
                                size="small" 
                                sx={{ 
                                  height: 20, 
                                  fontSize: '0.7rem',
                                  bgcolor: 'error.main',
                                  color: 'white',
                                  fontWeight: 600,
                                }} 
                              />
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {lesson.formattedDuration}
                            </Typography>
                          </Stack>
                        </ListItem>
                      );
                    })}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {/* Reviews Tab */}
        {activeTab === 1 && (
          <Box sx={{ mt: 4 }}>
            {/* User's Rating Section - Show at top if exists */}
            {course?.userRating && (
              <Card
                elevation={0}
                sx={{
                  mb: 4,
                  border: `2px solid ${theme.palette.primary.main}`,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
                      <Avatar src={user?.image || course.userRating.learnerImage} sx={{ width: 56, height: 56 }}>
                        {user?.name?.charAt(0) || course.userRating.learnerName?.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                          <Typography fontWeight={600} fontSize="1rem">
                            Your Rating
                          </Typography>
                          <Chip label="You" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
                        </Stack>
                        <Rating 
                          value={course.userRating.star} 
                          readOnly 
                          size="small" 
                          sx={{ mb: 1,
                            '& .MuiRating-iconFilled': {
                              color: '#faaf00',
                            },
                          }} 
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {course.userRating.formattedTime}
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.primary' }}>
                          {course.userRating.review || 'No review text'}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenRatingDialog(course.userRating)}
                        sx={{ color: 'primary.main' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteRating(course.userRating.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Add Rating CTA - Show if user hasn't rated */}
            {!course?.userRating && isAuthenticated && (
              <Card
                elevation={0}
                sx={{
                  mb: 4,
                  border: `2px dashed ${theme.palette.divider}`,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
                onClick={() => handleOpenRatingDialog()}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                      <AddIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={600} fontSize="1rem" sx={{ mb: 0.5 }}>
                        Share your thoughts
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        If you've taken this course, share your experience with other students
                      </Typography>
                    </Box>
                    <Button variant="contained" startIcon={<StarIcon />}>
                      Rate Course
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )}

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
              {/* Rating Summary - Left */}
              <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0 }}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    position: 'sticky',
                    top: 20,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Typography variant="h2" fontWeight={700} color="primary.main" sx={{ fontSize: { xs: '2.5rem', md: '3rem' } }}>
                      {course.rating?.toFixed(1)}
                    </Typography>
                    <Box>
                      <Rating 
                        value={course.rating || 0} 
                        precision={0.1} 
                        readOnly 
                        sx={{ 
                          fontSize: '1.5rem',
                          '& .MuiRating-iconFilled': {
                            color: '#faaf00',
                          },
                        }} 
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {course.totalReviews || 0} {course.totalReviews === 1 ? 'rating' : 'ratings'}
                      </Typography>
                    </Box>
                  </Stack>
                  
                  {/* Rating Distribution */}
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                    Rating Breakdown
                  </Typography>
                  <Stack spacing={2}>
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = course.ratingDistribution?.[star] || 0;
                      const percentage = course.totalReviews > 0
                        ? Math.round((count / course.totalReviews) * 100)
                        : 0;
                      return (
                        <Stack key={star} direction="row" alignItems="center" spacing={1.5}>
                          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 80 }}>
                            <Typography variant="body2" fontWeight={600} sx={{ minWidth: 20 }}>
                              {star}
                            </Typography>
                            <StarIcon sx={{ fontSize: 16, color: '#faaf00' }} />
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{
                              flex: 1,
                              height: 10,
                              borderRadius: 5,
                              bgcolor: alpha('#faaf00', 0.1),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 5,
                                bgcolor: '#faaf00',
                              },
                            }}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 45, textAlign: 'right' }}>
                            {percentage}%
                          </Typography>
                        </Stack>
                      );
                    })}
                  </Stack>
                </Card>
              </Box>

              {/* Reviews List - Right */}
              <Box sx={{ flex: 1 }}>
                {/* Reviews Header with Sort */}
                <Stack 
                  direction="row" 
                  justifyContent="space-between" 
                  alignItems="center" 
                  sx={{ mb: 3 }}
                >
                  <Typography variant="h5" fontWeight={700}>
                    Student Reviews
                  </Typography>
                  {course.reviews?.length > 0 && (
                    <ToggleButtonGroup
                      value={reviewSort}
                      exclusive
                      onChange={(e, newValue) => newValue && setReviewSort(newValue)}
                      size="small"
                      sx={{
                        '& .MuiToggleButton-root': {
                          px: 2,
                          py: 0.5,
                          fontSize: '0.875rem',
                          textTransform: 'none',
                        },
                      }}
                    >
                      <ToggleButton value="recent">
                        <SortIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        Most Recent
                      </ToggleButton>
                      <ToggleButton value="highest">Highest Rated</ToggleButton>
                      <ToggleButton value="lowest">Lowest Rated</ToggleButton>
                    </ToggleButtonGroup>
                  )}
                </Stack>

                {course.reviews?.length > 0 ? (
                  <Stack spacing={3}>
                    {(showAllReviews ? getSortedReviews() : getSortedReviews().slice(0, 5)).map((review) => {
                      const isOwnReview = isAuthenticated && review.learnerPhone === user?.phone;
                      return (
                        <Card
                          key={review.id}
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            border: isOwnReview ? `1px solid ${theme.palette.primary.main}` : '1px solid',
                            borderColor: 'divider',
                            bgcolor: isOwnReview ? alpha(theme.palette.primary.main, 0.02) : 'background.paper',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                            },
                          }}
                        >
                          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                            <Avatar 
                              src={review.learnerImage} 
                              sx={{ 
                                width: 48, 
                                height: 48,
                                border: `2px solid ${isOwnReview ? theme.palette.primary.main : 'transparent'}`,
                              }}
                            >
                              {review.learnerName?.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                <Typography fontWeight={600} fontSize="0.95rem">
                                  {review.learnerName}
                                </Typography>
                                {isOwnReview && (
                                  <Chip 
                                    label="You" 
                                    size="small" 
                                    color="primary"
                                    sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }} 
                                  />
                                )}
                              </Stack>
                              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                <Rating 
                                  value={review.star} 
                                  readOnly 
                                  size="small"
                                  sx={{
                                    '& .MuiRating-iconFilled': {
                                      color: '#faaf00',
                                    },
                                  }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {review.formattedTime}
                                </Typography>
                              </Stack>
                            </Box>
                            {isOwnReview && (
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  setReviewMenuAnchor(e.currentTarget);
                                  setSelectedReviewId(review.id);
                                }}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Stack>
                          {review.review && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                lineHeight: 1.8,
                                color: 'text.primary',
                                whiteSpace: 'pre-wrap',
                              }}
                            >
                              {review.review}
                            </Typography>
                          )}
                          {!review.review && (
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                              No review text provided
                            </Typography>
                          )}
                        </Card>
                      );
                    })}
                    
                    {/* Load More Reviews */}
                    {course.reviews.length > 5 && !showAllReviews && (
                      <Box sx={{ textAlign: 'center', pt: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={() => setShowAllReviews(true)}
                          sx={{ textTransform: 'none' }}
                        >
                          Show All {course.reviews.length} Reviews
                        </Button>
                      </Box>
                    )}
                    
                    {showAllReviews && course.reviews.length > 5 && (
                      <Box sx={{ textAlign: 'center', pt: 2 }}>
                        <Button
                          variant="text"
                          onClick={() => setShowAllReviews(false)}
                          sx={{ textTransform: 'none' }}
                        >
                          Show Less
                        </Button>
                      </Box>
                    )}
                  </Stack>
                ) : (
                  <Card
                    elevation={0}
                    sx={{
                      p: 6,
                      borderRadius: 2,
                      border: '1px dashed',
                      borderColor: 'divider',
                      textAlign: 'center',
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                    }}
                  >
                    <QuoteIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      No reviews yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Be the first to share your experience with this course
                    </Typography>
                    {isAuthenticated && (
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<StarIcon />}
                        onClick={() => handleOpenRatingDialog()}
                        sx={{ textTransform: 'none', px: 4 }}
                      >
                        Write a Review
                      </Button>
                    )}
                  </Card>
                )}
              </Box>
            </Stack>
          </Box>
        )}

        {/* Rating Dialog */}
        <Dialog 
          open={ratingDialogOpen} 
          onClose={handleCloseRatingDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography component="div" variant="h6" fontWeight={700}>
              {course?.userRating ? 'Edit Your Rating' : 'Rate This Course'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {course?.title}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={4} sx={{ mt: 2 }}>
              {/* Star Rating */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  How would you rate this course? *
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Rating
                    value={ratingStar}
                    onChange={(event, newValue) => setRatingStar(newValue || 0)}
                    size="large"
                    sx={{
                      fontSize: '3rem',
                      '& .MuiRating-iconFilled': {
                        color: '#faaf00',
                      },
                      '& .MuiRating-iconHover': {
                        color: '#faaf00',
                      },
                    }}
                  />
                  {ratingStar > 0 && (
                    <Typography variant="h6" color="text.secondary">
                      {ratingStar === 5 && 'Excellent!'}
                      {ratingStar === 4 && 'Good'}
                      {ratingStar === 3 && 'Average'}
                      {ratingStar === 2 && 'Poor'}
                      {ratingStar === 1 && 'Very Poor'}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Review Text */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  Share your experience (Optional)
                </Typography>
                <TextField
                  multiline
                  rows={6}
                  value={ratingReview}
                  onChange={(e) => setRatingReview(e.target.value)}
                  placeholder="What did you like or dislike about this course? Share your thoughts to help other students..."
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                  inputProps={{
                    maxLength: 1000,
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'right' }}>
                  {ratingReview.length} / 1000 characters
                </Typography>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button 
              onClick={handleCloseRatingDialog} 
              disabled={submittingRating}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRating}
              variant="contained"
              disabled={submittingRating || ratingStar === 0}
              sx={{ 
                textTransform: 'none',
                px: 4,
                minWidth: 120,
              }}
            >
              {submittingRating ? 'Submitting...' : course?.userRating ? 'Update Rating' : 'Submit Rating'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Review Menu (Edit/Delete) */}
        <Menu
          anchorEl={reviewMenuAnchor}
          open={Boolean(reviewMenuAnchor)}
          onClose={() => {
            setReviewMenuAnchor(null);
            setSelectedReviewId(null);
          }}
          PaperProps={{
            sx: {
              borderRadius: 2,
              minWidth: 150,
            },
          }}
        >
          <MenuItem
            onClick={() => {
              const review = course.reviews?.find(r => r.id === selectedReviewId);
              if (review) {
                handleOpenRatingDialog(review);
              }
              setReviewMenuAnchor(null);
              setSelectedReviewId(null);
            }}
          >
            <EditIcon sx={{ fontSize: 18, mr: 1.5, color: 'primary.main' }} />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleDeleteRating(selectedReviewId);
              setReviewMenuAnchor(null);
              setSelectedReviewId(null);
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ fontSize: 18, mr: 1.5 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default CourseDetail;
