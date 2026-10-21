---
title: Les variables en JavaScript
description: Une variable conserve une valeur pour la réutiliser plus tard dans le programme.
technology: javascript
difficulty: debutant
tags: [variables, fondamentaux]
publishedAt: 2026-10-01
updatedAt: 2026-10-01
draft: true
quiz:
  - question: Quel mot-clé empêche la réaffectation ?
    choices: [let, const, var]
    answer: 1
    explanation: const bloque la réaffectation du lien vers une autre valeur.
  - question: À quoi sert une variable ?
    choices:
      - Stocker une valeur pour la réutiliser
      - Compiler le programme
      - Colorer une page
    answer: 0
    explanation: La variable garde une valeur afin de s'en servir ensuite.
  - question: let permet-il de donner une nouvelle valeur ?
    choices: [oui, non]
    answer: 0
    explanation: let autorise une nouvelle valeur. const ne l'autorise pas.
---

## Définition

Une variable est un nom qui désigne une valeur. En JavaScript, `let` et `const` déclarent ce nom. La réaffectation consiste à faire désigner une autre valeur au même nom.

## Mots-clés

| Mot-clé | Usage |
| --- | --- |
| let | Nouvelle valeur possible |
| const | Lien fixe |

## Exemple de code

```js
let age = 30;
const prenom = "Alex";
age = 31;
console.log(prenom, age);
```

## À retenir

Choisir `const` quand la valeur ne doit pas changer de lien. Choisir `let` quand elle peut être remplacée.
