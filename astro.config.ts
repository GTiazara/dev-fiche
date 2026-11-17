import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { unified } from '@astrojs/markdown-remark';
import { remarkRetenir } from './src/lib/remark-retenir';

const site = process.env.SITE_URL || undefined;

/**
 * Indique si une adresse entre dans le plan des moteurs.
 * Reçoit l'adresse absolue d'une page. Renvoie false pour la page introuvable
 * et pour l'index JSON de recherche.
 */
function pageEstIndexable(page: string): boolean {
  return !page.includes('/404') && !page.includes('search-index.json');
}

/**
 * Configuration principale Astro.
 * En local, `site` reste vide et `base` vaut `/`.
 * En CI, le workflow GitHub Actions résout dynamiquement l'URL et le chemin de base
 * (domaine personnalisé ou sous-dossier de dépôt) via `actions/configure-pages`.
 * Le plan de site n'est produit que lorsque `site` est une adresse absolue.
 */
export default defineConfig({
  output: 'static',
  site,
  base: process.env.SITE_BASE || '/',
  integrations: [vue(), ...(site ? [sitemap({ filter: pageEstIndexable })] : [])],
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        // Ces dossiers ne changent jamais la page en développement. Ne pas les surveiller
        // économise des surveillances `inotify` : la limite de Linux est partagée avec
        // l'éditeur, et `astro dev` plante avec ENOSPC quand elle est atteinte.
        // `src/` et `public/` restent surveillés.
        ignored: ['**/openspec/**', '**/docs/**', '**/tests/**', '**/e2e/**', '**/.agents/**', '**/dist/**'],
      },
    },
  },
  markdown: {
    shikiConfig: { theme: 'github-dark' },
    processor: unified({ remarkPlugins: [remarkRetenir] }),
  },
});
