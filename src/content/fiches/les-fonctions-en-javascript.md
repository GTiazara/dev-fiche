---
title: Les fonctions en JavaScript
description: Une fonction regroupe des instructions sous un nom réutilisable.
technology: javascript
difficulty: debutant
tags: [fonctions]
publishedAt: 2026-10-02
updatedAt: 2026-10-02
draft: true
---

## Définition

Une fonction évite de recopier les mêmes instructions. On la déclare, puis on l'appelle avec des arguments.

## Mots-clés

| Notion | Rôle |
| --- | --- |
| paramètre | Nom attendu par la fonction |
| retour | Valeur rendue par return |

## Exemple de code

```js
function saluer(prenom) {
  return "Bonjour " + prenom;
}
console.log(saluer("Alex"));
```

## À retenir

Le nom de la fonction décrit ce qu'elle fait. `return` rend la valeur à l'appelant.
