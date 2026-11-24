---
title: Rclone, synchroniser avec le stockage cloud
description: Transférer, synchroniser et sauvegarder des données vers des stockages objets (S3) et services cloud distants.
technology: transfert_fichiers
difficulty: intermediaire
tags: [rclone, cloud, s3, synchronisation, sauvegarde]
publishedAt: 2026-10-25
updatedAt: 2026-11-24
draft: false
quiz:
  - question: Quelle est la différence majeure entre rclone copy et rclone sync ?
    choices:
      - rclone copy ne supprime rien dans la destination, tandis que rclone sync supprime les fichiers absents de la source
      - rclone copy est réservé aux serveurs SSH alors que rclone sync gère le cloud S3
      - rclone copy compresse automatiquement les données dans un fichier zip
    answer: 0
    explanation: rclone sync produit un miroir exact et supprime dans la destination ce qui a disparu de la source. rclone copy ajoute et met à jour sans suppression.
  - question: Comment désigne-t-on un stockage distant configuré dans Rclone ?
    choices:
      - Avec le nom du remote suivi de deux-points, par exemple mon-s3:mon-bucket
      - Avec une adresse IP obligatoire
      - Avec un préfixe file://
    answer: 0
    explanation: Rclone utilise la notation nom-du-remote:chemin pour distinguer les stockages distants du système de fichiers local.
  - question: Quelle commande lance l'assistant interactif pour ajouter un fournisseur cloud ?
    choices:
      - rclone config
      - rclone init
      - rclone add
    answer: 0
    explanation: rclone config démarre l'assistant interactif dans le terminal pour créer, modifier ou supprimer des remotes.
---

## Définition

`rclone` est un outil en ligne de commande open source souvent qualifié de « rsync pour le cloud ». Il permet de synchroniser, copier et déplacer des fichiers entre le disque local et plus de 40 fournisseurs de stockage cloud (Amazon S3, MinIO, Google Drive, Backblaze B2, SFTP, WebDAV, Azure Blob, etc.), ainsi qu'entre deux stockages distants.

## Configuration d'un stockage distant

Avant de communiquer avec un service cloud, on déclare un « remote » dans Rclone. La commande interactive guide la saisie des identifiants (clés d'API, région, point de terminaison) :

```bash
rclone config
```

Les informations sont enregistrées dans un fichier de configuration (généralement `~/.config/rclone/rclone.conf`). Chaque remote configuré s'utilise ensuite avec la syntaxe `nom-du-remote:chemin`.

## Commandes du quotidien

### Voir les remotes configurés

```bash
rclone listremotes
rclone listremotes --long    # nom + type (+ description)
rclone listremotes --json    # sortie machine
```

`listremotes` affiche les remotes du fichier de config **et** ceux définis par des variables d'environnement. Chaque nom s'utilise avec un `:` à la fin (`mon-s3:`).

### Lister fichiers et dossiers

| Commande | Rôle | Récursion |
| --- | --- | --- |
| `rclone ls remote:path` | Taille + chemin des **fichiers** | Oui par défaut (`--max-depth 1` pour limiter) |
| `rclone lsl remote:path` | Date de modif + taille + chemin | Oui par défaut |
| `rclone lsd remote:path` | **Dossiers** / buckets seulement | Non (`-R` pour récursif) |
| `rclone lsf remote:path` | Liste simple, facile à parser | Non (`-R` pour récursif) |
| `rclone lsjson remote:path` | JSON (scripts) | Non (`-R` pour récursif) |
| `rclone tree remote:path` | Arborescence lisible | Selon options |
| `rclone size remote:path` | Nombre d'objets + volume total | — |
| `rclone about remote:` | Quota / espace libre (si le backend le fournit) | — |

```bash
rclone ls mon-s3:mon-bucket/
rclone lsd mon-s3:
rclone lsf mon-s3:mon-bucket/sauvegardes/ -R
rclone lsjson mon-s3:mon-bucket/docs --files-only
rclone about mon-s3:
```

### Copier, synchroniser, vérifier

| Commande | Rôle |
| --- | --- |
| `rclone copy source dest` | Copie / met à jour ; **ne supprime rien** en destination |
| `rclone sync source dest` | Miroir : la destination devient identique à la source (**supprime** les orphelins) |
| `rclone move source dest` | Déplace (copie puis suppression côté source, selon backend) |
| `rclone copyto` / `moveto` | Un **fichier** (ou chemin) précis vers une cible précise |
| `rclone check source dest` | Compare source et destination (intégrité) |
| `rclone mkdir remote:path` | Crée un dossier / préfixe |
| `rclone delete remote:path` | Supprime des **fichiers** (garde les dossiers vides selon cas) |
| `rclone purge remote:path` | Vide un chemin (fichiers **et** dossiers) — destructif |
| `rclone mount remote: /mnt/x` | Monte le remote en local (FUSE) |
| `rclone config` | Assistant pour créer / modifier / supprimer un remote |
| `rclone version` | Version installée |

Le local n'a pas de préfixe `remote:` : `./documents/` ou `/chemin/absolu` suffit.

## La distinction copy vs sync

- **`rclone copy`** : transfère les fichiers manquants ou modifiés. Si un fichier a disparu de la source, **il reste** en destination.
- **`rclone sync`** : miroir strict. Tout ce qui est en destination mais plus en source **est supprimé**. Toujours tester avec `--dry-run`.

Comme avec `rsync`, rclone copie en général le **contenu** du dossier source, pas le nom du dossier enveloppant (trailing `/` mental).

## Drapeaux utiles

| Flag | Rôle |
| --- | --- |
| `-P`, `--progress` | Vitesse, ETA, volume en direct |
| `--dry-run` | Simulation : rien n'est écrit ni effacé |
| `--transfers=N` | Transferts parallèles (défaut souvent 4) |
| `-v` / `-vv` | Logs plus détaillés |
| `--max-depth 1` | Limite la profondeur de `ls` / `lsl` |
| `-R` | Récursion pour `lsd`, `lsf`, `lsjson` |

## Exemples

```bash
# Remotes connus
rclone listremotes --long

# Contenu d'un bucket
rclone lsd mon-s3:
rclone ls mon-s3:mon-bucket/sauvegardes/ --max-depth 1

# Copie locale → cloud (sans supprimer à distance)
rclone copy ./documents/ mon-s3:mon-bucket/documents/ -P

# Sync en miroir : d'abord simuler
rclone sync ./site/ mon-s3:mon-bucket/site/ --dry-run
rclone sync ./site/ mon-s3:mon-bucket/site/ -P

# Vérifier après coup
rclone check ./site/ mon-s3:mon-bucket/site/
```

## À retenir

- `rclone listremotes` : quels stockages sont configurés.
- Lister : `ls` / `lsl` (fichiers, récursif), `lsd` (dossiers), `lsf` / `lsjson` (scripts).
- Syntaxe `remote:chemin` ; le disque local s'écrit en chemin classique.
- `copy` ajoute sans supprimer ; `sync` fait un miroir — toujours `--dry-run` avant un sync.
- `-P` pour suivre le transfert ; `about` / `size` pour l'espace.

## Sources

- [rclone listremotes](https://rclone.org/commands/rclone_listremotes/)
- [rclone ls](https://rclone.org/commands/rclone_ls/) / [lsd](https://rclone.org/commands/rclone_lsd/) / [lsjson](https://rclone.org/commands/rclone_lsjson/)
- [rclone copy](https://rclone.org/commands/rclone_copy/) / [sync](https://rclone.org/commands/rclone_sync/)
- [Index des commandes](https://rclone.org/commands/)

