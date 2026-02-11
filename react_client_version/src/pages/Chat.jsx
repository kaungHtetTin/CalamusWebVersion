import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';

/**
 * Chat page placeholder. Message button on profile navigates here with ?with=userId.
 * When full chat UI is built, use searchParams.get('with') to open or create that conversation.
 */
const Chat = () => {
  const [searchParams] = useSearchParams();
  const withUserId = searchParams.get('with');

  return (
    <Box sx={{ py: 4, px: 2, maxWidth: 600, mx: 'auto' }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <ChatIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Chat
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {withUserId
            ? `Conversation with user will open here (ID: ${withUserId}). Chat UI can be implemented to create or open this conversation.`
            : 'Your conversations will appear here. Open a profile and tap Message to start a chat.'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default Chat;
