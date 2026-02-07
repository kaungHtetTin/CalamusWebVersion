import React, { useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  Avatar,
  IconButton,
  TextField,
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
} from '@mui/material';
import { Send as SendIcon, MoreHoriz as MoreIcon, Delete as DeleteIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import { formatRelativeTime, formatNumber } from '../PostCard';

const CommentItem = ({
  postId,
  comment,
  isReply = false,
  currentUserId,
  onLikeComment,
  onDeleteComment,
  onReplySubmit,
  isAuthenticated,
}) => {
  const [liked, setLiked] = useState(comment.isLiked === 1);
  const [likeCount, setLikeCount] = useState(comment.likes || 0);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleted, setDeleted] = useState(false);

  const isOwner = currentUserId && String(comment.writerId) === String(currentUserId);
  const menuOpen = Boolean(menuAnchor);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    if (onLikeComment) onLikeComment(comment.time, !liked);
  };

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = () => setMenuAnchor(null);

  const handleCopyText = () => {
    handleMenuClose();
    if (comment.body && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(comment.body);
      setSnackbar({ open: true, message: 'Copied to clipboard', severity: 'success' });
    }
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!onDeleteComment) return;
    setDeleting(true);
    try {
      await onDeleteComment(postId, comment.time);
      setDeleted(true);
      setSnackbar({ open: true, message: 'Comment deleted', severity: 'success' });
      setDeleteDialogOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete comment', severity: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const handleReplySubmit = async () => {
    const body = replyText.trim();
    if (!body || !onReplySubmit || !isAuthenticated) return;
    setSubmitting(true);
    try {
      await onReplySubmit(comment.time, body);
      setReplyText('');
      setShowReplyInput(false);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to post reply', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (deleted) return null;

  return (
    <>
      <Box sx={{ ml: isReply ? 5 : 0, mb: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <Avatar
            src={comment.userImage}
            sx={{ width: isReply ? 24 : 32, height: isReply ? 24 : 32 }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
              <Box
                sx={{
                  bgcolor: 'grey.100',
                  borderRadius: '18px',
                  px: 2,
                  py: 1,
                  display: 'inline-block',
                  maxWidth: '100%',
                }}
              >
                <Typography variant="subtitle2" fontWeight={600} fontSize={isReply ? 12 : 13} color="text.primary" sx={{ lineHeight: 1.3 }}>
                  {comment.userName}
                </Typography>
                <Typography variant="body2" fontSize={isReply ? 13 : 14} color="text.primary" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.4 }}>
                  {comment.body}
                </Typography>
              </Box>
              {((comment.body) || (isOwner && onDeleteComment)) && (
                <IconButton size="small" onClick={handleMenuOpen} sx={{ mt: -0.5 }}>
                  <MoreIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.3, ml: 1.5 }}>
              <Typography
                variant="caption"
                color={liked ? 'primary.main' : 'text.secondary'}
                sx={{ cursor: 'pointer', fontWeight: liked ? 700 : 600, fontSize: 12, '&:hover': { textDecoration: 'underline' } }}
                onClick={handleLike}
              >
                Like{likeCount > 0 && ` · ${formatNumber(likeCount)}`}
              </Typography>
              {!isReply && onReplySubmit && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ cursor: 'pointer', fontWeight: 600, fontSize: 12, '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => setShowReplyInput(!showReplyInput)}
                >
                  Reply
                </Typography>
              )}
              <Typography variant="caption" color="text.disabled" fontSize={12}>
                {formatRelativeTime(comment.time)}
              </Typography>
            </Stack>

            {showReplyInput && onReplySubmit && (
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <TextField
                  size="small"
                  placeholder="Write a reply..."
                  fullWidth
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleReplySubmit()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '20px',
                      fontSize: 13,
                      bgcolor: 'grey.100',
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
                <IconButton size="small" color="primary" onClick={handleReplySubmit} disabled={!replyText.trim() || submitting}>
                  <SendIcon fontSize="small" />
                </IconButton>
              </Stack>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <Box sx={{ mt: 1.5 }}>
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id || reply.time}
                    postId={postId}
                    comment={reply}
                    isReply
                    currentUserId={currentUserId}
                    onLikeComment={onLikeComment}
                    onDeleteComment={onDeleteComment}
                    onReplySubmit={onReplySubmit}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Stack>
      </Box>

      <Menu anchorEl={menuAnchor} open={menuOpen} onClose={handleMenuClose} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
        {comment.body && (
          <MenuItem onClick={handleCopyText}>
            <ListItemIcon><CopyIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Copy text</ListItemText>
          </MenuItem>
        )}
        {isOwner && onDeleteComment && (
          <MenuItem onClick={handleDeleteClick}>
            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ color: 'error.main' }}>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={() => !deleting && setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Comment?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

export default CommentItem;
