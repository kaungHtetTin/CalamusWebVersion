import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button,
  Stack,
  Avatar,
  AvatarGroup,
  Chip,
  Skeleton,
  Paper,
  Rating,
  useTheme,
  alpha,
  Card,
  CardContent,
  Container,
  Divider,
  CircularProgress,
  Grid,
  Link,
} from '@mui/material';
import { 
  PlayCircleOutline as PlayIcon,
  PlayCircleFilled as VideoPlayIcon,
  Translate as TranslateIcon,
  EmojiEvents as TrophyIcon,
  ArrowForward as ArrowIcon,
  Star as StarIcon,
  OndemandVideo as VideoIcon,
  PushPin as PinIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  GetApp as DownloadIcon,
  PhoneAndroid as PhoneIcon,
  MenuBook as MenuBookIcon,
  ShowChart as ShowChartIcon,
  Article as ArticleIcon,
  MusicNote as MusicNoteIcon,
  Search as SearchIcon,
  Brightness5 as BrightnessIcon,
  FormatQuote as QuoteIcon,
} from '@mui/icons-material';
import { courseAPI, statsAPI, pinnedPostsAPI, instructorAPI, appsAPI, ratingAPI } from '../services/api';
import { CourseCard, CourseCardSkeleton, ResponsiveGrid } from '../components/CourseCard';

// Feature card for hero section
const FeatureCard = ({ icon, title, description }) => (
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
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: 24, color: 'white' } })}
    </Box>
    <Box>
      <Typography variant="subtitle2" fontWeight={700} color="white" sx={{ mb: 0.25 }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500, display: 'block', lineHeight: 1.3 }}>
        {description}
      </Typography>
    </Box>
  </Box>
);

// Stat item for hero section
const StatItem = ({ value, label }) => (
  <Box sx={{ textAlign: 'center' }}>
    <Typography variant="h4" fontWeight={800} color="white" sx={{ mb: 0.5, letterSpacing: -0.5 }}>
      {value}
    </Typography>
    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
      {label}
    </Typography>
  </Box>
);

