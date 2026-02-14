import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ThemeModeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { DrawerProvider } from './context/DrawerContext';
import { AuthProvider } from './context/AuthContext';
import { SupportChatProvider } from './context/SupportChatContext';
import SupportChatBox from './components/SupportChatBox/SupportChatBox';
import { Home, InstructorProfile, Explore, CourseDetail, VideoChannel, WatchVideo, SongWithLyrics, Discussion, PostDetail, AdditionalLessons, LessonList, AdditionalLessonPlay, VipPlan, Login, Profile, EditProfile, MyLearning, LessonPlay, VocabLearning, VocabLearn, Chat, Notifications, Settings, Certificate, MiniLibrary, AboutUs, Terms, Privacy, Contact } from './pages';

function App() {
  return (
    <ThemeModeProvider>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <SupportChatProvider>
            <DrawerProvider>
              <Routes>
                {/* Login/Register - outside Layout (no navbar/sidebar) */}
                <Route path="/login" element={<Login />} />

                {/* Chat route - outside Layout (has its own navigation) */}
                <Route path="/chat" element={<Chat />} />

                {/* All other routes - inside Layout */}
                <Route path="*" element={
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/instructor/:id" element={<InstructorProfile />} />
                      <Route path="/course/:id" element={<CourseDetail />} />
                      <Route path="/certificate" element={<Certificate />} />
                      <Route path="/course/:courseId/lesson/:lessonId" element={<LessonPlay />} />
                      <Route path="/explore" element={<Explore />} />
                      <Route path="/vocab-learning" element={<VocabLearning />} />
                      <Route path="/vocab-learning/learn/:deckId" element={<VocabLearn />} />
                      <Route path="/my-learning" element={<MyLearning />} />
                      <Route path="/mini-library" element={<MiniLibrary />} />
                      <Route path="/additional-lessons/:channel" element={<AdditionalLessons />} />
                      <Route path="/additional-lessons/:channel/category/:categoryId" element={<LessonList />} />
                      <Route path="/additional-lessons/:channel/category/:categoryId/lesson/:lessonId" element={<AdditionalLessonPlay />} />
                      <Route path="/video-channel/:channel" element={<VideoChannel />} />
                      <Route path="/watch/:id" element={<WatchVideo />} />
                      <Route path="/discussion/:category" element={<Discussion />} />
                      <Route path="/post/:postId" element={<PostDetail />} />
                      <Route path="/songs/:category" element={<SongWithLyrics />} />
                      <Route path="/admin-team/:team" element={<PlaceholderPage title="Admin Team" />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/vip-plan" element={<VipPlan />} />
                      <Route path="/about" element={<AboutUs />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/profile/edit" element={<EditProfile />} />
                      <Route path="/profile/:userId" element={<Profile />} />
                      <Route path="/notifications" element={<Notifications />} />
                    </Routes>
                  </Layout>
                } />
              </Routes>
              {/* Floating Support Chat Box */}
              <SupportChatBox />
            </DrawerProvider>
          </SupportChatProvider>
        </AuthProvider>
      </Router>
    </ThemeModeProvider>
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
