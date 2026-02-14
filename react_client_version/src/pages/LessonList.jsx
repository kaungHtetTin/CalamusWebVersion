import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardActionArea,
  Skeleton,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemButton,
  Avatar,
  Breadcrumbs,
  Link,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Lock as LockIcon,
  Description as DocIcon,
  ChevronRight as ChevronRightIcon,
  Home as HomeIcon,
  AutoStories as BookIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { additionalLessonsAPI } from '../services/api';
import { useThemeMode } from '../context/ThemeContext';
import { alpha } from '@mui/material/styles';

// Format duration
const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Lesson Item Component
const LessonItem = ({ lesson, index, onClick }) => {
  const theme = useTheme();
  const isVideo = lesson.isVideo === 1;
  const isVip = lesson.isVip === 1;
  
  return (
    <Card
      elevation={0}
      sx={{
        mb: 1,
        borderRadius: 2,
        border: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        bgcolor: 'background.paper',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
          bgcolor: theme.palette.mode === 'light' ? alpha(theme.palette.grey[50], 0.5) : alpha(theme.palette.common.white, 0.02),
        },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ p: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          {/* Number */}
          <Typography
            variant="body2"
            color="text.disabled"
            sx={{ 
              width: 24, 
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            {index + 1}
          </Typography>
          
          {/* Icon */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isVideo ? (
              <PlayIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            ) : (
              <DocIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            )}
          </Box>
          
          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body1"
              fontWeight={500}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {lesson.title_mini || lesson.title}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="caption" color="text.secondary">
                {isVideo ? 'Video' : 'Document'}
              </Typography>
              {lesson.duration > 0 && (
                <>
                  <Typography variant="caption" color="text.disabled">·</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDuration(lesson.duration)}
                  </Typography>
                </>
              )}
            </Stack>
          </Box>
          
          {/* VIP Badge */}
          {isVip && (
            <Chip
              icon={<LockIcon sx={{ fontSize: '14px !important' }} />}
              label="VIP"
              size="small"
              sx={{
                height: 24,
                fontSize: 11,
                bgcolor: 'grey.100',
                color: 'text.secondary',
              }}
            />
          )}
        </Stack>
      </CardActionArea>
    </Card>
  );
};

// Sidebar Category Item
const SidebarItem = ({ category, isActive, onClick }) => {
  const theme = useTheme();
  
  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        onClick={onClick}
        sx={{
          borderRadius: 1.5,
          py: 1,
          px: 1.5,
          bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
          color: isActive ? theme.palette.primary.main : 'text.primary',
          transition: 'all 0.15s ease',
          '&:hover': {
            bgcolor: isActive ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.text.primary, 0.04),
          },
          borderLeft: isActive ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
          <Avatar
            src={category.image_url}
            variant="rounded"
            sx={{ 
              width: 32, 
              height: 32, 
              borderRadius: 1,
              border: isActive ? `1px solid ${theme.palette.primary.main}` : 'none'
            }}
          />
          <Typography
            variant="body2"
            sx={{
              flex: 1,
              fontWeight: isActive ? 700 : 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '0.85rem',
            }}
          >
            {category.category_title}
          </Typography>
          {isActive && <ChevronRightIcon sx={{ fontSize: 18, color: 'primary.main' }} />}
        </Stack>
      </ListItemButton>
    </ListItem>
  );
};

// Loading Skeleton
const LoadingSkeleton = () => (
  <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
    <Skeleton variant="text" width={200} sx={{ mb: 3 }} />
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
      <Skeleton variant="rounded" width={56} height={56} />
      <Box>
        <Skeleton variant="text" width={200} height={32} />
        <Skeleton variant="text" width={100} />
      </Box>
    </Stack>
    <Box sx={{ display: 'flex', gap: 4, width: '100%' }}>
      <Box sx={{ flex: 1 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="rounded" height={64} sx={{ mb: 1, borderRadius: 1.5 }} />
        ))}
      </Box>
      <Box sx={{ width: 280, flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} />
      </Box>
    </Box>
  </Container>
);

const LessonList = () => {
  const { channel = 'english', categoryId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [category, setCategory] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [sidebarCourses, setSidebarCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await additionalLessonsAPI.getLessons(categoryId);
        setCategory(response.data.category);
        setLessons(response.data.lessons || []);
        setSidebarCourses(response.data.sidebarCourses || []);
      } catch (err) {
        console.error('Failed to fetch lessons:', err);
        setError('Failed to load lessons');
      } finally {
        setLoading(false);
      }
    };
    
    if (categoryId) {
      fetchLessons();
    }
  }, [categoryId]);
  
  const handleBack = () => {
    navigate(`/additional-lessons/${channel}`);
  };
  
  const handleLessonClick = (lesson, index) => {
    if (lesson.isVideo === 1) {
      navigate(`/watch/${lesson.id}?channel_id=${categoryId}&index=${index}`);
    } else {
      navigate(`/additional-lessons/${channel}/category/${categoryId}/lesson/${lesson.id}`);
    }
  };
  
  const handleCategoryChange = (catId) => {
    navigate(`/additional-lessons/${channel}/category/${catId}`);
  };
  
  if (loading) {
    return <LoadingSkeleton />;
  }
  
  if (error || !category) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 }, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {error || 'Category not found'}
        </Typography>
        <Button onClick={handleBack} startIcon={<BackIcon />} sx={{ mt: 2 }}>
          Go back
        </Button>
      </Container>
    );
  }
  
  const channelLabel = channel === 'korea' ? 'Korean' : 'English';
  
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          sx={{ mb: 3 }}
          separator={<ChevronRightIcon sx={{ fontSize: 14, opacity: 0.5 }} />}
        >
          <Link
            component={RouterLink}
            to="/"
            underline="hover"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
              fontSize: '0.8125rem',
              fontWeight: 500,
              '&:hover': { color: 'primary.main' },
            }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Home
          </Link>
          <Link
            component={RouterLink}
            to={`/additional-lessons/${channel}`}
            underline="hover"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
              fontSize: '0.8125rem',
              fontWeight: 500,
              '&:hover': { color: 'primary.main' },
            }}
          >
            <BookIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Additional Lessons
          </Link>
          <Typography
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.primary',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            {category.category_title}
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={category.image_url}
              variant="rounded"
              sx={{ width: 56, height: 56, borderRadius: 2 }}
            />
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-1px', mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                {category.category_title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {channelLabel} · {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
              </Typography>
            </Box>
          </Stack>
        </Box>
        
        {/* Content */}
        <Box sx={{ display: 'flex', gap: 4, width: '100%' }}>
          {/* Lessons */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {lessons.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography color="text.secondary">
                  No lessons available
                </Typography>
              </Box>
            ) : (
              lessons.map((lesson, index) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  onClick={() => handleLessonClick(lesson, index)}
                />
              ))
            )}
          </Box>
          
          {/* Sidebar */}
          {!isMobile && sidebarCourses.length > 0 && (
            <Box sx={{ width: 280, flexShrink: 0 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: 'none',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  position: 'sticky',
                  top: 76, // updated to match new compact navbar height
                  bgcolor: 'background.paper',
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, px: 1 }}>
                  Browse topics
                </Typography>
                {sidebarCourses.map((course) => (
                  <Box key={course.course_id} sx={{ mb: 2 }}>
                    <Typography 
                      variant="caption" 
                      color="text.disabled"
                      sx={{ px: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}
                    >
                      {course.title}
                    </Typography>
                    <List disablePadding sx={{ mt: 0.5 }}>
                      {course.categories.map((cat) => (
                        <SidebarItem
                          key={cat.id}
                          category={cat}
                          isActive={cat.id === parseInt(categoryId)}
                          onClick={() => handleCategoryChange(cat.id)}
                        />
                      ))}
                    </List>
                  </Box>
                ))}
              </Paper>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default LessonList;
