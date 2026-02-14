import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Avatar,
  useTheme,
  alpha,
  Alert,
  Drawer,
  useMediaQuery,
  Fade,
  Stack,
  InputAdornment,
  Breadcrumbs,
  Link,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Block as BlockIcon,
  LockReset as LockResetIcon,
  DeleteForever as DeleteIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  PersonRemove as PersonRemoveIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  PrivacyTip as PrivacyIcon,
  AccountCircle as AccountIcon,
  Visibility,
  VisibilityOff,
  Close as CloseIcon,
  Menu as MenuIcon,
  ChevronRight as ChevronRightIcon,
  InfoOutlined as InfoIcon,
  VerifiedUser as VerifiedIcon,
  Shield as ShieldIcon,
  Edit as EditIcon,
  Work as WorkIcon,
  School as EducationIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CameraAlt as CameraIcon,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, friendsAPI } from '../services/api';

const SETTINGS_SECTIONS = {
  account: {
    id: 'account',
    label: 'Account',
    icon: <AccountIcon />,
    description: 'Personal info and preferences',
  },
  security: {
    id: 'security',
    label: 'Security',
    icon: <SecurityIcon />,
    description: 'Password management',
  },
  privacy: {
    id: 'privacy',
    label: 'Privacy',
    icon: <PrivacyIcon />,
    description: 'Blocked users and visibility',
  },
  accountManagement: {
    id: 'accountManagement',
    label: 'Account Management',
    icon: <SettingsIcon />,
    description: 'Delete account and sign out',
  },
};

