import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import { unified } from '@astrojs/markdown-remark';
import { remarkRetenir } from './src/lib/remark-retenir';

/**
 * Configuration principale Astro.
 * En local, `site` reste vide et `base` vaut `/`.
 * En CI, le workflow GitHub Actions résout dynamiquement l'URL et le chemin de base
 * (domaine personnalisé ou sous-dossier de dépôt) via `actions/configure-pages`.
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
