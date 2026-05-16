import { useState, useCallback } from 'react';
import type { Bookmark, DedupGroup, DedupReport } from '@/tab/types';
import { storageService } from '@/tab/services/storageService';

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, ' ');
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
    }
  }
  return dp[m][n];
}

function isSimilarTitle(a: string, b: string): boolean {
  const na = normalizeTitle(a);
  const nb = normalizeTitle(b);
  if (na === nb) return true;
  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return true;
  const distance = levenshteinDistance(na, nb);
  return 1 - distance / maxLen > 0.8;
}

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

function findDuplicates(bookmarks: Bookmark[], classifications: Record<string, string>): DedupGroup[] {
  const withUrl = bookmarks.filter((b) => b.url);
  const groups: DedupGroup[] = [];
  const used = new Set<string>();

  // Exact URL duplicates
  const urlMap = new Map<string, Bookmark[]>();
  for (const b of withUrl) {
    if (!b.url) continue;
    const existing = urlMap.get(b.url) || [];
    existing.push(b);
    urlMap.set(b.url, existing);
  }
  for (const [, items] of urlMap) {
    if (items.length >= 2) {
      for (const b of items) used.add(b.id);
      groups.push({
        type: 'exact',
        bookmarks: items,
        keepIndex: 0,
        category: classifications[items[0].id],
      });
    }
  }

  // Similar title + same domain
  const remaining = withUrl.filter((b) => !used.has(b.id));
  for (let i = 0; i < remaining.length; i++) {
    if (used.has(remaining[i].id)) continue;
    const similar: Bookmark[] = [remaining[i]];
    used.add(remaining[i].id);
    for (let j = i + 1; j < remaining.length; j++) {
      if (used.has(remaining[j].id)) continue;
      if (
        getDomain(remaining[i].url || '') === getDomain(remaining[j].url || '') &&
        isSimilarTitle(remaining[i].title, remaining[j].title) &&
        remaining[i].url !== remaining[j].url
      ) {
        similar.push(remaining[j]);
        used.add(remaining[j].id);
      }
    }
    if (similar.length >= 2) {
      groups.push({
        type: 'similar',
        bookmarks: similar,
        keepIndex: 0,
        category: classifications[similar[0].id],
      });
    }
  }

  return groups;
}

export function useDedup() {
  const [groups, setGroups] = useState<DedupGroup[]>([]);
  const [scanning, setScanning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [report, setReport] = useState<DedupReport | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const scan = useCallback(async (
    bookmarks: Bookmark[],
    classifications: Record<string, string>
  ) => {
    setScanning(true);
    await new Promise((r) => setTimeout(r, 100));
    try {
      const found = findDuplicates(bookmarks, classifications);
      setGroups(found);
      const initial = new Set<string>();
      for (const g of found) {
        for (let i = 0; i < g.bookmarks.length; i++) {
          if (i !== g.keepIndex) initial.add(g.bookmarks[i].id);
        }
      }
      setSelectedIds(initial);
      setReport({ duplicateGroups: found.length, duplicateCount: initial.size, deletedCount: 0 });
    } finally {
      setScanning(false);
    }
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    const all = new Set<string>();
    for (const g of groups) {
      for (let i = 0; i < g.bookmarks.length; i++) {
        if (i !== g.keepIndex) all.add(g.bookmarks[i].id);
      }
    }
    setSelectedIds(all);
  }, [groups]);

  const invertSelection = useCallback(() => {
    const all = new Set<string>();
    for (const g of groups) {
      for (let i = 0; i < g.bookmarks.length; i++) {
        if (i !== g.keepIndex) all.add(g.bookmarks[i].id);
      }
    }
    setSelectedIds((prev) => {
      const next = new Set<string>();
      for (const id of all) {
        if (!prev.has(id)) next.add(id);
      }
      return next;
    });
  }, [groups]);

  const removeSelected = useCallback(async () => {
    setDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      for (const id of ids) {
        await chrome.bookmarks.remove(id);
      }
      const newReport: DedupReport = {
        duplicateGroups: groups.length,
        duplicateCount: 0,
        deletedCount: selectedIds.size,
      };
      setReport(newReport);
      await storageService.saveDedupReport(newReport);
      setGroups([]);
      setSelectedIds(new Set());
    } finally {
      setDeleting(false);
    }
  }, [selectedIds, groups]);

  return {
    groups, scanning, deleting, report, selectedIds,
    scan, toggleSelect, selectAll, invertSelection, removeSelected,
  };
}
