import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  useTheme,
  useMediaQuery,
  alpha,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Slide,
  Container,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  FavoriteBorder as LikeIcon,
  Favorite as LikedIcon,
  ChatBubbleOutline as CommentIcon,
  Send as ShareIcon,
  BookmarkBorder as SaveIcon,
  Bookmark as SavedIcon,
  MoreHoriz as MoreIcon,
  Verified as VerifiedIcon,
  AddCircleOutline as AddIcon,
  Image as ImageIcon,
  Forum as ForumIcon,
  Close as CloseIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  Reply as ReplyIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { discussionAPI } from '../services/api';
import { PostCard, formatRelativeTime, formatNumber } from '../components/PostCard';
import CommentItem from '../components/CommentItem';
import { useAuth } from '../context/AuthContext';

// Transition for dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Category configurations
const CATEGORY_CONFIG = {
  english: {
    displayName: 'English Community',
    description: 'Share and discuss with English learners',
  },
  korea: {
    displayName: 'Korean Community',
    description: 'Share and discuss with Korean learners',
  },
};


// Comments Modal Component
const CommentsModal = ({ open, onClose, post, user, isAuthenticated, navigate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!post?.postId) return;
    setLoading(true);
    try {
      const response = await discussionAPI.getComments(post.postId, user?.phone || null);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  }, [post?.postId, user?.phone]);

  useEffect(() => {
    if (open && post?.postId) fetchComments();
  }, [open, post?.postId, fetchComments]);

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
      const result = await discussionAPI.likeComment(post.postId, commentTime);
      if (result.data) {
        setComments((prev) => updateCommentInTree(prev, commentTime, (c) => ({
          ...c, likes: result.data.count, isLiked: result.data.isLiked ? 1 : 0,
        })));
      }
    } catch (err) { console.error('Like comment error:', err); }
  };

  const handleDeleteComment = async (postId, commentId) => {
    await discussionAPI.deleteComment(postId, commentId);
    setComments((prev) => removeCommentFromTree(prev, commentId));
  };

  const handleReplySubmit = async (parentId, body) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const result = await discussionAPI.createComment({ postId: post.postId, body, parent: parentId });
    if (result.data?.comment) {
      setComments((prev) => addReplyToTree(prev, parentId, result.data.comment));
    }
  };

  const handleSubmitComment = async () => {
    const body = commentText.trim();
    if (!body) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      const result = await discussionAPI.createComment({ postId: post.postId, body });
      if (result.data?.comment) {
        setComments((prev) => [result.data.comment, ...prev]);
        setCommentText('');
      }
    } catch (err) { console.error('Submit comment error:', err); }
    finally { setSubmitting(false); }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100%' : '85vh',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: 2,
          borderBottom: 'none',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Comments
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      {/* Content */}
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Post Preview */}
        <Box sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Avatar
              src={post?.userImage}
              sx={{ width: 36, height: 36 }}
            />
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {post?.userName}
                </Typography>
                {post?.vip === 1 && (
                  <VerifiedIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                )}
              </Stack>
              {post?.body && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {post.body}
                </Typography>
              )}
            </Box>
          </Stack>
        </Box>
        
        {/* Comments List */}
        <Box 
          sx={{ 
            flex: 1, 
            overflowY: 'auto', 
            p: 2,
            minHeight: 200,
          }}
        >
          {loading ? (
            <Stack spacing={2}>
              {[1, 2, 3].map((i) => (
                <Stack key={i} direction="row" spacing={1.5}>
                  <Skeleton variant="circular" width={32} height={32} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="rounded" width="60%" height={60} sx={{ borderRadius: 2 }} />
                    <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                      <Skeleton variant="text" width={40} />
                      <Skeleton variant="text" width={30} />
                      <Skeleton variant="text" width={35} />
                    </Stack>
                  </Box>
                </Stack>
              ))}
            </Stack>
          ) : comments.length === 0 ? (
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
                postId={post.postId}
                comment={comment}
                currentUserId={user?.phone}
                onLikeComment={handleLikeComment}
                onDeleteComment={isAuthenticated ? handleDeleteComment : null}
                onReplySubmit={isAuthenticated ? handleReplySubmit : null}
                isAuthenticated={!!isAuthenticated}
              />
            ))
          )}
        </Box>
        
        {/* Comment Input */}
        <Box
          sx={{
            p: 2,
            boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              src="https://www.calamuseducation.com/uploads/placeholder.png"
              sx={{ width: 32, height: 32 }}
            />
            <TextField
              size="small"
              placeholder="Add a comment..."
              fullWidth
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <IconButton 
              color="primary" 
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || submitting}
            >
              <ShareIcon />
            </IconButton>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// Story/Pinned Item Component
const StoryItem = ({ post, onClick }) => {
  const theme = useTheme();
  
  return (
    <Stack
      alignItems="center"
      spacing={0.5}
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        minWidth: 72,
        '&:hover': {
          opacity: 0.8,
        },
      }}
    >
      <Box
        sx={{
          p: 0.3,
          borderRadius: '50%',
          background: `linear-gradient(45deg, ${theme.palette.warning.main}, ${theme.palette.error.main}, ${theme.palette.secondary.main})`,
        }}
      >
        <Avatar
          src={post.postImage || post.userImage}
          sx={{
            width: 56,
            height: 56,
            border: '2px solid',
            borderColor: 'background.paper',
          }}
        />
      </Box>
      <Typography
        variant="caption"
        sx={{
          maxWidth: 68,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}
      >
        {post.blogTitle || post.userName}
      </Typography>
    </Stack>
  );
};

