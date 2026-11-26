---
title: "Les commandes Docker du quotidien"
description: "S'authentifier, tirer et pousser des images, lancer et inspecter des conteneurs avec les commandes Docker qu'un développeur utilise chaque jour."
technology: cloud
difficulty: debutant
tags:
  - docker
  - login
  - registry
  - images
  - conteneurs
  - cloud
publishedAt: 2026-11-26
updatedAt: 2026-11-26
draft: false
---

## Définition

Docker sépare **image** (modèle immuable) et **conteneur** (instance qui tourne). Le quotidien d'un développeur : s'authentifier sur un **registre**, tirer / construire / pousser des images, démarrer un conteneur, lire les logs, entrer dedans, puis nettoyer.

Les bases conceptuelles sont dans la fiche Docker ; le réseau Compose, les profiles et le `prune` ont leurs fiches dédiées.

## S'authentifier : login / logout

Beaucoup de `pull` / `push` (et certains builds) exigent d'être connecté au registre.

```bash
docker login                         # Docker Hub (souvent flux navigateur / device code)
docker login -u mon-user             # demande le mot de passe ou un PAT
echo "$TOKEN" | docker login -u mon-user --password-stdin

docker login registry.exemple.com    # registre privé (port si besoin : host:5000)
docker logout
docker logout registry.exemple.com
```

Préférer un **Personal Access Token** (PAT) plutôt que le mot de passe du compte, surtout en CI. `--password-stdin` évite de laisser le secret dans l'historique du shell. Les identifiants partent dans le *credential store* configuré (sinon encodage peu sûr dans `~/.docker/config.json`).

Sans `login`, un `pull` d'image publique Hub peut encore marcher ; un dépôt privé ou un `push` échoue en 401 / denied.

## Images : pull, tag, push, build

```bash
docker pull nginx:alpine
docker pull registry.exemple.com/equipe/api:1.2.3

docker images                        # alias : docker image ls
docker image ls nginx

docker tag nginx:alpine mon-user/nginx:dev
docker tag mon-user/nginx:dev registry.exemple.com/equipe/nginx:1.2.3

docker push mon-user/nginx:dev
docker push registry.exemple.com/equipe/nginx:1.2.3

docker build -t mon-user/api:dev .
docker build -t registry.exemple.com/equipe/api:1.2.3 -f Dockerfile.prod .
```

Sans tag, `pull` / `push` utilisent `:latest` — pratique en local, fragile en prod : préférer un tag versionné ou un digest (`image@sha256:…`).

Enchaînement typique après un build local vers un registre privé : `login` → `tag` avec le préfixe du registre → `push`.

## Conteneurs : run, cycle de vie, inspection

```bash
docker run --rm -it alpine sh
docker run -d -p 8080:80 --name web nginx:alpine

docker ps                            # en cours
docker ps -a                         # y compris arrêtés
docker stop web
docker start web
docker rm web                        # conteneur arrêté
docker rm -f web                     # stop + suppression

docker logs web
docker logs -f --tail 100 web
docker exec -it web sh               # ou bash selon l'image
docker inspect web                   # JSON : IP, mounts, env…
docker port web                      # ports publiés
```

`-p hôte:conteneur` : le premier port est celui de votre machine. `--rm` efface le conteneur à l'arrêt (idéal pour un essai). Les données dans le conteneur disparaissent avec lui ; pour persister, monter un volume (`-v` / `--mount`).

## Compose (rappel rapide)

Dans le dossier du `compose.yaml` :

```bash
docker compose up -d
docker compose ps
docker compose logs -f api
docker compose exec api sh
docker compose down
```

Profiles optionnels : fiche Compose profiles. Réseau / DNS entre services : fiche réseau Compose.

## Espace disque (aperçu)

```bash
docker system df
docker system prune                  # voir la fiche nettoyage avant -a / volumes
```

## À retenir

- `docker login` / `logout` : accès registre ; PAT + `--password-stdin` en script.
- `pull` télécharge, `build` / `tag` préparent, `push` publie (préfixe = registre + dépôt).
- `run` lance ; `ps` / `logs` / `exec` / `inspect` pour suivre et déboguer.
- `stop` / `rm` (ou `rm -f`) libèrent les conteneurs ; `system prune` pour le reste (avec prudence sur les volumes).

## Sources

- [docker login](https://docs.docker.com/reference/cli/docker/login/)
- [docker logout](https://docs.docker.com/reference/cli/docker/logout/)
- [docker image pull](https://docs.docker.com/reference/cli/docker/image/pull/)
- [docker image push](https://docs.docker.com/reference/cli/docker/image/push/)
- [docker image tag](https://docs.docker.com/reference/cli/docker/image/tag/)
- [docker image ls](https://docs.docker.com/reference/cli/docker/image/ls/)
