# DevFiches

Site statique de fiches d'apprentissage et d'aide-mémoire pour le développement informatique. Une fiche sert à comprendre une notion et à retrouver l'essentiel, avec des exemples et parfois un quiz. Il n'y a pas de compte.

## Lancer le projet

Node.js 22 est requis.

```bash
npm install
npm run dev
```

Le site s'ouvre sur l'adresse affichée par Astro, en général `http://localhost:4321`.

```bash
npm test
npm run build
```

`npm run build` vérifie aussi les fiches : un frontmatter invalide arrête la génération.

## Ajouter une fiche

Créer `src/content/fiches/<identifiant>.md`. Le nom du fichier devient l'adresse `/fiches/<identifiant>`.

```yaml
---
title: Les variables en JavaScript
description: "Une variable conserve une valeur pour la réutiliser."
technology: javascript
difficulty: debutant
tags: [variables]
publishedAt: 2026-10-27
updatedAt: 2026-10-27
draft: false
---
```

- `technology` doit être un slug déjà déclaré dans `src/data/technologies.ts`.
- `difficulty` vaut `debutant`, `intermediaire` ou `avance`.
- Mettre `draft: true` pour garder la fiche hors du site.
- Si un texte du frontmatter contient `:`, le placer entre guillemets.
- Écrire en français. Prévoir une définition, des mots-clés, un exemple de code balisé avec son langage, et une section `## À retenir`.
- Le quiz est facultatif. S'il est présent : 3 à 5 questions, au moins deux choix, `answer` est l'index du bon choix à partir de 0, et chaque question a une `explanation`.

Une image de couverture est facultative : `image` commence par `/` et pointe vers un fichier de `public/`, avec `imageAlt`.

## Ajouter une technologie

Ajouter une entrée dans `src/data/technologies.ts` : `slug`, `label`, et `icon` seulement si un fichier existe dans `public/`. Ensuite, les fiches peuvent utiliser ce slug.

## Changer une fonctionnalité

Une nouvelle page, un parcours ou une interaction se spécifie avant le code :

1. `/openspec-propose` décrit le changement.
2. `/openspec-apply-change` l'applique.

Une fiche, un texte ou une technologie ne passent pas par OpenSpec.
