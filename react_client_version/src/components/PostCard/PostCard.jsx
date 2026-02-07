import React, { useState } from 'react';
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
  BookmarkBorder as SaveIcon,
  Bookmark as SavedIcon,
  MoreHoriz as MoreIcon,
  Verified as VerifiedIcon,
  Delete as DeleteIcon,
  Flag as ReportIcon,
  VisibilityOff as HideIcon,
  ContentCopy as CopyIcon,
  Link as LinkIcon,
} from '@mui/icons-material';

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

const PostCard = ({ post, onLike, onOpenComments, onNavigate, currentUserId, onDelete, onReport, onHide }) => {
  const [liked, setLiked] = useState(post.isLiked === 1);
  const [likeCount, setLikeCount] = useState(post.postLikes);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

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
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    if (onLike) onLike(post.postId, !liked);
  };

  const handleSave = () => {
    setSaved(!saved);
  };

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
              src={post.userImage}
              onClick={() => onNavigate && onNavigate(`/profile/${post.userId}`)}
              sx={{
                width: 36,
                height: 36,
                border: '2px solid',
                borderColor: post.vip ? 'primary.main' : 'transparent',
                cursor: 'pointer',
              }}
            />
            <Box>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  onClick={() => onNavigate && onNavigate(`/profile/${post.userId}`)}
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  {post.userName}
                </Typography>
                {post.vip === 1 && (
                  <VerifiedIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                )}
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
        {post.postImage && post.hasVideo !== 1 && (
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
            <IconButton onClick={handleCopyLink}>
              <ShareIcon />
            </IconButton>
          </Stack>
          <IconButton onClick={handleSave}>
            {saved ? <SavedIcon /> : <SaveIcon />}
          </IconButton>
        </Stack>

        {/* Likes */}
        {likeCount > 0 && (
          <Typography
            variant="subtitle2"
            fontWeight={600}
            sx={{ px: 2, pb: 0.5 }}
          >
            {formatNumber(likeCount)} {likeCount === 1 ? 'like' : 'likes'}
          </Typography>
        )}

        {/* Caption */}
        {post.body && (
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
                {post.userName}
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
