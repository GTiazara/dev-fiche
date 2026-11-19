---
title: "Gérer les conflits Git, cas des branches divergentes"
description: "Comprendre et résoudre les conflits de merge et de rebase : fetch, stash, marqueurs, ours/theirs, rebase --skip, force-with-lease."
technology: git
difficulty: debutant
tags:
  - git
  - conflits
  - rebase
  - merge
  - fetch
  - stash
  - resolution-conflits
publishedAt: 2026-11-19
updatedAt: 2026-11-19
draft: false
quiz:
  - question: "Que signifie que « Your branch and 'origin/ma-branche' have diverged » ?"
    choices:
      - "Les branches locale et distante contiennent chacune des commits que l'autre n'a pas"
      - "La branche locale est strictement derrière origin/ma-branche"
      - "Des fichiers locaux ont des modifications non enregistrées"
    answer: 0
    explanation: "Ni la branche locale ni la branche distante ne contient l'historique de l'autre. Chacune a avancé de son côté : c'est une divergence."
  - question: "Pendant un rebase, que désigne « theirs » ?"
    choices:
      - "Toujours la branche distante origin/ma-branche"
      - "Le commit que l'on est en train de réappliquer (souvent votre commit local)"
      - "Toujours la version de main"
    answer: 1
    explanation: "Pendant un rebase, HEAD (ours) est la base sur laquelle on rejoue, et theirs est le commit en cours de réapplication. Pendant un merge, c'est l'inverse : ours = votre branche, theirs = celle fusionnée."
  - question: "Votre branche n'a pas encore été poussée après un rebase. Quelle poussée recommandée ?"
    choices:
      - "git push --force-with-lease"
      - "git push"
      - "git merge origin/ma-branche"
    answer: 1
    explanation: "Si la branche distante ne contient pas encore le résultat du rebase, un git push normal suffit. --force-with-lease n'est utile que si l'historique distant a déjà été réécrit."
  - question: "Lors d'un conflit pendant `git rebase origin/ma-branche`, comment le terminer ?"
    choices:
      - "Éditer les fichiers entre les marqueurs, puis git add, puis git rebase --continue"
      - "Appeler git rebase --continue sans éditer"
      - "Appeler git pull origin ma-branche"
    answer: 0
    explanation: "Git a écrit les deux versions dans chaque fichier concerné. Après avoir édité et git add, --continue reprend le rebase et réapplique le commit suivant."
  - question: "Votre branche a déjà été poussée avant un rebase. Quelle option utiliser pour pousser l'historique réécrit ?"
    choices:
      - "git push --force"
      - "git push --force-with-lease"
      - "git push"
    answer: 1
    explanation: "--force-with-lease échoue si la branche distante a bougé depuis votre dernière vérification. --force pur écrase sans ce contrôle. Un push normal est refusé, car les historiques divergent."
---

## Définition

Un **conflit Git** arrive quand deux branches contiennent des modifications incompatibles au même endroit, et qu'on veut les réunir.

Quand les branches ont **divergé** — chacune a des commits que l'autre n'a pas — un `git pull` (ou un `git merge` / `git rebase`) peut s'arrêter. Il faut alors choisir comment fusionner, et résoudre les conflits fichier par fichier.

## Mots-clés

| Notion | Rôle |
| --- | --- |
| Divergence | Chaque branche a des commits que l'autre n'a pas |
| `git fetch` | Met à jour `origin/...` sans toucher au travail local |
| `git log --graph` | Dessine les deux lignes d'historique, locale et distante |
| Marqueur `<<<<<<<` / `=======` / `>>>>>>>` | Délimitation des versions en conflit dans un fichier |
| `diff3` / `zdiff3` | Style de marqueurs qui montre aussi l'ancêtre commun |
| `--ours` / `--theirs` | Garder une version entière d'un fichier (sens différent selon merge ou rebase) |
| `git rebase` | Réapplique vos commits sur une autre base |
| `git rebase --skip` | Saute le commit en cours quand il devient inutile |
| Commit de fusion | Commit créé par un `merge` — a deux parents |
| `--force-with-lease` | Poussée forcée, mais refuse d'écraser si la branche distante a bougé |
| `git stash` | Met de côté les modifications non enregistrées |

