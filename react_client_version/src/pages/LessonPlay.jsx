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
  TextField,
  Chip,
  Alert,
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
  ChatBubbleOutline as CommentIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
} from '@mui/icons-material';

import VimeoPlayer from '../components/VideoPlayer/VimeoPlayer';
import CommentItem from '../components/CommentItem/CommentItem';
import { discussionAPI } from '../services/api';

// Format number to K, M format
const formatCount = (count) => {
  if (!count || count === 0) return '0';
  if (count < 1000) return count.toString();
  if (count < 1000000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
};

// Curriculum Sidebar Item
const CurriculumItem = ({ lesson, isActive, onClick, isLearned }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isVip = lesson.isVip === true || lesson.isVip === 1;
  const hasAccess = lesson.hasAccess !== false; // Default to true if not specified
  const isLocked = isVip && !hasAccess;
  
  const handleClick = () => {
    if (isLocked) {
      // Navigate to VIP plan page if lesson is locked
      navigate('/vip-plan');
    } else {
      onClick();
    }
  };
  
  return (
    <ListItem
      onClick={handleClick}
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
        ) : (lesson.isVideo || lesson.type === 'video') ? (
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
              {lesson.title}
            </Typography>
            {isLearned && !isLocked && (
              <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main', flexShrink: 0 }} />
            )}
            {isVip && !hasAccess && (
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
      {lesson.duration > 0 && (lesson.isVideo === 1 || lesson.isVideo === true) && !isLocked && (
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          {Math.round(lesson.duration / 60)} min
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
  const { isAuthenticated, user } = useAuth();
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
  const [likeCount, setLikeCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [comments, setComments] = useState([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [vipAccessError, setVipAccessError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadLesson = async () => {
      setLoading(true);
      setLiked(false);
      setLikeCount(0);
      setShareCount(0);
      setVipAccessError(null);
      try {
        const [courseRes, lessonData] = await Promise.all([
          courseAPI.getDetail(parseInt(courseId), user?.phone || null),
          lessonAPI.getDetail(currentLessonId, parseInt(courseId), user?.phone || null),
        ]);

        // Check if lesson requires VIP access
        if (lessonData.success === false && lessonData.requiresSubscription === true) {
          setVipAccessError('This lesson requires a VIP subscription. Please subscribe to access this content.');
          setLoading(false);
          return;
        }

        const course = courseRes.data || courseRes;
        const lesson = lessonData.lesson || lessonData;

        setLessonDetail({
          lesson: lesson,
          course: course,
          curriculum: course.curriculum || [],
        });

        // Mark lesson as learned when user views it (for both video and document lessons)
        if (isAuthenticated && user?.phone && lesson.learned !== 1) {
          try {
            await lessonAPI.markLearned(currentLessonId);
            // Update learned status in state
            setLessonDetail(prev => prev ? {
              ...prev,
              lesson: { ...prev.lesson, learned: 1 },
              curriculum: prev.curriculum?.map(cat => ({
                ...cat,
                lessons: cat.lessons?.map(l => l.id === currentLessonId ? { ...l, learned: 1 } : l)
              }))
            } : null);
          } catch (err) {
            console.error('Failed to mark lesson as learned:', err);
            // Don't block UI if this fails
          }
        }

        // Fetch comments and post detail if this is a video lesson with postId and vimeo (indicating valid post)
        if (lesson.postId && lesson.vimeo && (lesson.isVideo === 1 || lesson.isVideo === true)) {
          try {
            // Fetch comments and post detail in parallel, but handle 404 gracefully
            const promises = [
              discussionAPI.getComments(lesson.postId, user?.phone || null).catch(() => ({ data: { comments: [] } })),
              // Use getLessonPostDetail for lesson posts (allows hide = 1)
              discussionAPI.getLessonPostDetail(lesson.postId, user?.phone || null).catch(() => null)
            ];
            
            const [commentsResponse, postDetailResponse] = await Promise.all(promises);
            setComments(commentsResponse.data?.comments || []);
            
            // Update like status and counts from post detail (only if post exists)
            if (postDetailResponse && postDetailResponse.data?.post) {
              const post = postDetailResponse.data.post;
              setLiked(post.isLiked === 1);
              setLikeCount(post.postLikes || 0);
              setShareCount(post.shareCount || 0);
            } else {
              // Post doesn't exist, use values from lesson data or reset
              setLiked(false);
              setLikeCount(lesson.likeCount || 0);
              setShareCount(0);
            }
          } catch (err) {
            // Only log if it's not a 404 (expected for lessons without posts)
            if (err.status !== 404 && !err.message?.includes('404')) {
              console.error('Failed to fetch comments or post detail:', err);
            }
            setComments([]);
            setLiked(false);
            setLikeCount(lesson.likeCount || 0);
            setShareCount(0);
          }
        } else {
          // No post associated, use lesson data for like count if available
          setComments([]);
          setLiked(false);
          setLikeCount(lesson.likeCount || 0);
          setShareCount(0);
        }
      } catch (err) {
        console.error('Failed to load lesson detail or course curriculum:', err);
        // Check if error is due to VIP access
        if (err.response?.status === 403 || err.response?.data?.requiresSubscription === true) {
          setVipAccessError('This lesson requires a VIP subscription. Please subscribe to access this content.');
        } else {
          setVipAccessError('Failed to load lesson. Please try again.');
        }
        setLessonDetail(null);
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentLessonId, courseId, isAuthenticated, navigate, user?.phone]);

  const handleLessonClick = (newLessonId) => {
    // Check if the lesson is VIP and user doesn't have access
    const lesson = lessonDetail?.curriculum
      ?.flatMap(day => day.lessons || [])
      .find(l => l.id === newLessonId);
    
    if (lesson && lesson.isVip && !lesson.hasAccess) {
      // Navigate to VIP plan page
      navigate('/vip-plan');
      return;
    }
    
    setCurrentLessonId(newLessonId);
    if (!isDesktop) setMobileSidebarOpen(false);
  };

  // Comment tree manipulation helpers
  const updateCommentInTree = (list, commentId, updater) => {
    return list.map((c) => {
      if (c.time === commentId) return updater(c);
      if (c.replies?.length) return { ...c, replies: updateCommentInTree(c.replies, commentId, updater) };
      return c;
    });
  };

  const removeCommentFromTree = (list, commentId) => {
    return list.filter((c) => c.time !== commentId).map((c) => {
      if (c.replies?.length) return { ...c, replies: removeCommentFromTree(c.replies, commentId) };
      return c;
    });
  };

  const addReplyToTree = (list, parentId, newComment) => {
    return list.map((c) => {
      if (c.time === parentId) return { ...c, replies: [...(c.replies || []), newComment] };
      if (c.replies?.length) return { ...c, replies: addReplyToTree(c.replies, parentId, newComment) };
      return c;
    });
  };

  // Comment handlers
  const handleLikeComment = async (commentTime, isLiked) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!lessonDetail?.lesson?.postId) return;
    try {
      const result = await discussionAPI.likeComment(lessonDetail.lesson.postId, commentTime);
      if (result.data) {
        setComments((prev) => updateCommentInTree(prev, commentTime, (c) => ({
          ...c, likes: result.data.count, isLiked: result.data.isLiked ? 1 : 0,
        })));
      }
    } catch (err) { console.error('Like comment error:', err); }
  };

  const handleDeleteComment = async (pId, commentId) => {
    try {
      const result = await discussionAPI.deleteComment(pId, commentId);
      setComments((prev) => removeCommentFromTree(prev, commentId));
      if (result.data?.commentsCount !== undefined && lessonDetail) {
        setLessonDetail(prev => ({
          ...prev,
          lesson: { ...prev.lesson, comments: result.data.commentsCount }
        }));
      }
    } catch (err) {
      console.error('Delete comment error:', err);
    }
  };

  const handleUpdateComment = async (pId, commentId, body) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      const result = await discussionAPI.updateComment(pId, commentId, body);
      if (result.success) {
        setComments((prev) => updateCommentInTree(prev, commentId, (c) => ({
          ...c,
          body: body,
        })));
      }
    } catch (err) {
      console.error('Update comment error:', err);
    }
  };

  const handleReplySubmit = async (parentId, body) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!lessonDetail?.lesson?.postId) return;
    
    // Create optimistic reply immediately
    const optimisticReply = {
      id: 0,
      postId: lessonDetail.lesson.postId,
      writerId: user?.phone || '',
      body: body,
      image: '',
      time: Date.now(), // Temporary timestamp
      parent: parentId,
      likes: 0,
      userName: user?.name || user?.learner_name || 'You',
      userImage: user?.image || user?.learner_image || 'https://www.calamuseducation.com/uploads/placeholder.png',
      isLiked: 0,
      replies: [],
    };
    
    // Add optimistic reply to tree immediately
    setComments((prev) => addReplyToTree(prev, parentId, optimisticReply));
    if (lessonDetail) {
      setLessonDetail(prev => ({
        ...prev,
        lesson: { ...prev.lesson, comments: (prev.lesson.comments || 0) + 1 }
      }));
    }
    
    try {
      const result = await discussionAPI.createComment({ 
        postId: lessonDetail.lesson.postId, 
        body, 
        parent: parentId 
      });
      if (result.data?.comment) {
        // Replace optimistic reply with real one from server
        setComments((prev) => {
          // First remove optimistic reply
          const withoutOptimistic = prev.map((c) => {
            if (c.time === parentId) {
              return {
                ...c,
                replies: c.replies?.filter((r) => r.time !== optimisticReply.time) || []
              };
            }
            if (c.replies?.length) {
              return {
                ...c,
                replies: removeCommentFromTree(c.replies, optimisticReply.time)
              };
            }
            return c;
          });
          // Then add real reply
          return addReplyToTree(withoutOptimistic, parentId, result.data.comment);
        });
      }
    } catch (err) {
      console.error('Reply submit error:', err);
      // Revert optimistic update on error
      setComments((prev) => {
        return prev.map((c) => {
          if (c.time === parentId) {
            return {
              ...c,
              replies: c.replies?.filter((r) => r.time !== optimisticReply.time) || []
            };
          }
          if (c.replies?.length) {
            return {
              ...c,
              replies: removeCommentFromTree(c.replies, optimisticReply.time)
            };
          }
          return c;
        });
      });
      if (lessonDetail) {
        setLessonDetail(prev => ({
          ...prev,
          lesson: { ...prev.lesson, comments: Math.max(0, (prev.lesson.comments || 0) - 1) }
        }));
      }
    }
  };

  const handleSubmitComment = async () => {
    const body = commentText.trim();
    if (!body) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!lessonDetail?.lesson?.postId) return;
    
    // Clear input immediately
    const commentTextToSubmit = body;
    setCommentText('');
    setCommentSubmitting(true);
    
    // Optimistic update - add comment immediately
    const optimisticComment = {
      id: 0,
      postId: lessonDetail.lesson.postId,
      writerId: user?.phone || '',
      body: commentTextToSubmit,
      image: '',
      time: Date.now(), // Temporary timestamp
      parent: 0,
      likes: 0,
      userName: user?.name || user?.learner_name || 'You',
      userImage: user?.image || user?.learner_image || 'https://www.calamuseducation.com/uploads/placeholder.png',
      isLiked: 0,
      replies: [],
    };
    
    setComments((prev) => [optimisticComment, ...prev]);
    if (lessonDetail) {
      setLessonDetail(prev => ({
        ...prev,
        lesson: { ...prev.lesson, comments: (prev.lesson.comments || 0) + 1 }
      }));
    }
    
    try {
      const result = await discussionAPI.createComment({ 
        postId: lessonDetail.lesson.postId, 
        body: commentTextToSubmit 
      });
      if (result.data?.comment) {
        // Replace optimistic comment with real one from server
        setComments((prev) => {
          const filtered = prev.filter((c) => c.time !== optimisticComment.time);
          return [result.data.comment, ...filtered];
        });
      }
    } catch (err) {
      console.error('Submit comment error:', err);
      // Revert optimistic update on error
      setComments((prev) => prev.filter((c) => c.time !== optimisticComment.time));
      if (lessonDetail) {
        setLessonDetail(prev => ({
          ...prev,
          lesson: { ...prev.lesson, comments: Math.max(0, (prev.lesson.comments || 0) - 1) }
        }));
      }
      setCommentText(commentTextToSubmit); // Restore text
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!lessonDetail?.lesson?.postId) return;
    
    // Optimistic update
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikeCount(newLikedState ? likeCount + 1 : likeCount - 1);
    
    try {
      const result = await discussionAPI.likePost(lessonDetail.lesson.postId);
      if (result.success && result.count !== undefined) {
        setLikeCount(result.count);
        setLiked(result.isLiked);
      }
    } catch (err) {
      // Revert on error
      setLiked(!newLikedState);
      setLikeCount(newLikedState ? likeCount - 1 : likeCount + 1);
      console.error('Like error:', err);
    }
  };
  
  const handleShare = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!lessonDetail?.lesson?.postId) return;
    
    setSharing(true);
    try {
      const result = await discussionAPI.sharePost(lessonDetail.lesson.postId);
      if (result.success) {
        if (result.data?.alreadyShared) {
          // Already shared - show message or handle as needed
          console.log('Already shared');
        } else {
          // Update share count
          setShareCount(prev => prev + 1);
        }
        
        // Also try native share if available
        if (navigator.share) {
          try {
            await navigator.share({
              title: lessonDetail?.lesson?.title,
              url: window.location.href,
            });
          } catch (shareErr) {
            // User cancelled or error - that's okay
            if (shareErr.name !== 'AbortError') {
              console.error('Share error:', shareErr);
            }
          }
        }
      }
    } catch (err) {
      console.error('Share error:', err);
    } finally {
      setSharing(false);
    }
  };
  const handleBack = () => navigate(`/course/${courseId}`);

  // Loading skeleton — matches WatchVideo layout
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#fff', p: { xs: 0, sm: 2, lg: 3 } }}>
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
  if (!lessonDetail && !vipAccessError) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#fff',
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

  // If VIP access error, show error message with subscribe button
  if (vipAccessError && !lessonDetail) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#fff', p: { xs: 2, sm: 3 } }}>
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
          <Alert 
            severity="warning" 
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => navigate('/vip-plan')}
              >
                Subscribe Now
              </Button>
            }
            sx={{ mb: 2 }}
          >
            {vipAccessError}
          </Alert>
          <Button 
            variant="contained" 
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Back to Course
          </Button>
        </Box>
      </Box>
    );
  }

  const { lesson, course, curriculum } = lessonDetail || { lesson: null, course: null, curriculum: [] };

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
                isLearned={lsn.learned === 1}
                onClick={() => handleLessonClick(lsn.id)}
              />
            ))}
          </Box>
        ))}
      </List>
    </Paper>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
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
        {/* Left Column — Video Player & Info & Comments OR Document Viewer */}
        <Box sx={{ flex: 1, minWidth: 0, maxWidth: showSidebar ? 'calc(100% - 374px)' : '100%' }}>
          {/* VIP Access Error Message (if lessonDetail exists but lesson is VIP) */}
          {vipAccessError && lessonDetail && (
            <Alert 
              severity="warning" 
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={() => navigate('/vip-plan')}
                >
                  Subscribe
                </Button>
              }
              sx={{ mb: 2 }}
            >
              {vipAccessError}
            </Alert>
          )}
          
          {/* Video Lesson: Show Video Player & Info & Comments */}
          {lesson && (lesson.isVideo === 1 || lesson.isVideo === true) ? (
            <>
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
                        {formatCount(likeCount)}
                      </Button>
                    </Tooltip>

                    {/* Share Button */}
                    <Tooltip title="Share" arrow>
                      <Button
                        onClick={handleShare}
                        disabled={sharing}
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
                        Share{shareCount > 0 && ` (${formatCount(shareCount)})`}
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

                {/* Comments Section — Full CRUD functionality */}
                {lesson.postId && (
                  <Paper 
                    elevation={0}
                    sx={{ 
                      mt: 2, 
                      borderRadius: 4,
                      border: 'none',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      p: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Comments ({comments.length})
                    </Typography>
                    
                    {/* Comment Input */}
                    <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
                      <Avatar
                        src={user?.image || user?.learner_image || 'https://www.calamuseducation.com/uploads/placeholder.png'}
                        sx={{ width: 36, height: 36 }}
                      />
                      <TextField
                        size="small"
                        placeholder="Write a comment..."
                        fullWidth
                        multiline
                        maxRows={4}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '20px',
                            bgcolor: 'grey.100',
                            '& fieldset': { border: 'none' },
                          },
                        }}
                      />
                      <IconButton 
                        color="primary" 
                        onClick={handleSubmitComment}
                        disabled={!commentText.trim() || commentSubmitting}
                      >
                        <SendIcon />
                      </IconButton>
                    </Stack>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    {/* Comments List */}
                    {comments.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CommentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body1" color="text.secondary">
                          No comments yet
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                          Be the first to comment!
                        </Typography>
                      </Box>
                    ) : (
                      comments.map((comment) => (
                        <CommentItem
                          key={comment.id || comment.time}
                          postId={lesson.postId}
                          comment={comment}
                          currentUserId={user?.phone}
                          onLikeComment={handleLikeComment}
                          onDeleteComment={isAuthenticated ? handleDeleteComment : null}
                          onUpdateComment={isAuthenticated ? handleUpdateComment : null}
                          onReplySubmit={isAuthenticated ? handleReplySubmit : null}
                          isAuthenticated={!!isAuthenticated}
                        />
                      ))
                    )}
                  </Paper>
                )}
              </Box>
            </>
          ) : (
            /* Document Lesson: Show ONLY Document Viewer (full column) */
            <Box
              sx={{
                width: '100%',
                bgcolor: 'background.paper',
                borderRadius: { xs: 0, lg: 2 },
                overflow: 'hidden',
                border: 'none',
                boxShadow: { xs: 'none', lg: '0 2px 12px rgba(0,0,0,0.06)' },
                position: 'relative',
              }}
            >
              {/* Curriculum toggle button for mobile - positioned at top right */}
              {!isDesktop && (
                <Tooltip title="Curriculum" arrow>
                  <IconButton
                    onClick={() => setMobileSidebarOpen(true)}
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
              
              {lesson.documentUrl ? (
                <Box
                  component="iframe"
                  src={lesson.documentUrl}
                  sx={{
                    width: '100%',
                    border: 'none',
                    display: 'block',
                  }}
                  title={lesson.title}
                  allowFullScreen
                  onLoad={(e) => {
                    // Resize iframe to match content height
                    try {
                      const iframe = e.target;
                      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                      if (iframeDoc && iframeDoc.body) {
                        const height = Math.max(
                          iframeDoc.body.scrollHeight,
                          iframeDoc.body.offsetHeight,
                          iframeDoc.documentElement.clientHeight,
                          iframeDoc.documentElement.scrollHeight,
                          iframeDoc.documentElement.offsetHeight
                        );
                        iframe.style.height = height + 'px';
                      }
                    } catch (err) {
                      // Cross-origin restriction - set a reasonable default height
                      e.target.style.height = '1200px';
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
                    minHeight: '400px',
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
                </Box>
              )}
            </Box>
          )}

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
