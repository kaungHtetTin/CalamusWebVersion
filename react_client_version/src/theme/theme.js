import { alpha } from '@mui/material/styles';

export const getThemeConfig = (mode) => ({
  palette: {
    mode,
    primary: {
      main: '#2e7d32', // Educational green
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ed2a26', // Accent red
      light: '#ff4444',
      dark: '#c9221f',
      contrastText: '#ffffff',
    },
    background: {
      default: mode === 'light' ? '#f5f5f5' : '#0f172a', // Darker background for dark mode
      paper: mode === 'light' ? '#ffffff' : '#1e293b',
    },
    text: {
      primary: mode === 'light' ? '#333333' : '#f8fafc',
      secondary: mode === 'light' ? '#666666' : '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: mode === 'light' ? '#c1c1c1 transparent' : '#475569 transparent',
        },
        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: 'transparent',
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-thumb': {
          background: mode === 'light' ? '#c1c1c1' : '#475569',
          borderRadius: '4px',
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
          '&:hover': {
            background: mode === 'light' ? '#a8a8a8' : '#64748b',
            backgroundClip: 'padding-box',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.8)',
          color: mode === 'light' ? '#333333' : '#f8fafc',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: mode === 'light' ? alpha('#000', 0.08) : alpha('#fff', 0.08),
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
          border: 'none',
          boxShadow: mode === 'light' ? '4px 0 24px rgba(0,0,0,0.08)' : '4px 0 24px rgba(0,0,0,0.4)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '8px',
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#1b5e20',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light' ? '0 2px 12px rgba(0,0,0,0.06)' : '0 4px 20px rgba(0,0,0,0.2)',
          border: 'none',
          borderRadius: '12px',
          backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          backgroundImage: 'none', // Disable MUI dark mode overlay
        },
      },
    },
  },
});

// For backward compatibility if needed, but we'll use getThemeConfig
const theme = {}; 
export default theme;
