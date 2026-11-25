---
title: "secret-tool : stocker et retrouver des mots de passe sous Linux"
description: "Utiliser secret-tool (libsecret) avec le Secret Service : store, lookup, clear, search, attributs, et éviter de laisser des secrets en clair dans les scripts."
technology:
  - linux
  - securite
difficulty: debutant
tags:
  - linux
  - secret-tool
  - libsecret
  - keyring
  - securite
  - mots-de-passe
publishedAt: 2026-11-25
updatedAt: 2026-11-25
draft: false
---

## Définition

**`secret-tool`** est l'outil en ligne de commande de **libsecret**. Il range et lit des secrets (mots de passe, jetons) via le **Secret Service** Freedesktop — le coffre utilisé en pratique par GNOME Keyring, et compatible avec d'autres agents du bureau Linux.

Chaque secret est un **item** identifié par des paires **attribut = valeur** (pas seulement par un nom de fichier). Le **label** est le texte affiché dans le gestionnaire de mots de passe.

| Notion | Rôle |
| --- | --- |
| **Item** | Une entrée (secret + métadonnées) |
| **Attributs** | Clés/valeurs qui **identifient** l'item (ex. `service gitlab`, `user alice`) |
| **Label** | Libellé humain (`--label=…`) |
| **Collection** | Coffre (souvent `login` par défaut) |

Sans daemon Secret Service actif (session graphique / keyring déverrouillé), les commandes échouent en général.

Paquet typique : `libsecret-tools` (Debian/Ubuntu) ou équivalent fournissant `secret-tool`.

## Commandes principales

```text
secret-tool store  --label='Label' attribute value ...
secret-tool lookup attribute value ...
secret-tool clear  attribute value ...
secret-tool search [--all] [--unlock] attribute value ...
secret-tool lock   --collection='collection'   # selon version / plateforme
```

### Stocker : `store`

```bash
secret-tool store --label='Jeton GitLab CI' service gitlab account alice
# invite : Password:
```

- `--label` **obligatoire** : visible dans le keyring.
- Attributs en paires : `nom valeur nom valeur …` — choisissez un jeu **unique**.
- Si les mêmes attributs existent déjà : l'item est **mis à jour** (pas un doublon).
- En TTY : une seule ligne saisie. Via **stdin** : tout jusqu'à EOF (un saut de ligne fait partie du secret s'il est envoyé).

```bash
printf '%s' 'mon-secret' | secret-tool store --label='API prod' service myapp env prod
```

Éviter `echo` non quoté / historique shell : préférer `printf` ou la invite interactive.

Collection autre que le défaut (si supporté) :

```bash
secret-tool store --collection='login' --label='…' service x account y
```

### Lire : `lookup`

```bash
secret-tool lookup service gitlab account alice
```

Mêmes paires d'attributs qu'au `store`. Si plusieurs items matchent : le premier **déjà déverrouillé** est renvoyé ; un item peut être déverrouillé au besoin. Sur un terminal, une **nouvelle ligne** est ajoutée après le secret.

Dans un script (sans newline parasite selon besoin) :

```bash
TOKEN="$(secret-tool lookup service gitlab account alice)"
# utiliser "$TOKEN" — ne pas l'afficher dans les logs
```

### Supprimer : `clear`

```bash
secret-tool clear service gitlab account alice
```

Retire **tous** les items **déverrouillés** qui matchent ces attributs.

### Chercher : `search`

```bash
secret-tool search service gitlab
secret-tool search --all service gitlab
secret-tool search --unlock service gitlab account alice
```

| Option | Effet |
| --- | --- |
| (défaut) | Un résultat (premier unlocked) |
| `--all` | Tous les matchs |
| `--unlock` | Déverrouille puis affiche aussi les items verrouillés |

`search` affiche des **détails**, pas seulement le mot de passe brut comme `lookup`.

### Verrouiller une collection : `lock`

Selon la version installée :

```bash
secret-tool lock --collection='login'
```

Utile pour verrouiller le coffre après usage sur une machine partagée.

## Attributs : bien les choisir

Les attributs sont la **clé primaire** logique. Exemples utiles :

```bash
# Un secret par application / environnement / compte
service mon-app env staging user deploy

# Un hôte SSH distinct
service ssh host bastion.example.com user ops
```

Mauvais réflexe : un seul attribut vague (`password secret`) pour tout — collisions et `clear` trop larges.

## Cas d'usage typiques

| Besoin | Approche |
| --- | --- |
| Script local qui appelle une API | `lookup` au démarrage, variable d'environnement **éphémère** |
| Remplacer un mot de passe en clair dans un fichier | `store` une fois ; le script ne contient plus le secret |
| CI distante | Souvent **autre** mécanisme (variables CI chiffrées) : le keyring local ne suit pas le runner |

`secret-tool` protège surtout le **poste** (coffre du session/keyring), pas un secret partagé en équipe via le dépôt Git.

## Prérequis et pièges

| Symptôme | Cause | Action |
| --- | --- | --- |
| Échec immédiat / pas de service | Pas de Secret Service / keyring | Session graphique, `gnome-keyring` / agent équivalent |
| Invite de déverrouillage | Collection verrouillée | Saisir le mot de passe de session ; ou déverrouiller le keyring |
| Mauvais secret / vide | Attributs différents du `store` | Reprendre exactement les mêmes paires ; `search --all` |
| Secret avec `\n` | Entrée via pipe avec newline | `printf '%s'` sans `\n` final |
| Secret dans l'historique bash | `echo monsecret \| store` | Invite interactive ou `printf` |

Ne jamais committer la sortie de `lookup`. Ne pas logger le secret.

## À retenir

- `secret-tool` = CLI **libsecret** → Secret Service (keyring Linux).
- Identité d'un secret = **attributs** ; affichage = **label**.
- Quotidien : `store` / `lookup` / `clear` / `search`.
- Mêmes attributs au store et au lookup ; collision = mise à jour.
- Pour les scripts : lire avec `lookup`, ne pas laisser le secret dans le fichier ni dans Git.

## Sources

- [secret-tool(1) — Debian manpages](https://manpages.debian.org/trixie/libsecret-tools/secret-tool.1.en.html) — store, lookup, clear, search, exemples.
- [secret-tool(1) — Arch Wiki man](https://man.archlinux.org/man/secret-tool.1.en) — options `--collection`, `lock`.
- [libsecret — documentation GNOME](https://gnome.pages.gitlab.gnome.org/libsecret/) — bibliothèque cliente Secret Service.
- [Freedesktop — Secret Service API](https://specifications.freedesktop.org/secret-service/) — spécification du bus D-Bus sous-jacent.
