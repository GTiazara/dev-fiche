---
title: Rclone, synchroniser avec le stockage cloud
description: Transférer, synchroniser et sauvegarder des données vers des stockages objets (S3) et services cloud distants.
technology: transfert_fichiers
difficulty: intermediaire
tags: [rclone, cloud, s3, synchronisation, sauvegarde]
publishedAt: 2026-10-25
updatedAt: 2026-10-25
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

Les informations sont enregistrées dans un fichier de configuration (généralement `~/.config/rclone/rclone.conf`). Chaque remote configuré s'utilise ensuite avec la syntaxe `nom-du-remote:`.

## Commandes principales

| Commande | Rôle |
| --- | --- |
| `rclone config` | Gestion interactive des fournisseurs distants |
| `rclone copy source: dest:` | Copie les fichiers nouveaux ou modifiés sans rien supprimer |
| `rclone sync source: dest:` | Synchronise la cible en miroir strict (supprime les fichiers orphelins) |
| `rclone lsf remote:path` | Liste les fichiers et dossiers distants |
| `rclone size remote:path` | Affiche le nombre d'objets et l'espace total occupé |
| `rclone check source: dest:` | Vérifie l'intégrité et compare les sommes de contrôle |
| `rclone mount remote: /point` | Monte un stockage cloud distant comme dossier local (via FUSE) |

## La distinction copy vs sync

La différence est cruciale pour la sécurité de vos données :

- **`rclone copy`** : compare la date et la taille. Il transfère les fichiers manquants ou modifiés. Si un fichier a été supprimé de la source, **il reste présent sur la destination**.
- **`rclone sync`** : rend la destination strictement identique à la source. Tout fichier présent dans la destination mais absent de la source **est immédiatement supprimé**.

## Drapeaux utiles

- `-P, --progress` : affiche la vitesse, l'estimation de temps restant et le volume transféré en temps réel.
- `--dry-run` : effectue un test à blanc sans écrire ni supprimer de fichier.
- `--transfers=N` : définit le nombre de transferts de fichiers en parallèle (par défaut 4).

## Exemples de code

### 1. Lister le contenu d'un seau S3

```bash
rclone lsf mon-s3:mon-bucket/sauvegardes/
```

### 2. Copier un dossier local vers le cloud sans risque de suppression

```bash
rclone copy ./documents/ mon-s3:mon-bucket/documents/ -P
```

### 3. Synchroniser en miroir avec simulation préalable

```bash
# 1. Simuler l'opération pour contrôler les suppressions potentielles
rclone sync ./site/ mon-s3:mon-bucket/site/ --dry-run

# 2. Exécuter la synchronisation avec suivi de l'avancement
rclone sync ./site/ mon-s3:mon-bucket/site/ -P
```

## À retenir

`rclone` uniformise l'accès aux stockages cloud avec une syntaxe simple de type `remote:chemin`. Privilégiez `rclone copy` pour des ajouts sécurisés et réservez `rclone sync` aux miroirs stricts en prenant soin de tester avec `--dry-run`.

