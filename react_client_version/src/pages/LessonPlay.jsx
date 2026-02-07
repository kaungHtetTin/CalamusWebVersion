import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDrawer } from '../context/DrawerContext';
import { lessonAPI, courseAPI } from '../services/api';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Avatar,
  Tooltip,
  useTheme,
  alpha,
  useMediaQuery,
  Drawer,
  Divider,
  Paper,
} from '@mui/material';
import {
  Videocam as VideoIcon,
  Description as DocumentIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  School as SchoolIcon,
  ThumbUpOutlined as LikeIcon,
  ThumbUp as LikedIcon,
  Share as ShareIcon,
  MoreHoriz as MoreIcon,
} from '@mui/icons-material';

import VimeoPlayer from '../components/VideoPlayer/VimeoPlayer';
import Comments from '../components/Comments/Comments';

// Format number to K, M format
const formatCount = (count) => {
  if (!count || count === 0) return '0';
  if (count < 1000) return count.toString();
  if (count < 1000000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
};

// Curriculum Sidebar Item
const CurriculumItem = ({ lesson, isActive, onClick }) => {
  const theme = useTheme();
  return (
    <ListItem
      onClick={onClick}
      sx={{
        py: 1,
        px: 2,
        cursor: 'pointer',
        bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
        borderLeft: isActive ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.05),
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 32 }}>
        {(lesson.isVideo || lesson.type === 'video') ? (
          <VideoIcon sx={{ fontSize: 18, color: isActive ? 'primary.main' : 'text.secondary' }} />
        ) : (
          <DocumentIcon sx={{ fontSize: 18, color: isActive ? 'primary.main' : 'text.secondary' }} />
        )}
      </ListItemIcon>
      <ListItemText
        primary={lesson.title}
        primaryTypographyProps={{
          fontSize: '0.85rem',
          fontWeight: isActive ? 600 : 500,
          color: isActive ? 'primary.main' : 'text.primary',
          sx: {
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          },
        }}
      />
      {lesson.duration && (
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          {lesson.duration}m
        </Typography>
      )}
    </ListItem>
  );
};

