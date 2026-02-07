import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Chip,
  Avatar,
  Skeleton,
  IconButton,
  Rating,
  ButtonBase,
} from '@mui/material';
import {
  School as SchoolIcon,
  AccessTime as TimeIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  PlayLesson as LessonIcon,
} from '@mui/icons-material';

// Professional Course Card Component
export const CourseCard = ({ course, onBookmark }) => {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    onBookmark?.(course.id, !isBookmarked);
  };

  const handleInstructorClick = (e) => {
    e.stopPropagation();
    if (course.instructorId) {
      navigate(`/instructor/${course.instructorId}`);
    }
  };

  const handleCardClick = () => {
    navigate(`/course/${course.id}`);
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
      onClick={handleCardClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        borderRadius: 3,
        overflow: 'hidden',
        border: 'none',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
        },
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
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        />

        {/* Bookmark Button */}
        <IconButton
          onClick={handleBookmark}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255,255,255,0.95)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
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
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
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

        {/* Instructor - Clickable */}
        <ButtonBase
          onClick={handleInstructorClick}
          sx={{
            borderRadius: 2,
            p: 0.5,
            ml: -0.5,
            mb: 1,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'grey.50',
              '& .instructor-name': {
                color: 'primary.main',
              },
            },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar
              src={course.instructorImage || undefined}
              sx={{
                width: 28,
                height: 28,
                bgcolor: categoryInfo.color,
                fontSize: '0.75rem',
                border: '2px solid',
                borderColor: 'background.paper',
                boxShadow: 1,
              }}
            >
              {course.instructor?.charAt(0) || 'I'}
            </Avatar>
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              className="instructor-name"
              sx={{
                fontWeight: 500,
                transition: 'color 0.2s ease',
              }}
            >
              {course.instructor || 'Instructor'}
            </Typography>
          </Stack>
        </ButtonBase>

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
export const CourseCardSkeleton = () => (
  <Card
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 3,
      overflow: 'hidden',
      border: 'none',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    }}
  >
    <Skeleton
      variant="rectangular"
      sx={{ aspectRatio: '16/9', width: '100%' }}
    />
    <CardContent sx={{ p: 2.5 }}>
      <Skeleton variant="text" sx={{ fontSize: '1.1rem', mb: 1 }} />
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Skeleton variant="circular" width={28} height={28} />
        <Skeleton variant="text" width={80} />
      </Stack>
      <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" />
    </CardContent>
  </Card>
);

// Responsive Grid Component
export const ResponsiveGrid = ({ children }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(3, 1fr)',
        xl: 'repeat(4, 1fr)',
      },
      gap: 3,
    }}
  >
    {children}
  </Box>
);

export default CourseCard;
