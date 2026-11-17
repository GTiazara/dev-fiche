---
title: "Les formats d'applications Linux : deb, rpm, AppImage, Snap, Flatpak, tar.gz"
description: "Reconnaître les formats de paquets et d'applications sous Linux, comprendre leurs différences et savoir installer, lancer et désinstaller chacun."
technology: linux
difficulty: debutant
tags:
  - linux
  - deb
  - rpm
  - appimage
  - snap
  - flatpak
  - apt
  - installation
publishedAt: 2026-11-17
updatedAt: 2026-11-17
draft: false
quiz:
  - question: "Vous téléchargez un fichier .deb sur Ubuntu. Quelle commande l'installe en récupérant aussi ses dépendances ?"
    choices:
      - "sudo dpkg -i fichier.deb"
      - "sudo apt install ./fichier.deb"
      - "chmod +x fichier.deb"
    answer: 1
    explanation: "apt résout et installe les dépendances manquantes. dpkg -i installe seulement le fichier et s'arrête sur une dépendance absente. Le ./ indique à apt un fichier local, pas un nom de dépôt."
  - question: "Un fichier .rpm convient à quelle famille de distributions ?"
    choices:
      - "Debian, Ubuntu et Linux Mint"
      - "Fedora, Red Hat, Rocky Linux et openSUSE"
      - "Toutes les distributions sans exception"
    answer: 1
    explanation: "Le format rpm vient de Red Hat. Il est utilisé par Fedora, RHEL et ses dérivés, et openSUSE. Debian et Ubuntu utilisent le format deb."
  - question: "Que faut-il faire pour lancer un fichier .AppImage téléchargé ?"
    choices:
      - "Le rendre exécutable avec chmod +x, puis le lancer avec ./"
      - "Le décompresser avec tar -xzf"
      - "L'installer avec sudo apt install"
    answer: 0
    explanation: "Un AppImage est un fichier unique qui s'exécute directement, sans installation ni droits administrateur. Il faut d'abord lui donner le droit d'exécution."
  - question: "Que faire quand un AppImage affiche l'erreur « libfuse.so.2 » manquante sur Ubuntu ?"
    choices:
      - "Installer le paquet libfuse2 (libfuse2t64 sur Ubuntu 24.04)"
      - "Renommer le fichier en .deb"
      - "Désinstaller snap"
    answer: 0
    explanation: "Les AppImage ont besoin de FUSE version 2 pour se monter. Les Ubuntu récentes embarquent FUSE 3 par défaut : il faut ajouter libfuse2, nommé libfuse2t64 depuis Ubuntu 24.04."
  - question: "Quelle différence principale entre un paquet deb et un Flatpak ?"
    choices:
      - "Le deb est isolé du système, le Flatpak ne l'est pas"
      - "Le deb s'intègre au système et partage ses bibliothèques, le Flatpak embarque son environnement et s'exécute dans un bac à sable"
      - "Aucune : ce sont deux noms du même format"
    answer: 1
    explanation: "Un deb s'appuie sur les bibliothèques du système et s'installe pour tous les utilisateurs. Un Flatpak utilise ses propres runtimes et est isolé, ce qui le rend indépendant de la distribution."
---

## Définition

Sous Windows, on lance presque toujours un `.exe`. Sous Linux, il n'y a pas un seul format : chaque famille de distributions a le sien, et d'autres formats fonctionnent partout. Cette fiche aide à **reconnaître le fichier que l'on a sous la main**, à comprendre ce qu'il implique et à l'installer.

On distingue deux idées :

- Un **paquet de distribution** (`.deb`, `.rpm`) s'intègre au système : il installe ses fichiers aux endroits habituels et s'appuie sur les bibliothèques déjà présentes, appelées **dépendances**.
- Un **format universel** (AppImage, Snap, Flatpak) emporte ce qu'il lui faut avec lui et fonctionne sur plusieurs distributions.

