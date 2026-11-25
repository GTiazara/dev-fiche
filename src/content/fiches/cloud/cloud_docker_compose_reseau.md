---
title: "Réseau Docker Compose : DNS, réseaux custom et isolation"
description: "Comprendre le réseau par défaut Compose, joindre les services par nom, séparer frontend/backend, brancher un réseau externe et déboguer la connectivité."
technology:
  - cloud
  - reseau
difficulty: intermediaire
tags:
  - docker
  - docker-compose
  - reseau
  - dns
  - bridge
  - cloud
publishedAt: 2026-11-25
updatedAt: 2026-11-25
draft: false
---

## Définition

Avec **Docker Compose**, les services d'un même projet se parlent sur un **réseau bridge** géré pour vous. Chaque service est joignable par son **nom** grâce au DNS interne de Docker : pas besoin d'IP fixe.

Exemple minimal (dossier `myapp`) :

```yaml
services:
  web:
    build: .
    ports:
      - "8000:8000"
  db:
    image: postgres:latest
    ports:
      - "8001:5432"
```

Au `docker compose up` :

1. Compose crée le réseau `myapp_default` (nom = projet + `_default`) ;
2. les conteneurs `web` et `db` le rejoignent ;
3. depuis `web`, la base est `postgres://db:5432` (port **conteneur**).

Depuis l'hôte : `localhost:8001` (port **hôte** mappé). Les IP Docker changent à chaque recréation : toujours utiliser le **nom de service**.

Le nom de projet vient du dossier, ou de `--project-name` / `COMPOSE_PROJECT_NAME`.

## Port hôte vs port conteneur

| Où | Quoi utiliser |
| --- | --- |
| Service → service (même réseau Compose) | Nom du service + **port conteneur** (`db:5432`) |
| Navigateur / outils sur l'hôte | `localhost` + **port hôte** (`localhost:8001`) |

`ports: "8001:5432"` = hôte `8001` → conteneur `5432`. Entre conteneurs, le mapping hôte n'est **pas** nécessaire.

## Réseau par défaut : suffisant en dev

Sans clé `networks` dans le fichier, tous les services partagent le réseau `default` du projet. C'est le cas le plus courant en développement.

Personnaliser ce défaut :

```yaml
networks:
  default:
    name: mon_reseau_app
    driver: bridge
```

## Réseaux custom : isoler les services

La clé top-level `networks` définit des réseaux nommés. Chaque service liste ceux qu'il rejoint. Deux services **sans réseau en commun** ne se voient pas.

```yaml
services:
  proxy:
    build: ./proxy
    networks:
      - frontend
  app:
    build: ./app
    networks:
      - frontend
      - backend
  db:
    image: postgres:latest
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
```

Ici `proxy` ne parle pas à `db` ; seul `app` relie les deux tiers.

### Réseau interne (pas de sortie Internet)

```yaml
networks:
  isolated:
    internal: true
```

Utile pour un cache ou une base qui ne doit pas sortir. Un service aussi branché sur un réseau non interne peut encore joindre l'extérieur via ce second réseau.

## Réseau externe et projets multiples

Pour faire parler deux stacks Compose :

```bash
docker network create inter-project
```

Puis dans chaque `compose.yaml` :

```yaml
services:
  api:
    image: myapi:latest
    networks:
      - shared
      - default

networks:
  shared:
    external: true
    name: inter-project
```

Le réseau **doit exister** avant `docker compose up` (`Network not found` sinon). Les services sur `inter-project` se joignent encore par **nom de service**.

Hybride : exposer seulement l'API sur le réseau partagé, garder la BDD sur un réseau `internal` du projet.

## Modes réseau (`network_mode`)

Par défaut : bridge du projet. Alternatives **par service** :

| Valeur | Effet |
| --- | --- |
| `host` | Partage la pile réseau de l'hôte ; pas de `ports:` utiles ; pas de DNS des noms de service Compose |
| `none` | Aucun réseau |
| `service:nom` | Partage la pile réseau d'un autre **service** |
| `container:id` | Partage la pile d'un conteneur donné |

`host` est puissant et risqué : à réserver aux outils qui en ont vraiment besoin (monitoring bas niveau, etc.).

## Noms d'hôtes : `extra_hosts`

Ajoute des entrées dans `/etc/hosts` du conteneur :

```yaml
services:
  app:
    image: myapp
    extra_hosts:
      - "api.staging:192.168.1.100"
      - "host.docker.internal:host-gateway"
```

`host-gateway` pointe vers l'IP de l'hôte (pratique sous Linux pour joindre un service lancé hors Docker).

## Liens (`links`)

Les `links` ajoutent des **alias** DNS (`db` aussi joignable comme `database`). Ils ne sont **pas** requis pour la découverte par nom de service. Préférer les réseaux Compose modernes.

## Déboguer

```bash
# Port hôte réel (surtout si mapping dynamique "- 80")
docker compose port db 5432

# Membres d'un réseau
docker network ls
docker network inspect mon_projet_default

# Test depuis un conteneur
docker compose exec web sh -c "getent hosts db || ping -c1 db"
docker compose exec app cat /etc/hosts
```

Ordre utile : config YAML → membership (`inspect`) → test DNS / TCP depuis le conteneur.

## Erreurs fréquentes

| Symptôme | Cause | Action |
| --- | --- | --- |
| Connexion refusée entre services | Mauvais port (hôte au lieu du conteneur) ou pas le même réseau | Utiliser `service:port_conteneur` ; vérifier `networks` |
| IP en dur qui casse après `up` | IP Docker non stable | Nom de service uniquement |
| `Network not found` | `external: true` sans réseau créé | `docker network create …` d'abord |
| Service isolé « trop » | Un seul réseau `internal` | Ajouter un second réseau non interne si besoin d'Internet |
| `host` + `ports` | Incompatible / inutile | Retirer `ports` ou revenir en bridge |

## À retenir

- Compose crée `projet_default` ; les services se joignent par **nom** (DNS).
- Entre conteneurs : port **conteneur** ; depuis l'hôte : port **hôte** (`ports`).
- Réseaux custom = isolation (frontend / backend) ; `internal: true` coupe la sortie.
- `external` + `docker network create` pour lier plusieurs projets Compose.
- Ne jamais figer une IP de conteneur ; déboguer avec `port`, `network inspect`, `compose exec`.

## Sources

- [Networking in Compose](https://docs.docker.com/compose/how-tos/networking/) — réseau par défaut, DNS, custom, externe, debug.
- [Compose file — networks](https://docs.docker.com/reference/compose-file/networks/) — attributs `driver`, `external`, `internal`, `name`, IPAM.
- [Compose file — services networks](https://docs.docker.com/reference/compose-file/services/#networks) — attachement par service.
- [Network drivers](https://docs.docker.com/engine/network/drivers/) — bridge, overlay, etc.
- [Overlay network driver](https://docs.docker.com/engine/network/drivers/overlay/) — multi-hôte (Swarm).
