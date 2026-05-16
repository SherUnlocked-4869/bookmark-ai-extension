import { useState } from 'react';
import { Card, CardContent, Typography, Chip, Button, Box, Dialog, DialogTitle, DialogContent, TextField } from '@mui/material';
import type { Bookmark } from '@/tab/types';
import BookmarkItem from './BookmarkItem';

const COLORS = ['#1976D2', '#388E3C', '#7B1FA2', '#E64A19', '#00796B', '#5D4037', '#C2185B', '#303F9F'];

interface Props {
  name: string;
  bookmarks: Bookmark[];
  index: number;
  categories: string[];
  onReclassify: (bookmarkId: string, newCategory: string) => void;
  classifications: Record<string, string>;
  onRenameCategory: (oldName: string, newName: string) => void;
}

export default function CategoryPanel({ name, bookmarks, index, categories: allCategories, onReclassify, classifications, onRenameCategory }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(name);
  const accentColor = COLORS[index % COLORS.length];

  const handleRename = () => {
    const trimmed = newName.trim();
    if (trimmed && trimmed !== name) {
      onRenameCategory(name, trimmed);
    }
    setRenaming(false);
  };

  return (
    <>
      <Card sx={{ borderTop: `4px solid ${accentColor}`, height: 'fit-content' }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 2, pb: 1 }}>
            {renaming ? (
              <TextField
                size="small"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                autoFocus
                sx={{ flex: 1, mr: 1 }}
              />
            ) : (
              <Typography
                variant="subtitle1"
                fontWeight={600}
                onClick={() => { setNewName(name); setRenaming(true); }}
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                title="点击修改分类名"
              >
                {name}
              </Typography>
            )}
            <Chip
              label={bookmarks.length}
              size="small"
              sx={{ backgroundColor: accentColor + '18', color: accentColor, fontWeight: 500 }}
            />
          </Box>
          <Box sx={{ px: 2, maxHeight: 320, overflowY: 'auto' }}>
            {bookmarks.map((b) => (
              <BookmarkItem
                key={b.id}
                bookmark={b}
                categories={allCategories}
                currentCategory={classifications[b.id]}
                onReclassify={onReclassify}
              />
            ))}
          </Box>
          {bookmarks.length > 0 && (
            <Button
              fullWidth
              size="small"
              onClick={() => setDialogOpen(true)}
              sx={{ color: accentColor, py: 1, fontSize: 12, borderRadius: 0, borderTop: '1px solid', borderColor: 'divider' }}
            >
              查看全部 {bookmarks.length} 个
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', fontWeight: 600 }}>
          {name}
        </DialogTitle>
        <DialogContent sx={{ maxHeight: 480, overflowY: 'auto', p: 0, '&:first-of-type': { p: 0 } }}>
          <Box sx={{ px: 2 }}>
            {bookmarks.map((b) => (
              <BookmarkItem
                key={b.id}
                bookmark={b}
                categories={allCategories}
                currentCategory={classifications[b.id]}
                onReclassify={onReclassify}
              />
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
