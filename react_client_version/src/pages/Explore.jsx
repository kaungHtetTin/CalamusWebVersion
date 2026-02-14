import React, { useState, useEffect } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Stack,
  Typography,
  Tabs,
  Tab,
  Fade,
  Breadcrumbs,
  Link,
  TextField,
  InputAdornment,
  Paper,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Home as HomeIcon,
  School as SchoolIcon,
  ChevronRight as ChevronRightIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { courseAPI } from '../services/api';
import { CourseCard, CourseCardSkeleton, ResponsiveGrid } from '../components/CourseCard';

const categories = [
  { value: 'all', label: 'All Courses' },
  { value: 'english', label: 'English' },
  { value: 'korea', label: 'Korean' },
];

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const selectedCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await courseAPI.getAll();
        setCourses(response.data || []);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    let result = [...courses];
    if (selectedCategory !== 'all') {
      result = result.filter(c => c.major?.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.title?.toLowerCase().includes(q) || 
        c.instructor_name?.toLowerCase().includes(q)
      );
    }
    setFilteredCourses(result.sort((a, b) => b.id - a.id));
  }, [courses, selectedCategory, searchQuery]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    if (val) searchParams.set('q', val);
    else searchParams.delete('q');
    setSearchParams(searchParams);
  };

  const handleCategoryChange = (event, newValue) => {
    if (newValue === 'all') searchParams.delete('category');
    else searchParams.set('category', newValue);
    setSearchParams(searchParams);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 8 }}>
      {/* HEADER SECTION */}
      <Paper elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 4, bgcolor: 'background.paper' }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Breadcrumbs separator={<ChevronRightIcon sx={{ fontSize: 16 }} />} sx={{ mb: 2 }}>
            <Link component={RouterLink} to="/" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
              <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} /> Home
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', fontWeight: 600 }}>
              Explore
            </Typography>
          </Breadcrumbs>

          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={3}>
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>Explore Courses</Typography>
              <Typography variant="body1" color="text.secondary">Master a new language with expert-led courses.</Typography>
            </Box>
            
            <TextField
              placeholder="Search courses..."
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ width: { xs: '100%', md: 350 }, bgcolor: 'background.paper' }}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>),
                endAdornment: searchQuery && (
                  <IconButton size="small" onClick={() => { searchParams.delete('q'); setSearchParams(searchParams); }}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )
              }}
            />
          </Stack>
        </Container>
      </Paper>

      {/* CONTENT SECTION */}
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          
          {/* SIDEBAR FILTERS */}
          <Box sx={{ width: { xs: '100%', md: 240 }, flexShrink: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', textTransform: 'uppercase', letterSpacing: 1 }}>
              <FilterIcon sx={{ mr: 1, fontSize: 18 }} /> Categories
            </Typography>
            <Tabs
              orientation={{ xs: 'horizontal', md: 'vertical' }}
              variant="scrollable"
              value={selectedCategory}
              onChange={handleCategoryChange}
              sx={{
                '& .MuiTabs-indicator': { display: { xs: 'block', md: 'none' } },
                '& .MuiTab-root': { 
                  alignItems: 'flex-start', 
                  textAlign: 'left',
                  fontWeight: 600,
                  borderRadius: 1,
                  mb: { md: 0.5 },
                  minHeight: 44,
                  '&.Mui-selected': { bgcolor: { md: 'primary.light' }, color: { md: 'primary.dark' } }
                }
              }}
            >
              {categories.map((cat) => (
                <Tab key={cat.value} value={cat.value} label={cat.label} disableRipple />
              ))}
            </Tabs>
            <Divider sx={{ my: 3, display: { xs: 'none', md: 'block' } }} />
          </Box>

          {/* MAIN GRID */}
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Showing <b>{filteredCourses.length}</b> courses 
                {searchQuery && <> for "<b>{searchQuery}</b>"</>}
              </Typography>
            </Box>

            {loading ? (
              <ResponsiveGrid>
                {[...Array(6)].map((_, i) => <CourseCardSkeleton key={i} />)}
              </ResponsiveGrid>
            ) : filteredCourses.length > 0 ? (
              <Fade in timeout={600}>
                <Box>
                  <ResponsiveGrid>
                    {filteredCourses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </ResponsiveGrid>
                </Box>
              </Fade>
            ) : (
              <Paper sx={{ textAlign: 'center', py: 10, px: 2, borderRadius: 3, bgcolor: 'transparent' }} variant="outlined">
                <SchoolIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6">No courses found</Typography>
                <Typography variant="body2" color="text.secondary">Try adjusting your filters or search terms.</Typography>
              </Paper>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Explore;