---
title: "Ignorer des fichiers avec .gitignore"
description: "Écrire des motifs .gitignore, comprendre leur ancrage, choisir entre fichier partagé, exclusion locale et ignore global, retirer un fichier du suivi et conserver un dossier vide."
technology: git
difficulty: intermediaire
tags:
  - git
  - gitignore
  - depot
  - secrets
publishedAt: 2026-10-30
updatedAt: 2026-10-30
draft: false
quiz:
  - question: "Une nouvelle ligne de .gitignore retire-t-elle un fichier déjà suivi par Git ?"
    choices:
      - "Non, tant que le fichier reste dans l'index"
      - "Oui, dès le prochain git status"
      - "Oui, mais seulement s'il est dans un sous-dossier"
    answer: 0
    explanation: "Gitignore ne concerne que les fichiers non suivis. Un fichier déjà dans l'index reste suivi tant qu'on ne le retire pas avec git rm --cached."
  - question: "Pourquoi !logs/keep.log ne réinclut-il rien si la ligne précédente est logs/ ?"
    choices:
      - "Git ne parcourt pas un dossier entièrement exclu, donc la négation ne voit pas le fichier"
      - "Le point d'exclamation n'est pas un caractère reconnu"
      - "Une négation ne peut viser qu'un dossier"
    answer: 0
    explanation: "Exclure le dossier logs/ empêche Git d'en lire le contenu. Il faut exclure le contenu (logs/*) puis réinclure le fichier voulu."
  - question: "Où poser une règle personnelle qui ne doit pas être commitée ?"
    choices:
      - "Dans .git/info/exclude"
      - "Dans un second .gitignore à la racine, non suivi"
      - "Dans .ignore"
    answer: 0
    explanation: ".git/info/exclude suit la même syntaxe que .gitignore, mais ce fichier n'est pas versionné. .ignore n'est pas lu par Git."
  - question: "Quelle commande montre la règle qui ignore un chemin ?"
    choices:
      - "git check-ignore -v chemin"
      - "git ignore --why chemin"
      - "git status --rule chemin"
    answer: 0
    explanation: "git check-ignore -v affiche le fichier et la ligne du motif qui correspondent au chemin."
  - question: "Où le motif donnees/brut.csv est-il recherché ?"
    choices:
      - "À partir du dossier qui contient le fichier .gitignore"
      - "Dans tous les dossiers du dépôt"
      - "Uniquement à la racine du système"
    answer: 0
    explanation: "Un motif contenant une barre oblique hors de sa fin est ancré par rapport au dossier du fichier .gitignore qui le contient."
---

# 1. Ce que Git ignore

`.gitignore` liste des chemins que Git ne doit pas proposer à l'ajout. Il sert aux fichiers générés, aux dépendances installées et aux secrets locaux.

Git ne lit pas un fichier nommé `.ignore`. Ce nom est utilisé par d'autres outils, comme ripgrep. Pour Git, le fichier s'appelle `.gitignore`.

Le fichier doit être ajouté au dépôt et commité : toute l'équipe partage alors les mêmes règles.

# 2. Trois endroits pour une règle

| Fichier | Partagé avec l'équipe | Usage |
|---|---|---|
| `.gitignore` dans le dépôt | Oui | `node_modules/`, `dist/`, `.env` |
| `.git/info/exclude` | Non | Un outil installé seulement sur cette machine |
| Fichier de `core.excludesFile` | Non, tous les dépôts de l'utilisateur | `.DS_Store`, fichiers d'éditeur |

Un `.gitignore` peut vivre dans un sous-dossier. Il ne s'applique qu'à ce dossier et à ce qu'il contient.

Le fichier global se déclare une fois :

```bash
git config --global core.excludesFile ~/.config/git/ignore
```

# 3. Qui gagne

Dans un même fichier, la dernière ligne qui correspond au chemin décide.

Entre plusieurs `.gitignore`, celui du dossier le plus proche du fichier gagne sur celui d'un parent.

Un `.gitignore` du dépôt gagne sur `.git/info/exclude`, qui gagne lui-même sur le fichier global.

# 4. Écrire un motif

