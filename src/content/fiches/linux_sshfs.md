---
title: L'utilisation de SSHFS sous Linux
description: Découvrir et maîtriser SSHFS pour monter un répertoire distant comme un dossier local sous Linux, en utilisant une connexion SSH sécurisée.
technology: linux
difficulty: debutant
tags: [linux, sshfs, ssh, reseau, stockage, systeme, administration]
publishedAt: 2026-10-29
updatedAt: 2026-10-29
draft: false
quiz:
  - question: Quelle commande permet de monter un répertoire distant avec SSHFS ?
    choices:
      - sshfs utilisateur@serveur:/chemin/distant ~/mnt/distant
      - ssh mount utilisateur@serveur:/chemin/distant
      - mount -t ssh utilisateur@serveur:/chemin/distant ~/mnt/distant
    answer: 0
    explanation: SSHFS utilise SSH pour accéder aux fichiers distants et les présenter dans un répertoire local.
  - question: Quel protocole SSHFS utilise-t-il pour sécuriser les échanges ?
    choices:
      - FTP
      - SSH
      - HTTP
    answer: 1
    explanation: SSHFS s'appuie sur SSH, qui chiffre les communications et permet une authentification de l'utilisateur.
  - question: Quelle commande permet de démonter un répertoire SSHFS sous Linux ?
    choices:
      - sshfs --stop ~/mnt/distant
      - fusermount3 -u ~/mnt/distant
      - ssh disconnect ~/mnt/distant
    answer: 1
    explanation: La commande fusermount3 -u démonte le système de fichiers FUSE associé au répertoire local.
  - question: Le montage SSHFS fonctionne, mais le répertoire local est vide. Que faut-il vérifier en premier ?
    choices:
      - Le chemin distant et les permissions de l'utilisateur
      - La résolution DNS de tous les sites Internet
      - La version du noyau uniquement
    answer: 0
    explanation: Un chemin distant incorrect ou des droits d'accès insuffisants peuvent empêcher l'affichage des fichiers attendus.
---

## Définition

**SSHFS** (*SSH Filesystem*) est un outil permettant de monter un répertoire situé sur une machine distante dans l'arborescence locale d'une autre machine Linux.

Il utilise **SSH** (*Secure Shell*) pour établir une connexion sécurisée et **FUSE** (*Filesystem in Userspace*) pour rendre les fichiers distants accessibles comme s'ils se trouvaient dans un dossier local.

Par exemple, un poste de travail peut accéder aux big_data_folder stockées sur un serveur distant dans le répertoire `~/mnt/big_data_folder`, sans avoir à copier les fichiers sur sa propre machine.

SSHFS est particulièrement utile pour accéder à des jeux de données volumineux, à des répertoires de travail partagés ou à des fichiers stockés sur un serveur de calcul.

## Principe de fonctionnement

Le montage SSHFS repose sur trois éléments :

| Élément | Rôle |
| --- | --- |
| **SSH** | Assure la connexion distante, l'authentification et le chiffrement des échanges |
| **FUSE** | Permet de présenter le système de fichiers distant dans l'arborescence locale |
| **SSHFS** | Traduit les opérations sur les fichiers locaux en opérations sur le serveur distant |

Le principe est simple : les fichiers restent stockés sur le serveur, mais l'utilisateur peut les consulter depuis un répertoire de sa machine locale.

**Attention :** les fichiers ne sont pas copiés automatiquement sur le poste client. Leur lecture et leur modification nécessitent des échanges avec le serveur distant.

## Prérequis

Avant d'utiliser SSHFS, il faut disposer :

- D'une machine distante accessible par le réseau.
- D'un serveur SSH fonctionnel sur cette machine.
- D'un compte utilisateur autorisé à se connecter au serveur.
- Du chemin du répertoire distant à monter.
- Du logiciel SSHFS installé sur la machine cliente.

Les exemples suivants utilisent deux machines Linux :

| Machine | Exemple | Rôle |
| --- | --- | --- |
| Serveur | `host_name_or_ip` | Héberge les fichiers |
| Client | Poste de travail local | Accède aux fichiers distants |
| Utilisateur distant | `utilisateur` | Compte utilisé pour la connexion SSH |
| Répertoire distant | `/data/big_data_folder` | Dossier contenant les données |
| Point de montage local | `~/mnt/big_data_folder` | Dossier dans lequel les données apparaissent |

