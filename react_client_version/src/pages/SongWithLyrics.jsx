import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Slider,
  Avatar,
  Stack,
  Skeleton,
  Tabs,
  Tab,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  Paper,
  Chip,
  Collapse,
  Fade,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipPrevious as PrevIcon,
  SkipNext as NextIcon,
  FavoriteBorder as LikeIcon,
  Favorite as LikedIcon,
  Download as DownloadIcon,
  MusicNote as MusicIcon,
  QueueMusic as PlaylistIcon,
  Person as ArtistIcon,
  KeyboardArrowUp as ExpandLessIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  Whatshot as PopularIcon,
  LibraryMusic as AllSongsIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { songAPI } from '../services/api';
import { useThemeMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// Category config
const CATEGORY_CONFIG = {
  english: { displayName: 'English Songs', description: 'Learn English through music' },
  korea: { displayName: 'Korean Songs', description: 'Learn Korean through K-Pop' },
};

// Format duration from seconds to mm:ss
const formatDuration = (seconds) => {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format count to K, M format
const formatCount = (count) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count;
};

// Song Card Component (for grid display)
const SongCard = ({ song, isActive, onClick, size = 'medium' }) => {
  const theme = useTheme();
  const sizes = {
    small: { width: 120, imgSize: 120 },
    medium: { width: 160, imgSize: 160 },
    large: { width: 200, imgSize: 200 },
  };
  const s = sizes[size];
  
  return (
    <Box
      onClick={onClick}
      sx={{
        width: s.width,
        minWidth: s.width,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          aspectRatio: '1/1',
          boxShadow: isActive
            ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`
            : theme.palette.mode === 'light' ? '0 4px 12px rgba(0,0,0,0.1)' : '0 4px 16px rgba(0,0,0,0.3)',
          border: isActive ? `3px solid ${theme.palette.primary.main}` : 'none',
        }}
      >
        <Box
          component="img"
          src={song.imageUrl}
          alt={song.title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/160?text=♪';
          }}
        />
        {isActive && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: alpha(theme.palette.primary.main, 0.2),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MusicIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
          </Box>
        )}
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: 'rgba(0,0,0,0.7)',
            px: 1,
            py: 0.25,
            borderRadius: 1,
          }}
        >
          <LikedIcon sx={{ fontSize: 12, color: 'error.light' }} />
          <Typography variant="caption" color="white" fontWeight={500}>
            {formatCount(song.likeCount)}
          </Typography>
        </Box>
      </Box>
      <Typography
        variant="body2"
        fontWeight={600}
        sx={{
          mt: 1.5,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {song.title}
      </Typography>
      <Typography variant="caption" color="text.secondary" noWrap>
        {song.artist}
      </Typography>
    </Box>
  );
};

// Song List Item Component
const SongListItem = ({ song, isActive, onClick, index }) => {
  const theme = useTheme();

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 1.5,
        borderRadius: 2,
        cursor: 'pointer',
        bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: isActive
            ? alpha(theme.palette.primary.main, 0.15)
            : theme.palette.mode === 'light' ? 'grey.50' : alpha(theme.palette.common.white, 0.05),
        },
      }}
    >
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ width: 24, textAlign: 'center' }}
      >
        {index + 1}
      </Typography>
      <Avatar
        src={song.imageUrl}
        variant="rounded"
        sx={{ 
          width: 48, 
          height: 48,
          border: isActive ? `2px solid ${theme.palette.primary.main}` : 'none',
        }}
      >
        <MusicIcon />
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          fontWeight={isActive ? 600 : 500}
          color={isActive ? 'primary.main' : 'text.primary'}
          noWrap
          sx={{ fontSize: '0.95rem' }}
        >
          {song.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {song.artist}
        </Typography>
      </Box>
      <Stack direction="row" spacing={2} alignItems="center">
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <LikedIcon sx={{ fontSize: 14, color: 'error.light' }} />
          <Typography variant="caption" color="text.secondary">
            {formatCount(song.likeCount)}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <DownloadIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {formatCount(song.downloadCount)}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

// Artist Card Component
const ArtistCard = ({ artist, onClick }) => {
  const theme = useTheme();

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 2,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'scale(1.05)',
          bgcolor: theme.palette.mode === 'light' ? 'action.hover' : alpha(theme.palette.common.white, 0.05),
        },
      }}
    >
      <Avatar
        src={artist.imageUrl}
        sx={{ width: 72, height: 72, mb: 1.5, boxShadow: 2 }}
      >
        <ArtistIcon />
      </Avatar>
      <Typography variant="body2" fontWeight={500} textAlign="center">
        {artist.name}
      </Typography>
    </Box>
  );
};

// Now Playing Section Component
const NowPlayingSection = ({ 
  song, 
  isPlaying, 
  currentTime, 
  duration,
  lyrics,
  loadingLyrics,
  onPlayPause, 
  onPrev, 
  onNext, 
  onSeek,
  onDownload,
  onLike,
  liked = false,
  expanded,
  onToggleExpand,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  if (!song) return null;
  
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: theme.palette.mode === 'light' ? alpha(theme.palette.primary.main, 0.03) : alpha(theme.palette.primary.main, 0.08),
        borderRadius: 3,
        overflow: 'hidden',
        border: 'none',
        boxShadow: theme.palette.mode === 'light' ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}` : '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Main Player Area */}
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={{ xs: 2, md: 4 }}
          alignItems={{ xs: 'center', md: 'flex-start' }}
        >
          {/* Album Art */}
          <Box
            sx={{
              width: { xs: 200, md: 180 },
              height: { xs: 200, md: 180 },
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={song.imageUrl}
              alt={song.title}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/180?text=♪';
              }}
            />
          </Box>
          
          {/* Song Info & Controls */}
          <Box sx={{ flex: 1, minWidth: 0, width: '100%', textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="overline" color="primary" fontWeight={600}>
              Now Playing
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
              {song.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {song.artist}
            </Typography>
            
            {/* Progress Bar */}
            <Box sx={{ mb: 1 }}>
              <Slider
                size="small"
                value={duration ? (currentTime / duration) * 100 : 0}
                onChange={(_, value) => onSeek(value)}
                sx={{
                  '& .MuiSlider-thumb': {
                    width: 14,
                    height: 14,
                  },
                  '& .MuiSlider-rail': {
                    opacity: 0.3,
                  },
                }}
              />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  {formatDuration(currentTime)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDuration(duration)}
                </Typography>
              </Stack>
            </Box>
            
            {/* Controls */}
            <Stack 
              direction="row" 
              spacing={1} 
              alignItems="center" 
              justifyContent={{ xs: 'center', md: 'flex-start' }}
            >
              <IconButton onClick={onPrev} size="large">
                <PrevIcon />
              </IconButton>
              <IconButton 
                onClick={onPlayPause}
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                {isPlaying ? <PauseIcon sx={{ fontSize: 32 }} /> : <PlayIcon sx={{ fontSize: 32 }} />}
              </IconButton>
              <IconButton onClick={onNext} size="large">
                <NextIcon />
              </IconButton>
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              <IconButton size="small" onClick={onLike} sx={{ color: liked ? 'error.main' : undefined }}>
                {liked ? <LikedIcon /> : <LikeIcon />}
              </IconButton>
              <IconButton size="small" onClick={onDownload}>
                <DownloadIcon />
              </IconButton>
            </Stack>
          </Box>
        </Stack>
      </Box>
      
      {/* Expandable Lyrics Section */}
      <Box
        onClick={onToggleExpand}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 1,
          cursor: 'pointer',
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          },
        }}
      >
        <Typography variant="body2" color="primary" fontWeight={500} sx={{ mr: 0.5 }}>
          {expanded ? 'Hide Full Lyrics' : 'View Full Lyrics'}
        </Typography>
        {expanded ? <ExpandLessIcon color="primary" /> : <ExpandMoreIcon color="primary" />}
      </Box>
      
      <Collapse in={expanded}>
        <Box
          sx={{
            p: 3,
            maxHeight: 400,
            overflowY: 'auto',
            bgcolor: 'background.paper',
          }}
        >
          {loadingLyrics ? (
            <Stack spacing={1} alignItems="center">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} variant="text" width={`${90 - (i % 3) * 15}%`} />
              ))}
            </Stack>
          ) : (
            <Typography
              sx={{
                whiteSpace: 'pre-line',
                lineHeight: 2.2,
                textAlign: 'center',
                fontSize: '1.1rem',
              }}
            >
              {lyrics}
            </Typography>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

// Mini Player Component (Sticky)
const MiniPlayer = ({ 
  song, 
  isPlaying, 
  currentTime, 
  duration,
  onPlayPause, 
  onPrev, 
  onNext,
  visible,
}) => {
  const theme = useTheme();
  
  if (!song || !visible) return null;
  
  const progress = duration ? (currentTime / duration) * 100 : 0;
  
  return (
    <Fade in={visible}>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          borderRadius: '16px 16px 0 0',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Progress indicator */}
        <Box
          sx={{
            height: 3,
            bgcolor: theme.palette.mode === 'light' ? 'grey.200' : alpha(theme.palette.common.white, 0.1),
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${progress}%`,
              bgcolor: 'primary.main',
              transition: 'width 0.5s linear',
            }}
          />
        </Box>
        
        <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 1.5 }}>
          <Avatar
            src={song.thumbnailUrl || song.imageUrl}
            variant="rounded"
            sx={{ width: 48, height: 48 }}
          >
            <MusicIcon />
          </Avatar>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={600} noWrap sx={{ fontSize: '0.9rem' }}>
              {song.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {song.artist}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={0.5} alignItems="center">
            <IconButton size="small" onClick={onPrev}>
              <PrevIcon fontSize="small" />
            </IconButton>
            <IconButton 
              onClick={onPlayPause}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
            <IconButton size="small" onClick={onNext}>
              <NextIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>
    </Fade>
  );
};

// Main Component
const SongWithLyrics = () => {
  const { category = 'english' } = useParams();
  const theme = useTheme();
  const { mode } = useThemeMode();
  const { user, isAuthenticated } = useAuth();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  const audioRef = useRef(new Audio());
  const nowPlayingRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [allSongs, setAllSongs] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Player state
  const [currentSong, setCurrentSong] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lyrics, setLyrics] = useState('');
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState(0);
  const [lyricsExpanded, setLyricsExpanded] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistSongs, setArtistSongs] = useState([]);
  const [loadingArtist, setLoadingArtist] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  const categoryConfig = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.english;
  
  // Handle artist selection - fetch songs from API
  const handleArtistClick = async (artistName) => {
    setSelectedArtist(artistName);
    setActiveTab(0); // Switch to Popular tab
    setLoadingArtist(true);
    
    try {
      const response = await songAPI.getByArtist(category, artistName, user?.phone || null);
      if (response.success && response.data.songs) {
        setArtistSongs(response.data.songs);
      } else {
        setArtistSongs([]);
      }
    } catch (err) {
      console.error('Failed to fetch artist songs:', err);
      setArtistSongs([]);
    } finally {
      setLoadingArtist(false);
    }
  };
  
  // Clear artist filter
  const clearArtistFilter = () => {
    setSelectedArtist(null);
    setArtistSongs([]);
  };

  // Scroll detection for mini player
  useEffect(() => {
    const handleScroll = () => {
      if (nowPlayingRef.current) {
        const rect = nowPlayingRef.current.getBoundingClientRect();
        setShowMiniPlayer(rect.bottom < 0);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await songAPI.get(category, 1, user?.phone || null);
        setData(response.data);
        setAllSongs(response.data.songs || []);
        setHasMore(response.data.pagination?.hasMore || false);
        
        // Auto-select first song
        if (response.data.songs && response.data.songs.length > 0) {
          setCurrentSong(response.data.songs[0]);
          setCurrentIndex(0);
        }
      } catch (err) {
        console.error('Failed to fetch songs:', err);
        setError('Failed to load songs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    setPage(1);
    setAllSongs([]);
    setActiveTab(0);
    
    // Cleanup audio on unmount
    return () => {
      audioRef.current.pause();
      audioRef.current.src = '';
    };
  }, [category, user?.phone]);

  // Load more songs
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await songAPI.get(category, nextPage, user?.phone || null);
      
      setAllSongs(prev => [...prev, ...(response.data.songs || [])]);
      setHasMore(response.data.pagination?.hasMore || false);
      setPage(nextPage);
    } catch (err) {
      console.error('Failed to load more songs:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [category, page, loadingMore, hasMore, user?.phone]);

  // Fetch lyrics when song changes
  useEffect(() => {
    if (!currentSong?.url) return;
    
    const fetchLyrics = async () => {
      setLoadingLyrics(true);
      try {
        const response = await songAPI.getLyrics(currentSong.url);
        setLyrics(response.data?.lyrics || 'Lyrics not available');
      } catch (err) {
        setLyrics('Lyrics not available');
      } finally {
        setLoadingLyrics(false);
      }
    };
    
    fetchLyrics();
  }, [currentSong?.url]);

  // Define handlers with useCallback to avoid stale closures
  // Use artistSongs when an artist is selected, otherwise use allSongs
  const handleNext = useCallback(() => {
    const songList = selectedArtist && artistSongs.length > 0 ? artistSongs : allSongs;
    if (songList.length === 0) return;
    const newIndex = currentIndex < songList.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    setCurrentSong(songList[newIndex]);
    setIsPlaying(true);
  }, [currentIndex, allSongs, selectedArtist, artistSongs]);

  const handlePrev = useCallback(() => {
    const songList = selectedArtist && artistSongs.length > 0 ? artistSongs : allSongs;
    if (songList.length === 0) return;
    const newIndex = currentIndex > 0 ? currentIndex - 1 : songList.length - 1;
    setCurrentIndex(newIndex);
    setCurrentSong(songList[newIndex]);
    setIsPlaying(true);
  }, [currentIndex, allSongs, selectedArtist, artistSongs]);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Audio player event listeners
  useEffect(() => {
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => handleNext();
    const handleError = () => {
      console.error('Audio error');
      setIsPlaying(false);
    };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [handleNext]);

  // Load track when currentSong changes
  useEffect(() => {
    if (!currentSong?.audioUrl) return;
    
    const audio = audioRef.current;
    audio.src = currentSong.audioUrl;
    audio.load();
    
    if (isPlaying) {
      audio.play().catch(console.error);
    }
  }, [currentSong?.audioUrl, isPlaying]);

  const handleSeek = (value) => {
    const audio = audioRef.current;
    const newTime = (value / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSongSelect = (song, index) => {
    setCurrentSong(song);
    setCurrentIndex(index);
    setIsPlaying(true);
    // Scroll to now playing section
    nowPlayingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Update song in a list by id (merge updates into the matching song)
  const updateSongInList = useCallback((list, songId, updates) => {
    if (!Array.isArray(list)) return list;
    return list.map((s) =>
      String(s.id) === String(songId) ? { ...s, ...updates } : s
    );
  }, []);

  const handleLike = useCallback(async () => {
    if (!currentSong?.id) return;
    if (!isAuthenticated || !user?.phone) {
      setSnackbar({ open: true, message: 'Please log in to like songs', severity: 'info' });
      return;
    }
    try {
      const res = await songAPI.like(currentSong.id);
      if (!res?.success) return;
      const { liked: newLiked, likeCount } = res;
      setCurrentSong((prev) => (prev ? { ...prev, liked: newLiked, likeCount } : null));
      setAllSongs((prev) => updateSongInList(prev, currentSong.id, { liked: newLiked, likeCount }));
      setData((prev) => {
        if (!prev?.popularSongs) return prev;
        return {
          ...prev,
          popularSongs: updateSongInList(prev.popularSongs, currentSong.id, { liked: newLiked, likeCount }),
        };
      });
      setArtistSongs((prev) => updateSongInList(prev, currentSong.id, { liked: newLiked, likeCount }));
    } catch (err) {
      console.error('Like failed:', err);
    }
  }, [currentSong?.id, isAuthenticated, user?.phone, updateSongInList]);

  const handleDownload = useCallback(async () => {
    if (!currentSong?.id || !currentSong?.audioUrl) return;
    try {
      const res = await songAPI.download(currentSong.id);
      if (res?.success && typeof res.downloadCount === 'number') {
        const downloadCount = res.downloadCount;
        setCurrentSong((prev) => (prev ? { ...prev, downloadCount } : null));
        setAllSongs((prev) => updateSongInList(prev, currentSong.id, { downloadCount }));
        setData((prev) => {
          if (!prev?.popularSongs) return prev;
          return {
            ...prev,
            popularSongs: updateSongInList(prev.popularSongs, currentSong.id, { downloadCount }),
          };
        });
        setArtistSongs((prev) => updateSongInList(prev, currentSong.id, { downloadCount }));
      }
    } catch (err) {
      console.error('Download count update failed:', err);
    }
    window.open(currentSong.audioUrl, '_blank');
  }, [currentSong?.id, currentSong?.audioUrl, updateSongInList]);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 }, width: '100%', boxSizing: 'border-box', bgcolor: 'background.default' }}>
        <Skeleton variant="rounded" height={300} sx={{ mb: 3 }} />
        <Stack direction="row" spacing={2} sx={{ mb: 3, overflowX: 'hidden' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="rounded" width={160} height={200} sx={{ flexShrink: 0 }} />
          ))}
        </Stack>
        <Stack spacing={1}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rounded" height={70} />
          ))}
        </Stack>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        sx={{
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
          bgcolor: 'background.default',
        }}
      >
        <MusicIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
        <Typography variant="h5" fontWeight={600}>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Box>
    );
  }

  const { popularSongs = [], artists = [] } = data || {};
  
  // When artist is selected, use artistSongs from API; otherwise use regular lists
  const displayPopularSongs = selectedArtist ? artistSongs : popularSongs;
  const displayAllSongs = selectedArtist ? artistSongs : allSongs;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: showMiniPlayer ? 10 : 4, width: '100%', overflowX: 'hidden' }}>
      {/* Page Header */}
      <Box sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
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
          <Typography
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.primary',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            <MusicIcon sx={{ mr: 0.5, fontSize: 16 }} />
            {categoryConfig.displayName}
          </Typography>
        </Breadcrumbs>
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={2}
        >
          <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
            <MusicIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-1px', mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              {categoryConfig.displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {categoryConfig.description} • {data?.pagination?.total || 0} songs
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ width: '100%', py: { xs: 2, md: 3 }, px: { xs: 2, sm: 3, md: 4 }, boxSizing: 'border-box' }}>
        {/* Now Playing Section */}
        <Box ref={nowPlayingRef} sx={{ mb: 4 }}>
          <NowPlayingSection
            song={currentSong}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            lyrics={lyrics}
            loadingLyrics={loadingLyrics}
            onPlayPause={handlePlayPause}
            onPrev={handlePrev}
            onNext={handleNext}
            onSeek={handleSeek}
            onDownload={handleDownload}
            liked={currentSong?.liked ?? false}
            onLike={handleLike}
            expanded={lyricsExpanded}
            onToggleExpand={() => setLyricsExpanded(!lyricsExpanded)}
          />
        </Box>

        {/* Content Tabs */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper', boxShadow: mode === 'light' ? '0 2px 16px rgba(0,0,0,0.06)' : '0 4px 20px rgba(0,0,0,0.3)' }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant={isDesktop ? 'standard' : 'fullWidth'}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: mode === 'light' ? '0 1px 4px rgba(0,0,0,0.04)' : '0 1px 4px rgba(0,0,0,0.2)',
              '& .MuiTab-root': {
                minHeight: 56,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
              },
            }}
          >
            <Tab 
              icon={<PopularIcon />} 
              iconPosition="start" 
              label={`Popular (${popularSongs.length})`} 
            />
            <Tab 
              icon={<AllSongsIcon />} 
              iconPosition="start" 
              label={`All Songs (${data?.pagination?.total || 0})`} 
            />
            <Tab 
              icon={<ArtistIcon />} 
              iconPosition="start" 
              label={`Artists (${artists.length})`} 
            />
          </Tabs>

          <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Artist Filter Indicator */}
            {selectedArtist && (activeTab === 0 || activeTab === 1) && (
              <Box sx={{ mb: 2 }}>
                <Chip
                  icon={<ArtistIcon />}
                  label={`Filtered by: ${selectedArtist}`}
                  onDelete={clearArtistFilter}
                  deleteIcon={<CloseIcon />}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            )}

            {/* Popular Songs Tab */}
            {activeTab === 0 && (
              <>
                {loadingArtist ? (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: 'repeat(auto-fill, minmax(120px, 1fr))',
                        sm: 'repeat(auto-fill, minmax(140px, 1fr))',
                        md: 'repeat(auto-fill, minmax(160px, 1fr))',
                      },
                      gap: { xs: 2, md: 3 },
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} variant="rounded" sx={{ width: '100%', aspectRatio: '1/1.3' }} />
                    ))}
                  </Box>
                ) : displayPopularSongs.length > 0 ? (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: 'repeat(auto-fill, minmax(120px, 1fr))',
                        sm: 'repeat(auto-fill, minmax(140px, 1fr))',
                        md: 'repeat(auto-fill, minmax(160px, 1fr))',
                      },
                      gap: { xs: 2, md: 3 },
                    }}
                  >
                    {displayPopularSongs.map((song) => (
                      <SongCard
                        key={song.id}
                        song={song}
                        size={isDesktop ? 'medium' : 'small'}
                        isActive={currentSong?.id === song.id}
                        onClick={() => {
                          // When filtering by artist, use artistSongs index
                          const idx = selectedArtist 
                            ? artistSongs.findIndex(s => s.id === song.id)
                            : allSongs.findIndex(s => s.id === song.id);
                          handleSongSelect(song, idx >= 0 ? idx : 0);
                        }}
                      />
                    ))}
                  </Box>
                ) : selectedArtist ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      No songs found for {selectedArtist}
                    </Typography>
                    <Button 
                      variant="text" 
                      onClick={clearArtistFilter}
                      sx={{ mt: 1 }}
                    >
                      Show all songs
                    </Button>
                  </Box>
                ) : null}
              </>
            )}

            {/* All Songs Tab */}
            {activeTab === 1 && (
              <>
                {loadingArtist ? (
                  <Stack spacing={1}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} variant="rounded" height={60} />
                    ))}
                  </Stack>
                ) : displayAllSongs.length > 0 ? (
                  <Stack spacing={0.5}>
                    {displayAllSongs.map((song, index) => (
                      <SongListItem
                        key={song.id}
                        song={song}
                        index={index}
                        isActive={currentSong?.id === song.id}
                        onClick={() => {
                          // When filtering by artist, use artistSongs index
                          const originalIndex = selectedArtist
                            ? artistSongs.findIndex(s => s.id === song.id)
                            : allSongs.findIndex(s => s.id === song.id);
                          handleSongSelect(song, originalIndex >= 0 ? originalIndex : index);
                        }}
                      />
                    ))}
                  </Stack>
                ) : selectedArtist ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      No songs found for {selectedArtist}
                    </Typography>
                    <Button 
                      variant="text" 
                      onClick={clearArtistFilter}
                      sx={{ mt: 1 }}
                    >
                      Show all songs
                    </Button>
                  </Box>
                ) : null}
                
                {hasMore && !selectedArtist && (
                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={loadMore}
                      disabled={loadingMore}
                      sx={{ minWidth: 160 }}
                    >
                      {loadingMore ? 'Loading...' : 'Load More Songs'}
                    </Button>
                  </Box>
                )}
              </>
            )}

            {/* Artists Tab */}
            {activeTab === 2 && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: 2,
                }}
              >
                {artists.map((artist, index) => (
                  <ArtistCard
                    key={index}
                    artist={artist}
                    onClick={() => handleArtistClick(artist.name)}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Mini Player (Shows when Now Playing scrolls out of view) */}
      <MiniPlayer
        song={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onPlayPause={handlePlayPause}
        onPrev={handlePrev}
        onNext={handleNext}
        visible={showMiniPlayer && !isDesktop}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SongWithLyrics;
