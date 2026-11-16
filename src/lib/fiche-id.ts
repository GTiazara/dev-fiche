/**
 * Identifiant d'une fiche : le nom du fichier sans dossier ni extension.
 * Reçoit le chemin relatif de l'entrée dans `src/content/fiches/`, par exemple
 * `git/git_gitignore.md`. Renvoie `git_gitignore`.
 * Le dossier ne sert qu'à ranger : il ne doit jamais entrer dans l'adresse.
 */
export function ficheIdFromPath(entry: string): string {
  // Les chemins de Windows utilisent `\` : on les ramène à `/` avant de couper.
  const fileName = entry.replace(/\\/g, '/').split('/').pop() ?? entry;
  return fileName.replace(/\.md$/i, '');
}

/**
 * Fabrique la fonction d'identifiant du chargeur, avec sa mémoire des doublons.
 * Renvoie une fonction qui reçoit le chemin d'une entrée et renvoie son identifiant.
 * Effet de bord : retient quel chemin a produit quel identifiant, et lève une erreur
 * si un autre chemin produit le même identifiant.
 */
export function createFicheIdGenerator(): (entry: string) => string {
  // Identifiant -> chemin qui l'a produit en premier.
  const seen = new Map<string, string>();

  return (entry: string): string => {
    const id = ficheIdFromPath(entry);
    const previous = seen.get(id);
    // Même chemin : simple rechargement (mode développement), pas un doublon.
    // Chemin différent : Astro garderait une seule entrée sans erreur, une fiche disparaîtrait.
    if (previous !== undefined && previous !== entry) {
      throw new Error(
        `Deux fiches portent le même nom de fichier « ${id} » : ${previous} et ${entry}. ` +
          'Le nom du fichier est l\'adresse de la fiche : il doit être unique.',
      );
    }
    seen.set(id, entry);
    return id;
  };
}
