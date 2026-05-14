import { useState, useEffect, useCallback } from 'react';
import type { Bookmark } from '@/tab/types';
import { aiService } from '@/tab/services/aiService';
import { storageService } from '@/tab/services/storageService';

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [classifications, setClassifications] = useState<Record<string, string>>({});
  const [classifying, setClassifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    storageService.getCategories().then(setCategories);
    storageService.getClassifications().then(setClassifications);
  }, []);

  const classify = useCallback(async (
    bookmarks: Bookmark[],
    settings: { apiKey: string; model: string; baseUrl: string }
  ) => {
    if (!settings.apiKey) {
      setError('请先配置 API Key');
      return;
    }

    setClassifying(true);
    setError(null);

    try {
      const storedCategories = await storageService.getCategories();
      const storedClassifications = await storageService.getClassifications();
      const isFirst = storedCategories.length === 0;

      const toClassify = isFirst
        ? bookmarks
        : bookmarks.filter((b) => !storedClassifications[b.id]);

      if (toClassify.length === 0) {
        setCategories(storedCategories);
        setClassifications(storedClassifications);
        setClassifying(false);
        return;
      }

      const result = await aiService.classifyBatch(
        toClassify,
        storedCategories,
        settings.apiKey,
        settings.model,
        settings.baseUrl
      );

      if (isFirst && result.categories && result.categories.length > 0) {
        await storageService.saveCategories(result.categories);
        setCategories(result.categories);
      } else {
        setCategories(storedCategories);
      }

      const merged = { ...storedClassifications, ...result.assignments };
      await storageService.saveClassifications(merged);
      setClassifications(merged);
    } catch (e) {
      setError(e instanceof Error ? e.message : '分类失败');
    } finally {
      setClassifying(false);
    }
  }, []);

  return { categories, classifications, classifying, error, classify, setError };
}
