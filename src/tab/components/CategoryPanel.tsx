import { useState } from 'react';
import { Card, CardContent, Typography, Chip, Button, Collapse, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import type { Bookmark } from '@/tab/types';
import BookmarkItem from './BookmarkItem';

const COLORS = ['#1976D2', '#388E3C', '#7B1FA2', '#E64A19', '#00796B', '#5D4037', '#C2185B', '#303F9F'];

interface Props {
  name: string;
  bookmarks: Bookmark[];
  index: number;
}

export default function CategoryPanel({ name, bookmarks, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const accentColor = COLORS[index % COLORS.length];
  const preview = bookmarks.slice(0, 4);
  const remaining = bookmarks.length - preview.length;

  return (
    <Card sx={{ borderTop: `4px solid ${accentColor}`, height: 'fit-content' }}>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 2, pb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {name}
          </Typography>
          <Chip
            label={bookmarks.length}
            size="small"
            sx={{ backgroundColor: accentColor + '18', color: accentColor, fontWeight: 500 }}
          />
        </Box>
        <Box sx={{ px: 2 }}>
          {preview.map((b) => <BookmarkItem key={b.id} bookmark={b} />)}
        </Box>
        {remaining > 0 && (
          <>
            <Collapse in={expanded}>
              <Box sx={{ px: 2 }}>
                {bookmarks.slice(4).map((b) => <BookmarkItem key={b.id} bookmark={b} />)}
              </Box>
            </Collapse>
            <Button
              fullWidth
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ color: accentColor, py: 1, fontSize: 12, borderRadius: 0 }}
              endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {expanded ? '收起' : `查看全部 ${bookmarks.length} 个`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
