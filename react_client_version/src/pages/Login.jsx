import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  Link,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  ArrowBack as BackIcon,
  School as SchoolIcon,
  MenuBook as BookIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { login, register, isAuthenticated } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form
  const [loginData, setLoginData] = useState({ phone: '', password: '' });

  // Register form
  const [registerData, setRegisterData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!loginData.phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    if (!loginData.password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      await login(loginData.phone.trim(), loginData.password);
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!registerData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!registerData.phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    if (!registerData.password) {
      setError('Please enter a password');
      return;
    }
    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: registerData.name.trim(),
        phone: registerData.phone.trim(),
        password: registerData.password,
      });
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Left panel feature items
  const features = [
    { icon: <SchoolIcon />, title: 'Expert Instructors', desc: 'Learn from professional language teachers' },
    { icon: <BookIcon />, title: 'Rich Content', desc: 'Video lessons, documents, songs & more' },
    { icon: <TrophyIcon />, title: 'Track Progress', desc: 'Monitor your learning journey' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Panel - Branding (desktop only) */}
      {!isMobile && (
        <Box
          sx={{
            width: '45%',
            maxWidth: 560,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            px: 6,
            py: 4,
            position: 'relative',
            overflow: 'hidden',
            // Decorative circles
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -80,
              right: -80,
              width: 280,
              height: 280,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -60,
              left: -60,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
            },
          }}
        >
          {/* Logo + Brand */}
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 6 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Calamus"
              sx={{ height: 44, width: 44, borderRadius: 1.5 }}
            />
            <Typography variant="h6" fontWeight={700}>
              Calamus Education
            </Typography>
          </Stack>

          <Typography variant="h4" fontWeight={800} sx={{ mb: 1.5, lineHeight: 1.2 }}>
            Start Learning{'\n'}Today
          </Typography>
          <Typography variant="body1" sx={{ mb: 5, opacity: 0.85, lineHeight: 1.7 }}>
            Join thousands of students learning English, Korean, and more with interactive content.
          </Typography>

          {/* Feature list */}
          <Stack spacing={3}>
            {features.map((f, i) => (
              <Stack key={i} direction="row" spacing={2} alignItems="flex-start">
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    display: 'flex',
                    flexShrink: 0,
                  }}
                >
                  {f.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {f.desc}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>
      )}

      {/* Right Panel - Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        {/* Top bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2, sm: 3 },
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}>
            <BackIcon />
          </IconButton>

          {isMobile && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                component="img"
                src="/logo.png"
                alt="Calamus"
                sx={{ height: 28, width: 28, borderRadius: 0.8 }}
              />
              <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                Calamus
              </Typography>
            </Stack>
          )}

          <Typography variant="body2" color="text.secondary">
            {mode === 'login' ? (
              <>
                No account?{' '}
                <Link
                  component="button"
                  variant="body2"
                  fontWeight={600}
                  underline="hover"
                  onClick={() => switchMode('register')}
                  sx={{ color: 'primary.main' }}
                >
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Have an account?{' '}
                <Link
                  component="button"
                  variant="body2"
                  fontWeight={600}
                  underline="hover"
                  onClick={() => switchMode('login')}
                  sx={{ color: 'primary.main' }}
                >
                  Log in
                </Link>
              </>
            )}
          </Typography>
        </Box>

        {/* Form area */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 3, sm: 4 },
            py: 4,
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            {/* Heading */}
            <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
              {mode === 'login' ? 'Log in to your account' : 'Create your account'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
              {mode === 'login'
                ? 'Enter your phone number and password to continue'
                : 'Fill in your details to get started'}
            </Typography>

            {/* Error */}
            {error && (
              <Alert
                severity="error"
                onClose={() => setError('')}
                sx={{ mb: 2.5, borderRadius: 1.5 }}
              >
                {error}
              </Alert>
            )}

            {/* Login Form */}
            {mode === 'login' && (
              <Box component="form" onSubmit={handleLogin}>
                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    value={loginData.phone}
                    onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            tabIndex={-1}
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.4,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '1rem',
                      borderRadius: 2,
                      boxShadow: 'none',
                      '&:hover': { boxShadow: '0 4px 14px rgba(0,0,0,0.18)' },
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
                  </Button>
                </Stack>
              </Box>
            )}

            {/* Register Form */}
            {mode === 'register' && (
              <Box component="form" onSubmit={handleRegister}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            tabIndex={-1}
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.4,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '1rem',
                      borderRadius: 2,
                      boxShadow: 'none',
                      mt: 0.5,
                      '&:hover': { boxShadow: '0 4px 14px rgba(0,0,0,0.18)' },
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                  </Button>
                </Stack>
              </Box>
            )}

            {/* Footer text */}
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ display: 'block', textAlign: 'center', mt: 3, lineHeight: 1.6 }}
            >
              By continuing, you agree to Calamus Education's{' '}
              <Link
                component="button"
                variant="caption"
                underline="hover"
                onClick={() => navigate('/terms')}
                sx={{ color: 'text.secondary' }}
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                component="button"
                variant="caption"
                underline="hover"
                onClick={() => navigate('/privacy')}
                sx={{ color: 'text.secondary' }}
              >
                Privacy Policy
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