const Settings = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { logout, user: authUser, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState('account');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/settings' }, replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Profile data state
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Dialog states
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
  const [editProfileDialogOpen, setEditProfileDialogOpen] = useState(false);
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  
  // Edit Profile form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    bio: '',
    work: '',
    education: '',
    region: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  
  const profileInputRef = useRef(null);

  // Blocked users state
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  const [unblockingId, setUnblockingId] = useState(null);
  
  // Notification state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchProfile = useCallback(async () => {
    if (!authUser?.phone) return;
    try {
      setLoadingProfile(true);
      const response = await userAPI.getProfile(authUser.phone, 1, authUser.phone);
      if (response.success && response.data) {
        setProfileData(response.data.user);
        setEditFormData({
          name: response.data.user.name || '',
          bio: response.data.user.bio || '',
          work: response.data.user.work || '',
          education: response.data.user.education || '',
          region: response.data.user.region || '',
        });
        setProfileImagePreview(response.data.user.image || '');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  }, [authUser?.phone]);

  const fetchBlockedUsers = useCallback(async () => {
    try {
      setLoadingBlocked(true);
      const response = await friendsAPI.getBlocked();
      if (response.success) {
        setBlockedUsers(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch blocked users:', error);
    } finally {
      setLoadingBlocked(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === 'account' && !profileData) {
      fetchProfile();
    } else if (activeSection === 'privacy') {
      fetchBlockedUsers();
    }
  }, [activeSection, profileData, fetchProfile, fetchBlockedUsers]);

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setSnackbar({ open: true, message: 'Passwords do not match', severity: 'error' });
      return;
    }

    try {
      setSavingProfile(true);
      const response = await userAPI.changePassword({ currentPassword, newPassword });
      if (response.success) {
        setSnackbar({ open: true, message: 'Password updated successfully', severity: 'success' });
        setResetPasswordDialogOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setSnackbar({ open: true, message: response.error || 'Failed to update password', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'An error occurred', severity: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      setSnackbar({ open: true, message: 'Please type DELETE to confirm', severity: 'error' });
      return;
    }

    if (!deletePassword) {
      setSnackbar({ open: true, message: 'Password is required', severity: 'error' });
      return;
    }

    try {
      setSavingProfile(true);
      const response = await userAPI.deleteAccount(deletePassword);
      if (response.success) {
        setSnackbar({ open: true, message: 'Account deleted successfully', severity: 'success' });
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      } else {
        setSnackbar({ open: true, message: response.error || 'Failed to delete account', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'An error occurred', severity: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const handleUnblockUser = async (userId) => {
    try {
      setUnblockingId(userId);
      const response = await friendsAPI.unblock(userId);
      if (response.success) {
        setSnackbar({ open: true, message: 'User unblocked', severity: 'success' });
        fetchBlockedUsers(); // Refresh list
      } else {
        setSnackbar({ open: true, message: response.error || 'Failed to unblock user', severity: 'error' });
      }
    } catch (error) {
      console.error('Failed to unblock user:', error);
      setSnackbar({ open: true, message: 'An error occurred', severity: 'error' });
    } finally {
      setUnblockingId(null);
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({ open: true, message: 'Profile image must be less than 5MB', severity: 'error' });
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProfileSave = async () => {
    if (!editFormData.name.trim()) {
      setSnackbar({ open: true, message: 'Name is required', severity: 'error' });
      return;
    }

    try {
      setSavingProfile(true);
      const response = await userAPI.updateProfile({
        ...editFormData,
        profileImage,
      });
      if (response.success) {
        setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
        setEditProfileDialogOpen(false);
        fetchProfile(); // Refresh data
      } else {
        setSnackbar({ open: true, message: response.error || 'Failed to update profile', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'An error occurred while updating profile', severity: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const renderSectionHeader = (title, description, icon) => (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 20 } })}
        </Box>
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
  );

  const renderAccountSection = () => (
    <Fade in={activeSection === 'account'} timeout={300}>
      <Box>
        {renderSectionHeader(
          'Account Settings',
          'Manage your personal information and how others see you on Calamus.',
          <AccountIcon />
        )}

        {loadingProfile ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <Stack spacing={3}>
            <Paper
            elevation={0}
            sx={{
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.01)',
            }}
            >
              <Box
                sx={{
                  p: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.01)} 100%)`,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={3}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={profileData?.image}
                      sx={{
                        width: 80,
                        height: 80,
                        border: `4px solid #fff`,
                        boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                      }}
                    >
                      {profileData?.name?.charAt(0) || 'U'}
                    </Avatar>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 24,
                        height: 24,
                        bgcolor: 'success.main',
                        borderRadius: '50%',
                        border: '3px solid #fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <VerifiedIcon sx={{ color: '#fff', fontSize: 14 }} />
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                      {profileData?.name || 'User'}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {authUser?.phone || 'No phone number'}
                      </Typography>
                      <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                      <Typography variant="caption" color="primary.main" fontWeight={600}>
                        Active Member
                      </Typography>
                    </Stack>
                    <Button
                      variant="contained"
                      size="small"
                      disableElevation
                      startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                      onClick={() => setEditProfileDialogOpen(true)}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 2,
                        fontWeight: 600,
                      }}
                    >
                      Edit Profile
                    </Button>
                  </Box>
                </Stack>
              </Box>
              <Divider />
              <Box sx={{ p: 0 }}>
                <List disablePadding>
                  <ListItem sx={{ py: 2, px: 3 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <InfoIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Bio" 
                      secondary={profileData?.bio || 'No bio added yet'} 
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary', fontWeight: 600 }}
                      secondaryTypographyProps={{ variant: 'body2', color: 'text.primary', sx: { mt: 0.5 } }}
                    />
                  </ListItem>
                  <Divider component="li" variant="inset" />
                  <ListItem sx={{ py: 2, px: 3 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <WorkIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Work" 
                      secondary={profileData?.work || 'Not specified'} 
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary', fontWeight: 600 }}
                      secondaryTypographyProps={{ variant: 'body2', color: 'text.primary', sx: { mt: 0.5 } }}
                    />
                  </ListItem>
                  <Divider component="li" variant="inset" />
                  <ListItem sx={{ py: 2, px: 3 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <EducationIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Education" 
                      secondary={profileData?.education || 'Not specified'} 
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary', fontWeight: 600 }}
                      secondaryTypographyProps={{ variant: 'body2', color: 'text.primary', sx: { mt: 0.5 } }}
                    />
                  </ListItem>
                  <Divider component="li" variant="inset" />
                  <ListItem sx={{ py: 2, px: 3 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <LocationIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Region" 
                      secondary={profileData?.region || 'Not specified'} 
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary', fontWeight: 600 }}
                      secondaryTypographyProps={{ variant: 'body2', color: 'text.primary', sx: { mt: 0.5 } }}
                    />
                  </ListItem>
                </List>
              </Box>
            </Paper>

            <Alert
              severity="info"
              icon={<ShieldIcon fontSize="small" />}
              sx={{
                borderRadius: 3,
                bgcolor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                '& .MuiAlert-message': { fontSize: '0.8125rem' },
              }}
            >
              Your account information is private and used only to personalize your experience on Calamus Education.
            </Alert>
          </Stack>
        )}
      </Box>
    </Fade>
  );

  const renderSecuritySection = () => (
    <Fade in={activeSection === 'security'} timeout={300}>
      <Box>
        {renderSectionHeader(
          'Security Settings',
          'Keep your account safe by updating your password regularly.',
          <SecurityIcon />
        )}

        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            borderRadius: 3,
            overflow: 'hidden',
            mb: 3,
            boxShadow: '0 1px 4px rgba(0,0,0,0.01)',
          }}
        >
          <List disablePadding>
            <ListItem
              sx={{
                p: 3,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2.5,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <LockResetIcon sx={{ color: theme.palette.warning.main, fontSize: 24 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Password
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 500 }}>
                  It's a good idea to use a strong password that you're not using elsewhere.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  disableElevation
                  onClick={() => setResetPasswordDialogOpen(true)}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                  }}
                >
                  Change Password
                </Button>
              </Box>
            </ListItem>
          </List>
        </Paper>
      </Box>
    </Fade>
  );

  const renderPrivacySection = () => (
    <Fade in={activeSection === 'privacy'} timeout={300}>
      <Box>
        {renderSectionHeader(
          'Privacy Settings',
          'Control who can see your activity and manage your blocked list.',
          <PrivacyIcon />
        )}

        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.01)',
          }}
        >
          <Box sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <BlockIcon sx={{ color: theme.palette.error.main, fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Blocked Users
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage the people you've previously blocked.
                </Typography>
              </Box>
            </Stack>

            {loadingBlocked ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : blockedUsers.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 6,
                  px: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  borderRadius: 3,
                  border: `1px dashed ${alpha(theme.palette.divider, 0.2)}`,
                }}
              >
                <PersonRemoveIcon
                  sx={{
                    fontSize: 56,
                    color: alpha(theme.palette.text.secondary, 0.3),
                    mb: 2,
                  }}
                />
                <Typography variant="body1" color="text.secondary" fontWeight={600} gutterBottom>
                  Your block list is empty
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, mx: 'auto' }}>
                  When you block someone, they will appear here and you can unblock them at any time.
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {blockedUsers.map((user, index) => (
                  <React.Fragment key={user.id || index}>
                    {index > 0 && <Divider sx={{ my: 1, opacity: 0.6 }} />}
                    <ListItem
                      sx={{
                        py: 1.5,
                        px: 1.5,
                        borderRadius: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      <Avatar
                        src={user.image}
                        sx={{
                          width: 48,
                          height: 48,
                          mr: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        }}
                      >
                        {user.name?.charAt(0) || '?'}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight={700}>
                            {user.name || 'Unknown User'}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {user.phone || user.id}
                          </Typography>
                        }
                      />
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        disabled={unblockingId === user.id}
                        onClick={() => handleUnblockUser(user.id)}
                        startIcon={unblockingId === user.id && <CircularProgress size={14} color="inherit" />}
                        sx={{
                          textTransform: 'none',
                          borderRadius: 1.5,
                          fontWeight: 600,
                          px: 2,
                        }}
                      >
                        {unblockingId === user.id ? 'Unblocking...' : 'Unblock'}
                      </Button>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        </Paper>
      </Box>
    </Fade>
  );

  const renderAccountManagementSection = () => (
    <Fade in={activeSection === 'accountManagement'} timeout={300}>
      <Box>
        {renderSectionHeader(
          'Account Management',
          'Manage your account status and session.',
          <SettingsIcon />
        )}

        <Stack spacing={2.5}>
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
              borderRadius: 3,
              overflow: 'hidden',
              bgcolor: alpha(theme.palette.error.main, 0.01),
              boxShadow: '0 1px 4px rgba(237, 42, 38, 0.01)',
            }}
          >
            <Box sx={{ p: 3 }}>
              <Stack direction="row" spacing={2.5}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <DeleteIcon sx={{ color: theme.palette.error.main, fontSize: 24 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700} color="error.main" gutterBottom>
                    Delete Account
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    Permanently delete your account and all associated data. This action is irreversible.
                  </Typography>
                  <Alert
                    severity="warning"
                    sx={{
                      mb: 3,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.warning.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                      '& .MuiAlert-message': { fontSize: '0.75rem' },
                    }}
                  >
                    Deleting your account will remove all your posts, comments, learning progress, and messages.
                  </Alert>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setDeleteAccountDialogOpen(true)}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 3,
                      fontWeight: 600,
                      borderWidth: 1.5,
                      '&:hover': { borderWidth: 1.5 },
                    }}
                  >
                    Delete My Account
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.01)',
            }}
          >
            <Box sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2.5}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <LogoutIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Sign Out
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Sign out of your current session on this device.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<LogoutIcon />}
                    onClick={() => setSignOutDialogOpen(true)}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 3,
                      fontWeight: 600,
                      borderColor: alpha(theme.palette.text.secondary, 0.2),
                      '&:hover': {
                        borderColor: alpha(theme.palette.text.secondary, 0.4),
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    Sign Out
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Fade>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'account':
        return renderAccountSection();
      case 'security':
        return renderSecuritySection();
      case 'privacy':
        return renderPrivacySection();
      case 'accountManagement':
        return renderAccountManagementSection();
      default:
        return renderAccountSection();
    }
  };

  const sidebarContent = (
    <Box sx={{ width: { xs: 280, sm: 300 }, height: '100%' }}>
      <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {isMobile && (
            <IconButton
              onClick={() => setMobileDrawerOpen(false)}
              size="small"
              sx={{ mr: -0.5 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
          <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
            Settings
          </Typography>
        </Stack>
      </Box>
      <List disablePadding sx={{ py: 1.5 }}>
        {Object.values(SETTINGS_SECTIONS).map((section) => {
          const isActive = activeSection === section.id;
          return (
            <ListItem key={section.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => handleSectionChange(section.id)}
                sx={{
                  mx: 1.5,
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '20%',
                      bottom: '20%',
                      width: 4,
                      borderRadius: '0 4px 4px 0',
                      bgcolor: theme.palette.primary.main,
                    },
                  },
                  '&:hover:not(.Mui-selected)': {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? theme.palette.primary.main : 'text.secondary',
                    transition: 'all 0.2s ease',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {React.cloneElement(section.icon, { sx: { fontSize: 22 } })}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      fontWeight={isActive ? 700 : 500}
                      color={isActive ? 'primary.main' : 'text.primary'}
                    >
                      {section.label}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      sx={{
                        display: { xs: 'none', sm: 'block' },
                        color: isActive ? alpha(theme.palette.primary.main, 0.7) : 'text.secondary',
                        fontSize: '0.7rem',
                        mt: 0.25,
                      }}
                    >
                      {section.description}
                    </Typography>
                  }
                />
                {isActive && (
                  <ChevronRightIcon
                    sx={{
                      fontSize: 18,
                      color: theme.palette.primary.main,
                      ml: 1,
                      opacity: 0.8,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          sx={{ mb: 3 }}
          separator={<ChevronRightIcon sx={{ fontSize: 14, opacity: 0.5 }} />}
        >
          <Link
            component={RouterLink}
            to="/"
            underline="hover"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
              fontSize: '0.8125rem',
              fontWeight: 500,
              '&:hover': { color: 'primary.main' },
            }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Home
          </Link>
          <Typography
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.primary',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            <SettingsIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Settings
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            spacing={2}
          >
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-1px', mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                Settings
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8 }}>
                Manage your account preferences and security.
              </Typography>
            </Box>
            {isMobile && (
              <Button
                variant="outlined"
                startIcon={<MenuIcon />}
                onClick={() => setMobileDrawerOpen(true)}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  borderColor: alpha(theme.palette.divider, 0.2),
                  color: 'text.primary',
                  fontWeight: 600,
                }}
              >
                Menu
              </Button>
            )}
          </Stack>
        </Box>

        {/* Desktop Layout */}
        {!isMobile ? (
          <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
            {/* Sidebar */}
            <Paper
              elevation={0}
              sx={{
                width: 300,
                flexShrink: 0,
                border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                borderRadius: 4,
                overflow: 'hidden',
                height: 'auto',
                position: 'sticky',
                top: 100,
                boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
              }}
            >
              {sidebarContent}
            </Paper>

            {/* Content Area */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {renderContent()}
            </Box>
          </Box>
        ) : (
          /* Mobile Layout */
          <>
            {renderContent()}
            <Drawer
              anchor="left"
              open={mobileDrawerOpen}
              onClose={() => setMobileDrawerOpen(false)}
              PaperProps={{
                sx: {
                  width: 280,
                  border: 'none',
                  borderRadius: '0 20px 20px 0',
                },
              }}
            >
              {sidebarContent}
            </Drawer>
          </>
        )}

        {/* Edit Profile Dialog */}
        <Dialog
          open={editProfileDialogOpen}
          onClose={() => !savingProfile && setEditProfileDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 4, p: 1 },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EditIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                Edit Profile Information
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 3, fontSize: '0.875rem' }}>
              Update your personal details. This information will be visible on your public profile.
            </DialogContentText>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={profileImagePreview}
                  sx={{
                    width: 100,
                    height: 100,
                    border: '4px solid',
                    borderColor: 'background.paper',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                  }}
                >
                  {editFormData.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleProfileImageChange}
                />
                <IconButton
                  onClick={() => profileInputRef.current?.click()}
                  disabled={savingProfile}
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 32,
                    height: 32,
                    border: '3px solid #fff',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  <CameraIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>

            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Full Name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                variant="filled"
                required
                error={!editFormData.name.trim()}
                InputProps={{ disableUnderline: true, sx: { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                label="Bio"
                value={editFormData.bio}
                onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                variant="filled"
                multiline
                rows={3}
                InputProps={{ disableUnderline: true, sx: { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                label="Work"
                value={editFormData.work}
                onChange={(e) => setEditFormData({ ...editFormData, work: e.target.value })}
                variant="filled"
                InputProps={{ 
                  disableUnderline: true, 
                  sx: { borderRadius: 2 },
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon fontSize="small" sx={{ color: 'text.disabled', mr: 1 }} />
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                fullWidth
                label="Education"
                value={editFormData.education}
                onChange={(e) => setEditFormData({ ...editFormData, education: e.target.value })}
                variant="filled"
                InputProps={{ 
                  disableUnderline: true, 
                  sx: { borderRadius: 2 },
                  startAdornment: (
                    <InputAdornment position="start">
                      <EducationIcon fontSize="small" sx={{ color: 'text.disabled', mr: 1 }} />
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                fullWidth
                label="Region"
                value={editFormData.region}
                onChange={(e) => setEditFormData({ ...editFormData, region: e.target.value })}
                variant="filled"
                InputProps={{ 
                  disableUnderline: true, 
                  sx: { borderRadius: 2 },
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon fontSize="small" sx={{ color: 'text.disabled', mr: 1 }} />
                    </InputAdornment>
                  )
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
            <Button
              onClick={() => setEditProfileDialogOpen(false)}
              disabled={savingProfile}
              sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditProfileSave}
              variant="contained"
              disableElevation
              disabled={savingProfile || !editFormData.name.trim()}
              startIcon={savingProfile && <CircularProgress size={16} color="inherit" />}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3 }}
            >
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog
          open={resetPasswordDialogOpen}
          onClose={() => setResetPasswordDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 4, p: 1 },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LockResetIcon sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                Change Password
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 3, fontSize: '0.875rem' }}>
              Enter your current password and choose a new one.
            </DialogContentText>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Current Password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                variant="filled"
                InputProps={{
                  disableUnderline: true,
                  sx: { borderRadius: 2 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                        size="small"
                      >
                        {showCurrentPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                variant="filled"
                InputProps={{
                  disableUnderline: true,
                  sx: { borderRadius: 2 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                        size="small"
                      >
                        {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={confirmPassword !== '' && newPassword !== confirmPassword}
                helperText={
                  confirmPassword !== '' && newPassword !== confirmPassword
                    ? 'Passwords do not match'
                    : ''
                }
                variant="filled"
                InputProps={{
                  disableUnderline: true,
                  sx: { borderRadius: 2 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
            <Button
              onClick={() => setResetPasswordDialogOpen(false)}
              sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              variant="contained"
              disableElevation
              disabled={savingProfile || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              startIcon={savingProfile && <CircularProgress size={16} color="inherit" />}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3 }}
            >
              {savingProfile ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog
          open={deleteAccountDialogOpen}
          onClose={() => setDeleteAccountDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 4, p: 1 },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DeleteIcon sx={{ color: theme.palette.error.main, fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight={700} color="error.main">
                Delete Account
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2, fontSize: '0.875rem' }}>
              Are you absolutely sure? This action cannot be undone and you will lose all your data.
            </DialogContentText>
            <Stack spacing={2}>
              <TextField
                fullWidth
                placeholder='Type "DELETE" to confirm'
                variant="filled"
                size="small"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  sx: { borderRadius: 2 },
                }}
              />
              <TextField
                fullWidth
                label="Your Password"
                type={showDeletePassword ? 'text' : 'password'}
                variant="filled"
                size="small"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  sx: { borderRadius: 2 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowDeletePassword(!showDeletePassword)}
                        edge="end"
                        size="small"
                      >
                        {showDeletePassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
            <Button
              onClick={() => {
                setDeleteAccountDialogOpen(false);
                setDeleteConfirmationText('');
                setDeletePassword('');
              }}
              sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              variant="contained"
              color="error"
              disableElevation
              disabled={savingProfile || deleteConfirmationText !== 'DELETE' || !deletePassword}
              startIcon={savingProfile && <CircularProgress size={16} color="inherit" />}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3 }}
            >
              {savingProfile ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Sign Out Dialog */}
        <Dialog
          open={signOutDialogOpen}
          onClose={() => setSignOutDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 4, p: 1 },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LogoutIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                Sign Out
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontSize: '0.875rem' }}>
              Are you sure you want to sign out of your account?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 2.5, pb: 2 }}>
            <Button
              onClick={() => setSignOutDialogOpen(false)}
              sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSignOut}
              variant="contained"
              color="primary"
              disableElevation
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3 }}
            >
              Sign Out
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity} 
            variant="filled"
            sx={{ width: '100%', borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Settings;