## Vue d'ensemble

| Format | Extension | Distributions | Dépendances | Mises à jour | Isolation |
| --- | --- | --- | --- | --- | --- |
| deb | `.deb` | Debian, Ubuntu, Linux Mint | Celles du système, gérées par `apt` | Par `apt` si un dépôt est configuré | Non |
| rpm | `.rpm` | Fedora, RHEL, Rocky, AlmaLinux, openSUSE | Celles du système, gérées par `dnf` ou `zypper` | Par `dnf` ou `zypper` si un dépôt est configuré | Non |
| AppImage | `.AppImage` | Toutes ou presque | Surtout embarquées dans le fichier | À la main, sauf outil dédié | Non |
| Snap | `.snap`, via le Snap Store | Ubuntu en natif, autres avec `snapd` | Embarquées | Automatiques | Oui |
| Flatpak | `.flatpak`, via Flathub | Toutes, avec `flatpak` | Runtimes partagés entre applications | Par `flatpak update` | Oui |
| Archive | `.tar.gz`, `.tar.xz`, `.zip` | Toutes | Selon le contenu | À la main | Non |
| Script | `.sh`, `.run` | Toutes | Selon le script | À la main | Non |

## Avant de commencer

Trois vérifications évitent la plupart des échecs.

**Quelle distribution ?** Elle détermine le format natif.

```bash
cat /etc/os-release
```

La ligne `ID=ubuntu` ou `ID=fedora` indique la famille. `ID_LIKE` renseigne la parenté (par exemple `debian` pour Linux Mint).

**Quelle architecture ?** Un paquet `amd64` ne tourne pas sur un processeur ARM.

```bash
uname -m              # x86_64 (équivaut à amd64) ou aarch64 (équivaut à arm64)
dpkg --print-architecture   # Debian et Ubuntu seulement
```

**Le fichier est-il intact ?** Quand le site publie une somme de contrôle, comparez-la.

```bash
sha256sum fichier.AppImage
```

Le résultat doit être identique à celui publié par l'éditeur. Sinon, le téléchargement est corrompu ou le fichier a été modifié.

## .deb : Debian, Ubuntu, Linux Mint

Un **.deb** est le paquet de la famille Debian. Il contient les fichiers du programme et la liste de ses dépendances. Il s'installe pour tous les utilisateurs, avec les droits administrateur.

### Installer

```bash
sudo apt install ./fichier.deb
```

Le `./` indique à `apt` un fichier local. `apt` installe aussi les dépendances manquantes depuis les dépôts.

La commande de bas niveau `dpkg` existe aussi :

```bash
sudo dpkg -i fichier.deb
```

Elle **n'installe pas** les dépendances manquantes et s'arrête sur une erreur. On la répare avec :

```bash
sudo apt --fix-broken install
```

### Inspecter avant d'installer

```bash
dpkg -I fichier.deb   # nom, version, architecture, dépendances
dpkg -c fichier.deb   # liste des fichiers qui seront installés
```

### Gérer un paquet installé

```bash
dpkg -l | grep nom       # le paquet est-il installé ?
dpkg -L nom              # quels fichiers a-t-il installés ?
sudo apt remove nom      # désinstaller en gardant la configuration
sudo apt purge nom       # désinstaller et supprimer la configuration
```

Beaucoup d'éditeurs (navigateurs, éditeurs de code) ajoutent leur propre dépôt à l'installation du `.deb`. Les mises à jour passent alors par `sudo apt update && sudo apt upgrade`, comme les autres paquets.

## .rpm : Fedora, Red Hat, openSUSE

Un **.rpm** est l'équivalent du deb pour Fedora, RHEL, Rocky Linux, AlmaLinux, CentOS Stream et openSUSE.

### Installer

```bash
# Fedora, RHEL, Rocky, AlmaLinux
sudo dnf install ./fichier.rpm

# openSUSE
sudo zypper install ./fichier.rpm
```

