import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vocabLearningAPI } from '../services/api';
import {
  Box,
  Container,
  Typography,
  Button,
  Fade,
  LinearProgress,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Stack,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  SkipNext as SkipNextIcon,
  Home as HomeIcon,
  MenuBook as MenuBookIcon,
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

export default function VocabLearn() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const theme = useTheme();
  const flashcardRef = useRef(null);

  const deck = location.state?.deck ?? null;

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCard, setCurrentCard] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [completedDialogOpen, setCompletedDialogOpen] = useState(false);
  const [skipDialogOpen, setSkipDialogOpen] = useState(false);
  const [sessionCardIds, setSessionCardIds] = useState([]);
  const [deckResolved, setDeckResolved] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const hasLoadedForDeckRef = useRef(false);

  const resolvedDeck = deckResolved || deck;

  useEffect(() => {
    if (authLoading || !deckId) return;
    hasLoadedForDeckRef.current = false;
    if (deck && Number(deck.id) === Number(deckId)) {
      setDeckResolved(deck);
      return;
    }
    setDeckResolved(null);
    vocabLearningAPI.getDecks(null, null, user?.id).then((res) => {
      const found = (res.decks || []).find((d) => Number(d.id) === Number(deckId));
      setDeckResolved(found || null);
    }).catch(() => setDeckResolved(null));
  }, [authLoading, deckId, deck, user?.id]);

  useEffect(() => {
    if (!resolvedDeck || !user?.id || hasLoadedForDeckRef.current) return;
    hasLoadedForDeckRef.current = true;
    startLearning(resolvedDeck);
  }, [resolvedDeck?.id, user?.id]);

  useEffect(() => {
    if (!currentCard) return;
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (!isFlipped) setIsFlipped(true);
      } else if (e.key >= '1' && e.key <= '5' && isFlipped) {
        e.preventDefault();
        handleRate(parseInt(e.key));
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, currentCard]);

  const startLearning = async (deckForLearning) => {
    const d = deckForLearning || resolvedDeck;
    if (!d || !user?.id) return;
    try {
      setIsLoading(true);
      setLoadError(null);
      const response = await vocabLearningAPI.getCards(user.id, d.language_id, d.id);
      if (response.success && response.data?.words) {
        const cardList = response.data.words;
        setCards(cardList);
        setSessionCardIds(cardList.map((c) => c.card?.id).filter(Boolean));
        setCurrentIndex(0);
        setIsFlipped(false);
        setCompletedDialogOpen(false);
        if (cardList.length > 0) {
          setCurrentCard(cardList[0]);
        } else {
          setLoadError('No cards available for this deck.');
        }
      } else {
        setLoadError(response.message || 'Failed to load cards.');
      }
    } catch (err) {
      console.error(err);
      setLoadError('Failed to start learning session.');
    } finally {
      setIsLoading(false);
    }
  };

  const flipCard = () => {
    if (!isFlipped) setIsFlipped(true);
  };

  const handleRate = async (rating) => {
    if (!currentCard || isLoading) return;
    const cardId = currentCard.card?.id;
    if (!cardId) return;
    try {
      setIsLoading(true);
      const response = await vocabLearningAPI.rateWord(user.id, cardId, rating);
      if (response.success) {
        const nextIndex = currentIndex + 1;
        if (nextIndex < cards.length) {
          setCurrentIndex(nextIndex);
          setCurrentCard(cards[nextIndex]);
          setIsFlipped(false);
        } else {
          setCompletedDialogOpen(true);
        }
      } else {
        alert(response.message || 'Failed to save rating.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save rating.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!currentCard || !resolvedDeck || isLoading) return;
    const cardId = currentCard.card?.id;
    if (!cardId) return;
    try {
      setIsLoading(true);
      const response = await vocabLearningAPI.skipWord(
        user.id,
        cardId,
        resolvedDeck.language_id,
        resolvedDeck.id,
        'already_know',
        sessionCardIds
      );
      if (response.success) {
        const nextIndex = currentIndex + 1;
        if (nextIndex < cards.length) {
          setCurrentIndex(nextIndex);
          setCurrentCard(cards[nextIndex]);
          setIsFlipped(false);
        } else {
          setCompletedDialogOpen(true);
        }
      } else {
        alert(response.message || 'Failed to skip card.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to skip card.');
    } finally {
      setIsLoading(false);
      setSkipDialogOpen(false);
    }
  };

  const handleFinish = () => {
    setCompletedDialogOpen(false);
    navigate('/vocab-learning');
  };

  const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  if (authLoading || !deckId) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user?.id) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
          <Breadcrumbs
            sx={{ mb: 3 }}
            separator={<ChevronRightIcon sx={{ fontSize: 14, opacity: 0.5 }} />}
          >
            <Link
              component={RouterLink}
              to="/"
              underline="hover"
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'text.secondary',
                fontSize: '0.8125rem',
                fontWeight: 500,
                '&:hover': { color: 'primary.main' },
              }}
            >
              <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
              Home
            </Link>
            <Link
              component={RouterLink}
              to="/vocab-learning"
              underline="hover"
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'text.secondary',
                fontSize: '0.8125rem',
                fontWeight: 500,
                '&:hover': { color: 'primary.main' },
              }}
            >
              <MenuBookIcon sx={{ mr: 0.5, fontSize: 16 }} />
              Vocab Learning
            </Link>
            <Typography
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'text.primary',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              {resolvedDeck?.title || 'Learn'}
            </Typography>
          </Breadcrumbs>

          <Box
            sx={{
              maxWidth: 440,
              mx: 'auto',
              mt: { xs: 4, sm: 6 },
              mb: 4,
              textAlign: 'center',
              px: { xs: 2.5, sm: 4 },
              py: 4,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <LockIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
            </Box>
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: 'text.primary' }}>
              Log in to practice
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
              Sign in to start this deck and save your progress. Your mastered words and learning stats will be tracked across devices.
            </Typography>
            <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" useFlexGap>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="medium"
                sx={{
                  px: 3,
                  py: 1.25,
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': { boxShadow: 'none', bgcolor: theme.palette.primary.dark },
                }}
              >
                Log in
              </Button>
              <Button
                component={RouterLink}
                to="/vocab-learning"
                variant="outlined"
                size="medium"
                startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
                sx={{
                  px: 2.5,
                  py: 1.25,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                  },
                }}
              >
                Back to Decks
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!resolvedDeck && !deck) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
          <Typography color="error">Deck not found.</Typography>
          <Button component={RouterLink} to="/vocab-learning" sx={{ mt: 2 }}>
            Back to Decks
          </Button>
        </Container>
      </Box>
    );
  }

  if (loadError && cards.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
          <Breadcrumbs
            sx={{ mb: 3 }}
            separator={<ChevronRightIcon sx={{ fontSize: 14, opacity: 0.5 }} />}
          >
            <Link
              component={RouterLink}
              to="/"
              underline="hover"
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'text.secondary',
                fontSize: '0.8125rem',
                fontWeight: 500,
                '&:hover': { color: 'primary.main' },
              }}
            >
              <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
              Home
            </Link>
            <Link
              component={RouterLink}
              to="/vocab-learning"
              underline="hover"
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'text.secondary',
                fontSize: '0.8125rem',
                fontWeight: 500,
                '&:hover': { color: 'primary.main' },
              }}
            >
              <MenuBookIcon sx={{ mr: 0.5, fontSize: 16 }} />
              Vocab Learning
            </Link>
            <Typography
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'text.primary',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              {resolvedDeck?.title || 'Learn'}
            </Typography>
          </Breadcrumbs>
          <Typography color="error">{loadError}</Typography>
          <Button component={RouterLink} to="/vocab-learning" sx={{ mt: 2 }}>Back to Decks</Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
        <Breadcrumbs
          sx={{ mb: 3 }}
          separator={<ChevronRightIcon sx={{ fontSize: 14, opacity: 0.5 }} />}
        >
          <Link
            component={RouterLink}
            to="/"
            underline="hover"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
              fontSize: '0.8125rem',
              fontWeight: 500,
              '&:hover': { color: 'primary.main' },
            }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Home
          </Link>
          <Link
            component={RouterLink}
            to="/vocab-learning"
            underline="hover"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
              fontSize: '0.8125rem',
              fontWeight: 500,
              '&:hover': { color: 'primary.main' },
            }}
          >
            <MenuBookIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Vocab Learning
          </Link>
          <Typography
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.primary',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            {resolvedDeck?.title || 'Learn'}
          </Typography>
        </Breadcrumbs>

        {currentCard && (
          <Box sx={{ maxWidth: 900, mx: 'auto' }}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 400 }}>
                  Card {currentIndex + 1} of {cards.length}
                </Typography>
                <Button size="small" variant="text" onClick={handleFinish} sx={{ fontSize: '0.75rem', minWidth: 'auto', p: 0.5 }}>
                  Finish Session
                </Button>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': { bgcolor: theme.palette.primary.main },
                }}
              />
            </Box>

            <Box ref={flashcardRef} sx={{ mb: 3, position: 'relative' }}>
              {isLoading && (
                <Box
                  sx={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    bgcolor: 'rgba(255, 255, 255, 0.9)', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', zIndex: 10, borderRadius: 2,
                  }}
                >
                  <CircularProgress size={32} sx={{ color: alpha('#000', 0.3) }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: '0.85rem' }}>Processing...</Typography>
                </Box>
              )}
              <Card
                elevation={0}
                sx={{
                  position: 'relative', width: '100%', minHeight: 450, cursor: 'default', borderRadius: 2,
                  overflow: 'hidden', bgcolor: 'background.paper',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`, boxShadow: 'none',
                }}
              >
                {!isFlipped && (
                  <Fade in={!isFlipped} timeout={300}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: { xs: 2.5, sm: 3 }, minHeight: 450 }}>
                      <Box sx={{ textAlign: 'center', width: '100%', maxWidth: 500 }}>
                        <Typography variant="h3" fontWeight={400} sx={{ mb: 1.5, color: 'text.primary', fontSize: { xs: '2rem', sm: '2.5rem' }, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                          {currentCard.card?.word || ''}
                        </Typography>
                        {!!currentCard.rich_data?.ipa && (
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'normal', mb: 2.5, fontSize: '0.9rem', fontWeight: 300 }}>
                            /{currentCard.rich_data.ipa}/
                          </Typography>
                        )}
                        <Button
                          variant="outlined"
                          onClick={flipCard}
                          sx={{ mt: 0.5, px: 3, py: 0.75, fontSize: '0.85rem', fontWeight: 500, textTransform: 'none', borderColor: theme.palette.primary.main, color: theme.palette.primary.main, '&:hover': { borderColor: theme.palette.primary.dark, bgcolor: alpha(theme.palette.primary.main, 0.08) } }}
                        >
                          Show Answer
                        </Button>
                      </Box>
                    </CardContent>
                  </Fade>
                )}
                {isFlipped && (
                  <Fade in={isFlipped} timeout={300}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', p: { xs: 2.5, sm: 3 }, minHeight: 450 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h4" fontWeight={400} sx={{ mb: 0.75, color: 'text.primary', fontSize: { xs: '1.75rem', sm: '2rem' }, letterSpacing: '-0.02em' }}>
                          {currentCard.card?.word || ''}
                        </Typography>
                        {!!currentCard.rich_data?.ipa && (
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'normal', fontSize: '0.85rem', fontWeight: 300 }}>
                            /{currentCard.rich_data.ipa}/
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
                        {(() => {
                          const translation = currentCard.rich_data?.burmese_translation || currentCard.card?.burmese_translation || '';
                          if (!translation) return null;
                          return (
                            <Box sx={{ p: 1.5, mb: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), borderLeft: `3px solid ${theme.palette.primary.main}`, borderRadius: 0 }}>
                              <Typography variant="h6" fontWeight={400} sx={{ color: 'text.primary', lineHeight: 1.5, fontSize: '1.1rem' }}>{translation}</Typography>
                            </Box>
                          );
                        })()}
                        {(currentCard.rich_data?.example_sentences || currentCard.card?.example_sentences) && (
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="caption" fontWeight={500} sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Examples</Typography>
                            {(() => {
                              let examples = currentCard.rich_data?.example_sentences || currentCard.card?.example_sentences;
                              const renderExample = (ex, idx) => ex ? (
                                <Box key={idx} sx={{ mb: 1, p: 1.25, borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.3)}` }}>
                                  <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.5, fontSize: '0.9rem' }}>{ex}</Typography>
                                </Box>
                              ) : null;
                              if (Array.isArray(examples)) return examples.map(renderExample);
                              if (typeof examples === 'string') {
                                try {
                                  const parsed = JSON.parse(examples);
                                  if (Array.isArray(parsed)) return parsed.map(renderExample);
                                } catch (e) {}
                                return renderExample(examples, 0);
                              }
                              return null;
                            })()}
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ pt: 2, mt: 1.5, borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
                        <Typography variant="caption" fontWeight={500} sx={{ mb: 2.5, textAlign: 'center', color: theme.palette.primary.main, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
                          How well did you know this?
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mb: 1.5 }}>
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Button
                              key={rating}
                              variant="outlined"
                              onClick={() => handleRate(rating)}
                              disabled={isLoading}
                              sx={{ minWidth: 40, width: 40, height: 40, borderRadius: '50%', borderColor: alpha(theme.palette.primary.main, 0.3), color: theme.palette.primary.main, fontWeight: 500, fontSize: '0.95rem', p: 0, '&:hover': { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.dark }, '&:disabled': { borderColor: alpha('#000', 0.05), color: alpha('#000', 0.3) } }}
                              title={rating === 1 ? 'Complete blackout' : rating === 2 ? 'Incorrect response' : rating === 3 ? 'Correct response with difficulty' : rating === 4 ? 'Correct response after hesitation' : 'Perfect response'}
                            >
                              {rating}
                            </Button>
                          ))}
                        </Box>
                        <Button variant="text" startIcon={<SkipNextIcon sx={{ fontSize: '0.9rem' }} />} onClick={() => setSkipDialogOpen(true)} disabled={isLoading} fullWidth sx={{ color: 'text.secondary', fontWeight: 400, textTransform: 'none', py: 0.75, fontSize: '0.85rem', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), color: theme.palette.primary.main } }}>
                          Skip Word
                        </Button>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center', fontSize: '0.65rem', opacity: 0.6 }}>
                          Press Space to show answer • Use number keys (1-5) to rate
                        </Typography>
                      </Box>
                    </CardContent>
                  </Fade>
                )}
              </Card>
            </Box>
          </Box>
        )}

        <Dialog open={skipDialogOpen} onClose={() => setSkipDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Skip Word</DialogTitle>
          <DialogContent>
            <Typography variant="body2">Are you sure you want to skip this word? It will be marked as "already known" and won't appear in this session.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSkipDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSkip} variant="contained" color="primary">Skip</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={completedDialogOpen} onClose={handleFinish} maxWidth="xs" fullWidth>
          <DialogTitle>Session Completed!</DialogTitle>
          <DialogContent>
            <Typography variant="body2">You've completed all cards in this session. Would you like to start a new session or finish?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleFinish}>Finish</Button>
            <Button onClick={() => startLearning()} variant="contained" color="primary">Start New Session</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
