import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Box,
  Typography,
  Avatar,
  Toolbar,
} from '@mui/material';
import {
  Home as HomeIcon,
  Search as SearchIcon,
  MenuBook as MenuBookIcon,
  ShowChart as ShowChartIcon,
  Brightness5 as BrightnessIcon,
  PlayCircle as PlayCircleIcon,
  Article as ArticleIcon,
  MusicNote as MusicNoteIcon,
  Settings as SettingsIcon,
  AttachMoney as MoneyIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  Info as InfoIcon,
  ContactMail as ContactIcon,
  Gavel as TermsIcon,
  PrivacyTip as PrivacyIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

const mainMenuItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/' },
  { text: 'Explore', icon: <SearchIcon />, path: '/explore' },
  { text: 'Vocab Learning', icon: <MenuBookIcon />, path: '/vocab-learning' },
  { text: 'My Learning', icon: <ShowChartIcon />, path: '/my-learning' },
];

const subMenuItems = [
  {
    text: 'Additional Lessons',
    icon: <BrightnessIcon />,
    children: [
      { text: 'English Language', path: '/additional-lessons/english' },
      { text: 'Korean Language', path: '/additional-lessons/korea' },
    ],
  },
  {
    text: 'Video Channels',
    icon: <PlayCircleIcon />,
    children: [
      { text: 'English Language', path: '/video-channel/english' },
      { text: 'Korean Language', path: '/video-channel/korea' },
    ],
  },
  {
    text: 'Discussion',
    icon: <ArticleIcon />,
    children: [
      { text: 'Easy English', path: '/discussion/english' },
      { text: 'Easy Korean', path: '/discussion/korea' },
    ],
  },
  {
    text: 'Song with Lyrics',
    icon: <MusicNoteIcon />,
    children: [
      { text: 'English Song', path: '/songs/english' },
      { text: 'Korean Song', path: '/songs/korea' },
    ],
  },
];

const adminTeamItems = [
  {
    text: 'Easy English',
    icon: '/icons/easyenglish_icon.png',
    path: '/admin-team/english',
  },
  {
    text: 'Easy Korean',
    icon: '/icons/easykorean_icon.png',
    path: '/admin-team/korea',
  },
];

const bottomMenuItems = [
  { text: 'Setting', icon: <SettingsIcon />, path: '/settings' },
  { text: 'Purchase VIP Plan', icon: <MoneyIcon />, path: '/vip-plan' },
  { text: 'Sign Out', icon: <LogoutIcon />, path: '/logout' },
];

const footerLinks = [
  { text: 'About', icon: <InfoIcon />, path: '/about' },
  { text: 'Contact Us', icon: <ContactIcon />, path: '/contact' },
  { text: 'Terms', icon: <TermsIcon />, path: '/terms' },
  { text: 'Privacy', icon: <PrivacyIcon />, path: '/privacy' },
];

const Sidebar = ({ open, onClose, variant = 'persistent' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const handleToggleMenu = (menuText) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuText]: !prev[menuText],
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    // Only close drawer on mobile (temporary variant)
    if (variant === 'temporary') {
      onClose();
    }
  };

  const isActive = (path) => location.pathname === path;

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar />
      
      {/* Main Menu */}
      <List sx={{ px: 1 }}>
        {mainMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}

        {/* Expandable Menus */}
        {subMenuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleToggleMenu(item.text)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                {expandedMenus[item.text] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={expandedMenus[item.text]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.children.map((child) => (
                  <ListItemButton
                    key={child.text}
                    sx={{ pl: 4 }}
                    selected={isActive(child.path)}
                    onClick={() => handleNavigation(child.path)}
                  >
                    <ListItemText primary={child.text} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      {/* Admin Team Section */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          ADMIN TEAM (Help)
        </Typography>
      </Box>
      <List sx={{ px: 1 }}>
        {adminTeamItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>
                <Avatar
                  src={item.icon}
                  alt={item.text}
                  sx={{ width: 24, height: 24 }}
                />
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      {/* Bottom Menu */}
      <List sx={{ px: 1 }}>
        {bottomMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Footer */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {footerLinks.map((link) => (
            <Typography
              key={link.text}
              variant="caption"
              component="span"
              sx={{
                color: 'text.secondary',
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' },
              }}
              onClick={() => handleNavigation(link.path)}
            >
              {link.text}
            </Typography>
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary">
          © 2024 <strong>Calamus Education</strong>. All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );

  // For persistent drawer, we don't want backdrop
  if (variant === 'persistent') {
    return (
      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: open ? drawerWidth : 0,
          flexShrink: 0,
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: open
                ? theme.transitions.duration.enteringScreen
                : theme.transitions.duration.leavingScreen,
            }),
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            position: 'fixed',
          },
        }}
      >
        {drawer}
      </Drawer>
    );
  }

  // For temporary drawer (mobile), use modal with backdrop
  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;
export { drawerWidth };