Comme `apt`, ces outils installent aussi les dépendances. La commande de bas niveau `rpm -i` ne le fait pas.

### Inspecter, désinstaller

```bash
rpm -qip fichier.rpm     # informations sur le fichier
rpm -qlp fichier.rpm     # fichiers qu'il contient
sudo dnf remove nom      # désinstaller (zypper remove nom sur openSUSE)
```

## AppImage : un fichier, aucune installation

Un **AppImage** est une application complète dans **un seul fichier**. Il ne s'installe pas : on le rend exécutable puis on le lance. Il peut donc être gardé sur une clé USB et tourne sur la plupart des distributions.

### Lancer

```bash
chmod +x MonApp.AppImage    # donner le droit d'exécution, une seule fois
./MonApp.AppImage           # lancer l'application
```

Le plus simple est de ranger le fichier dans un dossier dédié, par exemple `~/Applications`.

### L'erreur FUSE

Un AppImage a besoin de **FUSE version 2**. Les Ubuntu récentes n'embarquent que la version 3, d'où l'erreur `libfuse.so.2` manquante. Installer la bibliothèque :

```bash
# Ubuntu 22.04
sudo apt install libfuse2

# Ubuntu 24.04 : le paquet a été renommé
sudo apt install libfuse2t64
```

Sans droits ou sans FUSE, on peut quand même lancer l'application :

```bash
./MonApp.AppImage --appimage-extract-and-run   # décompresse dans un dossier temporaire, lance, puis nettoie
./MonApp.AppImage --appimage-extract           # décompresse dans le dossier squashfs-root
```

### Limites

- Pas d'icône dans le menu des applications par défaut. Un outil comme AppImageLauncher ou un fichier `.desktop` écrit à la main l'ajoute.
- Pas de mise à jour automatique en général : il faut télécharger la nouvelle version.
- Pas d'isolation : l'application a les mêmes droits que vous.
- Désinstaller revient à **supprimer le fichier**.

## Snap : le format de Canonical

Un **Snap** est un paquet autonome distribué par le **Snap Store** et géré par le service `snapd`. Il est préinstallé sur Ubuntu. Il s'exécute dans un bac à sable et se met à jour **automatiquement**.

```bash
snap find vlc                 # chercher une application
sudo snap install vlc         # installer
snap list                     # applications Snap installées
sudo snap remove vlc          # désinstaller
```

Certaines applications ont besoin d'un accès complet au système, comme les éditeurs de code. Elles demandent le mode **classic** :

```bash
sudo snap install code --classic
```

Pour un fichier `.snap` téléchargé hors du Store, il faut préciser qu'on n'a pas vérifié sa signature :

```bash
sudo snap install ./fichier.snap --dangerous
```

Sur une autre distribution, installer d'abord `snapd` avec le gestionnaire de paquets de la distribution.

## Flatpak : le format communautaire

Un **Flatpak** s'exécute lui aussi dans un bac à sable. Il s'appuie sur des **runtimes** partagés entre applications, ce qui limite la duplication. Le dépôt de référence est **Flathub**. Flatpak est préinstallé sur Fedora et proposé par la plupart des distributions.

### Mettre en place Flatpak

```bash
# Debian, Ubuntu
sudo apt install flatpak

# Fedora : déjà installé

# Ajouter le dépôt Flathub, une seule fois
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
```

Un redémarrage de session est conseillé ensuite, pour que les icônes apparaissent dans le menu des applications.

### Installer et utiliser

```bash
flatpak install flathub org.videolan.VLC    # installer par son identifiant
flatpak run org.videolan.VLC                # lancer
flatpak list                                # applications installées
flatpak update                              # tout mettre à jour
flatpak uninstall org.videolan.VLC          # désinstaller
```

