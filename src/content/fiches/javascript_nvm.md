---
title: Gérer Node.js et npm avec nvm
description: Installer nvm, changer de version de Node.js, fixer la version d'un projet avec .nvmrc, mettre à jour Node, nvm et npm sans sudo.
technology: javascript
difficulty: intermediaire
tags: [node, nvm, npm, versions, terminal, outillage]
publishedAt: 2026-11-15
updatedAt: 2026-11-15
draft: false
quiz:
  - question: Après nvm use 22, quelle est la portée du changement ?
    choices:
      - Le terminal courant seulement
      - Tous les terminaux déjà ouverts
      - Tous les projets de la machine
    answer: 0
    explanation: nvm modifie le PATH de la session courante, et un nouveau terminal repart sur l'alias default. nvm-windows, lui, applique un défaut global, que .nvmrc peut remplacer.
  - question: À quoi sert le fichier .nvmrc à la racine d'un projet ?
    choices:
      - Il indique la version de Node attendue, que nvm use lit sans argument
      - Il liste les dépendances npm du projet
      - Il remplace le package.json
    answer: 0
    explanation: nvm use et nvm install sans argument remontent l'arborescence jusqu'à trouver .nvmrc. Le fichier se versionne avec le projet.
  - question: Quelle commande installe la dernière version de npm compatible avec le Node actif ?
    choices:
      - nvm install-latest-npm
      - npm install -g npm@next
      - nvm upgrade-npm
    answer: 0
    explanation: nvm install-latest-npm choisit la version de npm prévue pour le Node courant. npm install -g npm@latest peut installer une npm trop récente.
  - question: nvm install 24 installe une nouvelle version. Que se passe-t-il dans un terminal neuf ?
    choices:
      - Il utilise l'alias default, qui n'a pas changé
      - Il utilise automatiquement 24
      - Il n'a plus de Node du tout
    answer: 0
    explanation: L'installation ne modifie pas l'alias default. Il faut lancer nvm alias default 24 pour que les nouveaux shells démarrent sur cette version.
  - question: Pourquoi npm install -g ne demande-t-il pas sudo avec nvm ?
    choices:
      - npm écrit dans le dossier de l'utilisateur, ajouté au PATH par nvm
      - nvm élève automatiquement les droits
      - npm installe tout dans le cache du projet
    answer: 0
    explanation: Avec nvm, Node et les paquets globaux vivent dans ~/.nvm. Un sudo y écrirait des fichiers appartenant à root et casserait les installations suivantes.
---

## Définition

**nvm** (*Node Version Manager*) installe plusieurs versions de **Node.js** côte à côte et choisit celle qu'utilise le terminal. Node.js est le programme qui exécute du JavaScript hors du navigateur ; **npm** est son gestionnaire de paquets et il est livré avec chaque version de Node.

| Élément | Rôle |
| --- | --- |
| `node` | Exécute un fichier JavaScript ou un outil écrit en JavaScript |
| `npm` | Installe les dépendances d'un projet et lance ses scripts |
| `nvm` | Installe les versions de Node et bascule de l'une à l'autre |

nvm est un **script de shell**, pas un binaire : il n'existe que dans la session où il a été chargé. Il s'installe pour un utilisateur, sans droits administrateur, et range tout dans `~/.nvm`. Sous Windows, le projet distinct **nvm-windows** fonctionne autrement ; il est présenté plus bas.

Pourquoi plusieurs versions ? Un vieux projet tourne sur Node 18, un nouveau demande Node 24, et un correctif de sécurité arrive sur la version 22. Sans gestionnaire, on désinstalle et réinstalle Node à la main, en cassant un projet à chaque fois. nvm garde les trois versions installées et change le `PATH` en une commande.

```bash
nvm install 24
nvm use 22
node --version   # v22.x.x
```

Installer une version installe aussi la version de npm qui l'accompagne. npm ne s'installe pas à part.

## Installer nvm

Sur Linux, macOS et WSL, l'installation se fait avec le script officiel :

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.41.0/install.sh | bash
```

La version du lien (`v0.41.0`) est celle du moment où cette fiche est écrite. Remplacer le numéro par la dernière version publiée sur GitHub évite d'installer une version ancienne. Le script clone nvm dans `~/.nvm` et ajoute ces lignes au fichier de profil du shell (`~/.bashrc`, `~/.zshrc` ou `~/.profile`) :

```bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

