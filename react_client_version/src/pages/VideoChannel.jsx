import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Avatar,
  Skeleton,
  Stack,
  useTheme,
  alpha,
  useMediaQuery,
  Slide,
  useScrollTrigger,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Visibility as ViewIcon,
  VideoLibrary as VideoIcon,
} from '@mui/icons-material';
import { videoChannelAPI } from '../services/api';

// Channel configuration - maps channel names to app IDs
// Easy to add more languages in the future
const CHANNEL_CONFIG = {
  english: { appId: '2', displayName: 'English' },
  korea: { appId: '1', displayName: 'Korean' },
  // Add more languages here:
  // japanese: { appId: '3', displayName: 'Japanese' },
  // chinese: { appId: '4', displayName: 'Chinese' },
};

// Video Card Component
const VideoCard = ({ video, channelId, channelName, onClick }) => {
  const theme = useTheme();

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'white',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
        },
        '&:hover .play-overlay': {
          opacity: 1,
        },
      }}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '16/9',
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
            <VideoIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.5 }} />
          </Box>
        )}

        {/* Play Overlay */}
        <Box
          className="play-overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              bgcolor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlayIcon sx={{ fontSize: 28, color: 'primary.main', ml: 0.3 }} />
          </Box>
        </Box>

        {/* Duration Badge */}
        {video.formattedDuration && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.8)',
              color: 'white',
              px: 1,
              py: 0.25,
              borderRadius: 0.5,
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            {video.formattedDuration}
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {/* View Count */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
          <ViewIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {video.formattedViewCount}
          </Typography>
        </Stack>

        {/* Title */}
        <Typography
          fontWeight={600}
          sx={{
            mb: 0.5,
            fontSize: '0.95rem',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {video.title}
        </Typography>

        {/* Category */}
        <Typography variant="caption" color="text.secondary">
          {channelName}
        </Typography>
      </Box>
    </Box>
  );
};

// Video Card Skeleton
const VideoCardSkeleton = () => (
  <Box sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: 'white' }}>
    <Skeleton variant="rectangular" sx={{ aspectRatio: '16/9' }} />
    <Box sx={{ p: 2 }}>
      <Skeleton variant="text" width="40%" height={20} />
      <Skeleton variant="text" width="100%" height={24} />
      <Skeleton variant="text" width="60%" height={20} />
    </Box>
  </Box>
);

// Responsive Grid for Videos
const VideoGrid = ({ children }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(4, 1fr)',
      },
      gap: { xs: 2, sm: 2.5, md: 3 },
    }}
  >
    {children}
  </Box>
);

