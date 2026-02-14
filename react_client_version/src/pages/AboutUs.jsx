import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Stack, useTheme, alpha, Paper, Grid,
  Skeleton, Container, Breadcrumbs, Link, useMediaQuery, Chip, Button, Avatar, Divider
} from '@mui/material';
import {
  Smartphone as MobileIcon, Support as SupportIcon,
  CardMembership as CertificateIcon, Public as GlobeIcon,
  Home as HomeIcon, ChevronRight as ChevronRightIcon,
  PlayCircleFilled as PlayIcon, FormatQuote as QuoteIcon,
  Timeline as TimelineIcon, TrendingUp as StatsIcon,
  Translate as TranslateIcon, School as SchoolIcon,
  Search as SearchIcon, MenuBook as MenuBookIcon, ShowChart as ShowChartIcon,
  Article as ArticleIcon, Brightness5 as BrightnessIcon, MusicNote as MusicNoteIcon
} from '@mui/icons-material';
import { statsAPI } from '../services/api';
import { useThemeMode } from '../context/ThemeContext';

const FEATURES = [
  { icon: MobileIcon, title: 'Mobile First', text: 'Learn on the go with our dedicated Android applications for English and Korean.' },
  { icon: SupportIcon, title: 'Expert Support', text: 'Direct access to teachers and developers via Telegram, Facebook, or our platform.' },
  { icon: CertificateIcon, title: 'Verified Skills', text: 'Earn sharable certificates upon completion to boost your professional portfolio.' },
  { icon: GlobeIcon, title: 'Inclusive Community', text: 'A supportive environment fostering new friendships and growth opportunities.' },
];

const STAT_KEYS = [
  { key: 'instructors', label: 'Expert Teachers' },
  { key: 'courses', label: 'Active Courses' },
  { key: 'enrollments', label: 'Student Enrollments' },
  { key: 'members', label: 'Community Members' },
];

