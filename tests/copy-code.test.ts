import { describe, expect, it } from 'vitest';
import { textToCopy } from '../src/lib/copy-code';

describe('textToCopy', () => {
  it('reprend le texte affiché, espaces compris', () => {
    const displayed = 'const prenom = "Alex";\n';
    expect(textToCopy(displayed)).toBe(displayed);
  });
});
