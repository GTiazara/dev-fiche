# Spec Delta

## Purpose

Une fiche publiée est listée et filtrée dans chacune des technologies qu'elle nomme, tout en gardant une seule adresse.

## ADDED Requirements

### Requirement: Une ou plusieurs technologies
Une fiche SHALL nommer au moins une technologie autorisée. Le champ accepte un slug seul ou une liste de slugs. L'ordre écrit est l'ordre d'affichage. Un slug répété ne compte qu'une fois.

#### Scenario: Une seule technologie, comme aujourd'hui
- **WHEN** une fiche nomme une seule technologie par un slug
- **THEN** le build accepte la fiche
- **THEN** elle est rattachée à cette technologie

#### Scenario: Plusieurs technologies
- **WHEN** une fiche nomme deux technologies autorisées dans une liste
- **THEN** le build accepte la fiche
- **THEN** elle est rattachée aux deux, dans l'ordre écrit

#### Scenario: Slug répété
- **WHEN** la même technologie est écrite deux fois dans la liste
- **THEN** elle ne compte qu'une fois
- **THEN** sa place est celle de sa première occurrence

#### Scenario: Technologie inconnue ou liste vide
- **WHEN** une fiche nomme un slug qui n'est pas une technologie autorisée, ou une liste vide
- **THEN** le build échoue

### Requirement: Présence dans chaque technologie
Une fiche publiée SHALL apparaître dans la liste de chaque technologie qu'elle nomme, et SHALL être absente des technologies qu'elle ne nomme pas. Son adresse reste unique.

#### Scenario: Page d'une technologie citée
- **WHEN** un visiteur ouvre la page d'une technologie nommée par une fiche publiée
- **THEN** la fiche figure dans cette liste

#### Scenario: Page d'une technologie non citée
- **WHEN** un visiteur ouvre la page d'une technologie que la fiche ne nomme pas
- **THEN** la fiche n'y figure pas

#### Scenario: Brouillon
- **WHEN** la fiche est un brouillon
- **THEN** elle n'a pas de page
- **THEN** elle ne figure dans aucune liste de technologie

### Requirement: Filtre du catalogue et de la recherche
Le filtre par technologie SHALL retenir une fiche dès que la technologie choisie fait partie de celles qu'elle nomme. Un filtre vide SHALL laisser passer toutes les fiches publiées. Le filtre de niveau se cumule.

#### Scenario: Filtre sur la seconde technologie
- **WHEN** le visiteur filtre sur une technologie qui n'est pas la première de la fiche
- **THEN** la fiche reste visible

#### Scenario: Filtre sur une autre technologie
- **WHEN** le visiteur filtre sur une technologie absente de la fiche
- **THEN** la fiche est masquée

### Requirement: Liens affichés
La fiche et sa carte SHALL afficher un lien vers chacune de ses technologies, dans l'ordre retenu.

#### Scenario: En-tête de la fiche
- **WHEN** un visiteur ouvre une fiche qui nomme deux technologies
- **THEN** l'en-tête propose un lien vers la page de chacune, dans l'ordre retenu

#### Scenario: Carte du catalogue
- **WHEN** la fiche apparaît dans le catalogue ou sur l'accueil
- **THEN** sa carte montre les mêmes technologies, dans le même ordre

### Requirement: Compteur des technologies
Une technologie SHALL être comptée et proposée dès qu'au moins une fiche publiée la nomme, même si ce n'est pas la seule technologie de cette fiche.

#### Scenario: Technologie seulement en seconde position
- **WHEN** une technologie n'est nommée que par des fiches qui en nomment aussi une autre
- **THEN** elle apparaît parmi les technologies qui ont des fiches
- **THEN** son nombre de fiches inclut ces fiches
