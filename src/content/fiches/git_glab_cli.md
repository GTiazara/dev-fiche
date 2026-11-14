---
title: "GitLab CLI (glab) : commandes essentielles"
description: "Installer et utiliser GitLab CLI pour consulter des dépôts, gérer des issues et merge requests, et suivre les pipelines depuis le terminal."
technology: git
difficulty: debutant
tags:
  - gitlab
  - glab
  - gitlab-cli
  - git
  - terminal
publishedAt: 2026-11-09
updatedAt: 2026-11-09
draft: false
quiz:
  - question: "Quelle est la différence entre git et glab ?"
    choices:
      - "git gère les versions du code ; glab interagit avec les fonctionnalités de GitLab"
      - "glab remplace git pour créer des commits"
      - "git sert uniquement à consulter les pipelines"
    answer: 0
    explanation: "git gère le dépôt et son historique. glab pilote des fonctionnalités GitLab comme les issues et les merge requests."
  - question: "Quelle commande permet de consulter les merge requests ouvertes ?"
    choices:
      - "glab issue list"
      - "glab mr list"
      - "git merge-request list"
    answer: 1
    explanation: "La sous-commande `mr` de glab permet de consulter et gérer les merge requests."
  - question: "Une merge request et un commit sont-ils la même chose ?"
    choices:
      - "Oui, ce sont deux noms pour un commit"
      - "Non, une merge request propose d'intégrer des changements dans une branche cible"
      - "Oui, mais seulement sur GitLab.com"
    answer: 1
    explanation: "Un commit enregistre des changements dans l'historique Git. Une merge request est une proposition de revue et d'intégration de changements sur GitLab."
---

# 1. Qu'est-ce que GitLab CLI ?

**GitLab CLI**, dont la commande est `glab`, est un outil en ligne de commande pour interagir avec GitLab depuis un terminal. Il permet notamment de consulter des projets, de gérer des issues et des merge requests, et de suivre les pipelines.

Il peut être utilisé avec GitLab.com et avec des instances GitLab auto-hébergées, selon la configuration et les fonctionnalités disponibles sur l'instance.

## `git` ou `glab` ?

| Outil | Rôle principal | Exemples |
|---|---|---|
| `git` | Gérer le dépôt et l'historique du code | `git status`, `git commit`, `git push` |
| `glab` | Interagir avec les fonctionnalités de GitLab | `glab issue list`, `glab mr create`, `glab pipeline list` |

`glab` complète Git ; il ne le remplace pas. Il peut aussi aider à préparer des opérations Git, par exemple cloner un projet ou récupérer localement la branche d'une merge request.

# 2. Installer et découvrir les commandes

Les méthodes d'installation dépendent du système d'exploitation. Consulte la documentation officielle de GitLab CLI pour choisir la méthode adaptée à ta machine.

Vérifie l'installation :

```bash
glab --version
```

Affiche l'aide générale et celle d'une sous-commande :

```bash
glab --help
glab issue --help
glab mr --help
```

# 3. S'authentifier auprès de GitLab

Lance l'assistant de connexion :

```bash
glab auth login
```

Choisis l'hôte GitLab et la méthode d'authentification proposées. Pour une instance auto-hébergée, indique l'hôte correspondant, par exemple `gitlab.exemple.fr`.

Vérifie l'état de la connexion :

```bash
glab auth status
```

La session de `glab` et l'accès Git en HTTPS ou en SSH sont liés à la configuration de la machine, mais ce sont des aspects distincts. Vérifie le protocole de ton dépôt avec :

```bash
git remote -v
```

Ne publie jamais un token dans un dépôt ni dans un script versionné. Pour l'automatisation, utilise le mécanisme de secrets de la plateforme concernée et limite les permissions au strict nécessaire.

# 4. Choisir un projet

Place-toi dans un dépôt Git associé à un projet GitLab :

```bash
cd mon-projet
```

