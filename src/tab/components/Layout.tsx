import { useState } from 'react';
import { Box, Typography, Snackbar, Alert } from '@mui/material';
import Sidebar from './Sidebar';
import type { Page } from '@/tab/types';

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  hiddenBadge?: number;
  children: React.ReactNode;
}

export default function Layout({ currentPage, onNavigate, hiddenBadge, children }: Props) {
  const [showAdult, setShowAdult] = useState(false);
  const [snack, setSnack] = useState('');

  const handleTitleDoubleClick = () => {
    const next = !showAdult;
    setShowAdult(next);
    setSnack(next ? '成人分类已显示' : '成人分类已隐藏');
    window.dispatchEvent(new CustomEvent('adult-toggle', { detail: { show: next } }));
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} hiddenBadge={hiddenBadge} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Title strip */}
        <Box
          sx={{
            px: 3, py: 1.5, borderBottom: '1px solid', borderColor: 'divider',
            bgcolor: 'background.paper', display: 'flex', alignItems: 'center',
            userSelect: 'none',
          }}
        >
          <Typography
            variant="h6"
            fontWeight={600}
            onDoubleClick={handleTitleDoubleClick}
            sx={{ cursor: 'default' }}
          >
            书签智能分类
          </Typography>
        </Box>
        {/* Content area */}
        <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.default' }}>
          {children}
        </Box>
      </Box>
      <Snackbar open={!!snack} autoHideDuration={2000} onClose={() => setSnack('')}>
        <Alert severity="info" onClose={() => setSnack('')} variant="filled" sx={{ width: '100%' }}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
}
