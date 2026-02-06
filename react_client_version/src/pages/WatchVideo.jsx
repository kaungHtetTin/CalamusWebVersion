import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Skeleton,
  Stack,
  IconButton,
  useTheme,
  alpha,
  Divider,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Visibility as ViewIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  ArrowBack as BackIcon,
  VideoLibrary as VideoIcon,
} from '@mui/icons-material';
import { videoChannelAPI } from '../services/api';

// Channel configuration - same as VideoChannel
const CHANNEL_CONFIG = {
  english: { appId: '2', displayName: 'English' },
  korea: { appId: '1', displayName: 'Korean' },
};

// Video List Item Component
const VideoListItem = ({ video, isActive, onClick }) => {
  const theme = useTheme();

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        gap: { xs: 1, sm: 1.5 },
        p: { xs: 1, sm: 1.5 },
        cursor: 'pointer',
        borderRadius: 2,
        bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: isActive 
            ? alpha(theme.palette.primary.main, 0.15) 
            : alpha(theme.palette.common.black, 0.04),
        },
      }}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          position: 'relative',
          width: { xs: 120, sm: 160 },
          minWidth: { xs: 120, sm: 160 },
          aspectRatio: '16/9',
          borderRadius: 1.5,
          overflow: 'hidden',
          bgcolor: 'grey.200',
        }}
      >
        {video.thumbnail ? (
          <Box
            component="img"
            src={video.thumbnail}
            alt={video.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
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
            <VideoIcon sx={{ fontSize: 32, color: 'primary.main', opacity: 0.5 }} />
          </Box>
        )}

        {/* Duration Badge */}
        {video.formattedDuration && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              bgcolor: 'rgba(0,0,0,0.8)',
              color: 'white',
              px: 0.75,
              py: 0.25,
              borderRadius: 0.5,
              fontSize: '0.7rem',
              fontWeight: 500,
            }}
          >
            {video.formattedDuration}
          </Box>
        )}

        {/* Active Indicator */}
        {isActive && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlayIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
        )}
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          fontWeight={600}
          sx={{
            fontSize: '0.875rem',
            lineHeight: 1.4,
            mb: 0.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: isActive ? 'primary.main' : 'text.primary',
          }}
        >
          {video.title}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <ViewIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {video.formattedViewCount}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

// Video List Skeleton
const VideoListSkeleton = () => (
  <Box sx={{ display: 'flex', gap: 1.5, p: 1.5 }}>
    <Skeleton variant="rounded" width={160} sx={{ aspectRatio: '16/9' }} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="100%" height={20} />
      <Skeleton variant="text" width="60%" height={20} />
      <Skeleton variant="text" width="40%" height={16} />
    </Box>
  </Box>
);

