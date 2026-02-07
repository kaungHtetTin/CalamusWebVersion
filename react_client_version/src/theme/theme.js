import { createTheme } from '@mui/material/styles';

// Soft Shadow Design Theme
// Features: Subtle shadows instead of hard borders
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
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          border: 'none',
          boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
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
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#1b5e20',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: 'none',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation0: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        },
        elevation1: {
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        },
        elevation3: {
          boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          margin: '2px 8px',
          transition: 'background-color 0.15s ease',
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
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0,0,0,0.1)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0,0,0,0.2)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: 'none',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '0.75rem',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
