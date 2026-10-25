/**
 * Technologies autorisées pour une fiche. Ajouter une entrée ici l'autorise dans le schéma.
 * `icon` est facultatif : chemin d'un fichier du dossier public/, par exemple /images/technologies/git.svg.
 */
export const technologies = [
  { slug: 'javascript', label: 'JavaScript' },
  { slug: 'python', label: 'Python' },
  { slug: 'git', label: 'Git' },
  { slug: 'ia_agent', label: 'IA Agent', icon: '/images/technologies/ia-agent.svg' },
  {
    slug: 'transfert_fichiers',
    label: 'Transfert de fichiers',
    icon: '/images/technologies/transfert-fichiers.svg',
  },
  {
    slug: 'reseau',
    label: 'Réseau',
    icon: '/images/technologies/reseau.svg',
  },
] as const;

/** Icône facultative d'une technologie, ou undefined. */
export function technologyIcon(slug: string): string | undefined {
  const found: { icon?: string } | undefined = technologies.find((item) => item.slug === slug);
  return found?.icon;
}

export const technologySlugs = technologies.map((item) => item.slug) as [
  (typeof technologies)[number]['slug'],
  ...(typeof technologies)[number]['slug'][],
];

export const difficulties = ['debutant', 'intermediaire', 'avance'] as const;

export const difficultyLabels: Record<(typeof difficulties)[number], string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
};

/**
 * Libellé affiché pour un slug de technologie.
 * Reçoit le slug. Renvoie le nom lisible, ou le slug s'il est inconnu.
 */
export function technologyLabel(slug: string): string {
  return technologies.find((item) => item.slug === slug)?.label ?? slug;
}

/**
 * Libellé affiché pour un niveau.
 * Reçoit le slug du niveau. Renvoie le libellé français.
 */
export function difficultyLabel(slug: string): string {
  if (slug === 'debutant' || slug === 'intermediaire' || slug === 'avance') {
    return difficultyLabels[slug];
  }
  return slug;
}
