import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { LocalLibrary as LocalLibraryIcon } from '@mui/icons-material';

/**
 * Mini Library page – placeholder for future implementation.
 */
const MiniLibrary = () => {
  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            textAlign: 'center',
          }}
        >
          <LocalLibraryIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Mini Library
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This page is coming soon. You will be able to browse and access the mini library here.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default MiniLibrary;
