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
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  Visibility as VisibilityIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
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
  const majorParam = searchParams.get('major');
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { isAuthenticated, loading: authLoading, user: authUser, logout } = useAuth();

  // Profile menu state
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [conversationMenuAnchorEl, setConversationMenuAnchorEl] = useState(null);
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
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedByMe, setBlockedByMe] = useState(false);
  const [blockedByOther, setBlockedByOther] = useState(false);
  const fileInputRef = useRef(null);

  const myId = authUser?.phone != null ? Number(authUser.phone) : null;
  // Determine major from URL parameter or default to 'english'
  // Valid majors: english, korea, chinese, japanese, russian
  const validMajors = ['english', 'korea', 'chinese', 'japanese', 'russian'];
  const CHAT_MAJOR = majorParam && validMajors.includes(majorParam.toLowerCase()) 
    ? majorParam.toLowerCase() 
    : 'english';

  // Fetch notifications
  useEffect(() => {
    if (isAuthenticated && authUser) {
      const fetchNotifications = async () => {
        try {
          const result = await notificationAPI.get();
          if (result && result.data && Array.isArray(result.data)) {
            setNotifications(result.data);
            const unread = result.data.filter((n) => !n.seen).length;
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

  // Conversation menu handlers
  const handleConversationMenuOpen = (event) => {
    setConversationMenuAnchorEl(event.currentTarget);
  };

  const handleConversationMenuClose = () => {
    setConversationMenuAnchorEl(null);
  };

  const handleViewProfile = () => {
    handleConversationMenuClose();
    if (currentConversation?.friend?.phone) {
      navigate(`/profile/${currentConversation.friend.phone}`);
    }
  };

  const handleDeleteConversation = async () => {
    handleConversationMenuClose();
    if (!currentConversation?.id) return;
    
    if (!window.confirm('Are you sure you want to delete this conversation? All messages will be permanently deleted.')) {
      return;
    }

    try {
      await chatAPI.deleteConversation(currentConversation.id, CHAT_MAJOR);
      // Remove conversation from list
      setConversations((prev) => prev.filter((c) => c.id !== currentConversation.id));
      // Clear current conversation
      setCurrentConversation(null);
      setMessages([]);
      // Refresh conversations list
      fetchConversations(false);
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      alert('Failed to delete conversation. Please try again.');
    }
  };

  const handleBlockUser = async () => {
    handleConversationMenuClose();
    if (!currentConversation?.friend?.phone) return;
    
    if (!window.confirm(`Are you sure you want to block ${currentConversation.friend.name || 'this user'}? You will no longer receive messages from them.`)) {
      return;
    }

    try {
      // Block the user (adds to blocks table and unfriends)
      await friendsAPI.block(currentConversation.friend.phone);
      // Delete the conversation
      if (currentConversation?.id) {
        try {
          await chatAPI.deleteConversation(currentConversation.id, CHAT_MAJOR);
        } catch (err) {
          console.error('Failed to delete conversation after blocking:', err);
        }
      }
      // Remove conversation from list
      setConversations((prev) => prev.filter((c) => c.id !== currentConversation.id));
      // Clear current conversation
      setCurrentConversation(null);
      setMessages([]);
      // Refresh conversations and friends lists
      fetchConversations(false);
      fetchFriends();
      // Update block status
      setIsBlocked(true);
      setBlockedByMe(true);
      setBlockedByOther(false);
      alert('User has been blocked successfully.');
    } catch (err) {
      console.error('Failed to block user:', err);
      alert('Failed to block user. Please try again.');
    }
  };

  const handleUnblockUser = async () => {
    if (!currentConversation?.friend?.phone) return;
    
    if (!window.confirm(`Are you sure you want to unblock ${currentConversation.friend.name || 'this user'}? You will be able to send and receive messages again.`)) {
      return;
    }

    try {
      // Unblock the user
      await friendsAPI.unblock(currentConversation.friend.phone);
      // Update block status
      setIsBlocked(false);
      setBlockedByMe(false);
      setBlockedByOther(false);
      // Refresh conversations to get updated block status
      fetchConversations(false);
      alert('User has been unblocked successfully.');
    } catch (err) {
      console.error('Failed to unblock user:', err);
      alert('Failed to unblock user. Please try again.');
    }
  };

  const fetchConversations = useCallback(async (showLoading = true) => {
    if (!myId) return;
    if (showLoading) setConversationsLoading(true);
    try {
      const res = await chatAPI.getConversations(myId, CHAT_MAJOR);
      const list = (res.data || [])
        // Filter out admin support conversations (friend id 10000)
        // Handle both string and number comparison
        .filter((c) => {
          const friendPhone = c.friend?.phone;
          const friendPhoneNum = Number(friendPhone);
          return friendPhoneNum !== 10000; // Hide admin support conversations
        })
        .map((c) => ({
          id: c.id,
          name: c.friend?.name ?? 'Unknown',
          image: c.friend?.image,
          preview: c.last_message_text || 'No messages yet',
          friend: c.friend,
          unread_count: c.unread_count || 0,
        }));
      setConversations(list);
      
      // Update block status if current conversation is in the list
      if (currentConversation?.id) {
        const currentConv = list.find((c) => c.id === currentConversation.id);
        if (currentConv?.friend) {
          setIsBlocked(currentConv.friend.blocked || false);
          setBlockedByMe(currentConv.friend.blocked_by_me || false);
          setBlockedByOther(currentConv.friend.blocked_by_other || false);
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      // Don't clear conversations on error during polling
      if (showLoading) setConversations([]);
    } finally {
      if (showLoading) setConversationsLoading(false);
    }
  }, [myId, currentConversation?.id]);

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

  // Open conversation from URL ?with=userId&major=language
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
        
        // Update block status from conversation data
        if (friendData.blocked !== undefined) {
          setIsBlocked(friendData.blocked || false);
          setBlockedByMe(friendData.blocked_by_me || false);
          setBlockedByOther(friendData.blocked_by_other || false);
        }
        
        // Clean up URL - remove query params after conversation is created
        navigate('/chat', { replace: true });
      } catch (err) {
        console.error('Failed to open conversation:', err);
        // Clean up URL immediately to stop loading spinner
        navigate('/chat', { replace: true });
        setCurrentConversation(null);
        // Show user-friendly error message after navigation
        const errorMessage = err?.message || err?.error || 'Failed to start conversation. The support user may not exist or there was a database error.';
        alert(`Unable to start chat: ${errorMessage}`);
      }
    })();
    return () => { cancelled = true; };
  }, [withUserId, myId, isAuthenticated, CHAT_MAJOR]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check block status when conversation changes
  useEffect(() => {
    if (!currentConversation?.friend?.phone || !myId) {
      setIsBlocked(false);
      setBlockedByMe(false);
      setBlockedByOther(false);
      return;
    }

    // Use block status from conversation data if available (from API)
    if (currentConversation.friend.blocked !== undefined) {
      setIsBlocked(currentConversation.friend.blocked || false);
      setBlockedByMe(currentConversation.friend.blocked_by_me || false);
      setBlockedByOther(currentConversation.friend.blocked_by_other || false);
      return;
    }

    // Otherwise, check block status via API
    const checkBlockStatus = async () => {
      try {
        const result = await friendsAPI.checkBlock(currentConversation.friend.phone);
        if (result && result.data) {
          setIsBlocked(result.data.blocked || false);
          setBlockedByMe(result.data.blocked_by_me || false);
          setBlockedByOther(result.data.blocked_by_other || false);
        }
      } catch (err) {
        console.error('Failed to check block status:', err);
        setIsBlocked(false);
        setBlockedByMe(false);
        setBlockedByOther(false);
      }
    };

    checkBlockStatus();
  }, [currentConversation?.friend?.phone, currentConversation?.friend?.blocked, myId]);

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
    const friendData = conv.friend || { name: conv.name, image: conv.image, phone: null };
    setCurrentConversation({ id: conv.id, friend: friendData });
    
    // Update block status from conversation data
    if (friendData.blocked !== undefined) {
      setIsBlocked(friendData.blocked || false);
      setBlockedByMe(friendData.blocked_by_me || false);
      setBlockedByOther(friendData.blocked_by_other || false);
    }
    
    // Clear unread count for this conversation immediately (optimistic update)
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conv.id ? { ...c, unread_count: 0 } : c
      )
    );
    
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
      
      // Update block status from conversation data
      if (friendData.blocked !== undefined) {
        setIsBlocked(friendData.blocked || false);
        setBlockedByMe(friendData.blocked_by_me || false);
        setBlockedByOther(friendData.blocked_by_other || false);
      }
      
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
          px: { xs: 1.5, md: 3 },
          py: { xs: 1.25, md: 1.75 },
          borderRadius: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 1301,
          bgcolor: 'background.paper',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'all 0.2s ease',
        }}
      >
        {!isDesktop ? (
          <>
            <IconButton
              data-testid="chat-open-conversations"
              onClick={() => setMobileConversationsDrawerOpen(true)}
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.08), 
                '&:hover': { 
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
                borderRadius: 1.5,
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
                height: { xs: 32, md: 36 },
                width: { xs: 32, md: 36 },
                borderRadius: 1.5,
                cursor: 'pointer',
                objectFit: 'cover',
                mx: 1,
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            />
            <Typography 
              variant="h6" 
              fontWeight={700} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5, 
                flex: 1,
                fontSize: { xs: '1rem', md: '1.25rem' },
              }}
            >
              <ChatIcon color="primary" sx={{ fontSize: { xs: 20, md: 24 } }} />
              Chat
            </Typography>
            {isAuthenticated && (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleNotificationOpen}
                  aria-label="notifications"
                  sx={{ 
                    mr: 1,
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      bgcolor: alpha(theme.palette.action.hover, 0.1),
                    },
                  }}
                >
                  <Badge badgeContent={unreadCount} color="secondary" max={99}>
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{ 
                    p: 0.5,
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <Avatar
                    alt={authUser?.name || 'User'}
                    src={authUser?.image}
                    sx={{ 
                      width: 32, 
                      height: 32,
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                  />
                </IconButton>
              </>
            )}
            <IconButton
              data-testid="chat-open-friends"
              onClick={() => setMobileFriendsDrawerOpen(true)}
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.08), 
                '&:hover': { 
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  transform: 'scale(1.05)',
                },
                ml: 1,
                transition: 'all 0.2s ease',
                borderRadius: 1.5,
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
                  sx={{ 
                    mr: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2,
                    boxShadow: '0 2px 8px rgba(46, 125, 50, 0.25)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(46, 125, 50, 0.35)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
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
          <Box sx={{ 
            px: 2.5, 
            py: 2, 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
              Conversations
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {conversationsLoading ? 'Loading…' : hasConversations ? `${conversations.length} chat(s)` : 'Your chats will appear here'}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
            {conversationsLoading && conversations.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={28} />
              </Box>
            ) : !hasConversations ? (
              <Box sx={{ 
                p: 4, 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <MessageIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.6 }} />
                </Box>
                <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>
                  No conversations yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                  Tap a friend to start a chat
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {conversations.map((c) => {
                  const hasUnread = (c.unread_count || 0) > 0;
                  return (
                    <ListItem key={c.id} disablePadding>
                      <ListItemButton
                        selected={currentConversation?.id === c.id}
                        onClick={() => handleSelectConversation(c)}
                        sx={{
                          bgcolor: hasUnread && currentConversation?.id !== c.id 
                            ? alpha(theme.palette.primary.main, 0.08) 
                            : 'transparent',
                          '&:hover': {
                            bgcolor: hasUnread && currentConversation?.id !== c.id
                              ? alpha(theme.palette.primary.main, 0.12)
                              : alpha(theme.palette.action.hover, 0.05),
                          },
                        }}
                      >
                        <ListItemAvatar sx={{ minWidth: 48 }}>
                          <Badge 
                            badgeContent={hasUnread ? c.unread_count : 0} 
                            color="primary" 
                            max={99}
                            invisible={!hasUnread}
                            sx={{
                              '& .MuiBadge-badge': {
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                minWidth: 18,
                                height: 18,
                              },
                            }}
                          >
                            <Avatar 
                              src={c.image} 
                              alt={c.name}
                              sx={{
                                width: 44,
                                height: 44,
                                border: hasUnread ? `2px solid ${theme.palette.primary.main}` : `2px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                                transition: 'all 0.2s ease',
                              }}
                            >
                              {(c.name || '?').charAt(0)}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={c.name} 
                          secondary={c.preview} 
                          primaryTypographyProps={{ 
                            fontWeight: hasUnread ? 700 : 500,
                            color: hasUnread ? 'primary.main' : 'text.primary',
                          }} 
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
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
                  px: { xs: 1.5, md: 2.5 }, 
                  py: { xs: 1.25, md: 1.75 }, 
                  borderBottom: '1px solid', 
                  borderColor: 'divider', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  flexShrink: 0,
                  bgcolor: 'background.paper',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <Avatar 
                  src={currentConversation.friend?.image} 
                  sx={{ 
                    width: { xs: 36, md: 40 }, 
                    height: { xs: 36, md: 40 },
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                >
                  {(currentConversation.friend?.name || '?').charAt(0)}
                </Avatar>
                <Typography 
                  variant="subtitle1" 
                  fontWeight={700} 
                  sx={{ 
                    flex: 1,
                    fontSize: { xs: '0.95rem', md: '1rem' },
                  }}
                >
                  {currentConversation.friend?.name || 'Chat'}
                </Typography>
                <IconButton
                  onClick={handleConversationMenuOpen}
                  size="small"
                  aria-label="conversation options"
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.action.hover, 0.1),
                      transform: 'rotate(90deg)',
                    },
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
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
                  p: { xs: 1.5, md: 2.5 },
                  minHeight: 0,
                  bgcolor: alpha(theme.palette.primary.main, 0.01),
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
                      // Convert is_read to number (database may return as string "0" or "1" or number 0/1)
                      // Default to 0 (not read) if is_read is undefined/null
                      // is_read: 0 = sent (single checkmark), 1 = seen (double checkmark)
                      // Handle both string and number types from database
                      const isReadValue = msg.is_read !== undefined && msg.is_read !== null ? msg.is_read : 0;
                      const isReadStatus = typeof isReadValue === 'string' ? parseInt(isReadValue, 10) : Number(isReadValue);
                      const isRead = isReadStatus === 1;
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
                            maxWidth: { xs: '85%', md: '70%' },
                            mb: 1.5,
                            animation: 'fadeIn 0.3s ease',
                            '@keyframes fadeIn': {
                              from: {
                                opacity: 0,
                                transform: 'translateY(10px)',
                              },
                              to: {
                                opacity: 1,
                                transform: 'translateY(0)',
                              },
                            },
                          }}
                        >
                          <Paper
                            elevation={0}
                            sx={{
                              px: isImage ? 0 : 2.5,
                              py: isImage ? 0 : 1.5,
                              borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              bgcolor: isImage ? 'transparent' : (isMe ? 'primary.main' : 'background.paper'),
                              color: isImage ? 'inherit' : (isMe ? 'primary.contrastText' : 'text.primary'),
                              overflow: 'hidden',
                              boxShadow: isImage ? 'none' : (isMe 
                                ? '0 1px 3px rgba(46, 125, 50, 0.12)' 
                                : '0 1px 3px rgba(0, 0, 0, 0.06)'),
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                boxShadow: isImage ? 'none' : (isMe 
                                  ? '0 2px 6px rgba(46, 125, 50, 0.15)' 
                                  : '0 2px 6px rgba(0, 0, 0, 0.08)'),
                              },
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
                                    borderRadius: 2,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      opacity: 0.9,
                                      transform: 'scale(1.01)',
                                    },
                                  }}
                                  onClick={() => window.open(imageUrl, '_blank')}
                                />
                                {msg.message_text && (
                                  <Typography variant="body2" sx={{ wordBreak: 'break-word', px: 2, pt: 1 }}>
                                    {msg.message_text}
                                  </Typography>
                                )}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, px: 2, pb: 1 }}>
                                  <Typography variant="caption" sx={{ opacity: 0.85 }}>
                                    {formatMessageTime(msg.created_at)}
                                  </Typography>
                                  {isMe && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
                                      {isRead ? (
                                        <DoneAllIcon sx={{ fontSize: 16, opacity: 0.9, color: 'primary.contrastText' }} />
                                      ) : (
                                        <DoneIcon sx={{ fontSize: 16, opacity: 0.7, color: 'primary.contrastText' }} />
                                      )}
                                    </Box>
                                  )}
                                </Box>
                              </>
                            ) : (
                              <>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    wordBreak: 'break-word',
                                    lineHeight: 1.5,
                                    fontSize: '0.95rem',
                                  }}
                                >
                                  {msg.message_text}
                                </Typography>
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'flex-end', 
                                  gap: 0.5, 
                                  mt: 1,
                                }}>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      opacity: 0.75,
                                      fontSize: '0.7rem',
                                    }}
                                  >
                                    {formatMessageTime(msg.created_at)}
                                  </Typography>
                                  {isMe && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
                                      {isRead ? (
                                        <DoneAllIcon sx={{ fontSize: 16, opacity: 0.95, color: 'primary.contrastText' }} />
                                      ) : (
                                        <DoneIcon sx={{ fontSize: 16, opacity: 0.8, color: 'primary.contrastText' }} />
                                      )}
                                    </Box>
                                  )}
                                </Box>
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
              {!isBlocked && (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: { xs: 1.5, md: 2 }, 
                    borderTop: '1px solid', 
                    borderColor: 'divider',
                    flexShrink: 0,
                    bgcolor: 'background.paper',
                    boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageSelect}
                  />
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
                    <IconButton
                      color="primary"
                      onClick={handleImageButtonClick}
                      disabled={sendLoading || uploadingImage}
                      sx={{ 
                        flexShrink: 0,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.15),
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s ease',
                        borderRadius: 2,
                      }}
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
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 3, 
                          bgcolor: alpha(theme.palette.grey[100], 0.6),
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.grey[100], 0.8),
                          },
                          '&.Mui-focused': {
                            bgcolor: 'background.paper',
                            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                          },
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(theme.palette.grey[300], 0.3),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(theme.palette.grey[400], 0.5),
                        },
                        '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                      }}
                    />
                    <IconButton
                      color="primary"
                      onClick={() => handleSendMessage()}
                      disabled={(!messageText.trim() && !uploadingImage) || sendLoading || uploadingImage}
                      sx={{ 
                        flexShrink: 0,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          transform: 'scale(1.1)',
                        },
                        '&:disabled': {
                          bgcolor: alpha(theme.palette.action.disabled, 0.1),
                        },
                        transition: 'all 0.2s ease',
                        borderRadius: 2,
                      }}
                    >
                      {sendLoading ? <CircularProgress size={24} /> : <SendIcon />}
                    </IconButton>
                  </Box>
                </Paper>
              )}
              {isBlocked && (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    borderTop: '1px solid', 
                    borderColor: 'divider',
                    flexShrink: 0,
                    bgcolor: 'error.light',
                    color: 'error.contrastText',
                  }}
                >
                  <Typography variant="body2" align="center" sx={{ mb: blockedByMe ? 1.5 : 0 }}>
                    {blockedByMe 
                      ? 'You have blocked this user. Messages cannot be sent.'
                      : 'This user has blocked you. Messages cannot be sent.'}
                  </Typography>
                  {blockedByMe && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={handleUnblockUser}
                        sx={{ textTransform: 'none' }}
                      >
                        Unblock User
                      </Button>
                    </Box>
                  )}
                </Paper>
              )}
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
            <Box sx={{ 
              px: 2.5, 
              py: 2, 
              borderBottom: '1px solid', 
              borderColor: 'divider',
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                Friends
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {friendsLoading ? 'Loading…' : hasFriends ? `${friends.length} friend(s)` : 'Start a chat with a friend'}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
              {friendsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : !hasFriends ? (
                <Box sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.6 }} />
                  </Box>
                  <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>
                    No friends yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                    Add friends from their profile to chat
                  </Typography>
                </Box>
              ) : (
                <>
                  <List disablePadding>
                    {friends.map((f) => (
                      <ListItem key={f.userId || f.phone} disablePadding>
                        <ListItemButton 
                          onClick={() => handleSelectFriend(f.userId || f.phone)}
                          sx={{
                            px: 2,
                            py: 1.5,
                            borderRadius: 0,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              transform: 'translateX(2px)',
                            },
                          }}
                        >
                          <ListItemAvatar sx={{ minWidth: 48 }}>
                            <Avatar 
                              src={f.userImage} 
                              alt={f.userName}
                              sx={{
                                width: 44,
                                height: 44,
                                border: `2px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                              }}
                            >
                              {(f.userName || '?').charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={f.userName} 
                            primaryTypographyProps={{ 
                              fontWeight: 500,
                              fontSize: '0.95rem',
                            }} 
                          />
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
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: 2, 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          }}>
            <Typography fontWeight={700} variant="subtitle1">Conversations</Typography>
            <IconButton 
              onClick={() => setMobileConversationsDrawerOpen(false)} 
              size="small" 
              aria-label="Close"
              sx={{
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.action.hover, 0.1),
                  transform: 'rotate(90deg)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ overflowY: 'auto', flex: 1 }}>
            {conversationsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={28} />
              </Box>
            ) : !hasConversations ? (
              <Box sx={{ 
                p: 4, 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <MessageIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.6 }} />
                </Box>
                <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>
                  No conversations yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                  Open Friends to start a chat
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {conversations.map((c) => {
                  const hasUnread = (c.unread_count || 0) > 0;
                  return (
                    <ListItem key={c.id} disablePadding>
                      <ListItemButton
                        selected={currentConversation?.id === c.id}
                        onClick={() => handleSelectConversation(c)}
                        sx={{
                          bgcolor: hasUnread && currentConversation?.id !== c.id 
                            ? alpha(theme.palette.primary.main, 0.08) 
                            : 'transparent',
                          '&:hover': {
                            bgcolor: hasUnread && currentConversation?.id !== c.id
                              ? alpha(theme.palette.primary.main, 0.12)
                              : alpha(theme.palette.action.hover, 0.05),
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Badge 
                            badgeContent={hasUnread ? c.unread_count : 0} 
                            color="primary" 
                            max={99}
                            invisible={!hasUnread}
                          >
                            <Avatar src={c.image} alt={c.name}>{(c.name || '?').charAt(0)}</Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={c.name} 
                          secondary={c.preview} 
                          primaryTypographyProps={{ 
                            fontWeight: hasUnread ? 700 : 500,
                            color: hasUnread ? 'primary.main' : 'text.primary',
                          }} 
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
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
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <Typography fontWeight={700} variant="subtitle1">Friends</Typography>
            <IconButton 
              onClick={() => setMobileFriendsDrawerOpen(false)} 
              size="small" 
              aria-label="Close"
              sx={{
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.action.hover, 0.1),
                  transform: 'rotate(90deg)',
                },
              }}
            >
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

      {/* Conversation Menu */}
      <Menu
        anchorEl={conversationMenuAnchorEl}
        open={Boolean(conversationMenuAnchorEl)}
        onClose={handleConversationMenuClose}
        onClick={handleConversationMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleViewProfile}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          View Profile
        </MenuItem>
        <MenuItem onClick={handleDeleteConversation}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete Conversation
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleBlockUser} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <BlockIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          Block
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Chat;
