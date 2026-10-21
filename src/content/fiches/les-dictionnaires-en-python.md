---
title: Les dictionnaires en Python
description: Un dictionnaire associe une clé à une valeur, sans dépendre d'une position.
technology: python
difficulty: intermediaire
tags: [dictionnaires]
publishedAt: 2026-10-06
updatedAt: 2026-10-06
draft: true
---

## Définition

On lit une valeur par sa clé. Deux clés identiques ne cohabitent pas : la seconde remplace la première.

## Mots-clés

| Notion | Rôle |
| --- | --- |
| clé | Nom utilisé pour retrouver la valeur |
| valeur | Donnée associée à la clé |

## Exemple de code

```python
fiche = {"titre": "Listes", "niveau": "débutant"}
print(fiche["titre"])
```

## À retenir

Les crochets autour de la clé lisent la valeur. Une clé absente provoque une erreur.
