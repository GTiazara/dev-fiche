---
title: "Configurer le proxy HTTP avec Docker (client et daemon)"
description: "Comprendre les deux endroits où Docker lit le proxy : le client (~/.docker/config.json) pour les conteneurs, et le daemon (systemd) pour dockerd — et aligner NO_PROXY."
technology:
  - cloud
  - reseau
difficulty: intermediaire
tags:
  - docker
  - proxy
  - no_proxy
  - entreprise
  - registry
  - cloud
publishedAt: 2026-11-27
updatedAt: 2026-11-27
draft: false
quiz:
  - question: Où configure-t-on le proxy injecté dans les nouveaux conteneurs ?
    choices:
      - Uniquement dans le Dockerfile
      - Dans ~/.docker/config.json (section proxies)
      - Uniquement avec docker run -e à chaque lancement
    answer: 1
    explanation: "Le client Docker lit proxies.default dans ~/.docker/config.json et injecte HTTP(S)_PROXY / NO_PROXY dans les conteneurs créés ensuite."
  - question: À quoi sert surtout le proxy configuré pour le daemon Docker (systemd) ?
    choices:
      - À exposer les ports localhost des conteneurs
      - Aux appels réseau de dockerd (pull, push, contacts registry)
      - À remplacer docker compose
    answer: 1
    explanation: "Le drop-in systemd concerne dockerd : téléchargement d'images, accès aux registres, etc. Ce n'est pas la config d'accès navigateur vers localhost."
  - question: Après avoir changé noProxy dans config.json, que faut-il souvent faire ?
    choices:
      - "Rien : les conteneurs déjà lancés sont mis à jour automatiquement"
      - Recréer les conteneurs pour qu'ils reçoivent les nouvelles variables
      - Réinstaller Docker
    answer: 1
    explanation: "Les variables proxy sont injectées à la création du conteneur. Un recreate (ou un nouveau run) est nécessaire pour appliquer un noProxy modifié."
  - question: Pourquoi ajouter localhost et 127.0.0.1 dans NO_PROXY ?
    choices:
      - Pour accélérer le DNS public
      - Pour éviter d'envoyer le trafic local vers le proxy d'entreprise
      - Pour désactiver complètement le pare-feu
    answer: 1
    explanation: "Sans ces exceptions, certains outils envoient les requêtes vers 127.0.0.1 ou localhost au proxy, qui ne peut pas joindre correctement vos services locaux."
---

## Définition

En entreprise, l'accès Internet passe souvent par un **proxy HTTP(S)**. Docker en a besoin pour tirer des images ou laisser un conteneur appeler l'extérieur — mais le trafic **local** (localhost, réseaux privés Docker) ne doit en général **pas** passer par ce proxy.