Vérifier ensuite dans un **nouveau** terminal :

```bash
command -v nvm
nvm --version
```

`command -v nvm` doit afficher `nvm`. `which nvm` peut échouer : nvm est une fonction du shell, pas un fichier exécutable. Si la commande n'est pas trouvée, recharger le profil (`source ~/.bashrc`) ou rouvrir le terminal.

Sur Windows, ne pas lancer ce script dans PowerShell : `curl` y est un alias d'`Invoke-WebRequest` et le script n'est pas du PowerShell. Utiliser WSL, Git Bash ou Cygwin, ou passer par **nvm-windows** décrit plus bas.

## Windows : nvm-windows (v2)

nvm ne fonctionne pas nativement sous Windows. Un projet distinct, **nvm-windows**, rend le même service avec ses propres commandes. Depuis sa version 2, l'outil a changé de modèle : ne pas mélanger les commandes des tutoriels v1 avec celles de la v2. Vérifier la version avec `nvm --version`.

```powershell
winget install AuthorSoftware.NVMWindows
nvm --version
nvm install lts
nvm use lts
nvm default
```

L'identifiant `CoreyButler.NVMforWindows`, proposé par d'anciens tutoriels, installe la branche 1.x. Pour la v2, l'identifiant est `AuthorSoftware.NVMWindows`.

| Besoin | nvm (Linux, macOS, WSL) | nvm-windows v2 |
| --- | --- | --- |
| Installer | script `curl` | installateur ou `winget` |
| Dernière LTS | `nvm install --lts` | `nvm install lts` |
| Dernière stable | `nvm install node` | `nvm install latest` |
| Activer une version | `nvm use 22` | `nvm use 22`, `nvm use lts` |
| Voir la version par défaut | `nvm current` | `nvm default` |
| Versions installées | `nvm ls` | `nvm list` |
| Versions disponibles | `nvm ls-remote` | `nvm list releases` |
| Version du projet | `.nvmrc` lu par `nvm use` | `.nvmrc` lu automatiquement (mode shim), écrit par `nvm pin` |
| Droits | utilisateur | aucun droit particulier |

Trois points qui diffèrent vraiment :

- **Aucun terminal administrateur n'est nécessaire.** La v2 fonctionne par défaut en **mode shim** : un petit exécutable relais lit la version voulue et lance le bon `node.exe`. Le mode `link`, plus direct, utilise une jonction NTFS ; il ne demande des droits supplémentaires que si le stockage est sur un partage réseau.
- **Le choix est global et persistant.** `nvm use 22` règle la version par défaut de l'utilisateur, pour tous les terminaux et après redémarrage. En mode shim, un `.nvmrc` ou un `.node-version` peut la remplacer dans un dossier donné.
- **Le `.nvmrc` est lu nativement** en mode shim, et `nvm pin 22` l'écrit. `nvm pin 22 --install` installe aussi la version si elle manque.

Les paquets globaux restent propres à chaque version. Pour les récupérer en installant une nouvelle version :

```powershell
nvm install 24 --copy-from=22
```

Autres commandes utiles de la v2 :

```powershell
nvm list              # versions installées
nvm list releases     # versions téléchargeables
nvm alias add travail 22
nvm alias list
nvm env               # chemins et configuration
nvm upgrade           # met à jour nvm-windows
nvm doctor            # détecte un PATH ou un lien cassé
```

`nvm upgrade` remplace la réinstallation manuelle de l'installateur. `nvm doctor` sert quand `nvm use` semble sans effet : il détecte un Node officiel resté dans le `PATH` ou un lien cassé.

Sous nvm-windows 1.x, les commandes sont différentes : `nvm list available`, `nvm current`, `nvm root`, et l'outil demande un terminal administrateur. Un tutoriel qui mélange ces commandes avec `nvm install --lts` décrit la 1.x, pas la v2.

Le reste de cette fiche utilise les commandes de nvm (Linux, macOS, WSL).

## Installer et changer de version

```bash
# Lister les versions installées, avec la version active et l'alias default
nvm ls

# Voir les versions disponibles au téléchargement
nvm ls-remote --lts

# Installer la dernière LTS, ou une version précise
nvm install --lts
nvm install 22

# Installer la dernière version stable, pas forcément LTS
nvm install node

# Afficher et changer la version active
nvm current
nvm use 22

# Vérifier que node et npm suivent
node --version
npm --version
```

