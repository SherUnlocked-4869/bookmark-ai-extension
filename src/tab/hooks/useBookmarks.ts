import { useState, useEffect, useCallback } from 'react';
import type { Bookmark } from '@/tab/types';
import { bookmarkService } from '@/tab/services/bookmarkService';
import { storageService } from '@/tab/services/storageService';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  useEffect(() => {
    storageService.getLastSyncTime().then(setLastSyncTime);
    storageService.getBookmarksSnapshot().then(setBookmarks);
  }, []);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      const fresh = await bookmarkService.getAllBookmarks();
      setBookmarks(fresh);
      const now = Date.now();
      await storageService.saveBookmarksSnapshot(fresh);
      await storageService.saveLastSyncTime(now);
      setLastSyncTime(now);
    } finally {
      setSyncing(false);
    }
  }, []);

  return { bookmarks, syncing, lastSyncTime, sync };
}
