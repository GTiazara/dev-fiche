---
title: "f5fpc : VPN F5 en ligne de commande et connexion facilitée"
description: "Démarrer, arrêter et inspecter une session f5fpc, puis automatiser hôte, identifiants ou certificats avec un script, secret-tool et éventuellement sudo sans mot de passe."
technology:
  - linux
  - reseau
difficulty: intermediaire
tags:
  - linux
  - f5fpc
  - vpn
  - f5
  - big-ip
  - secret-tool
  - certificat
publishedAt: 2026-11-25
updatedAt: 2026-11-25
draft: false
---

## Définition

**`f5fpc`** est le client en ligne de commande Linux d'**F5 Access Policy Manager (APM)** pour ouvrir un accès réseau (VPN SSL) vers un portail BIG-IP. Il ne mémorise **pas** par défaut l'URL, l'utilisateur ni le mot de passe : chaque connexion les redemande, sauf si vous automatisez autour de l'outil.

F5 documente aussi un accès **navigateur** (composant Network Access). Les versions récentes d'APM Clients modernisent le client Linux (ex. `f5vpn-ng`) : sur votre machine, vérifiez le binaire réellement installé (`which f5fpc`, `f5fpc -v`). Cette fiche décrit le CLI classique **`f5fpc`**.

Selon F5, le CLI Linux vise surtout une politique de logon **utilisateur / mot de passe** (sans inspections d'endpoint security). Les options certificat existent sur le binaire ; ce que votre entreprise autorise dépend de la politique APM.

Les commandes de connexion exigent en pratique les droits **root** (montage du tunnel PPP) : d'où `sudo f5fpc …`.

## Commandes de base

```bash
which f5fpc          # souvent /usr/local/bin/f5fpc
f5fpc -h             # aide
f5fpc -v             # version
```

| Action | Forme courte | Forme longue |
| --- | --- | --- |
| Démarrer | `f5fpc -s …` | `f5fpc --start …` |
| Arrêter | `f5fpc -o` | `f5fpc --stop` |
| État | `f5fpc -i` | `f5fpc --info` |

Le démarrage exige au minimum **`-t` / `--host`** :

```bash
sudo f5fpc -s -t https://vpn.exemple.com
```

### Arguments utiles au démarrage

| Option | Rôle |
| --- | --- |
| `-t` / `--host` | URL du serveur (`https://hôte[:port][/uri]`) — **obligatoire** |
| `-u` / `--user` | Nom d'utilisateur |
| `-p` / `--password` | Mot de passe (visible un instant dans la liste des processus) |
| `-r` / `--cert` | Certificat client |
| `-k` / `--key` | Clé privée du certificat client |
| `-y` / `--keypass` | Passphrase de la clé / du certificat SSL |
| `-a` / `--cacert` | CA de confiance pour le **serveur** |
| `-d` / `--cacertdir` | Répertoire de CA (à ne pas confondre avec une passphrase) |
| `-x` / `--nocheck` | Ne pas vérifier le certificat serveur (**déconseillé**) |
| `-b` / `--nonblock` | Retour immédiat ; suivre avec `-i` |

Sans `-a` / `-d`, la confiance serveur passe en général par `/etc/ssl/certs`.

```bash
# Utilisateur + mot de passe (exemple)
sudo f5fpc -s -t https://vpn.exemple.com -u alice -p '…'

# Puis vérifier
f5fpc -i

# Déconnexion
sudo f5fpc -o
```

**MFA / OTP** : ne pas passer `-p` si le portail attend mot de passe + code ; laisser le client demander l'auth de façon interactive, ou suivre la procédure de votre organisation (certificat, SSO web…).

## Faciliter la connexion : script + secret-tool

But : ne plus retaper l'URL ni l'identifiant ; récupérer le mot de passe dans le **trousseau** (`secret-tool`), pas dans le script.

### 1. Enregistrer le mot de passe une fois

```bash
secret-tool store --label='VPN F5' service f5-vpn username 'votre.identifiant'
```

Détail des attributs : fiche `secret-tool`.

### 2. Script `~/.local/bin/vpn-f5`

```bash
#!/bin/bash
set -euo pipefail

VPN_HOST="https://vpn.exemple.com"
VPN_USER="votre.identifiant"
F5FPC="$(command -v f5fpc)"

case "${1:-}" in
  start)
    VPN_PASS="$(secret-tool lookup service f5-vpn username "$VPN_USER")"
    sudo "$F5FPC" -s -t "$VPN_HOST" -u "$VPN_USER" -p "$VPN_PASS"
    sleep 3
    "$F5FPC" -i
    ;;
  stop)
    sudo "$F5FPC" -o
    ;;
  status)
    "$F5FPC" -i
    ;;
  *)
    echo "Usage: vpn-f5 {start|stop|status}" >&2
    exit 1
    ;;
esac
```

```bash
chmod +x ~/.local/bin/vpn-f5
# PATH doit inclure ~/.local/bin
```

Limite : `-p` expose encore le secret dans `ps` pendant l'appel. Sur un poste partagé, préférer l'invite interactive ou un certificat.

### 3. Alias shell

Dans `~/.bashrc` ou `~/.zshrc` :

```bash
alias vpn-on='vpn-f5 start'
alias vpn-off='vpn-f5 stop'
alias vpn-stat='vpn-f5 status'
```

Puis `source ~/.bashrc` (ou équivalent).

## Sudo sans retaper le mot de passe Linux

`f5fpc` a besoin de root pour le tunnel. Pour n'autoriser **que** ce binaire sans mot de passe sudo (à valider avec votre politique de sécurité) :

1. Chemin exact : `which f5fpc`
2. `sudo visudo`
3. Ligne du type (adapter utilisateur et chemin) :

```text
alice ALL=(ALL) NOPASSWD: /usr/local/bin/f5fpc
```

Éviter `NOPASSWD: ALL`. Toute personne pouvant lancer ce binaire sous votre compte hérite de ce droit restreint.

## Authentification par certificat client

Quand le portail accepte un certificat client (`.crt` / `.pem` + clé) :

### Protéger les fichiers

```bash
mkdir -p ~/.vpn-certs
# y placer certificat et clé privée
chmod 700 ~/.vpn-certs
chmod 600 ~/.vpn-certs/*
```

### Démarrage

```bash
sudo f5fpc -s -t https://vpn.exemple.com \
  -r "$HOME/.vpn-certs/client.cert" \
  -k "$HOME/.vpn-certs/client-key.pem"
```

Si un seul `.pem` contient certificat **et** clé, passez le **même chemin** à `-r` et `-k`. Ajoutez `-u` si l'utilisateur reste requis en plus du certificat.

### Clé chiffrée (passphrase)

La passphrase de clé se passe avec **`-y` / `--keypass`** (pas `-d`, qui désigne un répertoire de CA) :

```bash
secret-tool store --label='Passphrase clé F5' service f5-vpn-key username "$USER"

KEY_PASS="$(secret-tool lookup service f5-vpn-key username "$USER")"
sudo f5fpc -s -t https://vpn.exemple.com \
  -r "$HOME/.vpn-certs/client.pem" \
  -k "$HOME/.vpn-certs/client-key.pem" \
  -y "$KEY_PASS"
```

À intégrer dans le `start)` du script à la place de `-u` / `-p` selon votre politique.

## Alternative navigateur

Sans CLI : ouvrir l'URL du portail VPN dans Firefox/Chrome et utiliser le composant **Network Access** F5. Compatible SSO / MFA et coffre du navigateur. Sur Linux, le premier accès peut télécharger un composant client (droits admin souvent requis à l'install).

