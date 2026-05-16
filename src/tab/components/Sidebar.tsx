import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import type { Page } from '@/tab/types';

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  hiddenBadge?: number; // count of bookmarks in hidden categories
}

const NAV_ITEMS: { page: Page; label: string; icon: React.ReactElement }[] = [
  { page: 'bookmarks', label: '书签管理', icon: <BookmarkIcon /> },
  { page: 'dedup', label: '查重清理', icon: <CleaningServicesIcon /> },
  { page: 'statistics', label: '统计看板', icon: <BarChartIcon /> },
  { page: 'settings', label: '设置', icon: <SettingsIcon /> },
];

export default function Sidebar({ currentPage, onNavigate, hiddenBadge }: Props) {
  return (
    <Box
      sx={{
        width: 200,
        flexShrink: 0,
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
          导航
        </Typography>
      </Box>
      <List sx={{ flex: 1, px: 1, py: 1 }}>
        {NAV_ITEMS.map(({ page, label, icon }) => (
          <ListItemButton
            key={page}
            selected={currentPage === page}
            onClick={() => onNavigate(page)}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {icon}
            </ListItemIcon>
            <ListItemText primary={label} />
            {page === 'bookmarks' && hiddenBadge && hiddenBadge > 0 && (
              <Box
                sx={{
                  width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main',
                  ml: 0.5, flexShrink: 0,
                }}
                title={`隐藏分类中有 ${hiddenBadge} 个书签`}
              />
            )}
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
