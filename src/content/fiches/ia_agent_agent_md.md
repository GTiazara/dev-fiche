---
title: AGENTS.md, le guide des agents IA dans un projet
description: Un fichier AGENTS.md à la racine d'un dépôt donne aux agents IA les règles du projet, comme un README pour les machines.
technology: ia_agent
difficulty: debutant
tags: [agents, agents.md, contexte, bonnes-pratiques]
publishedAt: 2026-10-19
updatedAt: 2026-11-02
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
  - question: Pourquoi écrire une définition de clôture dans AGENTS.md ?
    choices:
      - Pour que l'agent vérifie des critères précis avant d'annoncer une tâche terminée
      - Pour fermer le fichier à la fin de la session
      - Pour empêcher l'agent de relire le fichier
    answer: 0
    explanation: Sans critères vérifiables, « terminé » veut dire « je crois avoir fini ». Avec eux, l'agent lance chaque contrôle avant de conclure.
  - question: Que reproche-t-on à la consigne « Sois prudent avec les migrations » ?
    choices:
      - Elle ne donne aucune commande à exécuter ni aucune condition d'arrêt
      - Elle est trop courte
      - Elle concerne un sujet trop technique
    answer: 0
    explanation: Une consigne utile indique la commande exacte, par exemple `alembic check`, et ce qui doit arrêter l'agent.
---

## Définition

`AGENTS.md` est un fichier Markdown placé dans un dépôt. Il donne à un agent IA de code le contexte dont il a besoin pour travailler : comment installer le projet, lancer les tests, respecter les conventions, et ce qu'il ne doit pas faire. On peut le voir comme un README écrit pour les agents.

## Pourquoi l'utiliser

Un agent ne connaît pas votre projet. Sans consigne, il devine : mauvaise commande de test, style différent, fichiers modifiés par erreur. Un fichier unique et versionné évite de répéter les mêmes instructions à chaque conversation, et il s'applique à toute l'équipe.

Le fichier fonctionne mieux comme une politique opérationnelle pour l'agent que comme une documentation pour une personne. Un paragraphe qui explique un principe ne change rien à son comportement ; une commande précise, oui.

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

Une instruction devient fiable quand elle répond à une question : quelle commande prouve qu'elle est respectée ?

## Ce qui change vraiment le comportement de l'agent

Quatre patterns produisent un effet mesurable, testés en comparant la même tâche avec et sans l'instruction.

### Des commandes, pas des phrases

```md
## Build et tests
- Installer : `pip install -r requirements.txt`
- Lint : `ruff check . --fix`
- Tester : `pytest -v --tb=short`
- Vérification complète : `ruff check . && pytest -v`
```

Une commande ne laisse pas de place à l'interprétation : l'agent sait quoi lancer et lit le code de sortie pour savoir si ça a réussi.

### Une définition de clôture

```md
## Définition de clôture
Une tâche est terminée quand TOUT est vrai :
1. `ruff check .` sort en 0
2. `pytest -v` sort en 0, sans échec
3. Les fichiers modifiés sont ajoutés et committés
```

Sans cette liste, « terminé » veut dire « je crois avoir fini ». Avec elle, l'agent lance chaque contrôle avant de l'annoncer.

### Des sections par tâche

```md
## Quand on développe
- Lance `ruff check .` après chaque fichier modifié.

## Quand on relit du code
- Vérifie la couverture : `pytest --cov=app --cov-fail-under=80`

## Quand on publie
- Suite complète : `pytest -v && ruff check .`
- Tag : `git tag -a v<version> -m "Release v<version>"`
```

Une liste plate oblige l'agent à trier lui-même les consignes utiles pour la tâche en cours. Le préfixe « Quand... » correspond à la façon dont il raisonne sur le contexte.

### Des règles d'escalade

