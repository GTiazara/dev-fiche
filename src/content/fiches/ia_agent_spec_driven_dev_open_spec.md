---
title: OpenSpec, développer avec des spécifications
description: Cadrer, spécifier et valider les changements d'un projet assisté par IA avant l'implémentation grâce à OpenSpec.
technology: ia_agent
difficulty: debutant
tags: [openspec, spécifications, développement-assisté, agents-ia, sdd]
publishedAt: 2026-10-22
updatedAt: 2026-10-25
draft: false
quiz:
  - question: Quel est le principe fondamental du Spec-Driven Development (SDD) avec OpenSpec ?
    choices:
      - Rédiger et valider le plan avec l'humain avant que l'agent IA n'écrive du code
      - Générer du code en continu sans aucune étape de validation
      - Remplacer le système de contrôle de version Git
    answer: 0
    explanation: OpenSpec sépare la réflexion et la validation des spécifications de l'écriture du code pour éviter les dérives et les réécritures inutiles.
  - question: Quels sont les artéfacts clés générés lors d'une proposition de changement ?
    choices:
      - proposal.md, les spécifications delta et tasks.md
      - Dockerfile, package.json et le fichier .env
      - index.html, styles.css et main.js
    answer: 0
    explanation: Une proposition structure le changement avec le pourquoi (proposal.md), le quoi (spécifications delta) et le comment étape par étape (tasks.md).
  - question: Comment aborder l'adoption d'OpenSpec sur un projet déjà bien avancé ?
    choices:
      - Spécifier au fil de l'eau chaque nouveau changement sans rétro-documenter tout le projet d'un coup
      - Rédiger obligatoirement les spécifications de tout le code existant avant de continuer
      - Supprimer le code existant pour repartir de zéro
    answer: 0
    explanation: Tenter de rétro-documenter une base de code existante bloque l'équipe ; les spécifications pérennes s'enrichissent naturellement au fil des évolutions.
  - question: Que réalise la commande d'archivage (openspec archive) à la fin d'un changement ?
    choices:
      - Elle fusionne les spécifications delta dans les spécifications pérennes (specs/) et archive le dossier du changement
      - Elle supprime l'ensemble du projet et réinitialise Git
      - Elle envoie les fichiers sur un serveur distant propriétaire
    answer: 0
    explanation: L'archivage intègre les nouvelles règles validées dans la documentation vivante du projet (openspec/specs/) et conserve l'historique du changement dans l'archive.
---

## Définition

**OpenSpec** est un standard ouvert et un outil en ligne de commande pour le **Spec-Driven Development** (SDD, ou développement piloté par les spécifications) assisté par agents IA.

Plutôt que de laisser un agent deviner l'architecture ou coder à partir d'un prompt vague, OpenSpec force une séparation nette en deux temps :
1. **La phase de spécification** : l'agent formalise l'intention, les exigences fonctionnelles et la liste ordonnée des tâches, que le développeur relit et affine.
2. **La phase d'implémentation** : l'agent applique les tâches pas-à-pas sur une base validée, puis archive le changement pour actualiser la documentation vivante du projet.

## Le cycle de travail en 5 étapes

Le flux de travail OpenSpec s'articule autour d'une boucle courte et maîtrisée :

1. **Explorer (`openspec explore`)** *(facultatif)* : clarifier une idée, poser des questions et évaluer plusieurs approches techniques avant d'engager du travail.
2. **Proposer (`openspec propose <nom>`)** : créer un dossier de changement isolé contenant la proposition, les spécifications delta et le plan de tâches.
3. **Relire (Validation humaine)** : étape critique où le développeur examine les artéfacts créés, corrige les choix techniques et ajuste les critères de succès *avant* toute modification de code.
4. **Appliquer (`openspec apply`)** : l'agent implémente les tâches une par une, exécute les tests et coche les cases d'avancement dans `tasks.md`.
5. **Archiver (`openspec archive`)** : les spécifications delta sont fusionnées dans la documentation pérenne (`openspec/specs/`) et le dossier de changement est archivé.

## Mots-clés et artéfacts

| Artéfact / Dossier | Rôle |
| --- | --- |
| `openspec/specs/` | Spécifications pérennes décrivant le comportement actuel attendu du système |
| `openspec/changes/<id>/` | Dossier isolé dédié à une évolution ou un correctif précis |
| `proposal.md` | Résume le pourquoi, le périmètre, les contraintes et l'impact du changement |
| `specs/` (delta) | Décrit les exigences ajoutées, modifiées ou retirées par rapport aux specs actuelles |
| `tasks.md` | Liste séquentielle et cochable des tâches techniques à réaliser |
| `design.md` | Document optionnel détaillant les choix d'architecture ou les modèles de données |

## Commandes principales

Dans le terminal ou via l'assistant IA (commandes slash selon l'outil) :

