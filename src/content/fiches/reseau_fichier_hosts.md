---
title: Le fichier hosts, résolution locale de noms de domaine
description: Configurer le fichier hosts sur Windows et Linux pour associer manuellement des adresses IP à des noms de domaine avant toute requête DNS.
technology: reseau
difficulty: debutant
tags: [reseau, dns, hosts, windows, linux, resolution-ip]
publishedAt: 2026-10-25
updatedAt: 2026-10-25
draft: false
quiz:
  - question: À quel moment le fichier hosts intervient-il dans la résolution d'un nom de domaine ?
    choices:
      - En priorité, avant toute interrogation des serveurs DNS externes
      - Uniquement si tous les serveurs DNS externes sont injoignables
      - Seulement lors de connexions à distance en SSH
    answer: 0
    explanation: Le système d'exploitation consulte son fichier hosts local avant d'émettre une requête vers les serveurs DNS de votre box ou réseau.
  - question: Quel est l'emplacement du fichier hosts sous Windows ?
    choices:
      - C:\Windows\System32\drivers\etc\hosts
      - C:\Windows\System32\config\hosts
      - C:\Program Files\Common Files\hosts
    answer: 0
    explanation: Sous Windows moderne, le fichier se trouve dans C:\Windows\System32\drivers\etc\ et n'a aucune extension de fichier.
  - question: Quelle condition est indispensable pour enregistrer les modifications du fichier hosts ?
    choices:
      - Ouvrir l'éditeur avec les droits Administrateur (Windows) ou sudo (Linux)
      - Redémarrer obligatoirement l'ordinateur après la sauvegarde
      - Enregistrer le fichier avec une extension .txt
    answer: 0
    explanation: Le fichier hosts étant un fichier système protégé, son écriture exige une élévation de privilèges (administrateur ou root), sans jamais lui ajouter d'extension .txt.
---

## Définition

Le fichier `hosts` est un fichier texte simple utilisé par le système d'exploitation pour associer manuellement des adresses IP à des noms de domaine ou d'hôtes.

Historiquement conçu avant l'apparition du système DNS (Domain Name System), il reste aujourd'hui le **premier mécanisme consulté** par le résolveur de votre machine : si une correspondance y est inscrite, le système utilise immédiatement l'adresse IP associée sans interroger les serveurs DNS d'Internet.

## Emplacements système

Le fichier n'a **aucune extension** (il s'appelle `hosts` et non `hosts.txt`) :

| Système d'exploitation | Chemin complet | Privilèges requis |
| --- | --- | --- |
| **Windows** | `C:\Windows\System32\drivers\etc\hosts` | Administrateur |
| **Linux** | `/etc/hosts` | `root` ou `sudo` |
| **macOS** | `/etc/hosts` (ou `/private/etc/hosts`) | `root` ou `sudo` |

## Syntaxe du fichier

Chaque ligne associe une adresse IP (IPv4 ou IPv6) à un ou plusieurs noms de domaine, séparés par des espaces ou des tabulations. Le caractère `#` introduit un commentaire :

```text
# Format : <Adresse IP>    <Nom d'hôte principal> [alias...]
127.0.0.1       localhost
::1             localhost

# Redirection locale pour le développement
127.0.0.1       mon-projet.local api.mon-projet.local

# Prévisualisation d'un serveur avant migration DNS publique
203.0.113.42    www.mon-site.com mon-site.com

# Blocage local d'un domaine indésirable
0.0.0.0         telemetrie.exemple.com
```

## Procédure de modification

### 1. Sur Windows

1. Dans le menu Démarrer, cherchez **Bloc-notes** (Notepad).
2. Faites un clic droit > **Exécuter en tant qu'administrateur**.
3. Menu **Fichier > Ouvrir**, collez le chemin `C:\Windows\System32\drivers\etc\`.
4. En bas à droite de la boîte de dialogue, sélectionnez **Tous les fichiers (*.*)** pour afficher le fichier `hosts`.
5. Ajoutez vos lignes, sauvegardez (`Ctrl+S`).

En ligne de commande PowerShell (avec privilèges élevés) :

```powershell
Start-Process notepad.exe "C:\Windows\System32\drivers\etc\hosts" -Verb runAs
```

Après modification, videz le cache DNS pour appliquer les changements sans redémarrer :

```powershell
ipconfig /flushdns
```

### 2. Sur Linux

Ouvrez un terminal et éditez le fichier avec votre éditeur favori sous `sudo` :

```bash
sudo nano /etc/hosts
```

Ajoutez vos correspondances, sauvegardez (`Ctrl+O`, `Entrée`, puis `Ctrl+X`).

Si votre distribution utilise `systemd-resolved`, videz le cache DNS local :

```bash
sudo systemd-resolve --flush-caches
# Ou sur les versions récentes :
sudo resolvectl flush-caches
```

## Cas d'usage fréquents

- **Développement web local** : attribuer des noms conviviaux comme `mon-app.test` ou `client.local` à une machine locale (`127.0.0.1`) ou une machine virtuelle sur le réseau local.
- **Recette avant bascule DNS** : tester un nouveau serveur d'hébergement avec le vrai nom de domaine de production avant de modifier les enregistrements DNS publics chez le registrar.
- **Blocage de domaines** : rediriger un domaine publicitaire ou de pistage vers `0.0.0.0` pour neutraliser ses requêtes sur la machine.

## Mots-clés

| Terme | Définition |
| --- | --- |
| `hosts` | Table statique locale de résolution de noms d'hôtes |
| `DNS` | Système distribué de résolution de noms sur Internet |
| `127.0.0.1` / `::1` | Adresse de bouclage local (localhost) |
| `0.0.0.0` | Adresse non routable couramment employée pour bloquer un domaine |
| `Flush DNS` | Purge du cache du résolveur DNS pour forcer une nouvelle lecture |

## Pièges et points de vigilance

- **Extension parasite `.txt` sous Windows** : si le Bloc-notes enregistre sous le nom `hosts.txt`, le système ignorera purement et simplement le fichier.
- **DNS over HTTPS (DoH) dans le navigateur** : certains navigateurs récents (Chrome, Firefox) activent le DoH par défaut, ce qui peut contourner le résolveur de l'OS et le fichier `hosts`. Si votre redirection ne réagit pas dans le navigateur, désactivez temporairement le DNS sécurisé dans ses paramètres.
- **Oubli après test** : pensez toujours à nettoyer ou commenter vos lignes une fois la phase de test ou de migration terminée, sous peine de ne plus joindre le vrai serveur public.

## À retenir

Le fichier `hosts` est le premier maillon de la résolution de noms sur votre machine. Situé dans `C:\Windows\System32\drivers\etc\hosts` (Windows) et `/etc/hosts` (Linux), il s'édite avec les privilèges Administrateur ou root, sans aucune extension. Pensez à vider le cache DNS (`ipconfig /flushdns`) pour constater immédiatement le résultat.