export default function LessonPlay() {
  const { lessonId, courseId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { isAuthenticated } = useAuth();
  const { drawerOpen, setDrawerOpen } = useDrawer();

  // Close the nav drawer by default on this page
  useEffect(() => {
    setDrawerOpen(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Show curriculum sidebar only on desktop when nav drawer is closed
  const showSidebar = isDesktop && !drawerOpen;

  const [lessonDetail, setLessonDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLessonId, setCurrentLessonId] = useState(parseInt(lessonId));
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadLesson = async () => {
      setLoading(true);
      try {
        const [courseRes, lessonData] = await Promise.all([
          courseAPI.getDetail(parseInt(courseId)),
          lessonAPI.getDetail(currentLessonId, parseInt(courseId)),
        ]);

        const course = courseRes.data || courseRes;

        setLessonDetail({
          lesson: lessonData.lesson || lessonData,
          course: course,
          curriculum: course.curriculum || [],
        });
      } catch (err) {
        console.error('Failed to load lesson detail or course curriculum:', err);
        setLessonDetail(null);
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentLessonId, courseId, isAuthenticated, navigate]);

  const handleLessonClick = (newLessonId) => {
    setCurrentLessonId(newLessonId);
    if (!isDesktop) setMobileSidebarOpen(false);
  };

  const handleLike = () => setLiked(!liked);
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: lessonDetail?.lesson?.title, url: window.location.href });
    }
  };
  const handleBack = () => navigate(`/course/${courseId}`);

  // Loading skeleton — matches WatchVideo layout
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f9f9f9', p: { xs: 0, sm: 2, lg: 3 } }}>
        <Box sx={{ display: 'flex', gap: 3, maxWidth: 1800, mx: 'auto' }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="rectangular" sx={{ width: '100%', aspectRatio: '16/9', borderRadius: { xs: 0, lg: 2 } }} />
            <Box sx={{ p: 2 }}>
              <Skeleton variant="text" width="80%" height={28} />
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
          </Box>
          {isDesktop && (
            <Box sx={{ width: 350 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                  <Skeleton variant="circular" width={18} height={18} />
                  <Skeleton variant="text" width="80%" />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  // Error state
  if (!lessonDetail) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#f9f9f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <SchoolIcon sx={{ fontSize: 80, color: 'grey.300' }} />
        <Typography variant="h5" fontWeight={600}>
          Lesson not found
        </Typography>
        <Button variant="contained" onClick={handleBack}>
          Back to Course
        </Button>
      </Box>
    );
  }

  const { lesson, course, curriculum } = lessonDetail;

  // Curriculum sidebar content
  const sidebarContent = (
    <Paper
      sx={{
        height: 'auto',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
        <Typography variant="h6" fontWeight={700}>
          Course Curriculum
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {course.title}
        </Typography>
      </Box>
      <List disablePadding sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {curriculum?.map((day) => (
          <Box key={day.day}>
            <Box sx={{ px: 2, py: 1.5, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={600} fontSize="0.8rem">
                {`Day ${day.day} • ${day.lessonsCount} lectures • ${day.totalDuration}`}
              </Typography>
            </Box>
            {day.lessons?.map((lsn) => (
              <CurriculumItem
                key={lsn.id}
                lesson={lsn}
                isActive={lsn.id === currentLessonId}
                onClick={() => handleLessonClick(lsn.id)}
              />
            ))}
          </Box>
        ))}
      </List>
    </Paper>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: isDesktop ? '#f1f1f1' : '#fff' }}>
      {/* Main Layout Container — same as WatchVideo */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: showSidebar ? 'row' : 'column',
          gap: showSidebar ? 3 : 0,
          maxWidth: 1800,
          mx: 'auto',
          p: { xs: 0, sm: 2, md: 3 },
        }}
      >
        {/* Left Column — Video Player & Info & Comments */}
        <Box sx={{ flex: 1, minWidth: 0, maxWidth: showSidebar ? 'calc(100% - 374px)' : '100%' }}>
          {/* Video Player */}
          <VimeoPlayer
            src={lesson.vimeo || ''}
            title={lesson.title}
            onBack={handleBack}
          />

          {/* Video Info Section — matches WatchVideo */}
          <Box sx={{ p: { xs: 2, lg: 0 }, pt: { lg: 2 } }}>
            {/* Title */}
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                fontSize: { xs: '1rem', sm: '1.125rem' },
                lineHeight: 1.4,
                mb: 1.5,
              }}
            >
              {lesson.title}
            </Typography>

            {/* Channel Info & Actions Row — same as WatchVideo */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2,
                pb: 2,
                boxShadow: '0 1px 0 rgba(0,0,0,0.05)',
              }}
            >
              {/* Instructor Info */}
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  src={course.instructorImage || undefined}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'primary.main',
                    fontSize: '1rem',
                  }}
                >
                  {course.instructorName?.charAt(0) || 'C'}
                </Avatar>
                <Box>
                  <Typography fontWeight={600} sx={{ fontSize: '0.9rem' }}>
                    {course.instructorName || course.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {lesson.viewCount ? `${formatCount(lesson.viewCount)} views` : ''}{lesson.viewCount && lesson.duration ? ' • ' : ''}{lesson.duration ? `${Math.round(lesson.duration / 60)} min` : ''}
                  </Typography>
                </Box>
              </Stack>

              {/* Action Buttons */}
              <Stack direction="row" spacing={1} alignItems="center">
                {/* Like Button */}
                <Tooltip title="Like" arrow>
                  <Button
                    onClick={handleLike}
                    sx={{
                      minWidth: 'auto',
                      px: 2,
                      py: 0.75,
                      bgcolor: liked ? alpha(theme.palette.primary.main, 0.1) : alpha('#000', 0.05),
                      color: liked ? 'primary.main' : 'text.primary',
                      borderRadius: 5,
                      textTransform: 'none',
                      '&:hover': { bgcolor: alpha('#000', 0.1) },
                    }}
                    startIcon={liked ? <LikedIcon /> : <LikeIcon />}
                  >
                    {formatCount(lesson.likeCount)}
                  </Button>
                </Tooltip>

                {/* Share Button */}
                <Tooltip title="Share" arrow>
                  <Button
                    onClick={handleShare}
                    sx={{
                      minWidth: 'auto',
                      px: 2,
                      py: 0.75,
                      bgcolor: alpha('#000', 0.05),
                      color: 'text.primary',
                      borderRadius: 5,
                      textTransform: 'none',
                      '&:hover': { bgcolor: alpha('#000', 0.1) },
                    }}
                    startIcon={<ShareIcon sx={{ fontSize: 20 }} />}
                  >
                    Share
                  </Button>
                </Tooltip>

                {/* Curriculum toggle (mobile) */}
                {!isDesktop && (
                  <Tooltip title="Curriculum" arrow>
                    <IconButton
                      onClick={() => setMobileSidebarOpen(true)}
                      sx={{
                        bgcolor: alpha('#000', 0.05),
                        '&:hover': { bgcolor: alpha('#000', 0.1) },
                      }}
                    >
                      <MenuIcon />
                    </IconButton>
                  </Tooltip>
                )}

                {/* More Button */}
                <IconButton
                  sx={{
                    bgcolor: alpha('#000', 0.05),
                    '&:hover': { bgcolor: alpha('#000', 0.1) },
                  }}
                >
                  <MoreIcon />
                </IconButton>
              </Stack>
            </Box>

            {/* Lesson description (collapsible, if exists) */}
            {lesson.description && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: alpha('#000', 0.03),
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {lesson.description}
                </Typography>
              </Box>
            )}

            {/* Comments Section — same as WatchVideo */}
            <Comments
              commentCount={lesson.comments || 0}
              comment={comment}
              setComment={setComment}
              onSubmit={() => {
                if (comment.trim()) {
                  console.log('Submit comment:', comment);
                  setComment('');
                }
              }}
            />
          </Box>

          {/* Mobile curriculum is accessible via the Curriculum drawer button */}
        </Box>

        {/* Right Sidebar — Curriculum (Desktop only, hidden when drawer is open) */}
        {showSidebar && (
          <Box
            sx={{
              width: 350,
              minWidth: 350,
              maxWidth: 350,
            }}
          >
            {sidebarContent}
          </Box>
        )}
      </Box>

      {/* Mobile Curriculum Drawer */}
      {!isDesktop && (
        <Drawer
          anchor="right"
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          PaperProps={{ sx: { width: 300 } }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={() => setMobileSidebarOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          {sidebarContent}
        </Drawer>
      )}
    </Box>
  );
}
