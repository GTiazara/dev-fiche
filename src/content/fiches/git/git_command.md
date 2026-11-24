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
updatedAt: 2026-11-23
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
git log --oneline -- chemin/du/fichier   # historique d'un seul fichier
git show                                 # dernier commit : message + diff
git show abc1234                         # un commit précis
git blame chemin/du/fichier              # qui a touché chaque ligne, et dans quel commit
```

Chaque ligne de `log --oneline` est un commit : un identifiant court, puis le message. `--graph` dessine les branches. `-15` limite l'affichage aux quinze derniers. `show` ouvre le détail d'un commit. `blame` sert quand on se demande *pourquoi* une ligne est ainsi.

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

### Lister les branches locales et distantes

```bash
git branch              # locales (* = branche courante)
git fetch --prune       # met à jour les refs distantes ; retire celles déjà supprimées sur le serveur
git branch -r           # distantes seulement (ex. origin/main)
git branch -a           # locales + distantes
git branch -vv          # locales avec branche de suivi et dernier commit
```

`-r` = remote, `-a` = all. Sans `fetch`, la liste distante peut être périmée. `--prune` évite d'afficher des `origin/…` qui n'existent plus.

### Récupérer une branche depuis le remote

Une branche vue avec `git branch -r` (ex. `origin/feature-x`) n'existe pas encore en local. Pour la télécharger puis s'y placer :

```bash
git fetch origin
git switch feature-x
```

Si une seule remote a cette branche, `git switch feature-x` crée la branche locale, la fait suivre `origin/feature-x`, et l'active. Équivalent explicite :

```bash
git switch -c feature-x --track origin/feature-x
```

Ancienne forme encore vue : `git checkout feature-x` (même idée). Vérifier le suivi avec `git branch -vv`.

Pour intégrer la correction :

```bash
git switch main
git merge correction-total
```

Quand la correction est intégrée (ou abandonnée), supprimer la branche locale devenue inutile :

```bash
git branch -d correction-total          # refuse s'il reste des commits non fusionnés
git branch -D correction-total          # force la suppression locale
git push origin --delete correction-total   # retire aussi la branche sur le distant
```

Git refuse le `switch` s'il devrait écraser des modifications non commitées. On les commit, ou on les met de côté avec `stash`, avant de changer de branche.

## Récupérer et publier

Pour démarrer depuis zéro : `git clone <url>` crée le dossier local et enregistre le distant sous le nom `origin`.

`fetch` télécharge les commits du dépôt distant sans toucher aux fichiers ouverts. `pull` fait ce téléchargement, puis fusionne dans la branche courante. `push` envoie les commits locaux.

```bash
git remote -v            # URL des distants (souvent origin)
git fetch origin
git pull
git pull --rebase        # rejoue vos commits locaux *au-dessus* du distant (historique plus linéaire)
git push -u origin HEAD
```

`-u` mémorise le lien entre la branche locale et sa branche distante. Les `push` suivants peuvent s'écrire `git push`. `HEAD` désigne le commit sur lequel on se trouve. `pull --rebase` est fréquent sur une branche de travail personnelle ; en cas de doute ou d'historique partagé complexe, un `pull` (merge) reste plus simple. Le détail des conflits de rebase est dans la fiche conflits.

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
| Mettre les modifications de côté | `git stash push -u -m "essai"` | Le disque redevient propre ; `-u` inclut aussi les fichiers non suivis |
| Lister / réappliquer le stash | `git stash list` puis `git stash pop` | `pop` ramène et retire l'entrée ; `git stash apply` ramène sans la retirer |
| Défaire un commit déjà publié | `git revert <commit>` | Ajoute un commit inverse, sans réécrire l'historique |
| Effacer fichiers non suivis (brouillons) | `git clean -fd` | **Irréversible** : regarde d'abord avec `git clean -fdn` (dry-run) |

`git reset --hard` ramène la branche et le disque à un commit donné. Les modifications non commitées disparaissent. On le réserve à un travail local qu'on accepte de jeter. Sur une branche déjà poussée et utilisée par d'autres, `git revert` est le choix qui ne les force pas à réécrire leur copie.

Pour reprendre un commit précis d'une autre branche sans tout fusionner :

```bash
git cherry-pick <commit>
```

Utile pour une correction isolée déjà commité ailleurs. En cas de conflit : résoudre, `git add`, puis `git cherry-pick --continue` (ou `--abort` pour annuler).

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
- `log` / `show` / `blame` pour lire l'historique et l'origine d'une ligne.
- `add` prépare, `commit` fige. Un message de commit explique le pourquoi.
- `switch -c` isole un travail. `branch` / `-r` / `-a` listent locales et distantes ; `fetch` puis `switch nom` récupère une branche distante. `-d` / `push --delete` nettoient une branche finie.
- `remote -v`, `fetch`, `pull` (parfois `--rebase`), `push` : lien avec le distant.
- `stash` met de côté ; `clean -fdn` puis `-fd` pour les fichiers non suivis. `restore` / `reset --hard` peuvent effacer du travail non commité. `revert` défait un commit publié. `cherry-pick` reprend un commit isolé.
- `git rm --cached` retire le suivi et laisse le fichier sur le disque. `git ls-files` sert à viser plusieurs chemins déjà suivis.
