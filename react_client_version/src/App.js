import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { Layout } from './components/Layout';
import { Home, InstructorProfile, Explore, CourseDetail, VideoChannel, WatchVideo } from './pages';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/instructor/:id" element={<InstructorProfile />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            {/* Add more routes as we build the app */}
            <Route path="/explore" element={<Explore />} />
            <Route path="/vocab-learning" element={<PlaceholderPage title="Vocab Learning" />} />
            <Route path="/my-learning" element={<PlaceholderPage title="My Learning" />} />
            <Route path="/additional-lessons/:channel" element={<PlaceholderPage title="Additional Lessons" />} />
            <Route path="/video-channel/:channel" element={<VideoChannel />} />
            <Route path="/watch" element={<WatchVideo />} />
            <Route path="/discussion/:channel" element={<PlaceholderPage title="Discussion" />} />
            <Route path="/songs/:channel" element={<PlaceholderPage title="Songs with Lyrics" />} />
            <Route path="/admin-team/:team" element={<PlaceholderPage title="Admin Team" />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
            <Route path="/vip-plan" element={<PlaceholderPage title="VIP Plan" />} />
            <Route path="/about" element={<PlaceholderPage title="About Us" />} />
            <Route path="/contact" element={<PlaceholderPage title="Contact Us" />} />
            <Route path="/terms" element={<PlaceholderPage title="Terms" />} />
            <Route path="/privacy" element={<PlaceholderPage title="Privacy" />} />
            <Route path="/login" element={<PlaceholderPage title="Login" />} />
            <Route path="/profile" element={<PlaceholderPage title="Profile" />} />
          </Routes>
        </Layout>
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
