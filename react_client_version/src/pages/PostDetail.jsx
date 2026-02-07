import React, { useState, useEffect } from 'react';
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
  BookmarkBorder as SaveIcon,
  Bookmark as SavedIcon,
  Home as HomeIcon,
  Forum as ForumIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { discussionAPI } from '../services/api';

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

// Comment Item Component (Facebook-style)
const CommentItem = ({ comment, isReply = false, onLikeComment }) => {
  const [liked, setLiked] = useState(comment.isLiked === 1);
  const [likeCount, setLikeCount] = useState(comment.likes || 0);
  const [showReplyInput, setShowReplyInput] = useState(false);
  
  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    if (onLikeComment) onLikeComment(comment.time, !liked);
  };
  
  return (
    <Box sx={{ ml: isReply ? 5 : 0, mb: 1.5 }}>
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Avatar
          src={comment.userImage}
          sx={{ 
            width: isReply ? 24 : 32, 
            height: isReply ? 24 : 32,
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              bgcolor: 'grey.100',
              borderRadius: '18px',
              px: 2,
              py: 1,
              display: 'inline-block',
              maxWidth: '100%',
            }}
          >
            <Typography 
              variant="subtitle2" 
              fontWeight={600} 
              fontSize={isReply ? 12 : 13}
              color="text.primary"
              sx={{ lineHeight: 1.3 }}
            >
              {comment.userName}
            </Typography>
            <Typography 
              variant="body2" 
              fontSize={isReply ? 13 : 14}
              color="text.primary"
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.4 }}
            >
              {comment.body}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.3, ml: 1.5 }}>
            <Typography
              variant="caption"
              color={liked ? 'primary.main' : 'text.secondary'}
              sx={{ 
                cursor: 'pointer', 
                fontWeight: liked ? 700 : 600,
                fontSize: 12,
                '&:hover': { textDecoration: 'underline' },
              }}
              onClick={handleLike}
            >
              Like{likeCount > 0 && ` · ${formatNumber(likeCount)}`}
            </Typography>
            {!isReply && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ 
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 12,
                  '&:hover': { textDecoration: 'underline' },
                }}
                onClick={() => setShowReplyInput(!showReplyInput)}
              >
                Reply
              </Typography>
            )}
            <Typography variant="caption" color="text.disabled" fontSize={12}>
              {formatRelativeTime(comment.time)}
            </Typography>
          </Stack>
          
          {showReplyInput && (
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <TextField
                size="small"
                placeholder="Write a reply..."
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    fontSize: 13,
                    bgcolor: 'grey.100',
                    '& fieldset': { border: 'none' },
                  },
                }}
              />
              <IconButton size="small" color="primary">
                <SendIcon fontSize="small" />
              </IconButton>
            </Stack>
          )}
          
          {comment.replies && comment.replies.length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              {comment.replies.map((reply) => (
                <CommentItem 
                  key={reply.id || reply.time} 
                  comment={reply} 
                  isReply={true}
                  onLikeComment={onLikeComment}
                />
              ))}
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
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
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await discussionAPI.getPostDetail(postId);
        setPost(response.data.post);
        setComments(response.data.comments || []);
        setLikeCount(response.data.post.postLikes || 0);
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
  }, [postId]);
  
  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };
  
  const handleSave = () => {
    setSaved(!saved);
  };
  
  const handleLikeComment = (commentTime, isLiked) => {
    console.log('Like comment:', commentTime, isLiked);
  };
  
  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    console.log('Submit comment:', commentText);
    setCommentText('');
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
            <ForumIcon sx={{ mr: 0.5 }} fontSize="small" />
            Discussion
          </Link>
          <Typography color="text.primary">
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
              sx={{ width: 40, height: 40 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {post.userName}
              </Typography>
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
                  bgcolor: 'grey.100',
                  '& fieldset': { border: 'none' },
                },
              }}
            />
            <IconButton 
              color="primary" 
              onClick={handleSubmitComment}
              disabled={!commentText.trim()}
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
                comment={comment}
                onLikeComment={handleLikeComment}
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
