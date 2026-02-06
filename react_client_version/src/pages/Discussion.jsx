import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
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
  InputAdornment,
  useTheme,
  useMediaQuery,
  alpha,
  Chip,
  Button,
  CircularProgress,
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
  VideoLibrary as VideoIcon,
  Forum as ForumIcon,
} from '@mui/icons-material';
import { discussionAPI } from '../services/api';

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

// Format relative time
const formatRelativeTime = (timestamp) => {
  const now = Date.now();
  const diff = (now - timestamp) / 1000;
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  
  return new Date(timestamp).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

// Format numbers (1K, 1M, etc.)
const formatNumber = (num) => {
  if (!num || num === 0) return '';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Post Card Component (Instagram-style)
const PostCard = ({ post, onLike }) => {
  const theme = useTheme();
  const [liked, setLiked] = useState(post.isLiked === 1);
  const [likeCount, setLikeCount] = useState(post.postLikes);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    if (onLike) onLike(post.postId, !liked);
  };
  
  const handleSave = () => {
    setSaved(!saved);
  };
  
  // Truncate text
  const shouldTruncate = post.body && post.body.length > 150;
  const displayText = expanded || !shouldTruncate 
    ? post.body 
    : `${post.body.substring(0, 150)}...`;
  
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: { xs: 0, sm: 2 },
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        mb: { xs: 1, sm: 2 },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 1.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar
            src={post.userImage}
            sx={{ 
              width: 36, 
              height: 36,
              border: '2px solid',
              borderColor: post.vip ? 'primary.main' : 'transparent',
            }}
          />
          <Box>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="subtitle2" fontWeight={600}>
                {post.userName}
              </Typography>
              {post.vip === 1 && (
                <VerifiedIcon sx={{ fontSize: 14, color: 'primary.main' }} />
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {formatRelativeTime(post.postId)}
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small">
          <MoreIcon fontSize="small" />
        </IconButton>
      </Stack>
      
      {/* Media - Only show image if not a video post */}
      {post.postImage && post.hasVideo !== 1 && (
        <Box
          sx={{
            width: '100%',
            bgcolor: 'grey.100',
            position: 'relative',
          }}
        >
          <Box
            component="img"
            src={post.postImage}
            alt="Post"
            sx={{
              width: '100%',
              maxHeight: 500,
              objectFit: 'cover',
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
        <IconButton onClick={handleSave}>
          {saved ? <SavedIcon /> : <SaveIcon />}
        </IconButton>
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
      
      {/* Caption */}
      {post.body && (
        <Box sx={{ px: 2, pb: 1.5 }}>
          <Typography 
            variant="body2" 
            component="span"
            sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            <Typography 
              component="span" 
              variant="body2" 
              fontWeight={600}
              sx={{ mr: 1 }}
            >
              {post.userName}
            </Typography>
            {displayText}
          </Typography>
          {shouldTruncate && !expanded && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ cursor: 'pointer', mt: 0.5 }}
              onClick={() => setExpanded(true)}
            >
              more
            </Typography>
          )}
        </Box>
      )}
      
      {/* Comments preview */}
      {post.comments > 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ px: 2, pb: 1.5, cursor: 'pointer' }}
        >
          View all {formatNumber(post.comments)} comments
        </Typography>
      )}
    </Paper>
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
const CreatePostBox = ({ userImage }) => {
  const theme = useTheme();
  const [text, setText] = useState('');
  
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        p: 2,
        mb: 2,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Avatar
          src={userImage || 'https://www.calamuseducation.com/uploads/placeholder.png'}
          sx={{ width: 40, height: 40 }}
        />
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            maxRows={6}
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
          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1}>
              <IconButton size="small" color="primary">
                <ImageIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="primary">
                <VideoIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Button
              variant="contained"
              size="small"
              disabled={!text.trim()}
              sx={{ 
                borderRadius: 5,
                px: 3,
                textTransform: 'none',
              }}
            >
              Post
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
      border: '1px solid',
      borderColor: 'divider',
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  const [posts, setPosts] = useState([]);
  const [pinnedPosts, setPinnedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const observerRef = useRef();
  const lastPostRef = useRef();
  
  const categoryConfig = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.english;
  
  // Fetch posts
  const fetchPosts = useCallback(async (pageNum, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      const response = await discussionAPI.get(category, pageNum);
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
  const handleLike = (postId, isLiked) => {
    // TODO: Implement API call for liking
    console.log('Like post:', postId, isLiked);
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
      {/* Page Header */}
      <Box sx={{ py: 2, px: { xs: 2, sm: 3 } }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
            <ForumIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              {categoryConfig.displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {categoryConfig.description}
            </Typography>
          </Box>
        </Stack>
      </Box>
      
      {/* Stories/Pinned Section */}
      {pinnedPosts.length > 0 && (
        <Box 
          sx={{ 
            px: 2, 
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
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
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <AddIcon color="primary" />
              </Box>
              <Typography variant="caption">New</Typography>
            </Stack>
            
            {pinnedPosts.map((post) => (
              <StoryItem key={post.postId} post={post} />
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
          <CreatePostBox />
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
                <PostCard post={post} onLike={handleLike} />
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
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            bgcolor: 'primary.main',
            color: 'white',
            width: 56,
            height: 56,
            boxShadow: 3,
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          <AddIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default Discussion;
