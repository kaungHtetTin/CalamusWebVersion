import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Stack,
  Chip,
  IconButton,
  Button,
  Skeleton,
  Tabs,
  Tab,
  CircularProgress,
  useTheme,
  useMediaQuery,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  Slide,
  TextField,
} from '@mui/material';
import {
  Work as WorkIcon,
  School as EducationIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  CameraAlt as CameraIcon,
  Article as PostIcon,
  PushPin as PinIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  ChatBubbleOutline as CommentIcon,
  Verified as VerifiedIcon,
  Send as ShareIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { userAPI, discussionAPI } from '../services/api';
import { PostCard } from '../components/PostCard';
import CommentItem from '../components/CommentItem';
import CreatePost from '../components/CreatePost';

// Transition for dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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
              src={user?.image || user?.learner_image || ''}
              sx={{ width: 32, height: 32 }}
            >
              {user?.name?.[0] || user?.learner_name?.[0] || 'U'}
            </Avatar>
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

// Skeleton for the profile page
const ProfileSkeleton = () => (
  <Box sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
    <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', mb: 3 }}>
      <Skeleton variant="rectangular" height={200} />
      <Box sx={{ px: 3, pb: 3, mt: -5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'center', sm: 'flex-end' }}>
          <Skeleton variant="circular" width={110} height={110} />
          <Box sx={{ flex: 1, pt: 1 }}>
            <Skeleton width={180} height={32} />
            <Skeleton width={120} height={18} sx={{ mt: 0.5 }} />
          </Box>
        </Stack>
      </Box>
    </Paper>
    {[1, 2].map((i) => (
      <Paper key={i} elevation={0} sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 2, p: 2.5 }}>
        <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box>
            <Skeleton width={120} height={18} />
            <Skeleton width={60} height={14} />
          </Box>
        </Stack>
        <Skeleton width="100%" height={16} />
        <Skeleton width="80%" height={16} />
        <Skeleton variant="rectangular" height={200} sx={{ mt: 1.5, borderRadius: 1.5 }} />
      </Paper>
    ))}
  </Box>
);

