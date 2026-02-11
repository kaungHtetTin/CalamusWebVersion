import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Avatar,
  CircularProgress,
  alpha,
  useTheme,
  useMediaQuery,
  Backdrop,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Image as ImageIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import { useSupportChat } from '../../context/SupportChatContext';
import { useAuth } from '../../context/AuthContext';
import { chatAPI } from '../../services/api';

const SUPPORT_USER_ID = 10000;

const SupportChatBox = () => {
  const { isOpen, isMinimized, major, closeChat, minimizeChat, maximizeChat } = useSupportChat();
  const { user: authUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const latestMessageIdRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const previousMessagesCountRef = useRef(0);

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const myId = authUser?.phone != null ? Number(authUser.phone) : null;

  // Fetch or create conversation with support
  const fetchOrCreateConversation = useCallback(async () => {
    if (!myId) return;

    try {
      // Try to get existing conversation
      const res = await chatAPI.getConversations(myId, major);
      const existingConv = res.data?.find(
        (c) => c.friend?.phone === SUPPORT_USER_ID
      );

      if (existingConv) {
        return existingConv;
      }

      // Create new conversation
      const newConv = await chatAPI.createConversation(myId, SUPPORT_USER_ID, major);
      if (newConv && newConv.data) {
        return newConv.data;
      }
    } catch (err) {
      console.error('Failed to fetch/create conversation:', err);
      alert('Failed to start support chat. Please try again.');
    }
  }, [myId, major]);

  // Fetch messages function (can be called manually or by polling) - matching friendship chatbox approach
  const fetchMessages = useCallback(async (showLoading = true, beforeId = null, afterId = null, convId = null) => {
    // Use provided convId or fall back to conversation state
    const targetConvId = convId || conversation?.id;
    if (!targetConvId || !myId) {
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
      const res = await chatAPI.getMessages(targetConvId, major, params);
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
        chatAPI.markRead(targetConvId, myId, major).catch(() => {});
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
        chatAPI.markRead(targetConvId, myId, major).catch(() => {});
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
  }, [conversation?.id, myId, major]);

  // Initial fetch and polling setup for messages - matching friendship chatbox approach
  useEffect(() => {
    if (!isOpen || isMinimized || !myId) {
      setMessages([]);
      setHasMoreMessages(true);
      latestMessageIdRef.current = null;
      isInitialLoadRef.current = true;
      previousMessagesCountRef.current = 0;
      return;
    }

    // Reset state for new conversation
    setHasMoreMessages(true);
    latestMessageIdRef.current = null;
    isInitialLoadRef.current = true;
    previousMessagesCountRef.current = 0;

    // Fetch or create conversation first, then load messages immediately
    fetchOrCreateConversation().then((conv) => {
      if (conv) {
        setConversation(conv);
        setIsBlocked(conv.friend?.blocked || false);
        // Load messages immediately - pass conv.id directly to avoid state timing issues
        fetchMessages(true, null, null, conv.id);
      }
    });
  }, [isOpen, isMinimized, myId, fetchOrCreateConversation, fetchMessages]);

  // Set up polling when conversation is available (after initial load)
  useEffect(() => {
    if (!isOpen || isMinimized || !conversation?.id || !myId) return;

    // Set up polling every 5 seconds
    const pollInterval = setInterval(() => {
      // Only fetch newer messages during polling, preserve older messages
      // fetchMessages will use latestMessageIdRef to fetch only new messages
      fetchMessages(false);
    }, 5000);
    
    return () => {
      clearInterval(pollInterval);
    };
  }, [isOpen, isMinimized, conversation?.id, myId, fetchMessages]);

  // Handle scroll to load older messages - matching friendship chatbox approach
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

  // Improved auto-scroll: instant on initial load, smooth for new messages - matching friendship chatbox approach
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
  }, [messages, messagesLoading, isMinimized]);

  // Send message
  const handleSendMessage = async () => {
    if (!conversation?.id || !messageText.trim() || sendLoading || isBlocked) return;

    setSendLoading(true);
    try {
      await chatAPI.sendMessage(conversation.id, myId, major, {
        message_type: 'text',
        message_text: messageText.trim(),
      });
      setMessageText('');
      // Refresh messages - fetch newer messages after sending
      fetchMessages(false);
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendLoading(false);
    }
  };

  // Handle image upload - matching friendship chatbox approach
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !conversation?.id || isBlocked) return;

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
      // Pass file directly - uploadImage function creates FormData internally
      const uploadRes = await chatAPI.uploadImage(file);
      if (uploadRes.success && uploadRes.data) {
        const { file_path, file_size } = uploadRes.data;
        // Send the image message
        await chatAPI.sendMessage(conversation.id, myId, major, {
          message_type: 'image',
          file_path: file_path,
          file_size: file_size,
        });
        // Refresh messages - fetch newer messages after sending image
        fetchMessages(false);
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

  if (!isOpen || !myId) return null;

  const supportName = major === 'korea' ? 'Easy Korean' : 'Easy English';
  const supportImage = major === 'korea' 
    ? '/icons/easykorean_icon.png' 
    : '/icons/easyenglish_icon.png';

  // Format message time - same as friendship chatbox
  const formatMessageTime = (ts) => {
    if (!ts) return '';
    const d = new Date(typeof ts === 'number' ? ts : ts * 1000);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // On mobile: fullscreen approach, on desktop: floating dialog
  if (isMobile) {
    return (
      <>
        <Backdrop
          open={isOpen && !isMinimized}
          onClick={closeChat}
          sx={{
            zIndex: 1299,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
          }}
        />
        <Paper
          elevation={0}
          sx={{
            position: 'fixed',
            bottom: isMinimized ? '-100%' : 0,
            left: 0,
            right: 0,
            top: isMinimized ? 'auto' : 0,
            height: isMinimized ? 'auto' : '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1300,
            transition: 'all 0.3s ease',
            overflow: 'hidden',
            borderRadius: isMinimized ? '16px 16px 0 0' : 0,
            bgcolor: 'background.paper',
          }}
        >
          {/* Header */}
          <Paper
            elevation={0}
            sx={{
              px: 1.5,
              py: 1.25,
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
              src={supportImage}
              sx={{
                width: 36,
                height: 36,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              {supportName.charAt(0)}
            </Avatar>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{
                flex: 1,
                fontSize: '0.95rem',
              }}
            >
              {supportName}
            </Typography>
            <IconButton
              onClick={closeChat}
              size="small"
              aria-label="close chat"
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
          </Paper>

          {/* Messages Area */}
          <Box
            ref={messagesContainerRef}
            onScroll={handleScroll}
            sx={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              p: 1.5,
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
                {messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No messages yet. Start the conversation!
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {messages.map((msg) => {
                  const isMe = Number(msg.sender_id) === myId;
                  const isImage = msg.message_type === 'image' && msg.file_path;
                  const isReadValue = msg.is_read !== undefined && msg.is_read !== null ? msg.is_read : 0;
                  const isReadStatus = typeof isReadValue === 'string' ? parseInt(isReadValue, 10) : Number(isReadValue);
                  const isRead = isReadStatus === 1;
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
                        maxWidth: '85%',
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
              </>
            )}
          </Box>

          {/* Input Area */}
          {!isBlocked && (
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
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
                  onClick={() => fileInputRef.current?.click()}
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
              <Typography variant="body2" align="center">
                This conversation is blocked. You cannot send messages.
              </Typography>
            </Paper>
          )}
        </Paper>
      </>
    );
  }

  // Desktop: Floating dialog approach
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: isMinimized ? 0 : 80,
        right: isMinimized ? 20 : 20,
        width: isMinimized ? 320 : 380,
        height: isMinimized ? 60 : 600,
        maxHeight: 'calc(100vh - 100px)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        zIndex: 1300,
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        borderRadius: isMinimized ? '8px 8px 0 0' : 0,
        bgcolor: 'background.paper',
      }}
    >
      {/* Header - matching friendship chatbox design */}
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
          cursor: isMinimized ? 'pointer' : 'default',
        }}
        onClick={isMinimized ? maximizeChat : undefined}
      >
        <Avatar
          src={supportImage}
          sx={{
            width: { xs: 36, md: 40 },
            height: { xs: 36, md: 40 },
            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          {supportName.charAt(0)}
        </Avatar>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{
            flex: 1,
            fontSize: { xs: '0.95rem', md: '1rem' },
          }}
        >
          {supportName}
        </Typography>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            closeChat();
          }}
          size="small"
          aria-label="close chat"
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
      </Paper>

      {!isMinimized && (
        <>
          {/* Messages Area - matching friendship chatbox design */}
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
                {messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No messages yet. Start the conversation!
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {messages.map((msg) => {
                  const isMe = Number(msg.sender_id) === myId;
                  const isImage = msg.message_type === 'image' && msg.file_path;
                  const isReadValue = msg.is_read !== undefined && msg.is_read !== null ? msg.is_read : 0;
                  const isReadStatus = typeof isReadValue === 'string' ? parseInt(isReadValue, 10) : Number(isReadValue);
                  const isRead = isReadStatus === 1;
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
              </>
            )}
          </Box>

          {/* Input Area - matching friendship chatbox design */}
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
                  onClick={() => fileInputRef.current?.click()}
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
              <Typography variant="body2" align="center">
                This conversation is blocked. You cannot send messages.
              </Typography>
            </Paper>
          )}
        </>
      )}
    </Paper>
  );
};

export default SupportChatBox;
