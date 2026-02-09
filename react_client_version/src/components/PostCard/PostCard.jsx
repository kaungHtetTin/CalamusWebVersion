import React, { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Typography,
  Avatar,
  IconButton,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  Divider,
} from '@mui/material';
import {
  FavoriteBorder as LikeIcon,
  Favorite as LikedIcon,
  ChatBubbleOutline as CommentIcon,
  Send as ShareIcon,
  MoreHoriz as MoreIcon,
  Verified as VerifiedIcon,
  Delete as DeleteIcon,
  Flag as ReportIcon,
  VisibilityOff as HideIcon,
  ContentCopy as CopyIcon,
  Link as LinkIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { Chip } from '@mui/material';

// Format relative time from postId (timestamp-based IDs)
export const formatRelativeTime = (timestamp) => {
  const now = Date.now();
  const diff = (now - timestamp) / 1000;

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;

  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

// Format numbers (1K, 1M, etc.)
export const formatNumber = (num) => {
  if (!num || num === 0) return '';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Get language display info
const getLanguageInfo = (category) => {
  const langMap = {
    english: {
      label: 'English',
      color: '#1976d2', // Blue
      bgColor: '#e3f2fd',
    },
    korea: {
      label: 'Korean',
      color: '#d32f2f', // Red
      bgColor: '#ffebee',
    },
  };
  return langMap[category] || langMap.english;
};

const PostCard = ({ post, onLike, onOpenComments, onNavigate, currentUserId, onDelete, onReport, onHide, onShare }) => {
  // For shared posts, use original post's like data
  const originalPostId = post.share || post.postId;
  const isSharedPost = !!post.share;
  const displayLikeCount = isSharedPost && post.originalPost ? (post.originalPost.postLikes || 0) : (post.postLikes || 0);
  const displayIsLiked = isSharedPost && post.originalPost ? (post.originalPost.isLiked === 1) : (post.isLiked === 1);
  
  const [liked, setLiked] = useState(displayIsLiked);
  const [likeCount, setLikeCount] = useState(displayLikeCount);
  const [shareCount, setShareCount] = useState(post.shareCount || 0);
  const [expanded, setExpanded] = useState(false);
  const [sharing, setSharing] = useState(false);

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const menuOpen = Boolean(menuAnchor);

  // Delete confirm dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const isOwner = currentUserId && (String(post.userId) === String(currentUserId));

  const handleLike = () => {
    // For shared posts, like the original post
    const postIdToLike = post.share || post.postId;
    const newLikedState = !liked;
    setLiked(newLikedState);
    // Optimistic update
    setLikeCount(newLikedState ? likeCount + 1 : likeCount - 1);
    if (onLike) onLike(post.postId, newLikedState);
  };
  
  // Sync like state when originalPost data changes (for shared posts)
  useEffect(() => {
    if (isSharedPost && post.originalPost) {
      setLiked(post.originalPost.isLiked === 1);
      setLikeCount(post.originalPost.postLikes || 0);
    }
  }, [isSharedPost, post.originalPost?.isLiked, post.originalPost?.postLikes]);

  // --- Menu handlers ---
  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleCopyText = () => {
    handleMenuClose();
    const text = post.body || '';
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        setSnackbar({ open: true, message: 'Text copied to clipboard', severity: 'success' });
      }).catch(() => {
        setSnackbar({ open: true, message: 'Failed to copy text', severity: 'error' });
      });
    } else {
      setSnackbar({ open: true, message: 'No text to copy', severity: 'info' });
    }
  };

  const handleCopyLink = () => {
    handleMenuClose();
    const link = `${window.location.origin}/post/${post.postId}`;
    navigator.clipboard.writeText(link).then(() => {
      setSnackbar({ open: true, message: 'Post link copied', severity: 'success' });
    }).catch(() => {
      setSnackbar({ open: true, message: 'Failed to copy link', severity: 'error' });
    });
  };

  const handleShare = async () => {
    if (!onShare) return;
    setSharing(true);
    try {
      const result = await onShare(post.postId);
      if (result?.alreadyShared) {
        // Already shared - show info message instead of error
        setSnackbar({ open: true, message: result.message || 'You have already shared this post', severity: 'info' });
      } else {
        setShareCount(prev => prev + 1);
        setSnackbar({ open: true, message: 'Post shared successfully', severity: 'success' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Failed to share post', severity: 'error' });
    } finally {
      setSharing(false);
    }
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      if (onDelete) {
        await onDelete(post.postId);
        setSnackbar({ open: true, message: 'Post deleted', severity: 'success' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Failed to delete post', severity: 'error' });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleReport = async () => {
    handleMenuClose();
    try {
      if (onReport) {
        const result = await onReport(post.postId);
        setSnackbar({ open: true, message: result?.message || 'Post reported. Thank you.', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Please login to report', severity: 'warning' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Failed to report post', severity: 'error' });
    }
  };

  const handleHide = async () => {
    handleMenuClose();
    try {
      if (onHide) {
        await onHide(post.postId);
        setSnackbar({ open: true, message: 'Post hidden from your feed', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Please login to hide posts', severity: 'warning' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Failed to hide post', severity: 'error' });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Truncate text
  const shouldTruncate = post.body && post.body.length > 150;
  const displayText = expanded || !shouldTruncate
    ? post.body
    : `${post.body.substring(0, 150)}...`;
  
  // For shared posts, only show caption if sharer added a comment (body differs from original)
  // For regular posts, always show caption if body exists
  const showCaption = post.body && (!post.share || (post.share && post.originalPost && post.body !== post.originalPost.body));

  // Get language info - use original post category for shared posts, otherwise use post category
  const postCategory = post.share && post.originalPost 
    ? (post.originalPost.category || post.category || 'english')
    : (post.category || 'english');
  const languageInfo = getLanguageInfo(postCategory);

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: { xs: 0, sm: 2 },
          border: 'none',
          boxShadow: { xs: 'none', sm: '0 2px 12px rgba(0,0,0,0.06)' },
          overflow: 'hidden',
          mb: { xs: 1, sm: 2 },
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ p: 1.5 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              src={post.sharerImage || post.userImage}
              onClick={() => onNavigate && onNavigate(`/profile/${post.sharerId || post.userId}`)}
              sx={{
                width: 36,
                height: 36,
                border: '2px solid',
                borderColor: post.vip ? 'primary.main' : 'transparent',
                cursor: 'pointer',
              }}
            />
            <Box>
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  onClick={() => onNavigate && onNavigate(`/profile/${post.sharerId || post.userId}`)}
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  {post.sharerName || post.userName}
                </Typography>
                {post.vip === 1 && (
                  <VerifiedIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                )}
                <Chip
                  icon={<LanguageIcon sx={{ fontSize: 12 }} />}
                  label={languageInfo.label}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    bgcolor: languageInfo.bgColor,
                    color: languageInfo.color,
                    border: `1px solid ${languageInfo.color}20`,
                    '& .MuiChip-icon': {
                      color: languageInfo.color,
                      fontSize: 12,
                    },
                    '& .MuiChip-label': {
                      px: 0.75,
                    },
                  }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {formatRelativeTime(post.postId)}
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Media - Only show image if not a video post */}
        {/* For shared posts, show original post image in the shared indicator, not here */}
        {post.postImage && post.hasVideo !== 1 && !post.share && (
          <Box
            sx={{
              width: '100%',
              bgcolor: 'grey.100',
              position: 'relative',
            }}
          >
            <Box
              component="img"
              src={post.postImage}
              alt="Post"
              onClick={() => onNavigate && onNavigate(`/post/${post.postId}`)}
              sx={{
                width: '100%',
                maxHeight: 500,
                objectFit: 'cover',
                display: 'block',
                cursor: 'pointer',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </Box>
        )}

        {/* Video */}
        {post.hasVideo === 1 && post.vimeo && (
          <Box
            sx={{
              position: 'relative',
              paddingTop: '56.25%',
              bgcolor: 'black',
            }}
          >
            <Box
              component="iframe"
              src={post.vimeo}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            />
          </Box>
        )}

        {/* Actions */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 1, py: 0.5 }}
        >
          <Stack direction="row" alignItems="center">
            <IconButton onClick={handleLike}>
              {liked ? (
                <LikedIcon sx={{ color: 'error.main' }} />
              ) : (
                <LikeIcon />
              )}
            </IconButton>
            <IconButton onClick={() => onOpenComments && onOpenComments(post)}>
              <CommentIcon />
            </IconButton>
            {/* Don't show share button for shared posts (can't share a share) */}
            {!post.share && (
              <IconButton onClick={handleShare} disabled={sharing || !onShare}>
                <ShareIcon />
              </IconButton>
            )}
          </Stack>
        </Stack>

        {/* Likes and Shares */}
        {(likeCount > 0 || shareCount > 0) && (
          <Stack direction="row" spacing={2} sx={{ px: 2, pb: 0.5 }}>
            {likeCount > 0 && (
              <Typography variant="subtitle2" fontWeight={600}>
                {formatNumber(likeCount)} {likeCount === 1 ? 'like' : 'likes'}
              </Typography>
            )}
            {shareCount > 0 && (
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                {formatNumber(shareCount)} {shareCount === 1 ? 'share' : 'shares'}
              </Typography>
            )}
          </Stack>
        )}

        {/* Shared Post Indicator */}
        {post.share && post.originalPost && (
          <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <ShareIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                {post.sharerName || post.userName} shared a post
              </Typography>
            </Stack>
            {/* Original Post Content - Clickable */}
            <Paper
              elevation={0}
              onClick={() => onNavigate && onNavigate(`/post/${post.share}`)}
              sx={{
                bgcolor: 'grey.50',
                borderRadius: 2,
                p: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: 'grey.100',
                  borderColor: 'primary.main',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Avatar
                  src={post.originalPost.userImage}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate && onNavigate(`/profile/${post.originalPost.userId}`);
                  }}
                  sx={{ 
                    width: 40, 
                    height: 40,
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.8,
                    },
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      fontSize={14}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate && onNavigate(`/profile/${post.originalPost.userId}`);
                      }}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {post.originalPost.userName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontSize={11}>
                      · {formatRelativeTime(post.share)}
                    </Typography>
                  </Stack>
                  {post.originalPost.body && (
                    <Typography
                      variant="body2"
                      fontSize={13}
                      sx={{
                        mt: 0.5,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        color: 'text.primary',
                      }}
                    >
                      {post.originalPost.body}
                    </Typography>
                  )}
                  
                  {/* Original Post Video */}
                  {post.originalPost.hasVideo === 1 && post.originalPost.vimeo && (
                    <Box
                      sx={{
                        position: 'relative',
                        paddingTop: '56.25%',
                        bgcolor: 'black',
                        borderRadius: 1.5,
                        mt: 1.5,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        component="iframe"
                        src={post.originalPost.vimeo}
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    </Box>
                  )}
                  
                  {/* Original Post Image */}
                  {post.originalPost.postImage && post.originalPost.hasVideo !== 1 && (
                    <Box
                      component="img"
                      src={post.originalPost.postImage}
                      alt="Original post"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate && onNavigate(`/post/${post.share}`);
                      }}
                      sx={{
                        width: '100%',
                        maxHeight: 300,
                        objectFit: 'cover',
                        borderRadius: 1.5,
                        mt: 1.5,
                        display: 'block',
                        cursor: 'pointer',
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </Box>
              </Stack>
            </Paper>
          </Box>
        )}

        {/* Caption - Show for regular posts or sharer's comment on shared posts */}
        {showCaption && (
          <Box sx={{ px: 2, pb: 1.5 }}>
            <Typography
              variant="body2"
              component="span"
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              <Typography
                component="span"
                variant="body2"
                fontWeight={600}
                sx={{ mr: 1 }}
              >
                {post.share ? (post.sharerName || post.userName) : post.userName}
              </Typography>
              {displayText}
            </Typography>
            {shouldTruncate && !expanded && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ cursor: 'pointer', mt: 0.5 }}
                onClick={() => setExpanded(true)}
              >
                more
              </Typography>
            )}
          </Box>
        )}

        {/* Comments preview */}
        {post.comments > 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              px: 2,
              pb: 1.5,
              cursor: 'pointer',
              '&:hover': { color: 'text.primary' },
            }}
            onClick={() => onOpenComments && onOpenComments(post)}
          >
            View all {formatNumber(post.comments)} comments
          </Typography>
        )}
      </Paper>

      {/* Post Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              minWidth: 200,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            },
          },
        }}
      >
        {/* Copy text */}
        {post.body && (
          <MenuItem onClick={handleCopyText}>
            <ListItemIcon>
              <CopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Copy text</ListItemText>
          </MenuItem>
        )}

        {/* Copy link */}
        <MenuItem onClick={handleCopyLink}>
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy link</ListItemText>
        </MenuItem>

        {/* Hide post (only for non-owners) */}
        {!isOwner && (
          <MenuItem onClick={handleHide}>
            <ListItemIcon>
              <HideIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Hide post</ListItemText>
          </MenuItem>
        )}

        {/* Divider before destructive actions */}
        {(!isOwner || isOwner) && <Divider />}

        {/* Report (only for non-owners) */}
        {!isOwner && (
          <MenuItem onClick={handleReport}>
            <ListItemIcon>
              <ReportIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{ color: 'warning.main' }}
            >
              Report
            </ListItemText>
          </MenuItem>
        )}

        {/* Delete (owner only) */}
        {isOwner && (
          <MenuItem onClick={handleDeleteClick}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{ color: 'error.main' }}
            >
              Delete
            </ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Delete Post?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. The post will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PostCard;
