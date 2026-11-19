# Design

## Context

Les pages HTML partagent `src/layouts/Base.astro`. Aucun script de mesure n'est présent. Il n'y a pas de routeur côté navigateur : chaque adresse recharge la page. Voir proposal.md pour le motif.

## Goals / Non-Goals

**Goals:**

- Reprendre le snippet fourni : file `_paq`, `trackPageView`, `enableLinkTracking`, site `6`, collecteur `//matomo.gtiazara.fr/`.
- Le placer une fois, dans la mise en page commune, pour qu'il soit sur chaque page produite.

**Non-Goals:**

- Bannière de consentement, dimensions personnalisées, ou autre méthode que celles du snippet.
- Mesure côté serveur, ou nouvelle dépendance npm.

## Decisions

### Script inline dans l'en-tête commun

Le snippet est collé dans le `<head>` de `Base.astro`, marqué pour rester tel quel au build. Astro transformerait sinon le bloc en module et casserait `_paq` et l'insertion du fichier distant.

Alternative écartée : un composant Vue. La mesure n'a pas d'interface et doit partir au premier chargement HTML.

### Adresse et identifiant figés

L'adresse `//matomo.gtiazara.fr/` et l'identifiant `6` restent dans le snippet, comme fournis. Ils ne passent pas par une variable d'environnement inventée.

Alternative écartée : une variable de build. Le mainteneur a donné les valeurs définitives pour ce site.

### Ordre des appels

`trackPageView` et `enableLinkTracking` sont poussés dans `_paq` avant l'insertion de `matomo.js`, comme dans le snippet. Le fichier distant est inséré avant le premier script déjà présent, et chargé en asynchrone.

## Risks / Trade-offs

- [Le navigateur bloque un script tiers] → le contenu HTML ne dépend pas de `matomo.js` ; la page reste lisible.
- [Adresse en `//`] → le navigateur reprend le schéma de la page (`https` en production, `http` en local). C'est le snippet fourni.
- [Pas de bannière] → la mesure démarre au chargement, comme demandé. Un recueil de consentement serait un autre changement.

## Migration Plan

Ajouter le script, régénérer le site, vérifier qu'une page HTML contient `setSiteId` avec `6` et `matomo.js`. Retirer le bloc de `Base.astro` annule la mesure.

## Open Questions

Aucune. L'adresse, l'identifiant et les deux méthodes viennent du snippet.
