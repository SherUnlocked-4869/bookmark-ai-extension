import { Box, Chip, Stack, Snackbar, Alert, LinearProgress } from '@mui/material';
import type { Settings } from '@/tab/types';
import { useBookmarks } from '@/tab/hooks/useBookmarks';
import { useCategories } from '@/tab/hooks/useCategories';
import TopBar from '@/tab/components/TopBar';
import CategoryPanel from '@/tab/components/CategoryPanel';
import EmptyState from '@/tab/components/EmptyState';

interface Props {
  settings: Settings;
  onNavigateSettings: () => void;
}

export default function BookmarksPage({ settings, onNavigateSettings }: Props) {
  const { bookmarks, syncing, lastSyncTime, sync } = useBookmarks();
  const { categories, classifications, classifying, error, classify, setError } = useCategories();

  const handleClassify = () => classify(bookmarks, settings);

  const unclassifiedCount = bookmarks.filter((b) => !classifications[b.id]).length;

  const grouped = categories
    .map((cat) => ({
      name: cat,
      bookmarks: bookmarks.filter((b) => classifications[b.id] === cat),
    }))
    .filter((g) => g.bookmarks.length > 0);

  return (
    <Box>
      <TopBar
        onSync={sync}
        onClassify={handleClassify}
        onSettings={onNavigateSettings}
        syncing={syncing}
        classifying={classifying}
      />

      {classifying && <LinearProgress sx={{ height: 3 }} />}

      {bookmarks.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ px: 3, py: 1.5, bgcolor: 'action.hover', flexWrap: 'wrap', gap: 0.5 }}>
          <Chip label={`${bookmarks.length} 个书签`} size="small" color="primary" variant="outlined" />
          <Chip label={`${categories.length} 个分类`} size="small" color="secondary" variant="outlined" />
          {unclassifiedCount > 0 && (
            <Chip label={`${unclassifiedCount} 个待分类`} size="small" color="warning" variant="outlined" />
          )}
          {lastSyncTime && (
            <Chip
              label={`上次同步: ${Math.floor((Date.now() - lastSyncTime) / 60000)} 分钟前`}
              size="small"
              variant="outlined"
              sx={{ color: 'text.secondary' }}
            />
          )}
        </Stack>
      )}

      <Box sx={{ p: 2.5 }}>
        {bookmarks.length === 0 ? (
          <EmptyState onSync={sync} />
        ) : grouped.length === 0 ? (
          <EmptyState onSync={handleClassify} message="暂无分类数据" actionLabel="智能分类" />
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 2 }}>
            {grouped.map((g, i) => (
              <CategoryPanel key={g.name} name={g.name} bookmarks={g.bookmarks} index={i} />
            ))}
          </Box>
        )}
      </Box>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)} variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
