---
title: OpenSpec, développer avec des spécifications
description: Préparer et suivre un changement avec OpenSpec, dans un dépôt existant ou un projet qui démarre de zéro.
technology: ia_agent
difficulty: debutant
tags: [openspec, spécifications, développement assisté, agents]
publishedAt: 2026-10-22
updatedAt: 2026-10-22
draft: false
---

## OpenSpec en bref

OpenSpec fait définir et relire un changement avant que l'agent l'implémente. `openspec/specs/` décrit le comportement attendu; chaque changement proposé a son dossier dans `openspec/changes/`, avec une proposition, des exigences et des tâches. L'archivage reporte les exigences terminées dans les spécifications principales.

Le cycle est : explorer si besoin, proposer, relire, appliquer, archiver. `openspec init` se lance dans le terminal. Dans un assistant compatible, les commandes de chat sont `/opsx:explore`, `/opsx:propose`, `/opsx:apply` et `/opsx:archive`; leur syntaxe dépend de l'outil. La relecture est une étape manuelle, pas une commande `review`.

## Installation

Dans un terminal, installez l'interface en ligne de commande OpenSpec :

```sh
npm install -g @fission-ai/openspec@latest
```

Placez-vous ensuite à la racine du projet, puis initialisez OpenSpec :

```sh
cd chemin/vers/le-projet
openspec init
```

L'initialisation crée le dossier `openspec/` et configure l'assistant choisi.

## Exemple pratique : ajouter une limitation

Dans un projet initialisé, demandez à l'assistant de préparer une limitation des tentatives de connexion :

1. `/opsx:explore` (facultatif) : clarifiez les règles et les cas limites.
2. `/opsx:propose add-rate-limiting` : l'agent crée le changement dans `openspec/changes/add-rate-limiting/`.
3. Relisez `proposal.md`, `specs/` et `tasks.md`. Corrigez le plan avant tout code; cette étape n'a pas de commande dédiée.
4. `/opsx:apply` : l'agent implémente les tâches et coche leur avancement.
5. Quand tout est vérifié, `/opsx:archive` met à jour `openspec/specs/` et archive le changement.

Si ces commandes ne sont pas disponibles dans votre assistant, demandez-lui les mêmes actions en langage naturel.

## Cas 1 : ajouter OpenSpec à un projet existant

1. À la racine du dépôt, lancez `openspec init`.
2. Pour un changement précis, demandez une proposition à l'agent. Vérifiez le code existant : l'initialisation ne rédige pas automatiquement les spécifications complètes du projet.
3. Relisez et corrigez `proposal.md`, `specs/` et `tasks.md` avant l'implémentation.
4. Demandez l'application, vérifiez le résultat, puis archivez le changement.

## Cas 2 : commencer dans un projet vierge

1. Créez le dossier du projet, puis lancez `openspec init` à cet endroit.
2. Si la pile technique est indécise, demandez à l'agent d'explorer les options et de choisir le premier comportement à construire. Laissez les décisions non nécessaires pour plus tard.
3. Faites proposer puis relisez ce premier changement; demandez son application et archivez-le. Recommencez à partir des spécifications mises à jour.

## Sources
## À retenir

Explorer si besoin, proposer, relire le plan avant tout code, appliquer, puis archiver pour mettre à jour les spécifications. La relecture est manuelle; l'archivage se fait une fois le changement terminé.

## Sources

- [Quickstart OpenSpec](https://openspec.dev/docs/quickstart)
- [Getting Started OpenSpec](https://github.com/Fission-AI/OpenSpec/blob/main/docs/getting-started.md)