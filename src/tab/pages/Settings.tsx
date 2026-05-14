import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, ToggleButtonGroup, ToggleButton,
  Alert, InputAdornment, IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { Provider, Settings as SettingsType } from '@/tab/types';
import { PROVIDER_CONFIGS } from '@/tab/types';

interface Props {
  settings: SettingsType;
  onSave: (s: SettingsType) => void;
  onBack: () => void;
}

export default function Settings({ settings, onSave, onBack }: Props) {
  const [provider, setProvider] = useState<Provider>(settings.provider || 'deepseek');
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model);
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProvider(settings.provider || 'deepseek');
    setApiKey(settings.apiKey);
    setModel(settings.model);
    setBaseUrl(settings.baseUrl);
  }, [settings]);

  const handleProviderChange = (_: unknown, value: Provider | null) => {
    if (!value) return;
    setProvider(value);
    const cfg = PROVIDER_CONFIGS[value];
    if (value !== 'custom') {
      setBaseUrl(cfg.baseUrl);
      setModel(cfg.defaultModel);
    }
  };

  const handleSave = () => {
    onSave({ provider, apiKey, model, baseUrl });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <IconButton onClick={onBack}><ArrowBackIcon /></IconButton>
        <Typography variant="h5" fontWeight={600}>设置</Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        API 提供商
      </Typography>
      <ToggleButtonGroup
        value={provider}
        exclusive
        onChange={handleProviderChange}
        size="small"
        sx={{ mb: 3, width: '100%', '& .MuiToggleButton-root': { flex: 1 } }}
      >
        <ToggleButton value="deepseek">DeepSeek</ToggleButton>
        <ToggleButton value="openai">OpenAI</ToggleButton>
        <ToggleButton value="claude">Claude</ToggleButton>
        <ToggleButton value="custom">自定义</ToggleButton>
      </ToggleButtonGroup>

      <TextField
        label="API Key"
        type={showKey ? 'text' : 'password'}
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setShowKey(!showKey)}>
                {showKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="模型"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
      />

      {provider === 'custom' && (
        <TextField
          label="Base URL"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          fullWidth
          size="small"
          sx={{ mb: 2 }}
        />
      )}

      <Alert severity="info" sx={{ mb: 2, fontSize: 13 }}>
        API Key 仅存储在本地浏览器中，不会上传到任何第三方服务器。
      </Alert>

      <Button
        variant="contained"
        fullWidth
        onClick={handleSave}
        disabled={!apiKey}
      >
        {saved ? '已保存' : '保存设置'}
      </Button>
    </Box>
  );
}