L'identifiant d'une application est écrit sur sa page de [Flathub](https://flathub.org/). Pour un fichier `.flatpak` local :

```bash
flatpak install ./fichier.flatpak
```

## Archives et scripts

Quand l'éditeur ne propose ni paquet ni format universel, il reste une **archive** (`.tar.gz`, `.tar.xz`) ou un **script** (`.sh`, `.run`).

### Archive

```bash
tar -xzf fichier.tar.gz      # .tar.gz
tar -xJf fichier.tar.xz      # .tar.xz
```

Selon le contenu, deux cas :

1. L'archive contient un **programme déjà compilé** : on le lance depuis le dossier décompressé. Pour le garder, le ranger dans `/opt` ou dans `~/.local`.
2. L'archive contient du **code source** : il faut le compiler. Lire d'abord le fichier `README` ou `INSTALL`, car les étapes varient. Une forme courante est :

```bash
./configure --prefix=$HOME/.local
make
make install
```

Le préfixe `$HOME/.local` installe dans votre dossier personnel, sans droits administrateur, et rend la suppression plus simple. Aucun gestionnaire de paquets ne suit ces installations.

### Script

```bash
less installateur.sh          # lire le script avant de l'exécuter
chmod +x installateur.sh
./installateur.sh
```

Un script `.run` ou `.sh` s'exécute avec vos droits, voire ceux de l'administrateur : **lisez-le avant**, ou n'utilisez qu'un fichier de l'éditeur officiel.

## Quel format choisir ?

Dans l'ordre :

1. **Le dépôt de la distribution** : `sudo apt install nom` ou `sudo dnf install nom`. C'est le plus sûr, le mieux intégré, et les mises à jour sont automatiques.
2. **Le paquet natif de l'éditeur** (`.deb` ou `.rpm`), si le logiciel n'est pas dans le dépôt ou s'il y est trop ancien.
3. **Flatpak ou Snap**, pour une application récente avec isolation et mises à jour automatiques, quelle que soit la distribution.
4. **Un AppImage**, pour essayer un logiciel sans l'installer, ou pour une machine où l'on n'a pas les droits administrateur.
5. **Une archive ou un script**, en dernier recours.

## Bonnes pratiques

- **Télécharger depuis le site officiel** de l'éditeur ou depuis le dépôt de la distribution.
- **Vérifier la somme de contrôle** quand elle est publiée.
- **Ne pas mélanger les formats** pour un même logiciel : un `.deb` et un Flatpak de la même application peuvent entrer en conflit.
- **Ne pas lancer en `sudo`** un fichier dont on ne connaît pas l'origine.
- **Garder une trace** de ce que l'on a installé hors du gestionnaire de paquets (archives, AppImage), car il ne les met pas à jour.

## À retenir

- **deb** pour Debian, Ubuntu et Mint : `sudo apt install ./fichier.deb`. **rpm** pour Fedora, RHEL et openSUSE : `sudo dnf install ./fichier.rpm`.
- `apt` et `dnf` installent aussi les **dépendances** ; `dpkg -i` et `rpm -i` non.
- **AppImage** : un fichier sans installation. `chmod +x`, puis `./fichier`. Il demande `libfuse2` (`libfuse2t64` sur Ubuntu 24.04).
- **Snap** et **Flatpak** : applications isolées, mises à jour par leur outil, utilisables sur plusieurs distributions.
- **Archive** ou **script** : dernier recours. Lire le `README` ou le script avant d'exécuter.
- Vérifier la distribution (`cat /etc/os-release`) et l'architecture (`uname -m`) avant de télécharger.
- Préférer le dépôt de la distribution, puis le paquet natif, puis Flatpak ou Snap.

## Sources

Les commandes sont tirées de la documentation [AppImage sur FUSE](https://docs.appimage.org/user-guide/troubleshooting/fuse.html) et de la documentation officielle de `apt`, `dnf`, `snap` et [Flatpak](https://flatpak.org/setup/).
