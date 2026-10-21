import { describe, expect, it } from 'vitest';
import { publishedCount, publishedFiches, searchDocuments } from '../src/lib/fiches';

const published = entry('visible', false);
const draft = entry('secret', true);

describe('fiches publiées', () => {
  it('retire le brouillon de la liste, de la recherche et des compteurs', () => {
    const all = [published, draft];
    expect(publishedFiches(all).map((item) => item.id)).toEqual(['visible']);
    expect(searchDocuments(all).map((item) => item.id)).toEqual(['visible']);
    expect(publishedCount(all)).toBe(1);
  });
});

function entry(id: string, draft: boolean) {
  return {
    id,
    body: '## Définition\n\nTexte publié.',
    data: {
      title: id,
      description: 'Extrait',
      technology: 'git',
      difficulty: 'debutant',
      tags: [],
      updatedAt: new Date('2026-10-01'),
      draft,
    },
  };
}
