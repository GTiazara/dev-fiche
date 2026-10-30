---
title: AGENTS.md, le guide des agents IA dans un projet
description: Un fichier AGENTS.md à la racine d'un dépôt donne aux agents IA les règles du projet, comme un README pour les machines.
technology: ia_agent
difficulty: debutant
tags: [agents, agents.md, contexte, bonnes-pratiques]
publishedAt: 2026-10-19
updatedAt: 2026-10-30
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

L'étude de milliers de fichiers publics fait ressortir six zones. Elles suffisent pour un premier fichier utile.

| Section | Contenu utile |
| --- | --- |
| Commandes | Installer, lancer, tester et construire, avec les options réellement utilisées |
| Tests | Suite complète, test ciblé, et quoi faire quand un test échoue |
| Structure | Dossiers à lire, dossiers où écrire, fichiers générés à éviter |
| Style de code | Versions, nommage, format, et un court exemple du résultat attendu |
| Workflow Git | Branche, format des commits, vérifications avant une pull request |
| Limites | Toujours faire, demander d'abord, ne jamais faire |

## Exemples concrets

Un bon exemple donne les vraies commandes du projet, l'endroit où placer le code et la vérification attendue. Les quatre cas suivants montrent comment adapter le même fichier à des projets différents.

### Exemple 1 : une application web

````md
# AGENTS.md

## Commandes
- Installer : `npm install`
- Développer : `npm run dev`
- Tester : `npm run test`
- Construire : `npm run build`

## Conventions
- TypeScript strict : chaque paramètre porte un type explicite.
- Un composant par fichier dans `src/components/`.
- Les textes affichés sont en français.

## Limites
- Ne modifie pas `dist/`.
- N'ajoute pas de dépendance sans expliquer pourquoi.
- Après un changement d'interface, vérifie l'affichage à 390 px de large.
````

L'agent sait quelles commandes lancer et quel contrôle visuel effectuer. Il n'a pas à deviner le port, le dossier des composants ni la langue de l'interface.

### Exemple 2 : une API Python

```md
# AGENTS.md

## Environnement
- Python 3.12.
- Installer : `pip install -r requirements-dev.txt`

## Validation
- Tests : `pytest`
- Analyse : `ruff check .`

## Conventions
- Chaque fonction publique est typée et porte une docstring courte.
- Un nouvel endpoint a un test de réussite et un test d'erreur.

## Limites
- Ne modifie pas une migration déjà appliquée : crée-en une nouvelle.
- Aucun mot de passe dans le code ou les tests. Les secrets vivent dans `.env`, non versionné.
```

La consigne sur les migrations évite une erreur coûteuse : réécrire un fichier déjà exécuté sur d'autres machines.

### Exemple 3 : un projet d'apprentissage automatique

```md
# AGENTS.md

## Données
- `data/raw/` est en lecture seule.
- Les tableaux préparés vont dans `data/processed/`.
- La graine aléatoire par défaut est 42.

## Expériences
- Le prétraitement se lance avec `python scripts/prepare_data.py`.
- Chaque expérience note ses paramètres et ses métriques dans `experiments/`.
- Le découpage est stratifié, sauf pour des lignes datées : dans ce cas, le test est la période la plus récente.

## Validation
- Tests : `python -m pytest`
- Après un changement de prétraitement, relance la préparation puis le modèle de référence.
```

L'agent ne régénère pas les données brutes et ne mélange pas le futur dans l'entraînement. Ces deux règles protègent le résultat plus qu'un conseil général sur la qualité du code.

### Exemple 4 : des règles propres aux tests

Dans `back-end/tests/AGENTS.md` :

```md
# Tests de l'API

- Lance les tests concernés avec `pytest tests/api -q`.
- Les fixtures partagées vivent dans `conftest.py`.
- Un test ne doit pas dépendre de l'ordre d'exécution des autres.
- Ne mets pas à jour un snapshot sans expliquer l'écart observé.
```

Ce fichier ne remplace pas celui de la racine : il le complète pour ce dossier. En cas de contradiction, la règle du fichier le plus proche du code travaillé s'applique.

## S'inspirer de dépôts réels

Les fichiers publics montrent mieux qu'un modèle vide ce qui rend une consigne utile.

- Le [site officiel AGENTS.md](https://agents.md/) donne un exemple court pour un monorepo : naviguer avec Turbo, tester un seul paquet, puis lancer le lint après un déplacement de fichier.
- Le [fichier du dépôt OpenAI `agents.md`](https://github.com/openai/agents.md/blob/main/AGENTS.md) interdit `npm run build` pendant une session interactive, car le build casse le rechargement à chaud. C'est un piège propre au projet : aucun modèle générique ne peut le deviner.
- Le [fichier de MystenLabs](https://github.com/MystenLabs/sui-stack-messaging/blob/main/AGENTS.md) sert de sommaire pour un gros monorepo. La racine décrit l'architecture et renvoie vers un fichier par sous-projet. Il est long parce que le dépôt l'est. Pour un petit projet, on garde l'idée du sommaire, pas la longueur.
- Le [guide GitHub](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/) classe les limites en trois niveaux : toujours, demander d'abord, jamais. Il parle des agents Copilot, mais ce classement se transpose tel quel dans un `AGENTS.md`.
- L'annuaire [Open AgentsMD](https://openagentsmd.jerrymakes.com/) permet de chercher un dépôt public proche de son langage ou de son sujet.

La leçon commune : les commandes viennent tôt, la pile est nommée avec ses versions, et un exemple de code remplace un long discours sur le style.

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

`AGENTS.md` est le README des agents IA : court, versionné, à la racine, avec les commandes, les tests, la structure, le style, le workflow Git et les limites du projet. Les limites se rangent en trois niveaux : toujours, demander d'abord, jamais.
