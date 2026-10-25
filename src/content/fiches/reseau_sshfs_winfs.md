---
title: SSHFS et WinFSP, monter un dossier Linux sous Windows
description: Accéder, modifier et gérer des répertoires distants Linux de manière transparente sous Windows via SSH/SFTP en utilisant WinFSP, SSHFS-Win et la commande net use.
technology: reseau
difficulty: intermediaire
tags: [sshfs, winfsp, windows, linux, ssh, netuse, sftp]
publishedAt: 2026-10-25
updatedAt: 2026-10-25
draft: false
quiz:
  - question: Quels sont les deux composants logiciels indispensables pour utiliser SSHFS sous Windows ?
    choices:
      - WinFSP et SSHFS-Win
      - PuTTY et FileZilla
      - Cygwin et OpenSSH Server
    answer: 0
    explanation: WinFSP fournit la couche de virtualisation de système de fichiers (équivalent de FUSE) et SSHFS-Win intègre le client SFTP/SSH pour Windows.
  - question: Quel préfixe de chemin réseau utilise-t-on avec l'explorateur ou net use pour exploiter SSHFS-Win ?
    choices:
      - \\sshfs\
      - \\linux\
      - \\samba\
    answer: 0
    explanation: Le fournisseur réseau intégré de SSHFS-Win intercepte les chemins commençant par \\sshfs\ pour établir la connexion SFTP.
  - question: À quoi sert la commande net use (Z:) \\sshfs\alice@serveur\documents ?
    choices:
      - À attribuer la lettre de lecteur (Z:) au dossier distant via SSHFS
      - À vider le cache du serveur distant
      - À formater le disque distant en NTFS
    answer: 0
    explanation: net use permet d'associer un lecteur réseau Windows (comme Z:) à une ressource distante gérée par le fournisseur SSHFS-Win.
---

## Définition

L'association de **WinFSP** (Windows File System Proxy) et de **SSHFS-Win** permet de monter n'importe quel dossier distant d'un serveur Linux directement sous Windows comme s'il s'agissait d'un disque local ou d'un lecteur réseau.

Sous le capot, WinFSP joue le rôle de couche FUSE pour Windows, tandis que SSHFS-Win utilise un canal SSH/SFTP sécurisé pour transférer les flux de fichiers en temps réel. Grâce à l'intégration native de Windows, il est possible d'utiliser la commande **`net use`** ou l'Explorateur de fichiers pour mapper ces dossiers.

## Prérequis et installation

Pour que la commande `net use` comprenne les flux SSHFS, vous devez installer deux paquets (disponibles sur GitHub) :

1. **WinFsp** : Le pilote de système de fichiers virtuel (à installer en premier).
2. **SSHFS-Win** : Le client SSHFS packagé pour Windows (à installer en second).

Une fois installés, SSHFS-Win s'enregistre comme fournisseur réseau dans l'OS, rendant l'utilisation de préfixes UNC spéciaux pleinement fonctionnelle.


## Les préfixes de connexion SSHFS-Win

La syntaxe générale d'un chemin distant repose sur le format UNC `\\sshfs\`. Plusieurs variantes existent selon le mode d'authentification et l'emplacement de départ :

| Préfixe | Chemin cible sur le serveur Linux | Authentification |
| --- | --- | --- |
| `\\sshfs\user@host\` | Relatif au dossier personnel (`~`) de l'utilisateur | Mot de passe (demandé à la connexion) |
| `\\sshfs.r\user@host\` | Relatif à la racine absolue du serveur (`/`) | Mot de passe |
| `\\sshfs.k\user@host\` | Relatif au dossier personnel (`~`) | Clé SSH (`%USERPROFILE%\.ssh\id_rsa`) |
| `\\sshfs.kr\user@host\` | Relatif à la racine absolue du serveur (`/`) | Clé SSH (`%USERPROFILE%\.ssh\id_rsa`) |

> **Note sur le port SSH :** Si votre serveur écoute sur un port personnalisé (autre que le port 22 par défaut), ajoutez-le en le séparant par un point d'exclamation `!` (ex: `serveur.com!2222`).

## Commandes principales (`net use`)

| Commande | Rôle |
| --- | --- |
| `net use Z: \\sshfs\user@host\dossier` | Monte le dossier distant sur la lettre de lecteur `Z:` |
| `net use Z: \\sshfs\user@host\dossier /persistent:yes` | Maintient le montage actif après un redémarrage de Windows |
| `net use Z: /delete` | Déconnecte et démonte le lecteur réseau `Z:` |
| `net use` | Affiche la liste de tous les lecteurs réseau actuellement actifs |

## Exemples de code

### 1. Monter un dossier distant du répertoire utilisateur avec une lettre de lecteur

```cmd
net use Z: \\sshfs\ubuntu@192.168.1.50\projets\web
```

### 2. Accéder à la racine d'un serveur Linux avec un port SSH spécifique

```cmd
net use Y: \\sshfs.r\root@mon-serveur.com!2222\var\www
```

### 3. Supprimer le montage proprement

```cmd
net use Y: /delete
```

## À retenir

L'utilisation conjointe de **WinFSP** et **SSHFS-Win** transforme n'importe quel poste Windows en client SFTP capable d'exploiter la commande `net use` de manière transparente. C'est une excellente alternative à un partage Samba (SMB) ou NFS lorsque seul un accès SSH sécurisé est ouvert sur la machine Linux distante.