---
title: "SSH : se connecter avec une clé, sans retaper le mot de passe"
description: "Générer une paire de clés SSH (ed25519), installer la clé publique sur le serveur, et utiliser ssh-agent pour ne plus saisir le mot de passe du compte à chaque connexion."
technology: linux
difficulty: debutant
tags:
  - linux
  - ssh
  - ssh-keygen
  - securite
  - authentification
  - ssh-agent
publishedAt: 2026-11-24
updatedAt: 2026-11-24
draft: false
---

## Définition

**SSH** (*Secure Shell*) ouvre un terminal chiffré sur une machine distante. Par défaut, le serveur demande souvent le **mot de passe du compte** à chaque connexion.

L'**authentification par clé** remplace ce mot de passe serveur par une paire de fichiers :

| Fichier | Rôle | Où il reste |
| --- | --- | --- |
| Clé **privée** (ex. `~/.ssh/id_ed25519`) | Secret qui prouve votre identité | **Uniquement** sur votre machine (jamais envoyée, jamais versionnée) |
| Clé **publique** (ex. `~/.ssh/id_ed25519.pub`) | Empreinte autorisée à se connecter | Sur le serveur, dans `~/.ssh/authorized_keys` |

Vous générez la paire **en local**, vous déposez la **publique** sur le serveur, puis `ssh utilisateur@serveur` n'exige plus le mot de passe du compte distant.

Si la clé privée est protégée par une **passphrase**, le client peut encore la demander : `ssh-agent` la garde en mémoire pour la session, afin de ne pas la retaper à chaque `ssh` / `scp` / `git`.

## 1. Générer une paire de clés (machine locale)

Sur **votre** ordinateur (pas sur le serveur) :

```bash
ssh-keygen -t ed25519 -C "votre.email@exemple.com"
```