Remplacez ces valeurs par celles de votre environnement.

## Syntaxe et commandes fondamentales

### 1. Installer SSHFS

Sur une distribution Ubuntu ou Debian, exécutez les commandes suivantes sur la machine cliente :

```bash
# Mettre à jour la liste des paquets
sudo apt update

# Installer SSHFS
sudo apt install sshfs
```

SSHFS s'appuie sur FUSE pour monter le répertoire distant dans le système de fichiers local.

### 2. Vérifier la connexion SSH

Avant de monter un répertoire, vérifiez que la connexion au serveur fonctionne :

```bash
# Se connecter au serveur distant
ssh utilisateur@host_name_or_ip
```

Si la connexion réussit, vous pouvez accéder au serveur avec le compte indiqué.

Si la connexion échoue, vérifiez notamment :
- L'adresse IP ou le nom du serveur.
- L'accès réseau et, si nécessaire, la connexion VPN.
- Le port SSH utilisé, généralement le port 22.
- L'état du service SSH sur le serveur.
- Les autorisations du compte utilisateur.

Pour quitter la session SSH :

```bash
exit
```

### 3. Créer un point de montage local

Le point de montage est le répertoire local dans lequel le contenu distant sera accessible.

```bash
# Créer le répertoire local
mkdir -p ~/mnt/big_data_folder
```

Ce répertoire peut être vide avant le montage. C'est normal : son contenu distant ne devient visible qu'une fois le système de fichiers monté.

**Important :** si ce répertoire contient déjà des fichiers locaux, ceux-ci seront masqués pendant le montage, mais ne seront pas supprimés.

### 4. Monter le répertoire distant

La syntaxe générale est la suivante :

```bash
sshfs utilisateur@serveur:/chemin/distant /chemin/local
```

Exemple concret :

```bash
sshfs utilisateur@host_name_or_ip:/data/big_data_folder ~/mnt/big_data_folder
```

Après le montage, vous pouvez consulter les fichiers distants avec les commandes habituelles :

```bash
# Afficher le contenu du répertoire monté
ls -lah ~/mnt/big_data_folder

# Afficher la taille des éléments
du -sh ~/mnt/big_data_folder

# Accéder au répertoire
cd ~/mnt/big_data_folder
```

Les fichiers restent sur le serveur distant. Les commandes de lecture ou d'écriture effectuées depuis le client sollicitent le système de fichiers distant.

### 5. Vérifier le montage

Pour vérifier que le répertoire est bien monté :

```bash
# Afficher les montages SSHFS
mount | grep sshfs
```

Vous pouvez également utiliser :

```bash
findmnt ~/mnt/big_data_folder
```

Pour vérifier le contenu du répertoire :

```bash
ls -lah ~/mnt/big_data_folder
```

Si le répertoire est vide alors que les données existent sur le serveur, vérifiez le chemin distant utilisé et les droits d'accès du compte SSH.

### 6. Démonter le répertoire distant

Lorsque vous n'avez plus besoin du partage, vous pouvez le démonter :

```bash
fusermount3 -u ~/mnt/big_data_folder
```

Sur certains systèmes, la commande suivante peut également être utilisée :

```bash
umount ~/mnt/big_data_folder
```

Si le démontage échoue parce que le répertoire est occupé, quittez les terminaux qui se trouvent dans ce répertoire et fermez les applications qui utilisent ses fichiers, puis réessayez.

**À retenir :** démonter un répertoire SSHFS ne supprime pas les fichiers stockés sur le serveur.

## Authentification par clé SSH

Pour éviter de saisir un mot de passe à chaque connexion, il est possible d'utiliser une clé SSH.

### 1. Générer une clé

Sur la machine cliente :

```bash
ssh-keygen -t ed25519
```

Suivez les instructions. Il est recommandé de protéger la clé privée par une phrase secrète.

### 2. Installer la clé publique sur le serveur

```bash
ssh-copy-id utilisateur@host_name_or_ip
```

Cette commande ajoute la clé publique au compte distant, si le serveur autorise cette méthode.

### 3. Tester la connexion

```bash
ssh utilisateur@host_name_or_ip
```