## Codes d'état fréquents (`f5fpc -i`)

F5 documente notamment (valeurs shell) : `0` succès, `80` déconnexion utilisateur, `81` échec de logon, `84` attention requise, `95` opération en cours — réessayer. Les états de session incluent login en cours, session établie, login refusé, etc. En cas de doute : `f5fpc -i` et les logs sous `~/.F5Networks` (emplacement documenté par F5 pour les composants Linux).

## À retenir

- `f5fpc -s -t URL` démarre ; `-o` arrête ; `-i` informe. Root souvent obligatoire.
- Automatiser avec un script + **`secret-tool`** (ou certificat `-r`/`-k`) ; MFA → éviter `-p` figé.
- Passphrase de clé = **`-y`** ; **`-d`** = répertoire de CA serveur.
- `NOPASSWD` sudo uniquement sur le chemin exact de `f5fpc`.
- Vérifier la doc / le paquet F5 de votre version (évolution possible vers d'autres clients Linux).

## Sources

- [Clients for Linux — BIG-IP APM Edge Client](https://techdocs.f5.com/en-us/edge-client-7-2-7/big-ip-access-policy-manager-edge-client-and-application-configuration-7-2-7/clients-for-linux.html) — commandes `f5fpc`, arguments, stop/info, codes d'erreur.
- [Overview: APM Clients](https://techdocs.f5.com/en-us/edge-client-7-2-7/big-ip-access-policy-manager-edge-client-and-application-configuration-7-2-7/overview-apm-clients.html) — CLI vs navigateur, limites du CLI.
- [BIG-IP APM Client Compatibility Matrix](https://techdocs.f5.com/kb/en-us/products/big-ip_apm/manuals/product/apm-clientcompatmatrix-21-1-0.html) — plateformes et évolution des paquets Linux.
- Aide locale : `f5fpc -h` (référence des flags du binaire installé).
- Fiche associée : `secret-tool` (trousseau libsecret).
