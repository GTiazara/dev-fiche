import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createFicheIdGenerator, ficheIdFromPath } from '../src/lib/fiche-id';

describe('identifiant d\'une fiche', () => {
  it('garde le nom du fichier pour une fiche à la racine', () => {
    expect(ficheIdFromPath('git_gitignore.md')).toBe('git_gitignore');
  });

  it('ignore un dossier, ou deux', () => {
    expect(ficheIdFromPath('git/git_gitignore.md')).toBe('git_gitignore');
    expect(ficheIdFromPath('ml/avance/ml_algo_advanced.md')).toBe('ml_algo_advanced');
  });

  it('accepte un chemin écrit avec des antislashs', () => {
    expect(ficheIdFromPath('git\\git_gitignore.md')).toBe('git_gitignore');
  });
});

describe('doublons de nom de fichier', () => {
  it('refuse deux chemins qui donnent le même identifiant et les cite', () => {
    const generate = createFicheIdGenerator();
    generate('git/les-branches.md');
    expect(() => generate('python/les-branches.md')).toThrow(
      /git\/les-branches\.md.*python\/les-branches\.md/,
    );
  });

  it('accepte de revoir le même chemin (rechargement)', () => {
    const generate = createFicheIdGenerator();
    generate('git/les-branches.md');
    expect(generate('git/les-branches.md')).toBe('les-branches');
  });
});

describe('fiches du dépôt', () => {
  /**
   * Liste tous les fichiers Markdown sous un dossier, sous-dossiers compris.
   * Reçoit le dossier de départ et renvoie les chemins relatifs à la racine des fiches.
   */
  function markdownFiles(root: string, relative = ''): string[] {
    return readdirSync(join(root, relative), { withFileTypes: true }).flatMap((item) => {
      const path = relative ? `${relative}/${item.name}` : item.name;
      if (item.isDirectory()) return markdownFiles(root, path);
      return item.name.endsWith('.md') ? [path] : [];
    });
  }

  it('n\'ont pas deux fois le même nom de fichier', () => {
    const generate = createFicheIdGenerator();
    // Lève une erreur au premier doublon, avec les deux chemins dans le message.
    for (const file of markdownFiles('src/content/fiches')) generate(file);
  });
});
