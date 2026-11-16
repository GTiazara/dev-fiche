# Proposal

## Why

Les 49 fiches sont toutes à plat dans `src/content/fiches/`. Le mainteneur ne retrouve plus ses fichiers qu'à l'aide du préfixe du nom (`git_`, `hpc_`, `ml_`). Il veut les ranger dans des sous-dossiers par sujet, sans casser les adresses que les visiteurs ont déjà.

Aujourd'hui, un fichier dans un sous-dossier fait échouer le build (`Missing parameter: slug`), parce que l'identifiant de la fiche contient alors un `/` que les routes refusent.

## What Changes

- Permettre de déposer une fiche à n'importe quelle profondeur sous `src/content/fiches/`.
- L'adresse d'une fiche reste plate : `/fiches/<nom-du-fichier>`, sans le dossier. Le dossier ne sert qu'à ranger.
- Deux fiches ne peuvent pas porter le même nom de fichier, même dans deux dossiers différents. Le build échoue et nomme les deux chemins.
- Le dossier n'a aucun effet sur la technologie, la difficulté, la recherche ou le tri. La technologie vient toujours du frontmatter.
- Ranger les 49 fiches existantes dans des dossiers par sujet. Leurs adresses ne changent pas.
- Mettre à jour la documentation du dépôt qui dit « le nom du fichier est l'identifiant ».

Hypothèses retenues :

- L'identifiant d'une fiche est le nom du fichier sans extension, sans les dossiers. Pour les fiches actuelles, il est identique à l'identifiant d'aujourd'hui.
- Un dossier est un simple regroupement éditorial. Il n'est pas affiché au visiteur et n'a pas de page propre.
- La profondeur n'est pas limitée, mais le rangement fourni ici n'utilise qu'un niveau.

## Capabilities

### New Capabilities

- `fiche-organisation`: le mainteneur range les fiches en sous-dossiers, et le visiteur ne voit ni dossier ni changement d'adresse.

### Modified Capabilities

Aucune. Le dépôt n'a pas de spécification durable pour cette capacité.

## Impact

- Chargement de la collection (`src/content.config.ts`) : calcul de l'identifiant et détection des doublons.
- Les routes `src/pages/fiches/[slug].astro` et `[slug]/quiz.astro` restent identiques : leur paramètre ne contient jamais de `/`.
- Déplacement de fichiers dans `src/content/fiches/`, sans modifier leur contenu.
- Documentation : `README.md`, `docs/TECHNICAL_SPEC.md`.
- Tests : un test sur le calcul de l'identifiant et sur les doublons.
