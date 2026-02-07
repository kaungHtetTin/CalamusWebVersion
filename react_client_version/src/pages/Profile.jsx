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
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { userAPI, discussionAPI } from '../services/api';
import { PostCard } from '../components/PostCard';

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
      const response = await userAPI.getProfile(targetUserId, pageNum, authUser?.phone || null);
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
  }, [targetUserId]);

  useEffect(() => {
    if (targetUserId) {
      fetchProfile(1);
    }
  }, [targetUserId, fetchProfile]);

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

  // Filter posts by tab
  const filteredPosts = activeTab === 0
    ? posts
    : posts.filter((p) => p.showOnBlog === 1);

  // Handle like
  const handleLike = async (postId, isLiked) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const result = await discussionAPI.likePost(postId);
      if (result.data) {
        setPosts(prev => prev.map(p =>
          p.postId === postId
            ? { ...p, postLikes: result.data.count, isLiked: result.data.isLiked ? 1 : 0 }
            : p
        ));
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
                  <IconButton size="small" sx={{ color: 'text.secondary' }}>
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

      {/* Posts Feed */}
      <Box
        sx={{
          maxWidth: 680,
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          mt: 3,
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
              <PostCard
                key={post.postId}
                post={{
                  ...post,
                  userName: profileUser.name,
                  userImage: profileUser.image,
                  userId: targetUserId,
                }}
                onLike={handleLike}
                onNavigate={navigate}
                onOpenComments={(p) => navigate(`/post/${p.postId}`)}
                currentUserId={authUser?.phone}
                onDelete={isAuthenticated ? handleDeletePost : null}
                onReport={isAuthenticated ? handleReportPost : null}
                onHide={isAuthenticated ? handleHidePost : null}
              />
            ))
          )}
        </Stack>

        {/* Infinite scroll sentinel */}
        {hasMore && activeTab === 0 && (
          <Box ref={sentinelRef} sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            {loadingMore && <CircularProgress size={28} />}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Profile;