// Create Post Component
const CreatePostBox = ({ category, onPostCreated, variant = 'inline' }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!text.trim() && !image) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await discussionAPI.createPost({
        body: text.trim(),
        category: category || 'english',
        image: image || '',
      });

      if (res.success && res.data?.post) {
        setText('');
        handleRemoveImage();
        if (onPostCreated) onPostCreated(res.data.post);
      } else {
        setError(res.error || 'Failed to create post');
      }
    } catch (err) {
      if (err.message === 'Not authenticated') {
        navigate('/login');
        return;
      }
      console.error('Create post error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isDialog = variant === 'dialog';

  if (!isAuthenticated) {
    return (
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: { xs: 0, sm: 2 },
          boxShadow: { xs: 'none', sm: '0 2px 12px rgba(0,0,0,0.06)' },
          p: 2.5,
          mb: 2,
          cursor: 'pointer',
          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
        }}
        onClick={() => navigate('/login')}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 40, height: 40, bgcolor: 'grey.200' }} />
          <Typography variant="body2" color="text.secondary">
            Log in to share what's on your mind...
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: isDialog ? 0 : { xs: 0, sm: 2 },
        border: 'none',
        boxShadow: isDialog ? 'none' : { xs: 'none', sm: '0 2px 12px rgba(0,0,0,0.06)' },
        p: isDialog ? 0 : 2,
        mb: isDialog ? 0 : 2,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Avatar
          src={user?.image || user?.learner_image || ''}
          sx={{ width: 40, height: 40 }}
        >
          {user?.name?.[0] || user?.learner_name?.[0] || 'U'}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <TextField
            fullWidth
            multiline
            minRows={isDialog ? 4 : 2}
            maxRows={8}
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: '0.95rem',
              },
            }}
          />

          {/* Image Preview */}
          {imagePreview && (
            <Box sx={{ position: 'relative', mt: 1.5, mb: 1 }}>
              <Box
                component="img"
                src={imagePreview}
                alt="Preview"
                sx={{
                  width: '100%',
                  maxHeight: 300,
                  objectFit: 'cover',
                  borderRadius: 2,
                  display: 'block',
                }}
              />
              <IconButton
                size="small"
                onClick={handleRemoveImage}
                sx={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                  width: 28,
                  height: 28,
                }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          )}

          {/* Error */}
          {error && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5, mb: 0.5 }}>
              {error}
            </Typography>
          )}

          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={0.5}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageSelect}
              />
              <IconButton
                size="small"
                color="primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Button
              variant="contained"
              size="small"
              disabled={(!text.trim() && !image) || submitting}
              onClick={handleSubmit}
              sx={{ 
                borderRadius: 5,
                px: 3,
                textTransform: 'none',
              }}
            >
              {submitting ? <CircularProgress size={18} color="inherit" /> : 'Post'}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

