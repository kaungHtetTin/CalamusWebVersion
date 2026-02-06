import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Skeleton,
  Stack,
  IconButton,
  useTheme,
  alpha,
  Chip,
  Button,
  Divider,
  Tooltip,
  Avatar,
  TextField,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  PlayArrow as PlayIcon,
  ThumbUpOutlined as LikeIcon,
  ThumbUp as LikedIcon,
  ChatBubbleOutline as CommentIcon,
  Share as ShareIcon,
  VideoLibrary as VideoIcon,
  MoreHoriz as MoreIcon,
} from '@mui/icons-material';
import { videoChannelAPI } from '../services/api';
import { useDrawer } from '../context/DrawerContext';

// Format number to K, M format
const formatCount = (count) => {
  if (!count || count === 0) return '0';
  if (count < 1000) return count.toString();
  if (count < 1000000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
};

// Sidebar Video Item (YouTube style - compact horizontal card)
const SidebarVideoItem = ({ video, isActive, onClick }) => {
  const theme = useTheme();

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        gap: 0.75,
        cursor: 'pointer',
        p: 0.25,
        borderRadius: 0.75,
        bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
        transition: 'all 0.15s ease',
        '&:hover': {
          bgcolor: isActive ? alpha(theme.palette.primary.main, 0.12) : alpha('#000', 0.04),
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
          borderRadius: 0.75,
          overflow: 'hidden',
          bgcolor: 'grey.200',
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
};

// Mobile Video Card
const MobileVideoCard = ({ video, isActive, onClick }) => {
  const theme = useTheme();

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        gap: 1.5,
        cursor: 'pointer',
        py: 1,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 160,
          minWidth: 160,
          aspectRatio: '16/9',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'grey.200',
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
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <VideoIcon sx={{ fontSize: 24, color: 'primary.main', opacity: 0.5 }} />
          </Box>
        )}
        {video.formattedDuration && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              bgcolor: 'rgba(0,0,0,0.8)',
              color: 'white',
              px: 0.5,
              py: 0.25,
              borderRadius: 0.5,
              fontSize: '0.65rem',
              fontWeight: 500,
            }}
          >
            {video.formattedDuration}
          </Box>
        )}
        {isActive && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlayIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: '0.875rem',
            fontWeight: 500,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: isActive ? 'primary.main' : 'text.primary',
            mb: 0.5,
          }}
        >
          {video.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {video.formattedViewCount}
        </Typography>
      </Box>
    </Box>
  );
};

