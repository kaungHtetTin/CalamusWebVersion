import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

export default function VimeoPlayer({ src, title, onBack }) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        bgcolor: '#000',
        borderRadius: { xs: 0, md: 2 },
        overflow: 'hidden',
      }}
    >
      {/* Back Button */}
      {onBack && (
        <IconButton
          onClick={onBack}
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 10,
            bgcolor: 'rgba(0,0,0,0.5)',
            color: 'white',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
          }}
        >
          <BackIcon />
        </IconButton>
      )}

      {src ? (
        <iframe
          src={src}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={title || 'Video player'}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography color="grey.500">Video not available</Typography>
        </Box>
      )}
    </Box>
  );
}
