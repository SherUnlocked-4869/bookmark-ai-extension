import { Box, Typography, Button } from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

interface Props {
  onSync: () => void;
  message?: string;
  actionLabel?: string;
}

export default function EmptyState({
  onSync,
  message = '暂无书签分类数据',
  actionLabel = '同步书签',
}: Props) {
  return (
    <Box sx={{ textAlign: 'center', py: 10 }}>
      <BookmarkBorderIcon sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {message}
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
        点击同步按钮获取最新书签，然后点击智能分类开始整理
      </Typography>
      <Button variant="contained" onClick={onSync}>
        {actionLabel}
      </Button>
    </Box>
  );
}
