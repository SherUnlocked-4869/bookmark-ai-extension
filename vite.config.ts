import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import { resolve } from 'path';
import { fileURLToPath } from 'node:url';
import manifest from './src/manifest';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') }
  }
});