const formatCount = (num) => {
  if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}K+`;
  if (num > 0) return `${num}+`;
  return '0';
};

// Hero feature card (matches Home page style)
const HeroFeatureCard = ({ icon, title, description }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2.5,
      p: 2,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateX(8px)',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderColor: 'rgba(255, 255, 255, 0.25)',
      },
    }}
  >
    <Box sx={{ width: 48, height: 48, borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {React.cloneElement(icon, { sx: { fontSize: 24, color: 'white' } })}
    </Box>
    <Box>
      <Typography variant="subtitle2" fontWeight={700} color="white" sx={{ mb: 0.25 }}>{title}</Typography>
      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500, display: 'block', lineHeight: 1.3 }}>{description}</Typography>
    </Box>
  </Box>
);

const QUICK_LINKS = [
  { icon: <SearchIcon />, label: 'Explore', path: '/explore' },
  { icon: <MenuBookIcon />, label: 'Vocab Learning', path: '/vocab-learning' },
  { icon: <ShowChartIcon />, label: 'My Learning', path: '/my-learning' },
  { icon: <ArticleIcon />, label: 'Discussion', path: '/discussion/english' },
  { icon: <BrightnessIcon />, label: 'Lessons', path: '/additional-lessons/english' },
  { icon: <MusicNoteIcon />, label: 'Songs', path: '/songs/english' },
];

const AboutUs = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await statsAPI.getAbout();
        if (res?.success && res?.data) setStats(res.data);
      } catch (e) { console.error(e); } finally { setLoadingStats(false); }
    };
    fetchStats();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      
      {/* 1. HERO SECTION (consistent with Home page) */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: { xs: 0, md: 6 },
          overflow: 'hidden',
          mb: 4,
          mx: { xs: -2, sm: -3, md: 0 },
          minHeight: { xs: 'auto', md: 480 },
          display: 'flex',
          alignItems: 'center',
          background: '#1b5e20',
          backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(46, 125, 50, 0.8) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(27, 94, 32, 0.9) 0%, transparent 50%), url("https://www.transparenttextures.com/patterns/cubes.png")',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
            filter: 'blur(60px)',
            animation: 'pulse 8s infinite alternate',
            '@keyframes pulse': { '0%': { transform: 'scale(1) translate(0, 0)' }, '100%': { transform: 'scale(1.2) translate(-20px, 20px)' } },
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: { xs: 6, md: 8 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 6, md: 8 }, alignItems: 'center' }}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Breadcrumbs separator={<ChevronRightIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }} />} sx={{ mb: 2 }}>
                <Link component={RouterLink} to="/" underline="none" sx={{ color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
                  <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} /> Home
                </Link>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>About Our Mission</Typography>
              </Breadcrumbs>
              <Stack direction="row" alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} spacing={1} sx={{ mb: 2 }}>
                <Box sx={{ px: 1.5, py: 0.5, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1, backdropFilter: 'blur(10px)' }}>
                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>Since 2019</Typography>
                </Box>
              </Stack>

              <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' }, fontWeight: 900, color: 'white', lineHeight: 1.1, mb: 2, letterSpacing: -1, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                Bridging the Gap in <br /><Box component="span" sx={{ color: '#81c784' }}>Myanmar's Education</Box>
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', mb: 4, fontWeight: 400, lineHeight: 1.6, maxWidth: 540, mx: { xs: 'auto', md: 0 }, fontSize: { xs: '1rem', md: '1.125rem' } }}>
                We're dedicated to the greatest online learning ecosystem for language and professional development in Myanmar.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mb: 5 }}>
                <Button variant="contained" size="large" component={RouterLink} to="/explore" sx={{ bgcolor: 'white', color: 'primary.dark', px: 4, py: 2, fontSize: '1rem', fontWeight: 800, borderRadius: 2, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', '&:hover': { bgcolor: '#f5f5f5', transform: 'translateY(-2px)' }, transition: 'all 0.3s' }}>
                  Start Learning
                </Button>
                <Button variant="outlined" size="large" component="a" href="https://play.google.com/store/apps/dev?id=6266259325837450446" target="_blank" rel="noopener noreferrer" sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', px: 4, py: 2, fontSize: '1rem', fontWeight: 700, borderRadius: 2, backdropFilter: 'blur(10px)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                  Our Apps
                </Button>
              </Stack>
              <Stack direction="row" alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} spacing={3} flexWrap="wrap" useFlexGap>
                <Box>
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, mb: 0 }}>{formatCount(stats?.instructors ?? 0)}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Teachers</Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)', height: 40 }} />
                <Box>
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, mb: 0 }}>{formatCount(stats?.courses ?? 0)}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Courses</Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)', height: 40 }} />
                <Box>
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, mb: 0 }}>{formatCount(stats?.enrollments ?? 0)}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Enrollments</Typography>
                </Box>
              </Stack>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Stack spacing={3}>
                <HeroFeatureCard icon={<TranslateIcon />} title="Language & Skills" description="English, Korean, and professional development." />
                <HeroFeatureCard icon={<MobileIcon />} title="Mobile First" description="Learn on the go with our Android apps." />
                <HeroFeatureCard icon={<SchoolIcon />} title="Expert-Led" description="Certified instructors and structured courses." />
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 2. STATS OVERLAY CARDS */}
      <Container maxWidth="lg" sx={{ mt: -6, mb: 6, position: 'relative', zIndex: 3 }}>
        <Grid container spacing={3}>
          {STAT_KEYS.map((item, i) => (
            <Grid size={{ xs: 6, md: 3 }} key={item.key}>
              <Paper sx={{ 
                p: 2.5, textAlign: 'center', borderRadius: 4, 
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '1px solid', borderColor: 'divider'
              }}>
                {loadingStats ? <Skeleton variant="text" width="60%" height={36} sx={{ mx: 'auto' }} /> : (
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.5rem' }}>
                    {stats ? (stats[item.key] > 1000 ? `${(stats[item.key]/1000).toFixed(1)}k+` : stats[item.key]) : '0'}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.8125rem' }}>{item.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Quick Links - consistent with Home */}
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: '1.1rem' }}>
            Quick Links
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
            Quick access to popular sections
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {QUICK_LINKS.map((link) => (
            <Box
              key={link.label}
              onClick={() => navigate(link.path)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.75,
                p: 1.5,
                minWidth: 88,
                maxWidth: 110,
                cursor: 'pointer',
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  '& .quick-link-icon': { transform: 'scale(1.08)' },
                  '& .quick-link-label': { color: theme.palette.primary.main },
                },
              }}
            >
              <Box
                className="quick-link-icon"
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  '& svg': { fontSize: '1.35rem' },
                }}
              >
                {link.icon}
              </Box>
              <Typography
                className="quick-link-label"
                variant="body2"
                fontWeight={500}
                sx={{
                  color: 'text.primary',
                  fontSize: '0.75rem',
                  textAlign: 'center',
                  transition: 'color 0.2s ease',
                  lineHeight: 1.3,
                }}
              >
                {link.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>

      {/* 3. THE JOURNEY (OUR STORY) */}
      <Container maxWidth="md" sx={{ mb: 6 }}>
        <Stack alignItems="center" textAlign="center" spacing={1.5} sx={{ mb: 3 }}>
          <TimelineIcon color="primary" sx={{ fontSize: 36 }} />
          <Typography variant="h5" fontWeight={800} sx={{ fontSize: '1.35rem' }}>Our Story So Far</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            From a single idea to a multi-platform learning ecosystem.
          </Typography>
        </Stack>
        
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.03), border: '1px dashed', borderColor: 'primary.light' }}>
          <Typography variant="body2" sx={{ lineHeight: 1.85, color: 'text.primary', fontSize: '0.9375rem' }}>
            We started with a vision to revolutionize digital education in Myanmar. In 2020, we launched **Easy English**, followed quickly by **Easy Korean** in 2021. Today, our ecosystem includes an E-library and specialized dictionaries, helping thousands study systematically from home.
          </Typography>
        </Paper>
      </Container>

      {/* --- IMPROVED FEATURES SECTION --- */}
<Box sx={{ py: 5, bgcolor: mode === 'light' ? '#F8FAFC' : 'rgba(255,255,255,0.02)' }}>
  <Container maxWidth="lg">
    <Stack alignItems="center" textAlign="center" spacing={1} sx={{ mb: 4 }}>
      <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: 1.5, fontSize: '0.7rem' }}>
        Why Calamus?
      </Typography>
      <Typography variant="h5" fontWeight={800} sx={{ color: 'text.primary', fontSize: '1.35rem' }}>
        Designed for the modern learner
      </Typography>
    </Stack>

    <Grid container spacing={3}>
      {/* 1. THE BIG FEATURE (Mobile Learning) */}
      <Grid size={{ xs: 12, md: 7 }}>
        <Paper
          elevation={0}
          sx={{
            p: 5,
            height: '100%',
            borderRadius: 6,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            bgcolor: 'primary.main',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 127, 255, 0.2)',
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <MobileIcon sx={{ fontSize: 40, mb: 1.5, opacity: 0.9 }} />
            <Typography variant="h5" fontWeight={800} gutterBottom sx={{ fontSize: '1.25rem' }}>
              Learn Anywhere, Anytime
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 400, mb: 2.5, maxWidth: 450, fontSize: '0.875rem' }}>
              Our native Android applications for English and Korean are optimized for low-data usage and offline learning in Myanmar.
            </Typography>
            <Button 
              component="a"
              href="https://play.google.com/store/apps/dev?id=6266259325837450446"
              target="_blank"
              rel="noopener noreferrer"
              variant="contained" 
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main', 
                fontWeight: 700,
                '&:hover': { bgcolor: '#f0f0f0' } 
              }}
            >
              Get on Google Play
            </Button>
          </Box>
          {/* Decorative Circle */}
          <Box sx={{ 
            position: 'absolute', bottom: -50, right: -50, 
            width: 250, height: 250, borderRadius: '50%', 
            bgcolor: 'rgba(255,255,255,0.1)' 
          }} />
        </Paper>
      </Grid>

      {/* 2. SUB-FEATURES COLUMN */}
      <Grid size={{ xs: 12, md: 5 }}>
        <Stack spacing={3} sx={{ height: '100%' }}>
          {/* Academic Support */}
          <Paper sx={{ p: 2.5, borderRadius: 4, border: '1px solid', borderColor: 'divider', display: 'flex', gap: 2 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
              <SupportIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.9rem' }}>Direct Expert Support</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                Chat with teachers via Telegram or Facebook for real-time help.
              </Typography>
            </Box>
          </Paper>

          {/* Certificates */}
          <Paper sx={{ p: 2.5, borderRadius: 4, border: '1px solid', borderColor: 'divider', display: 'flex', gap: 2 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main' }}>
              <CertificateIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.9rem' }}>Sharable Certificates</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                Get a digital certificate for every course you successfully finish.
              </Typography>
            </Box>
          </Paper>

          {/* Community */}
          <Paper sx={{ p: 2.5, borderRadius: 4, border: '1px solid', borderColor: 'divider', display: 'flex', gap: 2 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main' }}>
              <GlobeIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.9rem' }}>Inclusive Community</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                Join a network of thousands of learners and build new friendships.
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </Grid>
    </Grid>
  </Container>
</Box>

      {/* 5. VIDEO REVIEWS (LEARNER VOICES) */}
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ fontSize: '1.25rem' }}>Student Success Stories</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>Hear directly from our community in Myanmar.</Typography>
          </Box>
          {!isMobile && <StatsIcon color="primary" sx={{ fontSize: 48, opacity: 0.2 }} />}
        </Stack>

        <Grid container spacing={4}>
          {[{
            title: 'Easy Korean Success',
            vimeoEmbedUrl: 'https://player.vimeo.com/video/836210202?h=5036ec7717&badge=0&autopause=0&player_id=0&app_id=58479',
            text: 'Courses are affordable and high quality. If you want to improve your Korean skills systematically, this is the app for you.'
          }, {
            title: 'Easy English Journey',
            vimeoEmbedUrl: 'https://player.vimeo.com/video/843769832?h=5d0578e19a&badge=0&autopause=0&quality_selector=1&player_id=0&app_id=58479',
            text: 'From Grammar to Slang, this app covers everything. It helps you reach intermediate levels through self-study.'
          }].map((vid, idx) => (
            <Grid size={{ xs: 12, md: 6 }} key={idx}>
              <Paper sx={{ overflow: 'hidden', borderRadius: 5, boxShadow: '0 30px 60px rgba(0,0,0,0.12)' }}>
                <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: 'black' }}>
                  <iframe
                    src={vid.vimeoEmbedUrl}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allow="autoplay; fullscreen; picture-in-picture"
                    title={vid.title}
                  />
                </Box>
                <Box sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}><QuoteIcon sx={{ fontSize: 18 }} /></Avatar>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '0.9375rem' }}>{vid.title}</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', lineHeight: 1.6, fontSize: '0.8125rem' }}>
                    "{vid.text}"
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 6. CALL TO ACTION */}
      <Container maxWidth="lg" sx={{ pb: 6 }}>
        <Paper sx={{ 
          p: { xs: 3, md: 6 }, borderRadius: 4, textAlign: 'center',
          bgcolor: 'primary.main', color: 'white',
          boxShadow: '0 20px 50px rgba(0,127,255,0.3)'
        }}>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 1.5, fontSize: '1.35rem' }}>Ready to Upgrade Your Future?</Typography>
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.9, fontWeight: 400, fontSize: '0.875rem' }}>
            Join thousands of Myanmar students today.
          </Typography>
          <Button 
            component={RouterLink} to="/explore"
            variant="contained" 
            size="medium"
            sx={{ 
              bgcolor: 'white', color: 'primary.main', px: 4, py: 1.5, 
              borderRadius: 2, fontWeight: 700, fontSize: '0.9375rem',
              '&:hover': { bgcolor: '#f0f0f0' } 
            }}
          >
            Explore All Courses
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default AboutUs;