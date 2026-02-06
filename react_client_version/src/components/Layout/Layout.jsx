import React from 'react';
import { Box, Toolbar, useMediaQuery, useTheme, styled } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useDrawer } from '../../context/DrawerContext';

// Styled main content component
const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: 0,
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  overflow: 'hidden',
}));

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { drawerOpen, toggleDrawer } = useDrawer();

  // Mock user data - replace with actual auth context
  const isAuthenticated = true;
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    image: null,
  };

  return (
    <Box sx={{ display: 'flex', overflow: 'hidden' }}>
      <Navbar
        onMenuClick={toggleDrawer}
        isAuthenticated={isAuthenticated}
        user={user}
      />

      {/* Drawer - temporary on mobile, persistent on desktop */}
      <Sidebar
        variant={isMobile ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={toggleDrawer}
      />

      {/* Main Content */}
      <Main>
        <Toolbar />
        {children}
      </Main>
    </Box>
  );
};

export default Layout;
