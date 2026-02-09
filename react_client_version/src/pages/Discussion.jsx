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
import CreatePost from '../components/CreatePost';
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
    if (!post?.postId) return;
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

  const handleUpdateComment = async (postId, commentId, body) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const result = await discussionAPI.updateComment(postId, commentId, body);
    if (result.success) {
      setComments((prev) => updateCommentInTree(prev, commentId, (c) => ({
        ...c,
        body: body,
      })));
    }
  };

  const handleReplySubmit = async (parentId, body) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!post?.postId) return;
    const result = await discussionAPI.createComment({ postId: post.postId, body, parent: parentId });
    if (result.data?.comment) {
      setComments((prev) => addReplyToTree(prev, parentId, result.data.comment));
    }
  };

  const handleSubmitComment = async () => {
    const body = commentText.trim();
    if (!body) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!post?.postId) return;
    
    // Clear input immediately
    const commentTextToSubmit = body;
    setCommentText('');
    setSubmitting(true);
    
    // Optimistic update - add comment immediately
    const optimisticComment = {
      id: 0,
      postId: post.postId,
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
    
    try {
      const result = await discussionAPI.createComment({ postId: post.postId, body: commentTextToSubmit });
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
      setCommentText(commentTextToSubmit); // Restore text
    } finally {
      setSubmitting(false);
    }
  };

  if (!post) return null;
  
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
          fontWeight: 600,
        }}
      >
        Comments
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      {/* Content */}
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Post Preview */}
        {post && (
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
        )}
        
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
                postId={post?.postId}
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

// Helper function to map category to language code
// Maps discussion category (english/korea) to language code from database
const mapCategoryToLanguageCode = (category) => {
  const mapping = {
    'english': 'english', // Default fallback
    'korea': 'korea',     // Default fallback
  };
  return mapping[category] || 'english';
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

  // Handle share post
  const handleSharePost = async (postId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const result = await discussionAPI.sharePost(postId);
      if (result.success) {
        if (result.data?.alreadyShared) {
          // Already shared - return info instead of throwing error
          return { alreadyShared: true, message: result.message || 'You have already shared this post' };
        }
        // Update share count for the original post
        setPosts(prev => prev.map(p =>
          p.postId === postId
            ? { ...p, shareCount: (p.shareCount || 0) + 1 }
            : p
        ));
      } else {
        throw new Error(result.message || 'Failed to share post');
      }
    } catch (err) {
      throw err;
    }
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
          <CreatePost 
            defaultLanguage={mapCategoryToLanguageCode(category)} 
            onPostCreated={handlePostCreated} 
          />
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
                  onShare={isAuthenticated ? handleSharePost : null}
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
            <CreatePost
              defaultLanguage={mapCategoryToLanguageCode(category)}
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