// Main Component
const WatchVideo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { drawerOpen } = useDrawer();

  // Show sidebar only on desktop when drawer is closed
  const showSidebar = isDesktop && !drawerOpen;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [showAllVideos, setShowAllVideos] = useState(false);

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
        setShowAllVideos(false);
        const response = await videoChannelAPI.getVideo(id);
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch video data:', err);
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleVideoSelect = (videoId) => {
    navigate(`/watch/${videoId}`);
  };

  const handleBack = () => navigate(-1);
  const handleLike = () => setLiked(!liked);
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: data?.video?.title,
        url: window.location.href,
      });
    }
  };

  // Loading
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f9f9f9', p: { xs: 0, lg: 3 } }}>
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
          bgcolor: '#f9f9f9',
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
    <Box sx={{ minHeight: '100vh', bgcolor: isDesktop ? '#f1f1f1' : '#fff' }}>
      {/* Main Layout Container */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: showSidebar ? 'row' : 'column',
          gap: showSidebar ? 3 : 0,
          maxWidth: 1800,
          mx: 'auto',
          p: { xs: 0, md: 3 },
        }}
      >
        {/* Left Column - Video Player & Info & Comments */}
        <Box sx={{ flex: 1, minWidth: 0, maxWidth: showSidebar ? 'calc(100% - 324px)' : '100%' }}>
          {/* Video Player */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/9',
              bgcolor: '#000',
              borderRadius: { xs: 0, md: 2 },
              overflow: 'hidden',
            }}
          >
            {/* Back Button */}
            <IconButton
              onClick={handleBack}
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                zIndex: 10,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
              }}
            >
              <BackIcon />
            </IconButton>

            {video.vimeoId ? (
              <iframe
                src={video.vimeoId}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={video.title}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography color="grey.500">Video not available</Typography>
              </Box>
            )}
          </Box>

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
                  <Typography fontWeight={600} sx={{ fontSize: '0.9rem' }}>
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
                      bgcolor: liked ? alpha(theme.palette.primary.main, 0.1) : alpha('#000', 0.05),
                      color: liked ? 'primary.main' : 'text.primary',
                      borderRadius: 5,
                      textTransform: 'none',
                      '&:hover': { bgcolor: alpha('#000', 0.1) },
                    }}
                    startIcon={liked ? <LikedIcon /> : <LikeIcon />}
                  >
                    {formatCount(video.likeCount)}
                  </Button>
                </Tooltip>

                {/* Share Button */}
                <Tooltip title="Share" arrow>
                  <Button
                    onClick={handleShare}
                    sx={{
                      minWidth: 'auto',
                      px: 2,
                      py: 0.75,
                      bgcolor: alpha('#000', 0.05),
                      color: 'text.primary',
                      borderRadius: 5,
                      textTransform: 'none',
                      '&:hover': { bgcolor: alpha('#000', 0.1) },
                    }}
                    startIcon={<ShareIcon sx={{ fontSize: 20 }} />}
                  >
                    Share
                  </Button>
                </Tooltip>

                {/* More Button */}
                <IconButton
                  sx={{
                    bgcolor: alpha('#000', 0.05),
                    '&:hover': { bgcolor: alpha('#000', 0.1) },
                  }}
                >
                  <MoreIcon />
                </IconButton>
              </Stack>
            </Box>

            {/* Comments Section */}
            <Box sx={{ mt: 3 }}>
              <Typography fontWeight={600} sx={{ mb: 2.5, fontSize: '1rem' }}>
                {formatCount(video.commentCount)} Comments
              </Typography>

              {/* Comment Input */}
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'grey.400',
                    fontSize: '0.9rem',
                  }}
                >
                  U
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    sx={{
                      '& .MuiInput-underline:before': {
                        borderBottomColor: 'divider',
                      },
                    }}
                  />
                  {comment && (
                    <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
                      <Button
                        size="small"
                        onClick={() => setComment('')}
                        sx={{ textTransform: 'none', color: 'text.primary' }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        disableElevation
                        sx={{ textTransform: 'none', borderRadius: 5 }}
                      >
                        Comment
                      </Button>
                    </Stack>
                  )}
                </Box>
              </Stack>

              {/* Comments Placeholder */}
              <Box sx={{ mt: 4, textAlign: 'center', py: 4 }}>
                <CommentIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
                <Typography color="text.secondary">
                  Comments will appear here
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Mobile: Related Videos (shown when sidebar is hidden) */}
          {!showSidebar && relatedVideos && relatedVideos.length > 0 && (
            <Box sx={{ px: 2, pb: 3, mt: 2 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography fontWeight={600} sx={{ mb: 2 }}>
                Related Videos
              </Typography>
              <Stack spacing={0}>
                {(showAllVideos ? relatedVideos : relatedVideos.slice(0, 10)).map((relatedVideo) => (
                  <MobileVideoCard
                    key={relatedVideo.id}
                    video={relatedVideo}
                    isActive={relatedVideo.id === video.id}
                    onClick={() => handleVideoSelect(relatedVideo.id)}
                  />
                ))}
              </Stack>
              {relatedVideos.length > 10 && !showAllVideos && (
                <Button
                  fullWidth
                  sx={{ mt: 2, textTransform: 'none' }}
                  onClick={() => setShowAllVideos(true)}
                >
                  View all {totalVideos} videos
                </Button>
              )}
            </Box>
          )}
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
            <Typography fontWeight={600} sx={{ mb: 1.5, fontSize: '0.9rem' }}>
              Related Videos
            </Typography>

            <Stack spacing={0.5}>
              {relatedVideos.map((relatedVideo) => (
                <SidebarVideoItem
                  key={relatedVideo.id}
                  video={relatedVideo}
                  isActive={relatedVideo.id === video.id}
                  onClick={() => handleVideoSelect(relatedVideo.id)}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default WatchVideo;
