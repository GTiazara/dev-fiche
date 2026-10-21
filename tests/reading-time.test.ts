import { describe, expect, it } from 'vitest';
import { readingMinutes } from '../src/lib/reading-time';

describe('readingMinutes', () => {
  it('donne une minute à un texte court', () => {
    expect(readingMinutes('un mot')).toBe(1);
  });

  it('compte un texte plus long à raison de 200 mots par minute', () => {
    const text = Array.from({ length: 500 }, () => 'mot').join(' ');
    expect(readingMinutes(text)).toBe(3);
  });
});
