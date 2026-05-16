import { useState, useEffect } from 'react';
import { Box, Chip, Stack, Snackbar, Alert, LinearProgress, Typography, TextField, Button, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import type { Settings } from '@/tab/types';
import { useBookmarks } from '@/tab/hooks/useBookmarks';
import { useCategories } from '@/tab/hooks/useCategories';
import { storageService } from '@/tab/services/storageService';
import TopBar from '@/tab/components/TopBar';
import CategoryPanel from '@/tab/components/CategoryPanel';
import EmptyState from '@/tab/components/EmptyState';

interface Props {
  settings: Settings;
}

export default function BookmarksPage({ settings }: Props) {
  const { bookmarks, syncing, lastSyncTime, sync } = useBookmarks();
  const { categories, classifications, classifying, progress, error, classify, setError, setClassifications, setCategories } = useCategories();

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Adult filter
  const [showAdult, setShowAdult] = useState(false);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);

  // New bookmarks banner
  const [prevCount, setPrevCount] = useState(0);
  const [showNewBanner, setShowNewBanner] = useState(false);

  useEffect(() => {
    storageService.getHiddenCategories().then(setHiddenCategories);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => setShowAdult((e as CustomEvent).detail.show);
    window.addEventListener('adult-toggle', handler);
    return () => window.removeEventListener('adult-toggle', handler);
  }, []);

  useEffect(() => {
    if (prevCount > 0 && bookmarks.length > prevCount) {
      const unclassified = bookmarks.filter((b) => !classifications[b.id]);
      if (unclassified.length > 0) setShowNewBanner(true);
    }
    setPrevCount(bookmarks.length);
  }, [bookmarks, classifications]);

  // Classify handlers
  const handleClassify = () => classify(bookmarks, settings);

  const handleClassifyNew = () => {
    const toClassify = bookmarks.filter((b) => !classifications[b.id]);
    if (toClassify.length > 0) {
      classify(toClassify, settings);
      setShowNewBanner(false);
    }
  };

  // Reclassification
  const handleReclassify = async (bookmarkId: string, newCategory: string) => {
    const updated = { ...classifications, [bookmarkId]: newCategory };
    setClassifications(updated);
    await storageService.saveClassifications(updated);
  };

  // Rename category
  const handleRenameCategory = async (oldName: string, newName: string) => {
    if (oldName === newName) return;
    const updatedCategories = categories.map((c) => (c === oldName ? newName : c));
    setCategories(updatedCategories);
    await storageService.saveCategories(updatedCategories);

    const updatedClassifications: Record<string, string> = {};
    for (const [id, cat] of Object.entries(classifications)) {
      updatedClassifications[id] = cat === oldName ? newName : cat;
    }
    setClassifications(updatedClassifications);
    await storageService.saveClassifications(updatedClassifications);
  };

  // Filtering
  const ADULT_PATTERNS = ['成人'];
  const autoHidden = categories.filter((cat) => ADULT_PATTERNS.some((p) => cat.includes(p)));
  const effectiveHidden = [...new Set([...hiddenCategories, ...autoHidden])];

  const filteredBookmarks = searchQuery
    ? bookmarks.filter(
        (b) =>
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (b.url && b.url.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : bookmarks;

  const grouped = categories
    .filter((cat) => showAdult || !effectiveHidden.includes(cat))
    .map((cat) => ({
      name: cat,
      bookmarks: filteredBookmarks.filter((b) => classifications[b.id] === cat),
    }))
    .filter((g) => g.bookmarks.length > 0);

  const unclassifiedCount = filteredBookmarks.filter((b) => !classifications[b.id]).length;

  return (
    <Box>
      <TopBar
        onSync={sync}
        onClassify={handleClassify}
        onClassifyNew={handleClassifyNew}
        syncing={syncing}
        classifying={classifying}
      />

      {/* Search bar */}
      <Box sx={{ px: 3, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <TextField
          placeholder="搜索书签标题或 URL..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default' } }}
        />
      </Box>

      {/* New bookmarks banner */}
      {showNewBanner && (
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={handleClassifyNew}>
              分类
            </Button>
          }
          onClose={() => setShowNewBanner(false)}
          sx={{ borderRadius: 0 }}
        >
          发现新书签，是否分类？
        </Alert>
      )}

      {classifying && (
        <Box sx={{ px: 2.5, pt: 1 }}>
          <LinearProgress sx={{ height: 3 }} />
          {progress && (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary', textAlign: 'center' }}>
              {progress}
            </Typography>
          )}
        </Box>
      )}

      {bookmarks.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ px: 3, py: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
          <Chip label={`${filteredBookmarks.length} 个书签`} size="small" color="primary" variant="outlined" />
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
          <EmptyState onSync={handleClassify} message="暂无匹配结果" actionLabel="智能分类" />
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 2 }}>
            {grouped.map((g, i) => (
              <CategoryPanel
                key={g.name}
                name={g.name}
                bookmarks={g.bookmarks}
                index={i}
                categories={categories}
                onReclassify={handleReclassify}
                classifications={classifications}
                onRenameCategory={handleRenameCategory}
              />
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
