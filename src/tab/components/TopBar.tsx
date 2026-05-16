import { Button, Box } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface Props {
  onSync: () => void;
  onClassify: () => void;
  syncing: boolean;
  classifying: boolean;
}

export default function TopBar({ onSync, onClassify, syncing, classifying }: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 1, px: 3, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Button
        variant="outlined"
        size="small"
        startIcon={<SyncIcon />}
        onClick={onSync}
        disabled={syncing || classifying}
      >
        {syncing ? '同步中...' : '同步书签'}
      </Button>
      <Button
        variant="contained"
        size="small"
        startIcon={<AutoAwesomeIcon />}
        onClick={onClassify}
        disabled={syncing || classifying}
        sx={{ backgroundColor: '#FF6F00', '&:hover': { backgroundColor: '#E65100' } }}
      >
        {classifying ? '分类中...' : '智能分类'}
      </Button>
    </Box>
  );
}
