---
title: Les branches
description: Une branche est une ligne d'historique que l'on peut faire avancer à part.
technology: git
difficulty: intermediaire
tags: [branches]
publishedAt: 2026-10-09
updatedAt: 2026-10-21
draft: true
---

## Définition

La branche nomme une suite de commits. `git switch -c` en ouvre une nouvelle sans effacer la précédente.

## Exemple

```bash
git switch -c chapitre-listes
git status
```

Créer la branche n'écrit pas encore de commit. Le prochain commit avancera cette branche.
