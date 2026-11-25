---
title: "Nettoyer Docker : prune, images, volumes et cache de build"
description: "Libérer de l'espace disque avec docker system prune et les prune ciblés, sans supprimer par erreur des volumes de données utiles."
technology: cloud
difficulty: debutant
tags:
  - docker
  - prune
  - nettoyage
  - disque
  - volumes
  - cloud
publishedAt: 2026-11-25
updatedAt: 2026-11-25
draft: false
---

## Définition

Docker **ne supprime pas tout seul** les objets inutilisés (conteneurs arrêtés, images orphelines, réseaux, cache de build, volumes). Ils s'accumulent et remplissent le disque.

Le nettoyage se fait avec des commandes **`prune`** : elles retirent ce qui n'est plus référencé. Docker reste **prudent** sur les **volumes** (données) : par défaut, `system prune` ne les touche pas.

## Voir ce qui occupe le disque

```bash
docker system df          # résumé images / conteneurs / volumes / build cache
docker system df -v       # détail
docker ps -a              # tous les conteneurs (y compris arrêtés)
docker images             # images présentes
docker volume ls          # volumes locaux
```

Lire `df` **avant** et **après** un prune pour mesurer l'effet.

## Coup d'un seul coup : `docker system prune`

```bash
docker system prune
```

Sans options, retire en général :

- les conteneurs **arrêtés** ;
- les réseaux non utilisés par au moins un conteneur ;
- les images **dangling** (sans tag utile, non référencées) ;
- le **build cache** inutilisé (y compris certains mounts BuildKit `type=cache`).

Confirmation interactive par défaut. Pour forcer : `-f` / `--force`.

| Option | Effet |
| --- | --- |
| `-a` / `--all` | Aussi les images **non utilisées** par un conteneur (pas seulement dangling) |
| `--volumes` | Aussi les volumes **anonymes** inutilisés |
| `--filter until=24h` | Limiter aux objets plus vieux que 24 h (ex.) |
| `-f` | Pas de prompt |

```bash
# Nettoyage large (attention aux images encore « utiles » mais sans conteneur)
docker system prune -a

# Inclure les volumes anonymes orphelins — risque de perte de données anonymes
docker system prune -a --volumes
```

Les volumes **nommés** (ex. `db_data` Compose) ne partent pas avec `--volumes` de `system prune` de la même façon que via `volume prune -a` : lire la section volumes ci-dessous avant d'agir.

## Prune ciblés

Quand on veut nettoyer **une** catégorie seulement :

| Commande | Retire |
| --- | --- |
| `docker container prune` | Conteneurs **arrêtés** |
| `docker image prune` | Images **dangling** |
| `docker image prune -a` | Toutes les images **sans** conteneur associé |
| `docker network prune` | Réseaux non utilisés |
| `docker volume prune` | Volumes **anonymes** inutilisés |
| `docker volume prune -a` | **Tous** les volumes locaux inutilisés, y compris **nommés** |
| `docker builder prune` | Cache de build (sans forcément toucher images/conteneurs) |
| `docker buildx prune` | Cache du builder Buildx sélectionné |

Exemples filtrés :

```bash
docker container prune --filter "until=24h"
docker image prune -a --filter "until=168h"
docker volume prune --filter "label!=keep"
```

Filtres courants (selon la commande) : `until=…`, `label=…` / `label!=…`.

## Volumes : zone sensible

Les volumes stockent souvent bases de données et données persistantes. Docker **ne les efface pas automatiquement**.

| Situation | Commande | Risque |
| --- | --- | --- |
| Volumes anonymes orphelins | `docker volume prune` ou `system prune --volumes` | Faible si vraiment orphelins |
| Volumes **nommés** inutilisés | `docker volume prune -a` | Élevé : une BDD Compose arrêtée peut disparaître |
| Stack Compose + ses volumes | `docker compose down -v` | Élevé : volumes déclarés du projet |

Avant un prune agressif :

```bash
docker volume ls
docker compose ps    # si un projet tourne encore
```

Préférer arrêter proprement (`docker compose down` **sans** `-v`) puis `system prune` **sans** `--volumes`, sauf si vous acceptez de perdre les données anonymes.

## Compose et nettoyage local

```bash
docker compose down          # conteneurs + réseaux du projet ; volumes nommés gardés
docker compose down -v       # idem + volumes déclarés dans le compose — perte de données
docker compose down --rmi local   # retire aussi des images construites localement (selon version / options)
```

Le ménage global (`system prune`) reste utile pour le reste de la machine (autres projets, cache).

## Ordre de nettoyage recommandé

1. `docker system df` — constater.
2. `docker container prune` ou `compose down` — libérer les couches écrites des conteneurs arrêtés.
3. `docker image prune` puis éventuellement `-a` — images.
4. `docker builder prune` / `buildx prune` — cache de build souvent volumineux.
5. Volumes **seulement** si vous savez ce que vous effacez (`volume ls`, pas de BDD précieuse).
6. `docker system df` — vérifier.

## Erreurs fréquentes

| Piège | Conséquence | Contre-mesure |
| --- | --- | --- |
| `system prune -a --volumes` « pour faire de la place » | Perte de volumes anonymes / surprise sur les données | Omettre `--volumes` ; lister les volumes d'abord |
| `volume prune -a` alors que Compose est seulement arrêté | Volume nommé `db_data` supprimé | Ne pas utiliser `-a` sans inventaire |
| Croire que prune touche les conteneurs **en cours** | Non : les running restent | Arrêter avant si besoin (`stop` / `compose down`) |
| Images « encore utiles » sans conteneur | `-a` les enlève | Rebuild / `pull` plus tard ; filtrer avec `until` |

## À retenir

- `docker system df` pour mesurer ; `docker system prune` pour un ménage large.
- `-a` élargit aux images inutilisées ; `--volumes` touche les volumes anonymes — **danger données**.
- Prune ciblés : `container`, `image`, `network`, `volume`, `builder` / `buildx`.
- Volumes nommés : `volume prune -a` ou `compose down -v` seulement en connaissance de cause.
- Le cache de build grossit vite : `builder prune` / `buildx prune` souvent rentable.

## Sources

- [Prune unused Docker objects](https://docs.docker.com/engine/manage-resources/pruning/) — vue d'ensemble officielle.
- [docker system prune](https://docs.docker.com/reference/cli/docker/system/prune/)
- [docker image prune](https://docs.docker.com/reference/cli/docker/image/prune/)
- [docker container prune](https://docs.docker.com/reference/cli/docker/container/prune/)
- [docker volume prune](https://docs.docker.com/reference/cli/docker/volume/prune/)
- [docker network prune](https://docs.docker.com/reference/cli/docker/network/prune/)
- [docker builder prune](https://docs.docker.com/reference/cli/docker/builder/prune/) / [buildx prune](https://docs.docker.com/reference/cli/docker/buildx/prune/)
- [docker system df](https://docs.docker.com/reference/cli/docker/system/df/)
