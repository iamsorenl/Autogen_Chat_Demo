import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Blue
    },
    secondary: {
      main: '#dc004e', // Red
    },
    background: {
      default: '#f1f1f1', // Light gray background
      paper: '#ffffff', // White for cards and containers
    },
    text: {
      primary: '#000000', // Black text
      secondary: '#555555', // Gray text
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none', // Prevent uppercase transformation on buttons
    },
  },
  shape: {
    borderRadius: 8, // Default border radius for components
  },
  spacing: 8, // Default spacing unit (used for padding, margins, etc.)
});

export default theme;