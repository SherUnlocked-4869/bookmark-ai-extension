import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: '书签智能分类',
  version: '1.0.0',
  description: '基于 AI 的 Chrome 书签智能分类扩展',
  permissions: ['bookmarks', 'storage'],
  action: { default_title: '书签智能分类' },
  web_accessible_resources: [
    {
      resources: ['index.html'],
      matches: ['<all_urls>'],
    },
  ],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module'
  },
  icons: {
    '16': 'public/icons/icon16.png',
    '32': 'public/icons/icon32.png',
    '48': 'public/icons/icon48.png',
    '128': 'public/icons/icon128.png'
  }
});
