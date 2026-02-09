import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import {
  Box,
  Container,
  Typography,
  LinearProgress,
  Button,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import { Home as HomeIcon, School as SchoolIcon, Lock as LockIcon, LockOpen as LockOpenIcon } from '@mui/icons-material';
import { CourseCard, CourseCardSkeleton, ResponsiveGrid } from '../components/CourseCard';

export default function MyLearning() {
  const { user, loading, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [freeCourses, setFreeCourses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0 = All, 1 = Purchased, 2 = Free

  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      try {
        // fetch enrolled courses (requires auth)
        const resp = await userAPI.getMyLearning();
        const data = resp.data || [];
        const purchased = resp.purchased || [];
        const free = resp.free || [];
        
        setCourses(data);
        setPurchasedCourses(purchased);
        setFreeCourses(free);
      } catch (err) {
        console.error('Failed to load my learning', err);
        setCourses([]);
        setPurchasedCourses([]);
        setFreeCourses([]);
      } finally {
        setLoadingData(false);
      }
    };

    if (!loading && isAuthenticated) {
      load();
    }
  }, [loading, isAuthenticated]);

  // Get courses to display based on active tab
  const getDisplayCourses = () => {
    switch (activeTab) {
      case 1:
        return purchasedCourses;
      case 2:
        return freeCourses;
      default:
        return courses;
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Checking authentication...</div>;
  if (!isAuthenticated) return (
    <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" sx={{ display: 'flex', alignItems: 'center' }} color="inherit" href="/">
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" /> Home
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <SchoolIcon sx={{ mr: 0.5 }} fontSize="small" /> My Learning
        </Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>My Learning</Typography>
        <Typography variant="body1" color="text.secondary">This page is only available for signed-in users. Please <Link href="/login">log in</Link>.</Typography>
      </Box>
    </Container>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link underline="hover" sx={{ display: 'flex', alignItems: 'center' }} color="inherit" href="/">
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" /> Home
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ mr: 0.5 }} fontSize="small" /> My Learning
          </Typography>
        </Breadcrumbs>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>My Learning</Typography>
          <Typography variant="body1" color="text.secondary">Your enrolled courses and progress. <Link href="/explore">Explore more courses</Link></Typography>
        </Box>

        {/* Tabs for filtering courses */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  All Courses
                  {courses.length > 0 && (
                    <Chip label={courses.length} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                  )}
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LockIcon sx={{ fontSize: 16 }} />
                  Purchased
                  {purchasedCourses.length > 0 && (
                    <Chip label={purchasedCourses.length} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                  )}
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LockOpenIcon sx={{ fontSize: 16 }} />
                  Free
                  {freeCourses.length > 0 && (
                    <Chip label={freeCourses.length} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                  )}
                </Box>
              } 
            />
          </Tabs>
        </Box>

        {loadingData ? (
          <ResponsiveGrid>
            {[...Array(8)].map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </ResponsiveGrid>
        ) : (
          <>
            {getDisplayCourses().length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  px: 3,
                }}
              >
                <SchoolIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  {activeTab === 1 
                    ? 'No purchased courses yet' 
                    : activeTab === 2 
                    ? 'No free courses available' 
                    : 'No enrolled courses yet'}
                </Typography>
                <Typography variant="body1" color="text.disabled">
                  {activeTab === 1 ? (
                    <>Browse <Link href="/vip-plan">VIP plans</Link> to purchase courses.</>
                  ) : (
                    <>Explore available courses on the <Link href="/explore">Explore</Link> page.</>
                  )}
                </Typography>
              </Box>
            ) : (
              <ResponsiveGrid>
                {getDisplayCourses().map((c) => (
                  <Box
                    key={c.id}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <CourseCard
                      course={{
                        id: c.id,
                        title: c.title,
                        description: c.description,
                        duration: c.duration,
                        rating: c.rating,
                        webCover: c.webCover,
                        backgroundColor: c.backgroundColor,
                        fee: c.fee,
                        major: c.major,
                        lessonsCount: c.lessonsCount,
                        instructor: c.instructor,
                        instructorId: c.instructorId,
                        instructorImage: c.instructorImage,
                        enrolledStudents: c.enrolledStudents,
                      }}
                      progress={c.progress}
                    />
                  </Box>
                ))}
              </ResponsiveGrid>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