// Loading Skeleton
const PostSkeleton = () => (
  <Paper
    elevation={0}
    sx={{
      bgcolor: 'background.paper',
      borderRadius: 2,
      border: 'none',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      mb: 2,
    }}
  >
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.5 }}>
      <Skeleton variant="circular" width={36} height={36} />
      <Box>
        <Skeleton variant="text" width={120} height={20} />
        <Skeleton variant="text" width={60} height={16} />
      </Box>
    </Stack>
    <Skeleton variant="rectangular" width="100%" height={300} />
    <Stack direction="row" spacing={1} sx={{ p: 1.5 }}>
      <Skeleton variant="circular" width={32} height={32} />
      <Skeleton variant="circular" width={32} height={32} />
      <Skeleton variant="circular" width={32} height={32} />
    </Stack>
    <Box sx={{ px: 2, pb: 2 }}>
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="80%" />
    </Box>
  </Paper>
);

// Main Discussion Page Component
const Discussion = () => {
  const { category = 'english' } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, isAuthenticated } = useAuth();
  
  const [posts, setPosts] = useState([]);
  const [pinnedPosts, setPinnedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Comments modal state
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Create post dialog state (mobile)
  const [createPostOpen, setCreatePostOpen] = useState(false);
  
  const observerRef = useRef();
  const lastPostRef = useRef();
  
  const categoryConfig = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.english;
  
  // Navigate to post detail page
  const handleViewPost = (postId) => {
    navigate(`/post/${postId}`);
  };
  
  // Fetch posts
  const fetchPosts = useCallback(async (pageNum, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      const response = await discussionAPI.get(category, pageNum, user?.phone || null);
      const { posts: newPosts, pinnedPosts: pinned, pagination } = response.data;
      
      if (append) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
        setPinnedPosts(pinned || []);
      }
      
      setHasMore(pagination?.hasMore || false);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category]);
  
  // Initial fetch
  useEffect(() => {
    setPage(1);
    setPosts([]);
    fetchPosts(1);
  }, [category, fetchPosts]);
  
  // Infinite scroll observer
  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setPage(prev => {
            const newPage = prev + 1;
            fetchPosts(newPage, true);
            return newPage;
          });
        }
      },
      { threshold: 0.5 }
    );
    
    if (lastPostRef.current) {
      observer.observe(lastPostRef.current);
    }
    
    observerRef.current = observer;
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, loadingMore, hasMore, fetchPosts]);
  
  // Handle like
  const handleLike = async (postId, isLiked) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const result = await discussionAPI.likePost(postId);
      if (result.data) {
        // Sync server count with local state
        setPosts(prev => prev.map(p =>
          p.postId === postId
            ? { ...p, postLikes: result.data.count, isLiked: result.data.isLiked ? 1 : 0 }
            : p
        ));
      }
    } catch (err) {
      // Revert optimistic update on error by refetching
      console.error('Like error:', err);
    }
  };
  
  // Handle open comments
  const handleOpenComments = (post) => {
    setSelectedPost(post);
    setCommentsModalOpen(true);
  };
  
  // Handle close comments
  const handleCloseComments = () => {
    setCommentsModalOpen(false);
    setSelectedPost(null);
  };

  // Handle new post created
  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    setCreatePostOpen(false);
  };

  // Handle delete post
  const handleDeletePost = async (postId) => {
    await discussionAPI.deletePost(postId);
    setPosts(prev => prev.filter(p => p.postId !== postId));
  };

  // Handle report post
  const handleReportPost = async (postId) => {
    const result = await discussionAPI.reportPost(postId);
    return result;
  };

  // Handle hide post
  const handleHidePost = async (postId) => {
    await discussionAPI.hidePost(postId);
    setPosts(prev => prev.filter(p => p.postId !== postId));
  };
  
  // Loading state
  if (loading) {
    return (
      <Box sx={{ overflowX: 'hidden' }}>
        {/* Header */}
        <Box sx={{ py: 2, px: { xs: 2, sm: 3 } }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="circular" width={48} height={48} />
            <Box>
              <Skeleton variant="text" width={150} height={28} />
              <Skeleton variant="text" width={200} height={20} />
            </Box>
          </Stack>
        </Box>
        
        {/* Stories Skeleton */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Stack key={i} alignItems="center" spacing={0.5} sx={{ minWidth: 72 }}>
                <Skeleton variant="circular" width={60} height={60} />
                <Skeleton variant="text" width={50} />
              </Stack>
            ))}
          </Stack>
        </Box>
        
        {/* Posts Skeleton */}
        <Box sx={{ 
          maxWidth: 600, 
          mx: 'auto', 
          px: { xs: 0, sm: 2 },
        }}>
          {[1, 2, 3].map((i) => (
            <PostSkeleton key={i} />
          ))}
        </Box>
      </Box>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="outlined" onClick={() => fetchPosts(1)}>
          Try Again
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ overflowX: 'hidden', minHeight: '100vh', bgcolor: 'background.default' }}>
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
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <ForumIcon sx={{ mr: 0.5 }} fontSize="small" />
            Discussion
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {categoryConfig.displayName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {categoryConfig.description}
          </Typography>
        </Box>
      </Container>
      
      {/* Stories/Pinned Section */}
      {pinnedPosts.length > 0 && (
        <Box 
          sx={{ 
            px: 2, 
            pb: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <Stack 
            direction="row" 
            spacing={2} 
            sx={{ 
              overflowX: 'auto', 
              pb: 1,
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            {/* Add Story Button */}
            <Stack alignItems="center" spacing={0.5} sx={{ minWidth: 72 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: 'background.paper',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    bgcolor: 'grey.50',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <AddIcon color="primary" />
              </Box>
              <Typography variant="caption">New</Typography>
            </Stack>
            
            {pinnedPosts.map((post) => (
              <StoryItem 
                key={post.postId} 
                post={post} 
                onClick={() => handleViewPost(post.postId)}
              />
            ))}
          </Stack>
        </Box>
      )}
      
      {/* Main Content */}
      <Box 
        sx={{ 
          maxWidth: 600, 
          mx: 'auto', 
          px: { xs: 0, sm: 2 },
          py: 2,
        }}
      >
        {/* Create Post */}
        {!isMobile && (
          <CreatePostBox category={category} onPostCreated={handlePostCreated} />
        )}
        
        {/* Posts Feed */}
        {posts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ForumIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No posts yet
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Be the first to share something!
            </Typography>
          </Box>
        ) : (
          <>
            {posts.map((post, index) => (
              <Box
                key={post.postId}
                ref={index === posts.length - 1 ? lastPostRef : null}
              >
                <PostCard 
                  post={post} 
                  onLike={handleLike} 
                  onOpenComments={handleOpenComments}
                  onNavigate={navigate}
                  currentUserId={user?.phone}
                  onDelete={isAuthenticated ? handleDeletePost : null}
                  onReport={isAuthenticated ? handleReportPost : null}
                  onHide={isAuthenticated ? handleHidePost : null}
                />
              </Box>
            ))}
            
            {/* Loading more indicator */}
            {loadingMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={32} />
              </Box>
            )}
            
            {/* End of feed */}
            {!hasMore && posts.length > 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  You've reached the end
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
      
      {/* Mobile Create Post FAB */}
      {isMobile && (
        <IconButton
          color="primary"
          onClick={() => setCreatePostOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            bgcolor: 'primary.main',
            color: 'white',
            width: 56,
            height: 56,
            boxShadow: '0 4px 16px rgba(46, 125, 50, 0.3)',
            '&:hover': {
              bgcolor: 'primary.dark',
              boxShadow: '0 6px 20px rgba(46, 125, 50, 0.4)',
            },
          }}
        >
          <AddIcon />
        </IconButton>
      )}

      {/* Mobile Create Post Dialog */}
      <Dialog
        fullScreen
        open={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
        TransitionComponent={Transition}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <IconButton onClick={() => setCreatePostOpen(false)} edge="start">
              <CloseIcon />
            </IconButton>
            <Typography variant="subtitle1" fontWeight={600}>
              Create Post
            </Typography>
            <Box sx={{ width: 40 }} /> {/* Spacer for centering */}
          </Box>
          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
            <CreatePostBox
              category={category}
              onPostCreated={handlePostCreated}
              variant="dialog"
            />
          </Box>
        </Box>
      </Dialog>
      
      {/* Comments Modal */}
      <CommentsModal
        open={commentsModalOpen}
        onClose={handleCloseComments}
        post={selectedPost}
        user={user}
        isAuthenticated={isAuthenticated}
        navigate={navigate}
      />
    </Box>
  );
};

export default Discussion;
