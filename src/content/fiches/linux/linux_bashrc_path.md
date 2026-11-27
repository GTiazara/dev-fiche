---
title: ".bashrc, PATH et binaires utilisateur (~/.local/bin, ~/bin)"
description: "Configurer Bash (aliases, options) et placer ses scripts dans ~/.local/bin ou ~/bin pour les lancer comme des commandes normales."
technology: linux
difficulty: debutant
tags:
  - linux
  - bash
  - bashrc
  - path
  - local-bin
  - shell
publishedAt: 2026-11-27
updatedAt: 2026-11-27
draft: false
---

## Définition

Quand vous ouvrez un terminal Bash, le shell lit des fichiers de démarrage. Le plus utile au quotidien est **`~/.bashrc`** : aliases, fonctions, options d'historique, invitation (`PS1`).

Pour lancer un **script perso** sans écrire le chemin complet, on le place dans un dossier listé dans la variable **`PATH`**. Deux emplacements classiques chez l'utilisateur :

| Dossier | Rôle | Origine |
| --- | --- | --- |
| `~/.local/bin` | Exécutables **utilisateur** recommandés | [XDG Base Directory](https://specifications.freedesktop.org/basedir-spec/latest/) : les distros doivent l'ajouter au `PATH` |
| `~/bin` | Binaires privés « historiques » | Souvent ajouté aussi via `~/.profile` (ex. squelette Debian / Ubuntu) |

`/usr/bin`, `/usr/local/bin` : logiciels installés pour **tout** le système (souvent avec `sudo`). Les dossiers sous `$HOME` n'exigent pas les droits root.

## Quels fichiers Bash lit au démarrage

D'après le manuel Bash :

| Type de shell | Fichiers lus (ordre simplifié) |
| --- | --- |
| **Login** interactif (ex. session SSH, console) | `/etc/profile`, puis le **premier** trouvé parmi `~/.bash_profile`, `~/.bash_login`, `~/.profile` |
| **Non-login** interactif (ex. nouvel onglet de terminal) | `/etc/bash.bashrc` (selon distro), puis **`~/.bashrc`** |
| Script non interactif | En général **pas** de `.bashrc` (sauf `BASH_ENV`) |

Sur Debian / Ubuntu, le `~/.profile` du squelette **appelle** `~/.bashrc` si Bash tourne, puis ajoute `~/bin` et `~/.local/bin` au `PATH` s'ils existent. D'où la règle pratique :

- **`~/.bashrc`** : réglages **Bash** (aliases, `shopt`, fonctions, couleurs).
- **`~/.profile`** (ou `~/.bash_profile`) : variables d'environnement pour la session de login, dont le **`PATH`**.

Éviter de dupliquer le `PATH` dans `.bashrc` si `.profile` le fait déjà — sauf si votre terminal n'est jamais un login shell et que `~/.local/bin` n'apparaît pas dans `echo $PATH`.

## Utiliser ~/.local/bin (recommandé)

1. Créer le dossier (une fois) :

```bash
mkdir -p ~/.local/bin
```

2. Y mettre un script exécutable :

```bash
cat > ~/.local/bin/bonjour << 'EOF'
#!/usr/bin/env bash
echo "Bonjour, $USER"
EOF
chmod +x ~/.local/bin/bonjour
```

3. Vérifier qu'il est dans le `PATH`, puis l'appeler par son nom :

```bash
echo "$PATH" | tr ':' '\n' | grep -E 'local/bin|/bin$'
# Si ~/.local/bin manque : ouvrir une nouvelle session login, ou l'ajouter (voir plus bas)
which bonjour    # doit afficher .../.local/bin/bonjour
bonjour
```

Outils pip (`pip install --user`), certaines installs cargo / npm « user », et scripts maison atterrissent souvent ici. C'est l'emplacement **standard XDG** pour les exécutables utilisateur.

## Utiliser ~/bin

Même idée, dossier plus ancien encore présent dans beaucoup de `~/.profile` :

```bash
mkdir -p ~/bin
# y copier ou lier un script, chmod +x
```

Choisir **un** dossier principal pour éviter deux copies du même outil. Préférer `~/.local/bin` pour coller à XDG ; garder `~/bin` si vos habitudes ou scripts existants y sont déjà.

Ordre dans le `PATH` : le **premier** dossier qui contient la commande gagne. Avec le squelette Ubuntu typique, `~/bin` est ajouté **avant** `~/.local/bin` — un `bonjour` dans `~/bin` masque celui de `~/.local/bin`.

## Ajouter un dossier au PATH soi-même

Si `which mon-outil` échoue alors que le fichier est exécutable :

```bash
# Dans ~/.profile (login) — pattern proche du squelette Debian/Ubuntu
if [ -d "$HOME/.local/bin" ] ; then
  PATH="$HOME/.local/bin:$PATH"
fi
```

Puis se reconnecter, ou :

```bash
source ~/.profile    # dans un shell login / avec prudence
# ou seulement pour le terminal courant :
export PATH="$HOME/.local/bin:$PATH"
```

Ne mettez **pas** `.` (le répertoire courant) en tête du `PATH` : risque de lancer un faux binaire posé dans un dossier téléchargé.

## Exemples utiles dans ~/.bashrc

Le fichier commence souvent par un garde-fou : ne rien faire si le shell n'est pas interactif (`case $- in *i*) …`). Ensuite, typiquement :

```bash
# Aliases
alias ll='ls -alF'
alias gs='git status -sb'

# Historique (compléments possibles : fiche history)
HISTCONTROL=ignoreboth
shopt -s histappend

# Fonction courte
mkcd() { mkdir -p -- "$1" && cd -- "$1"; }
```

Recharger sans fermer le terminal :

```bash
source ~/.bashrc
# équivalent : . ~/.bashrc
```

Laisser les exports lourds (`PATH`, `EDITOR`, clés d'API) plutôt dans `.profile` / un fichier dédié sourcé une fois à la connexion, pour que les applications graphiques lancées hors terminal les voient aussi — selon comment la session de bureau est démarrée.

## Vérifications et pièges

| Symptôme | Piste |
| --- | --- |
| `command not found` pour un script perso | Pas dans le `PATH`, ou pas `chmod +x`, ou shebang manquant (`#!/usr/bin/env bash`) |
| `which` OK dans un terminal, échec dans un autre | L'un est login (a lu `.profile`), l'autre non |
| Cron / systemd ne trouve pas la commande | Ils n'utilisent en général **pas** votre `.bashrc` : chemin absolu dans le job |
| Deux versions d'un outil | Regarder `type -a nom` : ordre = priorité dans le `PATH` |

## À retenir

- `~/.bashrc` : config interactive Bash ; `source ~/.bashrc` après une modification.
- `~/.profile` / login : bon endroit pour enrichir le **`PATH`**.
- `~/.local/bin` : emplacement XDG pour vos exécutables ; `~/bin` : variante classique encore branchée par beaucoup de distros.
- Script utilisable partout : dossier dans le `PATH` + `chmod +x` + shebang.
- Cron et services : chemin absolu, pas d'hypothèse sur `.bashrc`.

## Sources

- [Bash Startup Files — GNU Bash](https://www.gnu.org/software/bash/manual/html_node/Bash-Startup-Files.html) (manuel ; voir aussi `man bash`, section *INVOCATION*)
- [XDG Base Directory Specification](https://specifications.freedesktop.org/basedir-spec/latest/) — `$HOME/.local/bin` et le `PATH`
- Squelette Debian / Ubuntu : `/etc/skel/.profile` (ajoute `~/bin` et `~/.local/bin` au `PATH` s'ils existent)
- [Shell Startup — NERSC](https://docs.nersc.gov/environment/shell_startup/) — tableau login / non-login