`nvm install 22` installe la dernière 22.x disponible, pas exactement la 22.0.0. Les versions installées cohabitent dans `~/.nvm/versions/node/`, et `nvm use` pointe le `PATH` vers l'une d'elles.

`nvm ls` affiche aussi les alias. `default` est la version utilisée par un terminal neuf :

```bash
nvm alias default 22
nvm alias default 'lts/*'
```

Sans alias `default`, c'est la première version installée qui sert de version par défaut.

Pour lancer une commande avec une autre version sans changer la session :

```bash
nvm exec 20 node --version
nvm run 20 script.js
```

`nvm which 22` donne le chemin de l'exécutable, utile quand un éditeur ou un script ne trouve pas le bon `node`.

Une version installée peut être retirée, à condition de ne pas être celle du terminal courant :

```bash
nvm use 22
nvm uninstall 20
```

## Fixer la version d'un projet avec `.nvmrc`

Un fichier `.nvmrc` à la racine du projet contient une version, ou un alias :

```text
lts/*
```

ou, pour figer une ligne majeure :

```text
22
```

Ensuite, sans argument, `nvm use` lit ce fichier, et `nvm install` l'installe s'il manque :

```bash
cd mon-projet
nvm use        # lit .nvmrc
nvm install    # installe la version demandée puis l'active
```

nvm remonte l'arborescence : lancé dans un sous-dossier, il trouve le `.nvmrc` de la racine. Le fichier se versionne, pour que toute l'équipe et la CI utilisent la même version.

Pour que le changement soit automatique en entrant dans le dossier, ajouter ce crochet à la fin de `~/.zshrc` (le dépôt nvm fournit aussi une version pour bash) :

```bash
autoload -U add-zsh-hook

load-nvmrc() {
  local nvmrc_path
  nvmrc_path="$(nvm_find_nvmrc)"

  if [ -n "$nvmrc_path" ]; then
    local nvmrc_node_version
    nvmrc_node_version=$(nvm version "$(cat "${nvmrc_path}")")

    if [ "$nvmrc_node_version" = "N/A" ]; then
      nvm install
    elif [ "$nvmrc_node_version" != "$(nvm version)" ]; then
      nvm use
    fi
  elif [ -n "$(PWD=$OLDPWD nvm_find_nvmrc)" ] && [ "$(nvm version)" != "$(nvm version default)" ]; then
    nvm use default
  fi
}

add-zsh-hook chpwd load-nvmrc
load-nvmrc
```

Le test `nvm version` évite de relancer `nvm use` à chaque `cd` quand la bonne version est déjà active. Sans version installée, `nvm install` la télécharge puis l'active.

Sous WSL, si `nvm use` échoue alors que le `.nvmrc` a été écrit sous Windows, vérifier ses fins de ligne : un retour chariot (`\r`) rend le contenu invalide. Le convertir en LF.

D'autres gestionnaires, comme **fnm** ou **Volta**, font le même travail avec une intégration au shell différente ; le tableau de la section suivante les compare. Choisir un seul outil : deux gestionnaires qui modifient le `PATH` en même temps produisent des versions incohérentes.

## Quel gestionnaire selon l'OS ?

nvm n'est pas le seul gestionnaire de versions de Node. Le choix dépend surtout du système utilisé et du nombre de membres de l'équipe sous Windows.

| Outil | Windows | Linux | macOS | Points clés |
| --- | :---: | :---: | :---: | --- |
| **nvm** (nvm-sh) | via WSL | oui | oui | Script shell, `.nvmrc`, la référence historique |
| **nvm-windows** v2 | oui | non | non | Mode shim sans droits admin, `.nvmrc` auto |
| **fnm** | oui | oui | oui | Rapide, lit `.nvmrc` et `.node-version` |
| **Volta** | oui | oui | oui | Épingle les versions dans le `package.json`, gère aussi pnpm et yarn |
| **n** | non | oui | oui | Minimaliste, pas de lecture de `.nvmrc` |
| **asdf** | via WSL | oui | oui | Multi-langages : Node, Python, Go… |
| **mise** | oui | oui | oui | Multi-langages comme asdf, plus moderne |

