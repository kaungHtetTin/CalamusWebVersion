import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Stack,
  useTheme,
  alpha,
  Paper,
  Grid,
  Skeleton,
  Container,
  Breadcrumbs,
  Link,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  Smartphone as MobileIcon,
  Support as SupportIcon,
  CardMembership as CertificateIcon,
  Public as GlobeIcon,
  AutoStories as StoryIcon,
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
  Info as InfoIcon,
  PlayCircleFilled as PlayIcon,
  FormatQuote as QuoteIcon,
} from '@mui/icons-material';
import { statsAPI } from '../services/api';
import { useThemeMode } from '../context/ThemeContext';

const formatCount = (n) => {
  if (n == null || n === '') return '0';
  const num = Number(n);
  if (!Number.isFinite(num)) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
};

const FEATURES = [
  { icon: MobileIcon, title: 'Mobile learning', text: 'We Support mobile application (Android) for learning.' },
  { icon: SupportIcon, title: 'Academic & Technical Support', text: 'You can directly contact the teacher team or developer team through our platform, telegram or facebook.' },
  { icon: CertificateIcon, title: 'Sharable Certificates', text: 'We give the certificate for each course you have finished.' },
  { icon: GlobeIcon, title: 'An Inclusive Experience', text: 'We can support new experience, opportunity to developing up yourself and new friendship for you.' },
];

const OUR_STORY = `We have been trying to develop the greatest online learning platform in Myanmar since 2019.
Firstly, We have released the Easy English Android App on May 28th, 2020.
And then, we developed a learning app for Korean Language and we could released the Easy Korean Android App on Jan 12nd, 2021.
Also, we have freely released an E-library Mobile App and a Russia-Myanmar Dictionary Mobile App on Google Playstore.`;

const REVIEWS = [
  {
    title: 'Easy Korean',
    text: `This is the app to learn Korean Language for Myanmar People. In app many lessons and additional materials to improve your language skills are included. And you can attend to our online course via this app. Courses are pretty cheaper than other online courses, but you will get more than the cost is worth. If you're willing to learn Korean language (or) to improve your Korean language skills, this app is for you.
Wish you all the success!`,
    vimeoEmbedUrl: 'https://player.vimeo.com/video/836210202?h=5036ec7717&badge=0&autopause=0&player_id=0&app_id=58479',
  },
  {
    title: 'Easy English',
    text: `This is an application for those who want to study english systematically and this is really intended to be higher the education of myanmar. In this app, you can freely learn the various subjects of english language such as grammar, sentence construction, writing exercise, how to read the english sentence systematically, popular dialogues, proverbs, tips and slang, idioms, translated songs and movies, words on topics and a funny game for improving your english vocabulary. And also we daily provide an english word and its detail description for you. The weekly and monthly exam will help you to know that how much your english professional skill improves. Also you can ask what you do not understand to your teacher directly. We claim that even if you know only "A" to "Z", this app will help to reach the intermediate level by studying yourself. It only needs that you must be a student trying hard.`,
    vimeoEmbedUrl: 'https://player.vimeo.com/video/843769832?h=5d0578e19a&badge=0&autopause=0&quality_selector=1&player_id=0&app_id=58479',
  },
];

const STAT_KEYS = [
  { key: 'instructors', label: 'Instructors' },
  { key: 'courses', label: 'Courses' },
  { key: 'lectures', label: 'Lectures' },
  { key: 'enrollments', label: 'Course enrollments' },
  { key: 'languages', label: 'Languages' },
  { key: 'members', label: 'Members Joined' },
];

const getCardSx = (theme, mode, options = {}) => {
  const base = {
    borderRadius: 3,
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow: mode === 'light' ? '0 2px 12px rgba(0,0,0,0.06)' : '0 4px 16px rgba(0,0,0,0.25)',
    bgcolor: 'background.paper',
    transition: 'all 0.25s ease',
    ...options.extra,
  };
  if (!options.noHover) {
    base['&:hover'] = {
      transform: 'translateY(-4px)',
      boxShadow: mode === 'light' ? '0 12px 32px rgba(0,0,0,0.12)' : '0 12px 32px rgba(0,0,0,0.4)',
    };
  }
  return base;
};