```md
## En cas de blocage
- Si les tests échouent après 3 essais : arrête-toi et montre la sortie complète.
- En cas de conflit de fusion : arrête-toi et montre les fichiers concernés.
- Ne jamais : supprimer un fichier pour faire disparaître une erreur, forcer un push, passer un test.
```

Un agent bloqué sans règle d'escalade improvise, et ses idées de contournement sont rarement bonnes. La liste des « jamais » compte autant que les chemins de sortie.

## Ce qui n'a aucun effet mesurable

Ces formulations se lisent bien, mais ne changent pas le comportement de l'agent.

- **Un paragraphe sans commande.** « Notre équipe pratique le TDD et croit en une bonne couverture de tests » : l'agent retient une préférence vague et n'écrit toujours aucun test.
- **Une consigne ambiguë.** « Sois prudent avec les migrations » ne dit pas quoi vérifier. Préférer : « Exécute `alembic check` avant d'appliquer une migration. Arrête-toi si le chemin de downgrade est absent. »
- **Des priorités contradictoires sans ordre.** Demander à la fois d'aller vite et de lancer la suite complète avant chaque commit ne précise pas laquelle l'emporte. Numéroter : « Priorité 1 : les tests passent. Priorité 2 : moins de 5 minutes. »
- **Un guide de style sans commande de vérification.** « Suis le guide de style Google » reste une suggestion tant qu'aucune commande (`ruff check --select D`) ne permet à l'agent de vérifier sa propre conformité.

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
- L'article [Patterns AGENTS.md de Blake Crosley](https://blakecrosley.com/fr/blog/agents-md-patterns) compare des tâches avec et sans chaque instruction pour voir celles qui changent vraiment le résultat. Il décrit aussi la portée hiérarchique d'un monorepo : les fichiers s'additionnent du plus proche de la racine au plus proche du dossier travaillé, et Codex ajoute un mécanisme propre de surcharge via `AGENTS.override.md`.

La leçon commune : les commandes viennent tôt, la pile est nommée avec ses versions, et un exemple de code remplace un long discours sur le style.

## Utilisation dans un projet

Écrire les sections dans cet ordre : chaque couche s'appuie sur la précédente.

1. Les commandes de build et de test : l'agent en a besoin avant de faire quoi que ce soit d'utile.
2. Une définition de clôture, pour éviter les fausses déclarations de fin de tâche.
3. Des règles d'escalade, pour éviter les contournements destructeurs en cas de blocage.
4. Le reste organisé par tâche (développement, revue, publication) plutôt que par catégorie.
5. Dans un monorepo seulement, un `AGENTS.md` par sous-dossier. Le plus proche du fichier travaillé s'applique en priorité ; les fichiers s'additionnent de la racine jusqu'à ce dossier.
6. Les préférences de style, en dernier, et seulement si les points précédents fonctionnent déjà.

Pour vérifier que le fichier sert vraiment, demander à l'agent de réciter les commandes de build. S'il ne les restitue pas mot pour mot, le fichier est soit trop long, soit trop vague.

## Erreurs fréquentes

- Un fichier trop long : viser moins de 50 lignes par section et moins de 150 lignes au total, les commandes et les limites en premier. Codex tronque d'ailleurs au-delà de 32 Kio.
- Des consignes vagues comme « écris du bon code » ou « sois prudent ». Préférer une règle vérifiable par une commande.
- Des priorités contradictoires sans ordre explicite : l'agent saute les vérifications plutôt que de choisir entre elles. Numéroter les priorités lève l'ambiguïté.
- Des informations périmées qui contredisent le code réel.
- Des secrets ou des clés : le fichier est public dans le dépôt.

## À retenir

`AGENTS.md` est une politique opérationnelle pour l'agent, pas une documentation pour une personne. Les commandes exactes, la définition de clôture, les règles d'escalade et les sections par tâche changent son comportement ; les paragraphes rédigés, les consignes vagues et les priorités sans ordre ne changent rien. Viser un fichier court, avec les commandes et les limites en tête, et le tester en demandant à l'agent de les réciter.
