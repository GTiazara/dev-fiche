import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { ficheSchema } from './lib/fiche-schema';
import { createFicheIdGenerator } from './lib/fiche-id';

// Une seule instance pour toute la collection : elle retient les noms déjà vus.
const generateFicheId = createFicheIdGenerator();

// Les fiches peuvent être rangées en sous-dossiers : l'identifiant, donc l'adresse,
// vient du seul nom du fichier. Un doublon de nom fait échouer le build.
const fiches = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/fiches',
    generateId: ({ entry }: { entry: string }) => generateFicheId(entry),
  }),
  schema: ficheSchema,
});

export const collections = { fiches };
