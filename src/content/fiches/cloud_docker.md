---
title: Les bases de Docker, conteneurisation d'applications
description: Apprendre les principes fondamentaux de Docker, la gestion des images et des conteneurs en ligne de commande pour le Cloud.
technology: cloud
difficulty: debutant
tags: [cloud, docker, conteneurs, devops, virtualisation]
publishedAt: 2026-10-25
updatedAt: 2026-10-25
draft: false

---

## Définition

**Docker** est une plateforme open-source basée sur la conteneurisation au niveau du noyau (Kernel) du système d'exploitation. Elle permet d'empaqueter une application avec l'ensemble de ses dépendances (système, bibliothèques, configurations) au sein d'une unité standardisée appelée **conteneur**.

Contrairement à une machine virtuelle (VM) qui émule un système d'exploitation complet avec son propre noyau, les conteneurs Docker partagent le noyau de la machine hôte. Cela les rend extrêmement légers, rapides à démarrer et économes en ressources Cloud.

## Concepts fondamentaux

L'écosystème Docker repose sur trois piliers essentiels :

```text
  [ Docker Hub / Registre ]
             |
       docker pull
             v
       [ Image Docker ]   <-- (Lecture seule / Template)
             |
        docker run
             v
     [ Conteneur Docker ]  <-- (Instance exécutable en écriture)
```

| Concept | Rôle | Analogie |
| --- | --- | --- |
| **Moteur Docker (Engine)** | Service d'arrière-plan exécutant et gérant les ressources | Le système d'exploitation du conteneur |
| **Image Docker** | Modèle immuable (lecture seule) contenant le code et l'environnement | Une classe en programmation / Un fichier ISO |
| **Conteneur** | Instance isolée et exécutable créée à partir d'une image | Un objet instancié / Une machine virtuelle légère |
| **Registre (Docker Hub)** | Serveur distant pour stocker et partager des images | GitHub pour les images de conteneurs |

## Commandes indispensables (Docker CLI)

### 1. Gestion des images

```bash
# Rechercher une image officielle sur Docker Hub
docker search nginx

# Télécharger une image depuis le registre
docker pull nginx:alpine

# Lister les images disponibles localement
docker images

# Supprimer une image locale
docker rmi nginx:alpine
```

### 2. Gestion et cycle de vie des conteneurs

```bash
# Lancer un conteneur en mode interactif avec terminal
docker run -it ubuntu bash

# Lancer un conteneur web en arrière-plan (-d) avec nom et redirection de port (-p)
docker run -d -p 8080:80 --name mon-serveur nginx:alpine

# Lister les conteneurs en cours d'exécution
docker ps

# Lister TOUS les conteneurs (y compris ceux arrêtés)
docker ps -a

# Arrêter un conteneur actif
docker stop mon-serveur

# Redémarrer un conteneur arrêté
docker start mon-serveur

# Supprimer un conteneur arrêté
docker rm mon-serveur

# Forcer l'arrêt et la suppression d'un conteneur en une commande
docker rm -f mon-serveur
```

### 3. Inspection et débogage

```bash
# Consulter les logs (journaux) d'un conteneur
docker logs mon-serveur

# Suivre les logs en temps réel (-f)
docker logs -f mon-serveur

# Exécuter une commande interactive dans un conteneur en cours d'exécution
docker exec -it mon-serveur sh

# Afficher les métadonnées détaillées d'un conteneur (IP, volumes, ports)
docker inspect mon-serveur
```

## Cas d'usage fréquents

- **Isolation d'environnements** : Exécuter plusieurs versions incompatibles d'un même outil (ex: PHP 7.4 et PHP 8.2) sur la même machine sans conflit.
- **Portabilité "Build once, run anywhere"** : Garantir qu'une application fonctionnera à l'identique sur le poste d'un développeur, un serveur de recette ou un cluster Kubernetes en production.
- **Microservices et Cloud Native** : Découper une application monolithique en services autonomes conteneurisés facilement scalables.

## Mots-clés

| Terme | Définition |
| --- | --- |
| `Docker Daemon` | Processus d'arrière-plan (`dockerd`) qui gère les objets Docker |
| `Port Mapping` | Redirection du port de la machine hôte vers le port interne du conteneur (`-p hôte:conteneur`) |
| `Detach (-d)` | Mode d'exécution d'un conteneur en arrière-plan |
| `Volume` | Mécanisme de persistance des données indépendant du cycle de vie du conteneur |

## Pièges et points de vigilance

- **Éphémérité des données** : Par défaut, toute donnée écrite à l'intérieur d'un conteneur est détruite lors de la suppression de celui-ci. Il faut utiliser des **volumes** (`-v`) pour conserver les données critiques (ex: base de données).
- **Confusion des ports** : Dans `-p 8080:80`, le premier nombre (8080) est le port accessible depuis votre machine, le second (80) est le port écouté à l'intérieur du conteneur.
- **Saturation du disque** : Les conteneurs arrêtés et les images obsolètes s'accumulent. Pensez à nettoyer régulièrement l'environnement avec :
  ```bash
  docker system prune
  ```

## À retenir

Docker permet de créer des conteneurs légers et isolés à partir d'images immuables. Les commandes essentielles à maîtriser sont `docker run` pour instancier un conteneur, `docker ps` pour surveiller l'état, `docker logs` pour déboguer et `docker rm` pour nettoyer vos ressources.