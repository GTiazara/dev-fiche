---
title: L'utilisation des commandes Docker et Docker Compose
description: Découvrir et maîtriser les commandes essentielles de Docker et Docker Compose pour orchestrer vos conteneurs dans un environnement Cloud.
technology: cloud
difficulty: debutant
tags: [cloud, docker, docker-compose, conteneurs, devops, orchestration]
publishedAt: 2026-10-25
updatedAt: 2026-10-25
draft: false
quiz:
  - question: Quelle commande permet de lancer des conteneurs en arrière-plan avec Docker Compose ?
    choices:
      - docker compose up -d
      - docker compose start --background
      - docker run -d compose
    answer: 0
    explanation: L'option `-d` (detach) permet de démarrer l'ensemble des services définis dans le fichier `docker-compose.yml` en arrière-plan.
  - question: Quel est le fichier de configuration principal utilisé par Docker Compose ?
    choices:
      - docker-compose.yml
      - Dockerfile
      - docker.config.json
    answer: 0
    explanation: Docker Compose s'appuie sur le fichier `docker-compose.yml` (ou `yaml`) pour déclarer les services, réseaux et volumes.
  - question: Quelle commande supprime tous les conteneurs arrêtés, réseaux inutilisés et images orphelines ?
    choices:
      - docker system prune
      - docker compose destroy
      - docker clean --all
    answer: 0
    explanation: La commande `docker system prune` nettoie les ressources inactives afin de libérer de l'espace disque sur l'hôte.
---

## Définition

**Docker** est une plateforme de conteneurisation permettant d'empaqueter une application et ses dépendances dans un environnement isolé appelé **conteneur**.

**Docker Compose** est un outil complémentaire permettant de définir et de gérer des applications multi-conteneurs. À l'aide d'un simple fichier de configuration YAML (`docker-compose.yml`), il permet d'orchestrer le démarrage, le réseau et les volumes de plusieurs conteneurs interconnectés en une seule commande.

## Comparatif des outils

Bien qu'ils fonctionnent ensemble, Docker et Docker Compose répondent à des besoins distincts :

| Outil | Périmètre d'action | Fichier de référence principal | Cas d'usage principal |
| --- | --- | --- | --- |
| **Docker CLI** | Gestion unitaire des images et conteneurs | `Dockerfile` | Créer une image, lancer un conteneur unique |
| **Docker Compose** | Orchestration multi-conteneurs locale / cloud | `docker-compose.yml` | Démarrer une application complète (App + BDD + Cache) |

## Syntaxe et commandes fondamentales

### 1. Commandes Docker fondamentales

```bash
# Télécharger une image depuis un registre (Docker Hub)
docker pull nginx:alpine

# Lister les conteneurs en cours d'exécution
docker ps

# Lister tous les conteneurs (y compris ceux arrêtés)
docker ps -a

# Démarrer un conteneur en arrière-plan avec redirection de port
# Format : -p <Port_Hôte>:<Port_Conteneur>
docker run -d -p 8080:80 --name mon-serveur nginx:alpine

# Consulter les logs d'un conteneur
docker logs -f mon-serveur

# Exécuter une commande interactive dans un conteneur actif
docker exec -it mon-serveur sh

# Arrêter et supprimer un conteneur
docker stop mon-serveur
docker rm mon-serveur
```

### 2. Commandes Docker Compose fondamentales

Les commandes Docker Compose s'exécutent généralement dans le dossier contenant le fichier `docker-compose.yml` :

```bash
# Construire les images et démarrer tous les services en arrière-plan
docker compose up -d --build

# Recréer uniquement le service web sans démarrer ses dépendances
docker compose up -d --no-deps --force-recreate web

# Afficher l'état des services gérés par le fichier compose
docker compose ps

# Visualiser les logs de tous les services en temps réel
docker compose logs -f

# Arrêter et supprimer les conteneurs, réseaux et volumes associés
docker compose down

# Arrêter et supprimer en incluant les volumes de données (ATTENTION : perte de données)
docker compose down -v
```

Dans la commande de mise à jour ciblée, `--no-deps` évite de démarrer les services dont `web` dépend. `--force-recreate` recrée le conteneur même si Compose ne détecte aucun changement de configuration ou d'image. Remplacez `web` par le nom du service défini dans le fichier Compose. Cette commande ne reconstruit pas l'image : ajoutez `--build` si vous devez aussi la reconstruire.

## Structure d'un projet Docker Compose

Un exemple classique d'architecture web (application Node.js + base de données PostgreSQL) déclarée dans un fichier `docker-compose.yml` :

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: secretpassword
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

## Cas d'usage fréquents

- **Environnement de développement unifié** : fournir à une équipe un environnement rigoureusement identique en une seule commande (`docker compose up`).
- **Déploiement d'architectures microservices** : orchestrer plusieurs services interconnectés (ex: Frontend, API, Redis, MySQL).
- **Isolation des tests automatisés** : monter une base de données temporaire isolée pour exécuter des jeux de tests puis la détruire proprement.

## Mots-clés

| Terme | Définition |
| --- | --- |
| `Image` | Modèle en lecture seule contenant le code, les bibliothèques et la configuration d'une application |
| `Conteneur` | Instance exécutable et isolée d'une image Docker |
| `Dockerfile` | Script d'instructions permettant de construire une image Docker personnalisée |
| `Volume` | Espace de stockage persistant géré par Docker hors du cycle de vie du conteneur |
| `Registre` | Serveur de stockage et de distribution d'images Docker (ex: Docker Hub, AWS ECR) |

## Pièges et points de vigilance

- **Absence de persistance des données** : si vous ne définissez pas de **volume**, les données écrites dans le conteneur seront définitivement perdues lors de sa suppression.
- **Conflits de ports sur la machine hôte** : vérifier qu'aucun autre service n'utilise déjà le port hôte spécifié lors de la redirection (ex: `8080:80`).
- **Ancienne vs nouvelle syntaxe Compose** : utilisez la commande moderne `docker compose` (intégrée au CLI Docker) plutôt que l'ancienne commande `docker-compose` (séparée par un tiret, désormais dépréciée).
- **Accumulation d'images obsolètes** : les builds successifs consomment de l'espace disque. Exécutez régulièrement la commande de nettoyage :
  ```bash
  docker system prune -a
  ```

## À retenir

Docker permet de conteneuriser vos applications, tandis que Docker Compose facilite l'orchestration multi-conteneurs à l'aide d'un fichier `docker-compose.yml`. Retenez les commandes clés : `docker compose up -d` pour lancer votre stack, `docker compose logs -f` pour surveiller son comportement et `docker compose down` pour tout arrêter proprement.
