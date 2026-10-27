---
title: L'utilisation des commandes de configuration Git
description: "Découvrir et maîtriser les commandes essentielles de configuration Git : identité utilisateur, niveaux de configuration, paramètres globaux et locaux, éditeur et vérification des paramètres."
technology: git
difficulty: debutant
tags: [git, configuration, versioning, devops, commandes, terminal]
publishedAt: 2026-10-27
updatedAt: 2026-10-27
draft: false
quiz:
  - question: Quelle commande permet de configurer globalement son adresse e-mail Git ?
    choices:
      - git config user.email "email@example.com"
      - git config --global user.email "email@example.com"
      - git set email "email@example.com"
    answer: 1
    explanation: L'option `--global` enregistre l'adresse e-mail dans la configuration utilisateur, généralement dans le fichier `~/.gitconfig`.
  - question: Quelle commande permet d'afficher l'origine des paramètres de configuration Git ?
    choices:
      - git config --list --show-origin
      - git config --show-all
      - git status --config
    answer: 0
    explanation: L'option `--show-origin` indique le fichier depuis lequel chaque paramètre est chargé.
  - question: Quelle commande supprime uniquement l'adresse e-mail de la configuration globale ?
    choices:
      - git config --global --unset user.email
      - git config --delete user.email
      - git remove --global user.email
    answer: 0
    explanation: La commande `git config --global --unset user.email` supprime ce paramètre du niveau global sans toucher aux autres paramètres.
---

## Définition

**Git** est un système de gestion de versions distribué qui permet de suivre les modifications d'un projet, de collaborer avec d'autres développeurs et de retrouver l'historique du code source.

La commande **`git config`** permet de définir et de consulter les paramètres de Git : nom de l'auteur, adresse e-mail, éditeur de texte, alias et autres préférences.

Ces paramètres peuvent être définis à différents niveaux afin de s'appliquer à un seul dépôt ou à plusieurs projets.

## Les niveaux de configuration Git

Git possède plusieurs niveaux de configuration. Le niveau utilisé détermine la portée du paramètre et sa priorité.

| Niveau | Option | Fichier habituel | Portée |
| --- | --- | --- | --- |
| Système | `--system` | Fichier de configuration système de Git | Tous les utilisateurs de la machine |
| Global | `--global` | `~/.gitconfig` ou `~/.config/git/config` | Tous les dépôts de l'utilisateur |
| Local | `--local` | `.git/config` | Dépôt Git courant |
| Worktree | `--worktree` | Fichier de configuration du worktree | Worktree courant, si cette fonctionnalité est activée |

**Priorité générale :** lorsqu'un même paramètre est défini à plusieurs niveaux, la configuration locale prévaut généralement sur la configuration globale, qui prévaut sur la configuration système. Le niveau worktree peut prévaloir sur le niveau local lorsqu'il est activé.

## Syntaxe et commandes fondamentales

### 1. Configurer l'identité utilisateur

L'identité configurée est enregistrée dans les commits Git. Elle ne correspond pas nécessairement au compte utilisé pour se connecter à GitHub, GitLab ou un autre hébergeur.

**Configurer le nom et l'e-mail globalement :**

```bash
# Définir le nom de l'auteur pour tous les dépôts de l'utilisateur
git config --global user.name "Jean Dupont"

# Définir l'adresse e-mail globale
git config --global user.email "jean@example.com"
```

**Configurer le nom et l'e-mail pour un seul dépôt :**

Exécutez ces commandes dans le dossier du projet concerné.

```bash
# Définir le nom uniquement pour le dépôt courant
git config --local user.name "Jean Dupont"

# Définir l'e-mail uniquement pour le dépôt courant
git config --local user.email "jean@example.com"
```

La configuration locale permet d'utiliser une identité professionnelle dans un dépôt et une identité personnelle dans un autre, sans modifier la configuration globale.

### 2. Consulter la configuration Git

```bash
# Afficher toute la configuration effective
git config --list

# Afficher uniquement la configuration globale
git config --global --list

# Afficher le nom global
git config --global user.name

# Afficher l'e-mail global
git config --global user.email

# Afficher le nom configuré pour le dépôt courant
git config --local user.name

# Afficher l'e-mail configuré pour le dépôt courant
git config --local user.email

# Afficher chaque paramètre avec son fichier d'origine
git config --list --show-origin
```

**À retenir :** `git config --global user.email` affiche la valeur globale, tandis que `git config user.email` affiche la valeur effective pour le dépôt courant, en tenant compte des niveaux de configuration applicables.

### 3. Modifier ou supprimer un paramètre

```bash
# Modifier le nom global
git config --global user.name "Nouveau Nom"

# Modifier l'e-mail global
git config --global user.email "nouveau@example.com"

# Supprimer le nom global
git config --global --unset user.name

# Supprimer l'e-mail global
git config --global --unset user.email

# Supprimer toutes les valeurs globales d'un paramètre
git config --global --unset-all user.email
```

Si un paramètre possède plusieurs valeurs, `--unset` peut échouer. Utilisez alors `--unset-all` pour supprimer toutes ses valeurs au niveau concerné.

**Supprimer toute la configuration globale :**

