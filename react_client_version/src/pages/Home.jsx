import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  Button,
  Stack,
  Chip,
  Avatar,
  AvatarGroup,
  Skeleton,
  IconButton,
  Rating,
} from '@mui/material';
import { 
  School as SchoolIcon,
  PlayCircleOutline as PlayIcon,
  MenuBook as BookIcon,
  Translate as TranslateIcon,
  EmojiEvents as TrophyIcon,
  ArrowForward as ArrowIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  PlayLesson as LessonIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from '@mui/icons-material';
import { courseAPI } from '../services/api';

// Responsive grid container that adapts to actual container width (not viewport)
const ResponsiveGrid = ({ children, minCardWidth = 220 }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`,
      gap: 3,
    }}
  >
    {children}
  </Box>
);

// Professional Course Card Component
const CourseCard = ({ course, onBookmark }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const handleBookmark = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    onBookmark?.(course.id, !isBookmarked);
  };

  // Get category color and label
  const getCategoryInfo = (major) => {
    switch (major?.toLowerCase()) {
      case 'english':
        return { color: '#2e7d32', bgColor: '#e8f5e9', label: 'English' };
      case 'korea':
      case 'korean':
        return { color: '#d32f2f', bgColor: '#ffebee', label: 'Korean' };
      default:
        return { color: '#1976d2', bgColor: '#e3f2fd', label: major || 'Course' };
    }
  };

  const categoryInfo = getCategoryInfo(course.major);
  
  // Format fee display
  const formatFee = (fee) => {
    if (!fee || fee === 0) return 'Free';
    return `${fee.toLocaleString()} MMK`;
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer', 
        transition: 'all 0.3s ease',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': { 
          transform: 'translateY(-8px)', 
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          borderColor: 'primary.light',
        } 
      }}
    >
      {/* Course Image - 16:9 Aspect Ratio */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="div"
          sx={{
            aspectRatio: '16/9',
            backgroundColor: course.backgroundColor || categoryInfo.color,
            backgroundImage: course.webCover ? `url(${course.webCover})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!course.webCover && (
            <SchoolIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.3)' }} />
          )}
        </CardMedia>
        
        {/* Category Badge */}
        <Chip
          label={categoryInfo.label}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            backgroundColor: 'rgba(255,255,255,0.95)',
            color: categoryInfo.color,
            fontWeight: 600,
            fontSize: '0.7rem',
            height: 24,
          }}
        />
        
        {/* Bookmark Button */}
        <IconButton
          onClick={handleBookmark}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255,255,255,0.9)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,1)',
            },
          }}
          size="small"
        >
          {isBookmarked ? (
            <BookmarkIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          ) : (
            <BookmarkBorderIcon sx={{ fontSize: 20 }} />
          )}
        </IconButton>

        {/* Fee Badge */}
        {course.fee > 0 && (
          <Chip
            label={formatFee(course.fee)}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              backgroundColor: 'primary.main',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        )}
        {course.fee === 0 && (
          <Chip
            label="Free"
            size="small"
            sx={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              backgroundColor: '#4caf50',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        )}
      </Box>

      {/* Course Content */}
      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        {/* Title */}
        <Typography 
          variant="subtitle1" 
          fontWeight={700} 
          sx={{ 
            mb: 1,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {course.title}
        </Typography>

        {/* Instructor */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <Avatar 
            sx={{ 
              width: 24, 
              height: 24, 
              bgcolor: categoryInfo.color,
              fontSize: '0.75rem',
            }}
          >
            {course.instructor?.charAt(0) || 'I'}
          </Avatar>
          <Typography variant="body2" color="text.secondary" noWrap>
            {course.instructor || 'Instructor'}
          </Typography>
        </Stack>

        {/* Rating */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <Rating 
            value={course.rating || 0} 
            precision={0.5} 
            size="small" 
            readOnly 
            sx={{
              '& .MuiRating-iconFilled': {
                color: '#ffc107',
              },
            }}
          />
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {course.rating?.toFixed(1) || '0.0'}
          </Typography>
          {course.enrolledStudents > 0 && (
            <Typography variant="caption" color="text.secondary">
              ({course.enrolledStudents.toLocaleString()})
            </Typography>
          )}
        </Stack>

        {/* Course Meta */}
        <Stack direction="row" spacing={2} sx={{ mt: 'auto' }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <LessonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {course.lessonsCount || 0} lessons
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {course.duration || 0} days
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Course Card Skeleton for loading state
const CourseCardSkeleton = () => (
  <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
    <Skeleton variant="rectangular" sx={{ aspectRatio: '16/9' }} />
    <CardContent sx={{ p: 2.5 }}>
      <Skeleton variant="text" height={28} width="90%" />
      <Skeleton variant="text" height={20} width="60%" sx={{ mb: 1 }} />
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="text" width={100} />
      </Stack>
      <Skeleton variant="text" width="80%" />
      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
        <Skeleton variant="text" width={70} />
        <Skeleton variant="text" width={70} />
      </Stack>
    </CardContent>
  </Card>
);

// Feature card for hero section
const FeatureCard = ({ icon, title, description }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 2,
      p: 2,
      borderRadius: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      transition: 'transform 0.2s, background-color 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
      },
    }}
  >
    <Box
      sx={{
        p: 1,
        borderRadius: 1.5,
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

// Hero Section Component
const HeroSection = () => (
  <Box
    sx={{
      position: 'relative',
      borderRadius: 4,
      overflow: 'hidden',
      mb: 5,
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
        label="Top Rated Language Platform"
        size="small"
        sx={{
          mb: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          color: 'white',
          fontWeight: 500,
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
            Master English & Korean
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
              The Smart Way
            </Box>
          </Typography>

          <Typography
            variant="body1"
            color="rgba(255, 255, 255, 0.9)"
            sx={{ mb: 4, maxWidth: 480, lineHeight: 1.7 }}
          >
            Join thousands of learners achieving fluency through our interactive courses, 
            vocabulary training, and expert-led lessons. Start your language journey today.
          </Typography>

          {/* CTA Buttons */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowIcon />}
              sx={{
                backgroundColor: 'white',
                color: 'primary.dark',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Start Learning Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<PlayIcon />}
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
              Watch Demo
            </Button>
          </Stack>

          {/* Social Proof */}
          <Stack direction="row" spacing={2} alignItems="center">
            <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 36, height: 36, border: '2px solid #2e7d32' } }}>
              <Avatar sx={{ bgcolor: '#1976d2' }}>A</Avatar>
              <Avatar sx={{ bgcolor: '#d32f2f' }}>B</Avatar>
              <Avatar sx={{ bgcolor: '#ed6c02' }}>C</Avatar>
              <Avatar sx={{ bgcolor: '#9c27b0' }}>D</Avatar>
              <Avatar sx={{ bgcolor: '#0288d1' }}>E</Avatar>
            </AvatarGroup>
            <Box>
              <Typography variant="body2" color="white" fontWeight={600}>
                10,000+ Active Learners
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} sx={{ fontSize: 14, color: '#ffc107' }} />
                ))}
                <Typography variant="caption" color="rgba(255,255,255,0.8)" sx={{ ml: 0.5 }}>
                  4.9/5 Rating
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
              title="Dual Language Learning"
              description="Master both English and Korean simultaneously"
            />
            <FeatureCard
              icon={<BookIcon sx={{ color: 'white', fontSize: 24 }} />}
              title="Interactive Vocabulary"
              description="Smart flashcards and spaced repetition"
            />
            <FeatureCard
              icon={<TrophyIcon sx={{ color: 'white', fontSize: 24 }} />}
              title="Gamified Progress"
              description="Earn rewards as you advance"
            />
          </Stack>

          {/* Stats Row */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 2,
              p: 3,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <StatItem value="500+" label="Courses" />
            <StatItem value="50+" label="Instructors" />
            <StatItem value="98%" label="Success Rate" />
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

const Home = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [newCourses, setNewCourses] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);
  const [error, setError] = useState(null);

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

  const handleBookmark = (courseId, isBookmarked) => {
    console.log(`Course ${courseId} bookmark: ${isBookmarked}`);
    // TODO: Implement bookmark API call
  };

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Courses Section */}
      <Box sx={{ mb: 5 }}>
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
            sx={{ fontWeight: 600 }}
          >
            See all
          </Button>
        </Box>
        
        <ResponsiveGrid minCardWidth={280}>
          {loadingFeatured ? (
            // Show skeletons while loading
            [...Array(4)].map((_, index) => (
              <CourseCardSkeleton key={index} />
            ))
          ) : featuredCourses.length > 0 ? (
            // Show actual courses
            featuredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onBookmark={handleBookmark}
              />
            ))
          ) : (
            // Show empty state
            <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No featured courses available
              </Typography>
            </Box>
          )}
        </ResponsiveGrid>
      </Box>

      {/* Newest Courses Section */}
      <Box sx={{ mb: 5 }}>
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
            sx={{ fontWeight: 600 }}
          >
            See all
          </Button>
        </Box>
        
        <ResponsiveGrid minCardWidth={280}>
          {loadingNew ? (
            // Show skeletons while loading
            [...Array(4)].map((_, index) => (
              <CourseCardSkeleton key={index} />
            ))
          ) : newCourses.length > 0 ? (
            // Show actual courses
            newCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onBookmark={handleBookmark}
              />
            ))
          ) : (
            // Show empty state
            <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No new courses available
              </Typography>
            </Box>
          )}
        </ResponsiveGrid>
      </Box>
    </Box>
  );
};

export default Home;
