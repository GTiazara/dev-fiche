---
title: "Branches divergées : lire l'écart local / distant et choisir le rapprochement"
description: "Diagnostiquer un ahead/behind, comprendre ce que chaque côté a en plus, puis choisir rebase ou merge avant de résoudre les conflits."
technology: git
difficulty: intermediaire
tags:
  - git
  - divergence
  - rebase
  - merge
  - fetch
  - ahead-behind
publishedAt: 2026-11-26
updatedAt: 2026-11-26
draft: false
---

## Définition

Deux branches ont **divergé** quand chacune porte des commits que l'autre n'a pas. Un `git pull` classique peut alors refuser un simple avance rapide (*fast-forward*) : il faut **rapprocher** les historiques.

Avant de fusionner ou de rebaser, on regarde l'état **local** et **distant** pour savoir :

1. combien de commits on a en avance (*ahead*) ;
2. combien on a en retard (*behind*) ;
3. quel contenu est unique de chaque côté ;
4. si un **rebase** (historique linéaire) ou un **merge** (commit de fusion) est le bon choix.

La résolution fichier par fichier (marqueurs, `ours` / `theirs`, `--continue`) est détaillée dans la fiche sur les conflits Git.

## Diagnostiquer sans toucher au travail

```bash
git fetch origin
git status -sb
git rev-list --left-right --count HEAD...@{upstream}
```

`fetch` met à jour `origin/…` **sans** modifier votre branche. `status -sb` affiche souvent `[ahead 1, behind 6]`. Les deux nombres de `rev-list` (séparés par une tabulation) sont le même résumé, sous une forme stable pour les scripts.

| Sortie typique | Signification |
| --- | --- |
| `1	6` | 1 commit **local** absent du distant ; 6 commits **distants** absents en local |
| `0	3` | seulement en retard (rien à pousser de unique) |
| `2	0` | seulement en avance (push possible en fast-forward si le distant n'a rien d'autre) |
| `0	0` | aligné avec l'amont |

Les **trois points** `A...B` comptent la différence symétrique. Avec deux points (`A..B`), on ne compte qu'un seul sens — ce n'est pas le résumé ahead/behind.

Voir *quoi* diverge :

```bash
git log --oneline --left-right HEAD...@{upstream}
git log --oneline --graph --decorate -20 HEAD @{upstream}
```

`<` = côté gauche (`HEAD`), `>` = côté droit (amont). On peut aussi comparer explicitement : `main...origin/main`.

## Choisir le rapprochement

Même point de départ divergé, deux outils :

| Besoin | Commande | Effet sur l'historique |
| --- | --- | --- |
| Remettre **vos** commits au-dessus du distant | `git rebase @{upstream}` | Linéaire ; réécrit les SHA des commits rejoués |
| Joindre les deux sommets sans réécrire | `git merge @{upstream}` | Commit de merge à deux parents |
| Raccourci merge | `git pull` | `fetch` + merge (sauf config pull.rebase) |
| Raccourci rebase | `git pull --rebase` | `fetch` + rebase |

Repères pratiques :

- **Peu de commits locaux** (ex. 1 ahead, 6 behind) et branche surtout **à vous** → rebase souvent adapté : on récupère les 6 commits distants, puis on rejoue le commit local.
- Branche **déjà poussée et partagée**, ou politique d'équipe anti-force-push → préférer un **merge**.
- Ne pas rebaser des commits que d'autres ont déjà tirés, sauf accord et `--force-with-lease` conscient (livre Pro Git : *The Perils of Rebasing*).

Exemple de parcours (1 commit local « feature », 6 commits sur `origin/main`) :

```bash
git fetch origin
git rebase origin/main
# en cas de conflit : éditer → git add → git rebase --continue
# panique : git rebase --abort
git push                # si la branche n'avait pas encore l'historique rebasé
# sinon, si déjà poussée avant le rebase :
# git push --force-with-lease
```

Équivalent merge :

```bash
git fetch origin
git merge origin/main
# conflits → git add → git commit
git push
```

## Pendant un rebase : lire les conflits avec méthode

Git s'arrête sur le premier commit local qui ne s'applique pas proprement. Message typique : résoudre à la main, `git add` / `git rm`, puis `git rebase --continue` ; ou `--skip` / `--abort`.

Stratégie utile quand le distant a beaucoup bougé et que votre commit ajoute une **fonctionnalité isolée** :

1. partir de la version **distante** des fichiers très remaniés (Makefile, README, compose, etc.) ;
2. **réintégrer** proprement votre apport (service, cible make, doc) plutôt que de coller aveuglément tout le côté local ;
3. vérifier que le résultat démarre / build avant `--continue`.

Pendant un **rebase**, `ours` = la base (souvent le distant), `theirs` = le commit qu'on rejoue (souvent le vôtre). Ne pas inverser avec un merge. Détail dans la fiche conflits.

## Après le rapprochement

```bash
git status -sb
git rev-list --left-right --count HEAD...@{upstream}
git log --oneline --graph -10
```

On vise `0	0` (ou seulement *ahead* si vous n'avez pas encore poussé). Puis tests du projet, et `push` (éventuellement `--force-with-lease` après rebase d'une branche déjà publiée).

## À retenir

- Divergence = ahead **et** behind en même temps ; d'abord `fetch`, puis compter et lister.
- `git rev-list --left-right --count HEAD...@{upstream}` : deux nombres (local | distant).
- Rebase = rejouer le local au-dessus du distant (linéaire) ; merge = commit de jonction (pas de réécriture).
- Peu de commits locaux + branche personnelle → rebase fréquent ; historique partagé → merge.
- Conflits : résoudre, `add`, `rebase --continue` (ou merge + `commit`) ; `--abort` pour tout annuler.
- La fiche conflits détaille stash, marqueurs, `ours`/`theirs` et `--force-with-lease`.

## Sources

- [git-rev-list — `--left-right` et `--count`](https://git-scm.com/docs/git-rev-list) (différence symétrique `A...B`)
- [git-rebase](https://git-scm.com/docs/git-rebase) (`--continue`, `--skip`, `--abort`)
- [git-merge](https://git-scm.com/docs/git-merge)
- [Pro Git — Basic Branching and Merging](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging)
- [Pro Git — Rebasing](https://git-scm.com/book/en/v2/Git-Branching-Rebasing) (y compris les risques sur historique publié)
- [About merge conflicts — GitHub Docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/about-merge-conflicts)
