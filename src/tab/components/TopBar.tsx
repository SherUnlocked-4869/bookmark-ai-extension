import { useState, useRef } from 'react';
import { Button, Box, ButtonGroup, Menu, MenuItem } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface Props {
  onSync: () => void;
  onClassify: () => void;
  syncing: boolean;
  classifying: boolean;
  onClassifyNew?: () => void;
  classifyAllLabel?: string;
}

export default function TopBar({
  onSync, onClassify, syncing, classifying,
  onClassifyNew, classifyAllLabel = '全部分类',
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const hasModeSwitch = !!onClassifyNew;

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
      {hasModeSwitch ? (
        <ButtonGroup ref={anchorRef} size="small" sx={{ '& .MuiButton-root': { backgroundColor: '#FF6F00', '&:hover': { backgroundColor: '#E65100' } } }}>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={onClassify}
            disabled={syncing || classifying}
          >
            {classifying ? '分类中...' : classifyAllLabel}
          </Button>
          <Button
            variant="contained"
            size="small"
            disabled={syncing || classifying}
            onClick={() => setMenuOpen(true)}
            sx={{ minWidth: 28, px: 0.5 }}
          >
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>
      ) : (
        <Button
          variant="contained"
          size="small"
          startIcon={<AutoAwesomeIcon />}
          onClick={onClassify}
          disabled={syncing || classifying}
          sx={{ backgroundColor: '#FF6F00', '&:hover': { backgroundColor: '#E65100' } }}
        >
          {classifying ? '分类中...' : classifyAllLabel}
        </Button>
      )}
      <Menu
        anchorEl={anchorRef.current}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      >
        <MenuItem
          selected={true}
          onClick={() => { setMenuOpen(false); onClassify(); }}
        >
          全部分类
        </MenuItem>
        <MenuItem
          onClick={() => { setMenuOpen(false); onClassifyNew?.(); }}
        >
          仅新增
        </MenuItem>
      </Menu>
    </Box>
  );
}
