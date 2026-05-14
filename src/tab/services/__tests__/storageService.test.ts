import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockStorage: Record<string, unknown> = {};

vi.stubGlobal('chrome', {
  storage: {
    local: {
      get: vi.fn((keys: string | string[] | Record<string, unknown>) => {
        const ks = Array.isArray(keys) ? keys : typeof keys === 'string' ? [keys] : Object.keys(keys);
        const result: Record<string, unknown> = {};
        for (const k of ks) {
          if (k in mockStorage) result[k] = mockStorage[k];
        }
        return Promise.resolve(result);
      }),
      set: vi.fn((items: Record<string, unknown>) => {
        Object.assign(mockStorage, items);
        return Promise.resolve();
      }),
    },
  },
});

import { storageService } from '@/tab/services/storageService';

describe('storageService', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  });

  it('getSettings returns defaults when nothing stored', async () => {
    const s = await storageService.getSettings();
    expect(s.apiKey).toBe('');
    expect(s.model).toBe('deepseek-v4-flash');
    expect(s.baseUrl).toBe('https://api.deepseek.com');
    expect(s.provider).toBe('deepseek');
  });

  it('saveSettings + getSettings roundtrip', async () => {
    await storageService.saveSettings({ apiKey: 'sk-test', model: 'gpt-4', baseUrl: 'https://api.openai.com/v1', provider: 'openai' });
    const s = await storageService.getSettings();
    expect(s.apiKey).toBe('sk-test');
    expect(s.provider).toBe('openai');
  });

  it('getCategories returns empty array by default', async () => {
    const cats = await storageService.getCategories();
    expect(cats).toEqual([]);
  });

  it('saveCategories + getCategories roundtrip', async () => {
    await storageService.saveCategories(['开发', '设计']);
    const cats = await storageService.getCategories();
    expect(cats).toEqual(['开发', '设计']);
  });

  it('getClassifications returns empty object by default', async () => {
    const cls = await storageService.getClassifications();
    expect(cls).toEqual({});
  });

  it('saveClassifications + getClassifications roundtrip', async () => {
    await storageService.saveClassifications({ '1': '开发', '2': '设计' });
    const cls = await storageService.getClassifications();
    expect(cls).toEqual({ '1': '开发', '2': '设计' });
  });
});