Docker ne lit pas le proxy à un seul endroit. Il y en a **deux**, avec des rôles différents. Les confondre explique beaucoup de « ça marche dans le shell mais pas dans le conteneur » (ou l'inverse).

## Les deux endroits côté Docker

```text
┌─────────────────────────────┐
│  1. Client Docker           │  ~/.docker/config.json
│     → variables injectées   │  dans les NOUVEAUX conteneurs
└─────────────────────────────┘
┌─────────────────────────────┐
│  2. Daemon dockerd          │  systemd drop-in (souvent)
│     → pull / push / registry│  redémarrage Docker requis
└─────────────────────────────┘
```

| Endroit | Fichier typique | Qui est concerné | Effet principal |
| --- | --- | --- | --- |
| **Client → conteneurs** | `~/.docker/config.json` | Processus *dans* les conteneurs | `HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY` injectés à la création |
| **Daemon `dockerd`** | `/etc/systemd/system/docker.service.d/http-proxy.conf` | Le moteur Docker sur l'hôte | `docker pull` / `push`, contact des registres, etc. |

Il existe aussi le proxy du **shell** (`http_proxy` / `NO_PROXY` dans l'environnement) : utile pour `curl`, Git, etc. Ce n'est **pas** automatiquement la même chose que la config Docker.

## 1. Client Docker → conteneurs

Fichier : `~/.docker/config.json`

```json
{
  "proxies": {
    "default": {
      "httpProxy": "http://proxy.exemple.com:3128",
      "httpsProxy": "http://proxy.exemple.com:3128",
      "noProxy": "localhost,127.0.0.1,::1,.exemple.com,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16"
    }
  }
}
```

- `httpProxy` / `httpsProxy` : sortie Internet depuis le conteneur.
- `noProxy` : hôtes ou plages à **ne pas** envoyer au proxy (local, domaines internes, réseaux privés).

Vérifier dans un conteneur déjà créé **après** la config :

```bash
docker run --rm alpine env | grep -i proxy
```

**Important :** changer `config.json` ne met pas à jour les conteneurs déjà lancés. Il faut les **recréer** (`docker compose up -d --force-recreate`, nouveau `docker run`, etc.).

On peut aussi passer les variables au cas par cas :

```bash
docker run --rm \
  -e HTTP_PROXY=http://proxy.exemple.com:3128 \
  -e HTTPS_PROXY=http://proxy.exemple.com:3128 \
  -e NO_PROXY=localhost,127.0.0.1 \
  alpine wget -qO- https://example.com
```

Compose : section `environment:` ou un fichier `.env` — utile pour surcharger sans toucher au `config.json` global.

## 2. Daemon Docker (`dockerd`)

Sur Linux avec systemd, un drop-in classique :

`/etc/systemd/system/docker.service.d/http-proxy.conf`

```ini
[Service]
Environment="HTTP_PROXY=http://proxy.exemple.com:3128/"
Environment="HTTPS_PROXY=http://proxy.exemple.com:3128/"
Environment="NO_PROXY=localhost,127.0.0.1,::1,.exemple.com,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16"
```

Appliquer :

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

`restart docker` coupe brièvement les conteneurs : prévoir de relancer la stack ensuite.

Vérifier ce que le daemon voit :

```bash
systemctl show docker --property=Environment
```

Sans cette config, un `docker pull` peut échouer (timeout, connection refused) alors qu'un navigateur passe déjà par le proxy système.

## Que mettre dans `NO_PROXY` / `noProxy` ?

Valeurs souvent utiles :

| Entrée | Pourquoi |
| --- | --- |
| `localhost`, `127.0.0.1`, `::1` | Services locaux, healthchecks, outils qui appellent la machine elle-même |
| `.entreprise.tld` | Domaines internes (le point initial = suffixe) |
| `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` | Plages privées (dont bridges Docker `172.x`) |

**Aligner** client Docker, daemon et shell évite les écarts du type : pull OK, mais le conteneur sort encore via le proxy pour une IP privée — ou l'inverse.

Attention : tous les programmes ne parse pas les CIDR (`172.16.0.0/12`) de la même façon. En cas de doute, tester avec l'outil concerné (`curl`, Python `urllib`, etc.).

## Erreurs fréquentes

| Symptôme | Piste |
| --- | --- |
| `docker pull` timeout / bloque | Proxy **daemon** manquant ou faux ; firewall |
| Conteneur ne joint pas Internet | Proxy **client** absent ; ou `HTTPS_PROXY` oublié |
| Conteneur ne joint pas un service sur `172.x` / hostname Compose | `NO_PROXY` trop étroit ; trafic envoyé au proxy |
| `curl http://127.0.0.1:…` bizarre sur l'hôte | `NO_PROXY` shell sans `127.0.0.1` (seul `localhost` ne suffit pas toujours) |
| Config changée, rien ne bouge | Conteneurs non recréés ; daemon non redémarré |

Un proxy bien réglé **ne remplace pas** un problème de routage hôte (VPN qui vole les routes Docker, etc.) : si `localhost:port` timeout alors que le conteneur répond en interne, voir la fiche [VPN full tunnel et ports Docker](/fiches/cloud_docker_vpn).

## À retenir

- **Deux configs Docker** : client (`~/.docker/config.json`) pour les conteneurs ; daemon (systemd) pour `dockerd` (pull/push).
- Toujours prévoir un **`noProxy` / `NO_PROXY`** pour le local et les plages privées.
- Après changement client → **recréer** les conteneurs ; après changement daemon → **`daemon-reload` + `restart docker`**.
- Aligner shell + client + daemon réduit les surprises.

## Sources

- [Docker — Configure Docker to use a proxy server](https://docs.docker.com/engine/daemon/proxy/)
- [Docker — Proxy configuration (containers / config.json)](https://docs.docker.com/engine/cli/proxy/)
