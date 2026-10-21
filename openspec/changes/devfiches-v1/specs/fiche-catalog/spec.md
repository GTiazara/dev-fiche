# Spec Delta

## Purpose

Permet au visiteur de trouver une fiche de révision par la technologie, le niveau ou une recherche de notion.

## ADDED Requirements

### Requirement: Accueil du catalogue
Le site SHALL afficher un accueil avec la promesse du site, un champ de recherche, les technologies qui ont au moins une fiche publiée, et les fiches publiées les plus récemment mises à jour.

#### Scenario: Fiches publiées présentes
- **WHEN** au moins une fiche est publiée
- **THEN** l'accueil montre ces fiches avec leur titre, leur extrait, leur technologie, leur niveau et leur durée de lecture
- **THEN** chaque compteur affiché est calculé à partir des seules fiches publiées

#### Scenario: Aucune fiche publiée
- **WHEN** aucune fiche n'est publiée
- **THEN** l'accueil n'affiche aucune carte de fiche
- **THEN** le compteur de fiches publiées vaut zéro

### Requirement: Liste des fiches
Le site SHALL lister les fiches publiées sous forme de cartes, de la mise à jour la plus récente à la plus ancienne.

#### Scenario: Contenu et ordre d'une carte
- **WHEN** le visiteur ouvre le catalogue
- **THEN** chaque carte montre le titre, l'extrait, la technologie, le niveau et la durée de lecture
- **THEN** la fiche dont la date de mise à jour est la plus récente apparaît en premier

### Requirement: Filtre par technologie et par niveau
Le visiteur SHALL pouvoir restreindre la liste à une technologie, à un niveau, ou aux deux.

#### Scenario: Filtres combinés
- **WHEN** le visiteur choisit une technologie et un niveau
- **THEN** la liste ne contient que les fiches publiées de cette technologie et de ce niveau

#### Scenario: Filtre sans correspondance
- **WHEN** aucune fiche publiée ne correspond aux filtres choisis
- **THEN** la liste est vide et le site l'indique

### Requirement: Page d'une technologie
Le site SHALL offrir une page pour chaque technologie qui possède au moins une fiche publiée, avec le filtre de niveau.

#### Scenario: Fiches de la technologie
- **WHEN** le visiteur ouvre la page d'une technologie
- **THEN** il ne voit que les fiches publiées de cette technologie

#### Scenario: Niveau sur la page technologie
- **WHEN** le visiteur choisit un niveau sur la page d'une technologie
- **THEN** seules les fiches publiées de cette technologie et de ce niveau restent affichées

### Requirement: Recherche d'une notion
Le site SHALL retenir une fiche publiée lorsque chaque mot de la requête apparaît dans son titre, son extrait, un titre de section ou son corps, sans tenir compte de la casse ni des accents.

#### Scenario: Mot présent dans le corps
- **WHEN** le visiteur recherche un mot présent seulement dans le corps d'une fiche publiée
- **THEN** cette fiche apparaît dans les résultats

#### Scenario: Casse et accents ignorés
- **WHEN** le visiteur recherche un mot qui ne diffère d'un texte de fiche que par la casse ou les accents
- **THEN** cette fiche apparaît dans les résultats

#### Scenario: Aucune correspondance
- **WHEN** aucun champ recherché ne contient les mots demandés
- **THEN** la page de résultats est vide et le site l'indique

### Requirement: Filtres des résultats de recherche
Le visiteur SHALL pouvoir appliquer les filtres de technologie et de niveau aux résultats de recherche.

#### Scenario: Recherche puis niveau
- **WHEN** le visiteur lance une recherche puis choisit un niveau
- **THEN** les résultats ne gardent que les fiches qui correspondent à la fois à la requête et à ce niveau

### Requirement: Brouillon exclu du catalogue
Le site SHALL exclure une fiche brouillon de l'accueil, du catalogue, des pages technologie, de la recherche et des compteurs.

#### Scenario: Seul un brouillon existe
- **WHEN** la seule fiche du dépôt est un brouillon
- **THEN** le catalogue est vide
- **THEN** le compteur de fiches publiées vaut zéro

### Requirement: Page À propos
Le site SHALL exposer une page À propos dont le texte est livré avec le site.

#### Scenario: Ouverture de la page
- **WHEN** le visiteur ouvre la page À propos
- **THEN** il lit un texte court sur le site, sans liste de fiches

### Requirement: Adresse inconnue
Le site SHALL répondre à une adresse qui ne correspond à aucune page par une page introuvable qui propose de revenir au catalogue.

#### Scenario: Adresse absente
- **WHEN** le visiteur ouvre une adresse qui ne correspond à aucune page
- **THEN** il voit une page introuvable
- **THEN** cette page propose un lien vers le catalogue

### Requirement: Consultation sans compte
Les pages du catalogue SHALL être consultables sans compte, et SHALL NOT proposer d'inscription, de favori ni de téléchargement PDF.

#### Scenario: Visiteur anonyme
- **WHEN** un visiteur ouvre l'accueil ou le catalogue
- **THEN** il accède au contenu sans s'identifier
- **THEN** aucun contrôle de compte, de favori ou de PDF n'est proposé

### Requirement: Adresses du catalogue
Le site SHALL exposer l'accueil à `/`, le catalogue à `/fiches`, la liste des technologies à `/technologies`, une technologie à `/technologies/<identifiant>`, la recherche à `/recherche` et la page À propos à `/a-propos`.

#### Scenario: Catalogue
- **WHEN** le visiteur ouvre `/fiches`
- **THEN** il obtient la liste des fiches publiées

#### Scenario: Recherche
- **WHEN** le visiteur lance une recherche
- **THEN** les résultats s'affichent sur `/recherche` avec la requête dans le paramètre `q`
