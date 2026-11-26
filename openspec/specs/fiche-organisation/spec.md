# fiche-organisation Specification

## Purpose

Le mainteneur range les fiches dans des sous-dossiers de son choix. Le visiteur ne voit pas ce rangement et ne perd aucune adresse.

## Requirements

### Requirement: Fiches rangées en sous-dossiers
Une fiche déposée dans un sous-dossier de `src/content/fiches/`, à n'importe quelle profondeur, SHALL être publiée comme une fiche déposée à la racine. Son identifiant est le nom du fichier sans extension et sans dossier.

#### Scenario: Fiche dans un sous-dossier
- **WHEN** le mainteneur dépose `git/git_gitignore.md`
- **THEN** le build accepte la fiche
- **THEN** elle est disponible à l'adresse `/fiches/git_gitignore`
- **THEN** son quiz éventuel est à `/fiches/git_gitignore/quiz`

#### Scenario: Fiche à la racine
- **WHEN** le mainteneur dépose une fiche directement dans `src/content/fiches/`
- **THEN** elle est publiée à l'adresse `/fiches/<nom-du-fichier>`, comme avant

#### Scenario: Dossier imbriqué
- **WHEN** le mainteneur dépose `ml/avance/ml_algo_advanced.md`
- **THEN** l'adresse de la fiche est `/fiches/ml_algo_advanced`

### Requirement: Le dossier n'est pas visible et n'a aucun effet
Le dossier d'une fiche SHALL NOT apparaître dans une adresse, dans un lien, dans la recherche ou dans les pages du site. Il SHALL NOT changer la technologie, la difficulté, le tri ni la publication de la fiche.

#### Scenario: Technologie indépendante du dossier
- **WHEN** une fiche rangée dans `git/` nomme la technologie `securite` dans son frontmatter
- **THEN** elle apparaît dans la liste de `securite` et pas dans celle de `git`

#### Scenario: Brouillon dans un sous-dossier
- **WHEN** une fiche d'un sous-dossier est marquée `draft`
- **THEN** elle n'a ni page, ni carte, ni entrée de recherche, comme un brouillon à la racine

### Requirement: Nom de fichier unique
Deux fiches SHALL NOT porter le même nom de fichier, même rangées dans deux dossiers différents. Le build échoue dans ce cas et le message nomme les deux chemins.

#### Scenario: Même nom dans deux dossiers
- **WHEN** `git/les-branches.md` et `python/les-branches.md` existent
- **THEN** le build échoue
- **THEN** le message cite les deux chemins

### Requirement: Adresses existantes conservées
Le rangement des fiches existantes dans des dossiers SHALL NOT changer leur adresse, ni celle de leur quiz, ni leur contenu affiché.

#### Scenario: Fiche déplacée
- **WHEN** une fiche publiée est déplacée de la racine vers un sous-dossier sans changer son nom
- **THEN** son adresse, son quiz, ses liens vers les fiches voisines et son entrée de recherche sont ceux d'avant
