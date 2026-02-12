import React, { useState, useEffect } from 'react';
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
  useTheme,
  alpha,
  Badge,
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
  Chat as ChatIcon,
  Support as SupportIcon,
  LocalLibrary as LocalLibraryIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSupportChat } from '../../context/SupportChatContext';
import { chatAPI } from '../../services/api';

const drawerWidth = 280;

const mainMenuItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/' },
  { text: 'Explore', icon: <SearchIcon />, path: '/explore' },
  { text: 'Vocab Learning', icon: <MenuBookIcon />, path: '/vocab-learning' },
  { text: 'My Learning', icon: <ShowChartIcon />, path: '/my-learning' },
  { text: 'Chat', icon: <ChatIcon />, path: '/chat' },
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
    major: 'english',
  },
  {
    text: 'Easy Korean',
    icon: '/icons/easykorean_icon.png',
    path: '/admin-team/korea',
    major: 'korea',
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
  const { openChat } = useSupportChat();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [supportUnreadCounts, setSupportUnreadCounts] = useState({ english: 0, korea: 0 });
  
  // Sidebar constant colors (Always Dark)
  const sidebarBg = '#1a1a2e';
  const sidebarText = '#ffffff';
  const sidebarTextSecondary = alpha('#ffffff', 0.7);
  const sidebarActiveBg = alpha(theme.palette.primary.main, 0.15);
  const sidebarHoverBg = alpha('#ffffff', 0.08);

  // Initialize all menus as expanded by default
  const [expandedMenus, setExpandedMenus] = useState(() => {
    const initial = {};
    subMenuItems.forEach((item) => {
      initial[item.text] = true;
    });
    initial['Support'] = true;
    return initial;
  });

  const handleToggleMenu = (menuText) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuText]: !prev[menuText],
    }));
  };

  const handleNavigation = (path) => {
    if (path === '/logout') {
      navigate('/');
      return;
    }
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const handleSupportChat = (major) => {
    if (!isAuthenticated || !user?.phone) {
      navigate('/login');
      return;
    }
    openChat(major);
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

  useEffect(() => {
    if (!isAuthenticated || !user?.phone) {
      setUnreadMessageCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const userId = Number(user.phone);
        const result = await chatAPI.getConversations(userId, 'english');
        if (result && result.data && Array.isArray(result.data)) {
          const totalUnread = result.data.reduce((sum, conv) => {
            const friendPhone = conv.friend?.phone;
            const friendPhoneNum = Number(friendPhone);
            if (friendPhoneNum === 10000) return sum; 
            return sum + (Number(conv.unread_count) || 0);
          }, 0);
          setUnreadMessageCount(totalUnread);
        }
      } catch (err) {
        console.error('Failed to fetch unread message count:', err);
        setUnreadMessageCount(0);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.phone]);

  useEffect(() => {
    if (!isAuthenticated || !user?.phone) {
      setSupportUnreadCounts({ english: 0, korea: 0 });
      return;
    }

    const fetchSupportUnreadCounts = async () => {
      try {
        const userId = Number(user.phone);
        const majors = ['english', 'korea'];
        const counts = { english: 0, korea: 0 };

        for (const major of majors) {
          try {
            const result = await chatAPI.getConversations(userId, major);
            if (result && result.data && Array.isArray(result.data)) {
              const supportConv = result.data.find((conv) => {
                const friendPhone = conv.friend?.phone;
                const friendPhoneNum = Number(friendPhone);
                return friendPhoneNum === 10000;
              });
              if (supportConv) {
                counts[major] = Number(supportConv.unread_count) || 0;
              } else {
                counts[major] = 0;
              }
            }
          } catch (err) {
            console.error(`Failed to fetch unread count for ${major}:`, err);
            counts[major] = 0;
          }
        }
        setSupportUnreadCounts(counts);
      } catch (err) {
        console.error('Failed to fetch support unread counts:', err);
        setSupportUnreadCounts({ english: 0, korea: 0 });
      }
    };

    fetchSupportUnreadCounts();
    const interval = setInterval(fetchSupportUnreadCounts, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.phone]);

  const drawer = (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        bgcolor: sidebarBg,
        color: sidebarText,
      }}
    >
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

      <Box 
        sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          overflowX: 'hidden', 
          py: 0.25,
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
        <List sx={{ px: 1, py: 0 }}>
          {mainMenuItems.map((item) => {
            const active = isActive(item.path);
            const isChatItem = item.path === '/chat';
            const showBadge = isChatItem && unreadMessageCount > 0;
            
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 1,
                    py: 0.75,
                    px: 1.5,
                    minHeight: 36,
                    bgcolor: active ? sidebarActiveBg : 'transparent',
                    color: active ? theme.palette.primary.light : sidebarText,
                    '&:hover': {
                      bgcolor: active 
                        ? alpha(theme.palette.primary.main, 0.2) 
                        : sidebarHoverBg,
                    },
                    transition: 'all 0.2s ease',
                    borderLeft: active ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: active ? theme.palette.primary.light : sidebarTextSecondary,
                      minWidth: 36,
                      '& svg': {
                        fontSize: '1.1rem',
                      },
                    }}
                  >
                    {showBadge ? (
                      <Badge 
                        badgeContent={unreadMessageCount} 
                        color="secondary" 
                        max={99}
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            minWidth: 18,
                            height: 18,
                            right: -4,
                            top: -4,
                          },
                        }}
                      >
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
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

        <Box sx={{ px: 2, py: 0.75 }}>
          <Typography
            variant="caption"
            sx={{
              color: sidebarTextSecondary,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.65rem',
            }}
          >
            Learning Resources
          </Typography>
        </Box>

        <List sx={{ px: 1, py: 0 }}>
          <ListItem disablePadding sx={{ mb: 0.25 }}>
            <ListItemButton
              onClick={() => handleNavigation('/mini-library')}
              sx={{
                borderRadius: 1,
                py: 0.75,
                px: 1.5,
                minHeight: 36,
                bgcolor: isActive('/mini-library') ? sidebarActiveBg : 'transparent',
                color: sidebarText,
                '&:hover': {
                  bgcolor: sidebarHoverBg,
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive('/mini-library') ? theme.palette.primary.light : sidebarTextSecondary,
                  minWidth: 36,
                  '& svg': { fontSize: '1.1rem' },
                }}
              >
                <LocalLibraryIcon />
              </ListItemIcon>
              <ListItemText
                primary="Mini Library"
                primaryTypographyProps={{
                  fontSize: '0.8125rem',
                  fontWeight: isActive('/mini-library') ? 600 : 500,
                }}
              />
            </ListItemButton>
          </ListItem>
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
                      color: sidebarText,
                      '&:hover': {
                        bgcolor: sidebarHoverBg,
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: hasActiveChild 
                          ? theme.palette.primary.light 
                          : sidebarTextSecondary,
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
                            bgcolor: active ? sidebarActiveBg : 'transparent',
                            color: active ? theme.palette.primary.light : alpha('#ffffff', 0.8),
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

        <Box sx={{ px: 2, py: 0.75, mt: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: sidebarTextSecondary,
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
          <React.Fragment>
            <ListItem disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton
                onClick={() => handleToggleMenu('Support')}
                sx={{
                  borderRadius: 1,
                  py: 0.75,
                  px: 1.5,
                  minHeight: 36,
                  bgcolor: expandedMenus['Support']
                    ? alpha(theme.palette.primary.main, 0.1)
                    : 'transparent',
                  color: sidebarText,
                  '&:hover': {
                    bgcolor: sidebarHoverBg,
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: sidebarTextSecondary,
                    minWidth: 36,
                    '& svg': {
                      fontSize: '1.1rem',
                    },
                  }}
                >
                  {(() => {
                    const totalSupportUnread = (supportUnreadCounts.english || 0) + (supportUnreadCounts.korea || 0);
                    const showBadge = totalSupportUnread > 0;
                    
                    return showBadge ? (
                      <Badge
                        badgeContent={totalSupportUnread}
                        color="secondary"
                        max={99}
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            minWidth: 18,
                            height: 18,
                            right: -4,
                            top: -4,
                          },
                        }}
                      >
                        <SupportIcon />
                      </Badge>
                    ) : (
                      <SupportIcon />
                    );
                  })()}
                </ListItemIcon>
                <ListItemText
                  primary="Support"
                  primaryTypographyProps={{
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                  }}
                />
                <ChevronRightIcon
                  sx={{
                    fontSize: 16,
                    color: alpha('#ffffff', 0.5),
                    transform: expandedMenus['Support'] ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </ListItemButton>
            </ListItem>
            <Collapse in={expandedMenus['Support']} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ pl: 0.5 }}>
                {adminTeamItems.map((item) => {
                  const unreadCount = supportUnreadCounts[item.major] || 0;
                  const showBadge = unreadCount > 0;
                  
                  return (
                    <ListItemButton
                      key={item.text}
                      onClick={() => handleSupportChat(item.major)}
                      sx={{
                        borderRadius: 1,
                        py: 0.5,
                        px: 1.5,
                        pl: 4,
                        minHeight: 32,
                        bgcolor: 'transparent',
                        color: alpha('#ffffff', 0.8),
                        '&:hover': {
                          bgcolor: alpha('#ffffff', 0.06),
                        },
                        transition: 'all 0.2s ease',
                        borderLeft: '3px solid transparent',
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {showBadge ? (
                          <Badge
                            badgeContent={unreadCount}
                            color="secondary"
                            max={99}
                            sx={{
                              '& .MuiBadge-badge': {
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                minWidth: 18,
                                height: 18,
                                right: -4,
                                top: -4,
                              },
                            }}
                          >
                            <Avatar
                              src={item.icon}
                              alt={item.text}
                              sx={{
                                width: 24,
                                height: 24,
                                bgcolor: alpha('#ffffff', 0.1),
                              }}
                            />
                          </Badge>
                        ) : (
                          <Avatar
                            src={item.icon}
                            alt={item.text}
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: alpha('#ffffff', 0.1),
                            }}
                          />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: '0.75rem',
                          fontWeight: 400,
                        }}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Collapse>
          </React.Fragment>
        </List>

        <Box
          sx={{
            borderTop: `1px solid ${alpha('#ffffff', 0.1)}`,
            py: 0.25,
            mt: 1,
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
                      bgcolor: active ? sidebarActiveBg : 'transparent',
                      color: active ? theme.palette.primary.light : sidebarText,
                      '&:hover': {
                        bgcolor: active 
                          ? alpha(theme.palette.primary.main, 0.2) 
                          : sidebarHoverBg,
                      },
                      transition: 'all 0.2s ease',
                      borderLeft: active 
                        ? `3px solid ${theme.palette.primary.main}` 
                        : '3px solid transparent',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: active ? theme.palette.primary.light : sidebarTextSecondary,
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

          <Box sx={{ px: 2, py: 0.75 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 0.75 }}>
              {footerLinks.map((link) => (
                <Typography
                  key={link.text}
                  variant="caption"
                  component="span"
                  sx={{
                    color: sidebarTextSecondary,
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
    </Box>
  );

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
            top: { xs: '56px', sm: '60px' },
            height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 60px)' },
            bgcolor: sidebarBg,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
          },
        }}
      >
        {drawer}
      </Drawer>
    );
  }

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
          bgcolor: sidebarBg,
          top: { xs: '56px', sm: '60px' },
          height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 60px)' },
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      }}
      ModalProps={{
        keepMounted: true, 
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;
export { drawerWidth };
