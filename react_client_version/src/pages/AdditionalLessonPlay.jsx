import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Paper,
  Tooltip,
  useTheme,
  alpha,
  useMediaQuery,
  Drawer,
  Breadcrumbs,
  Link,
  Chip,
  Stack,
} from '@mui/material';
import {
  Videocam as VideoIcon,
  Description as DocumentIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  AutoStories as BookIcon,
  ArrowBack as BackIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useDrawer } from '../context/DrawerContext';
import { additionalLessonsAPI, getLessonDocumentUrl } from '../services/api';

const SIDEBAR_WIDTH = 350;

const LessonSidebarItem = ({ lesson, isActive, onClick }) => {
  const theme = useTheme();
  const isVideo = lesson.isVideo === 1;
  const isLocked = lesson.isVip && !lesson.hasAccess;

  return (
    <ListItem
      onClick={onClick}
      sx={{
        py: 1,
        px: 2,
        cursor: isLocked ? 'not-allowed' : 'pointer',
        opacity: isLocked ? 0.6 : 1,
        bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
        borderLeft: isActive ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: isLocked 
            ? alpha(theme.palette.error.main, 0.05) 
            : alpha(theme.palette.primary.main, 0.05),
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 32 }}>
        {isLocked ? (
          <LockIcon sx={{ fontSize: 18, color: 'error.main' }} />
        ) : isVideo ? (
          <VideoIcon sx={{ fontSize: 18, color: isActive ? 'primary.main' : 'text.secondary' }} />
        ) : (
          <DocumentIcon sx={{ fontSize: 18, color: isActive ? 'primary.main' : 'text.secondary' }} />
        )}
      </ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body2"
              sx={{
                flex: 1,
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'primary.main' : 'text.primary',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {lesson.title_mini || lesson.title}
            </Typography>
            {isLocked && (
              <Chip 
                label="VIP" 
                size="small" 
                sx={{ 
                  height: 18, 
                  fontSize: '0.65rem',
                  bgcolor: 'error.main',
                  color: 'white',
                  fontWeight: 600,
                  flexShrink: 0,
                }} 
              />
            )}
          </Box>
        }
      />
    </ListItem>
  );
};

export default function AdditionalLessonPlay() {
  const { channel, categoryId, lessonId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { drawerOpen, setDrawerOpen } = useDrawer();

  const [category, setCategory] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [sidebarCourses, setSidebarCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [vipAccessError, setVipAccessError] = useState(null);

  // Close the nav drawer by default on this page (same as Lesson Play / Watch Video)
  useEffect(() => {
    setDrawerOpen(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentLessonId = lessonId ? parseInt(lessonId, 10) : null;
  const currentLesson = lessons.find((l) => l.id === currentLessonId);
  const isDocumentLesson = currentLesson && currentLesson.isVideo !== 1;
  // Show lessons sidebar only on desktop when nav drawer is closed (same as Lesson Play / Watch Video)
  const showSidebar = isDesktop && !drawerOpen && lessons.length > 0;

  useEffect(() => {
    const fetch = async () => {
      if (!categoryId) return;
      try {
        setLoading(true);
        setVipAccessError(null);
        const response = await additionalLessonsAPI.getLessons(categoryId);
        setCategory(response.data.category);
        setLessons(response.data.lessons || []);
        setSidebarCourses(response.data.sidebarCourses || []);
        
        // Check if current lesson is locked
        if (currentLessonId) {
          const lesson = response.data.lessons?.find(l => l.id === currentLessonId);
          if (lesson && lesson.isVip && !lesson.hasAccess) {
            setVipAccessError('ဤသင်ခန်းစာသည် VIP သီးသန့်ဖြစ်ပါသည်။ ဆက်လက်လေ့လာရန် VIP အဖွဲ့ဝင်ဝင်ရောက်ရန် လိုအပ်ပါသည်။');
          }
        }
      } catch (err) {
        console.error('Failed to fetch lessons:', err);
        if (err.response?.status === 403) {
          setVipAccessError('ဤသင်ခန်းစာသည် VIP သီးသန့်ဖြစ်ပါသည်။ ဆက်လက်လေ့လာရန် VIP အဖွဲ့ဝင်ဝင်ရောက်ရန် လိုအပ်ပါသည်။');
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [categoryId, currentLessonId]);

  useEffect(() => {
    if (!loading && lessons.length > 0 && currentLessonId) {
      const lesson = lessons.find((l) => l.id === currentLessonId);
      if (lesson && lesson.isVideo === 1) {
        const index = lessons.findIndex((l) => l.id === currentLessonId);
        navigate(`/watch/${currentLessonId}?channel_id=${categoryId}&index=${index}`, { replace: true });
      }
    }
  }, [loading, lessons, currentLessonId, categoryId, navigate]);

  const handleLessonSelect = (lesson) => {
    if (lesson.isVip && !lesson.hasAccess) {
      navigate('/vip-plan');
      return;
    }
    if (lesson.isVideo === 1) {
      const index = lessons.findIndex((l) => l.id === lesson.id);
      navigate(`/watch/${lesson.id}?channel_id=${categoryId}&index=${index}`);
    } else {
      navigate(`/additional-lessons/${channel}/category/${categoryId}/lesson/${lesson.id}`);
    }
    setMobileDrawerOpen(false);
  };

  const handleBackToCategory = () => {
    navigate(`/additional-lessons/${channel}/category/${categoryId}`);
  };

  if (loading || !category) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
        <Skeleton variant="text" width={300} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (!currentLessonId || !currentLesson) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
        <Typography color="text.secondary" gutterBottom>Lesson not found.</Typography>
        <Button startIcon={<BackIcon />} onClick={handleBackToCategory}>Back to lessons</Button>
      </Box>
    );
  }

  if (!isDocumentLesson) {
    return null;
  }

  // Document lessons: HTML file by lesson id in uploads/lessons/html/ (same as Lesson Play page)
  const documentUrl = getLessonDocumentUrl(currentLesson.id);

  const sidebarContent = (
    <Paper
      sx={{
        height: 'auto',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
        <Typography variant="h6" fontWeight={700}>
          Lessons
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {category?.category_title}
        </Typography>
      </Box>
      <List disablePadding sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {lessons.map((lesson) => (
          <LessonSidebarItem
            key={lesson.id}
            lesson={lesson}
            isActive={lesson.id === currentLessonId}
            onClick={() => handleLessonSelect(lesson)}
          />
        ))}
      </List>
    </Paper>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ maxWidth: 1800, mx: 'auto', p: { xs: 2, sm: 2, md: 3 } }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" underline="hover" sx={{ display: 'flex', alignItems: 'center' }} color="inherit">
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" /> Home
          </Link>
          <Link component={RouterLink} to={`/additional-lessons/${channel}`} underline="hover" sx={{ display: 'flex', alignItems: 'center' }} color="inherit">
            <BookIcon sx={{ mr: 0.5 }} fontSize="small" /> Additional Lessons
          </Link>
          <Link underline="hover" component="button" onClick={handleBackToCategory} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', border: 'none', background: 'none', font: 'inherit' }} color="inherit">
            {category?.category_title}
          </Link>
          <Typography color="text.primary">{currentLesson.title_mini || currentLesson.title}</Typography>
        </Breadcrumbs>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: showSidebar ? 'row' : 'column',
          gap: showSidebar ? 3 : 0,
          maxWidth: 1800,
          mx: 'auto',
          px: { xs: 0, sm: 2, md: 3 },
          pb: 3,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0, maxWidth: showSidebar ? `calc(100% - ${SIDEBAR_WIDTH + 24}px)` : '100%' }}>
          {/* VIP Access Error Message */}
          {vipAccessError && (
            <Box sx={{ px: { xs: 2, lg: 0 }, mb: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 4,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.1),
                  bgcolor: '#fff'
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3
                  }}
                >
                  <LockIcon sx={{ fontSize: 40, color: 'error.main' }} />
                </Box>
                
                <Typography variant="h5" fontWeight={800} gutterBottom sx={{ color: 'text.primary' }}>
                  VIP Content Locked
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                  {vipAccessError}
                </Typography>
                
                <Stack spacing={2} sx={{ maxWidth: 300, mx: 'auto' }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => navigate('/vip-plan')}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '1rem',
                      boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                      '&:hover': {
                        boxShadow: `0 12px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                      }
                    }}
                  >
                    VIP အဖွဲ့ဝင်ဝင်မည်
                  </Button>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    onClick={handleBackToCategory}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: alpha(theme.palette.divider, 0.5),
                      color: 'text.secondary',
                      '&:hover': {
                        borderColor: 'text.primary',
                        bgcolor: 'transparent',
                        color: 'text.primary'
                      }
                    }}
                  >
                    သင်ခန်းစာများသို့ ပြန်သွားမည်
                  </Button>
                </Stack>
              </Paper>
            </Box>
          )}

          {!vipAccessError && (
            <Box
              sx={{
                width: '100%',
                bgcolor: 'background.paper',
                borderRadius: { xs: 0, lg: 2 },
                overflow: 'hidden',
                boxShadow: { xs: 'none', lg: '0 2px 12px rgba(0,0,0,0.06)' },
                position: 'relative',
              }}
            >
              {/* Curriculum toggle: only on small screens (same as Lesson Play document view) */}
              {!isDesktop && lessons.length > 0 && (
                <Tooltip title="Lessons" arrow>
                  <IconButton
                    onClick={() => setMobileDrawerOpen(true)}
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      zIndex: 10,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                </Tooltip>
              )}

              {documentUrl ? (
                <Box
                  component="iframe"
                  src={documentUrl}
                  sx={{
                    width: '100%',
                    minHeight: '80vh',
                    border: 'none',
                    display: 'block',
                  }}
                  title={currentLesson.title}
                  onLoad={(e) => {
                    try {
                      const iframe = e.target;
                      const doc = iframe.contentDocument || iframe.contentWindow?.document;
                      if (doc?.body) {
                        const height = Math.max(
                          doc.body.scrollHeight,
                          doc.body.offsetHeight,
                          doc.documentElement?.scrollHeight ?? 0,
                          doc.documentElement?.offsetHeight ?? 0
                        );
                        iframe.style.minHeight = height + 'px';
                      }
                    } catch (_) {
                      e.target.style.minHeight = '1200px';
                    }
                  }}
                />
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 400,
                    p: 4,
                    textAlign: 'center',
                  }}
                >
                  <DocumentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Document not available
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    The lesson document could not be loaded.
                  </Typography>
                  <Button startIcon={<BackIcon />} onClick={handleBackToCategory} sx={{ mt: 2 }}>
                    Back to lessons
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Right sidebar: curriculum (desktop only, when nav drawer is closed) */}
        {showSidebar && (
          <Box sx={{ width: SIDEBAR_WIDTH, minWidth: SIDEBAR_WIDTH }}>
            {sidebarContent}
          </Box>
        )}
      </Box>

      {/* Mobile lessons drawer (same as Lesson Play / Watch Video) */}
      {!isDesktop && (
        <Drawer
          anchor="right"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          PaperProps={{ sx: { width: 300 } }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={() => setMobileDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          {sidebarContent}
        </Drawer>
      )}
    </Box>
  );
}
