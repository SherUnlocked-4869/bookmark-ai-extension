import { useState } from 'react';
import { Box, Typography, Link, Select, MenuItem, Chip } from '@mui/material';
import type { Bookmark } from '@/tab/types';

interface Props {
  bookmark: Bookmark;
  categories: string[];
  currentCategory: string;
  onReclassify: (bookmarkId: string, newCategory: string) => void;
}

export default function BookmarkItem({ bookmark, categories, currentCategory, onReclassify }: Props) {
  const [editing, setEditing] = useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 1,
        px: 0.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box
        component="img"
        src={`https://www.google.com/s2/favicons?domain=${bookmark.url}&sz=16`}
        sx={{ width: 16, height: 16, mr: 1.5, flexShrink: 0 }}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Link
          href={bookmark.url}
          target="_blank"
          underline="none"
          sx={{
            fontSize: 13,
            color: 'primary.main',
            display: 'block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {bookmark.title}
        </Link>
        <Typography variant="caption" color="text.disabled" noWrap>
          {bookmark.url ? new URL(bookmark.url).hostname : ''}
        </Typography>
      </Box>
      {editing ? (
        <Select
          size="small"
          value={currentCategory}
          onChange={(e) => {
            onReclassify(bookmark.id, e.target.value);
            setEditing(false);
          }}
          onClose={() => setEditing(false)}
          autoFocus
          sx={{ fontSize: 12, height: 28, minWidth: 100, ml: 1 }}
        >
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat} sx={{ fontSize: 13 }}>{cat}</MenuItem>
          ))}
        </Select>
      ) : (
        <Chip
          label={currentCategory}
          size="small"
          onClick={() => setEditing(true)}
          sx={{ ml: 1, fontSize: 11, height: 22, cursor: 'pointer', flexShrink: 0 }}
        />
      )}
    </Box>
  );
}
