import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  alpha,
  Button,
  CircularProgress,
  TextField,
  Badge,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  Message as MessageIcon,
  Menu as MenuIcon,
  Send as SendIcon,
  Image as ImageIcon,
  AttachFile as AttachFileIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { friendsAPI, chatAPI, notificationAPI } from '../services/api';

const FRIENDS_PAGE_SIZE = 20;

/**
 * Chat page layout:
 * - Large screen: left column = conversation list, center = chat, right column = friend list
 * - Small screen: main = chatbox only; conversation list in LEFT drawer, friends in RIGHT drawer (no long list above chat)
 */
const Chat = () => {
  const [searchParams] = useSearchParams();
  const withUserId = searchParams.get('with');
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { isAuthenticated, loading: authLoading, user: authUser, logout } = useAuth();

  // Profile menu state
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendsPage, setFriendsPage] = useState(1);
  const [friendsHasMore, setFriendsHasMore] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsLoadingMore, setFriendsLoadingMore] = useState(false);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const previousMessagesCountRef = useRef(0);
  const latestMessageIdRef = useRef(null);
  const [messageText, setMessageText] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [mobileConversationsDrawerOpen, setMobileConversationsDrawerOpen] = useState(false);
  const [mobileFriendsDrawerOpen, setMobileFriendsDrawerOpen] = useState(false);
  const fileInputRef = useRef(null);

  const myId = authUser?.phone != null ? Number(authUser.phone) : null;
  const CHAT_MAJOR = 'english';

  // Fetch notifications
  useEffect(() => {
    if (isAuthenticated && authUser) {
      const fetchNotifications = async () => {
        try {
          const result = await notificationAPI.getNotifications();
          if (result && Array.isArray(result)) {
            setNotifications(result);
            const unread = result.filter((n) => !n.seen).length;
            setUnreadCount(unread);
          }
        } catch (err) {
          console.error('Failed to fetch notifications:', err);
        }
      };
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, authUser]);

  // Profile menu handlers
  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.seen) {
      try {
        await notificationAPI.markOneRead(notif.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, seen: 1 } : n)));
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
    handleNotificationClose();
    if (notif.postId) {
      navigate(`/post/${notif.postId}`);
    }
  };

  const fetchConversations = useCallback(async (showLoading = true) => {
    if (!myId) return;
    if (showLoading) setConversationsLoading(true);
    try {
      const res = await chatAPI.getConversations(myId, CHAT_MAJOR);
      const list = (res.data || []).map((c) => ({
        id: c.id,
        name: c.friend?.name ?? 'Unknown',
        image: c.friend?.image,
        preview: c.last_message_text || 'No messages yet',
        friend: c.friend,
      }));
      setConversations(list);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      // Don't clear conversations on error during polling
      if (showLoading) setConversations([]);
    } finally {
      if (showLoading) setConversationsLoading(false);
    }
  }, [myId]);

  const fetchFriends = useCallback(async (page = 1, append = false) => {
    if (!authUser?.phone) return;
    const isLoadMore = append && page > 1;
    if (isLoadMore) setFriendsLoadingMore(true);
    else setFriendsLoading(true);
    try {
      const res = await friendsAPI.getFriends(authUser.phone, 'english', { page, limit: FRIENDS_PAGE_SIZE });
      const list = res.data || [];
      const pagination = res.pagination || {};
      if (append) {
        setFriends((prev) => [...prev, ...list]);
      } else {
        setFriends(list);
      }
      setFriendsPage(page);
      setFriendsHasMore(!!pagination.hasMore);
    } catch (err) {
      console.error('Failed to fetch friends:', err);
      if (!append) setFriends([]);
    } finally {
      setFriendsLoading(false);
      setFriendsLoadingMore(false);
    }
  }, [authUser?.phone]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: '/chat' }, replace: true });
      return;
    }
    if (isAuthenticated && authUser?.phone) {
      fetchFriends(1, false);
      fetchConversations(true); // Show loading on initial fetch
      
      // Set up polling for conversations list every 5 seconds
      const conversationsPollInterval = setInterval(() => {
        fetchConversations(false); // Don't show loading spinner during polling
      }, 5000);
      
      return () => {
        clearInterval(conversationsPollInterval);
      };
    }
  }, [authLoading, isAuthenticated, authUser?.phone, navigate, fetchFriends, fetchConversations]);

  // Open conversation from URL ?with=userId
  useEffect(() => {
    if (!withUserId || !myId || !isAuthenticated) return;
    const friendId = Number(withUserId);
    if (friendId === myId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await chatAPI.createConversation(myId, friendId, CHAT_MAJOR);
        if (cancelled) return;
        const conv = res.data;
        // Use friend data from API response, fallback to friends list or default
        const friendData = conv.friend || (() => {
          const otherId = conv.user1_id === myId ? conv.user2_id : conv.user1_id;
          const friendFromList = friends.find((f) => Number(f.userId || f.phone) === otherId);
          return friendFromList
            ? { name: friendFromList.userName, image: friendFromList.userImage, phone: otherId }
            : { name: `User ${otherId}`, image: null, phone: otherId };
        })();
        setCurrentConversation({
          id: conv.id,
          friend: friendData,
        });
        navigate('/chat', { replace: true });
      } catch (err) {
        console.error('Failed to open conversation:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [withUserId, myId, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch messages function (can be called manually or by polling)
  const fetchMessages = useCallback(async (showLoading = true, beforeId = null, afterId = null) => {
    if (!currentConversation?.id || !myId) {
      setMessages([]);
      setHasMoreMessages(true);
      latestMessageIdRef.current = null;
      return;
    }
    
    const isLoadingOlder = beforeId !== null;
    // If afterId is null but showLoading is false, it's polling - use latest message ID
    const isLoadingNewer = afterId !== null || (!showLoading && !isLoadingOlder && latestMessageIdRef.current !== null);
    const actualAfterId = afterId || (isLoadingNewer && !afterId ? latestMessageIdRef.current : null);
    
    if (isLoadingOlder) {
      setLoadingOlderMessages(true);
    } else if (showLoading) {
      setMessagesLoading(true);
    }
    
    try {
      const params = { limit: 50 };
      if (beforeId) {
        params.before_id = beforeId;
      } else if (actualAfterId) {
        params.after_id = actualAfterId;
      }
      const res = await chatAPI.getMessages(currentConversation.id, CHAT_MAJOR, params);
      const newMessages = res.data || [];
      
      if (isLoadingOlder) {
        // Prepend older messages to existing messages
        if (newMessages.length > 0) {
          setMessages((prev) => [...newMessages, ...prev]);
          // If we got fewer messages than requested, there are no more
          if (newMessages.length < 50) {
            setHasMoreMessages(false);
          }
        } else {
          setHasMoreMessages(false);
        }
      } else if (isLoadingNewer && actualAfterId) {
        // Append newer messages to existing messages (for polling)
        if (newMessages.length > 0) {
          setMessages((prev) => {
            // Create a map to avoid duplicates
            const messageMap = new Map();
            // Add existing messages to map
            prev.forEach((msg) => messageMap.set(msg.id, msg));
            // Add new messages to map (will overwrite if duplicate)
            newMessages.forEach((msg) => messageMap.set(msg.id, msg));
            // Convert back to array and sort by ID (chronological order)
            const sorted = Array.from(messageMap.values()).sort((a, b) => a.id - b.id);
            // Update latest message ID ref
            if (sorted.length > 0) {
              latestMessageIdRef.current = sorted[sorted.length - 1].id;
            }
            return sorted;
          });
        }
        // Mark messages as read when fetching newer messages
        chatAPI.markRead(currentConversation.id, myId, CHAT_MAJOR).catch(() => {});
      } else {
        // Replace all messages (initial load only)
        setMessages(newMessages);
        // Update latest message ID ref
        if (newMessages.length > 0) {
          latestMessageIdRef.current = newMessages[newMessages.length - 1].id;
        } else {
          latestMessageIdRef.current = null;
        }
        // If we got fewer messages than requested, there are no more
        if (newMessages.length < 50) {
          setHasMoreMessages(false);
        } else {
          setHasMoreMessages(true);
        }
        // Mark messages as read when fetching latest
        chatAPI.markRead(currentConversation.id, myId, CHAT_MAJOR).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
      // Don't clear messages on error during polling
      if (showLoading && !isLoadingOlder && !isLoadingNewer) {
        setMessages([]);
      }
      if (!isLoadingNewer) {
        setHasMoreMessages(false);
      }
    } finally {
      if (isLoadingOlder) {
        setLoadingOlderMessages(false);
      } else if (showLoading) {
        setMessagesLoading(false);
      }
    }
  }, [currentConversation?.id, myId]);

  // Initial fetch and polling setup for messages
  useEffect(() => {
    if (!currentConversation?.id || !myId) {
      setMessages([]);
      setHasMoreMessages(true);
      isInitialLoadRef.current = true;
      previousMessagesCountRef.current = 0;
      return;
    }
    
    // Reset initial load flag when conversation changes
    isInitialLoadRef.current = true;
    previousMessagesCountRef.current = 0;
    setHasMoreMessages(true);
    latestMessageIdRef.current = null;
    
    // Initial fetch
    fetchMessages(true);
    
    // Set up polling every 5 seconds
    const pollInterval = setInterval(() => {
      // Only fetch newer messages during polling, preserve older messages
      // fetchMessages will use latestMessageIdRef to fetch only new messages
      fetchMessages(false);
    }, 5000);
    
    return () => {
      clearInterval(pollInterval);
    };
  }, [currentConversation?.id, myId, fetchMessages]);

  // Handle scroll to load older messages
  const handleScroll = useCallback((e) => {
    const container = e.target;
    // Check if scrolled to top (within 100px)
    if (container.scrollTop < 100 && hasMoreMessages && !loadingOlderMessages && messages.length > 0) {
      // Get the oldest message ID (first message in array)
      const oldestMessageId = messages[0]?.id;
      if (oldestMessageId) {
        // Save current scroll height and position
        const scrollHeightBefore = container.scrollHeight;
        const scrollTopBefore = container.scrollTop;
        
        // Load older messages
        fetchMessages(false, oldestMessageId).then(() => {
          // Restore scroll position after messages are loaded
          // Calculate the difference in scroll height and adjust scroll position
          requestAnimationFrame(() => {
            const scrollHeightAfter = container.scrollHeight;
            const scrollHeightDiff = scrollHeightAfter - scrollHeightBefore;
            container.scrollTop = scrollTopBefore + scrollHeightDiff;
          });
        });
      }
    }
  }, [hasMoreMessages, loadingOlderMessages, messages, fetchMessages]);

  // Keep latest message ID ref in sync
  useEffect(() => {
    if (messages.length > 0) {
      latestMessageIdRef.current = messages[messages.length - 1].id;
    } else {
      latestMessageIdRef.current = null;
    }
  }, [messages]);

  // Improved auto-scroll: instant on initial load, smooth for new messages
  useEffect(() => {
    // Don't scroll while loading
    if (messagesLoading) return;
    
    if (!messagesEndRef.current || messages.length === 0) return;
    
    const currentMessagesCount = messages.length;
    const isNewMessage = currentMessagesCount > previousMessagesCountRef.current;
    const wasInitialLoad = isInitialLoadRef.current;
    
    // Use double requestAnimationFrame to ensure DOM is fully updated and rendered
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (messagesEndRef.current && !messagesLoading) {
          if (wasInitialLoad) {
            // Instant scroll on initial load - no animation, better UX
            // Use scrollTop for instant positioning instead of scrollIntoView
            const container = messagesContainerRef.current;
            if (container) {
              container.scrollTop = container.scrollHeight;
            } else {
              messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
            }
            isInitialLoadRef.current = false;
          } else if (isNewMessage) {
            // Smooth scroll only when new messages arrive
            // Check if user is near bottom before auto-scrolling
            const container = messagesContainerRef.current;
            if (container) {
              const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
              if (isNearBottom) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            } else {
              messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }
          previousMessagesCountRef.current = currentMessagesCount;
        }
      });
    });
  }, [messages, messagesLoading]);

  const handleLoadMoreFriends = () => {
    if (friendsLoadingMore || !friendsHasMore) return;
    fetchFriends(friendsPage + 1, true);
  };

  const hasConversations = conversations.length > 0;
  const hasFriends = friends.length > 0;

  const handleSelectConversation = (conv) => {
    setCurrentConversation({ id: conv.id, friend: conv.friend || { name: conv.name, image: conv.image, phone: null } });
    if (!isDesktop) setMobileConversationsDrawerOpen(false);
  };

  const handleSelectFriend = async (friendId) => {
    if (!myId || !friendId) return;
    if (!isDesktop) setMobileFriendsDrawerOpen(false);
    const fid = Number(friendId);
    try {
      const res = await chatAPI.createConversation(myId, fid, CHAT_MAJOR);
      const conv = res.data;
      // Use friend data from API response, fallback to friends list or default
      const friendData = conv.friend || (() => {
        const friendFromList = friends.find((f) => Number(f.userId || f.phone) === fid);
        return friendFromList
          ? { name: friendFromList.userName, image: friendFromList.userImage, phone: fid }
          : { name: `User ${fid}`, image: null, phone: fid };
      })();
      setCurrentConversation({
        id: conv.id,
        friend: friendData,
      });
      fetchConversations(false); // Don't show loading spinner when refreshing after action
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  const handleSendMessage = async (imagePath = null, imageSize = null) => {
    const text = messageText.trim();
    if ((!text && !imagePath) || !currentConversation?.id || !myId || sendLoading || uploadingImage) return;
    setSendLoading(true);
    const optimistic = {
      id: `temp-${Date.now()}`,
      conversation_id: currentConversation.id,
      sender_id: myId,
      message_type: imagePath ? 'image' : 'text',
      message_text: text || '',
      file_path: imagePath || '',
      file_size: imageSize || 0,
      is_read: 0,
      created_at: Date.now(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setMessageText('');
    try {
      const res = await chatAPI.sendMessage(currentConversation.id, myId, CHAT_MAJOR, {
        message_text: text,
        message_type: imagePath ? 'image' : 'text',
        file_path: imagePath || '',
        file_size: imageSize || 0,
      });
      const created = res.data;
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? created : m)));
      fetchConversations(false); // Don't show loading spinner when refreshing after sending message
      // Scroll to bottom after sending message (will be handled by useEffect, but ensure it happens)
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setMessageText(text);
      console.error('Failed to send message:', err);
    } finally {
      setSendLoading(false);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const uploadRes = await chatAPI.uploadImage(file);
      if (uploadRes.success && uploadRes.data) {
        const { file_path, file_size, file_url } = uploadRes.data;
        // Send the image message (file_path is stored in DB, file_url is for display)
        await handleSendMessage(file_path, file_size);
      } else {
        alert(uploadRes.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const formatMessageTime = (ts) => {
    if (!ts) return '';
    const d = new Date(typeof ts === 'number' ? ts : ts * 1000);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box
      sx={{
        height: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header: on mobile, left = conversations drawer, center = title, right = friends drawer */}
      <Paper
        elevation={0}
        sx={{
          px: 2,
          py: 1.5,
          borderRadius: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 1301, // Higher than main drawer backdrop (1200) and drawer (1300)
        }}
      >
        {!isDesktop ? (
          <>
            <IconButton
              data-testid="chat-open-conversations"
              onClick={() => setMobileConversationsDrawerOpen(true)}
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.08), 
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) },
              }}
              aria-label="Open conversations"
            >
              <MenuIcon />
            </IconButton>
            <Box
              component="img"
              src="/logo.png"
              alt="Calamus Education"
              onClick={() => navigate('/')}
              sx={{
                height: 32,
                width: 32,
                borderRadius: 1,
                cursor: 'pointer',
                objectFit: 'cover',
                mx: 1,
              }}
            />
            <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <ChatIcon color="primary" />
              Chat
            </Typography>
            {isAuthenticated && (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleNotificationOpen}
                  aria-label="notifications"
                  sx={{ mr: 1 }}
                >
                  <Badge badgeContent={unreadCount} color="secondary" max={99}>
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{ p: 0.5 }}
                >
                  <Avatar
                    alt={authUser?.name || 'User'}
                    src={authUser?.image}
                    sx={{ width: 32, height: 32 }}
                  />
                </IconButton>
              </>
            )}
            <IconButton
              data-testid="chat-open-friends"
              onClick={() => setMobileFriendsDrawerOpen(true)}
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.08), 
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) },
                ml: 1,
              }}
              aria-label="Open friends list"
            >
              <PeopleIcon />
            </IconButton>
          </>
        ) : (
          <>
            <Box
              component="img"
              src="/logo.png"
              alt="Calamus Education"
              onClick={() => navigate('/')}
              sx={{
                height: 40,
                width: 40,
                borderRadius: 1,
                cursor: 'pointer',
                objectFit: 'cover',
                mr: 2,
              }}
            />
            <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <ChatIcon color="primary" />
              Chat
            </Typography>
            {isAuthenticated && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => navigate('/my-learning')}
                  sx={{ mr: 1 }}
                >
                  My Learning
                </Button>
                <IconButton
                  color="inherit"
                  onClick={handleNotificationOpen}
                  aria-label="notifications"
                  sx={{ mr: 1 }}
                >
                  <Badge badgeContent={unreadCount} color="secondary" max={99}>
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{ p: 0.5 }}
                >
                  <Avatar
                    alt={authUser?.name || 'User'}
                    src={authUser?.image}
                    sx={{ width: 36, height: 36 }}
                  />
                </IconButton>
              </>
            )}
          </>
        )}
      </Paper>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationClose}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1.5,
            minWidth: 320,
            maxWidth: 400,
            maxHeight: 400,
            borderRadius: 2,
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
            overflow: 'auto',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Notifications
          </Typography>
        </Box>
        {notifications.length === 0 ? (
          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          notifications.map((notif) => (
            <MenuItem
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              sx={{
                py: 1.5,
                px: 2,
                bgcolor: notif.seen ? 'transparent' : alpha(theme.palette.primary.main, 0.04),
              }}
            >
              <ListItemText
                primary={notif.message || 'New notification'}
                secondary={notif.created_at ? new Date(notif.created_at).toLocaleString() : ''}
                primaryTypographyProps={{
                  fontWeight: notif.seen ? 400 : 600,
                  fontSize: '0.875rem',
                }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </MenuItem>
          ))
        )}
      </Menu>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileAnchorEl}
        open={Boolean(profileAnchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1.5,
            minWidth: 220,
            borderRadius: 2,
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {authUser?.name || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {authUser?.email || authUser?.phone || ''}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => navigate('/profile')}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          View Profile
        </MenuItem>
        <MenuItem onClick={() => navigate('/settings')}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { logout && logout(); navigate('/'); }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          overflow: 'hidden',
          maxWidth: 1600,
          mx: 'auto',
          width: '100%',
        }}
      >
        {/* Left column: Conversation list (desktop only; on mobile it's in a left drawer) */}
        <Paper
          elevation={0}
          sx={{
            display: { xs: 'none', md: 'flex' },
            width: 320,
            minWidth: 320,
            maxWidth: 320,
            borderRight: '1px solid',
            borderColor: 'divider',
            borderRadius: 0,
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Conversations
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {conversationsLoading ? 'Loading…' : hasConversations ? `${conversations.length} chat(s)` : 'Your chats will appear here'}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
            {conversationsLoading && conversations.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={28} />
              </Box>
            ) : !hasConversations ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <MessageIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No conversations yet
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                  Tap a friend to start a chat
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {conversations.map((c) => (
                  <ListItem key={c.id} disablePadding>
                    <ListItemButton
                      selected={currentConversation?.id === c.id}
                      onClick={() => handleSelectConversation(c)}
                    >
                      <ListItemAvatar>
                        <Avatar src={c.image} alt={c.name}>
                          {(c.name || '?').charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={c.name} secondary={c.preview} primaryTypographyProps={{ fontWeight: 500 }} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Paper>

        {/* Main area: chatbox or empty state — full width on mobile */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            bgcolor: 'background.default',
            overflow: 'hidden',
            height: '100%',
          }}
        >
          {withUserId ? (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={32} />
            </Box>
          ) : !currentConversation ? (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
                textAlign: 'center',
              }}
            >
              <Box>
                <ChatIcon sx={{ fontSize: 64, color: 'primary.main', opacity: 0.6, mb: 2 }} />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Select a conversation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose a chat from the list or start a new one from the friends list.
                </Typography>
                {!isDesktop && (
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
                    Use the menu icon to open conversations, or the people icon to open friends and start a chat.
                  </Typography>
                )}
              </Box>
            </Box>
          ) : (
            <>
              <Paper 
                elevation={0} 
                sx={{ 
                  px: 2, 
                  py: 1.5, 
                  borderBottom: '1px solid', 
                  borderColor: 'divider', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  flexShrink: 0,
                }}
              >
                <Avatar src={currentConversation.friend?.image} sx={{ width: 36, height: 36 }}>
                  {(currentConversation.friend?.name || '?').charAt(0)}
                </Avatar>
                <Typography variant="subtitle1" fontWeight={600}>
                  {currentConversation.friend?.name || 'Chat'}
                </Typography>
              </Paper>
              <Box 
                ref={messagesContainerRef}
                onScroll={handleScroll}
                sx={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  overflowX: 'hidden',
                  display: 'flex', 
                  flexDirection: 'column', 
                  p: 2,
                  minHeight: 0,
                }}
              >
                {messagesLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : (
                  <>
                    {loadingOlderMessages && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    )}
                    {messages.map((msg) => {
                      const isMe = Number(msg.sender_id) === myId;
                      const isImage = msg.message_type === 'image' && msg.file_path;
                      // Construct image URL from file_path
                      // Database stores: uploads/chat/images/image.png
                      // Accessible at: http://localhost/calamus/uploads/chat/images/image.png
                      // Use backend server URL (not React dev server origin)
                      const imageUrl = isImage 
                        ? (msg.file_path.startsWith('http') 
                            ? msg.file_path 
                            : `http://localhost/calamus/${msg.file_path}`)
                        : null;
                      
                      return (
                        <Box
                          key={msg.id}
                          data-message-id={msg.id}
                          sx={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            mb: 1,
                          }}
                        >
                          <Paper
                            elevation={0}
                            sx={{
                              px: isImage ? 0 : 2,
                              py: isImage ? 0 : 1.25,
                              borderRadius: 2,
                              bgcolor: isImage ? 'transparent' : (isMe ? 'primary.main' : alpha(theme.palette.grey[500], 0.12)),
                              color: isImage ? 'inherit' : (isMe ? 'primary.contrastText' : 'text.primary'),
                              overflow: 'hidden',
                            }}
                          >
                            {isImage && imageUrl ? (
                              <>
                                <Box
                                  component="img"
                                  src={imageUrl}
                                  alt="Sent image"
                                  sx={{
                                    maxWidth: '100%',
                                    maxHeight: '400px',
                                    display: 'block',
                                    cursor: 'pointer',
                                    '&:hover': {
                                      opacity: 0.9,
                                    },
                                  }}
                                  onClick={() => window.open(imageUrl, '_blank')}
                                />
                                {msg.message_text && (
                                  <Typography variant="body2" sx={{ wordBreak: 'break-word', px: 2, pt: 1 }}>
                                    {msg.message_text}
                                  </Typography>
                                )}
                                <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', px: 2, pb: 1 }}>
                                  {formatMessageTime(msg.created_at)}
                                </Typography>
                              </>
                            ) : (
                              <>
                                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                  {msg.message_text}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', mt: 0.25 }}>
                                  {formatMessageTime(msg.created_at)}
                                </Typography>
                              </>
                            )}
                          </Paper>
                        </Box>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </Box>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 1.5, 
                  borderTop: '1px solid', 
                  borderColor: 'divider',
                  flexShrink: 0,
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageSelect}
                />
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <IconButton
                    color="primary"
                    onClick={handleImageButtonClick}
                    disabled={sendLoading || uploadingImage}
                    sx={{ flexShrink: 0 }}
                    aria-label="Upload image"
                  >
                    {uploadingImage ? <CircularProgress size={24} /> : <ImageIcon />}
                  </IconButton>
                  <TextField
                    size="small"
                    placeholder="Type a message..."
                    fullWidth
                    multiline
                    maxRows={4}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'action.hover' },
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={() => handleSendMessage()}
                    disabled={(!messageText.trim() && !uploadingImage) || sendLoading || uploadingImage}
                    sx={{ flexShrink: 0 }}
                  >
                    {sendLoading ? <CircularProgress size={24} /> : <SendIcon />}
                  </IconButton>
                </Box>
              </Paper>
            </>
          )}
        </Box>

        {/* Right column: Friend list (desktop only) */}
        {isDesktop && (
          <Paper
            elevation={0}
            sx={{
              width: 280,
              minWidth: 280,
              maxWidth: 280,
              borderLeft: '1px solid',
              borderColor: 'divider',
              borderRadius: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Friends
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {friendsLoading ? 'Loading…' : hasFriends ? `${friends.length} friend(s)` : 'Start a chat with a friend'}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
              {friendsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : !hasFriends ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No friends yet
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                    Add friends from their profile to chat
                  </Typography>
                </Box>
              ) : (
                <>
                  <List disablePadding>
                    {friends.map((f) => (
                      <ListItem key={f.userId || f.phone} disablePadding>
                        <ListItemButton onClick={() => handleSelectFriend(f.userId || f.phone)}>
                          <ListItemAvatar>
                            <Avatar src={f.userImage} alt={f.userName}>
                              {(f.userName || '?').charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary={f.userName} primaryTypographyProps={{ fontWeight: 500 }} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                  {friendsHasMore && (
                    <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'center' }}>
                      <Button
                        size="small"
                        onClick={handleLoadMoreFriends}
                        disabled={friendsLoadingMore}
                        sx={{ textTransform: 'none' }}
                      >
                        {friendsLoadingMore ? <CircularProgress size={20} /> : 'Load more'}
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Paper>
        )}
      </Box>

      {/* Mobile: Left drawer = conversation list */}
      {!isDesktop && (
        <Drawer
          anchor="left"
          open={mobileConversationsDrawerOpen}
          onClose={() => setMobileConversationsDrawerOpen(false)}
          PaperProps={{
            sx: { width: 300, maxWidth: '85vw', zIndex: 1300 },
          }}
          ModalProps={{
            style: { zIndex: 1300 },
            disableEnforceFocus: true,
            disableAutoFocus: true,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography fontWeight={700}>Conversations</Typography>
            <IconButton onClick={() => setMobileConversationsDrawerOpen(false)} size="small" aria-label="Close">
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ overflowY: 'auto', flex: 1 }}>
            {conversationsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={28} />
              </Box>
            ) : !hasConversations ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <MessageIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No conversations yet. Open Friends to start a chat.
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {conversations.map((c) => (
                  <ListItem key={c.id} disablePadding>
                    <ListItemButton
                      selected={currentConversation?.id === c.id}
                      onClick={() => handleSelectConversation(c)}
                    >
                      <ListItemAvatar>
                        <Avatar src={c.image} alt={c.name}>{(c.name || '?').charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={c.name} secondary={c.preview} primaryTypographyProps={{ fontWeight: 500 }} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Drawer>
      )}

      {/* Mobile: Right drawer = friend list */}
      {!isDesktop && (
        <Drawer
          anchor="right"
          open={mobileFriendsDrawerOpen}
          onClose={() => setMobileFriendsDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: 300,
              maxWidth: '85vw',
              zIndex: 1300,
            },
          }}
          ModalProps={{
            style: { zIndex: 1300 },
            disableEnforceFocus: true,
            disableAutoFocus: true,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography fontWeight={700}>Friends</Typography>
            <IconButton onClick={() => setMobileFriendsDrawerOpen(false)} size="small" aria-label="Close">
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ overflowY: 'auto', flex: 1 }}>
            {friendsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={32} />
              </Box>
            ) : !hasFriends ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No friends yet. Add friends from their profile to chat.
                </Typography>
              </Box>
            ) : (
              <>
                <List disablePadding>
                  {friends.map((f) => (
                    <ListItem key={f.userId || f.phone} disablePadding>
                      <ListItemButton onClick={() => handleSelectFriend(f.userId || f.phone)}>
                        <ListItemAvatar>
                          <Avatar src={f.userImage} alt={f.userName}>
                            {(f.userName || '?').charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={f.userName} primaryTypographyProps={{ fontWeight: 500 }} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                {friendsHasMore && (
                  <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      size="small"
                      onClick={handleLoadMoreFriends}
                      disabled={friendsLoadingMore}
                      sx={{ textTransform: 'none' }}
                    >
                      {friendsLoadingMore ? <CircularProgress size={20} /> : 'Load more'}
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Drawer>
      )}
    </Box>
  );
};

export default Chat;
