import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Avatar,
  IconButton,
  Typography,
  Stack,
  CircularProgress,
  Paper,
  Container,
  alpha,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CameraAlt as CameraIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

const EditProfile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    work: '',
    education: '',
    region: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [coverImagePreview, setCoverImagePreview] = useState('');
  
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/profile/edit' }, replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Fetch current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!authUser?.phone) return;

      try {
        setLoading(true);
        const response = await userAPI.getProfile(authUser.phone, 1, authUser.phone);
        const userData = response.data.user;
        
        setFormData({
          name: userData.name || '',
          bio: userData.bio || '',
          work: userData.work || '',
          education: userData.education || '',
          region: userData.region || '',
        });
        setProfileImagePreview(userData.image || '');
        setCoverImagePreview(userData.coverImage || '');
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && authUser?.phone) {
      fetchProfile();
    }
  }, [isAuthenticated, authUser, navigate]);

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Profile image must be less than 5MB');
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

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Cover image must be less than 5MB');
        return;
      }
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }

    setSaving(true);
    try {
      await userAPI.updateProfile({
        ...formData,
        profileImage,
        coverImage,
      });
      // Navigate back to profile page
      navigate('/profile');
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="md" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handleCancel} disabled={saving}>
            <BackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={700}>
            Edit Profile
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          }}
        >
          {/* Cover Image */}
          <Box
            sx={{
              position: 'relative',
              height: 200,
              background: coverImagePreview
                ? `url(${coverImagePreview}) center/cover no-repeat`
                : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 60%)`,
            }}
          >
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleCoverImageChange}
            />
            <IconButton
              onClick={() => coverInputRef.current?.click()}
              disabled={saving}
              sx={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
              }}
            >
              <CameraIcon />
            </IconButton>
          </Box>

          {/* Profile Image */}
          <Box sx={{ px: 3, mt: -8, mb: 2, display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={profileImagePreview}
                sx={{
                  width: 120,
                  height: 120,
                  border: '4px solid',
                  borderColor: 'background.paper',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
                  fontSize: '3rem',
                }}
              >
                {formData.name?.charAt(0)?.toUpperCase()}
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
                disabled={saving}
                sx={{
                  position: 'absolute',
                  bottom: 4,
                  right: 4,
                  bgcolor: 'primary.main',
                  color: 'white',
                  width: 36,
                  height: 36,
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                <CameraIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Form Fields */}
          <Box sx={{ px: 3, pb: 3 }}>
            <Stack spacing={2.5}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                fullWidth
                required
                disabled={saving}
                error={!formData.name.trim()}
                helperText={!formData.name.trim() ? 'Name is required' : ''}
              />

              <TextField
                label="Bio"
                value={formData.bio}
                onChange={handleInputChange('bio')}
                fullWidth
                multiline
                rows={3}
                disabled={saving}
                placeholder="Tell us about yourself..."
                inputProps={{ maxLength: 1000 }}
                helperText={`${formData.bio.length}/1000 characters`}
              />

              <TextField
                label="Work"
                value={formData.work}
                onChange={handleInputChange('work')}
                fullWidth
                disabled={saving}
                placeholder="e.g., Software Engineer"
                inputProps={{ maxLength: 100 }}
              />

              <TextField
                label="Education"
                value={formData.education}
                onChange={handleInputChange('education')}
                fullWidth
                disabled={saving}
                placeholder="e.g., University of Technology"
                inputProps={{ maxLength: 100 }}
              />

              <TextField
                label="Region"
                value={formData.region}
                onChange={handleInputChange('region')}
                fullWidth
                disabled={saving}
                placeholder="e.g., Yangon, Myanmar"
                inputProps={{ maxLength: 100 }}
              />
            </Stack>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ px: 3, pb: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              onClick={handleCancel}
              disabled={saving}
              sx={{ textTransform: 'none', minWidth: 100 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={saving || !formData.name.trim()}
              sx={{ textTransform: 'none', minWidth: 100 }}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <EditIcon />}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default EditProfile;
