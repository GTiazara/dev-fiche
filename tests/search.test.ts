import { describe, expect, it } from 'vitest';
import { ficheMatchesQuery, type SearchableFiche } from '../src/lib/search';

const fiche: SearchableFiche = {
  title: 'Les fonctions',
  description: 'Regrouper des instructions',
  headings: ['Définition'],
  body: 'La réaffectation du lien est un autre sujet.',
  technology: 'javascript',
  difficulty: 'debutant',
};

describe('ficheMatchesQuery', () => {
  it('accepte Fonction pour fonction', () => {
    expect(ficheMatchesQuery(fiche, 'Fonction')).toBe(true);
  });

  it('ignore les accents', () => {
    expect(ficheMatchesQuery(fiche, 'reaffectation')).toBe(true);
  });

  it('refuse un mot absent', () => {
    expect(ficheMatchesQuery(fiche, 'zzzz-absent')).toBe(false);
  });
});