- `-t ed25519` : type recommandé (défaut d'OpenSSH récent si vous lancez `ssh-keygen` sans argument).
- `-C` : commentaire libre (souvent un e-mail) pour reconnaître la clé.

Anciens systèmes / serveurs sans ed25519 :

```bash
ssh-keygen -t rsa -b 4096 -C "votre.email@exemple.com"
```

Réponses typiques :

1. **Fichier** : Entrée pour garder `~/.ssh/id_ed25519` (ou un autre chemin si vous avez déjà une clé).
2. **Passphrase** : fortement conseillée. Ce n'est **pas** le mot de passe du serveur : elle chiffre la clé privée locale. Perdue = nouvelle clé à régénérer et à redéployer.

Résultat :

```text
~/.ssh/id_ed25519      # privée — permissions strictes
~/.ssh/id_ed25519.pub  # publique — celle que l'on copie
```

Vérifier :

```bash
ls -l ~/.ssh/id_ed25519*
# la privée doit être lisible seulement par vous (souvent -rw-------)
```

## 2. Installer la clé publique sur le serveur

Il faut encore pouvoir se connecter **une fois** avec le mot de passe du compte (ou une autre méthode déjà en place).

### Méthode recommandée : `ssh-copy-id`

```bash
ssh-copy-id utilisateur@adresse_du_serveur
# clé précise :
ssh-copy-id -i ~/.ssh/id_ed25519.pub utilisateur@adresse_du_serveur
# port non standard :
ssh-copy-id -p 2222 -i ~/.ssh/id_ed25519.pub utilisateur@adresse_du_serveur
```

La commande demande le **mot de passe du compte distant**, puis ajoute la ligne publique dans `~/.ssh/authorized_keys` côté serveur (en créant `~/.ssh` si besoin).

### Sans `ssh-copy-id`

```bash
cat ~/.ssh/id_ed25519.pub | ssh utilisateur@adresse_du_serveur \
  "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

### Permissions côté serveur (si la connexion par clé échoue)

Sur le serveur, pour le compte concerné :

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chown -R "$USER:$USER" ~/.ssh
```

OpenSSH refuse souvent les clés si le dossier ou `authorized_keys` est trop ouvert.

## 3. Se connecter

```bash
ssh utilisateur@adresse_du_serveur
```

- Plus de mot de passe **compte** si la clé est acceptée.
- Si vous avez mis une passphrase sur la clé : le client peut la demander pour **déverrouiller la clé privée** (ce n'est pas le mot de passe du serveur).

Tester en mode verbeux en cas de refus :

```bash
ssh -v utilisateur@adresse_du_serveur
```

Message fréquent `Permission denied (publickey)` : mauvaise clé, mauvais utilisateur, publique absente de `authorized_keys`, ou permissions trop larges.

## 4. Ne plus retaper la passphrase : ssh-agent

Pour éviter de saisir la passphrase à **chaque** connexion pendant la session :

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

- `ssh-agent` garde les clés déverrouillées en mémoire.
- `ssh-add` charge la privée (une fois la passphrase).
- Les `ssh` / `scp` / `rsync` / `git` suivants utilisent l'agent.

Sur beaucoup de bureaux Linux / macOS, un agent tourne déjà : `ssh-add -l` liste les clés chargées ; `ssh-add` sans chemin charge les identités par défaut.

Ne pas confondre :

| Demande | Qui la pose | Comment l'éviter au quotidien |
| --- | --- | --- |
| Mot de passe du **compte** distant | Serveur SSH | Clé publique dans `authorized_keys` |
| **Passphrase** de la clé privée | Client local | `ssh-agent` + `ssh-add` |

## 5. Raccourci : fichier `~/.ssh/config`

```text
Host mon-serveur
    HostName 203.0.113.10
    User utilisateur
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
```

Puis :

```bash
chmod 600 ~/.ssh/config
ssh mon-serveur
```

Utile avec plusieurs clés ou plusieurs hôtes (clusters, Git, VPS).

## 6. Option admin : couper l'auth par mot de passe

**Seulement** après avoir vérifié que la connexion par clé marche (garder une seconde session ouverte). Sur le serveur, dans `/etc/ssh/sshd_config` (ou un fichier sous `sshd_config.d/`) :

```text
PasswordAuthentication no
```

Puis recharger `sshd` selon la distribution. Une erreur de config peut vous **verrouiller** hors du serveur : à faire avec console de secours disponible.

## Erreurs fréquentes

| Symptôme | Cause | Action |
| --- | --- | --- |
| Toujours le mot de passe du compte | Publique pas sur le serveur / mauvais user | `ssh-copy-id` ; vérifier `authorized_keys` |
| `Permission denied (publickey)` | Permissions, mauvaise clé, `IdentitiesOnly` | `chmod` ; `ssh -i ~/.ssh/id_ed25519` ; `-v` |
| Passphrase à chaque `ssh` | Agent absent / clé non chargée | `ssh-agent` + `ssh-add` |
| Clé privée partagée / dans Git | Fuite d'identité | Révoquer (retirer la ligne de `authorized_keys`), régénérer |

## À retenir

- Paire **ed25519** en local : privée secrète, publique sur le serveur.
- Installer avec **`ssh-copy-id`** (ou append manuel dans `authorized_keys`).
- Permissions : `~/.ssh` → `700`, clé privée et `authorized_keys` → `600`.
- Plus de mot de passe **compte** ; passphrase de clé allégée avec **`ssh-agent`** / **`ssh-add`**.
- Ne jamais publier ni copier la clé **privée**.

## Sources

- [DigitalOcean — SSH key-based authentication on a Linux server](https://www.digitalocean.com/community/tutorials/how-to-configure-ssh-key-based-authentication-on-a-linux-server) — parcours générer / copier / (option) couper le mot de passe.
- [DigitalOcean — Create SSH keys with OpenSSH](https://docs.digitalocean.com/products/droplets/how-to/add-ssh-keys/create-with-openssh/) — emplacements `id_ed25519`.
- [DigitalOcean — Upload a public key to an existing Droplet](https://docs.digitalocean.com/products/droplets/how-to/add-ssh-keys/to-existing-droplet/) — `ssh-copy-id`, pipe, permissions.
- [DigitalOcean — Troubleshoot SSH authentication](https://docs.digitalocean.com/support/how-to-troubleshoot-ssh-authentication-issues/) — `Permission denied`, `chmod`.
- [ssh-keygen(1)](https://man7.org/linux/man-pages/man1/ssh-keygen.1.html) — types de clés, passphrase.
- [ssh-copy-id(1)](https://man7.org/linux/man-pages/man1/ssh-copy-id.1.html) — installation de la publique.
- [OpenSSH manuals](https://www.openssh.org/manual.html) — `ssh`, `ssh-agent`, `ssh-add`, `ssh_config`.