Trois repères pour choisir :

- **Équipe mixte Windows / Unix.** Chaque outil peut être différent d'une machine à l'autre, à condition que la version attendue soit écrite dans le dépôt : `.nvmrc` (lu par nvm, nvm-windows v2, fnm, nvm-windows shim), `.node-version` (fnm, mise), ou `engines` dans le `package.json` (Volta, npm). C'est le fichier, pas l'outil, qui garantit que tout le monde a la même version.
- **Linux ou macOS.** nvm fait le travail et reste le plus documenté. fnm est plus rapide et s'installe en une commande ; mise si d'autres langages que Node doivent être gérés aussi.
- **Windows.** nvm-windows v2 est la voie officielle du projet nvm-windows. fnm ou Volta sont des alternatives crédibles si la vitesse ou l'épinglage dans `package.json` importent.

Les anciens projets nvm-windows 1.x, **nodist** et **nvs** ne sont plus les choix recommandés : l'un a été remplacé par la v2, les deux autres sont peu ou pas maintenus.

Un seul gestionnaire par machine : les uns comme les autres réécrivent le `PATH`, et deux outils actifs en même temps font exécuter au terminal une version de Node qu'on n'a pas demandée.

## Mettre à jour Node

Node publie des correctifs régulièrement sur chaque ligne majeure. Mettre à jour consiste à installer le dernier correctif d'une ligne, puis à refaire passer les paquets globaux.

```bash
# Installer le dernier correctif de la ligne 22 déjà utilisée
nvm install 22

# Passer à la LTS suivante en récupérant les paquets globaux
nvm install --reinstall-packages-from=current 'lts/*'

# Vérifier les tests du projet avec la nouvelle version
npm test
```

`--reinstall-packages-from` réinstalle les paquets globaux de la version précédente (ceux de `npm install -g`, pas les dépendances du projet). nvm ne le fait pas par défaut, pour ne pas embarquer un outil cassé dans une nouvelle version. Le drapeau ne change pas la version de npm.

Une fois la nouvelle version validée, la rendre par défaut et supprimer l'ancienne :

```bash
nvm alias default 'lts/*'
nvm use default
nvm uninstall 20
```

Pour une mise à jour de sécurité urgente, installer la dernière version de la ligne utilisée et relancer les tests. Pour un projet, le vrai verrou reste `package.json` et son champ `engines`, que la CI peut vérifier :

```json
{
  "engines": {
    "node": ">=22 <25"
  }
}
```

`engines` ne change pas la version installée : il documente l'attendu et permet à `npm install` d'avertir. Le `.nvmrc` reste ce qui pilote nvm.

## Mettre à jour npm

nvm installe la version de npm livrée avec chaque version de Node. Il ne la met pas à jour tout seul. Trois commandes suffisent :

```bash
# Version de npm associée au Node courant, installée par nvm
nvm install-latest-npm

# Ou avec npm lui-même, sans sudo
npm install -g npm@latest

# Vérifier
npm --version
```

Préférer `nvm install-latest-npm` : la commande choisit la dernière npm **supportée par le Node actif**. `npm install -g npm@latest` installe la toute dernière npm, qui peut demander un Node plus récent et refuser de démarrer sur une vieille version.

Sous nvm-windows, `nvm install-latest-npm` n'existe pas : utiliser `npm install -g npm@latest`, après avoir vérifié que la version de Node est assez récente.

Mettre à jour les paquets globaux, pas seulement npm :

```bash
npm ls -g --depth=0
npm outdated -g
npm update -g
```

`npm ls -g --depth=0` liste les paquets globaux sans leurs dépendances. `npm outdated -g` montre ceux qui ont une version plus récente. `npm update -g` les monte dans les limites de version déclarées.

**Ne pas utiliser `sudo`.** Avec nvm, Node et les paquets globaux sont dans le dossier de l'utilisateur, déjà dans le `PATH`. Un `sudo npm install -g` écrit des fichiers appartenant à `root` dans `~/.nvm`, et les installations suivantes échouent avec des erreurs de permission.

Deux réglages cassent nvm et doivent être retirés de `~/.npmrc` : une ligne `prefix=` et une variable `NPM_CONFIG_PREFIX`. Ils forcent npm à écrire ailleurs que dans la version active.

