import React, { useState, useRef, useEffect } from 'react';
import {
  Paper,
  Stack,
  Avatar,
  TextField,
  IconButton,
  Button,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  alpha,
  useTheme,
  Chip,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Fade,
} from '@mui/material';
import {
  Image as ImageIcon,
  Close as CloseIcon,
  Language as LanguageIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { discussionAPI, languagesAPI } from '../../services/api';

const CreatePost = ({ defaultLanguage, onPostCreated, variant = 'inline' }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage || '');
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);
  const fileInputRef = useRef(null);
  const languageButtonRef = useRef(null);

  // Fetch languages on mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLoadingLanguages(true);
        const response = await languagesAPI.getAll();
        if (response.success && response.data) {
          setLanguages(response.data);
          // Set default language if provided
          if (defaultLanguage) {
            // Try to find matching language by code or name
            const matchedLang = response.data.find(
              (lang) =>
                lang.code?.toLowerCase() === defaultLanguage.toLowerCase() ||
                lang.name?.toLowerCase() === defaultLanguage.toLowerCase() ||
                lang.displayName?.toLowerCase() === defaultLanguage.toLowerCase()
            );
            if (matchedLang && matchedLang.code) {
              setSelectedLanguage(matchedLang.code);
            } else if (response.data.length > 0) {
              // Fallback to first language
              setSelectedLanguage(response.data[0].code || '');
            }
          } else if (response.data.length > 0) {
            // No default provided, use first language
            setSelectedLanguage(response.data[0].code || '');
          }
        }
      } catch (err) {
        console.error('Failed to fetch languages:', err);
      } finally {
        setLoadingLanguages(false);
      }
    };

    fetchLanguages();
  }, [defaultLanguage]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLanguageClick = (event) => {
    setLanguageAnchorEl(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLanguageAnchorEl(null);
  };

  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode);
    handleLanguageClose();
  };

  const getSelectedLanguageName = () => {
    const lang = languages.find((l) => l.code === selectedLanguage);
    return lang?.displayName || lang?.name || 'Select Language';
  };

  const isLanguageMenuOpen = Boolean(languageAnchorEl);

  const handleSubmit = async () => {
    if (!text.trim() && !image) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!selectedLanguage) {
      setError('Please select a language');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await discussionAPI.createPost({
        body: text.trim(),
        category: selectedLanguage, // This will be stored in major column
        image: image || '',
      });

      if (res.success && res.data?.post) {
        setText('');
        handleRemoveImage();
        if (onPostCreated) onPostCreated(res.data.post);
      } else {
        setError(res.error || 'Failed to create post');
      }
    } catch (err) {
      if (err.message === 'Not authenticated') {
        navigate('/login');
        return;
      }
      console.error('Create post error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isDialog = variant === 'dialog';

  if (!isAuthenticated) {
    return (
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: { xs: 0, sm: 2 },
          boxShadow: { xs: 'none', sm: '0 2px 12px rgba(0,0,0,0.06)' },
          p: 2.5,
          mb: 2,
          cursor: 'pointer',
          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
        }}
        onClick={() => navigate('/login')}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 40, height: 40, bgcolor: 'grey.200' }} />
          <Typography variant="body2" color="text.secondary">
            Log in to share what's on your mind...
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: isDialog ? 0 : { xs: 0, sm: 2 },
        border: 'none',
        boxShadow: isDialog ? 'none' : { xs: 'none', sm: '0 2px 12px rgba(0,0,0,0.06)' },
        p: isDialog ? 0 : 2,
        mb: isDialog ? 0 : 2,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Avatar
          src={user?.image || user?.learner_image || ''}
          sx={{ width: 40, height: 40 }}
        >
          {user?.name?.[0] || user?.learner_name?.[0] || 'U'}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Language Selection - Modern Chip Design */}
          {loadingLanguages ? (
            <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">
                Loading languages...
              </Typography>
            </Box>
          ) : languages.length > 0 ? (
            <Box sx={{ mb: 1.5 }}>
              <Chip
                ref={languageButtonRef}
                icon={<LanguageIcon sx={{ fontSize: 16, color: 'inherit' }} />}
                label={getSelectedLanguageName()}
                onClick={handleLanguageClick}
                disabled={submitting}
                sx={{
                  height: 32,
                  borderRadius: 2,
                  bgcolor: selectedLanguage
                    ? alpha(theme.palette.primary.main, 0.1)
                    : 'grey.100',
                  color: selectedLanguage
                    ? theme.palette.primary.main
                    : 'text.secondary',
                  border: selectedLanguage
                    ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                    : '1px solid',
                  borderColor: selectedLanguage
                    ? alpha(theme.palette.primary.main, 0.3)
                    : 'divider',
                  fontWeight: selectedLanguage ? 600 : 400,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: selectedLanguage
                      ? alpha(theme.palette.primary.main, 0.15)
                      : 'grey.200',
                    borderColor: selectedLanguage
                      ? theme.palette.primary.main
                      : 'text.secondary',
                    transform: 'translateY(-1px)',
                    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '& .MuiChip-icon': {
                    marginLeft: 1,
                  },
                }}
              />
              <Popover
                open={isLanguageMenuOpen}
                anchorEl={languageAnchorEl}
                onClose={handleLanguageClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 200 }}
                PaperProps={{
                  sx: {
                    mt: 0.5,
                    minWidth: 280,
                    maxWidth: 320,
                    maxHeight: 400,
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                  },
                }}
              >
                <List
                  sx={{
                    py: 0.5,
                    maxHeight: 300,
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      bgcolor: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      bgcolor: 'grey.300',
                      borderRadius: '4px',
                      '&:hover': {
                        bgcolor: 'grey.400',
                      },
                    },
                  }}
                >
                  {languages.length === 0 ? (
                    <ListItem>
                      <ListItemText
                        primary="No languages available"
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: 'text.secondary',
                          sx: { textAlign: 'center', py: 2 },
                        }}
                      />
                    </ListItem>
                  ) : (
                    languages.map((lang) => {
                      const isSelected = lang.code === selectedLanguage;
                      return (
                        <ListItem key={lang.id} disablePadding>
                          <ListItemButton
                            onClick={() => handleLanguageSelect(lang.code)}
                            selected={isSelected}
                            sx={{
                              py: 1,
                              px: 2,
                              borderRadius: 1,
                              mx: 0.5,
                              my: 0.25,
                              minHeight: 44,
                              '&.Mui-selected': {
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                                },
                                '& .MuiListItemText-primary': {
                                  color: theme.palette.primary.main,
                                  fontWeight: 600,
                                },
                              },
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                              },
                            }}
                          >
                            <ListItemText
                              primary={lang.displayName || lang.name}
                              secondary={lang.code && lang.code !== lang.name ? lang.code.toUpperCase() : null}
                              primaryTypographyProps={{
                                variant: 'body2',
                                fontWeight: isSelected ? 600 : 400,
                                sx: {
                                  color: isSelected ? theme.palette.primary.main : 'text.primary',
                                },
                              }}
                              secondaryTypographyProps={{
                                variant: 'caption',
                                sx: {
                                  color: isSelected
                                    ? alpha(theme.palette.primary.main, 0.7)
                                    : 'text.secondary',
                                },
                              }}
                            />
                            {isSelected && (
                              <CheckIcon
                                sx={{
                                  fontSize: 20,
                                  color: theme.palette.primary.main,
                                  ml: 1,
                                }}
                              />
                            )}
                          </ListItemButton>
                        </ListItem>
                      );
                    })
                  )}
                </List>
              </Popover>
            </Box>
          ) : null}

          <TextField
            fullWidth
            multiline
            minRows={isDialog ? 4 : 2}
            maxRows={8}
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: '0.95rem',
              },
            }}
          />

          {/* Image Preview */}
          {imagePreview && (
            <Box sx={{ position: 'relative', mt: 1.5, mb: 1 }}>
              <Box
                component="img"
                src={imagePreview}
                alt="Preview"
                sx={{
                  width: '100%',
                  maxHeight: 300,
                  objectFit: 'cover',
                  borderRadius: 2,
                  display: 'block',
                }}
              />
              <IconButton
                size="small"
                onClick={handleRemoveImage}
                sx={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                  width: 28,
                  height: 28,
                }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          )}

          {/* Error */}
          {error && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5, mb: 0.5 }}>
              {error}
            </Typography>
          )}

          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={0.5}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageSelect}
              />
              <IconButton
                size="small"
                color="primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting}
              >
                <ImageIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Button
              variant="contained"
              size="small"
              disabled={(!text.trim() && !image) || submitting || !selectedLanguage}
              onClick={handleSubmit}
              sx={{
                borderRadius: 5,
                px: 3,
                textTransform: 'none',
              }}
            >
              {submitting ? <CircularProgress size={18} color="inherit" /> : 'Post'}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default CreatePost;
