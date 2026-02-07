import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Skeleton,
  Stack,
  Breadcrumbs,
  Link,
  alpha,
  useTheme,
} from '@mui/material';
import {
  East as ArrowIcon,
  AutoStories as BookIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { additionalLessonsAPI } from '../services/api';

// Category Card Component - Clean minimal design with 1:1 image ratio
const CategoryCard = ({ category, onClick }) => {
  const theme = useTheme();
  
  return (
    <Card
      elevation={0}
      sx={{
        width: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: 'none',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 28px rgba(0,0,0,0.1)',
          '& .card-arrow': {
            transform: 'translateX(4px)',
          },
          '& .card-image': {
            transform: 'scale(1.03)',
          },
        },
      }}
      onClick={onClick}
    >
      {/* 1:1 aspect ratio image container */}
      <Box 
        sx={{ 
          position: 'relative',
          width: '100%',
          paddingTop: '100%', // 1:1 aspect ratio
          overflow: 'hidden',
        }}
      >
        <CardMedia
          component="img"
          image={category.image_url || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400'}
          alt={category.category_title}
          className="card-image"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400';
          }}
        />
      </Box>
      <CardContent sx={{ p: 1.5 }}>
        <Typography
          variant="subtitle2"
          fontWeight={600}
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.3,
            fontSize: 13,
            minHeight: 34,
          }}
        >
          {category.category_title}
        </Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
            Start learning
          </Typography>
          <ArrowIcon 
            className="card-arrow"
            sx={{ 
              fontSize: 12, 
              color: 'text.secondary',
              transition: 'transform 0.2s ease',
            }} 
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

// Course Section Component
const CourseSection = ({ course, onCategoryClick }) => {
  if (!course.categories || course.categories.length === 0) {
    return null;
  }
  
  return (
    <Box sx={{ mb: 5 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
        {course.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        {course.categories.length} {course.categories.length === 1 ? 'topic' : 'topics'}
      </Typography>
      
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2,
        }}
      >
        {course.categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onClick={() => onCategoryClick(category.id)}
          />
        ))}
      </Box>
    </Box>
  );
};

// Loading Skeleton
const LoadingSkeleton = () => (
  <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
    <Skeleton variant="text" width={250} height={36} sx={{ mb: 1 }} />
    <Skeleton variant="text" width={180} height={24} sx={{ mb: 4 }} />
    
    {[1, 2].map((i) => (
      <Box key={i} sx={{ mb: 5 }}>
        <Skeleton variant="text" width={150} height={28} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width={80} height={20} sx={{ mb: 2.5 }} />
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}
        >
          {[1, 2, 3, 4].map((j) => (
            <Box key={j}>
              <Skeleton variant="rounded" sx={{ width: '100%', paddingTop: '100%', borderRadius: 2 }} />
              <Skeleton variant="text" width="80%" height={20} sx={{ mt: 1 }} />
              <Skeleton variant="text" width="50%" height={16} />
            </Box>
          ))}
        </Box>
      </Box>
    ))}
  </Container>
);

// Empty State
const EmptyState = () => (
  <Box sx={{ textAlign: 'center', py: 10 }}>
    <BookIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
    <Typography variant="h6" color="text.secondary" gutterBottom>
      No content available
    </Typography>
    <Typography variant="body2" color="text.disabled">
      Check back later for new materials
    </Typography>
  </Box>
);

const AdditionalLessons = () => {
  const { channel = 'english' } = useParams();
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const channelLabel = channel === 'korea' ? 'Korean' : 'English';
  const totalCategories = courses.reduce((sum, course) => sum + (course.categories?.length || 0), 0);
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await additionalLessonsAPI.getCourses(channel);
        setCourses(response.data.courses || []);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [channel]);
  
  const handleCategoryClick = (categoryId) => {
    navigate(`/additional-lessons/${channel}/category/${categoryId}`);
  };
  
  if (loading) {
    return <LoadingSkeleton />;
  }
  
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            color="inherit"
            href="/"
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Home
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <BookIcon sx={{ mr: 0.5 }} fontSize="small" />
            Additional Lessons
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Additional Lessons
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {channelLabel} supplementary materials · {totalCategories} topics available
          </Typography>
        </Box>
        
        {/* Content */}
        {error || courses.length === 0 ? (
          <EmptyState />
        ) : (
          courses.map((course) => (
            <CourseSection
              key={course.course_id}
              course={course}
              onCategoryClick={handleCategoryClick}
            />
          ))
        )}
      </Container>
    </Box>
  );
};

export default AdditionalLessons;