```bash
# Afficher le fichier d'origine des paramètres
git config --global --list --show-origin
```

Repérez le fichier de configuration globale, puis supprimez-le uniquement si vous souhaitez effacer tous les paramètres qu'il contient.

Attention : cette opération peut également supprimer les alias, les préférences d'éditeur et d'autres paramètres personnalisés. Elle ne supprime pas les configurations locales des dépôts ni les identifiants d'authentification stockés séparément.

### 4. Configurer des paramètres utiles

```bash
# Définir Visual Studio Code comme éditeur Git
git config --global core.editor "code --wait"

# Activer la coloration de la sortie Git
git config --global color.ui auto

# Définir le nom de la branche initiale des nouveaux dépôts
git config --global init.defaultBranch main

# Créer un alias pour afficher un historique compact
git config --global alias.lg "log --oneline --graph --decorate --all"

# Utiliser l'alias créé
git lg
```

L'éditeur `code` doit être installé et accessible depuis le terminal pour que l'exemple fonctionne.

### 5. Vérifier la configuration utilisée pour un commit

Pour vérifier les paramètres d'identité applicables au dépôt courant :

```bash
git config user.name
git config user.email
```

Pour consulter les paramètres et leurs fichiers d'origine :

```bash
git config --list --show-origin
```

Pour vérifier l'identité enregistrée dans le dernier commit :

```bash
git log -1 --format="Nom : %an%nEmail : %ae"
```

Cette dernière commande affiche le nom et l'e-mail de l'auteur du dernier commit. Elle ne prouve pas qu'un compte GitHub ou GitLab est authentifié.

## Cas d'usage fréquents

- **Configuration initiale :** définir son nom et son adresse e-mail après l'installation de Git.
- **Projets personnels et professionnels :** définir une identité globale par défaut et la remplacer localement dans certains dépôts.
- **Diagnostic :** identifier le fichier responsable d'un paramètre incorrect à l'aide de `--show-origin`.
- **Correction d'identité :** modifier ou supprimer une adresse e-mail globale sans toucher aux autres paramètres.
- **Personnalisation :** configurer un éditeur de texte, des alias ou la branche initiale des nouveaux dépôts.

## Tableau récapitulatif des commandes

| Besoin | Commande |
| --- | --- |
| Définir le nom global | `git config --global user.name "Nom"` |
| Définir l'e-mail global | `git config --global user.email "email@example.com"` |
| Définir le nom local | `git config --local user.name "Nom"` |
| Définir l'e-mail local | `git config --local user.email "email@example.com"` |
| Afficher la configuration globale | `git config --global --list` |
| Afficher toute la configuration effective | `git config --list` |
| Identifier les fichiers de configuration | `git config --list --show-origin` |
| Supprimer le nom global | `git config --global --unset user.name` |
| Supprimer l'e-mail global | `git config --global --unset user.email` |
| Afficher l'identité du dernier commit | `git log -1 --format="%an <%ae>"` |

## Mots-clés

| Terme | Définition |
| --- | --- |
| `git config` | Commande permettant de consulter et de modifier les paramètres de Git. |
| `--global` | Option appliquant une configuration à l'ensemble des dépôts de l'utilisateur. |
| `--local` | Option limitant la configuration au dépôt courant. |
| `user.name` | Nom d'auteur enregistré dans les commits. |
| `user.email` | Adresse e-mail d'auteur enregistrée dans les commits. |
| `--unset` | Supprime une valeur de configuration. |
| `--unset-all` | Supprime toutes les valeurs d'un paramètre au niveau choisi. |
| `--show-origin` | Indique le fichier d'origine des paramètres affichés. |
| `.gitconfig` | Fichier contenant généralement les paramètres globaux de Git. |

## Pièges et points de vigilance

- **Confusion entre identité Git et compte GitHub :** `user.name` et `user.email` définissent l'identité des commits, mais ne configurent pas à eux seuls l'authentification auprès d'un hébergeur.
- **Priorité des configurations :** une valeur locale peut remplacer une valeur globale. Vérifiez les sources avec `git config --list --show-origin`.
- **Suppression incomplète :** supprimer un paramètre global ne supprime pas le paramètre correspondant dans les dépôts locaux.
- **Adresse e-mail incorrecte :** assurez-vous que l'adresse choisie correspond à celle que vous souhaitez associer à vos commits.
- **Modification de l'historique :** modifier `user.name` ou `user.email` ne change pas rétroactivement les commits déjà créés.
- **Suppression du fichier global :** ne supprimez pas tout le fichier `.gitconfig` si vous souhaitez uniquement modifier le nom ou l'e-mail.

## À retenir

La commande `git config` est essentielle pour personnaliser Git et gérer l'identité utilisée dans les commits.

Les commandes les plus importantes sont :

- `git config --global user.name "Nom"` pour définir le nom global.
- `git config --global user.email "email@example.com"` pour définir l'e-mail global.
- `git config --global --list` pour consulter la configuration globale.
- `git config --list --show-origin` pour identifier l'origine des paramètres.
- `git config --global --unset user.email` pour supprimer l'e-mail global.

**Conseil :** commencez par définir une identité globale, puis configurez une identité locale lorsque certains dépôts nécessitent des informations différentes.