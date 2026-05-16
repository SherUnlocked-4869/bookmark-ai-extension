import { useState, useEffect, useCallback } from 'react';
import type { Bookmark } from '@/tab/types';
import { aiService } from '@/tab/services/aiService';
import { storageService } from '@/tab/services/storageService';

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [classifications, setClassifications] = useState<Record<string, string>>({});
  const [classifying, setClassifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

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
    setProgress('正在获取已有分类数据...');

    try {
      const storedCategories = await storageService.getCategories();
      const storedClassifications = await storageService.getClassifications();

      // Detect inconsistency: if classifications reference categories that don't exist
      // (leftover from the previous bug), force a fresh re-classification.
      const categorySet = new Set(storedCategories);
      const hasOrphaned = storedCategories.length > 0 &&
        Object.keys(storedClassifications).length > 0 &&
        Object.values(storedClassifications).some(cat => !categorySet.has(cat));

      const isFirst = storedCategories.length === 0 || hasOrphaned;

      const toClassify = isFirst
        ? bookmarks
        : bookmarks.filter((b) => !storedClassifications[b.id]);

      if (toClassify.length === 0) {
        setCategories(storedCategories);
        setClassifications(storedClassifications);
        setProgress('');
        setClassifying(false);
        return;
      }

      setProgress(isFirst
        ? `正在分析 ${toClassify.length} 个书签并创建分类...（这可能需要 1-2 分钟）`
        : `正在分类 ${toClassify.length} 个新书签...`
      );

      const result = await aiService.classifyBatch(
        toClassify,
        isFirst ? [] : storedCategories,
        settings.apiKey,
        settings.model,
        settings.baseUrl
      );

      if (isFirst) {
        // Fresh classification — overwrite everything
        await storageService.saveCategories(result.categories);
        setCategories(result.categories);
        await storageService.saveClassifications(result.assignments);
        setClassifications(result.assignments);
      } else {
        setCategories(storedCategories);
        const merged = { ...storedClassifications, ...result.assignments };
        await storageService.saveClassifications(merged);
        setClassifications(merged);
      }
      setProgress('');
    } catch (e) {
      setError(e instanceof Error ? e.message : '分类失败');
    } finally {
      setClassifying(false);
      setProgress('');
    }
  }, []);

  return { categories, classifications, classifying, progress, error, classify, setError, setClassifications };
}
