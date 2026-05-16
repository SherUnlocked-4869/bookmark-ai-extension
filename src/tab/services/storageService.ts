import type { Settings, Bookmark, DedupReport } from '@/tab/types';
import { DEFAULT_SETTINGS } from '@/tab/types';

const KEYS = {
  settings: 'settings',
  categories: 'categories',
  classifications: 'classifications',
  lastSyncTime: 'lastSyncTime',
  bookmarksSnapshot: 'bookmarksSnapshot',
  dedupReport: 'dedupReport',
  hiddenCategories: 'hiddenCategories',
} as const;

export const storageService = {
  async getSettings(): Promise<Settings> {
    const result = await chrome.storage.local.get(KEYS.settings);
    return { ...DEFAULT_SETTINGS, ...result[KEYS.settings] };
  },

  async saveSettings(settings: Settings): Promise<void> {
    await chrome.storage.local.set({ [KEYS.settings]: settings });
  },

  async getCategories(): Promise<string[]> {
    const result = await chrome.storage.local.get(KEYS.categories);
    return result[KEYS.categories] ?? [];
  },

  async saveCategories(categories: string[]): Promise<void> {
    await chrome.storage.local.set({ [KEYS.categories]: categories });
  },

  async getClassifications(): Promise<Record<string, string>> {
    const result = await chrome.storage.local.get(KEYS.classifications);
    return result[KEYS.classifications] ?? {};
  },

  async saveClassifications(classifications: Record<string, string>): Promise<void> {
    await chrome.storage.local.set({ [KEYS.classifications]: classifications });
  },

  async getLastSyncTime(): Promise<number | null> {
    const result = await chrome.storage.local.get(KEYS.lastSyncTime);
    return result[KEYS.lastSyncTime] ?? null;
  },

  async saveLastSyncTime(time: number): Promise<void> {
    await chrome.storage.local.set({ [KEYS.lastSyncTime]: time });
  },

  async getBookmarksSnapshot(): Promise<Bookmark[]> {
    const result = await chrome.storage.local.get(KEYS.bookmarksSnapshot);
    return result[KEYS.bookmarksSnapshot] ?? [];
  },

  async saveBookmarksSnapshot(bookmarks: Bookmark[]): Promise<void> {
    await chrome.storage.local.set({ [KEYS.bookmarksSnapshot]: bookmarks });
  },

  async getDedupReport(): Promise<DedupReport | null> {
    const result = await chrome.storage.local.get(KEYS.dedupReport);
    return result[KEYS.dedupReport] ?? null;
  },

  async saveDedupReport(report: DedupReport): Promise<void> {
    await chrome.storage.local.set({ [KEYS.dedupReport]: report });
  },

  async getHiddenCategories(): Promise<string[]> {
    const result = await chrome.storage.local.get(KEYS.hiddenCategories);
    return result[KEYS.hiddenCategories] ?? [];
  },

  async saveHiddenCategories(categories: string[]): Promise<void> {
    await chrome.storage.local.set({ [KEYS.hiddenCategories]: categories });
  },
};
