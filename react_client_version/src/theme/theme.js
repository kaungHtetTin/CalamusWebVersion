import { createTheme } from '@mui/material/styles';

// Educational Green Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Educational green
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ed2a26', // Accent red (from original app)
      light: '#ff4444',
      dark: '#c9221f',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Custom Scrollbar Styling
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#c1c1c1 transparent',
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
          background: '#c1c1c1',
          borderRadius: '4px',
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
          '&:hover': {
            background: '#a8a8a8',
            backgroundClip: 'padding-box',
          },
        },
        // Tabs scrollbar - even thinner
        '.MuiTabs-scroller::-webkit-scrollbar': {
          height: '4px',
        },
        '.MuiTabs-scroller::-webkit-scrollbar-thumb': {
          background: 'rgba(46, 125, 50, 0.3)',
          '&:hover': {
            background: 'rgba(46, 125, 50, 0.5)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#333333',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e0e0e0',
          // Custom scrollbar for drawer
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(46, 125, 50, 0.2)',
            borderRadius: '3px',
            '&:hover': {
              background: 'rgba(46, 125, 50, 0.4)',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
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
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(46, 125, 50, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(46, 125, 50, 0.15)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(46, 125, 50, 0.08)',
          },
        },
      },
    },
  },
});

export default theme;
