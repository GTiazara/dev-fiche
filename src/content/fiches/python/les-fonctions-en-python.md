---
title: Les fonctions en Python
description: def nomme un bloc d'instructions que l'on peut appeler plusieurs fois.
technology: python
difficulty: debutant
tags: [fonctions]
publishedAt: 2026-10-05
updatedAt: 2026-10-05
draft: true
---

## Définition

`def` introduit une fonction. L'indentation indique quelles lignes lui appartiennent.

## Mots-clés

| Notion | Rôle |
| --- | --- |
| def | Déclaration |
| return | Valeur rendue |

## Exemple de code

```python
def double(nombre):
    return nombre * 2

print(double(4))
```

## À retenir

Oublier l'indentation sort la ligne de la fonction. `return` termine l'appel en rendant une valeur.
