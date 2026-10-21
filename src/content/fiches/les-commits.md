---
title: Les commits
description: Un commit enregistre un instantané des fichiers avec un message.
technology: git
difficulty: debutant
tags: [commits]
publishedAt: 2026-10-08
updatedAt: 2026-10-20
draft: true
quiz:
  - question: Quelle commande enregistre un instantané ?
    choices: ["git commit", "git push", "git clone"]
    answer: 0
    explanation: git commit écrit l'instantané dans l'historique local.
  - question: À quoi sert git status ?
    choices:
      - Voir l'état des fichiers
      - Effacer le dépôt
      - Publier une fiche
    answer: 0
    explanation: git status décrit ce qui est modifié, sans rien enregistrer.
  - question: Un commit a-t-il un message ?
    choices: [oui, non]
    answer: 0
    explanation: Le message explique pourquoi cet instantané existe.
---

## Définition

Après avoir préparé les fichiers, `git commit` fixe leur état. Le message décrit l'intention de ce changement.

## Mots-clés

| Commande | Rôle |
| --- | --- |
| git add | Prépare les fichiers |
| git commit | Enregistre l'instantané |

## Exemple de code

```bash
git add .
git commit -m "Décrire le changement"
```

## À retenir

Un commit sans message clair devient difficile à retrouver. Le message parle du pourquoi.
