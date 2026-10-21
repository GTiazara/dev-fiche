---
title: AGENTS.md, le guide des agents IA dans un projet
description: Un fichier AGENTS.md à la racine d'un dépôt donne aux agents IA les règles du projet, comme un README pour les machines.
technology: ia_agent
difficulty: debutant
tags: [agents, agents.md, contexte, bonnes-pratiques]
publishedAt: 2026-10-19
updatedAt: 2026-10-19
draft: false
quiz:
  - question: Où place-t-on le fichier AGENTS.md principal ?
    choices:
      - À la racine du dépôt
      - Dans le dossier node_modules
      - Dans le navigateur
    answer: 0
    explanation: Les agents cherchent AGENTS.md à la racine du projet, puis dans les sous-dossiers concernés.
  - question: Que doit contenir un bon AGENTS.md ?
    choices:
      - Les commandes, les conventions et les limites du projet
      - Tout le code source du projet
      - Les mots de passe de l'équipe
    answer: 0
    explanation: Il décrit comment construire, tester et écrire du code dans le projet, sans secret.
  - question: En quoi AGENTS.md diffère-t-il du README ?
    choices:
      - Il s'adresse aux agents, le README aux personnes
      - Il remplace le README
      - Il est chiffré
    answer: 0
    explanation: Les deux se complètent. Le README présente le projet, AGENTS.md donne les consignes de travail à l'agent.
---

## Définition

`AGENTS.md` est un fichier Markdown placé dans un dépôt. Il donne à un agent IA de code le contexte dont il a besoin pour travailler : comment installer le projet, lancer les tests, respecter les conventions, et ce qu'il ne doit pas faire. On peut le voir comme un README écrit pour les agents.

## Pourquoi l'utiliser

Un agent ne connaît pas votre projet. Sans consigne, il devine : mauvaise commande de test, style différent, fichiers modifiés par erreur. Un fichier unique et versionné évite de répéter les mêmes instructions à chaque conversation, et il s'applique à toute l'équipe.

## Que mettre dedans

| Section | Contenu utile |
| --- | --- |
| Commandes | Installer, lancer, tester, construire |
| Conventions | Langue, style de code, nommage, commentaires |
| Architecture | Où se trouvent les dossiers importants |
| Limites | Ce qu'il ne faut pas modifier ou lancer |
| Validation | Comment vérifier qu'une tâche est terminée |

## Exemple de code

````md
# AGENTS.md

## Commandes
- Installer : `npm install`
- Tester : `npm test`
- Construire : `npm run build`

## Conventions
- Commentaires en français.
- Un composant par fichier.

## Limites
- Ne jamais modifier `dist/`.
- Demander avant de supprimer un fichier.
````

## Utilisation dans un projet

1. Créer `AGENTS.md` à la racine du dépôt et le versionner avec le code.
2. Y écrire les commandes exactes, celles que l'on tape vraiment.
3. Ajouter un `AGENTS.md` dans un sous-dossier pour des règles propres à cette partie. Le plus proche du fichier travaillé s'applique en priorité.
4. Relire le fichier quand le projet change, comme n'importe quelle documentation.
5. Observer le comportement de l'agent, puis préciser les consignes qu'il a mal comprises.

## Erreurs fréquentes

- Un fichier trop long : l'agent perd l'essentiel. Viser court et concret.
- Des consignes vagues comme « écris du bon code ». Préférer une règle vérifiable.
- Des informations périmées qui contredisent le code réel.
- Des secrets ou des clés : le fichier est public dans le dépôt.

## À retenir

`AGENTS.md` est le README des agents IA : court, versionné, à la racine, avec les commandes, les conventions et les limites du projet. Une règle précise vaut mieux que dix conseils vagues.
