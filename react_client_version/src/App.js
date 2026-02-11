import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { Layout } from './components/Layout';
import { DrawerProvider } from './context/DrawerContext';
import { AuthProvider } from './context/AuthContext';
import { Home, InstructorProfile, Explore, CourseDetail, VideoChannel, WatchVideo, SongWithLyrics, Discussion, PostDetail, AdditionalLessons, LessonList, AdditionalLessonPlay, VipPlan, Login, Profile, EditProfile, MyLearning, LessonPlay, VocabLearning, VocabLearn } from './pages';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
        <DrawerProvider>
        <Routes>
          {/* Login/Register - outside Layout (no navbar/sidebar) */}
          <Route path="/login" element={<Login />} />

          {/* All other routes - inside Layout */}
          <Route path="*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/instructor/:id" element={<InstructorProfile />} />
                <Route path="/course/:id" element={<CourseDetail />} />
                <Route path="/course/:courseId/lesson/:lessonId" element={<LessonPlay />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/vocab-learning" element={<VocabLearning />} />
                <Route path="/vocab-learning/learn/:deckId" element={<VocabLearn />} />
                <Route path="/my-learning" element={<MyLearning />} />
                <Route path="/additional-lessons/:channel" element={<AdditionalLessons />} />
                <Route path="/additional-lessons/:channel/category/:categoryId" element={<LessonList />} />
                <Route path="/additional-lessons/:channel/category/:categoryId/lesson/:lessonId" element={<AdditionalLessonPlay />} />
                <Route path="/video-channel/:channel" element={<VideoChannel />} />
                <Route path="/watch/:id" element={<WatchVideo />} />
                <Route path="/discussion/:category" element={<Discussion />} />
                <Route path="/post/:postId" element={<PostDetail />} />
                <Route path="/songs/:category" element={<SongWithLyrics />} />
                <Route path="/admin-team/:team" element={<PlaceholderPage title="Admin Team" />} />
                <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
                <Route path="/vip-plan" element={<VipPlan />} />
                <Route path="/about" element={<PlaceholderPage title="About Us" />} />
                <Route path="/contact" element={<PlaceholderPage title="Contact Us" />} />
                <Route path="/terms" element={<PlaceholderPage title="Terms" />} />
                <Route path="/privacy" element={<PlaceholderPage title="Privacy" />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/edit" element={<EditProfile />} />
                <Route path="/profile/:userId" element={<Profile />} />
              </Routes>
            </Layout>
          } />
        </Routes>
        </DrawerProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

// Temporary placeholder component for routes not yet implemented
function PlaceholderPage({ title }) {
  return (
    <div style={{ padding: '20px' }}>
      <h1>{title}</h1>
      <p>This page is coming soon...</p>
    </div>
  );
}

export default App;
