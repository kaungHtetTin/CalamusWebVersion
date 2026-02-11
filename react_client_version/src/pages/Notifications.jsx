import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Paper,
  Skeleton,
  Divider,
  Button,
  Breadcrumbs,
  Link,
  alpha,
  CircularProgress,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import HomeIcon from '@mui/icons-material/Home';
import { notificationAPI, friendsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatTimeAgo = (timestamp) => {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(timestamp * 1000).toLocaleDateString();
};

function Notifications() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [notifRes, friendRes] = await Promise.all([
        notificationAPI.get({ limit: 150 }),
        friendsAPI.getRequests('english').catch(() => ({ data: { request: [] } })),
      ]);
      setNotifications(notifRes.data?.notifications || []);
      setUnreadCount(notifRes.data?.unreadCount || 0);
      setFriendRequests(friendRes.data?.request || []);
    } catch (err) {
      if (err.message !== 'Not authenticated') {
        console.error('Failed to fetch notifications:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: '/notifications' }, replace: true });
      return;
    }
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, navigate, fetchData]);

  const handleMarkAllRead = async () => {
    if (markingRead || unreadCount === 0) return;
    setMarkingRead(true);
    try {
      await notificationAPI.markRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, seen: 1 })));
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
    navigate(`/post/${notif.postId}`);
  };

  const handleFriendRequestClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const totalCount = notifications.length + friendRequests.length;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Breadcrumbs (quick link) - same as Explore */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            component={RouterLink}
            to="/"
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            color="inherit"
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Home
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationsIcon sx={{ mr: 0.5 }} fontSize="small" />
            Notifications
          </Typography>
        </Breadcrumbs>

        {/* Page Header - same as Explore */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Notifications
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Friend requests and post activity — likes, comments and more
              </Typography>
            </Box>
            {totalCount > 0 && (
              <Button
                size="small"
                variant="outlined"
                startIcon={markingRead ? <CircularProgress size={14} /> : <DoneAllIcon fontSize="small" />}
                onClick={handleMarkAllRead}
                disabled={markingRead || unreadCount === 0}
                sx={{ textTransform: 'none' }}
              >
                Mark all read
              </Button>
            )}
          </Box>
        </Box>

      {loading ? (
        [...Array(5)].map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2, py: 2 }}>
            <Skeleton variant="circular" width={48} height={48} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="70%" height={20} />
              <Skeleton width="50%" height={16} sx={{ mt: 1 }} />
            </Box>
          </Box>
        ))
      ) : totalCount === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
          <NotificationsIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No notifications yet
          </Typography>
          <Typography variant="body2" color="text.disabled">
            When someone likes your post, comments, or sends a friend request, you’ll see it here.
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          {friendRequests.length > 0 && (
            <>
              <Box sx={{ px: 2, py: 1.5, bgcolor: alpha('#000', 0.04) }}>
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                  Friend requests
                </Typography>
              </Box>
              {friendRequests.map((req) => (
                <Box
                  key={req.userId || req.phone}
                  onClick={() => handleFriendRequestClick(req.userId || req.phone)}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    px: 2,
                    py: 2,
                    cursor: 'pointer',
                    borderLeft: '4px solid',
                    borderColor: 'primary.main',
                    bgcolor: alpha('#2e7d32', 0.06),
                    transition: 'background 0.15s ease',
                    '&:hover': { bgcolor: alpha('#000', 0.06) },
                  }}
                >
                  <Avatar
                    src={req.userImage}
                    sx={{ width: 48, height: 48, flexShrink: 0 }}
                  >
                    {(req.userName || '?').charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.4 }}>
                      <Typography component="span" fontWeight={600}>
                        {req.userName || 'Someone'}
                      </Typography>{' '}
                      sent you a friend request
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                      Tap to view profile and accept or decline
                    </Typography>
                  </Box>
                  <PersonAddIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                </Box>
              ))}
              <Divider />
            </>
          )}

          {notifications.length > 0 && (
            <>
              {friendRequests.length > 0 && (
                <Box sx={{ px: 2, py: 1.5, bgcolor: alpha('#000', 0.04) }}>
                  <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                    Post activity
                  </Typography>
                </Box>
              )}
              {notifications.map((notif) => (
                <Box
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    px: 2,
                    py: 2,
                    cursor: 'pointer',
                    bgcolor: notif.seen ? 'transparent' : alpha('#2e7d32', 0.04),
                    borderLeft: notif.seen ? 'none' : '4px solid',
                    borderColor: 'primary.main',
                    transition: 'background 0.15s ease',
                    '&:hover': { bgcolor: alpha('#000', 0.04) },
                  }}
                >
                  <Avatar
                    src={notif.writerImage}
                    sx={{ width: 48, height: 48, flexShrink: 0 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.4 }}>
                      <Typography component="span" fontWeight={600}>
                        {notif.writerName}
                      </Typography>{' '}
                      {notif.action}
                    </Typography>
                    {notif.postBody && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block',
                        }}
                      >
                        {notif.postBody}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                      {formatTimeAgo(notif.time)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </>
          )}
        </Paper>
      )}
      </Container>
    </Box>
  );
}

export default Notifications;
