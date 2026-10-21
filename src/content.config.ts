import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { ficheSchema } from './lib/fiche-schema';

const fiches = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/fiches' }),
  schema: ficheSchema,
});

export const collections = { fiches };
