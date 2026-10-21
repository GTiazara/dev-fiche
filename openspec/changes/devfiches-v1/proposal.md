# Proposal

## Why

Un lecteur qui apprend le développement informatique n'a pas, dans ce dépôt, d'endroit où trouver une notion, la lire avec un exemple, puis se tester. DevFiches comble ce manque par un site de fiches de révision, publiable comme un ensemble de fichiers statiques.

## What Changes

- Ajouter un site statique où le visiteur parcourt les fiches par technologie, filtre par niveau, recherche une notion, lit une fiche avec des exemples de code et répond à un quiz interactif.
- Prévoir l'accueil, le catalogue, la page technologie, la recherche, la fiche, le quiz, la page À propos et une page introuvable.
- Publier le contenu par fichiers déposés dans le dépôt. Une fiche brouillon reste absente du site. Le visiteur n'a pas de compte.
- Amorcer le site avec neuf fiches : trois en JavaScript, trois en Python, trois en Git, dont trois quiz.
- S'inspirer de la maquette pour la grille, les cartes, la fiche et le quiz, en thème sombre et sur petit écran. Le compte, le favori et le PDF de la maquette restent hors de cette version.
- Les exigences décrivent le visiteur et les fichiers publiés. Elles ne dépendent d'aucun éditeur ni assistant.

Hypothèses retenues pour la suite :

- Le quiz s'ouvre dans une vue dédiée, depuis la fiche.
- Les sujets exacts des neuf fiches sont choisis au moment du contenu, dans le cadre des trois technologies.
- L'adresse GitHub Pages, encore inconnue, ne bloque pas la construction en local.

## Capabilities

### New Capabilities

- `fiche-catalog`: accueil, liste, pages technologie, recherche et filtres par technologie et par niveau.
- `fiche`: consultation d'une fiche détaillée, avec exemples de code.
- `quiz`: questionnaire à choix multiples rattaché à une fiche, sans score conservé.

### Modified Capabilities

Aucune. Le dépôt n'a pas encore de capacité OpenSpec.

## Impact

- Le dépôt ne contient pas encore de code d'application. Cette version crée le site, ses fichiers de contenu et le workflow de publication statique.
- Systèmes touchés : pages publiques, schéma des fiches, index de recherche produit au build, hébergement de fichiers statiques.
- Aucun compte, aucune base de données, aucun serveur au moment de la lecture.
- Les documents `docs/PRODUCT_SPEC.md` et `docs/TECHNICAL_SPEC.md` restent le cadrage déjà écrit. Ce changement les décline en exigences et en tâches.
