import React, { useState } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme, styled } from '@mui/material';
import Navbar from './Navbar';
import Sidebar, { drawerWidth } from './Sidebar';

// Styled main content component for smooth transitions
const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  // No marginLeft needed - the Sidebar component handles the space in flex layout
}));

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(true); // Drawer open by default on desktop

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Mock user data - replace with actual auth context
  const isAuthenticated = true;
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    image: null,
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar
        onMenuClick={handleDrawerToggle}
        isAuthenticated={isAuthenticated}
        user={user}
      />

      {/* Drawer - temporary on mobile, persistent on desktop */}
      <Sidebar
        variant={isMobile ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={handleDrawerToggle}
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
