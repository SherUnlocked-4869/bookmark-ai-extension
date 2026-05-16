import { useState, useEffect } from 'react';
import type { Bookmark, DedupReport } from '@/tab/types';
import { storageService } from '@/tab/services/storageService';

export interface CategoryStat {
  name: string;
  count: number;
}

export interface Stats {
  totalBookmarks: number;
  categoryCount: number;
  unclassifiedCount: number;
  duplicateCount: number;
  categoryDistribution: CategoryStat[];
}

export function useStats() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [classifications, setClassifications] = useState<Record<string, string>>({});
  const [dedupReport, setDedupReport] = useState<DedupReport | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      storageService.getBookmarksSnapshot(),
      storageService.getCategories(),
      storageService.getClassifications(),
      storageService.getDedupReport(),
    ]).then(([b, c, cl, r]) => {
      setBookmarks(b);
      setCategories(c);
      setClassifications(cl);
      setDedupReport(r);
      setLoaded(true);
    });
  }, []);

  const computeStats = (searchQuery?: string): Stats => {
    let filtered = bookmarks;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = bookmarks.filter(
        (b) => b.title.toLowerCase().includes(q) || (b.url && b.url.toLowerCase().includes(q))
      );
    }

    // For category distribution, count how many filtered bookmarks are in each category
    const distribution = categories
      .map((cat) => ({
        name: cat,
        count: filtered.filter((b) => classifications[b.id] === cat).length,
      }))
      .filter((s) => s.count > 0);

    const classified = new Set(Object.keys(classifications));
    const unclassifiedCount = filtered.filter((b) => !classified.has(b.id)).length;

    return {
      totalBookmarks: filtered.length,
      categoryCount: distribution.length,
      unclassifiedCount,
      duplicateCount: dedupReport?.duplicateCount ?? 0,
      categoryDistribution: distribution,
    };
  };

  return { loaded, computeStats };
}
