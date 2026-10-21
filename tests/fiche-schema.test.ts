import { describe, expect, it } from 'vitest';
import { ficheSchema } from '../src/lib/fiche-schema';

const valid = {
  title: 'Titre',
  description: 'Extrait',
  technology: 'javascript',
  difficulty: 'debutant',
  tags: [],
  publishedAt: '2026-10-01',
  updatedAt: '2026-10-01',
};

describe('ficheSchema', () => {
  it('accepte une fiche minimale', () => {
    expect(ficheSchema.safeParse(valid).success).toBe(true);
  });

  it('rejette un fichier sans titre', () => {
    const { title, ...withoutTitle } = valid;
    expect(ficheSchema.safeParse(withoutTitle).success).toBe(false);
  });

  it('rejette une technologie inconnue', () => {
    expect(ficheSchema.safeParse({ ...valid, technology: 'rust' }).success).toBe(false);
  });

  it('rejette un quiz de deux questions', () => {
    const quiz = [question(), question()];
    expect(ficheSchema.safeParse({ ...valid, quiz }).success).toBe(false);
  });

  it('rejette un index de réponse hors des choix', () => {
    const quiz = [question(9), question(), question()];
    expect(ficheSchema.safeParse({ ...valid, quiz }).success).toBe(false);
  });
});

function question(answer = 0) {
  return {
    question: 'Question ?',
    choices: ['a', 'b'],
    answer,
    explanation: 'Parce que.',
  };
}
