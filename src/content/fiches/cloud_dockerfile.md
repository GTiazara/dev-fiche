---
title: Le fichier Dockerfile, création d'images de conteneurs
description: Apprendre à rédiger un Dockerfile efficace pour construire, optimiser et personnaliser des images Docker de production.
technology: cloud
difficulty: debutant
tags: [cloud, docker, dockerfile, devops, conteneurs, build]
publishedAt: 2026-10-25
updatedAt: 2026-10-25
draft: false
---

## Définition

Le **Dockerfile** est un document texte contenant l'ensemble des instructions qu'un utilisateur pourrait exécuter en ligne de commande pour assembler une **image Docker**.

Il sert de modèle (ou "blueprint") pour packager une application avec son environnement d'exécution, ses bibliothèques et ses configurations. L'image résultante est ensuite exécutable sous forme de **conteneur** sur n'importe quel environnement Cloud compatible.

## Instructions principales

Un Dockerfile s'écrit sous la forme d'une suite de directives écrites en majuscules, suivies de leurs arguments :

| Instruction | Rôle | Exemple |
| --- | --- | --- |
| `FROM` | Définit l'image de base (OS ou runtime) | `FROM node:20-alpine` |
| `WORKDIR` | Définit le répertoire de travail pour les instructions suivantes | `WORKDIR /app` |
| `COPY` | Copie des fichiers locaux de l'hôte vers l'image | `COPY package*.json ./` |
| `RUN` | Exécute une commande durant la construction de l'image | `RUN npm install` |
| `ENV` | Déclare une variable d'environnement | `ENV PORT=3000` |
| `EXPOSE` | Indique le port sur lequel le conteneur écoute | `EXPOSE 3000` |
| `CMD` | Définit la commande par défaut au lancement du conteneur | `CMD ["npm", "start"]` |

## Exemple complet de Dockerfile

Exemple type pour une application Web Node.js sécurisée et optimisée :

```dockerfile
# 1. Image de base légère
FROM node:20-alpine

# 2. Répertoire de travail dans le conteneur
WORKDIR /app

# 3. Copie préalable des descripteurs de dépendances (optimisation du cache)
COPY package*.json ./

# 4. Installation des dépendances de production
RUN npm ci --only=production

# 5. Copie du reste des sources de l'application
COPY . .

# 6. Déclaration du port d'écoute (à titre documentatif)
EXPOSE 3000

# 7. Variable d'environnement par défaut
ENV NODE_ENV=production

# 8. Commande de démarrage au lancement du conteneur
CMD ["node", "server.js"]
```

## Procédure de construction et d'exécution

### 1. Le fichier `.dockerignore`

Avant de lancer la construction, créez un fichier nommé `.dockerignore` à côté de votre `Dockerfile` pour exclure les fichiers inutiles :

```text
.git
.gitignore
node_modules
npm-debug.log
Dockerfile
```

### 2. Construire l'image (`docker build`)

Ouvrez un terminal dans le dossier du `Dockerfile` et lancez la construction en lui attribuant un nom et un tag (ex: `mon-app:1.0`) :

```bash
docker build -t mon-app:1.0 .
```

*Note : le point `.` à la fin indique le chemin du contexte de build (le dossier courant).*

### 3. Exécuter l'image (`docker run`)

Une fois l'image construite, vous pouvez instancier un conteneur :

```bash
docker run -d -p 3000:3000 --name mon-app-container mon-app:1.0
```

## Cas d'usage fréquents

- **Standardisation des Builds (CI/CD)** : intégrer le `docker build` dans vos pipelines (GitHub Actions, GitLab CI) pour produire des artefacts applicatifs identiques à chaque livraison.
- **Build Multi-étapes (Multi-stage builds)** : compiler du code (Go, Rust, Java, Angular) dans une première étape de build, puis copier uniquement le binaire produit dans une image finale ultra-légère (ex: `scratch` ou `alpine`).
- **Isolation des dépendances** : garantir qu'une application tournera de la même manière sur le poste d'un développeur, sur un serveur de recette ou dans un cluster Kubernetes.

## Mots-clés

| Terme | Définition |
| --- | --- |
| `Dockerfile` | Fichier texte décrivant les étapes d'assemblage d'une image Docker |
| `Build Context` | Ensemble des fichiers transmis au démon Docker pour construire l'image |
| `Layer (Couche)` | Chaque instruction du Dockerfile crée une couche d'image en lecture seule mise en cache |
| `.dockerignore` | Fichier masquant les fichiers locaux non pertinents lors de la transmission au démon |
| `Multi-stage build` | Technique permettant de réduire drastiquement la taille des images finales |

## Pièges et points de vigilance

- **Ne pas optimiser l'ordre des instructions** : placer `COPY . .` avant `RUN npm install` invalide le cache Docker à chaque modification du moindre fichier source, ce qui rallonge inutilement la durée du build.
- **Utiliser des images de base trop lourdes** : privilégiez les déclinaisons légères comme `-alpine` ou `-slim` plutôt que les images standard basées sur Ubuntu/Debian complets.
- **Exécuter en utilisateur `root`** : par défaut, les conteneurs s'exécutent avec les privilèges root. En production, il est recommandé d'ajouter l'instruction `USER node` (ou un utilisateur dédié) pour des raisons de sécurité.
- **Mettre des secrets en dur** : n'insérez jamais de mots de passe, clés API ou jetons secrets via des instructions `ENV` ou `RUN` dans un Dockerfile, car ils resteront lisibles dans l'historique des couches de l'image.

## À retenir

Le `Dockerfile` est la recette de fabrication de vos conteneurs. Il permet de transformer du code source en une image immuable. Respectez les bonnes pratiques : utilisez un fichier `.dockerignore`, ordonnez vos instructions pour maximiser la mise en cache, et optez pour des images de base légères (`alpine`) afin d'optimiser le déploiement Cloud.