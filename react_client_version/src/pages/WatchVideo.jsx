import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Skeleton,
  Stack,
  IconButton,
  useTheme,
  alpha,
  Button,
  Tooltip,
  Avatar,
  useMediaQuery,
  Drawer,
  Paper,
  TextField,
  Divider,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  ThumbUpOutlined as LikeIcon,
  ThumbUp as LikedIcon,
  Share as ShareIcon,
  VideoLibrary as VideoIcon,
  Close as CloseIcon,
  ChatBubbleOutline as CommentIcon,
  Send as SendIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { videoChannelAPI, discussionAPI } from '../services/api';
import { useDrawer } from '../context/DrawerContext';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import VimeoPlayer from '../components/VideoPlayer/VimeoPlayer';
import CommentItem from '../components/CommentItem/CommentItem';

// Format number to K, M format
const formatCount = (count) => {
  if (!count || count === 0) return '0';
  if (count < 1000) return count.toString();
  if (count < 1000000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
};

// Sidebar Video Item (YouTube style - compact horizontal card)
const SidebarVideoItem = React.forwardRef(({ video, isActive, onClick }, ref) => {
  const theme = useTheme();

  return (
    <Box
      ref={ref}
      onClick={onClick}
      sx={{
        display: 'flex',
        gap: 0.75,
        cursor: 'pointer',
        p: 0.5,
        borderRadius: 1,
        bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateX(4px)',
          bgcolor: theme.palette.mode === 'light' ? alpha(theme.palette.grey[100], 0.8) : alpha(theme.palette.common.white, 0.05),
        },
      }}
    >
      {/* Thumbnail - compact size */}
      <Box
        sx={{
          position: 'relative',
          width: 120,
          minWidth: 120,
          aspectRatio: '16/9',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: theme.palette.mode === 'light' ? 'grey.200' : 'grey.900',
        }}
      >
        {video.thumbnail ? (
          <Box
            component="img"
            src={video.thumbnail}
            alt={video.title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <VideoIcon sx={{ fontSize: 18, color: 'primary.main', opacity: 0.5 }} />
          </Box>
        )}

        {/* Duration badge */}
        {video.formattedDuration && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              bgcolor: 'rgba(0,0,0,0.8)',
              color: 'white',
              px: 0.4,
              py: 0.1,
              borderRadius: 0.5,
              fontSize: '0.6rem',
              fontWeight: 500,
            }}
          >
            {video.formattedDuration}
          </Box>
        )}

        {/* Now playing indicator */}
        {isActive && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlayIcon sx={{ color: 'white', fontSize: 20 }} />
          </Box>
        )}
      </Box>

      {/* Info - compact */}
      <Box sx={{ flex: 1, minWidth: 0, py: 0 }}>
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 500,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: isActive ? 'primary.main' : 'text.primary',
            mb: 0.25,
          }}
        >
          {video.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
          {video.formattedViewCount}
        </Typography>
      </Box>
    </Box>
  );
});