Consulte le projet courant :

```bash
glab repo view
```

Clone un projet :

```bash
glab repo clone GROUPE/PROJET
cd PROJET
```

Remplace `GROUPE/PROJET` par le chemin du projet sur GitLab. Pour une instance auto-hébergée, l'hôte doit être configuré dans `glab`.

# 5. Les commandes essentielles

## Projets et issues

| Commande | Utilité |
|---|---|
| `glab repo view` | Consulter le projet courant |
| `glab repo clone GROUPE/PROJET` | Cloner un projet |
| `glab issue list` | Lister les issues |
| `glab issue view 42` | Consulter l'issue 42 |
| `glab issue create` | Créer une issue, avec les options ou l'assistant interactif |

## Merge requests

GitLab appelle **merge request** (MR) la proposition de fusion de changements. Sur d'autres plateformes, un mécanisme comparable est souvent appelé pull request.

| Commande | Utilité |
|---|---|
| `glab mr list` | Lister les merge requests |
| `glab mr view 42` | Consulter une merge request |
| `glab mr diff 42` | Examiner ses modifications |
| `glab mr checkout 42` | Récupérer localement sa branche |
| `glab mr create` | Créer une merge request |
| `glab mr approve 42` | Approuver une merge request, si autorisé |
| `glab mr merge 42` | Fusionner une merge request, si autorisé |

## Pipelines

| Commande | Utilité |
|---|---|
| `glab pipeline list` | Lister les pipelines du projet |
| `glab pipeline view ID` | Consulter un pipeline |
| `glab ci status` | Afficher l'état des pipelines associés au projet courant |

Les actions disponibles dépendent des droits du compte et de la configuration du projet GitLab.

# 6. Créer et examiner une merge request

Commence par créer une branche avec Git :

```bash
git switch -c fix/traitement-donnees
```

Après avoir modifié les fichiers, vérifie le travail, crée un commit et envoie la branche :

```bash
git status
git diff
git add fichier.py
git commit -m "Corriger le traitement des données"
git push -u origin fix/traitement-donnees
```

Crée ensuite une merge request :

```bash
glab mr create
```

L'assistant interactif demande les informations nécessaires. Consulte ensuite la merge request et ses modifications :

```bash
glab mr view
glab mr diff
```

Une merge request doit expliquer l'objectif du changement, les choix importants et les vérifications effectuées. La revue et la fusion restent soumises aux règles du projet.

# 7. Suivre l'intégration continue

Un pipeline GitLab exécute les tâches configurées dans le projet, par exemple les tests, la construction ou le déploiement.

Lister les exécutions récentes :

```bash
glab pipeline list
```

Consulter un pipeline précis :

```bash
glab pipeline view ID
```

Remplace `ID` par l'identifiant affiché dans la liste. La commande `glab ci status` fournit aussi un aperçu de l'état des pipelines du projet courant.

# 8. `glab` dans un script ou avec un agent

`glab` peut être appelé depuis un script ou un environnement de développement automatisé si l'outil y est installé et authentifié. Cela ne rend pas les opérations automatiquement sûres : les permissions du compte déterminent ce qu'il peut faire.

Avant toute action, vérifie le projet et la session :

```bash
git status
glab auth status
glab repo view
```

Pour un agent ou un script, limite les droits, évite de transmettre des secrets dans les arguments ou les journaux, et exige une validation humaine avant une fusion ou toute action importante lorsque le contexte le justifie.

## À retenir

- `git` gère les versions du code ; `glab` interagit avec les fonctionnalités de GitLab.
- `glab auth login` configure une connexion et `glab auth status` permet de la vérifier.
- Les commandes principales utilisent les groupes `repo`, `issue`, `mr` et `pipeline`.
- Une merge request propose des changements à la revue et à l'intégration ; elle n'est pas un commit.
- Les droits du compte et les règles du projet encadrent les opérations possibles.