// Main WatchVideo Component
const WatchVideo = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const index = parseInt(searchParams.get('index') || '0', 10);
  const channelId = searchParams.get('channel_id') || '';
  const channel = searchParams.get('channel') || '';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(index);

  // Find channel key from config
  const channelKey = Object.keys(CHANNEL_CONFIG).find(
    key => CHANNEL_CONFIG[key].displayName.toLowerCase() === channel.toLowerCase() ||
           key === channel.toLowerCase()
  );
  const appId = channelKey ? CHANNEL_CONFIG[channelKey].appId : null;

  useEffect(() => {
    const fetchData = async () => {
      if (!channelKey || !appId) {
        setError('Invalid channel');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await videoChannelAPI.get(channelKey, appId);
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch video data:', err);
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [channelKey, appId]);

  useEffect(() => {
    setCurrentIndex(index);
  }, [index]);

  const handleVideoSelect = (newIndex) => {
    setCurrentIndex(newIndex);
    // Update URL without full navigation
    const newParams = new URLSearchParams(searchParams);
    newParams.set('index', newIndex.toString());
    navigate(`/watch?${newParams.toString()}`, { replace: true });
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
        <Container maxWidth="xl" sx={{ py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2, md: 3 } }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mb: { xs: 1, sm: 2 } }} />
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={{ xs: 2, lg: 3 }}>
            {/* Video Player Skeleton */}
            <Box sx={{ flex: 1 }}>
              <Skeleton 
                variant="rounded" 
                sx={{ aspectRatio: '16/9', width: '100%', mb: { xs: 1.5, sm: 2 } }} 
              />
              <Box sx={{ bgcolor: 'white', borderRadius: { xs: 1, sm: 2 }, p: { xs: 2, sm: 3 } }}>
                <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="70%" height={32} />
                <Skeleton variant="text" width="40%" height={24} />
              </Box>
            </Box>

            {/* Video List Skeleton */}
            <Box sx={{ width: { lg: 400 }, bgcolor: 'white', borderRadius: { xs: 1, sm: 2 }, overflow: 'hidden' }}>
              <Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Skeleton variant="text" width={150} height={28} />
                <Skeleton variant="text" width={80} height={20} />
              </Box>
              {[1, 2, 3, 4, 5].map((i) => (
                <VideoListSkeleton key={i} />
              ))}
            </Box>
          </Stack>
        </Container>
      </Box>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#fafafa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <VideoIcon sx={{ fontSize: 100, color: 'grey.300', mb: 3 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Video Not Found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            {error || 'The video could not be loaded.'}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Find the current category and video
  const currentCategory = data.categories.find(cat => cat.id.toString() === channelId) || data.categories[0];
  const videos = currentCategory?.lessons || [];
  const currentVideo = videos[currentIndex] || videos[0];

  if (!currentVideo) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#fafafa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary">No video available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Back Button */}
        <IconButton 
          onClick={handleBack} 
          sx={{ mb: { xs: 1, sm: 2 } }}
        >
          <BackIcon />
        </IconButton>

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={{ xs: 2, lg: 3 }}>
          {/* Main Content - Video Player */}
          <Box sx={{ flex: 1 }}>
            {/* Video Player */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16/9',
                bgcolor: 'black',
                borderRadius: { xs: 1, sm: 2 },
                overflow: 'hidden',
                mb: { xs: 1.5, sm: 2 },
              }}
            >
              {currentVideo.vimeoId ? (
                <iframe
                  src={currentVideo.vimeoId}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={currentVideo.title}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.900',
                  }}
                >
                  <Typography color="grey.500">Video not available</Typography>
                </Box>
              )}
            </Box>

            {/* Video Info */}
            <Box sx={{ bgcolor: 'white', borderRadius: { xs: 1, sm: 2 }, p: { xs: 2, sm: 3 } }}>
              {/* Category */}
              <Typography 
                variant="subtitle2" 
                color="primary" 
                fontWeight={600}
                sx={{ mb: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                {currentCategory.title}
              </Typography>

              {/* Title */}
              <Typography 
                variant="h5" 
                fontWeight={700} 
                sx={{ 
                  mb: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                  lineHeight: 1.3,
                }}
              >
                {currentVideo.title}
              </Typography>

              {/* Stats & Actions */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={{ xs: 1.5, sm: 2 }}
              >
                {/* Stats */}
                <Stack direction="row" spacing={3}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <ViewIcon sx={{ fontSize: { xs: 16, sm: 20 }, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      {currentVideo.formattedViewCount} views
                    </Typography>
                  </Stack>
                </Stack>

                {/* Actions */}
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <IconButton 
                    size="small"
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                    }}
                  >
                    <ThumbUpOutlinedIcon sx={{ color: 'primary.main', fontSize: { xs: 18, sm: 22 } }} />
                  </IconButton>
                  <Typography 
                    variant="body2" 
                    sx={{ display: 'flex', alignItems: 'center', mr: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                  >
                    {currentVideo.likeCount || 0}
                  </Typography>

                  <IconButton 
                    size="small"
                    sx={{ 
                      bgcolor: alpha(theme.palette.grey[500], 0.1),
                      '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.2) },
                    }}
                  >
                    <CommentIcon sx={{ color: 'text.secondary', fontSize: { xs: 18, sm: 22 } }} />
                  </IconButton>
                  <Typography 
                    variant="body2" 
                    sx={{ display: 'flex', alignItems: 'center', mr: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                  >
                    {currentVideo.commentCount || 0}
                  </Typography>

                  <IconButton 
                    size="small"
                    sx={{ 
                      bgcolor: alpha(theme.palette.grey[500], 0.1),
                      '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.2) },
                    }}
                  >
                    <ShareIcon sx={{ color: 'text.secondary', fontSize: { xs: 18, sm: 22 } }} />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>
          </Box>

          {/* Sidebar - Video List */}
          <Box 
            sx={{ 
              width: { lg: 400 },
              bgcolor: 'white',
              borderRadius: { xs: 1, sm: 2 },
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {currentCategory.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                {videos.length} videos
              </Typography>
            </Box>

            {/* Video List */}
            <Box 
              sx={{ 
                maxHeight: { xs: 400, lg: 'calc(100vh - 200px)' },
                overflowY: 'auto',
              }}
            >
              {videos.map((video, idx) => (
                <VideoListItem
                  key={video.id}
                  video={video}
                  isActive={idx === currentIndex}
                  onClick={() => handleVideoSelect(idx)}
                />
              ))}
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default WatchVideo;
