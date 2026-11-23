---
title: "GitLab : le bouton Resolve conflicts fusionne la cible dans la source"
description: "Comprendre ce que fait vraiment « Resolve conflicts » ou « Update branch » dans une merge request GitLab, et pourquoi un commit Merge branch 'cible' into 'source' apparaît sur votre branche."
technology: git
difficulty: intermediaire
tags:
  - git
  - gitlab
  - merge-request
  - conflits
  - resolve-conflicts
  - update-branch
publishedAt: 2026-11-20
updatedAt: 2026-11-20
draft: false
quiz:
  - question: "Dans une MR « source → cible », que fait le merge de la MR une fois accepté ?"
    choices:
      - "Il ajoute les commits de la source dans la branche cible"
      - "Il ajoute les commits de la cible dans la branche source"
      - "Il crée deux commits, un sur chaque branche"
    answer: 0
    explanation: "Le merge de la MR modifie la branche cible. La branche source n'est pas mise à jour par cette acceptation."
  - question: "Que fait le bouton « Resolve conflicts » (ou souvent « Update branch ») dans l'interface GitLab ?"
    choices:
      - "Il fusionne la branche cible dans la branche source et pousse ce merge sur la source"
      - "Il fusionne la source dans la cible sans attendre l'acceptation de la MR"
      - "Il n'écrit rien : il ouvre seulement un éditeur local"
    answer: 0
    explanation: "Pour rendre la MR fusionnable, GitLab écrit sur la branche source un commit du type Merge branch 'cible' into 'source'."
  - question: "Un commit « Merge branch 'cible' into 'source' » apparaît sur votre branche source, sans MR dans ce sens. Quelle cause est la plus probable ?"
    choices:
      - "Quelqu'un a ouvert une MR cible → source et l'a fusionnée"
      - "Quelqu'un a cliqué sur Resolve conflicts / Update branch dans la MR source → cible"
      - "git push --force a inversé les deux branches"
    answer: 1
    explanation: "GitLab crée ce commit en votre nom depuis l'interface. Ce n'est pas le merge de la MR, et aucune MR inverse n'est nécessaire."
  - question: "Comment éviter que la cible entre dans la source via l'interface ?"
    choices:
      - "Résoudre localement : checkout de la source, merge ou rebase de la cible, puis push"
      - "Toujours utiliser Resolve conflicts dans GitLab"
      - "Supprimer la branche cible avant d'ouvrir la MR"
    answer: 0
    explanation: "En résolvant en local, vous contrôlez exactement ce qui entre dans la branche source. Le bouton GitLab, lui, pousse toujours un merge cible → source."
  - question: "Après un Resolve conflicts GitLab, votre dépôt local n'a plus ce commit de merge, mais le remote l'a. Que se passe-t-il au prochain push normal ?"
    choices:
      - "Le push est refusé : les historiques ont divergé"
      - "Git écrase automatiquement le remote"
      - "Rien : GitLab ignore les commits de merge"
    answer: 0
    explanation: "Le remote a un commit que le local n'a pas (ou l'inverse après un rebase). Il faut fetch, puis merge/rebase, ou un force-with-lease conscient si on a réécrit l'historique local."
---

## Définition

Dans une **merge request** (MR) GitLab, on parle de :

| Notion | Rôle |
| --- | --- |
| Branche **source** | Celle que vous proposez (ex. `feature/ma-tache`) |
| Branche **cible** | Celle qui doit recevoir le travail (ex. `main`, ou une autre feature) |
| Sens de la MR | **source → cible** : « intégrer la source dans la cible » |

Quand la MR est **acceptée**, GitLab (ou le mainteneur) fusionne la **source dans la cible**. La branche source elle-même n'est pas modifiée par cette acceptation.

Pourtant, on voit parfois apparaître sur la **source** un commit du type :

```text
Merge branch 'cible' into 'source'
```

sans qu'aucune MR « cible → source » n'ait jamais existé. Ce n'est pas un bug de Git : c'est le bouton d'interface **Resolve conflicts** (ou, selon les écrans, **Update branch**).

## Le piège

Les métadonnées du commit montrent souvent :

- **auteur** : vous (ou le compte qui a cliqué) ;
- **committer** : GitLab ;
- **message** : `Merge branch '<cible>' into '<source>'`.

On croit alors qu'une MR inverse a été fusionnée, ou que « le merge de la MR » a touché la source. En réalité :

1. la MR était **source → cible** ;
2. elle affichait des **conflits** ou un **retard** par rapport à la cible ;
3. quelqu'un a cliqué sur **Resolve conflicts** / **Update branch** dans GitLab ;
4. GitLab a fusionné la **cible dans la source** et a **poussé** ce commit de merge sur la source.

