import React, { useState, useEffect, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  Badge,
  Avatar,
  Box,
  Button,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  useScrollTrigger,
  Slide,
  useMediaQuery,
  useTheme,
  Skeleton,
  CircularProgress,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useNavigate } from 'react-router-dom';
import { notificationAPI, friendsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ClearIcon from '@mui/icons-material/Clear';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useThemeMode } from '../../context/ThemeContext';

// Hide AppBar on scroll down (mobile only)
function HideOnScroll({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const trigger = useScrollTrigger();

  // Only apply hide on scroll for mobile
  if (!isMobile) {
    return children;
  }

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 24,
  backgroundColor: alpha(theme.palette.common.black, 0.04),
  border: '1.5px solid transparent',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
  alignItems: 'center',
  padding: '1px 6px',
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.06),
  },
  '&:focus-within': {
    backgroundColor: '#ffffff',
    borderColor: theme.palette.primary.main,
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(2),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 1.25),
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
  transition: 'color 0.2s ease',
  '.Mui-focused &': {
    color: theme.palette.primary.main,
  },
  '& svg': {
    fontSize: '1.1rem',
  }
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(0.75, 1, 0.75, 0),
    fontSize: '0.85rem',
    fontWeight: 500,
    transition: theme.transitions.create('width'),
    width: '100%',
  },
}));

// Format relative time
const formatTimeAgo = (timestamp) => {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(timestamp * 1000).toLocaleDateString();
};