Pour pnpm et Yarn, ne pas les installer avec npm : passer par **Corepack**.

```bash
corepack enable
corepack install -g pnpm@latest
```

`corepack enable` installe les commandes `pnpm` et `yarn` qui délèguent à Corepack. `corepack install -g` choisit la version utilisée hors projet. Dans un projet, préférer `corepack use pnpm@latest` : la commande écrit le champ `packageManager` du `package.json`, ce qui fige la version pour toute l'équipe.

Corepack est livré avec Node jusqu'à la version 24 incluse. À partir de Node 25, il s'installe à part :

```bash
npm install -g corepack
```

## Mettre à jour nvm

Le script d'installation sert aussi de script de mise à jour. Relancer la même commande installe la dernière version, sans toucher aux versions de Node déjà présentes :

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.41.0/install.sh | bash
```

Si nvm a été installé par `git clone`, la mise à jour se fait dans son dossier :

```bash
cd "$NVM_DIR"
git fetch --tags origin
git checkout "$(git describe --abbrev=0 --tags --match 'v[0-9]*')"
. ./nvm.sh
```

Vérifier ensuite avec `nvm --version`. Une nouvelle version de nvm peut ajouter des commandes ou des alias LTS ; elle ne change pas la version de Node active.

## Dépannage

| Symptôme | Cause probable | Solution |
| --- | --- | --- |
| `nvm: command not found` | Profil non rechargé, ou nvm absent du bon fichier | Rouvrir le terminal, puis `source ~/.bashrc` ou `source ~/.zshrc` |
| `nvm use` marche puis est oublié au terminal suivant | `nvm use` ne vaut que pour la session | `nvm alias default 22` |
| `npm: command not found` après `nvm use` | `PATH` modifié par un autre outil, ou npm absent de cette version | `nvm which 22`, puis rouvrir le terminal |
| `npm does not support Node.js` | npm trop récent pour cette version de Node | `nvm use` une version plus récente, puis `nvm install-latest-npm` |
| `nvm install` très lent | Pas de binaire pour la plateforme, compilation depuis les sources | Installer un compilateur C++, ou changer de version |
| Sous Windows, `nvm use` semble sans effet | Un Node officiel reste dans le `PATH`, ou un lien est cassé | `nvm doctor`, puis rouvrir le terminal |
| Permission refusée dans `~/.nvm` | Un `sudo npm` a créé des fichiers `root` | Rendre le dossier à l'utilisateur, puis ne plus utiliser `sudo` |

Désactiver nvm dans la session courante, par exemple pour tester le Node du système :

```bash
nvm use system   # si un Node système existe
nvm deactivate   # retire les chemins de nvm du PATH
```

## Ressources

- [Dépôt et documentation de nvm](https://github.com/nvm-sh/nvm)
- [Téléchargements et calendrier des versions Node.js](https://nodejs.org/en/about/previous-releases)
- [Documentation de npm](https://docs.npmjs.com/)
- [nvm-windows](https://github.com/coreybutler/nvm-windows)
- [Corepack](https://nodejs.org/api/corepack.html)

## À retenir

- nvm installe plusieurs versions de Node pour un utilisateur, dans `~/.nvm`, et change celle du terminal courant.
- `nvm install --lts` installe la LTS, `nvm install 22` la dernière 22.x, `nvm use 22` l'active.
- `nvm use` ne dure que le temps de la session : `nvm alias default` fixe la version des nouveaux terminaux.
- `.nvmrc` versionne la version attendue par un projet ; `nvm use` et `nvm install` le lisent sans argument.
- Sous Windows, nvm-windows v2 fonctionne sans droits administrateur (mode shim), applique un défaut global et lit `.nvmrc` ; ses commandes diffèrent de la 1.x.
- Une mise à jour de Node s'installe à côté de l'ancienne. `--reinstall-packages-from=current` récupère les paquets globaux.
- npm suit Node : `nvm install-latest-npm` installe la dernière npm compatible, sans `sudo`.
- nvm n'est pas seul : fnm et Volta couvrent Windows, Linux et macOS. Un `.nvmrc` versionné garantit la même version pour toute l'équipe, quel que soit l'outil.
- nvm se met à jour en relançant son script d'installation ; nvm-windows avec `nvm upgrade`.
