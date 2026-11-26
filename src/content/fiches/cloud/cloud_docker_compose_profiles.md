---
title: "Profiles Docker Compose : services optionnels dans un seul fichier"
description: "Activer ou ignorer des services Compose avec profiles, --profile et COMPOSE_PROFILES, sans multiplier les fichiers YAML."
technology: cloud
difficulty: intermediaire
tags:
  - docker
  - docker-compose
  - profiles
  - devops
  - cloud
publishedAt: 2026-11-26
updatedAt: 2026-11-26
draft: false
---

## Définition

Un **profile** Compose est un nom collé à un service pour le rendre **optionnel**. Les services **sans** `profiles` démarrent toujours. Ceux qui en ont un ne démarrent que si ce profile est **actif** (`--profile` ou `COMPOSE_PROFILES`).

But : garder dans **un seul** `compose.yaml` l'appli de base et les extras (phpMyAdmin, mail de test, outils de debug), sans les lancer à chaque `up`.

Noms de profile valides : `[a-zA-Z0-9][a-zA-Z0-9_.-]+` (lettre ou chiffre en premier).

## Déclarer des profiles

```yaml
services:
  backend:
    image: backend

  db:
    image: mysql

  frontend:
    image: frontend
    profiles: [frontend]

  phpmyadmin:
    image: phpmyadmin
    depends_on: [db]
    profiles: [debug]
```

Ici, `docker compose up` ne démarre que `backend` et `db`. `frontend` et `phpmyadmin` restent hors jeu tant que leur profile n'est pas activé.

Conseil Docker : **ne pas** mettre de `profiles` sur les services cœur (API, base). Réserver l'attribut aux optionnels.

## Activer un ou plusieurs profiles

```bash
docker compose --profile debug up
COMPOSE_PROFILES=debug docker compose up

docker compose --profile frontend --profile debug up
COMPOSE_PROFILES=frontend,debug docker compose up

docker compose --profile "*" up    # tous les profiles
```

Avec `--profile debug` sur l'exemple ci-dessus : `db`, `backend` **et** `phpmyadmin`.

`COMPOSE_PROFILES` peut aussi vivre dans un fichier `.env` du projet. Si `--profile` est passé en ligne de commande, cette variable est **ignorée** (le flag CLI prime).

Arrêt / nettoyage : les mêmes profils actifs s'appliquent à `down` :

```bash
docker compose --profile debug down
```

Sans profile actif, `docker compose down` ne gère que les services toujours actifs (`backend`, `db`). Un service précis : `docker compose stop phpmyadmin` ou `docker compose down phpmyadmin`.

## Cibler un service sans activer tout le profile

Si vous nommez un service sur la ligne de commande, Compose l'exécute **même** si son profile n'est pas activé — et active ce profile pour cette commande. Les **autres** services du même profile ne partent pas, sauf s'ils sont aussi ciblés ou si le profile est activé explicitement.

```yaml
services:
  backend:
    image: backend
  db:
    image: mysql
  db-migrations:
    image: backend
    command: myapp migrate
    depends_on: [db]
    profiles: [tools]
```

```bash
docker compose up -d                 # backend + db seulement
docker compose run db-migrations     # lance db-migrations (+ db via depends_on)
```

Pas besoin de `--profile tools` pour ce `run`. Utile pour une migration ou un outil ponctuel.

## Dépendances et pièges

`depends_on` tire les dépendances déclarées, mais **ne réveille pas** un service exclu par les profiles via un simple `links` / `extends` / référence `service:…`. Si A dépend de B et que B est derrière un autre profile non actif, le modèle est **invalide**.

| Situation | Résultat |
| --- | --- |
| Aucun profile actif | Seulement les services sans `profiles` |
| Profile `debug` actif | Services cœur + ceux listant `debug` |
| `run` / `up` d'un service profilé | Ce service (+ `depends_on`) ; pas tout le profile |
| Dépendance vers un service d'un autre profile inactif | Erreur Compose |

Mettre les services liés derrière le **même** profile, ou laisser la dépendance sans profile (toujours active).

Les volumes, réseaux et autres éléments de premier niveau **ne** sont **pas** filtrés par `profiles` : ils restent toujours définis.

## À retenir

- Sans `profiles` → toujours démarré. Avec `profiles` → seulement si le profile est actif.
- Activer : `docker compose --profile nom …` ou `COMPOSE_PROFILES=nom` (plusieurs : flags répétés ou liste séparée par des virgules ; `"*"` = tous).
- Cibler un service (`run` / `up service`) active son profile pour lui, pas pour tous ses voisins.
- Garder le cœur de l'appli sans profile ; isoler debug, admin UI et jobs ponctuels.

## Sources

- [Using profiles with Compose — Docker Docs](https://docs.docker.com/compose/how-tos/profiles/)
- [Profiles — Compose Specification](https://compose-spec.github.io/compose-spec/15-profiles.html)
- [COMPOSE_PROFILES — variables d'environnement Compose](https://docs.docker.com/compose/how-tos/environment-variables/envvars/)
- [docker compose CLI — profiles](https://docs.docker.com/reference/cli/docker/compose/)
