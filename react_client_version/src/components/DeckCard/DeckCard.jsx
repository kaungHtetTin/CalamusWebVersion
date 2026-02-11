import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Skeleton,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  MenuBook as BookIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

// Deck Card Component
export const DeckCard = ({ deck, languageName, onClick }) => {
  const theme = useTheme();

  const handleCardClick = () => {
    if (onClick) {
      onClick(deck);
    }
  };

  // Get language color
  const getLanguageColor = (languageName) => {
    const lang = languageName?.toLowerCase() || '';
    if (lang.includes('english')) {
      return { color: '#2e7d32', bgColor: '#e8f5e9' };
    } else if (lang.includes('korean') || lang.includes('korea')) {
      return { color: '#d32f2f', bgColor: '#ffebee' };
    }
    return { color: '#1976d2', bgColor: '#e3f2fd' };
  };

  const languageInfo = getLanguageColor(languageName);
  // API returns progress with total_cards, mastered_cards, progress_percent (LearningFlow::getDeckProgress)
  const progress = deck.progress;
  const total = progress?.total_cards ?? 0;
  const mastered = progress?.mastered_cards ?? 0;
  const progressPercent = progress?.progress_percent ?? (total > 0 ? Math.round((mastered / total) * 100) : 0);
  const showProgress = total > 0;

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
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        bgcolor: 'background.paper',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          borderColor: alpha(languageInfo.color, 0.3),
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
        {/* Header Row: Icon, Language Badge, Arrow */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            {/* Icon with colored background */}
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: alpha(languageInfo.color, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BookIcon sx={{ fontSize: 22, color: languageInfo.color }} />
            </Box>
            
            {/* Language Badge */}
            {languageName && (
              <Chip
                label={languageName}
                size="small"
                sx={{
                  backgroundColor: alpha(languageInfo.color, 0.1),
                  color: languageInfo.color,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 22,
                  border: `1px solid ${alpha(languageInfo.color, 0.2)}`,
                }}
              />
            )}
          </Stack>
          
          {/* Arrow Icon */}
          <ArrowForwardIcon 
            sx={{ 
              fontSize: 18, 
              color: 'text.secondary',
              transition: 'transform 0.2s ease',
              '.MuiCard-root:hover &': {
                transform: 'translateX(4px)',
                color: languageInfo.color,
              },
            }} 
          />
        </Stack>

        {/* Title */}
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{
            mb: 0.75,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: 'text.primary',
            fontSize: '0.95rem',
          }}
        >
          {deck.title}
        </Typography>

        {/* Description */}
        {deck.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
              fontSize: '0.813rem',
            }}
          >
            {deck.description}
          </Typography>
        )}

        {/* Progress Section - Circular progress bar (mastered words; API: mastered_cards, progress_percent) */}
        {showProgress ? (
          <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', width: 48, height: 48 }}>
              {/* Track (background ring) */}
              <CircularProgress
                variant="determinate"
                value={100}
                size={48}
                thickness={4}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  color: alpha(languageInfo.color, 0.15),
                }}
              />
              {/* Progress ring */}
              <CircularProgress
                variant="determinate"
                value={progressPercent}
                size={48}
                thickness={4}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  color: languageInfo.color,
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.7rem', color: languageInfo.color }}>
                  {progressPercent}%
                </Typography>
              </Box>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.7rem', display: 'block' }}>
                Mastered
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.813rem', color: languageInfo.color }}>
                {mastered} / {total} words
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ mt: 'auto', pt: 0.5 }}>
            <Typography
              variant="body2"
              color="primary"
              fontWeight={600}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.813rem',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Start Learning
              <ArrowForwardIcon sx={{ fontSize: 14 }} />
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Deck Card Skeleton for loading state
export const DeckCardSkeleton = () => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        bgcolor: 'background.paper',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 1.5 }} />
            <Skeleton variant="rectangular" width={70} height={22} sx={{ borderRadius: 1 }} />
          </Stack>
          <Skeleton variant="circular" width={18} height={18} />
        </Stack>
        <Skeleton variant="text" sx={{ fontSize: '0.95rem', mb: 0.75, width: '85%' }} />
        <Skeleton variant="text" width="100%" sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="70%" sx={{ mb: 1.5 }} />
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Skeleton variant="circular" width={48} height={48} />
          <Box>
            <Skeleton variant="text" width={60} sx={{ fontSize: '0.7rem', mb: 0.25 }} />
            <Skeleton variant="text" width={80} sx={{ fontSize: '0.813rem' }} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

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
      gap: 2,
    }}
  >
    {children}
  </Box>
);

export default DeckCard;
