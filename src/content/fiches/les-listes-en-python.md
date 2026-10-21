---
title: Les listes en Python
description: Une liste conserve plusieurs valeurs dans un ordre, accessibles par leur position.
technology: python
difficulty: debutant
tags: [listes]
publishedAt: 2026-10-04
updatedAt: 2026-10-04
draft: true
quiz:
  - question: Comment lire le premier élément d'une liste ?
    choices: ["liste[0]", "liste[1]", "liste.first"]
    answer: 0
    explanation: Les positions commencent à 0. Le premier élément est donc liste[0].
  - question: Que fait append ?
    choices:
      - Ajouter un élément à la fin
      - Vider la liste
      - Trier la liste
    answer: 0
    explanation: append ajoute l'élément après le dernier.
  - question: Une liste peut-elle contenir plusieurs valeurs ?
    choices: [oui, non]
    answer: 0
    explanation: C'est le rôle d'une liste, contrairement à une variable seule.
---

## Définition

Une liste est une suite ordonnée. La première position porte le numéro 0.

## Mots-clés

| Notion | Rôle |
| --- | --- |
| index | Position d'un élément |
| append | Ajout à la fin |

## Exemple de code

```python
nombres = [3, 5, 8]
nombres.append(13)
print(nombres[0])
```

## À retenir

Compter depuis 0 évite de décaler la lecture du premier élément.
