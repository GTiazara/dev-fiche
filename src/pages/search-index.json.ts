import { getCollection } from 'astro:content';
import { searchDocuments } from '../lib/fiches';

/**
 * Index JSON des fiches publiées, écrit au build.
 * Le navigateur l'utilise pour la recherche. Les brouillons n'y figurent pas.
 */
export const GET = async () => {
  const documents = searchDocuments(await getCollection('fiches'), import.meta.env.BASE_URL);
  return new Response(JSON.stringify(documents), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
