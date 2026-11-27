---
title: "VPN full tunnel et ports Docker publiés qui timeout"
description: "Diagnostiquer quand les conteneurs tournent mais localhost:port ne répond plus : le VPN détourne souvent les routes vers les bridges Docker (172.x)."
technology:
  - cloud
  - reseau
difficulty: intermediaire
tags:
  - docker
  - vpn
  - routage
  - bridge
  - localhost
  - tun
  - cloud
publishedAt: 2026-11-27
updatedAt: 2026-11-27
draft: false
---

## Définition

Symptôme classique en entreprise :

1. `docker compose` / `docker ps` : conteneurs **Up**, ports publiés (`8080:80`, etc.).
2. Depuis l'hôte : `http://localhost:8080` (ou `127.0.0.1`) **timeout** ou reste sans réponse.
3. **Dans** le conteneur, le service répond normalement.

Ce n'est souvent **ni** un bug de l'app, **ni** uniquement le proxy HTTP. Un **VPN full tunnel** a détourné le trafic vers les IP des bridges Docker (`172.16.0.0/12`, etc.) dans le tunnel (`tun0`, `ppp0`, …) au lieu du bridge local.

La fiche [proxy Docker](/fiches/cloud_docker_proxy) traite `HTTP_PROXY` / `NO_PROXY`. Ici : le **routage hôte → IP du conteneur**.

## Comment un port publié fonctionne vraiment

```text
Navigateur / curl
    → 127.0.0.1:8080          (écoute sur l'hôte)
         ↓
    docker-proxy (ou iptables DNAT)
         ↓
    172.x.y.z:port_conteneur  (IP sur le bridge Docker)
         ↓
    processus dans le conteneur
```

- Atteindre `127.0.0.1:8080` ne suffit pas : le forward doit encore joindre **`172.x.y.z`**.
- Si la route vers `172.x.y.z` passe par le **VPN**, les paquets quittent la machine et ne reviennent pas → timeout.
- D'où l'illusion : « Docker tourne, mais localhost est mort ».

Entre conteneurs sur le même réseau Compose, la communication reste souvent OK (elle ne passe pas par ce chemin hôte). Le problème frappe surtout **l'accès depuis l'hôte**.

## Full tunnel vs split tunnel

| Mode VPN | Comportement | Impact Docker local |
| --- | --- | --- |
| **Full tunnel** | Quasi tout le trafic (souvent y compris plages privées) part dans le VPN | Routes `172.x` / bridges peuvent être volées ou écrasées |
| **Split tunnel** | Seules les plages entreprise passent au VPN ; le reste reste local | Docker local en général intact |

Le split tunnel se configure souvent **côté serveur VPN** (politique admin), pas dans Docker Compose. Sur le poste, on constate surtout l'effet via la table de routage.

Certains clients VPN **réécrivent les routes en continu** (toutes les quelques secondes) : un correctif manuel `ip route` peut marcher un instant puis disparaître.

## Checklist de diagnostic

Exécuter dans l'ordre.

### 1. Conteneur et port

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

Le mapping hôte doit apparaître (ex. `0.0.0.0:8080->80/tcp`).

### 2. Le service répond *dans* le conteneur

```bash
docker exec NOM_CONTENEUR wget -qO- --timeout=3 http://127.0.0.1:PORT_INTERNE/
# ou curl / python selon l'image
```

Si ça échoue ici : problème applicatif ou mauvais port **interne**, pas le VPN.

### 3. L'hôte se connecte en TCP mais HTTP timeout

```bash
curl -v --noproxy '*' --max-time 5 http://127.0.0.1:PORT_HOTE/
```

- Connexion établie puis silence / timeout → souvent forward cassé (routage vers le conteneur).
- Utiliser `--noproxy '*'` (ou `127.0.0.1` dans `NO_PROXY`) pour écarter un proxy HTTP qui interfère — voir la fiche proxy.

### 4. Où part le trafic vers l'IP du conteneur ?

```bash
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' NOM_CONTENEUR
ip route get 172.x.y.z
```

| Résultat de `ip route get` | Interprétation |
| --- | --- |
| `dev br-…` ou `dev docker0` | Routage Docker local sain |
| `dev tun0` / `ppp0` / interface VPN | Le VPN capture les plages Docker → cause probable |
| pas de route / via default VPN | Même idée : plus de route bridge dédiée |

### 5. Le VPN est-il actif ?

```bash
ip -br link | grep -iE 'tun|ppp|wg'
ip route | head -20    # default via … ?
```

### 6. Contrôle hors VPN (si possible)

Couper le VPN un instant et retester `curl http://127.0.0.1:PORT_HOTE/`.  
Si ça repart : le diagnostic VPN / routes est confirmé.

## Pistes de remédiation (du plus propre au plus local)

1. **Split tunnel / exclusion** des plages Docker (`172.16.0.0/12`, éventuellement `10.0.0.0/8`) côté politique VPN — solution durable.
2. **Travailler sans VPN** quand seul le stack local est nécessaire.
3. **Rétablir les routes** vers les bridges Docker sur l'hôte (`ip route` vers `docker0` / `br-…`) — peut être écrasé si le client VPN resynchronise la table.
4. Contournements avancés (table de routage dédiée, `ip rule`, service qui réapplique les routes) : utiles en dernier recours sur un poste ; hors scope d'une config applicative Compose.

Ne pas « corriger » en modifiant le `docker-compose` de l'équipe pour masquer un souci de poste / VPN.

## Ce que ce n'est (souvent) pas

| Fausse piste | Pourquoi |
| --- | --- |
| Mauvaise image / crash app | Le service répond dans le conteneur |
| Oublier `ports:` | `docker ps` montrerait l'absence de mapping |
| Seulement le proxy HTTP | `curl --noproxy '*'` vers `127.0.0.1` timeout encore ; `ip route get 172.x` via VPN |
| Firewall navigateur seul | `curl` depuis le terminal échoue pareil |

## Lien avec le proxy

Configurer `NO_PROXY` (shell + Docker) reste une bonne pratique, mais **ne répare pas** une route `172.x → tun0`.  
Les deux problèmes peuvent coexister : traiter le routage VPN **et** le proxy.

## À retenir

- Port publié = `localhost` sur l'hôte **puis** jointure de l'**IP bridge** du conteneur.
- Un VPN **full tunnel** peut envoyer `172.x` dans le tunnel → `localhost:port` timeout alors que les conteneurs sont Up.
- Diagnostic clé : `ip route get <IP_conteneur>` doit montrer un **bridge Docker**, pas l'interface VPN.
- Remède propre : **split tunnel** / exclusion des plages Docker ; les rustines de routes sont locales et parfois temporaires.
- Ne pas confondre avec la config **proxy** Docker.

## Sources

- [Docker — Network drivers (bridge)](https://docs.docker.com/engine/network/drivers/bridge/)
- [Docker — Publish and expose ports](https://docs.docker.com/get-started/docker-concepts/running-containers/publishing-ports/)
- [Networking in Compose](https://docs.docker.com/compose/how-tos/networking/) — DNS et accès hôte vs conteneur
- Fiche liée : [Configurer le proxy HTTP avec Docker](/fiches/cloud_docker_proxy)
