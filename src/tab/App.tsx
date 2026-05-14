import { useState, useMemo } from 'react';
import { ThemeProvider, CssBaseline, useMediaQuery, Box, CircularProgress } from '@mui/material';
import { lightTheme, darkTheme } from '@/tab/theme/theme';
import { useSettings } from '@/tab/hooks/useSettings';
import BookmarksPage from '@/tab/pages/Bookmarks';
import Settings from '@/tab/pages/Settings';

export default function App() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(() => (prefersDark ? darkTheme : lightTheme), [prefersDark]);
  const { settings, saveSettings, loaded } = useSettings();
  const [page, setPage] = useState<'bookmarks' | 'settings'>('bookmarks');

  if (!loaded) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {page === 'settings' ? (
        <Settings
          settings={settings}
          onSave={saveSettings}
          onBack={() => setPage('bookmarks')}
        />
      ) : (
        <BookmarksPage
          settings={settings}
          onNavigateSettings={() => setPage('settings')}
        />
      )}
    </ThemeProvider>
  );
}