Si la configuration fonctionne, vous pourrez généralement vous connecter sans saisir le mot de passe du compte distant à chaque fois. Une phrase secrète de clé peut néanmoins être demandée si la clé n'est pas chargée dans un agent SSH.

**Sécurité :** ne partagez jamais votre clé privée. Seule la clé publique doit être installée sur le serveur.

## Cas d'usage fréquents

- **Accès à des données volumineuses :** consulter des big_data_folder, des rasters ou des jeux de données géographiques stockés sur un serveur distant.
- **Travail sur un serveur de calcul :** accéder aux fichiers d'un projet sans devoir les copier sur chaque poste.
- **Partage de fichiers entre machines Linux :** utiliser un répertoire distant depuis les outils habituels de la machine cliente.
- **Exploration de données :** parcourir des dossiers distants avec `ls`, un explorateur de fichiers ou un logiciel compatible.
- **Scripts de traitement :** permettre à des outils de lire des fichiers distants à travers un point de montage local.

Pour des traitements géospatiaux portant sur de nombreux petits fichiers, gardez à l'esprit que les opérations peuvent être plus lentes qu'avec un disque local.

## Exemple pratique : accéder à des big_data_folder

Supposons que les big_data_folder soient stockées sur un serveur de calcul :

- Serveur : `host_name_or_ip`
- Répertoire distant : `/data/big_data_folder`
- Répertoire local : `~/mnt/big_data_folder`

Sur le client :

```bash
# Créer le point de montage
mkdir -p ~/mnt/big_data_folder

# Monter les big_data_folder
sshfs utilisateur@host_name_or_ip:/data/big_data_folder ~/mnt/big_data_folder

# Vérifier que les fichiers sont visibles
ls -lah ~/mnt/big_data_folder

# Afficher le nombre de fichiers et répertoires
find ~/mnt/big_data_folder -maxdepth 1 -mindepth 1 | wc -l
```

Vous pouvez ensuite utiliser le chemin local `~/mnt/big_data_folder` dans vos scripts Python ou vos outils SIG, sous réserve que ceux-ci soient compatibles avec le mode d'accès aux fichiers.

Pour terminer :

```bash
fusermount3 -u ~/mnt/big_data_folder
```

## Diagnostic des problèmes courants

| Problème | Cause possible | Vérification ou solution |
| --- | --- | --- |
| `Connection refused` | Le service SSH n'écoute pas sur le port attendu ou la connexion est refusée | Vérifier le service SSH, le port et le pare-feu du serveur |
| `Connection reset by peer` | La connexion est interrompue par le serveur, un équipement réseau ou une règle de sécurité | Tester `ssh -vvv utilisateur@serveur` et consulter les journaux SSH côté serveur |
| Le dossier monté est vide | Chemin distant incorrect, contenu absent ou permissions insuffisantes | Vérifier le dossier distant avec `ls -lah /chemin/distant` sur le serveur |
| `No such file or directory` | Chemin distant ou point de montage incorrect | Vérifier les deux chemins et créer le point de montage local si nécessaire |
| `Permission denied` | Le compte n'a pas les droits nécessaires ou l'authentification échoue | Vérifier le compte SSH, les clés et les permissions du dossier |
| Le montage se bloque | Réseau lent, serveur indisponible ou opération distante longue | Vérifier la connexion et tester avec un petit fichier |
| Le démontage échoue | Des processus utilisent encore le répertoire | Quitter le répertoire dans les terminaux et fermer les applications concernées |

### Diagnostiquer un dossier vide

Si le montage semble réussir mais que le répertoire local ne contient aucun fichier, procédez dans cet ordre :

**Sur le serveur :**

```bash
# Vérifier le contenu du répertoire distant
ls -lah /data/big_data_folder
```

**Sur le client :**

```bash
# Vérifier la commande de montage active
mount | grep sshfs

# Vérifier le contenu du point de montage
ls -lah ~/mnt/big_data_folder
```

Comparez ensuite le chemin distant utilisé dans la commande SSHFS avec le chemin réel des fichiers.

Un autre point important : les permissions visibles à travers SSHFS dépendent du compte distant et de la configuration du montage. Évitez de modifier les permissions de manière générale sans avoir identifié le problème.

Pour obtenir davantage d'informations sur la connexion SSH :

```bash
ssh -vvv utilisateur@host_name_or_ip
```