Résultat : les changements de la cible se retrouvent dans la source **avant** même l'acceptation de la MR. Le merge final de la MR, lui, ne fait qu'intégrer la source (déjà enrichie) dans la cible.

```text
Ce que l'on croit :     source  ──────────────►  cible
                         (MR acceptée)

Ce que le bouton fait :  cible  ──merge──►  source
                         (poussé sur la source)
```

## Pourquoi GitLab fait ça

Pour qu'une MR soit fusionnable, la source doit pouvoir s'appliquer sur la cible. Si la cible a avancé (autres merges, commits), GitLab propose de **mettre la source à jour** en y intégrant la cible. L'interface web le fait en créant un **commit de merge** sur la source — le chemin le plus simple côté serveur.

Ce n'est pas équivalent à « fusionner la MR tout de suite ». C'est une préparation de la branche source.

## Comment le reconnaître

```bash
git fetch origin
git log --oneline --graph origin/ma-branche-source -15
```

Indices typiques :

- un commit `Merge branch '…cible…' into '…source…'` sur la **source** ;
- aucune MR ouverte ou fusionnée dans le sens inverse ;
- le commit apparaît juste après un clic dans l'interface, pas après un `git merge` local que vous auriez fait.

Dans l'UI GitLab (commit ou « Commits » de la MR), l'auteur affiché et le message standard confirment souvent l'origine web.

## Deux façons de gérer les conflits d'une MR

### 1. Résoudre en local (recommandé)

Vous contrôlez exactement ce qui entre dans la source :

```bash
git fetch origin
git checkout ma-branche-source

# Intégrer la cible dans la source, sous votre contrôle
git merge origin/ma-branche-cible
# ou, pour un historique linéaire :
# git rebase origin/ma-branche-cible

# Résoudre les conflits, puis :
git add …
git commit          # si merge
# git rebase --continue   # si rebase

git push origin ma-branche-source
```

La fiche sur les conflits Git détaille stash, marqueurs, `ours` / `theirs` et `--force-with-lease`.

### 2. Utiliser « Resolve conflicts » dans GitLab

C'est pratique, mais avec une règle claire :

> GitLab ajoutera **toujours** un commit `Merge branch '<cible>' into '<source>'` **sur la branche source**.

Si d'autres personnes (ou vous-même en local) travaillent déjà sur cette source, ce push distant peut :

- faire **diverger** votre dépôt local (`fetch` puis merge/rebase) ;
- réintroduire des changements de la cible que vous pensiez garder hors de la source ;
- surprendre après un rebase local + `push --force-with-lease` : le remote avait reçu le merge GitLab entre-temps.

## Bonnes pratiques

- Lire le **sens** de la MR : source → cible. Le merge d'acceptation touche la cible ; le bouton de résolution touche la source.
- Préférer la **résolution locale** dès que la branche source est partagée ou que le contenu importé depuis la cible doit rester sous contrôle.
- Après un clic web : `git fetch` et `git log --graph` avant de rebaser ou de forcer une poussée.
- Ne pas conclure trop vite à une « MR inversée » : chercher d'abord un commit `Merge branch 'cible' into 'source'` créé par l'interface.

## À retenir

- Une MR **source → cible** fusionnée modifie la **cible**, pas la source.
- **Resolve conflicts** / **Update branch** fusionne la **cible dans la source** et pousse ce merge sur la source.
- Le message typique `Merge branch 'cible' into 'source'` vient souvent de GitLab, pas d'une MR dans l'autre sens.
- Pour contrôler le contenu : résoudre en local (`checkout` source, `merge` ou `rebase` de la cible, `push`).
- Si vous utilisez le bouton web, assumez qu'un commit de merge apparaîtra sur la source et peut faire diverger votre historique local.

## Sources

Sources encore accessibles (vérifiées) :

- Documentation officielle : [Merge conflicts](https://docs.gitlab.com/user/project/merge_requests/conflicts/) — « GitLab resolves conflicts by creating a merge commit in the source branch without merging it into the target branch » ; le mode interactif « merges the target branch into the source branch », puis **Commit to source branch**.
- Blog GitLab : [Resolving Merge Conflicts from the GitLab UI](https://about.gitlab.com/blog/resolving-merge-conflicts-from-the-gitlab-ui/) — équivalent explicite de `git checkout <source> && git merge <cible>`, puis écriture du merge commit sur la source.
- Forum GitLab : [Merge request also modifies source branch](https://forum.gitlab.com/t/merge-request-also-modifies-source-branch/30316) — même surprise côté utilisateurs ; réponses qui confirment que c'est le comportement voulu de la résolution de conflits dans l'UI.
