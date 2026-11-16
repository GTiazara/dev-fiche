---
title: SCP, copier des fichiers via SSH
description: Transférer des fichiers et répertoires entre machines distantes de façon sécurisée grâce au protocole SSH.
technology: transfert_fichiers
difficulty: debutant
tags: [scp, ssh, transfert, linux, copie]
publishedAt: 2026-10-25
updatedAt: 2026-10-25
draft: false
quiz:
  - question: Quelle option de scp permet de copier un dossier complet et son contenu ?
    choices:
      - -r
      - -d
      - -f
    answer: 0
    explanation: L'option -r active la copie récursive pour parcourir et envoyer tous les éléments d'un répertoire.
  - question: Comment spécifier un port SSH personnalisé (ex. 2222) avec scp ?
    choices:
      - scp -P 2222 source destination
      - scp -p 2222 source destination
      - scp --port 2222 source destination
    answer: 0
    explanation: Avec scp, le port SSH s'indique avec un P majuscule (-P). L'option -p minuscule sert à préserver les dates et permissions.
  - question: Dans quelle situation scp est-il moins adapté que rsync ?
    choices:
      - Pour synchroniser régulièrement des dossiers avec reprise sur interruption
      - Pour copier un simple fichier vers un serveur distant
      - Pour chiffrer le transfert réseau
    answer: 0
    explanation: scp transfère l'intégralité du fichier à chaque fois et ne permet pas la reprise automatique après coupure réseau.
---

## Définition

`scp` (Secure Copy Protocol) est une commande Unix servant à copier des fichiers et des répertoires entre machines à travers une connexion chiffrée SSH. Elle réutilise l'infrastructure d'authentification existante (mot de passe ou clé SSH) sans nécessiter de démon supplémentaire sur le serveur distant.

## Syntaxe générale

La commande suit toujours le même schéma :

```bash
scp [options] source destination
```

L'un des deux emplacements (ou les deux) peut être distant. Un chemin distant s'écrit sous la forme `utilisateur@serveur:chemin/vers/cible`.

## Mots-clés et options

| Option | Rôle |
| --- | --- |
| `-r` | Copie récursivement un répertoire entier |
| `-P <port>` | Spécifie le port SSH distant (attention au **P** majuscule) |
| `-p` | Préserve les dates de modification, d'accès et les permissions |
| `-C` | Active la compression gzip pendant le transfert pour gagner du temps |
| `-i <clé>` | Indique le fichier d'identité SSH (clé privée) à utiliser |
| `-q` | Mode silencieux (masque la barre de progression) |

## Exemples de code

### 1. Envoyer un fichier vers un serveur distant

```bash
scp ./rapport.pdf debian@serveur.example.com:/home/debian/documents/
```

### 2. Récupérer un fichier distant en local

```bash
scp debian@serveur.example.com:/var/log/nginx/access.log ./access.log
```

### 3. Copier un dossier avec port SSH et clé privée spécifiques

```bash
scp -P 2222 -i ~/.ssh/cle_serveur -r ./site-web/ debian@serveur.example.com:/var/www/site/
```

## Limites courantes

- **Pas de reprise** : si la connexion coupe à 98 %, le transfert doit repartir de zéro.
- **Pas de transfert delta** : modifier une seule ligne dans un fichier de 5 Go réexpédie la totalité des 5 Go.
- **Obsolescence progressive** : les versions récentes d'OpenSSH privilégient désormais le protocole SFTP sous le capot pour `scp`.

## À retenir

`scp` permet de copier rapidement un fichier d'une machine à une autre via SSH sans configuration additionnelle. Retenez `-r` pour les dossiers et `-P` (majuscule) pour le port SSH. Pour de gros volumes ou des sauvegardes répétées, utilisez plutôt `rsync`.