Cette commande affiche des informations de diagnostic détaillées. Avant de partager les journaux, masquez les noms d'utilisateur, adresses IP publiques et autres informations sensibles.

## Options utiles de SSHFS

SSHFS propose plusieurs options permettant d'adapter le montage.

| Option | Fonction |
| --- | --- |
| `-p PORT` | Utilise un port SSH différent du port par défaut |
| `-o reconnect` | Tente de rétablir la connexion après certaines interruptions |
| `-o ro` | Monte le répertoire en lecture seule |
| `-o follow_symlinks` | Permet de suivre certains liens symboliques distants, selon la configuration |
| `-o IdentityFile=CHEMIN` | Spécifie la clé privée à utiliser pour l'authentification |
| `-o ServerAliveInterval=15` | Demande périodiquement au serveur de répondre afin de détecter certaines connexions inactives |

Exemples :

```bash
# Monter en lecture seule
sshfs -o ro utilisateur@host_name_or_ip:/data/big_data_folder ~/mnt/big_data_folder
```

```bash
# Utiliser un port SSH personnalisé
sshfs -p 2222 utilisateur@host_name_or_ip:/data/big_data_folder ~/mnt/big_data_folder
```

```bash
# Spécifier une clé privée
sshfs -o IdentityFile=~/.ssh/id_ed25519 utilisateur@host_name_or_ip:/data/big_data_folder ~/mnt/big_data_folder
```

L'option `reconnect` peut être utile sur certaines connexions instables, mais elle ne garantit pas la récupération de toutes les opérations après une coupure réseau. Vérifiez toujours que le serveur est accessible avant de relancer un traitement important.

## Bonnes pratiques et points de vigilance

- **Vérifier les chemins :** le chemin distant doit exister et être accessible par l'utilisateur SSH.
- **Contrôler les permissions :** les droits sont évalués sur la machine distante. Un montage réussi ne signifie pas que tous les fichiers sont accessibles.
- **Protéger les clés SSH :** ne transmettez jamais une clé privée à un tiers.
- **Éviter les copies inutiles :** SSHFS donne accès aux fichiers distants, mais ne crée pas une copie locale.
- **Anticiper les performances :** les traitements qui ouvrent de nombreux petits fichiers peuvent être ralentis par les échanges réseau.
- **Démonter proprement :** démontez le répertoire avant d'éteindre la machine ou de mettre fin à la connexion réseau lorsque cela est possible.
- **Ne pas confondre montage et synchronisation :** SSHFS permet d'accéder aux fichiers distants ; il ne remplace pas un outil de synchronisation tel que `rsync`.
- **Évaluer les besoins :** pour un partage permanent entre plusieurs machines d'un réseau local, NFS peut être une alternative, selon les exigences de sécurité et d'administration.

## Mots-clés

| Terme | Définition |
| --- | --- |
| `SSH` | Protocole sécurisé utilisé pour les connexions à distance |
| `SSHFS` | Outil permettant de monter un répertoire distant via SSH |
| `FUSE` | Mécanisme permettant de gérer des systèmes de fichiers en espace utilisateur |
| `Point de montage` | Répertoire local dans lequel un système de fichiers est accessible |
| `Clé publique` | Partie d'une paire de clés pouvant être installée sur un serveur pour l'authentification |
| `Clé privée` | Partie secrète de la paire de clés, conservée par son propriétaire |
| `Montage` | Opération qui rend un système de fichiers accessible dans l'arborescence locale |
| `Démontage` | Opération qui retire ce système de fichiers de l'arborescence locale |

## À retenir

SSHFS permet d'accéder à un répertoire distant comme à un dossier local, en utilisant une connexion SSH sécurisée.

Les commandes essentielles à retenir sont :

```bash
# Installer SSHFS sur Ubuntu ou Debian
sudo apt install sshfs

# Créer un point de montage
mkdir -p ~/mnt/big_data_folder

# Monter le répertoire distant
sshfs utilisateur@host_name_or_ip:/data/big_data_folder ~/mnt/big_data_folder

# Vérifier le contenu
ls -lah ~/mnt/big_data_folder

# Démonter le répertoire
fusermount3 -u ~/mnt/big_data_folder
```

**Le point essentiel :** si le répertoire monté est vide, commencez par vérifier le chemin distant, la présence des fichiers sur le serveur et les droits d'accès du compte utilisé pour SSHFS.