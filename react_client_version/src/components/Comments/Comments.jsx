import React from 'react';
import { Box, Typography, Stack, Avatar, TextField, Button } from '@mui/material';
import { ChatBubbleOutline as CommentIcon } from '@mui/icons-material';

export default function Comments({ commentCount = 0, comment, setComment, onSubmit }) {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography fontWeight={600} sx={{ mb: 2.5, fontSize: '1rem' }}>
        {commentCount} Comments
      </Typography>

      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Avatar sx={{ width: 40, height: 40, bgcolor: 'grey.400', fontSize: '0.9rem' }}>U</Avatar>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            variant="standard"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ '& .MuiInput-underline:before': { borderBottomColor: 'divider' } }}
          />
          {comment && (
            <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
              <Button size="small" onClick={() => setComment('')} sx={{ textTransform: 'none', color: 'text.primary' }}>
                Cancel
              </Button>
              <Button size="small" variant="contained" disableElevation sx={{ textTransform: 'none', borderRadius: 5 }} onClick={onSubmit}>
                Comment
              </Button>
            </Stack>
          )}
        </Box>
      </Stack>

      <Box sx={{ mt: 4, textAlign: 'center', py: 4 }}>
        <CommentIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
        <Typography color="text.secondary">Comments will appear here</Typography>
      </Box>
    </Box>
  );
}