const Profile = () => {
  const { userId: paramUserId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user: authUser, isAuthenticated, loading: authLoading } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [stats, setStats] = useState({ totalPosts: 0, sharedPosts: 0 });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Comments modal state
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Determine which user to show
  const isOwnProfile = !paramUserId;
  const targetUserId = paramUserId || authUser?.phone;

  // Redirect to login if viewing own profile and not authenticated
  useEffect(() => {
    if (isOwnProfile && !authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: '/profile' }, replace: true });
    }
  }, [isOwnProfile, authLoading, isAuthenticated, navigate]);

  // Fetch profile data
  const fetchProfile = useCallback(async (pageNum = 1) => {
    if (!targetUserId) return;

    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const tab = activeTab === 0 ? 'posts' : 'shared';
      const response = await userAPI.getProfile(targetUserId, pageNum, authUser?.phone || null, tab);
      const data = response.data;

      setProfileUser(data.user);
      setStats(data.stats);

      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }
      setHasMore(data.pagination.hasMore);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [targetUserId, activeTab]);

  useEffect(() => {
    if (targetUserId) {
      setPage(1);
      fetchProfile(1);
    }
  }, [targetUserId, activeTab, fetchProfile]);

  // Infinite scroll
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setPage((prev) => {
            const newPage = prev + 1;
            fetchProfile(newPage);
            return newPage;
          });
        }
      },
      { threshold: 0.5 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, loadingMore, hasMore, fetchProfile]);

  // Posts are already filtered by API based on activeTab
  const filteredPosts = posts;

  // Handle like
  const handleLike = async (postId, isLiked) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      // For shared posts, like the original post
      const post = posts.find(p => p.postId === postId);
      const postIdToLike = post?.share || postId;
      
      const result = await discussionAPI.likePost(postIdToLike);
      if (result.data) {
        setPosts(prev => prev.map(p => {
          // Update the post that was clicked
          if (p.postId === postId) {
            // If it's a shared post, update original post data
            if (p.share && p.originalPost) {
              return {
                ...p,
                originalPost: {
                  ...p.originalPost,
                  postLikes: result.data.count,
                  isLiked: result.data.isLiked ? 1 : 0,
                },
                postLikes: result.data.count, // Also update main post likes for consistency
                isLiked: result.data.isLiked ? 1 : 0,
              };
            }
            // Regular post
            return { ...p, postLikes: result.data.count, isLiked: result.data.isLiked ? 1 : 0 };
          }
          // Update other shared posts of the same original post
          if (p.share && p.share === postIdToLike && p.postId !== postId) {
            return {
              ...p,
              originalPost: {
                ...p.originalPost,
                postLikes: result.data.count,
                isLiked: result.data.isLiked ? 1 : 0,
              },
              postLikes: result.data.count,
              isLiked: result.data.isLiked ? 1 : 0,
            };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  // Post menu handlers
  const handleDeletePost = async (postId) => {
    await discussionAPI.deletePost(postId);
    setPosts(prev => prev.filter(p => p.postId !== postId));
  };

  const handleReportPost = async (postId) => {
    const result = await discussionAPI.reportPost(postId);
    return result;
  };

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
          // Already shared - just show message, don't throw error
          return { alreadyShared: true, message: result.message || 'You have already shared this post' };
        }
        // Update share count for the original post
        setPosts(prev => prev.map(p =>
          p.postId === postId
            ? { ...p, shareCount: (p.shareCount || 0) + 1 }
            : p
        ));
        // Refresh shared posts tab if we're viewing own profile
        if (isOwnProfile && activeTab === 1) {
          await fetchProfile(1);
        }
      } else {
        throw new Error(result.message || 'Failed to share post');
      }
    } catch (err) {
      throw err;
    }
  };

  // Handle post creation callback
  const handlePostCreated = async () => {
    // Refresh profile to show new post
    await fetchProfile(1);
  };

  // Handle open comments
  const handleOpenComments = (post) => {
    // For shared posts, use the original post for comments
    const postForComments = post.share && post.originalPost 
      ? { ...post.originalPost, postId: post.share }
      : post;
    setSelectedPost(postForComments);
    setCommentsModalOpen(true);
  };

  // Handle close comments
  const handleCloseComments = () => {
    setCommentsModalOpen(false);
    setSelectedPost(null);
  };

  if (loading) return <ProfileSkeleton />;

  if (error || !profileUser) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          {error || 'User not found'}
        </Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2, textTransform: 'none' }}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Cover + Avatar Section */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: { xs: 0, sm: 0, md: 0 },
          overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        }}
      >
        {/* Cover Image */}
        <Box
          sx={{
            height: { xs: 160, sm: 200, md: 260 },
            background: profileUser.coverImage
              ? `url(${profileUser.coverImage}) center/cover no-repeat`
              : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 60%, ${alpha(theme.palette.primary.light, 0.8)} 100%)`,
            position: 'relative',
          }}
        >
          {isOwnProfile && (
            <IconButton
              onClick={() => navigate('/profile/edit')}
              size="small"
              sx={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                bgcolor: 'rgba(0,0,0,0.45)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' },
              }}
            >
              <CameraIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Profile info bar */}
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pb: 2, mt: { xs: -4.5, sm: -5.5 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.5, sm: 2.5 }}
            alignItems={{ xs: 'center', sm: 'flex-end' }}
          >
            {/* Avatar */}
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={profileUser.image}
                alt={profileUser.name}
                sx={{
                  width: { xs: 100, sm: 120 },
                  height: { xs: 100, sm: 120 },
                  border: '4px solid',
                  borderColor: 'background.paper',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
                  fontSize: '2.8rem',
                }}
              >
                {profileUser.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              {isOwnProfile && (
                <IconButton
                  onClick={() => navigate('/profile/edit')}
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 30,
                    height: 30,
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  <CameraIcon sx={{ fontSize: 15 }} />
                </IconButton>
              )}
            </Box>

            {/* Name + Meta */}
            <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' }, pt: { xs: 0, sm: 1 } }}>
              <Stack direction="row" alignItems="center" justifyContent={{ xs: 'center', sm: 'flex-start' }} spacing={1}>
                <Typography variant="h5" fontWeight={800}>
                  {profileUser.name}
                </Typography>
                {isOwnProfile && (
                  <IconButton
                    onClick={() => navigate('/profile/edit')}
                    size="small"
                    sx={{ color: 'text.secondary' }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>

              {/* Quick info chips */}
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                justifyContent={{ xs: 'center', sm: 'flex-start' }}
                sx={{ mt: 0.8, gap: 0.5 }}
              >
                {profileUser.work && (
                  <Chip icon={<WorkIcon sx={{ fontSize: 14 }} />} label={profileUser.work} size="small" variant="outlined" sx={{ height: 26, fontSize: '0.75rem' }} />
                )}
                {profileUser.education && (
                  <Chip icon={<EducationIcon sx={{ fontSize: 14 }} />} label={profileUser.education} size="small" variant="outlined" sx={{ height: 26, fontSize: '0.75rem' }} />
                )}
                {profileUser.region && (
                  <Chip icon={<LocationIcon sx={{ fontSize: 14 }} />} label={profileUser.region} size="small" variant="outlined" sx={{ height: 26, fontSize: '0.75rem' }} />
                )}
              </Stack>
            </Box>

            {/* Stats */}
            <Stack
              direction="row"
              spacing={{ xs: 3, sm: 4 }}
              sx={{
                pt: { xs: 1, sm: 1 },
                pb: { xs: 0, sm: 0 },
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={700}>{stats.totalPosts}</Typography>
                <Typography variant="caption" color="text.secondary">Posts</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={700}>{stats.sharedPosts}</Typography>
                <Typography variant="caption" color="text.secondary">Shared</Typography>
              </Box>
            </Stack>
          </Stack>

          {/* Bio */}
          {profileUser.bio && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 2,
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
                maxWidth: 600,
                textAlign: { xs: 'center', sm: 'left' },
              }}
            >
              {profileUser.bio}
            </Typography>
          )}
        </Box>

        {/* Tabs */}
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', px: { xs: 2, sm: 3, md: 4 } }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              '& .MuiTabs-indicator': {
                height: 2.5,
                borderRadius: '2px 2px 0 0',
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                minHeight: 44,
                px: 2.5,
              },
            }}
          >
            <Tab icon={<PostIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Posts" />
            <Tab icon={<PinIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Shared" />
          </Tabs>
        </Box>
      </Paper>

      {/* Create Post Box (only for own profile) */}
      {isOwnProfile && isAuthenticated && (
        <Box
          sx={{
            maxWidth: 680,
            mx: 'auto',
            px: { xs: 2, sm: 3 },
            mt: 3,
          }}
        >
          <CreatePost onPostCreated={handlePostCreated} />
        </Box>
      )}

      {/* Posts Feed */}
      <Box
        sx={{
          maxWidth: 680,
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          mt: isOwnProfile && isAuthenticated ? 0 : 3,
        }}
      >
        <Stack spacing={2}>
          {filteredPosts.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                p: 5,
                textAlign: 'center',
              }}
            >
              <PostIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                {activeTab === 0 ? 'No posts yet' : 'No shared posts yet'}
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                {activeTab === 0
                  ? `${profileUser.name} hasn't posted anything yet.`
                  : `${profileUser.name} hasn't shared any posts yet.`}
              </Typography>
            </Paper>
          ) : (
            filteredPosts.map((post) => (
              <Box key={post.postId}>
                <PostCard
                  post={{
                    ...post,
                    userName: post.share && post.originalPost ? post.originalPost.userName : profileUser.name,
                    userImage: post.share && post.originalPost ? post.originalPost.userImage : profileUser.image,
                    userId: post.share && post.originalPost ? post.originalPost.userId : targetUserId,
                    // For shared posts, show the sharer's info in the header
                    sharerName: profileUser.name,
                    sharerImage: profileUser.image,
                    sharerId: targetUserId,
                  }}
                  onLike={handleLike}
                  onNavigate={navigate}
                  onOpenComments={handleOpenComments}
                  currentUserId={authUser?.phone}
                  onDelete={isAuthenticated ? handleDeletePost : null}
                  onReport={isAuthenticated ? handleReportPost : null}
                  onHide={isAuthenticated ? handleHidePost : null}
                  onShare={isAuthenticated ? handleSharePost : null}
                />
              </Box>
            ))
          )}
        </Stack>

        {/* Infinite scroll sentinel */}
        {hasMore && (
          <Box ref={sentinelRef} sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            {loadingMore && <CircularProgress size={28} />}
          </Box>
        )}
      </Box>

      {/* Comments Modal */}
      <CommentsModal
        open={commentsModalOpen}
        onClose={handleCloseComments}
        post={selectedPost}
        user={authUser}
        isAuthenticated={isAuthenticated}
        navigate={navigate}
      />
    </Box>
  );
};

export default Profile;
