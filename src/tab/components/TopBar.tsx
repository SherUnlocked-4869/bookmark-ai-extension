import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SettingsIcon from '@mui/icons-material/Settings';

interface Props {
  onSync: () => void;
  onClassify: () => void;
  onSettings: () => void;
  syncing: boolean;
  classifying: boolean;
}

export default function TopBar({ onSync, onClassify, onSettings, syncing, classifying }: Props) {
  return (
    <AppBar position="static" sx={{ borderRadius: '12px 12px 0 0' }}>
      <Toolbar sx={{ gap: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          书签智能分类
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<SyncIcon />}
          onClick={onSync}
          disabled={syncing || classifying}
          sx={{
            color: 'white',
            borderColor: 'rgba(255,255,255,0.4)',
            '&:hover': { borderColor: 'white' },
          }}
        >
          {syncing ? '同步中...' : '同步书签'}
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<AutoAwesomeIcon />}
          onClick={onClassify}
          disabled={syncing || classifying}
          sx={{
            backgroundColor: '#FF6F00',
            '&:hover': { backgroundColor: '#E65100' },
          }}
        >
          {classifying ? '分类中...' : '智能分类'}
        </Button>
        <IconButton size="small" onClick={onSettings} sx={{ color: 'white' }}>
          <SettingsIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
