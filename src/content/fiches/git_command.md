---
title: "Les commandes Git du quotidien"
description: "Suivre, enregistrer, publier et annuler des changements avec les commandes Git qu'un développeur utilise chaque jour."
technology: git
difficulty: debutant
tags:
  - git
  - commandes
  - commit
  - branche
  - terminal
publishedAt: 2026-11-13
updatedAt: 2026-11-13
draft: false
quiz:
  - question: "Où se trouve un fichier après git add, avant le commit ?"
    choices:
      - "Dans l'index, prêt à être enregistré"
      - "Uniquement sur le serveur distant"
      - "Effacé du disque"
    answer: 0
    explanation: "git add copie l'état du fichier dans l'index. Le commit suivant enregistre cet index dans l'historique."
  - question: "Quelle commande montre les modifications pas encore ajoutées à l'index ?"
    choices:
      - "git diff"
      - "git diff --staged"
      - "git log"
    answer: 0
    explanation: "git diff compare le disque et l'index. git diff --staged compare l'index et le dernier commit."
  - question: "Comment créer une branche et s'y placer ?"
    choices:
      - "git switch -c ma-branche"
      - "git commit -c ma-branche"
      - "git push ma-branche"
    answer: 0
    explanation: "git switch -c crée la branche à partir du commit courant et l'active. git switch ma-branche y revient plus tard."
  - question: "Quelle commande annule un commit déjà publié sans réécrire l'historique ?"
    choices:
      - "git revert"
      - "git reset --hard"
      - "git clean -fd"
    answer: 0
    explanation: "git revert ajoute un nouveau commit qui défait le précédent. L'historique partagé reste lisible pour les autres."
  - question: "git rm --cached fichier efface-t-il le fichier du disque ?"
    choices:
      - "Non, il le retire seulement de l'index"
      - "Oui, il le supprime partout"
      - "Oui, mais seulement s'il est ignoré"
    answer: 0
    explanation: "L'option --cached sort le fichier du suivi. Il reste sur le disque. Le commit suivant enregistre ce retrait."
---

## Définition

Git garde trois états d'un même fichier.

| État | Où il est | Question qu'il pose |
| --- | --- | --- |
| Disque | Le fichier ouvert dans l'éditeur | Qu'est-ce que je viens de changer ? |
| Index | La zone de préparation | Qu'est-ce que je veux enregistrer ? |
| Commit | L'historique | Qu'est-ce qui est déjà figé ? |

`git add` copie le disque vers l'index. `git commit` fige l'index dans l'historique. Tant qu'un changement n'est pas commité, il n'existe que sur cette machine.

## Voir avant d'enregistrer

`git status` dit quels fichiers sont modifiés, lesquels sont dans l'index, et sur quelle branche on se trouve. C'est la première commande à lancer.

```bash
git status
git diff
git diff --staged
```

`git diff` montre le texte changé entre le disque et l'index. `git diff --staged` montre ce qui partira dans le prochain commit. Lire ce second diff évite de commiter un fichier de brouillon ou un secret.

```bash
git log --oneline --graph -15
```

Chaque ligne est un commit : un identifiant court, puis le message. `--graph` dessine les branches. `-15` limite l'affichage aux quinze derniers.

## Enregistrer un changement

On ajoute un fichier précis plutôt que tout le dossier, pour ne pas emporter un fichier imprévu.

```bash
git add src/app.py
git commit -m "Corrige le calcul du total lorsque la liste est vide"
```

Le message dit pourquoi, pas seulement quels fichiers bougent. `git add -p` découpe un fichier en morceaux et demande, pour chacun, s'il entre dans le commit. Utile quand un fichier mélange une correction et un essai.

`git commit --amend` réécrit le dernier commit : message ou fichiers oubliés. On ne l'utilise que si ce commit n'a pas été poussé. Sinon les autres ont déjà l'ancienne version.

## Changer de branche

Une branche est un nom posé sur un commit, pas une copie du projet. On y travaille pour isoler une correction.

```bash
git switch -c correction-total
git switch main
git branch
```

`git switch -c` crée et active. `git switch main` revient sur `main`. `git branch` liste les branches locales. L'étoile marque la branche active.

Pour intégrer la correction :

```bash
git switch main
git merge correction-total
```

Git refuse le `switch` s'il devrait écraser des modifications non commitées. On les commit, ou on les met de côté avec `stash`, avant de changer de branche.

## Récupérer et publier

`fetch` télécharge les commits du dépôt distant sans toucher aux fichiers ouverts. `pull` fait ce téléchargement, puis fusionne dans la branche courante. `push` envoie les commits locaux.

```bash
git fetch origin
git pull
git push -u origin HEAD
```

`-u` mémorise le lien entre la branche locale et sa branche distante. Les `push` suivants peuvent s'écrire `git push`. `HEAD` désigne le commit sur lequel on se trouve.

Si `pull` signale un conflit, Git a écrit les deux versions dans le fichier, entre `<<<<<<<` et `>>>>>>>`. On garde le texte voulu, on retire ces marqueurs, puis :

```bash
git add chemin/du/fichier
git commit
```

## Annuler sans perdre le travail

| Besoin | Commande | Effet |
| --- | --- | --- |
| Retirer un fichier de l'index, le garder sur le disque | `git restore --staged chemin` | Le prochain commit ne l'inclut plus |
| Revenir à la version du dernier commit | `git restore chemin` | Les modifications non commitées de ce fichier sont perdues |
| Mettre les modifications de côté | `git stash push -m "essai"` | Le disque redevient propre ; `git stash pop` les ramène |
| Défaire un commit déjà publié | `git revert <commit>` | Ajoute un commit inverse, sans réécrire l'historique |

`git reset --hard` ramène la branche et le disque à un commit donné. Les modifications non commitées disparaissent. On le réserve à un travail local qu'on accepte de jeter. Sur une branche déjà poussée et utilisée par d'autres, `git revert` est le choix qui ne les force pas à réécrire leur copie.

## Sortir un fichier déjà suivi

Une ligne de `.gitignore` ne concerne pas un fichier déjà commité. Pour arrêter de le suivre sans l'effacer du disque :

```bash
git rm --cached config.local
```

Pour plusieurs chemins, par exemple tous les `__pycache__` déjà dans l'index :

```bash
git ls-files -z '*__pycache__*' | xargs -0 -r git rm -r --cached
```

`git ls-files` ne liste que les fichiers suivis. `-z` et `-0` séparent les chemins par un caractère nul, donc un nom contenant des espaces ne se coupe pas en deux. Le commit qui suit enregistre le retrait. On ajoute ensuite le motif au `.gitignore` pour que ces fichiers ne reviennent pas.

## À retenir

- `status`, puis `diff`, puis `diff --staged` : voir le disque, puis ce qui est prêt à être commité.
- `add` prépare, `commit` fige. Un message de commit explique le pourquoi.
- `switch -c` isole un travail. `fetch` regarde le distant, `pull` l'intègre, `push` publie.
- `restore` et `reset --hard` peuvent effacer du travail non commité. `revert` défait un commit publié en en ajoutant un nouveau.
- `git rm --cached` retire le suivi et laisse le fichier sur le disque. `git ls-files` sert à viser plusieurs chemins déjà suivis.
