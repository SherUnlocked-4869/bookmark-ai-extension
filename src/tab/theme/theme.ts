import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976D2' },
    secondary: { main: '#388E3C' },
    background: { default: '#FAFAFA', paper: '#FFFFFF' },
    error: { main: '#D32F2F' },
    warning: { main: '#FF6F00' },
  },
  typography: {
    fontFamily: [
      '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto',
      '"Noto Sans SC"', '"Microsoft YaHei"', 'sans-serif',
    ].join(','),
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
      },
    },
  },
});

export const darkTheme = createTheme({
  ...lightTheme,
  palette: {
    mode: 'dark',
    primary: { main: '#90CAF9' },
    secondary: { main: '#A5D6A7' },
    background: { default: '#121212', paper: '#1E1E1E' },
    error: { main: '#EF5350' },
    warning: { main: '#FFB74D' },
  },
});
