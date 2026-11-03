/**
 * Technologies autorisées pour une fiche. Ajouter une entrée ici l'autorise dans le schéma.
 * `icon` est facultatif : chemin d'un fichier du dossier public/, par exemple /images/technologies/git.svg.
 */
export const technologies = [
  { slug: 'javascript', label: 'JavaScript', icon: '/images/technologies/javascript.svg' },
  { slug: 'python', label: 'Python', icon: '/images/technologies/python.svg' },
  { slug: 'linux', label: 'Linux', icon: '/images/technologies/linux.svg' },
  { slug: 'hpc', label: 'HPC', icon: '/images/technologies/hpc.svg' },
  { slug: 'git', label: 'Git', icon: '/images/technologies/git.svg' },
  { slug: 'devtools', label: 'DevTools', icon: '/images/technologies/devtools.svg' },
  { slug: 'ml', label: 'ML', icon: '/images/technologies/ml.svg' },
  { slug: 'deeplearning', label: 'Deep Learning', icon: '/images/technologies/deeplearning.svg' },
  { slug: 'backend', label: 'Backend', icon: '/images/technologies/backend.svg' },
  { slug: 'ia', label: 'IA', icon: '/images/technologies/ia.svg' },
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
  {
    slug: 'cloud',
    label: 'Cloud',
    icon: '/images/technologies/cloud.svg',
  },
] as const;

/** Icône facultative d'une technologie, ou undefined. */
export function technologyIcon(slug: string): string | undefined {
  const found = technologies.find((item) => item.slug === slug);
  return found && 'icon' in found ? found.icon : undefined;
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
