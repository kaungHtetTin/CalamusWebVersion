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
  useTheme,
  alpha,
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
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 280;

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
  const theme = useTheme();
  const { user, isAuthenticated } = useAuth();
  // Initialize all menus as expanded by default
  const [expandedMenus, setExpandedMenus] = useState(() => {
    const initial = {};
    subMenuItems.forEach((item) => {
      initial[item.text] = true;
    });
    return initial;
  });

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

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const drawer = (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        bgcolor: '#1a1a2e', // Dark background like Firebase Console
        color: '#ffffff',
      }}
    >
      {/* Header Section - Logo/Brand */}
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: `1px solid ${alpha('#ffffff', 0.1)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            bgcolor: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1rem',
          }}
        >
          C
        </Box>
        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#ffffff', fontSize: '0.95rem' }}>
          Calamus
        </Typography>
      </Box>

      {/* User Profile Section (if authenticated) */}
      {isAuthenticated && user && (
        <Box
          sx={{
            px: 2.5,
            pt: 3,
            pb: 2.5,
            borderBottom: `1px solid ${alpha('#ffffff', 0.1)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Avatar
            src={user.image || user.learner_image}
            sx={{
              width: 32,
              height: 32,
              bgcolor: theme.palette.primary.main,
              fontSize: '0.75rem',
            }}
          >
            {(user.name || user.learner_name)?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                color: '#ffffff',
                fontSize: '0.875rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mb: 0.5,
              }}
            >
              {user.name || user.learner_name || 'User'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: alpha('#ffffff', 0.7),
                fontSize: '0.75rem',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.phone || user.learner_phone || ''}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Main Navigation - Scrollable */}
      <Box 
        sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          overflowX: 'hidden', 
          py: 0.25,
          // Custom scrollbar styling for dark theme
          scrollbarWidth: 'thin',
          scrollbarColor: `${alpha('#ffffff', 0.3)} transparent`,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha('#ffffff', 0.3),
            borderRadius: '3px',
            '&:hover': {
              background: alpha('#ffffff', 0.5),
            },
          },
        }}
      >
        {/* Main Menu Items */}
        <List sx={{ px: 1, py: 0 }}>
          {mainMenuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 1,
                    py: 0.75,
                    px: 1.5,
                    minHeight: 36,
                    bgcolor: active ? alpha(theme.palette.primary.main, 0.15) : 'transparent',
                    color: active ? theme.palette.primary.light : alpha('#ffffff', 0.9),
                    '&:hover': {
                      bgcolor: active 
                        ? alpha(theme.palette.primary.main, 0.2) 
                        : alpha('#ffffff', 0.08),
                    },
                    transition: 'all 0.2s ease',
                    borderLeft: active ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: active ? theme.palette.primary.light : alpha('#ffffff', 0.7),
                      minWidth: 36,
                      '& svg': {
                        fontSize: '1.1rem',
                      },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.8125rem',
                      fontWeight: active ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Section Divider */}
        <Box sx={{ px: 2, py: 0.75 }}>
          <Typography
            variant="caption"
            sx={{
              color: alpha('#ffffff', 0.5),
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.65rem',
            }}
          >
            Learning Resources
          </Typography>
        </Box>

        {/* Expandable Sub Menus */}
        <List sx={{ px: 1, py: 0 }}>
          {subMenuItems.map((item) => {
            const isExpanded = expandedMenus[item.text];
            const hasActiveChild = item.children.some((child) => isActive(child.path));
            
            return (
              <React.Fragment key={item.text}>
                <ListItem disablePadding sx={{ mb: 0.25 }}>
                  <ListItemButton
                    onClick={() => handleToggleMenu(item.text)}
                    sx={{
                      borderRadius: 1,
                      py: 0.75,
                      px: 1.5,
                      minHeight: 36,
                      bgcolor: isExpanded || hasActiveChild 
                        ? alpha(theme.palette.primary.main, 0.1) 
                        : 'transparent',
                      color: alpha('#ffffff', 0.9),
                      '&:hover': {
                        bgcolor: alpha('#ffffff', 0.08),
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: hasActiveChild 
                          ? theme.palette.primary.light 
                          : alpha('#ffffff', 0.7),
                        minWidth: 36,
                        '& svg': {
                          fontSize: '1.1rem',
                        },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.8125rem',
                        fontWeight: hasActiveChild ? 600 : 500,
                      }}
                    />
                    <ChevronRightIcon
                      sx={{
                        fontSize: 16,
                        color: alpha('#ffffff', 0.5),
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 0.5 }}>
                    {item.children.map((child) => {
                      const active = isActive(child.path);
                      return (
                        <ListItemButton
                          key={child.text}
                          onClick={() => handleNavigation(child.path)}
                          sx={{
                            borderRadius: 1,
                            py: 0.5,
                            px: 1.5,
                            pl: 4,
                            minHeight: 32,
                            bgcolor: active 
                              ? alpha(theme.palette.primary.main, 0.15) 
                              : 'transparent',
                            color: active 
                              ? theme.palette.primary.light 
                              : alpha('#ffffff', 0.8),
                            '&:hover': {
                              bgcolor: active 
                                ? alpha(theme.palette.primary.main, 0.2) 
                                : alpha('#ffffff', 0.06),
                            },
                            transition: 'all 0.2s ease',
                            borderLeft: active 
                              ? `3px solid ${theme.palette.primary.main}` 
                              : '3px solid transparent',
                          }}
                        >
                          <ListItemText
                            primary={child.text}
                            primaryTypographyProps={{
                              fontSize: '0.75rem',
                              fontWeight: active ? 600 : 400,
                            }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          })}
        </List>

        {/* Admin Team Section */}
        <Box sx={{ px: 2, py: 0.75, mt: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: alpha('#ffffff', 0.5),
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.65rem',
            }}
          >
            Support
          </Typography>
        </Box>
        <List sx={{ px: 1, py: 0 }}>
          {adminTeamItems.map((item) => {
            const active = isActive(item.path);
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 1,
                    py: 0.75,
                    px: 1.5,
                    minHeight: 36,
                    bgcolor: active 
                      ? alpha(theme.palette.primary.main, 0.15) 
                      : 'transparent',
                    color: active ? theme.palette.primary.light : alpha('#ffffff', 0.9),
                    '&:hover': {
                      bgcolor: active 
                        ? alpha(theme.palette.primary.main, 0.2) 
                        : alpha('#ffffff', 0.08),
                    },
                    transition: 'all 0.2s ease',
                    borderLeft: active 
                      ? `3px solid ${theme.palette.primary.main}` 
                      : '3px solid transparent',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Avatar
                      src={item.icon}
                      alt={item.text}
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: alpha('#ffffff', 0.1),
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.8125rem',
                      fontWeight: active ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Bottom Section - Settings & Actions */}
      <Box
        sx={{
          borderTop: `1px solid ${alpha('#ffffff', 0.1)}`,
          py: 0.25,
        }}
      >
        <List sx={{ px: 1, py: 0 }}>
          {bottomMenuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 1,
                    py: 0.75,
                    px: 1.5,
                    minHeight: 36,
                    bgcolor: active 
                      ? alpha(theme.palette.primary.main, 0.15) 
                      : 'transparent',
                    color: active 
                      ? theme.palette.primary.light 
                      : alpha('#ffffff', 0.9),
                    '&:hover': {
                      bgcolor: active 
                        ? alpha(theme.palette.primary.main, 0.2) 
                        : alpha('#ffffff', 0.08),
                    },
                    transition: 'all 0.2s ease',
                    borderLeft: active 
                      ? `3px solid ${theme.palette.primary.main}` 
                      : '3px solid transparent',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: active 
                        ? theme.palette.primary.light 
                        : alpha('#ffffff', 0.7),
                      minWidth: 36,
                      '& svg': {
                        fontSize: '1.1rem',
                      },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.8125rem',
                      fontWeight: active ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Footer Links */}
        <Box sx={{ px: 2, py: 0.75 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 0.75 }}>
            {footerLinks.map((link) => (
              <Typography
                key={link.text}
                variant="caption"
                component="span"
                sx={{
                  color: alpha('#ffffff', 0.6),
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  '&:hover': {
                    color: theme.palette.primary.light,
                  },
                  transition: 'color 0.2s ease',
                }}
                onClick={() => handleNavigation(link.path)}
              >
                {link.text}
              </Typography>
            ))}
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: alpha('#ffffff', 0.5),
              fontSize: '0.65rem',
              display: 'block',
            }}
          >
            © 2024 <strong>Calamus Education</strong>
          </Typography>
        </Box>
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
            border: 'none',
            borderRight: `1px solid ${alpha('#ffffff', 0.1)}`,
            boxShadow: 'none',
            position: 'fixed',
            bgcolor: '#1a1a2e',
            // Hide scrollbar but keep scrolling functionality
            scrollbarWidth: 'none', // Firefox
            '&::-webkit-scrollbar': {
              display: 'none', // Chrome, Safari, Edge
            },
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
          border: 'none',
          borderRight: `1px solid ${alpha('#ffffff', 0.1)}`,
          boxShadow: '4px 0 32px rgba(0,0,0,0.3)',
          bgcolor: '#1a1a2e',
          // Hide scrollbar but keep scrolling functionality
          scrollbarWidth: 'none', // Firefox
          '&::-webkit-scrollbar': {
            display: 'none', // Chrome, Safari, Edge
          },
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