// Main Component
const WatchVideo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { drawerOpen, setDrawerOpen } = useDrawer();
  const { isAuthenticated, user } = useAuth();

  // Close the nav drawer by default on this page
  useEffect(() => {
    setDrawerOpen(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Show sidebar only on desktop when drawer is closed
  const showSidebar = isDesktop && !drawerOpen;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [comments, setComments] = useState([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const activeVideoRef = useRef(null);

  // Scroll active video into view
  useEffect(() => {
    if (activeVideoRef.current && !loading) {
      setTimeout(() => {
        activeVideoRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 500);
    }
  }, [id, loading, mobileSidebarOpen]);
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Video ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLiked(false);
        const response = await videoChannelAPI.getVideo(id);
        setData(response.data);

        // Fetch post detail if video has postId to get like status and share count
        if (response.data?.video?.postId) {
          try {
            // Fetch comments and post detail in parallel, but handle 404 gracefully
            const promises = [
              discussionAPI.getComments(response.data.video.postId, user?.phone || null).catch(() => ({ data: { comments: [] } })),
              discussionAPI.getPostDetail(response.data.video.postId, user?.phone || null).catch(() => null)
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
              // Post doesn't exist, reset like/share state
              setLiked(false);
              setLikeCount(0);
              setShareCount(0);
            }
          } catch (err) {
            // Only log if it's not a 404 (expected for videos without posts)
            if (err.status !== 404 && !err.message?.includes('404')) {
              console.error('Failed to fetch comments or post detail:', err);
            }
            setComments([]);
            setLiked(false);
            setLikeCount(0);
            setShareCount(0);
          }
        } else {
          setComments([]);
          setLiked(false);
          setLikeCount(0);
          setShareCount(0);
        }
      } catch (err) {
        console.error('Failed to fetch video data:', err);
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, user]);

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
    if (!data?.video?.postId) return;
    try {
      const result = await discussionAPI.likeComment(data.video.postId, commentTime);
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
      if (result.data?.commentsCount !== undefined && data) {
        setData(prev => ({
          ...prev,
          video: { ...prev.video, commentCount: result.data.commentsCount }
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
    if (!data?.video?.postId) return;
    
    // Create optimistic reply immediately
    const optimisticReply = {
      id: 0,
      postId: data.video.postId,
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
    if (data) {
      setData(prev => ({
        ...prev,
        video: { ...prev.video, commentCount: (prev.video.commentCount || 0) + 1 }
      }));
    }
    
    try {
      const result = await discussionAPI.createComment({ 
        postId: data.video.postId, 
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
      if (data) {
        setData(prev => ({
          ...prev,
          video: { ...prev.video, commentCount: Math.max(0, (prev.video.commentCount || 0) - 1) }
        }));
      }
    }
  };

  const handleSubmitComment = async () => {
    const body = commentText.trim();
    if (!body) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!data?.video?.postId) return;
    
    // Clear input immediately
    const commentTextToSubmit = body;
    setCommentText('');
    setCommentSubmitting(true);
    
    // Optimistic update - add comment immediately
    const optimisticComment = {
      id: 0,
      postId: data.video.postId,
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
    if (data) {
      setData(prev => ({
        ...prev,
        video: { ...prev.video, commentCount: (prev.video.commentCount || 0) + 1 }
      }));
    }
    
    try {
      const result = await discussionAPI.createComment({ 
        postId: data.video.postId, 
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
      if (data) {
        setData(prev => ({
          ...prev,
          video: { ...prev.video, commentCount: Math.max(0, (prev.video.commentCount || 0) - 1) }
        }));
      }
      setCommentText(commentTextToSubmit); // Restore text
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleVideoSelect = (videoId) => {
    navigate(`/watch/${videoId}`);
  };

  const handleBack = () => navigate(-1);
  
  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!data?.video?.postId) return;
    
    // Optimistic update
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikeCount(newLikedState ? likeCount + 1 : likeCount - 1);
    
    try {
      const result = await discussionAPI.likePost(data.video.postId);
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
    if (!data?.video?.postId) return;
    
    setSharing(true);
    try {
      const result = await discussionAPI.sharePost(data.video.postId);
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
              title: data?.video?.title,
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

  // Loading
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: { xs: 0, sm: 2, lg: 3 } }}>
        <Box sx={{ display: 'flex', gap: 3, maxWidth: 1800, mx: 'auto' }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="rectangular" sx={{ width: '100%', aspectRatio: '16/9', borderRadius: { xs: 0, lg: 2 } }} />
            <Box sx={{ p: 2 }}>
              <Skeleton variant="text" width="80%" height={28} />
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
          </Box>
          {isDesktop && (
            <Box sx={{ width: 400 }}>
              {[1, 2, 3, 4].map((i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Skeleton variant="rectangular" sx={{ width: 168, height: 94, borderRadius: 1 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="60%" />
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  // Error
  if (error || !data?.video) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <VideoIcon sx={{ fontSize: 80, color: 'grey.300' }} />
        <Typography variant="h5" fontWeight={600}>
          Video not found
        </Typography>
        <Typography color="text.secondary">{error}</Typography>
      </Box>
    );
  }

  const { video, category, currentIndex, totalVideos, relatedVideos } = data;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Main Layout Container */}
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
        {/* Left Column - Video Player & Info & Comments */}
        <Box sx={{ flex: 1, minWidth: 0, maxWidth: showSidebar ? 'calc(100% - 324px)' : '100%' }}>
          {/* Video Player */}
          <VimeoPlayer
            src={video.vimeoId || ''}
            title={video.title}
            onBack={handleBack}
          />

          {/* Video Info Section */}
          <Box sx={{ p: { xs: 2, lg: 0 }, pt: { lg: 2 } }}>
            {/* Title */}
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                fontSize: { xs: '1rem', sm: '1.125rem' },
                lineHeight: 1.4,
                mb: 1.5,
                color: 'text.primary',
              }}
            >
              {video.title}
            </Typography>

            {/* Channel Info & Actions Row */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2,
                pb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              {/* Channel Info */}
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'primary.main',
                    fontSize: '1rem',
                  }}
                >
                  {category?.title?.charAt(0) || 'C'}
                </Avatar>
                <Box>
                  <Typography fontWeight={600} sx={{ fontSize: '0.9rem', color: 'text.primary' }}>
                    {category?.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {video.formattedViewCount} • Video {currentIndex + 1} of {totalVideos}
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
                      bgcolor: liked ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.text.primary, 0.05),
                      color: liked ? 'primary.main' : 'text.primary',
                      borderRadius: 5,
                      textTransform: 'none',
                      '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.1) },
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
                      bgcolor: alpha(theme.palette.text.primary, 0.05),
                      color: 'text.primary',
                      borderRadius: 5,
                      textTransform: 'none',
                      '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.1) },
                    }}
                    startIcon={<ShareIcon sx={{ fontSize: 20 }} />}
                  >
                    Share{shareCount > 0 && ` (${formatCount(shareCount)})`}
                  </Button>
                </Tooltip>

                {/* Related Videos toggle (mobile) */}
                {!isDesktop && relatedVideos && relatedVideos.length > 0 && (
                  <Tooltip title="Related Videos" arrow>
                    <IconButton
                      onClick={() => setMobileSidebarOpen(true)}
                      sx={{
                        bgcolor: alpha(theme.palette.text.primary, 0.05),
                        '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.1) },
                      }}
                    >
                      <MenuIcon />
                    </IconButton>
                  </Tooltip>
                )}

              </Stack>
            </Box>

            {/* Comments Section — Full CRUD functionality */}
            {video.postId && (
              <Paper 
                elevation={0}
                sx={{ 
                  mt: 2, 
                  borderRadius: 4,
                  border: 'none',
                  boxShadow: theme.palette.mode === 'light' ? '0 2px 12px rgba(0,0,0,0.06)' : '0 4px 20px rgba(0,0,0,0.3)',
                  p: 2,
                  bgcolor: 'background.paper',
                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
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
                        bgcolor: mode === 'light' ? 'grey.100' : alpha(theme.palette.common.white, 0.05),
                        '& fieldset': { border: 'none' },
                        color: 'text.primary',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: mode === 'light' ? 'grey.200' : alpha(theme.palette.common.white, 0.08),
                        },
                        '&.Mui-focused': {
                          bgcolor: mode === 'light' ? '#fff' : alpha(theme.palette.common.white, 0.1),
                          boxShadow: mode === 'light' ? '0 0 0 2px rgba(25, 118, 210, 0.2)' : `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
                        }
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
                      postId={video.postId}
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

          {/* Mobile related videos accessible via the Related Videos drawer button */}
        </Box>

        {/* Right Sidebar - Related Videos (Desktop only, hidden when drawer is open) */}
        {showSidebar && relatedVideos && relatedVideos.length > 0 && (
          <Box
            sx={{
              width: 300,
              minWidth: 300,
              maxWidth: 300,
            }}
          >
            <Paper sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper', boxShadow: theme.palette.mode === 'light' ? '0 2px 12px rgba(0,0,0,0.06)' : '0 4px 20px rgba(0,0,0,0.3)' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: mode === 'light' ? 'action.hover' : alpha(theme.palette.common.white, 0.05) }}>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  Related Videos
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {totalVideos} videos in {category?.title}
                </Typography>
              </Box>
              <Stack spacing={0.5} sx={{ p: 0.5, maxHeight: '70vh', overflowY: 'auto' }}>
                {relatedVideos.map((relatedVideo) => (
                  <SidebarVideoItem
                    key={relatedVideo.id}
                    ref={relatedVideo.id === video.id ? activeVideoRef : null}
                    video={relatedVideo}
                    isActive={relatedVideo.id === video.id}
                    onClick={() => handleVideoSelect(relatedVideo.id)}
                  />
                ))}
              </Stack>
            </Paper>
          </Box>
        )}
      </Box>

      {/* Mobile Related Videos Drawer */}
      {!isDesktop && (
        <Drawer
          anchor="right"
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          PaperProps={{ sx: { width: 300, bgcolor: 'background.paper' } }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography fontWeight={700} color="text.primary">Related Videos</Typography>
            <IconButton onClick={() => setMobileSidebarOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <Stack spacing={0.5} sx={{ p: 0.5, overflowY: 'auto' }}>
            {relatedVideos?.map((relatedVideo) => (
              <SidebarVideoItem
                key={relatedVideo.id}
                ref={relatedVideo.id === video.id ? activeVideoRef : null}
                video={relatedVideo}
                isActive={relatedVideo.id === video.id}
                onClick={() => {
                  handleVideoSelect(relatedVideo.id);
                  setMobileSidebarOpen(false);
                }}
              />
            ))}
          </Stack>
        </Drawer>
      )}
    </Box>
  );
};

export default WatchVideo;