| Motif | Effet |
|---|---|
| `*.log` | Tout fichier `.log`, dans n'importe quel dossier |
| `/build` | Seulement `build` au niveau du `.gitignore`, pas dans un sous-dossier |
| `build/` | Un dossier nommé `build`, n'importe où. La barre finale limite le motif aux dossiers |
| `doc/**/*.pdf` | Les PDF sous `doc/`, à toute profondeur |
| `!important.log` | Réinclut un fichier qu'une ligne précédente excluait |
| `# commentaire` | Git traite la ligne comme un commentaire. `\#secret` vise un fichier dont le nom commence par `#` |

La place du `/` décide de l'ancrage du motif. Sans `/`, ou avec seulement le `/` final de `build/`, le nom est recherché à tous les niveaux sous le `.gitignore`. Avec un `/` au début ou au milieu, le motif désigne un chemin à partir du dossier qui contient ce `.gitignore`.

`*` ne traverse pas un `/`. `**` le traverse. `?` remplace un seul caractère, jamais un `/`.

Une espace en fin de ligne est retirée. Pour garder une espace dans le nom, on l'échappe avec `\`.

# 5. Réinclure un fichier

Cette paire ne garde pas `keep.log` :

```text
logs/
!logs/keep.log
```

Git ne descend pas dans un dossier exclu. La négation ne voit donc jamais le fichier. On exclut le contenu, pas le dossier :

```text
logs/*
!logs/keep.log
```

La même limite vaut pour tout dossier parent exclu.

# 6. Un fichier déjà suivi

Ajouter une ligne ne retire pas un fichier déjà présent dans l'index. `git status` continue de le montrer s'il change.

On le sort du suivi sans l'effacer du disque. L'option `-r` sert pour un dossier entier :

```bash
git rm --cached config.local
git rm -r --cached build/
```

Ces commandes préparent le retrait dans l'index. Le commit suivant l'enregistre. Le fichier reste sur le disque, et la règle de `.gitignore` s'applique ensuite. Cela n'efface pas les commits déjà publiés : un secret commité une fois reste dans l'historique.

Pour ajouter quand même un fichier ignoré :

```bash
git add -f chemin
```

Une fois dans l'index, les règles ne le concernent plus.

# 7. Garder un dossier vide

Git versionne des fichiers, pas des dossiers. Un dossier vide, ou qui ne contient que des fichiers ignorés, n'apparaît donc pas dans le dépôt.

Pour conserver une arborescence, on place dedans un petit fichier vide nommé `.gitkeep`. Ce nom est une convention, pas une fonction de Git : c'est le fichier qui est suivi, pas le dossier.

```bash
mkdir -p donnees/brutes
touch donnees/brutes/.gitkeep
git add donnees/brutes/.gitkeep
```

Si le contenu du dossier est ignoré, il faut réinclure ce fichier :

```text
donnees/brutes/*
!donnees/brutes/.gitkeep
```

# 8. Vérifier

```bash
git check-ignore -v chemin
git status --ignored
```

`git check-ignore -v` indique le fichier de règles et la ligne qui ignorent le chemin. S'il n'affiche rien, aucune règle ne correspond, ou le fichier est déjà suivi.

# 9. Motifs utiles

```text
# Dépendances et build
node_modules/
dist/
__pycache__/
.venv/

# Secrets locaux, sauf l'exemple commité
.env
.env.*
!.env.example

# Machine
.DS_Store
```

On ignore `.env`, qui contient les secrets. On commite `.env.example`, qui montre les noms de variables sans leurs valeurs.

## À retenir

- Git lit `.gitignore`, pas `.ignore`. Le fichier de règles du dépôt se commite.
- Une règle personnelle va dans `.git/info/exclude`. Une règle pour tous les dépôts va dans `core.excludesFile`.
- Dans un fichier, la dernière ligne gagne. Le `.gitignore` le plus proche du fichier gagne sur un parent.
- Sans `/`, un nom est cherché à tous les niveaux. Avec un `/` au début ou au milieu, le chemin part du dossier du `.gitignore`.
- `logs/` bloque toute réinclusion à l'intérieur. On écrit `logs/*`, puis `!logs/keep.log`.
- Un fichier déjà suivi ignore la règle jusqu'à `git rm --cached`. Retirer le suivi n'efface pas l'historique.
- Git ne versionne pas un dossier vide. Un fichier `.gitkeep` commité conserve l'arborescence.
- `git check-ignore -v chemin` montre la règle qui s'applique.
