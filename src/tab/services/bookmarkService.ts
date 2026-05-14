import type { Bookmark } from '@/tab/types';

function flattenTree(node: chrome.bookmarks.BookmarkTreeNode): Bookmark[] {
  const bookmarks: Bookmark[] = [];
  if (node.url) {
    bookmarks.push({
      id: node.id,
      title: node.title,
      url: node.url,
      parentId: node.parentId,
      dateAdded: node.dateAdded,
    });
  }
  if (node.children) {
    for (const child of node.children) {
      bookmarks.push(...flattenTree(child));
    }
  }
  return bookmarks;
}

export const bookmarkService = {
  async getAllBookmarks(): Promise<Bookmark[]> {
    const tree = await chrome.bookmarks.getTree();
    const all: Bookmark[] = [];
    for (const root of tree) {
      all.push(...flattenTree(root));
    }
    return all;
  },

  diffBookmarks(
    current: Bookmark[],
    previous: Bookmark[]
  ): { added: Bookmark[]; removed: string[] } {
    const currentIds = new Set(current.map((b) => b.id));
    const previousIds = new Set(previous.map((b) => b.id));
    const added = current.filter((b) => !previousIds.has(b.id));
    const removed = previous.filter((b) => !currentIds.has(b.id)).map((b) => b.id);
    return { added, removed };
  },
};
