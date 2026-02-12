import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Fade,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Home as HomeIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { courseAPI } from '../services/api';
import { CourseCard, CourseCardSkeleton, ResponsiveGrid } from '../components/CourseCard';

// Category configuration
const categories = [
  { value: 'all', label: 'All Courses' },
  { value: 'english', label: 'English' },
  { value: 'korea', label: 'Korean' },
];

// Main Explore Page Component
const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const searchQuery = searchParams.get('q') || '';

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await courseAPI.getAll();
        setCourses(response.data || []);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses by category and search query
  useEffect(() => {
    let result = [...courses];

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(
        (course) => course.major?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (course) =>
          course.title?.toLowerCase().includes(query) ||
          course.description?.toLowerCase().includes(query) ||
          course.instructor_name?.toLowerCase().includes(query)
      );
    }

    // Sort by newest
    result.sort((a, b) => b.id - a.id);

    setFilteredCourses(result);
  }, [courses, selectedCategory, searchQuery]);

  // Update URL params when category changes
  useEffect(() => {
    if (selectedCategory === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', selectedCategory);
    }
    setSearchParams(searchParams);
  }, [selectedCategory, searchParams, setSearchParams]);

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

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
            <SchoolIcon sx={{ mr: 0.5 }} fontSize="small" />
            Explore Courses
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Explore Courses
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover our collection of English and Korean language courses
          </Typography>
        </Box>

        {/* Category Tabs */}
        <Box sx={{ mb: 4, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            sx={{
              minHeight: 40,
              '& .MuiTabs-indicator': {
                height: 2.5,
                borderRadius: '2px 2px 0 0',
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                minHeight: 40,
                px: 2.5,
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
            }}
          >
            {categories.map((cat) => (
              <Tab
                key={cat.value}
                value={cat.value}
                label={cat.label}
              />
            ))}
          </Tabs>
        </Box>

        {/* Results Count */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {searchQuery ? (
              <>
                Search results for "<strong>{searchQuery}</strong>": <strong>{filteredCourses.length}</strong> courses found
              </>
            ) : (
              <>
                Showing <strong>{filteredCourses.length}</strong> courses
              </>
            )}
            {selectedCategory !== 'all' && (
              <> in <strong>{categories.find((c) => c.value === selectedCategory)?.label}</strong></>
            )}
          </Typography>
        </Box>

        {/* Courses Grid */}
        {loading ? (
          <ResponsiveGrid>
            {[...Array(8)].map((_, index) => (
              <CourseCardSkeleton key={index} />
            ))}
          </ResponsiveGrid>
        ) : filteredCourses.length > 0 ? (
          <Fade in timeout={500}>
            <Box>
              <ResponsiveGrid>
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </ResponsiveGrid>
            </Box>
          </Fade>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}
          >
            <SchoolIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {searchQuery ? 'No results found' : 'No courses found'}
            </Typography>
            <Typography variant="body1" color="text.disabled">
              {searchQuery 
                ? `We couldn't find any courses matching "${searchQuery}". Try a different keyword.`
                : 'No courses available in this category yet.'}
            </Typography>
          </Box>
        )}

        {/* Bottom spacing */}
        <Box sx={{ pb: 4 }} />
      </Container>
    </Box>
  );
};

export default Explore;