const Navbar = ({ onMenuClick, isAuthenticated: propIsAuth, user: propUser, onLogout }) => {
  const navigate = useNavigate();
  const { isAuthenticated: authIsAuth, user: authUser, loading: authLoading } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const isAuthenticated = authIsAuth ?? propIsAuth ?? false;
  const user = authUser ?? propUser ?? null;
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [notifsFetched, setNotifsFetched] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const totalNotificationCount = unreadCount + friendRequests.length;

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      const query = searchQuery.trim();
      if (query) {
        navigate(`/explore?q=${encodeURIComponent(query)}`);
      } else {
        navigate('/explore');
      }
    }
  };

  // Sync search input with URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setSearchQuery(q);
    } else {
      setSearchQuery('');
    }
  }, [window.location.search]);

  // Fetch notifications and friend requests (for badge + dropdown)
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;
    setLoadingNotifs(true);
    try {
      const [notifRes, friendRes] = await Promise.all([
        notificationAPI.get(),
        friendsAPI.getRequests('english').catch(() => ({ data: { request: [] } })),
      ]);
      setNotifications(notifRes.data?.notifications || []);
      setUnreadCount(notifRes.data?.unreadCount || 0);
      setFriendRequests(friendRes.data?.request || []);
      setNotifsFetched(true);
    } catch (err) {
      if (err.message !== 'Not authenticated') {
        console.error('Failed to fetch notifications:', err);
      }
    } finally {
      setLoadingNotifs(false);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setFriendRequests([]);
      setNotifsFetched(false);
    }
  }, [isAuthenticated, authLoading, fetchNotifications]);

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
    if (isAuthenticated) {
      fetchNotifications();
    }
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleMarkAllRead = async () => {
    if (markingRead || (unreadCount === 0 && friendRequests.length === 0)) return;
    setMarkingRead(true);
    try {
      await notificationAPI.markRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, seen: 1 })));
      // Friend requests stay until accepted/declined; no "mark read" for them
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    } finally {
      setMarkingRead(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (notif.id && notif.seen !== 1) {
      try {
        await notificationAPI.markOneRead(notif.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, seen: 1 } : n)));
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
    handleNotificationClose();
    navigate(`/post/${notif.postId}`);
  };

  const handleFriendRequestClick = (userId) => {
    handleNotificationClose();
    navigate(`/profile/${userId}`);
  };

  return (
    <HideOnScroll>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid',
          borderColor: mode === 'light' ? alpha('#000', 0.08) : alpha('#fff', 0.08),
          color: 'text.primary'
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 60 }, gap: { xs: 1, sm: 1.5 } }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          sx={{ 
            mr: { xs: 0, sm: 0.5 },
            padding: 1,
            bgcolor: alpha('#000', 0.03),
            '&:hover': { bgcolor: alpha('#000', 0.06) },
            '& svg': { fontSize: '1.25rem' }
          }}
        >
          <MenuIcon />
        </IconButton>

        <Box
          component="img"
          src="/logo.png"
          alt="Calamus Education"
          sx={{
            height: { xs: 32, sm: 36 },
            width: 'auto',
            borderRadius: 1,
            cursor: 'pointer',
            objectFit: 'contain',
            display: { xs: 'none', sm: 'block' }
          }}
          onClick={() => navigate('/')}
        />

        <Box sx={{ flexGrow: { xs: 1, md: 0 } }} />

        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search for courses, videos..."
            inputProps={{ 'aria-label': 'search' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
          {searchQuery && (
            <IconButton size="small" onClick={handleSearchClear} sx={{ mr: 0.5, padding: 0.5 }}>
              <ClearIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          )}
        </Search>

        <Box sx={{ flexGrow: 1 }} />

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => navigate('/my-learning')}
              sx={{ 
                display: { xs: 'none', md: 'flex' },
                borderRadius: '8px',
                px: 2,
                py: 0.5,
                fontSize: '0.8rem',
                fontWeight: 700,
                boxShadow: `0 4px 12px ${alpha('#2e7d32', 0.2)}`
              }}
            >
              My Learning
            </Button>

            <IconButton
              onClick={handleNotificationOpen}
              aria-label="notifications"
              size="small"
              sx={{ 
                padding: 1,
                bgcolor: alpha('#000', 0.03),
                '&:hover': { bgcolor: alpha('#000', 0.06) }
              }}
            >
              <Badge 
                badgeContent={totalNotificationCount} 
                color="secondary" 
                max={99}
                sx={{
                  '& .MuiBadge-badge': {
                    border: '2px solid white',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    height: 16,
                    minWidth: 16
                  }
                }}
              >
                <NotificationsIcon sx={{ fontSize: '1.25rem' }} />
              </Badge>
            </IconButton>

            <IconButton
              edge="end"
              onClick={handleProfileMenuOpen}
              size="small"
              sx={{ 
                p: 0.25,
                border: '2px solid transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: alpha('#2e7d32', 0.04)
                }
              }}
            >
              <Avatar
                alt={user?.name || 'User'}
                src={user?.image}
                sx={{ 
                  width: { xs: 32, sm: 34 }, 
                  height: { xs: 32, sm: 34 },
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              />
            </IconButton>
          </Box>
        ) : (
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => navigate('/login')}
            sx={{ 
              borderRadius: '8px',
              px: 2.5,
              py: 0.6,
              fontSize: '0.8rem',
              fontWeight: 700,
              boxShadow: `0 4px 12px ${alpha('#2e7d32', 0.2)}`
            }}
          >
            Login
          </Button>
        )}

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              mt: 1.5,
              minWidth: 220,
              borderRadius: 2,
              boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
              border: 'none',
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || user?.phone || ''}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => navigate('/profile')}>
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" />
            </ListItemIcon>
            View Profile
          </MenuItem>
          <MenuItem onClick={toggleTheme}>
            <ListItemIcon>
              {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </ListItemIcon>
            {mode === 'dark' ? 'Light Mode' : 'Night Mode'}
          </MenuItem>
          <MenuItem onClick={() => navigate('/settings')}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { onLogout && onLogout(); navigate('/'); }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Sign Out
          </MenuItem>
        </Menu>

        {/* Notification Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          PaperProps={{
            elevation: 0,
            sx: {
              mt: 1.5,
              width: { xs: 300, sm: 360 },
              maxHeight: 440,
              borderRadius: 2,
              boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
              border: 'none',
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Notifications
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {totalNotificationCount > 0 && (
                <Button
                  size="small"
                  startIcon={markingRead ? <CircularProgress size={14} /> : <DoneAllIcon fontSize="small" />}
                  onClick={handleMarkAllRead}
                  disabled={markingRead}
                  sx={{ textTransform: 'none', fontSize: '0.75rem', minWidth: 0 }}
                >
                  Mark all read
                </Button>
              )}
              <Button
                size="small"
                onClick={() => { handleNotificationClose(); navigate('/notifications'); }}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                View all
              </Button>
            </Box>
          </Box>
          <Divider />

          {/* Notification list: friend requests first, then post notifications */}
          <Box sx={{ overflowY: 'auto', maxHeight: 360 }}>
            {loadingNotifs && !notifsFetched ? (
              [...Array(3)].map((_, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1.5, px: 2, py: 1.5 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="80%" height={18} />
                    <Skeleton width="60%" height={14} sx={{ mt: 0.5 }} />
                    <Skeleton width="30%" height={12} sx={{ mt: 0.5 }} />
                  </Box>
                </Box>
              ))
            ) : friendRequests.length === 0 && notifications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <NotificationsIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No notifications yet
                </Typography>
              </Box>
            ) : (
              <>
                {friendRequests.length > 0 && (
                  <>
                    <Box sx={{ px: 2, py: 1, bgcolor: alpha('#000', 0.03) }}>
                      <Typography variant="caption" fontWeight={600} color="text.secondary">
                        Friend requests
                      </Typography>
                    </Box>
                    {friendRequests.map((req) => (
                      <Box
                        key={req.userId || req.phone}
                        onClick={() => handleFriendRequestClick(req.userId || req.phone)}
                        sx={{
                          display: 'flex',
                          gap: 1.5,
                          px: 2,
                          py: 1.5,
                          cursor: 'pointer',
                          borderLeft: '3px solid',
                          borderColor: 'primary.main',
                          bgcolor: alpha('#2e7d32', 0.06),
                          transition: 'background 0.15s ease',
                          '&:hover': { bgcolor: alpha('#000', 0.06) },
                        }}
                      >
                        <Avatar
                          src={req.userImage}
                          sx={{ width: 40, height: 40, flexShrink: 0 }}
                        >
                          {(req.userName || '?').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                            <Typography component="span" fontWeight={600}>
                              {req.userName || 'Someone'}
                            </Typography>{' '}
                            sent you a friend request
                          </Typography>
                          <Typography variant="caption" color="text.disabled" sx={{ mt: 0.3, display: 'block' }}>
                            Tap to view profile
                          </Typography>
                        </Box>
                        <PersonAddIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                      </Box>
                    ))}
                    <Divider sx={{ my: 1 }} />
                  </>
                )}
                {notifications.map((notif) => (
                <Box
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    cursor: 'pointer',
                    bgcolor: notif.seen ? 'transparent' : alpha('#2e7d32', 0.04),
                    borderLeft: notif.seen ? 'none' : '3px solid',
                    borderColor: 'primary.main',
                    transition: 'background 0.15s ease',
                    '&:hover': {
                      bgcolor: alpha('#000', 0.04),
                    },
                  }}
                >
                  <Avatar
                    src={notif.writerImage}
                    sx={{ width: 40, height: 40, flexShrink: 0 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                      <Typography component="span" variant="body2" fontWeight={600}>
                        {notif.writerName}
                      </Typography>{' '}
                      {notif.action}
                    </Typography>
                    {notif.postBody && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          mt: 0.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {notif.postBody}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.3, display: 'block' }}>
                      {formatTimeAgo(notif.time)}
                    </Typography>
                  </Box>
                </Box>
              ))}
              </>
            )}
          </Box>
        </Menu>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
};

export default Navbar;
