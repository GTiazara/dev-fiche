---
title: Rsync, synchronisation incrémentale de fichiers
description: Transférer et synchroniser des fichiers localement ou à distance en n'envoyant que les portions modifiées.
technology: transfert_fichiers
difficulty: intermediaire
tags: [rsync, synchronisation, ssh, sauvegarde, delta]
publishedAt: 2026-10-25
updatedAt: 2026-10-25
draft: false
quiz:
  - question: Quelle est la différence entre rsync -a src/ dest/ et rsync -a src dest/ ?
    choices:
      - Le slash final copie le contenu de src sans recréer le dossier src dans la destination
      - Le slash final supprime les fichiers de destination inexistants dans la source
      - Le slash final active la compression automatique
    answer: 0
    explanation: Avec un slash terminal sur la source (src/), seul le contenu est versé dans dest/. Sans slash (src), rsync crée dest/src/.
  - question: Que regroupe principalement l'option -a (archive) de rsync ?
    choices:
      - La récursivité et la conservation des permissions, propriétaires, dates et liens symboliques
      - La création d'une archive compressée au format tar.gz
      - L'envoi des fichiers directement dans un stockage cloud S3
    answer: 0
    explanation: L'option -a équivaut à -rlptgoD, assurant une copie miroir fidèle des métadonnées du système de fichiers.
  - question: Quelle option permet de tester une commande rsync sans écrire sur le disque ?
    choices:
      - -n, --dry-run
      - --test
      - --check-only
    answer: 0
    explanation: L'option -n ou --dry-run simule l'exécution complète, indispensable pour valider une commande combinée avec --delete.
---

## Définition

`rsync` (Remote Sync) est un outil de synchronisation de fichiers et de dossiers en local ou à travers le réseau via SSH. Grâce à son algorithme « delta-transfer », il compare l'expéditeur et le destinataire pour ne transférer que les blocs d'octets réellement modifiés, ce qui le rend particulièrement rapide et économe en bande passante.

## Le principe du transfert incrémental

Contrairement à une copie classique qui réécrit chaque fichier, `rsync` procède par étapes :

1. Il compare les fichiers par taille et date de dernière modification.
2. Si un fichier a changé, il découpe les données en blocs et calcule des sommes de contrôle pour n'expédier que les segments modifiés.
3. Il conserve la structure, les permissions et les horodatages d'origine grâce au mode archive.

## Mots-clés et options

| Option | Rôle |
| --- | --- |
| `-a` | Mode archive : récursif, préserve droits, propriétaires, dates et liens |
| `-v` | Mode verbeux : liste les fichiers traités |
| `-z` | Compresse les données durant le transit réseau |
| `-P` | Combine `--progress` (barre d'avancement) et `--partial` (reprise en cas de coupure) |
| `--delete` | Supprime de la cible les fichiers absents de la source (miroir parfait) |
| `-n, --dry-run` | Simule l'opération sans écrire ni supprimer de fichier |
| `-e ssh` | Précise le transport SSH et ses paramètres (ex. port non standard) |

## Le piège du slash final

La présence ou l'absence d'un slash `/` à la fin du chemin source modifie le comportement :

- **Avec slash (`rsync -a source/ dest/`)** : copie **le contenu** du dossier `source` dans `dest/`.
- **Sans slash (`rsync -a source dest/`)** : copie **le dossier lui-même** à l'intérieur de `dest/` (`dest/source/`).

## Exemples de code

### 1. Synchroniser un dossier vers un serveur distant

La combinaison classique `-avzP` assure un transfert compressé, préservant les droits, avec suivi de progression et reprise :

```bash
rsync -avzP ./build/ debian@serveur.example.com:/var/www/site/
```

### 2. Miroir exact avec simulation de sécurité

Lorsque l'on utilise `--delete`, il est recommandé de simuler l'action d'abord avec `-n` :

```bash
# 1. Simuler pour vérifier quels fichiers seraient supprimés
rsync -avP --delete -n ./documents/ /mnt/backup/documents/

# 2. Exécuter la commande réelle
rsync -avP --delete ./documents/ /mnt/backup/documents/
```

### 3. Utiliser un port SSH spécifique

```bash
rsync -avzP -e "ssh -p 2222" ./app/ debian@serveur.example.com:/opt/app/
```

## À retenir

`rsync` n'envoie que les différences entre la source et la cible. La combinaison d'options de référence est `-avzP`. Attention au slash final sur la source (`source/` vs `source`), et effectuez toujours un essai avec `--dry-run` avant d'appliquer l'option `--delete`.