const AboutUs = () => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await statsAPI.getAbout();
        if (res?.success && res?.data) setStats(res.data);
      } catch (e) {
        console.error('About stats failed:', e);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const cardSx = getCardSx(theme, mode);
  const cardSxNoHover = getCardSx(theme, mode, { noHover: true });
  const statValues = stats
    ? [stats.instructors, stats.courses, stats.lectures, stats.enrollments, stats.languages ?? 2, stats.members]
    : [0, 0, 0, 0, 2, 0];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', width: '100%' }}>
      <Container maxWidth="lg" sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
        <Breadcrumbs sx={{ mb: 3 }} separator={<ChevronRightIcon sx={{ fontSize: 14, opacity: 0.5 }} />}>
          <Link component={RouterLink} to="/" underline="hover" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: '0.8125rem', fontWeight: 500, '&:hover': { color: 'primary.main' } }}>
            <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} /> Home
          </Link>
          <Typography sx={{ display: 'flex', alignItems: 'center', color: 'text.primary', fontSize: '0.8125rem', fontWeight: 600 }}>
            <InfoIcon sx={{ mr: 0.5, fontSize: 16 }} /> About Us
          </Typography>
        </Breadcrumbs>

        <Box sx={{ mb: 5 }}>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-1px', mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            About Us
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8 }}>
            Empowering Myanmar through quality education since 2019
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, mb: 5, borderRadius: 3, overflow: 'hidden', border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, boxShadow: mode === 'light' ? '0 2px 12px rgba(0,0,0,0.06)' : '0 4px 16px rgba(0,0,0,0.25)', bgcolor: alpha(theme.palette.primary.main, mode === 'light' ? 0.06 : 0.12) }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.5px', color: 'text.primary', fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
              For Higher Education Of Myanmar
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>Our Features</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>On Calamus, you have access to:</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
            {FEATURES.map((item) => (
              <Paper key={item.title} elevation={0} sx={{ ...cardSx, p: 2.5, height: '100%', minHeight: { md: 200 }, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5, flexShrink: 0 }}>
                  <item.icon sx={{ fontSize: 24, color: 'primary.main' }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.75 }}>{item.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, flex: 1 }}>{item.text}</Typography>
              </Paper>
            ))}
          </Box>
        </Box>

        <Box sx={{ mb: 6 }}>
          <Paper elevation={0} sx={{ ...cardSxNoHover, p: 4 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems={{ md: 'center' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 1.5 }}>Our Story</Typography>
                <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: 'primary.main', mb: 2 }} />
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>{OUR_STORY}</Typography>
              </Box>
              <Box sx={{ width: { xs: '100%', md: 200 }, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
                <StoryIcon sx={{ fontSize: 80, color: 'primary.main', opacity: 0.6 }} />
              </Box>
            </Stack>
          </Paper>
        </Box>

        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5, textAlign: 'center' }}>Our Reach</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center', maxWidth: 520, mx: 'auto' }}>
            Calamus is the leading marketplace for teaching and learning, connecting thousands of students to the skills they need to succeed.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' }, gap: 2 }}>
            {loadingStats ? [...Array(6)].map((_, i) => <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 3 }} />) : STAT_KEYS.map((item, i) => (
              <Paper key={item.key} elevation={0} sx={{ ...cardSx, p: 2, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>{formatCount(statValues[i])}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{item.label}</Typography>
              </Paper>
            ))}
          </Box>
        </Box>

        <Box sx={{ mb: 6, py: { xs: 5, md: 6 }, px: { xs: 2, sm: 3 }, bgcolor: alpha(theme.palette.primary.main, mode === 'light' ? 0.03 : 0.06), borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}` }}>
          <Container maxWidth="lg" disableGutters>
            <Stack alignItems="center" sx={{ textAlign: 'center', mb: 5 }}>
              <Chip icon={<QuoteIcon sx={{ fontSize: 16 }} />} label="From our community" size="small" sx={{ mb: 1.5, fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.dark', '& .MuiChip-icon': { color: 'primary.main' } }} />
              <Typography variant="h4" fontWeight={800} sx={{ mb: 1, letterSpacing: '-0.02em' }}>Honest Reviews</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480 }}>Real feedback from learners. Watch how Easy Korean and Easy English help Myanmar students succeed.</Typography>
            </Stack>
            <Stack spacing={5}>
              {REVIEWS.map((review, idx) => (
                <Paper key={review.title} elevation={0} sx={{ ...cardSxNoHover, overflow: 'hidden', borderRadius: 3 }}>
                  <Grid container sx={{ flexDirection: idx % 2 === 1 && !isMobile ? 'row-reverse' : 'row', alignItems: 'stretch', minHeight: { md: 320 } }}>
                    <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
                      <Box sx={{ width: '100%', overflow: 'hidden', borderRadius: { xs: 0, md: idx % 2 === 1 ? '24px 0 0 24px' : '0 24px 24px 0' }, bgcolor: '#000' }}>
                        {/* Exact same structure as about_us.php: wrapper with padding 56.25% (16:9), iframe absolute to fill */}
                        <Box
                          component="div"
                          sx={{
                            position: 'relative',
                            width: '100%',
                            paddingTop: '56.25%',
                          }}
                        >
                          <iframe
                            src={review.vimeoEmbedUrl}
                            title={`${review.title} Honest Review`}
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              border: 'none',
                            }}
                          />
                          <Box sx={{ position: 'absolute', bottom: 10, left: 10, pointerEvents: 'none' }}>
                            <Chip size="small" icon={<PlayIcon sx={{ fontSize: 14, color: 'white' }} />} label="Video review" sx={{ bgcolor: alpha('#000', 0.65), color: 'white', fontWeight: 600, fontSize: '0.75rem', '& .MuiChip-icon': { color: 'white' } }} />
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ flex: 1, p: { xs: 3, sm: 4 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap' }}>
                          <Chip label={review.title} size="small" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.dark' }} />
                          <Typography variant="h6" fontWeight={700} color="text.primary">Honest Review</Typography>
                        </Stack>
                        <Box sx={{ borderLeft: '4px solid', borderColor: 'primary.main', pl: 2, py: 0.5 }}>
                          <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, maxWidth: '52ch' }}>{review.text}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>Play the video on this page — no need to leave.</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>
          </Container>
        </Box>

        <Box sx={{ py: 4, textAlign: 'center', borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, mode === 'light' ? 0.05 : 0.08), border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Ready to start learning?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Explore our courses and begin your journey today.</Typography>
          <Link component={RouterLink} to="/explore" underline="none" sx={{ display: 'inline-flex', alignItems: 'center', px: 3, py: 1.5, borderRadius: 2, bgcolor: 'primary.main', color: 'white', fontWeight: 600, '&:hover': { bgcolor: 'primary.dark' } }}>
            Explore Courses <ChevronRightIcon sx={{ ml: 0.5 }} />
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutUs;
