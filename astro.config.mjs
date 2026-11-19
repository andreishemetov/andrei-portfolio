// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.shemetau.eu',
  adapter: vercel(),
  integrations: [sitemap()],
});
