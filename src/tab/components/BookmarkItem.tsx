import { Box, Typography, Link } from '@mui/material';
import type { Bookmark } from '@/tab/types';

interface Props {
  bookmark: Bookmark;
}

export default function BookmarkItem({ bookmark }: Props) {
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
    </Box>
  );
}
