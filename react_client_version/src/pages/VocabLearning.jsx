import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vocabLearningAPI } from '../services/api';
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
  School as SchoolIcon,
  Home as HomeIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { DeckCard, DeckCardSkeleton, ResponsiveGrid } from '../components/DeckCard/DeckCard';

const majors = [
  { value: 'all', label: 'All Decks' },
  { value: 'english', label: 'English' },
  { value: 'korea', label: 'Korean' },
];

export default function VocabLearning() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [decks, setDecks] = useState([]);
  const [filteredDecks, setFilteredDecks] = useState([]);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [selectedMajor, setSelectedMajor] = useState('all');

  useEffect(() => {
    if (!authLoading) {
      loadDecks();
    }
  }, [authLoading, user]);

  useEffect(() => {
    let result = [...decks];
    if (selectedMajor !== 'all') {
      result = result.filter((deck) => deck.major?.toLowerCase() === selectedMajor.toLowerCase());
    }
    setFilteredDecks(result);
  }, [decks, selectedMajor]);

  const loadDecks = async () => {
    try {
      setLoadingDecks(true);
      const response = await vocabLearningAPI.getDecks(null, null, user?.id);
      setDecks(response.decks || []);
    } catch (error) {
      console.error('Failed to load decks:', error);
      setDecks([]);
    } finally {
      setLoadingDecks(false);
    }
  };

  const handleMajorChange = (event, newValue) => {
    setSelectedMajor(newValue);
  };

  const handleDeckClick = (deck) => {
    navigate(`/vocab-learning/learn/${deck.id}`, { state: { deck } });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/" underline="hover" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} color="inherit">
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Home
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <MenuBookIcon sx={{ mr: 0.5 }} fontSize="small" />
            Vocab Learning
          </Typography>
        </Breadcrumbs>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Vocab Learning
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Practice vocabulary with spaced repetition flashcards. Choose a deck to start.
          </Typography>
        </Box>

        <Box sx={{ mb: 4, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tabs
            value={selectedMajor}
            onChange={handleMajorChange}
            sx={{
              minHeight: 40,
              '& .MuiTabs-indicator': { height: 2.5, borderRadius: '2px 2px 0 0' },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                minHeight: 40,
                px: 2.5,
                color: 'text.secondary',
                '&.Mui-selected': { color: 'primary.main' },
              },
            }}
          >
            {majors.map((major) => (
              <Tab key={major.value} label={major.label} value={major.value} />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {filteredDecks.length} {filteredDecks.length === 1 ? 'deck' : 'decks'} available
          </Typography>
        </Box>

        {loadingDecks ? (
          <ResponsiveGrid>
            {[1, 2, 3, 4].map((i) => (
              <DeckCardSkeleton key={i} />
            ))}
          </ResponsiveGrid>
        ) : filteredDecks.length > 0 ? (
          <Fade in timeout={500}>
            <Box>
              <ResponsiveGrid>
                {filteredDecks.map((deck) => (
                  <DeckCard
                    key={deck.id}
                    deck={deck}
                    languageName={deck.language_name || deck.major}
                    onClick={handleDeckClick}
                  />
                ))}
              </ResponsiveGrid>
            </Box>
          </Fade>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
            <SchoolIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
            <Typography variant="h6" gutterBottom>No decks available</Typography>
            <Typography variant="body2">
              {selectedMajor === 'all'
                ? 'There are no vocabulary decks available at the moment.'
                : `No ${majors.find((m) => m.value === selectedMajor)?.label.toLowerCase()} decks available.`}
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
