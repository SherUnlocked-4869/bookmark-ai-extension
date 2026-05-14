import { useState, useEffect, useCallback } from 'react';
import type { Settings } from '@/tab/types';
import { DEFAULT_SETTINGS } from '@/tab/types';
import { storageService } from '@/tab/services/storageService';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    storageService.getSettings().then((s) => {
      setSettings(s);
      setLoaded(true);
    });
  }, []);

  const saveSettings = useCallback(async (s: Settings) => {
    await storageService.saveSettings(s);
    setSettings(s);
  }, []);

  return { settings, saveSettings, loaded };
}
