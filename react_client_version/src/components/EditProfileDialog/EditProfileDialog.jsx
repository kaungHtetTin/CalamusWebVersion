import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Avatar,
  IconButton,
  Typography,
  Stack,
  CircularProgress,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  CameraAlt as CameraIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

const EditProfileDialog = ({ open, onClose, profileUser, onSave }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profileUser?.name || '',
    bio: profileUser?.bio || '',
    work: profileUser?.work || '',
    education: profileUser?.education || '',
    region: profileUser?.region || '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(profileUser?.image || '');
  const [coverImagePreview, setCoverImagePreview] = useState(profileUser?.coverImage || '');
  
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Update form data when profileUser changes
  React.useEffect(() => {
    if (profileUser) {
      setFormData({
        name: profileUser.name || '',
        bio: profileUser.bio || '',
        work: profileUser.work || '',
        education: profileUser.education || '',
        region: profileUser.region || '',
      });
      setProfileImagePreview(profileUser.image || '');
      setCoverImagePreview(profileUser.coverImage || '');
      setProfileImage(null);
      setCoverImage(null);
    }
  }, [profileUser]);

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

    setLoading(true);
    try {
      await onSave({
        ...formData,
        profileImage,
        coverImage,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>
          Edit Profile
        </Typography>
        <IconButton onClick={handleClose} disabled={loading} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {/* Cover Image */}
        <Box
          sx={{
            position: 'relative',
            height: 180,
            background: coverImagePreview
              ? `url(${coverImagePreview}) center/cover no-repeat`
              : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 60%)`,
            mb: 3,
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
            disabled={loading}
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
              disabled={loading}
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
        <Box sx={{ px: 3, pb: 2 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              fullWidth
              required
              disabled={loading}
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
              disabled={loading}
              placeholder="Tell us about yourself..."
              inputProps={{ maxLength: 1000 }}
              helperText={`${formData.bio.length}/1000 characters`}
            />

            <TextField
              label="Work"
              value={formData.work}
              onChange={handleInputChange('work')}
              fullWidth
              disabled={loading}
              placeholder="e.g., Software Engineer"
              inputProps={{ maxLength: 100 }}
            />

            <TextField
              label="Education"
              value={formData.education}
              onChange={handleInputChange('education')}
              fullWidth
              disabled={loading}
              placeholder="e.g., University of Technology"
              inputProps={{ maxLength: 100 }}
            />

            <TextField
              label="Region"
              value={formData.region}
              onChange={handleInputChange('region')}
              fullWidth
              disabled={loading}
              placeholder="e.g., Yangon, Myanmar"
              inputProps={{ maxLength: 100 }}
            />
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !formData.name.trim()}
          sx={{ textTransform: 'none', minWidth: 100 }}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <EditIcon />}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileDialog;
