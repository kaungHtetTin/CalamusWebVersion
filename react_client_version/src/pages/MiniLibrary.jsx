import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  Stack,
  Skeleton,
  useTheme,
  alpha,
  Paper,
  IconButton,
  Button,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  LocalLibrary as LibraryIcon,
  Download as DownloadIcon,
  ArrowBack as BackIcon,
  MenuBook as BookIcon,
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { miniLibraryAPI, getBookAssetUrl } from '../services/api';
import { useThemeMode } from '../context/ThemeContext';

const MAJOR_OPTIONS = [
  { value: 'english', label: 'English' },
  { value: 'korea', label: 'Korean' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'russian', label: 'Russian' },
];

// Category card – app-consistent card style (matches CourseCard / DeckCard)
const CategoryCard = ({ category, onClick }) => {
  const theme = useTheme();
  const { mode } = useThemeMode();

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2,
        textAlign: 'center',
        cursor: 'pointer',
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: mode === 'light' ? '0 2px 12px rgba(0,0,0,0.06)' : '0 4px 16px rgba(0,0,0,0.25)',
        bgcolor: 'background.paper',
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: mode === 'light' ? '0 12px 32px rgba(0,0,0,0.12)' : '0 12px 32px rgba(0,0,0,0.4)',
        },
      }}
    >
      <Box sx={{ fontSize: 40, mb: 1 }}>📚</Box>
      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
        {category.name}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {category.bookCount} {category.bookCount === 1 ? 'book' : 'books'}
      </Typography>
    </Paper>
  );
};

// Book list row – app-consistent card style (no lift hover for list rows)
const BookListItem = ({ book, onDownload }) => {
  const theme = useTheme();
  const { mode } = useThemeMode();

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1.5,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: mode === 'light' ? '0 2px 12px rgba(0,0,0,0.06)' : '0 4px 16px rgba(0,0,0,0.25)',
        bgcolor: 'background.paper',
        transition: 'all 0.25s ease',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, mode === 'light' ? 0.04 : 0.08),
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <BookIcon sx={{ fontSize: 22, color: 'primary.main' }} />
      </Box>
      <Typography
        variant="body1"
        fontWeight={500}
        sx={{ flex: 1, minWidth: 0 }}
        title={book.title}
      >
        {book.title}
      </Typography>
      <Button
        size="small"
        startIcon={<DownloadIcon />}
        variant="outlined"
        onClick={() => onDownload(book)}
      >
        Download
      </Button>
    </Paper>
  );
};

/**
 * Mini Library – browse by category, view and download books (PDF).
 */
const MiniLibrary = () => {
  const theme = useTheme();
  const { mode } = useThemeMode();

  const [major, setMajor] = useState('english');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await miniLibraryAPI.getCategories(major);
      if (res?.success && res?.data?.categories) {
        setCategories(res.data.categories);
        setSelectedCategory(null);
        setBooks([]);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [major]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCategoryClick = useCallback(async (categoryName) => {
    setSelectedCategory(categoryName);
    setLoadingBooks(true);
    setBooks([]);
    try {
      const res = await miniLibraryAPI.getBooks(major, categoryName);
      if (res?.success && res?.data?.books) {
        setBooks(res.data.books);
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.error('Failed to fetch books:', err);
      setBooks([]);
    } finally {
      setLoadingBooks(false);
    }
  }, [major]);

  const handleBackToCategories = useCallback(() => {
    setSelectedCategory(null);
    setBooks([]);
  }, []);

  const handleDownload = useCallback((book) => {
    const url = getBookAssetUrl(book.pdfPath);
    if (url) window.open(url, '_blank');
  }, []);

  if (loading && !selectedCategory) {
    return (
      <Box sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 }, width: '100%', bgcolor: 'background.default' }}>
        <Skeleton variant="rounded" height={80} sx={{ mb: 3 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="rounded" height={120} />
          ))}
        </Box>
      </Box>
    );
  }

  if (error && !selectedCategory) {
    return (
      <Box
        sx={{
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
          bgcolor: 'background.default',
        }}
      >
        <LibraryIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
        <Typography variant="h5" fontWeight={600}>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => fetchCategories()}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 4, width: '100%' }}>
      {/* Header */}
      <Box sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
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
          {selectedCategory ? (
            <Link
              component="button"
              onClick={handleBackToCategories}
              underline="hover"
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'text.secondary',
                fontSize: '0.8125rem',
                fontWeight: 500,
                border: 'none',
                background: 'none',
                font: 'inherit',
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' },
              }}
            >
              <LibraryIcon sx={{ mr: 0.5, fontSize: 16 }} />
              Mini Library
            </Link>
          ) : null}
          <Typography
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.primary',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            {selectedCategory ? (
              selectedCategory
            ) : (
              <>
                <LibraryIcon sx={{ mr: 0.5, fontSize: 16 }} />
                Mini Library
              </>
            )}
          </Typography>
        </Breadcrumbs>
        <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
          <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
            <LibraryIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-1px', mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              Mini Library
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Browse and download books by category
            </Typography>
          </Box>
          {!selectedCategory && (
            <Stack direction="row" spacing={0.5}>
              {MAJOR_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  size="small"
                  variant={major === opt.value ? 'contained' : 'outlined'}
                  onClick={() => setMajor(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </Stack>
          )}
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, boxSizing: 'border-box' }}>
        {selectedCategory ? (
          <>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <IconButton size="small" onClick={handleBackToCategories} aria-label="Back to categories">
                <BackIcon />
              </IconButton>
              <Typography variant="h6" fontWeight={600}>
                {selectedCategory}
              </Typography>
            </Stack>

            {loadingBooks ? (
              <Stack spacing={1}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} variant="rounded" height={56} />
                ))}
              </Stack>
            ) : books.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <BookIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography color="text.secondary">No books in this category yet.</Typography>
              </Paper>
            ) : (
              <Stack spacing={1}>
                {books.map((book) => (
                  <BookListItem key={book.id} book={book} onDownload={handleDownload} />
                ))}
              </Stack>
            )}
          </>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {categories.length} {categories.length === 1 ? 'category' : 'categories'}
            </Typography>
            {categories.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <LibraryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography color="text.secondary">No categories yet. Check back later.</Typography>
              </Paper>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: 2,
                }}
              >
                {categories.map((cat) => (
                  <CategoryCard
                    key={cat.name}
                    category={cat}
                    onClick={() => handleCategoryClick(cat.name)}
                  />
                ))}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default MiniLibrary;