## Diagnostiquer

```bash
# 1. Actualiser origin sans toucher au travail local
git fetch origin

# 2. Message typique : « Your branch and 'origin/ma-branche' have diverged »
git status

# 3. Voir les deux lignes d'historique
git log --oneline --graph -15

# 4. Comparer le sommet distant et le sommet local
git log --oneline origin/ma-branche -5
git log --oneline ma-branche -5
```

`git log --graph` affiche deux lignes : la branche locale et `origin/ma-branche`. Tant qu'elles n'ont pas de point de convergence récent, elles ont divergé.

## Mettre de côté le travail non enregistré

Un rebase ou un merge demande souvent un **arbre de travail propre**. Si vous avez des modifications non commitées (fichiers suivis, et éventuellement non suivis), mettez-les de côté avant :

```bash
# -u : inclut aussi les fichiers non suivis
# -m : message pour retrouver ce stash plus tard
git stash push -u -m "wip avant rebase"
```

Sans `-u`, les fichiers **non suivis** restent en place et peuvent encore bloquer ou polluer l'opération. Vérifier ensuite :

```bash
git status    # doit être propre, hors commits déjà enregistrés
git stash list
```

Après le rebase (ou le merge) réussi, récupérer le travail :

```bash
git stash pop
```

S'il y a un conflit au moment du `pop`, le résoudre comme un conflit classique, puis `git add` et, si besoin, `git stash drop` une fois le stash appliqué.

## Solution recommandée : rebaser

Réappliquer vos commits locaux **au-dessus** du sommet distant, pour retrouver une branche linéaire :

```bash
git rebase origin/ma-branche
```

S'il n'y a aucun conflit, c'est fini. Pousser :

```bash
# Si la branche n'avait pas encore été poussée après le rebase
git push origin ma-branche
```

Si la branche avait déjà été poussée **avant** le rebase, l'historique distant ne correspond plus. Utiliser :

```bash
git push --force-with-lease origin ma-branche
```

### Un conflit survient pendant le rebase

Git s'arrête sur le premier commit en conflit. Dans chaque fichier concerné, il a écrit deux versions entre les marqueurs :

```text
<<<<<<< HEAD
version déjà présente sur la base (souvent origin/ma-branche)
=======
version du commit local en cours de réapplication
>>>>>>> abc1234
```

Le hash après `>>>>>>>` désigne le commit en cours de réapplication. Résoudre :

```bash
# 1. Éditer chaque fichier, garder la version voulue, retirer les marqueurs
grep -n "<<<<<<<\|=======\|>>>>>>>" fichier.md
# 2. Stager les fichiers de résolution
git add fichier.md
# 3. Terminer ce pas du rebase ; le commit suivant sera réappliqué
git rebase --continue
# Alternative pour abandonner tout le rebase :
# git rebase --abort
```

#### Voir l'ancêtre commun : `diff3` / `zdiff3`

Par défaut, les marqueurs ne montrent que deux versions. Avec le style `zdiff3` (ou `diff3`), Git ajoute aussi la version **avant les deux modifications** :

```bash
git config --global merge.conflictStyle zdiff3
```

Les marqueurs ressemblent alors à ceci :

```text
<<<<<<< HEAD
votre version (ou la base, selon merge / rebase)
||||||| 8a1b2c3
version commune avant le conflit
=======
l'autre version
>>>>>>> abc1234
```

L'ancêtre commun aide à décider ce qu'il faut vraiment garder, au lieu de choisir au hasard entre les deux côtés.

#### Prendre une version entière : `--ours` / `--theirs`

Quand un fichier entier doit rester d'un seul côté :

```bash
git restore --ours -- chemin/fichier
# ou
git restore --theirs -- chemin/fichier
git add chemin/fichier
```

**Piège :** le sens change selon l'opération.

| Opération | `ours` (HEAD) | `theirs` |
| --- | --- | --- |
| `git merge` | Votre branche actuelle | La branche que vous fusionnez |
| `git rebase` | La base sur laquelle vous rejouez | Le commit que vous êtes en train de réappliquer |

