import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  ChevronRight as ChevronIcon,
  Home as HomeIcon,
  AutoStories as BookIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { additionalLessonsAPI } from '../services/api';

// Format duration
const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Lesson Item Component
const LessonItem = ({ lesson, index, onClick }) => {
  const isVideo = lesson.isVideo === 1;
  const isVip = lesson.isVip === 1;
  
  return (
    <Card
      elevation={0}
      sx={{
        mb: 1,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: 'grey.300',
          bgcolor: 'grey.50',
        },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          {/* Number */}
          <Typography
            variant="body2"
            color="text.disabled"
            sx={{ 
              width: 24, 
              textAlign: 'center',
              fontWeight: 500,
            }}
          >
            {index + 1}
          </Typography>
          
          {/* Icon */}
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isVideo ? (
              <PlayIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            ) : (
              <DocIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
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
                bgcolor: 'action.hover',
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
  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        onClick={onClick}
        sx={{
          borderRadius: 1.5,
          py: 1,
          px: 1.5,
          bgcolor: isActive ? 'action.selected' : 'transparent',
          '&:hover': {
            bgcolor: isActive ? 'action.selected' : 'action.hover',
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
          <Avatar
            src={category.image_url}
            variant="rounded"
            sx={{ width: 32, height: 32, borderRadius: 1 }}
          />
          <Typography
            variant="body2"
            sx={{
              flex: 1,
              fontWeight: isActive ? 600 : 400,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {category.category_title}
          </Typography>
          {isActive && <ChevronIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
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
      if (lesson.link) {
        window.open(lesson.link, '_blank');
      }
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
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            color="inherit"
            href="/"
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Home
          </Link>
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            color="inherit"
            onClick={handleBack}
          >
            <BookIcon sx={{ mr: 0.5 }} fontSize="small" />
            Additional Lessons
          </Link>
          <Typography color="text.primary">
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
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 0 }}>
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
                  border: '1px solid',
                  borderColor: 'divider',
                  position: 'sticky',
                  top: 80,
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
