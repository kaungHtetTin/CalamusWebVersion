import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Stack,
  Typography,
  Avatar,
  IconButton,
  Paper,
  Skeleton,
  Divider,
  TextField,
  Button,
  Container,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  FavoriteBorder as LikeIcon,
  Favorite as LikedIcon,
  ChatBubbleOutline as CommentIcon,
  Send as SendIcon,
  Share as ShareIcon,
  Home as HomeIcon,
  Forum as ForumIcon,
  ArrowBack as BackIcon,
  ChevronRight as ChevronRightIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { Chip, useTheme, alpha } from '@mui/material';
import { discussionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import CommentItem from '../components/CommentItem';

// Format relative time
const formatRelativeTime = (timestamp) => {
  const now = Date.now();
  const diff = (now - timestamp) / 1000;
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  
  return new Date(timestamp).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric',
  });
};

// Format numbers
const formatNumber = (num) => {
  if (!num || num === 0) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Get language display info
const getLanguageInfo = (category) => {
  const langMap = {
    english: {
      label: 'English',
      color: '#1976d2', // Blue
      bgColor: '#e3f2fd',
    },
    korea: {
      label: 'Korean',
      color: '#d32f2f', // Red
      bgColor: '#ffebee',
    },
  };
  return langMap[category] || langMap.english;
};

// Loading Skeleton
const PostDetailSkeleton = () => (
  <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
    {/* Breadcrumbs skeleton */}
    <Skeleton variant="text" width={200} sx={{ mb: 3 }} />
    
    <Box sx={{ maxWidth: 680, mx: 'auto' }}>
      {/* Post Card Skeleton */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 2, 
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box>
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" width={80} />
          </Box>
        </Stack>
        
        {/* Content */}
        <Box sx={{ px: 2, pb: 1 }}>
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" />
        </Box>
        
        {/* Image */}
        <Skeleton variant="rectangular" width="100%" height={350} />
        
        {/* Actions */}
        <Stack direction="row" spacing={1} sx={{ p: 1 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
        </Stack>
        
        {/* Likes */}
        <Box sx={{ px: 2, pb: 1.5 }}>
          <Skeleton variant="text" width={80} />
        </Box>
      </Paper>
      
      {/* Comments Section Skeleton */}
      <Paper 
        elevation={0}
        sx={{ 
          mt: 2, 
          borderRadius: 2, 
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          p: 2,
        }}
      >
        <Skeleton variant="text" width={120} sx={{ mb: 2 }} />
        <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
          <Skeleton variant="circular" width={36} height={36} />
          <Skeleton variant="rounded" width="100%" height={40} sx={{ borderRadius: '20px' }} />
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {[1, 2].map((i) => (
          <Stack key={i} direction="row" spacing={1} sx={{ mb: 2 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="rounded" width="60%" height={50} sx={{ borderRadius: '18px' }} />
          </Stack>
        ))}
      </Paper>
    </Box>
  </Container>
);

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const theme = useTheme();
  const { mode } = useThemeMode();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await discussionAPI.getPostDetail(postId, user?.phone || null);
        setPost(response.data.post);
        setComments(response.data.comments || []);
        setLikeCount(response.data.post.postLikes || 0);
        setLiked(response.data.post.isLiked === 1);
      } catch (err) {
        console.error('Failed to fetch post:', err);
        setError('Failed to load post. It may have been deleted or is unavailable.');
      } finally {
        setLoading(false);
      }
    };
    
    if (postId) {
      fetchPostDetail();
    }
  }, [postId, user?.phone]);
  
  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Optimistic update
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    try {
      const result = await discussionAPI.likePost(postId);
      if (result.success && result.count !== undefined) {
        setLikeCount(result.count);
        setLiked(result.isLiked);
      }
    } catch (err) {
      // Revert on error
      setLiked(liked);
      setLikeCount(likeCount);
      console.error('Like error:', err);
    }
  };
  
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

  const handleLikeComment = async (commentTime, isLiked) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      const result = await discussionAPI.likeComment(postId, commentTime);
      if (result.data) {
        setComments((prev) => updateCommentInTree(prev, commentTime, (c) => ({
          ...c, likes: result.data.count, isLiked: result.data.isLiked ? 1 : 0,
        })));
      }
    } catch (err) { console.error('Like comment error:', err); }
  };

  const handleDeleteComment = async (pId, commentId) => {
    const result = await discussionAPI.deleteComment(pId, commentId);
    setComments((prev) => removeCommentFromTree(prev, commentId));
    if (result.data?.commentsCount !== undefined) {
      setPost((prev) => prev ? { ...prev, comments: result.data.commentsCount } : null);
    }
  };

  const handleUpdateComment = async (pId, commentId, body) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const result = await discussionAPI.updateComment(pId, commentId, body);
    if (result.success) {
      setComments((prev) => updateCommentInTree(prev, commentId, (c) => ({
        ...c,
        body: body,
      })));
    }
  };

  const handleReplySubmit = async (parentId, body) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    
    // Create optimistic reply immediately
    const optimisticReply = {
      id: 0,
      postId: postId,
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
    setPost((prev) => prev ? { ...prev, comments: (prev.comments || 0) + 1 } : null);
    
    try {
      const result = await discussionAPI.createComment({ postId, body, parent: parentId });
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
      setPost((prev) => prev ? { ...prev, comments: Math.max(0, (prev.comments || 0) - 1) } : null);
    }
  };

  const handleSubmitComment = async () => {
    const body = commentText.trim();
    if (!body) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    
    // Clear input immediately
    const commentTextToSubmit = body;
    setCommentText('');
    setCommentSubmitting(true);
    
    // Optimistic update - add comment immediately
    const optimisticComment = {
      id: 0,
      postId: postId,
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
    setPost((prev) => prev ? { ...prev, comments: (prev.comments || 0) + 1 } : null);
    
    try {
      const result = await discussionAPI.createComment({ postId, body: commentTextToSubmit });
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
      setPost((prev) => prev ? { ...prev, comments: Math.max(0, (prev.comments || 0) - 1) } : null);
      setCommentText(commentTextToSubmit); // Restore text
    } finally {
      setCommentSubmitting(false);
    }
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  if (loading) {
    return <PostDetailSkeleton />;
  }
  
  if (error || !post) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ maxWidth: 680, mx: 'auto', textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error || 'Post not found'}
          </Typography>
          <Button variant="outlined" onClick={handleBack} startIcon={<BackIcon />}>
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }
  
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
            to={`/discussion/${post?.major || 'english'}`}
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
            <ForumIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Discussion
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
            Post
          </Typography>
        </Breadcrumbs>
        
        {/* Content wrapper for centered layout */}
        <Box sx={{ maxWidth: 680, mx: 'auto' }}>
          {/* Post Card - Facebook style */}
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: { xs: 0, sm: 4 }, 
              overflow: 'hidden',
              border: 'none',
              boxShadow: { xs: 'none', sm: '0 2px 12px rgba(0,0,0,0.06)' },
              bgcolor: 'background.paper',
            }}
          >
          {/* Author Header */}
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2 }}>
            <Avatar
              src={post.userImage}
              onClick={() => navigate(`/profile/${post.userId}`)}
              sx={{ width: 40, height: 40, cursor: 'pointer' }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  onClick={() => navigate(`/profile/${post.userId}`)}
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  {post.userName}
                </Typography>
                {post.category && (
                  <Chip
                    icon={<LanguageIcon sx={{ fontSize: 12 }} />}
                    label={getLanguageInfo(post.category).label}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      bgcolor: getLanguageInfo(post.category).bgColor,
                      color: getLanguageInfo(post.category).color,
                      border: `1px solid ${getLanguageInfo(post.category).color}20`,
                      '& .MuiChip-icon': {
                        color: getLanguageInfo(post.category).color,
                        fontSize: 12,
                      },
                      '& .MuiChip-label': {
                        px: 0.75,
                      },
                    }}
                  />
                )}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {formatRelativeTime(post.postId)}
              </Typography>
            </Box>
          </Stack>
          
          {/* Post Body - Facebook shows text before media */}
          {post.body && (
            <Box sx={{ px: 2, pb: 1 }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-word',
                  lineHeight: 1.6,
                }}
              >
                {post.body}
              </Typography>
            </Box>
          )}
          
          {/* Post Image */}
          {post.postImage && post.hasVideo !== 1 && (
            <Box
              sx={{
                width: '100%',
                bgcolor: 'grey.100',
              }}
            >
              <Box
                component="img"
                src={post.postImage}
                alt="Post image"
                sx={{
                  width: '100%',
                  maxHeight: 500,
                  objectFit: 'contain',
                  display: 'block',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </Box>
          )}
          
          {/* Video */}
          {post.hasVideo === 1 && post.vimeo && (
            <Box
              sx={{
                position: 'relative',
                paddingTop: '56.25%',
                bgcolor: 'black',
              }}
            >
              <Box
                component="iframe"
                src={post.vimeo}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              />
            </Box>
          )}
          
          {/* Actions */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 1, py: 0.5 }}
          >
            <Stack direction="row" alignItems="center">
              <IconButton onClick={handleLike}>
                {liked ? (
                  <LikedIcon sx={{ color: 'error.main' }} />
                ) : (
                  <LikeIcon />
                )}
              </IconButton>
              <IconButton>
                <CommentIcon />
              </IconButton>
              <IconButton>
                <ShareIcon />
              </IconButton>
            </Stack>
          </Stack>
          
          {/* Likes */}
          {likeCount > 0 && (
            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{ px: 2, pb: 0.5 }}
            >
              {formatNumber(likeCount)} {likeCount === 1 ? 'like' : 'likes'}
            </Typography>
          )}
          
          {/* Comments preview */}
          {post.comments > 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ px: 2, pb: 1.5 }}
            >
              View all {formatNumber(post.comments)} comments
            </Typography>
          )}
        </Paper>
        
        {/* Comments Section */}
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
              src="https://www.calamuseducation.com/uploads/placeholder.png"
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
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
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
                postId={postId}
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
        </Box>
      </Container>
    </Box>
  );
};

export default PostDetail;
