import { difficultyLabel, technologyLabel } from '../data/technologies';
import { plainTextFromMarkdown, headingsFromMarkdown } from './search';
import { readingMinutes } from './reading-time';
import { withBase } from './paths';

export type FicheEntryLike = {
  id: string;
  body?: string;
  data: {
    title: string;
    description: string;
    technology: string;
    difficulty: string;
    tags: string[];
    updatedAt: Date;
    draft?: boolean;
    quiz?: unknown[];
    image?: string;
    imageAlt?: string;
  };
};

/**
 * Fiches visibles sur le site.
 * Un brouillon n'entre ni dans la liste, ni dans la recherche, ni dans les compteurs.
 */
export function publishedFiches<T extends { data: { draft?: boolean } }>(entries: T[]): T[] {
  return entries.filter((entry) => entry.data.draft !== true);
}

/**
 * Nombre de fiches publiées.
 * Reçoit toutes les fiches, brouillons compris. Ne compte pas les brouillons.
 */
export function publishedCount<T extends { data: { draft?: boolean } }>(entries: T[]): number {
  return publishedFiches(entries).length;
}

/**
 * Trie les fiches de la mise à jour la plus récente à la plus ancienne.
 * Reçoit des fiches déjà filtrées. N'enlève aucun brouillon : ce filtre est fait avant.
 */
export function sortByUpdatedDesc<T extends { data: { updatedAt: Date } }>(entries: T[]): T[] {
  return [...entries].sort(
    (left, right) => right.data.updatedAt.getTime() - left.data.updatedAt.getTime(),
  );
}

/**
 * Compte les valeurs distinctes d'un champ.
 * Sert aux compteurs de l'accueil, calculés sur les fiches publiées seulement.
 */
export function distinctCount<T>(entries: T[], pick: (entry: T) => string): number {
  return new Set(entries.map(pick)).size;
}

export type SearchDocument = {
  id: string;
  href: string;
  title: string;
  description: string;
  technology: string;
  technologyLabel: string;
  difficulty: string;
  difficultyLabel: string;
  minutes: number;
  tags: string[];
  headings: string[];
  body: string;
  image?: string;
  imageAlt: string;
};

/**
 * Document d'index pour une fiche publiée.
 * Reçoit la fiche et la base d'adresse. Le corps inclus est le texte brut, pas le frontmatter.
 */
export function toSearchDocument(entry: FicheEntryLike, base = '/'): SearchDocument {
  const markdown = entry.body ?? '';
  const headings = headingsFromMarkdown(markdown);
  const body = plainTextFromMarkdown(markdown);
  return {
    id: entry.id,
    href: withBase(`/fiches/${entry.id}`, base),
    title: entry.data.title,
    description: entry.data.description,
    technology: entry.data.technology,
    technologyLabel: technologyLabel(entry.data.technology),
    difficulty: entry.data.difficulty,
    difficultyLabel: difficultyLabel(entry.data.difficulty),
    minutes: readingMinutes(body),
    tags: entry.data.tags,
    headings,
    body,
    image: entry.data.image ? withBase(entry.data.image, base) : undefined,
    imageAlt: entry.data.imageAlt ?? '',
  };
}

/**
 * Index de recherche.
 * Reçoit toutes les fiches. Les brouillons en sont absents.
 */
export function searchDocuments(entries: FicheEntryLike[], base = '/'): SearchDocument[] {
  return publishedFiches(entries).map((entry) => toSearchDocument(entry, base));
}