// Main VideoChannel Component
const VideoChannel = () => {
  const { channel } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const scrollTrigger = useScrollTrigger();

  // Get channel config - maps channel name to appId
  const channelConfig = CHANNEL_CONFIG[channel];
  const appId = channelConfig?.appId;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!channel || !channelConfig) {
        setError(`Unknown channel: ${channel}. Supported channels: ${Object.keys(CHANNEL_CONFIG).join(', ')}`);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await videoChannelAPI.get(channel, appId);
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch video channel:', err);
        setError('Failed to load video channel');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [channel, channelConfig, appId]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleChipClick = (index) => {
    setActiveTab(index);
  };

  const handleVideoClick = (video) => {
    navigate(`/watch/${video.id}`);
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
        {/* Hero Skeleton */}
        <Box 
          sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            py: { xs: 3, sm: 4, md: 5 },
            px: { xs: 2, sm: 0 },
          }}
        >
          <Container maxWidth="lg">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 3 }} alignItems="center">
              <Skeleton 
                variant="circular" 
                sx={{ 
                  width: { xs: 56, sm: 64, md: 80 }, 
                  height: { xs: 56, sm: 64, md: 80 },
                  bgcolor: alpha('#fff', 0.1),
                }}
              />
              <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' }, width: '100%' }}>
                <Skeleton 
                  variant="text" 
                  sx={{ 
                    width: { xs: 150, sm: 200 }, 
                    height: { xs: 28, sm: 36 },
                    bgcolor: alpha('#fff', 0.1), 
                    mb: 0.5, 
                    mx: { xs: 'auto', sm: 0 },
                  }} 
                />
                <Skeleton 
                  variant="text" 
                  sx={{ 
                    width: { xs: '100%', sm: 350 }, 
                    maxWidth: 350,
                    height: { xs: 18, sm: 22 },
                    bgcolor: alpha('#fff', 0.1), 
                    mx: { xs: 'auto', sm: 0 },
                  }} 
                />
              </Box>
            </Stack>
          </Container>
        </Box>

        {/* Tabs Skeleton */}
        <Box sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 2, md: 3 } }}>
            {/* Mobile: Multiline chips skeleton */}
            <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexWrap: 'wrap', gap: 1, py: 2 }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton 
                  key={i} 
                  variant="rounded" 
                  sx={{ 
                    width: i % 2 === 0 ? 80 : 100, 
                    height: 32,
                    borderRadius: 1,
                  }} 
                />
              ))}
            </Box>
            {/* Desktop: Tabs skeleton */}
            <Stack 
              direction="row" 
              spacing={2} 
              sx={{ py: 2, display: { xs: 'none', sm: 'flex' } }}
            >
              {[1, 2, 3, 4].map((i) => (
                <Skeleton 
                  key={i} 
                  variant="text" 
                  sx={{ 
                    width: 100, 
                    height: 40,
                    flexShrink: 0,
                  }} 
                />
              ))}
            </Stack>
          </Container>
        </Box>

        {/* Content Skeleton */}
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 2, md: 3 } }}>
          <VideoGrid>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </VideoGrid>
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
            Channel Not Found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            {error || 'The video channel could not be loaded.'}
          </Typography>
        </Box>
      </Box>
    );
  }

  const { app, categories } = data;
  const activeCategory = categories[activeTab] || categories[0];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      {/* Hero Section - Clean Design */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          py: { xs: 3, sm: 4, md: 5 },
          px: { xs: 2, sm: 0 },
        }}
      >
        <Container maxWidth="lg">
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 1.5, sm: 2, md: 3 }} 
            alignItems="center"
          >
            {/* App Icon */}
            <Avatar
              src={app.icon}
              sx={{
                width: { xs: 56, sm: 64, md: 80 },
                height: { xs: 56, sm: 64, md: 80 },
                border: '3px solid',
                borderColor: alpha('#fff', 0.3),
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                bgcolor: 'white',
              }}
            >
              <Typography variant="h4" color="primary">
                {app.name?.charAt(0)}
              </Typography>
            </Avatar>

            {/* App Info */}
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, flex: 1 }}>
              {/* App Name */}
              <Typography 
                variant="h4" 
                fontWeight={700} 
                color="white"
                sx={{ 
                  mb: 0.5,
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                }}
              >
                {app.name}
              </Typography>

              {/* Description */}
              <Typography 
                color="white"
                sx={{ 
                  opacity: 0.9,
                  maxWidth: 500,
                  fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.95rem' },
                  lineHeight: 1.6,
                  mx: { xs: 'auto', sm: 0 },
                  display: { xs: '-webkit-box', sm: 'block' },
                  WebkitLineClamp: { xs: 2, sm: 'unset' },
                  WebkitBoxOrient: 'vertical',
                  overflow: { xs: 'hidden', sm: 'visible' },
                }}
              >
                {app.description}
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Tab Navigation - Multiline chips on mobile, Tabs on desktop */}
      <Slide appear={false} direction="down" in={isMobile ? !scrollTrigger : true}>
        <Box
          sx={{
            bgcolor: 'white',
            borderBottom: '1px solid',
            borderColor: 'divider',
            position: 'sticky',
            top: { xs: 56, sm: 64 },
            zIndex: 10,
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 2, md: 3 } }}>
            {/* Mobile: Multiline Wrapped Tabs with Underline */}
            {isMobile ? (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.5,
                  py: 1,
                }}
              >
                {categories.map((cat, index) => (
                  <Box
                    key={cat.id}
                    onClick={() => handleChipClick(index)}
                    sx={{
                      position: 'relative',
                      px: 1.5,
                      py: 1,
                      cursor: 'pointer',
                      fontWeight: activeTab === index ? 600 : 500,
                      fontSize: '0.85rem',
                      color: activeTab === index ? 'primary.main' : 'text.secondary',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: 'primary.main',
                      },
                      // Underline indicator
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 8,
                        right: 8,
                        height: 3,
                        borderRadius: '3px 3px 0 0',
                        bgcolor: activeTab === index ? 'primary.main' : 'transparent',
                        transition: 'background-color 0.2s ease',
                      },
                    }}
                  >
                    {cat.title}
                  </Box>
                ))}
              </Box>
            ) : (
              /* Desktop: Horizontal Tabs */
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                    bgcolor: 'primary.main',
                  },
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    minWidth: 100,
                    px: 2,
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      color: 'primary.main',
                    },
                  },
                }}
              >
                {categories.map((cat, index) => (
                  <Tab key={cat.id} label={cat.title} />
                ))}
              </Tabs>
            )}
          </Container>
        </Box>
      </Slide>

      {/* Video Grid Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 2, md: 3 } }}>
        {activeCategory && activeCategory.lessons?.length > 0 ? (
          <VideoGrid>
            {activeCategory.lessons.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                channelId={activeCategory.id}
                channelName={activeCategory.title}
                onClick={() => handleVideoClick(video)}
              />
            ))}
          </VideoGrid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <VideoIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No videos in this category
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default VideoChannel;