// Helper to format large numbers nicely
const formatCount = (num) => {
  if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}K+`;
  if (num > 0) return `${num}+`;
  return '0';
};

// Helper to render star icons based on rating
const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          sx={{ fontSize: 14, color: i < fullStars || (i === fullStars && hasHalf) ? '#ffc107' : 'rgba(255,255,255,0.3)' }}
        />
      ))}
    </Stack>
  );
};

// Color palette for avatar fallbacks
const avatarColors = ['#1976d2', '#d32f2f', '#ed6c02', '#9c27b0', '#0288d1'];

// Honest Review videos (same as About page)
const HONEST_REVIEWS = [
  {
    title: 'Easy Korean',
    vimeoEmbedUrl: 'https://player.vimeo.com/video/836210202?h=5036ec7717&badge=0&autopause=0&player_id=0&app_id=58479',
    text: 'Courses are affordable and high quality. If you want to improve your Korean skills systematically, this is the app for you.',
  },
  {
    title: 'Easy English',
    vimeoEmbedUrl: 'https://player.vimeo.com/video/843769832?h=5d0578e19a&badge=0&autopause=0&quality_selector=1&player_id=0&app_id=58479',
    text: 'From Grammar to Slang, this app covers everything. It helps you reach intermediate levels through self-study.',
  },
];

// Hero Section Component - now accepts live stats
const HeroSection = ({ stats, loading }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { totalCourses, totalLessons, videoLessons, documentLessons, totalInstructors, totalStudents, avgRating, topInstructors } = stats;

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: { xs: 0, md: 6 },
        overflow: 'hidden',
        mb: 6,
        mx: { xs: -2, sm: -3, md: 0 }, // Bleed on mobile
        minHeight: { xs: 'auto', md: 540 },
        display: 'flex',
        alignItems: 'center',
        background: '#1b5e20',
        backgroundImage: `
          radial-gradient(circle at 0% 0%, rgba(46, 125, 50, 0.8) 0%, transparent 50%),
          radial-gradient(circle at 100% 100%, rgba(27, 94, 32, 0.9) 0%, transparent 50%),
          url("https://www.transparenttextures.com/patterns/cubes.png")
        `,
      }}
    >
      {/* Animated Background Shapes */}
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
          '@keyframes pulse': {
            '0%': { transform: 'scale(1) translate(0, 0)' },
            '100%': { transform: 'scale(1.2) translate(-20px, 20px)' },
          },
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: { xs: 6, md: 8 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 6, md: 8 },
            alignItems: 'center',
          }}
        >
          {/* Left Content: Text & CTA */}
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Stack direction="row" alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} spacing={1} sx={{ mb: 3 }}>
              <Box sx={{ px: 1.5, py: 0.5, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1, backdropFilter: 'blur(10px)' }}>
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                  Premium Learning
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <StarIcon sx={{ fontSize: 16, color: '#ffc107' }} />
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 700 }}>
                  {avgRating || '4.9'}/5.0
                </Typography>
              </Box>
            </Stack>

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.1,
                mb: 3,
                letterSpacing: -1,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              Master Any <br />
              <Box component="span" sx={{ color: '#81c784' }}>Language</Box> Effortlessly
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255,255,255,0.85)',
                mb: 5,
                fontWeight: 400,
                lineHeight: 1.6,
                maxWidth: 540,
                mx: { xs: 'auto', md: 0 },
                fontSize: { xs: '1rem', md: '1.125rem' },
              }}
            >
              Unlock your potential with expert-led courses, interactive exercises, and a global community of learners. Start your journey to fluency today.
            </Typography>

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent={{ xs: 'center', md: 'flex-start' }} 
              sx={{ 
                mb: 6,
                px: { xs: 2, sm: 0 } // Added margin for small screens
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/explore')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.dark',
                  px: 4,
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 800,
                  borderRadius: 2,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  '&:hover': { bgcolor: '#f5f5f5', transform: 'translateY(-2px)' },
                  transition: 'all 0.3s',
                }}
              >
                Get Started Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<PlayIcon />}
                onClick={() => navigate('/my-learning')}
                sx={{
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'white',
                  px: 4,
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                Watch Demo
              </Button>
            </Stack>

            {/* Trust Badges */}
            <Stack direction="row" alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} spacing={3}>
              <Box>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, mb: 0 }}>{formatCount(totalStudents || 15000)}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Students</Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)', height: 40 }} />
              <Box>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, mb: 0 }}>{totalCourses || 120}+</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Courses</Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)', height: 40 }} />
              <Box>
                <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.75rem', border: '2px solid #1b5e20' } }}>
                  {topInstructors.slice(0, 3).map((inst, i) => (
                    <Avatar key={i} src={inst.image} />
                  ))}
                </AvatarGroup>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, display: 'block', mt: 0.5 }}>Top Mentors</Typography>
              </Box>
            </Stack>
          </Box>

          {/* Right Content: Feature Grid */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 3,
                transform: 'perspective(1000px) rotateY(-10deg) rotateX(5deg)',
              }}
            >
              <Stack spacing={3}>
                <FeatureCard
                  icon={<TranslateIcon />}
                  title="Native Speakers"
                  description="Learn from certified native instructors."
                />
                <FeatureCard
                  icon={<VideoIcon />}
                  title="HD Video"
                  description="High-quality lessons available 24/7."
                />
              </Stack>
              <Stack spacing={3} sx={{ mt: 6 }}>
                <FeatureCard
                  icon={<TrophyIcon />}
                  title="Certification"
                  description="Earn recognized certificates upon completion."
                />
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: theme.palette.background.paper,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: theme.palette.mode === 'light' ? '0 20px 40px rgba(0,0,0,0.3)' : '0 20px 40px rgba(0,0,0,0.6)',
                  }}
                >
                  <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                    <CircularProgress
                      variant="determinate"
                      value={75}
                      size={80}
                      thickness={5}
                      sx={{ color: theme.palette.primary.main }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h6" component="div" color="text.primary" fontWeight={800}>
                        75%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="subtitle2" fontWeight={800} color="text.primary" align="center">
                    Average Fluency Increase
                  </Typography>
                </Paper>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

const defaultStats = {
  totalCourses: 0,
  totalLessons: 0,
  videoLessons: 0,
  documentLessons: 0,
  totalInstructors: 0,
  totalStudents: 0,
  avgRating: 0,
  ratingCount: 0,
  topInstructors: [],
};

// Horizontal scroll carousel with circle dot indicators
const ScrollCarousel = ({ children, itemCount }) => {
  const theme = useTheme();
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const updateIndicator = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setTotalPages(1);
      setActiveIndex(0);
      return;
    }
    // Calculate how many "pages" based on visible items
    const itemWidth = el.scrollWidth / Math.max(itemCount, 1);
    const visibleItems = Math.round(el.clientWidth / itemWidth);
    const pages = Math.max(1, Math.ceil(itemCount / Math.max(visibleItems, 1)));
    setTotalPages(pages);
    const progress = el.scrollLeft / maxScroll;
    setActiveIndex(Math.round(progress * (pages - 1)));
  }, [itemCount]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateIndicator();
    el.addEventListener('scroll', updateIndicator, { passive: true });
    window.addEventListener('resize', updateIndicator);
    return () => {
      el.removeEventListener('scroll', updateIndicator);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [updateIndicator]);

  const handleDotClick = (index) => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const targetScroll = totalPages <= 1 ? 0 : (index / (totalPages - 1)) * maxScroll;
    el.scrollTo({ left: targetScroll, behavior: 'smooth' });
  };

  return (
    <Box>
      <Box
        ref={scrollRef}
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x proximity',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x',
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing',
          },
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        {children}
      </Box>
      {totalPages > 1 && (
        <Stack direction="row" justifyContent="center" spacing={0.75} sx={{ mt: 2 }}>
          {[...Array(totalPages)].map((_, i) => (
            <Box
              key={i}
              onClick={() => handleDotClick(i)}
              sx={{
                width: i === activeIndex ? 18 : 8,
                height: 8,
                borderRadius: 4,
                bgcolor: i === activeIndex ? 'primary.main' : 'grey.300',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [newCourses, setNewCourses] = useState([]);
  const [heroStats, setHeroStats] = useState(defaultStats);
  const [pinnedPosts, setPinnedPosts] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPinned, setLoadingPinned] = useState(true);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [apps, setApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [latestReviews, setLatestReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState(null);

  // Fetch hero stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const response = await statsAPI.getHome();
        setHeroStats(response.data || defaultStats);
      } catch (err) {
        console.error('Failed to fetch hero stats:', err);
        // Silently fail - hero will show fallback text
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch featured courses
  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        setLoadingFeatured(true);
        const response = await courseAPI.getFeatured();
        setFeaturedCourses(response.data || []);
      } catch (err) {
        console.error('Failed to fetch featured courses:', err);
        setError('Failed to load featured courses');
      } finally {
        setLoadingFeatured(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  // Fetch new courses
  useEffect(() => {
    const fetchNewCourses = async () => {
      try {
        setLoadingNew(true);
        const response = await courseAPI.getNew();
        setNewCourses(response.data || []);
      } catch (err) {
        console.error('Failed to fetch new courses:', err);
        setError('Failed to load new courses');
      } finally {
        setLoadingNew(false);
      }
    };

    fetchNewCourses();
  }, []);

  // Fetch pinned posts
  useEffect(() => {
    const fetchPinnedPosts = async () => {
      try {
        setLoadingPinned(true);
        const response = await pinnedPostsAPI.get();
        setPinnedPosts(response.data || []);
      } catch (err) {
        console.error('Failed to fetch pinned posts:', err);
      } finally {
        setLoadingPinned(false);
      }
    };
    fetchPinnedPosts();
  }, []);

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoadingTeachers(true);
        const response = await instructorAPI.getAll();
        setTeachers(response.data || []);
      } catch (err) {
        console.error('Failed to fetch teachers:', err);
      } finally {
        setLoadingTeachers(false);
      }
    };
    fetchTeachers();
  }, []);

  // Fetch apps
  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoadingApps(true);
        const response = await appsAPI.get();
        setApps(response.data || []);
      } catch (err) {
        console.error('Failed to fetch apps:', err);
      } finally {
        setLoadingApps(false);
      }
    };
    fetchApps();
  }, []);

  // Fetch latest reviews
  useEffect(() => {
    const fetchLatestReviews = async () => {
      try {
        setLoadingReviews(true);
        const response = await ratingAPI.getLatest(6);
        setLatestReviews(response.data || []);
      } catch (err) {
        console.error('Failed to fetch latest reviews:', err);
        // Silently fail - section won't show if no reviews
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchLatestReviews();
  }, []);

  const handleBookmark = (courseId, isBookmarked) => {
    console.log(`Course ${courseId} bookmark: ${isBookmarked}`);
    // TODO: Implement bookmark API call
  };

  return (
    <Box sx={{ pb: 3 }}>
      {/* Hero Section */}
      <HeroSection stats={heroStats} loading={loadingStats} />

      {/* 1. Newest Courses Section */}
      <Box sx={{ mb: 5, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Newest Courses
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Recently added courses for you to explore
            </Typography>
          </Box>
          <Button 
            color="primary" 
            endIcon={<ArrowIcon />}
            onClick={() => navigate('/explore')}
            sx={{ fontWeight: 600 }}
          >
            See all
          </Button>
        </Box>
        <ResponsiveGrid>
          {loadingNew ? (
            [...Array(4)].map((_, index) => (
              <CourseCardSkeleton key={index} />
            ))
          ) : newCourses.length > 0 ? (
            newCourses.map((course) => (
              <CourseCard key={course.id} course={course} onBookmark={handleBookmark} />
            ))
          ) : (
            <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No new courses available</Typography>
            </Box>
          )}
        </ResponsiveGrid>
      </Box>

      {/* 2. Featured Courses Section */}
      <Box sx={{ mb: 5, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Featured Courses
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Top-rated courses by our expert instructors
            </Typography>
          </Box>
          <Button 
            color="primary" 
            endIcon={<ArrowIcon />}
            onClick={() => navigate('/explore')}
            sx={{ fontWeight: 600 }}
          >
            See all
          </Button>
        </Box>
        <ResponsiveGrid>
          {loadingFeatured ? (
            [...Array(4)].map((_, index) => (
              <CourseCardSkeleton key={index} />
            ))
          ) : featuredCourses.length > 0 ? (
            featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} onBookmark={handleBookmark} />
            ))
          ) : (
            <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No featured courses available</Typography>
            </Box>
          )}
        </ResponsiveGrid>
      </Box>

      {/* Quick Links Section - Udemy Style */}
      <Box sx={{ mb: 5, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Quick Links
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quick access to popular sections
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          {[
            { icon: <SearchIcon />, label: 'Explore', path: '/explore' },
            { icon: <MenuBookIcon />, label: 'Vocab Learning', path: '/vocab-learning' },
            { icon: <ShowChartIcon />, label: 'My Learning', path: '/my-learning' },
            { icon: <ArticleIcon />, label: 'Discussion', path: '/discussion/english' },
            { icon: <BrightnessIcon />, label: 'Lessons', path: '/additional-lessons/english' },
            { icon: <MusicNoteIcon />, label: 'Songs', path: '/songs/english' },
          ].map((link) => (
            <Box
              key={link.label}
              onClick={() => navigate(link.path)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                p: 2,
                minWidth: 100,
                maxWidth: 120,
                cursor: 'pointer',
                borderRadius: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  '& .quick-link-icon': {
                    transform: 'scale(1.1)',
                  },
                  '& .quick-link-label': {
                    color: theme.palette.primary.main,
                  },
                },
              }}
            >
              <Box
                className="quick-link-icon"
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  mb: 0.5,
                  '& svg': {
                    fontSize: '1.75rem',
                  },
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
                  fontSize: '0.8125rem',
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
      </Box>

      {/* Honest Reviews Section */}
      <Box sx={{ mb: 5, py: 5, px: { xs: 2, sm: 3, md: 4 }, bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.04 : 0.08), borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
        <Stack alignItems="center" sx={{ textAlign: 'center', mb: 4 }}>
          <Chip icon={<QuoteIcon sx={{ fontSize: 16 }} />} label="From our community" size="small" sx={{ mb: 1.5, fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.dark', '& .MuiChip-icon': { color: 'primary.main' } }} />
          <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5, letterSpacing: '-0.02em' }}>
            Honest Reviews
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480 }}>
            Real feedback from learners. Watch how Easy Korean and Easy English help Myanmar students succeed.
          </Typography>
        </Stack>
        <Grid container spacing={3}>
          {HONEST_REVIEWS.map((review, idx) => (
            <Grid size={{ xs: 12, md: 6 }} key={idx}>
              <Paper elevation={0} sx={{ overflow: 'hidden', borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: 'black' }}>
                  <iframe
                    src={review.vimeoEmbedUrl}
                    title={`${review.title} Honest Review`}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allow="autoplay; fullscreen; picture-in-picture"
                  />
                  <Box sx={{ position: 'absolute', bottom: 8, left: 8, pointerEvents: 'none' }}>
                    <Chip size="small" icon={<VideoPlayIcon sx={{ fontSize: 14, color: 'white' }} />} label="Video review" sx={{ bgcolor: alpha('#000', 0.65), color: 'white', fontWeight: 600, fontSize: '0.75rem', '& .MuiChip-icon': { color: 'white' } }} />
                  </Box>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                    <Chip label={review.title} size="small" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.dark' }} />
                    <Typography variant="subtitle1" fontWeight={700}>Honest Review</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    "{review.text}"
                  </Typography>
                  <Link component={RouterLink} to="/about" underline="hover" sx={{ mt: 1.5, display: 'inline-block', fontSize: '0.8125rem', fontWeight: 600 }}>
                    More on About us →
                  </Link>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Latest Reviews Section - Horizontal Scroll */}
      {(loadingReviews || latestReviews.length > 0) && (
        <Box sx={{ mb: 5, px: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Latest Reviews
            </Typography>
            <Typography variant="body2" color="text.secondary">
              What our students are saying
            </Typography>
          </Box>
          <ScrollCarousel itemCount={loadingReviews ? 6 : latestReviews.length}>
            {loadingReviews ? (
              [...Array(6)].map((_, i) => (
                <Paper
                  key={i}
                  elevation={0}
                  sx={{
                    minWidth: { xs: 280, sm: 300 },
                    width: { xs: 280, sm: 300 },
                    flexShrink: 0,
                    scrollSnapAlign: 'start',
                    p: 2.5,
                    borderRadius: 0,
                    border: 'none',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={18} sx={{ mb: 0.5 }} />
                      <Skeleton variant="text" width="40%" height={14} />
                    </Box>
                  </Stack>
                  <Skeleton variant="text" width="80%" height={16} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="100%" height={14} />
                  <Skeleton variant="text" width="90%" height={14} sx={{ mt: 0.5 }} />
                  <Skeleton variant="text" width="70%" height={14} sx={{ mt: 0.5 }} />
                </Paper>
              ))
            ) : latestReviews.length > 0 ? (
              latestReviews.map((review) => (
                <Paper
                  key={review.id}
                  elevation={0}
                  sx={{
                    minWidth: { xs: 280, sm: 300 },
                    width: { xs: 280, sm: 300 },
                    flexShrink: 0,
                    scrollSnapAlign: 'start',
                    p: 2.5,
                    borderRadius: 3,
                    border: 'none',
                    bgcolor: 'background.paper',
                    boxShadow: theme.palette.mode === 'light' ? '0 2px 8px rgba(0,0,0,0.06)' : '0 4px 16px rgba(0,0,0,0.25)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: theme.palette.mode === 'light' ? '0 12px 32px rgba(0,0,0,0.12)' : '0 12px 32px rgba(0,0,0,0.4)',
                      bgcolor: theme.palette.mode === 'light' ? alpha(theme.palette.grey[50], 0.5) : alpha(theme.palette.common.white, 0.05),
                    },
                  }}
                  onClick={() => navigate(`/course/${review.courseId}`)}
                >
                  {/* User Header - Udemy Style */}
                  <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
                    <Avatar
                      src={review.learnerImage}
                      alt={review.learnerName}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: '#5624d0',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      {review.learnerName?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '0.875rem',
                            color: 'text.primary',
                          }}
                        >
                          {review.learnerName}
                        </Typography>
                        <Rating
                          value={review.star}
                          readOnly
                          size="small"
                          sx={{
                            '& .MuiRating-icon': {
                              fontSize: '0.875rem',
                              color: '#f3ca8c',
                            },
                            '& .MuiRating-iconFilled': {
                              color: '#f3ca8c',
                            },
                            '& .MuiRating-iconEmpty': {
                              color: theme.palette.mode === 'light' ? '#e4e4e4' : alpha(theme.palette.common.white, 0.25),
                            },
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'text.primary',
                          }}
                        >
                          {review.star}.0
                        </Typography>
                      </Stack>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                          display: 'block',
                        }}
                      >
                        {review.formattedTime}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Course Title - Udemy Style */}
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: theme.palette.primary.main,
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        color: theme.palette.primary.dark,
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {review.courseTitle}
                  </Typography>

                  {/* Review Text - Udemy Style */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.primary',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      mb: 0,
                    }}
                  >
                    {review.review}
                  </Typography>
                </Paper>
              ))
            ) : null}
          </ScrollCarousel>
        </Box>
      )}

      {/* 3. Our Teachers Section - Horizontal Scroll */}
      {(loadingTeachers || teachers.length > 0) && (
        <Box sx={{ mb: 5, px: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Our Teachers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Learn from experienced language instructors
            </Typography>
          </Box>

          <ScrollCarousel itemCount={loadingTeachers ? 5 : teachers.length}>
            {loadingTeachers ? (
              [...Array(5)].map((_, i) => (
                <Paper
                  key={i}
                  elevation={0}
                  sx={{
                    minWidth: { xs: 150, sm: 170 },
                    width: { xs: 150, sm: 170 },
                    flexShrink: 0,
                    scrollSnapAlign: 'start',
                    p: 2.5,
                    textAlign: 'center',
                    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Skeleton variant="circular" width={64} height={64} sx={{ mx: 'auto', mb: 1.5 }} />
                  <Skeleton variant="text" width="70%" height={20} sx={{ mx: 'auto' }} />
                  <Skeleton variant="text" width="50%" height={16} sx={{ mx: 'auto', mt: 0.5 }} />
                </Paper>
              ))
            ) : (
              teachers.map((teacher) => (
                <Paper
                  key={teacher.id}
                  elevation={0}
                  onClick={() => navigate(`/instructor/${teacher.id}`)}
                  sx={{
                    minWidth: { xs: 150, sm: 170 },
                    width: { xs: 150, sm: 170 },
                    flexShrink: 0,
                    scrollSnapAlign: 'start',
                    p: 2.5,
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <Avatar
                    src={teacher.image}
                    sx={{
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 1.5,
                      border: '2px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                    }}
                  >
                    {teacher.name?.charAt(0)}
                  </Avatar>
                  <Typography variant="subtitle2" fontWeight={700} noWrap>
                    {teacher.name}
                  </Typography>
                  {teacher.rank && (
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.25 }}>
                      {teacher.rank}
                    </Typography>
                  )}
                  <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mt: 1.5 }}>
                    <Rating value={teacher.avgRating} precision={0.1} size="small" readOnly sx={{ fontSize: '0.85rem' }} />
                  </Stack>
                  <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mt: 0.5 }}>
                    <SchoolIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary">
                      {teacher.courseCount} {teacher.courseCount === 1 ? 'course' : 'courses'}
                    </Typography>
                  </Stack>
                </Paper>
              ))
            )}
          </ScrollCarousel>
        </Box>
      )}

      {/* 4. Calamus Sharing (Pinned Posts) - Horizontal Scroll */}
      {(loadingPinned || pinnedPosts.length > 0) && (
        <Box sx={{ mb: 5, px: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PinIcon sx={{ fontSize: 20, color: 'primary.main', transform: 'rotate(45deg)' }} />
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 0 }}>
                Calamus Sharing
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Featured articles from our community
            </Typography>
          </Box>

          <ScrollCarousel itemCount={loadingPinned ? 4 : pinnedPosts.length}>
            {loadingPinned ? (
              [...Array(4)].map((_, i) => (
                <Paper
                  key={i}
                  elevation={0}
                  sx={{
                    minWidth: { xs: 260, sm: 280 },
                    width: { xs: 260, sm: 280 },
                    flexShrink: 0,
                    scrollSnapAlign: 'start',
                    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                  }}
                >
                  <Skeleton variant="rectangular" height={140} />
                  <Box sx={{ p: 2 }}>
                    <Skeleton variant="text" width="80%" height={22} />
                    <Skeleton variant="text" width="50%" height={18} sx={{ mt: 1 }} />
                  </Box>
                </Paper>
              ))
            ) : (
              pinnedPosts.map((post) => (
                <Paper
                  key={post.postId}
                  elevation={0}
                  onClick={() => navigate(`/post/${post.postId}`)}
                  sx={{
                    minWidth: { xs: 260, sm: 280 },
                    width: { xs: 260, sm: 280 },
                    flexShrink: 0,
                    scrollSnapAlign: 'start',
                    cursor: 'pointer',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  {post.postImage ? (
                    <Box
                      sx={{
                        height: 140,
                        backgroundImage: `url(${post.postImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                      }}
                    >
                      <Chip
                        label={post.major === 'korea' ? 'Korean' : 'English'}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 22,
                        }}
                      />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        height: 140,
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      <PinIcon sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.2) }} />
                      <Chip
                        label={post.major === 'korea' ? 'Korean' : 'English'}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 22,
                        }}
                      />
                    </Box>
                  )}
                  <Box sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.4,
                        minHeight: 38,
                      }}
                    >
                      {post.blogTitle || post.body}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.5 }}>
                      <Avatar src={post.userImage} sx={{ width: 22, height: 22 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {post.userName}
                      </Typography>
                    </Stack>
                  </Box>
                </Paper>
              ))
            )}
          </ScrollCarousel>
        </Box>
      )}

      {/* 5. Download Our Apps Section */}
      {(loadingApps || apps.length > 0) && (
        <Box sx={{ mb: 5, px: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Download Our Apps
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Learn on the go with our mobile apps
              </Typography>
            </Box>
            <PhoneIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          </Box>

          <ScrollCarousel itemCount={loadingApps ? 4 : apps.length}>
            {loadingApps ? (
              [...Array(4)].map((_, i) => (
                <Paper
                  key={i}
                  sx={{
                    minWidth: { xs: 260, sm: 280 },
                    maxWidth: 300,
                    flexShrink: 0,
                    scrollSnapAlign: 'start',
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  }}
                >
                  <Skeleton variant="rectangular" height={140} />
                  <Box sx={{ p: 2 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                      <Skeleton variant="rounded" width={44} height={44} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width="70%" height={20} />
                        <Skeleton width="40%" height={16} />
                      </Box>
                    </Stack>
                    <Skeleton width="100%" height={16} />
                    <Skeleton width="80%" height={16} />
                    <Skeleton variant="rounded" width="100%" height={36} sx={{ mt: 1.5 }} />
                  </Box>
                </Paper>
              ))
            ) : (
              apps.map((app) => (
                <Paper
                  key={app.id}
                  onClick={() => window.open(app.url, '_blank')}
                  sx={{
                    minWidth: { xs: 260, sm: 280 },
                    maxWidth: 300,
                    flexShrink: 0,
                    scrollSnapAlign: 'start',
                    borderRadius: 3,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  {/* Cover Image */}
                  <Box
                    sx={{
                      height: 140,
                      background: app.cover
                        ? `url(${app.cover}) center/cover no-repeat`
                        : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      position: 'relative',
                    }}
                  >
                    {/* Active courses badge */}
                    <Chip
                      size="small"
                      label={`${app.activeCourse} Courses`}
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        bgcolor: 'rgba(255,255,255,0.92)',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 24,
                      }}
                    />
                  </Box>

                  <Box sx={{ p: 2 }}>
                    {/* App Icon + Name */}
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                      <Avatar
                        src={app.icon}
                        variant="rounded"
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <PhoneIcon fontSize="small" />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                          {app.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {app.major === 'english' ? '🇬🇧 English' : app.major === 'korean' ? '🇰🇷 Korean' : app.major}
                          {app.studentLearning && ` · ${app.studentLearning} learners`}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.5,
                        minHeight: 42,
                      }}
                    >
                      {app.description}
                    </Typography>

                    {/* Download Button */}
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<DownloadIcon />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        py: 0.8,
                        boxShadow: 'none',
                        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
                      }}
                    >
                      Get on Play Store
                    </Button>
                  </Box>
                </Paper>
              ))
            )}
          </ScrollCarousel>
        </Box>
      )}
    </Box>
  );
};

export default Home;