| Commande CLI | Commande assistant | Rôle |
| --- | --- | --- |
| `openspec init` | — | Initialise OpenSpec et crée la configuration du projet |
| `openspec propose <id>` | `/opsx:propose <id>` | Rédige en une passe la proposition, les specs delta et les tâches |
| `openspec apply` | `/opsx:apply` | Lance l'implémentation des tâches définies |
| `openspec sync` | `/opsx:sync` | Synchronise les specs delta vers les specs principales sans archiver |
| `openspec archive` | `/opsx:archive` | Fusionne les deltas dans les specs de référence et clôt le changement |

## Exemple pratique de structure

Voici à quoi ressemble l'arborescence d'un projet utilisant OpenSpec :

```text
mon-projet/
├── openspec/
│   ├── config.yaml          # Configuration et règles du projet
│   ├── specs/               # Spécifications de référence
│   │   └── authentification/
│   │       └── spec.md
│   └── changes/
│       ├── archive/         # Historique des changements terminés
│       └── add-rate-limiting/
│           ├── proposal.md  # Contexte et objectif
│           ├── design.md    # Stratégie (ex. token bucket via Redis)
│           ├── tasks.md     # Liste des étapes d'implémentation
│           └── specs/       # Delta par rapport à l'existant
│               └── authentification/
│                   └── spec.md
```

## Exemple d'un fichier `tasks.md`

Les tâches sont formulées de manière vérifiable pour guider l'agent sans ambiguïté :

```markdown
# Tâches pour la limitation des requêtes

- [x] 1. Configurer le middleware de limitation de débit
  - [x] 1.1 Installer la dépendance de stockage en mémoire
  - [x] 1.2 Définir le seuil à 5 tentatives par minute
- [ ] 2. Gérer le dépassement de quota
  - [ ] 2.1 Renvoyer un code HTTP 429 avec l'en-tête Retry-After
  - [ ] 2.2 Ajouter un test unitaire simulant 6 requêtes consécutives
```

## Deux cas d'usage : projet neuf vs projet existant

Selon la maturité de votre code, la stratégie d'adoption d'OpenSpec diffère :

### Cas 1 : Projet partant de zéro (greenfield)

Dans un dossier vide ou fraîchement initialisé avec Git :

1. **Initialiser l'environnement** : lancez `openspec init` à la racine pour générer le dossier `openspec/` et configurer votre assistant.
2. **Éviter le piège de la méga-spécification** : ne tentez pas de décrire toute l'application d'un coup. Le modèle SDD reste incrémental.
3. **Proposer le premier socle technique** : demandez à l'assistant de proposer la fondation (`openspec propose setup-architecture` ou `init-backend`). Utilisez `openspec explore` si les choix technologiques nécessitent une discussion préalable.
4. **Valider et appliquer** : relisez `proposal.md`, vérifiez que les dépendances et la configuration sont cohérentes, appliquez les tâches (`openspec apply`), puis archivez (`openspec archive`).
5. **Enchaîner par incréments** : chaque nouvelle fonctionnalité s'appuie désormais sur les spécifications enregistrées lors de l'étape précédente.

### Cas 2 : Projet déjà bien avancé (brownfield)

Sur une base de code existante comportant déjà de nombreux fichiers, composants ou API :

1. **Initialiser sans tout rétro-documenter** : lancez `openspec init`. Le dossier `openspec/specs/` démarre vide, ce qui est tout à fait normal. Il est inutile et contre-productif de passer des semaines à rétro-spécifier le code historique.
2. **Spécifier au fil de l'eau (Just-In-Time)** : adoptez OpenSpec dès le prochain besoin concret (ajout d'une fonctionnalité, refactorisation d'un module ou correction d'un bug critique).
3. **Cibler le delta** : l'agent analyse le code et les tests existants pour formuler sa proposition. Les spécifications delta ne décrivent que le comportement attendu sur le périmètre touché.
4. **Appliquer et archiver** : une fois le travail vérifié et validé, `openspec archive` reporte les spécifications du module dans `openspec/specs/`.
5. **Croissance organique de la documentation** : au fil des semaines, la documentation vivante de votre projet se constitue naturellement sans jamais ralentir le rythme des livraisons.

## Bonnes pratiques et pièges à éviter

- **Ne jamais sauter la relecture** : La force du modèle repose sur la relecture de `proposal.md` et `tasks.md` avant l'écriture du premier fichier source.
- **Découper en changements atomiques** : Éviter les changements monstres qui touchent dix fonctionnalités à la fois. Un changement OpenSpec doit avoir un périmètre unitaire.
- **Ne pas éditer manuellement `specs/` en cours de route** : Toutes les modifications doivent passer par un delta de changement dans `changes/`, puis être intégrées automatiquement lors de l'archivage.

## À retenir

OpenSpec s'adapte aussi bien à un projet neuf (par petits incréments successifs sans sur-spécifier au départ) qu'à un projet existant (adoption au fil de l'eau sans rétro-documentation massive). Explorer si besoin, proposer, relire le plan avant d'écrire le code, appliquer les tâches, puis archiver pour capitaliser les spécifications.

## Sources

- [Documentation officielle OpenSpec](https://openspec.dev/docs/quickstart)
- [Dépôt GitHub d'OpenSpec](https://github.com/Fission-AI/OpenSpec)
