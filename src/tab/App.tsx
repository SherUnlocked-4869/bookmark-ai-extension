import { useState, useMemo } from 'react';
import { ThemeProvider, CssBaseline, useMediaQuery, Box, CircularProgress } from '@mui/material';
import { lightTheme, darkTheme } from '@/tab/theme/theme';
import { useSettings } from '@/tab/hooks/useSettings';
import Layout from '@/tab/components/Layout';
import BookmarksPage from '@/tab/pages/Bookmarks';
import Settings from '@/tab/pages/Settings';
import DedupPage from '@/tab/pages/DedupPage';
import StatisticsPage from '@/tab/pages/StatisticsPage';
import type { Page } from '@/tab/types';

export default function App() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(() => (prefersDark ? darkTheme : lightTheme), [prefersDark]);
  const { settings, saveSettings, loaded } = useSettings();
  const [page, setPage] = useState<Page>('bookmarks');

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
      <Layout currentPage={page} onNavigate={setPage}>
        {page === 'bookmarks' && <BookmarksPage settings={settings} />}
        {page === 'settings' && (
          <Settings
            settings={settings}
            onSave={saveSettings}
            onBack={() => setPage('bookmarks')}
          />
        )}
        {page === 'dedup' && <DedupPage />}
        {page === 'statistics' && <StatisticsPage />}
      </Layout>
    </ThemeProvider>
  );
}
