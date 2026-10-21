import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import { unified } from '@astrojs/markdown-remark';
import { remarkRetenir } from './src/lib/remark-retenir';

/**
 * Seul endroit pour l'adresse GitHub Pages.
 * En local, `site` reste vide et `base` vaut `/`. Le workflow de publication fournit
 * SITE_URL (https://<utilisateur>.github.io) et SITE_BASE (/<depot>/) pour un site de projet.
 */
export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || undefined,
  base: process.env.SITE_BASE || '/',
  integrations: [vue()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: { theme: 'github-dark' },
    processor: unified({ remarkPlugins: [remarkRetenir] }),
  },
});
