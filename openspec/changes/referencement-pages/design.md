# Design

## Context

`Base.astro` pose déjà `lang="fr"`, un `<title>` et une meta description par page. Il n'y a pas de `robots.txt`, ni de plan de site, ni de lien canonique. `astro.config.ts` ne définit `site` que si `SITE_URL` est fourni. La publication GitHub Pages le fournit. Voir proposal.md pour le motif.

## Goals / Non-Goals

**Goals:**

- Rendre les pages publiées listables et identifiables par une adresse stable.
- Laisser `npm run build` réussir sans `SITE_URL`.

**Non-Goals:**

- Promettre une position dans les résultats.
- Créer un compte Search Console, inventer un nom de domaine, ou réécrire les fiches pour y placer des mots-clés.

## Decisions

### Plan de site seulement si `site` est défini

La génération du plan utilise l'intégration de plan de site d'Astro, ajoutée aux intégrations uniquement lorsque `site` est une adresse absolue. Sans elle, un build local ne produit pas d'adresses fausses.

Alternative écartée : écrire le plan à la main. Il se désynchroniserait des pages générées.

Le filtre retire la page introuvable si elle apparaît dans le plan.

### `robots.txt` généré

Une page de build écrit `robots.txt`. Elle autorise l'exploration. Si `site` est défini, elle ajoute la ligne `Sitemap` vers le plan produit.

### Balises dans l'en-tête commun

`Base.astro` ajoute `rel=canonical`, `og:title`, `og:description`, `og:url` et `og:locale=fr_FR` quand `site` est défini. L'adresse canonique est l'adresse du site jointe au chemin de la page, sans paramètre de requête. La page introuvable reçoit `noindex` par une propriété de la mise en page.

Alternative écartée : une meta `keywords`. Les moteurs l'ignorent.

## Risks / Trade-offs

- [Build local sans `SITE_URL`] → pas de plan ni de canonique dans `dist`. La publication, qui définit `SITE_URL`, les produit.
- [Pages de quiz indexées] → elles décrivent la fiche. Elles restent dans le plan parce qu'elles sont du contenu publié.

## Migration Plan

Ajouter l'intégration et les balises, builder sans `SITE_URL` puis avec une adresse de test. Retirer l'intégration et les balises annule le référencement technique.

## Open Questions

Aucune.
