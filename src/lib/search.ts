/**
 * Réduit un texte pour la comparaison.
 * Reçoit le texte affiché. Renvoie la forme minuscule sans accents.
 * « Fonction » et « fonction » deviennent donc le même mot. Un mot différent reste différent.
 */
export function normalizeForSearch(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/**
 * Titres du corps, dans l'ordre du texte.
 * Reçoit le Markdown. Ne renvoie pas les titres du frontmatter.
 */
export function headingsFromMarkdown(markdown: string): string[] {
  return [...markdown.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) => match[1].trim());
}

/**
 * Réduit le Markdown en texte recherchable.
 * Reçoit le corps. Garde les mots des exemples, retire les délimiteurs.
 */
export function plainTextFromMarkdown(markdown: string): string {
  return markdown
    .replace(/```/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export type SearchableFiche = {
  title: string;
  description: string;
  headings: string[];
  body: string;
  technology: string;
  difficulty: string;
};

/**
 * Indique si chaque mot de la requête est présent dans la fiche.
 * La casse et les accents sont ignorés. Une requête vide laisse passer la fiche.
 */
export function ficheMatchesQuery(fiche: SearchableFiche, query: string): boolean {
  const words = normalizeForSearch(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalizeForSearch(
    [fiche.title, fiche.description, fiche.headings.join(' '), fiche.body].join('\n'),
  );
  return words.every((word) => haystack.includes(word));
}

/**
 * Applique les filtres de technologie et de niveau.
 * Une valeur vide signifie « tous ». Les deux filtres se cumulent.
 */
export function matchesFilters(
  fiche: { technology: string; difficulty: string },
  technology: string,
  difficulty: string,
): boolean {
  if (technology && fiche.technology !== technology) return false;
  if (difficulty && fiche.difficulty !== difficulty) return false;
  return true;
}