Pendant un rebase de votre branche sur `origin/ma-branche`, **theirs** est souvent **votre** commit local. Vérifier avec `git status` avant d'écraser un fichier.

#### Sauter un commit : `git rebase --skip`

Après résolution, si le commit en cours n'apporte plus rien (modifications déjà présentes, commit devenu vide), ne pas forcer un commit inutile :

```bash
git rebase --skip
```

À utiliser seulement quand ce commit n'a plus de raison d'être. Sinon, `--continue`.

#### Conflits sans marqueurs

Certains conflits **n'écrivent pas** de `<<<<<<<` dans le fichier :

| Cas | Ce que dit souvent `git status` | Que faire |
| --- | --- | --- |
| Fichier binaire modifié des deux côtés | `both modified` sur une image, un PDF, etc. | Choisir une version avec `--ours` / `--theirs`, ou remplacer le fichier à la main, puis `git add` |
| Fichier supprimé d'un côté, modifié de l'autre | `deleted by us` / `deleted by them` | Soit `git rm chemin` (confirmer la suppression), soit `git add chemin` (garder le fichier) |

#### Vérifier avant de continuer

```bash
git status
# Les fichiers encore en conflit apparaissent souvent comme « both modified » / « unmerged »
grep -R "<<<<<<<" --include="*" .   # plus aucun marqueur oublié
```

Quand tout est résolu et indexé, `git rebase --continue`. Ensuite, lancer les **tests** ou le lint du projet avant de pousser : une résolution qui compile dans l'éditeur peut encore casser le build.

Une fois le rebase terminé, pousser avec `git push origin ma-branche`, ou `--force-with-lease` si la branche avait déjà été poussée. Si d'autres conflits apparaissent, répéter la même procédure.

## Alternative : fusionner

Si rebaser n'est pas pertinent (branche protégée, historique partagé, refus de réécrire l'historique) :

```bash
git pull origin ma-branche
# équivalent : git merge origin/ma-branche
```

Cela crée **un commit de fusion** en haut de l'historique, avec deux parents : le sommet local et le sommet distant. L'historique n'est plus linéaire, mais aucune branche n'est réécrite — c'est le choix plus sûr quand d'autres personnes poussent déjà sur la même branche.

Les conflits d'un merge se résolvent comme ceux d'un rebase : éditer les marqueurs (ou `--ours` / `--theirs`), `git add`, puis `git commit` (pas `git rebase --continue`). Pendant un merge, `ours` = votre branche, `theirs` = la branche fusionnée.

## Bonnes pratiques

- **Aller jusqu'au bout** : après chaque conflit, `git rebase --continue` (ou `--skip` si le commit est inutile), jusqu'à la fin, ou `git rebase --abort` pour tout annuler.
- **Activer `zdiff3`** une fois pour toutes : l'ancêtre commun réduit les mauvaises résolutions.
- **Ne pas confondre ours et theirs** entre merge et rebase.
- **Pousser une branche rebasée jamais poussée :** un `git push` normal suffit.
- **Pousser une branche rebasée déjà poussée :** `--force-with-lease`, pas `--force` pur. Prévenir l'équipe si la branche est partagée.
- **Sur une branche protégée ou partagée :** préférer un `merge` à un `rebase`.
- **Vérifier avant de pousser :** `git status`, absence de marqueurs, `git log --oneline --graph -10`, puis les tests du projet.

## À retenir

- « Divergée » = chaque branche a des commits que l'autre n'a pas ; un `git pull` simple peut ne plus suffire.
- Avant un rebase ou un merge : `git stash push -u -m "…"`, puis `git stash pop` après.
- Chemin linéaire : `git rebase origin/ma-branche`, résoudre, `git add`, `git rebase --continue` (ou `--skip`), puis `git push` (ou `--force-with-lease` si besoin).
- `ours` / `theirs` changent de sens entre merge et rebase ; `zdiff3` montre l'ancêtre commun.
- Les binaires et les suppressions n'ont souvent pas de marqueurs : choisir une version, puis `git add` ou `git rm`.
- Alternative non destructive : `git pull` ou `git merge` — un commit de fusion, sans réécriture d'historique.
- Après résolution : plus de marqueurs, puis tests avant de pousser.
