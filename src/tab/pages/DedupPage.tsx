import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Checkbox, Card, CardContent, Chip,
  Alert, LinearProgress, Divider, Snackbar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import type { Bookmark, DedupGroup } from '@/tab/types';
import { useDedup } from '@/tab/hooks/useDedup';
import { bookmarkService } from '@/tab/services/bookmarkService';
import { storageService } from '@/tab/services/storageService';

function GroupCard({ group, selectedIds, onToggle }: {
  group: DedupGroup;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const isExact = group.type === 'exact';

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ pb: 1, '&:last-child': { pb: 1 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
          <Chip
            label={isExact ? '完全重复' : '疑似重复'}
            size="small"
            color={isExact ? 'error' : 'warning'}
            variant="outlined"
          />
          {group.category && (
            <Chip label={group.category} size="small" variant="outlined" />
          )}
          <Typography variant="caption" color="text.secondary">
            {group.bookmarks.length} 个书签
          </Typography>
        </Box>
        {group.bookmarks.map((b, idx) => {
          const isKeep = idx === group.keepIndex;
          return (
            <Box
              key={b.id}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1, py: 0.5, px: 1,
                bgcolor: isKeep ? 'action.selected' : 'transparent',
                borderRadius: 1, mb: 0.25,
              }}
            >
              <Checkbox
                size="small"
                checked={selectedIds.has(b.id)}
                disabled={isKeep}
                onChange={() => onToggle(b.id)}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: isKeep ? 600 : 400 }}>
                  {b.title}
                </Typography>
                <Typography variant="caption" color="text.disabled" noWrap>
                  {b.url}
                </Typography>
              </Box>
              {isKeep && (
                <Chip label="保留" size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
              )}
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function DedupPage() {
  const { groups, scanning, deleting, report, selectedIds, scan, toggleSelect, selectAll, invertSelection, removeSelected } = useDedup();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [classifications, setClassifications] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    storageService.getBookmarksSnapshot().then(setBookmarks);
    storageService.getClassifications().then(setClassifications);
  }, []);

  const handleScan = async () => {
    setError(null);
    if (bookmarks.length === 0) {
      setError('请先在书签管理页同步书签');
      return;
    }
    await scan(bookmarks, classifications);
  };

  const exactGroups = groups.filter((g) => g.type === 'exact');
  const similarGroups = groups.filter((g) => g.type === 'similar');

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 1, px: 3, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', alignItems: 'center' }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<CleaningServicesIcon />}
          onClick={handleScan}
          disabled={scanning}
        >
          {scanning ? '扫描中...' : '开始扫描'}
        </Button>
        {report && (
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            找到 {report.duplicateGroups} 组重复，共 {report.duplicateCount} 个书签
          </Typography>
        )}
      </Box>

      {/* Progress */}
      {scanning && <LinearProgress sx={{ height: 3 }} />}

      {/* Report summary bar */}
      {report && report.deletedCount > 0 && (
        <Alert severity="success" sx={{ borderRadius: 0 }}>
          已删除 {report.deletedCount} 个重复书签
        </Alert>
      )}

      {/* Content */}
      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>
        )}

        {groups.length === 0 && !scanning && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CleaningServicesIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              查重清理
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
              点击"开始扫描"检测重复书签
            </Typography>
          </Box>
        )}

        {scanning && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">正在分析书签...</Typography>
          </Box>
        )}

        {groups.length > 0 && !scanning && (
          <>
            {/* Action bar */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
              <Button size="small" onClick={selectAll}>全选</Button>
              <Button size="small" onClick={invertSelection}>反选</Button>
              <Box sx={{ flex: 1 }} />
              <Typography variant="caption" color="text.secondary">
                已选 {selectedIds.size} 个
              </Typography>
              <Button
                variant="contained"
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                disabled={selectedIds.size === 0 || deleting}
                onClick={removeSelected}
              >
                {deleting ? '删除中...' : `删除选中 (${selectedIds.size})`}
              </Button>
            </Box>

            {exactGroups.length > 0 && (
              <>
                <Typography variant="subtitle2" color="error.main" sx={{ mb: 1 }}>
                  完全重复 · {exactGroups.length} 组
                </Typography>
                {exactGroups.map((g, i) => (
                  <GroupCard key={`exact-${i}`} group={g} selectedIds={selectedIds} onToggle={toggleSelect} />
                ))}
                {similarGroups.length > 0 && <Divider sx={{ my: 2 }} />}
              </>
            )}

            {similarGroups.length > 0 && (
              <>
                <Typography variant="subtitle2" color="warning.main" sx={{ mb: 1 }}>
                  疑似重复 · {similarGroups.length} 组
                </Typography>
                {similarGroups.map((g, i) => (
                  <GroupCard key={`similar-${i}`} group={g} selectedIds={selectedIds} onToggle={toggleSelect} />
                ))}
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
