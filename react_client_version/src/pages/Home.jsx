import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { 
  PlayCircleOutline as PlayIcon,
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
} from '@mui/icons-material';
import { courseAPI, statsAPI, pinnedPostsAPI, instructorAPI, appsAPI } from '../services/api';
import { CourseCard, CourseCardSkeleton, ResponsiveGrid } from '../components/CourseCard';

// Feature card for hero section
const FeatureCard = ({ icon, title, description }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 2,
      p: 2.5,
      borderRadius: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      transition: 'all 0.25s ease',
      '&:hover': {
        transform: 'translateY(-3px)',
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      },
    }}
  >
    <Box
      sx={{
        p: 1.5,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="subtitle2" fontWeight={600} color="white">
        {title}
      </Typography>
      <Typography variant="caption" color="rgba(255, 255, 255, 0.8)">
        {description}
      </Typography>
    </Box>
  </Box>
);

// Stat item for hero section
const StatItem = ({ value, label }) => (
  <Box sx={{ textAlign: 'center' }}>
    <Typography variant="h4" fontWeight={700} color="white">
      {value}
    </Typography>
    <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
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

// Hero Section Component - now accepts live stats
const HeroSection = ({ stats, loading }) => {
  const navigate = useNavigate();
  const { totalCourses, totalLessons, videoLessons, documentLessons, totalInstructors, totalStudents, avgRating, topInstructors } = stats;

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 4,
        overflow: 'hidden',
        mb: 5,
        boxShadow: '0 8px 32px rgba(46, 125, 50, 0.2)',
        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #43a047 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%),
            radial-gradient(circle at 40% 40%, rgba(255,255,255,0.05) 0%, transparent 30%)
          `,
          pointerEvents: 'none',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          p: { xs: 3, sm: 4, md: 5 },
        }}
      >
        {/* Top Badge */}
        <Chip
          icon={<StarIcon sx={{ fontSize: 16, color: '#ffc107 !important' }} />}
          label={avgRating > 0 ? `${avgRating}/5 Average Course Rating` : 'Top Rated Language Platform'}
          size="small"
          sx={{
            mb: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            color: 'white',
            fontWeight: 500,
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            '& .MuiChip-icon': {
              color: '#ffc107',
            },
          }}
        />

        {/* Main Content Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' },
            gap: { xs: 4, md: 6 },
            alignItems: 'center',
          }}
        >
          {/* Left Content */}
          <Box>
            <Typography
              variant="h3"
              fontWeight={800}
              color="white"
              sx={{
                mb: 2,
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                lineHeight: 1.2,
              }}
            >
              Learn Languages
              <Box
                component="span"
                sx={{
                  display: 'block',
                  background: 'linear-gradient(90deg, #fff 0%, #c8e6c9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Anytime, Anywhere
              </Box>
            </Typography>

            <Typography
              variant="body1"
              color="rgba(255, 255, 255, 0.9)"
              sx={{ mb: 4, maxWidth: 480, lineHeight: 1.7 }}
            >
              {totalStudents > 0
                ? `Join ${formatCount(totalStudents)} learners already achieving fluency. Explore ${totalCourses}+ courses with ${videoLessons}+ video lessons and ${documentLessons}+ reading materials.`
                : 'Achieve fluency through our interactive courses, vocabulary training, and expert-led video lessons. Start your language journey today.'}
            </Typography>

            {/* CTA Buttons */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowIcon />}
                onClick={() => navigate('/explore')}
                sx={{
                  backgroundColor: 'white',
                  color: 'primary.dark',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.25s ease',
                }}
              >
                Explore Courses
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<PlayIcon />}
                onClick={() => navigate('/video-channels')}
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'white',
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Free Video Lessons
              </Button>
            </Stack>

            {/* Social Proof - live instructor avatars */}
            <Stack direction="row" spacing={2} alignItems="center">
              <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 36, height: 36, border: '2px solid #2e7d32' } }}>
                {topInstructors.length > 0
                  ? topInstructors.map((inst, i) => (
                      <Avatar
                        key={inst.id}
                        src={inst.image || undefined}
                        sx={{ bgcolor: avatarColors[i % avatarColors.length] }}
                      >
                        {inst.name?.[0]?.toUpperCase()}
                      </Avatar>
                    ))
                  : avatarColors.map((color, i) => (
                      <Avatar key={i} sx={{ bgcolor: color }}>{String.fromCharCode(65 + i)}</Avatar>
                    ))
                }
              </AvatarGroup>
              <Box>
                <Typography variant="body2" color="white" fontWeight={600}>
                  {totalStudents > 0 ? `${formatCount(totalStudents)} Students Enrolled` : 'Growing Community'}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <StarRating rating={avgRating || 4.5} />
                  <Typography variant="caption" color="rgba(255,255,255,0.8)" sx={{ ml: 0.5 }}>
                    {avgRating > 0 ? `${avgRating}/5 Rating` : ''}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Box>

          {/* Right Content - Features & Stats */}
          <Box>
            {/* Feature Cards */}
            <Stack spacing={2} sx={{ mb: 4 }}>
              <FeatureCard
                icon={<TranslateIcon sx={{ color: 'white', fontSize: 24 }} />}
                title="Dual Language Courses"
                description={`${totalCourses || 'Many'} courses across English & Korean`}
              />
              <FeatureCard
                icon={<VideoIcon sx={{ color: 'white', fontSize: 24 }} />}
                title={`${videoLessons || '100'}+ Video Lessons`}
                description={documentLessons > 0 ? `Plus ${documentLessons}+ documents & reading materials` : 'Learn at your own pace with HD video'}
              />
              <FeatureCard
                icon={<TrophyIcon sx={{ color: 'white', fontSize: 24 }} />}
                title="Expert Instructors"
                description={`${totalInstructors || 'Multiple'} certified language teachers`}
              />
            </Stack>

            {/* Stats Row - live data */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 2,
                p: 3,
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
            >
              {loading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <Box key={i} sx={{ textAlign: 'center' }}>
                      <Skeleton variant="text" width={60} height={40} sx={{ mx: 'auto', bgcolor: 'rgba(255,255,255,0.15)' }} />
                      <Skeleton variant="text" width={50} height={20} sx={{ mx: 'auto', bgcolor: 'rgba(255,255,255,0.1)' }} />
                    </Box>
                  ))}
                </>
              ) : (
                <>
                  <StatItem value={videoLessons > 0 ? `${videoLessons}` : '—'} label="Videos" />
                  <StatItem value={documentLessons > 0 ? `${documentLessons}` : '—'} label="Documents" />
                  <StatItem value={totalStudents > 0 ? formatCount(totalStudents) : '—'} label="Students" />
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Decorative Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
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
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x',
          '&::-webkit-scrollbar': { display: 'none' },
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
                    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
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
                    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
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
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
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
