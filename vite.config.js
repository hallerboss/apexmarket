import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'

const isCloudflareBuild = process.env.CF_PAGES === '1';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  define: mode === 'github-pages' || isCloudflareBuild ? {
    'import.meta.env.VITE_BASE44_APP_ID': JSON.stringify('6a8447d4dfbc61d89c33872d'),
    'import.meta.env.VITE_BASE44_APP_BASE_URL': JSON.stringify('https://usa-wishlist.base44.app'),
    'import.meta.env.VITE_BASE44_SERVER_URL': JSON.stringify('https://base44.app'),
  } : {},
  plugins: [
    (mode === 'github-pages' || isCloudflareBuild) && {
      name: 'static-hosting-files',
      apply: 'build',
      generateBundle: {
        order: 'post',
        handler(_, bundle) {
          const entry = bundle['index.html'];
          if (!entry || entry.type !== 'asset') this.error('Missing built website entry.');
          if (isCloudflareBuild) {
            this.emitFile({ type: 'asset', fileName: '_redirects', source: '/* /index.html 200\n' });
          } else {
            this.emitFile({ type: 'asset', fileName: '404.html', source: entry.source });
            this.emitFile({ type: 'asset', fileName: 'CNAME', source: readFileSync(new URL('./CNAME', import.meta.url), 'utf8').trim() + '\n' });
            this.emitFile({ type: 'asset', fileName: '.nojekyll', source: '' });
          }
        },
      },
    },
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    }),
    react(),
  ]
}));