---
title: L'utilisation des commandes Git Submodule
description: Découvrir et maîtriser les commandes essentielles des sous-modules Git pour intégrer, initialiser, mettre à jour et gérer des dépôts Git imbriqués dans un projet.
technology: git
difficulty: debutant
tags: [git, submodule, versioning, devops, dependances, collaboration]
publishedAt: 2026-10-27
updatedAt: 2026-10-27
draft: false
quiz:
  - question: Quelle commande permet d'ajouter un dépôt Git comme sous-module ?
    choices:
      - git submodule add https://github.com/exemple/lib.git
      - git add --submodule https://github.com/exemple/lib.git
      - git clone --submodule https://github.com/exemple/lib.git
    answer: 0
    explanation: La commande `git submodule add` ajoute un dépôt externe au projet courant et enregistre sa référence dans le fichier `.gitmodules`.
  - question: Quelle commande initialise et récupère les sous-modules d'un projet déjà cloné ?
    choices:
      - git submodule update --init --recursive
      - git submodule start --all
      - git submodule clone --all
    answer: 0
    explanation: L'option `--init` initialise les sous-modules et `--recursive` applique l'opération aux sous-modules imbriqués.
  - question: Comment mettre à jour un sous-module pour récupérer le commit référencé par le dépôt parent ?
    choices:
      - git submodule update --init
      - git submodule pull --all
      - git submodule reset --remote
    answer: 0
    explanation: "`git submodule update --init` initialise le sous-module si nécessaire et place son contenu sur le commit enregistré par le dépôt parent."
---

## Définition

**Git Submodule** est une fonctionnalité de Git permettant d'intégrer un dépôt Git indépendant à l'intérieur d'un autre dépôt.

Un sous-module conserve son propre historique, ses branches, ses commits et sa configuration. Le dépôt parent ne stocke pas directement tous les fichiers du sous-module dans son propre historique : il enregistre principalement une référence vers un commit précis du dépôt intégré.

Le fichier **`.gitmodules`** contient les informations de configuration des sous-modules, notamment leur chemin dans le projet et l'URL de leur dépôt distant.

Les sous-modules sont particulièrement utiles pour réutiliser une bibliothèque partagée, intégrer un composant externe ou maintenir plusieurs projets indépendants dans une même application.

## Comparatif des commandes Git classiques et des sous-modules

| Commande ou mécanisme | Rôle principal | Cas d'usage |
| --- | --- | --- |
| `git clone` | Cloner un dépôt Git | Récupérer un projet |
| `git submodule add` | Ajouter un dépôt comme sous-module | Intégrer une bibliothèque externe |
| `git submodule init` | Initialiser la configuration des sous-modules | Préparer les sous-modules après un clonage |
| `git submodule update` | Récupérer le commit référencé par le dépôt parent | Synchroniser le contenu d'un sous-module |
| `git submodule update --remote` | Mettre à jour un sous-module depuis sa branche distante configurée | Récupérer les derniers commits distants |
| `git submodule status` | Afficher l'état et le commit référencé des sous-modules | Vérifier les versions intégrées |

## Syntaxe et commandes fondamentales

### 1. Ajouter un sous-module

Pour intégrer un dépôt Git externe dans ton projet :

```bash
# Ajouter un sous-module à la racine du projet
git submodule add https://github.com/exemple/librairie.git

# Ajouter un sous-module dans un dossier spécifique
git submodule add https://github.com/exemple/librairie.git libs/librairie

# Vérifier les fichiers modifiés
git status
```

Par défaut, Git utilise généralement le nom du dépôt comme chemin du sous-module si aucun chemin n'est précisé.

Cette opération crée ou modifie notamment le fichier `.gitmodules` et ajoute une référence au commit du sous-module dans l'index du dépôt parent.

Pour enregistrer l'ajout dans l'historique du projet :

```bash
git add .gitmodules libs/librairie
git commit -m "Ajout du sous-module librairie"
```

Adapte le chemin à celui utilisé lors de l'ajout.

### 2. Cloner un projet contenant des sous-modules

Lorsqu'un projet utilise des sous-modules, un simple clonage ne récupère pas automatiquement leur contenu dans tous les cas.

**Méthode recommandée :**

```bash
# Cloner le projet et ses sous-modules récursivement
git clone --recurse-submodules https://github.com/exemple/mon-projet.git

# Entrer dans le projet
cd mon-projet
```

**Si le projet est déjà cloné :**

```bash
# Initialiser et récupérer tous les sous-modules
git submodule update --init --recursive
```

L'option `--recursive` permet également de récupérer les sous-modules imbriqués, c'est-à-dire ceux qui se trouvent eux-mêmes dans d'autres sous-modules.

### 3. Initialiser les sous-modules

La commande `git submodule init` initialise la configuration locale des sous-modules déclarés dans `.gitmodules`.

```bash
# Initialiser tous les sous-modules
git submodule init

# Initialiser un sous-module spécifique
git submodule init libs/librairie

# Initialiser les sous-modules, puis récupérer leur contenu
git submodule update --init
```

**À retenir :** `git submodule init` ne récupère pas à lui seul le contenu des sous-modules. Pour cela, utilise `git submodule update`.

### 4. Mettre à jour les sous-modules

Un sous-module est généralement positionné sur le commit précis enregistré par le dépôt parent.

```bash
# Mettre à jour les sous-modules selon les références du parent
git submodule update --init

# Mettre à jour tous les sous-modules, y compris les sous-modules imbriqués
git submodule update --init --recursive

# Mettre à jour un seul sous-module
git submodule update --init libs/librairie
```

Ces commandes récupèrent le commit référencé par le dépôt parent, et non nécessairement le dernier commit de la branche distante.

**Pour récupérer les dernières versions distantes :**

```bash
# Mettre à jour les sous-modules depuis leurs branches distantes configurées
git submodule update --remote --recursive
```

Cette dernière commande suit la branche configurée pour chaque sous-module. Si aucune branche spécifique n'est définie, Git utilise généralement la branche distante par défaut du sous-module.

Après une mise à jour distante, vérifie les changements dans le dépôt parent :

```bash
git status
git diff --submodule
```

Si les références ont changé, enregistre-les dans le dépôt parent :

```bash
git add libs/librairie
git commit -m "Mise à jour du sous-module librairie"
```

Le commit du dépôt parent enregistre alors la nouvelle référence du sous-module.

### 5. Consulter l'état des sous-modules

```bash
# Afficher les sous-modules et leurs commits référencés
git submodule status

# Afficher les différences concernant les sous-modules
git diff --submodule

# Afficher l'état du dépôt parent
git status

# Afficher les informations détaillées des sous-modules
git submodule foreach 'git status'
```

Dans la sortie de `git submodule status`, le caractère placé au début de la ligne fournit une indication utile :

| Préfixe | Signification |
| --- | --- |
| `-` | Le sous-module n'est pas initialisé. |
| `+` | Le commit actuellement extrait diffère de celui enregistré par le dépôt parent. |
| `U` | Un conflit de fusion affecte la référence du sous-module. |
| Aucun préfixe particulier | Le sous-module est positionné sur le commit référencé par le dépôt parent. |

### 6. Travailler directement dans un sous-module

Un sous-module est un dépôt Git indépendant. Tu peux donc y effectuer des commits, consulter son historique et envoyer tes modifications vers son propre dépôt distant.

```bash
# Entrer dans le sous-module
cd libs/librairie

# Consulter son état
git status

# Consulter son historique
git log --oneline -5

# Créer une branche de travail
git switch -c amelioration

# Ajouter et valider des modifications
git add .
git commit -m "Amélioration de la librairie"

# Envoyer les modifications vers le dépôt distant
git push -u origin amelioration
```

Après avoir validé les changements dans le sous-module, retourne dans le dépôt parent :

```bash
cd ../..

# Vérifier que la référence du sous-module a changé
git status

# Enregistrer la nouvelle référence
git add libs/librairie
git commit -m "Mise à jour de la référence du sous-module"
```

**Important :** le dépôt parent n'enregistre pas automatiquement les modifications du contenu du sous-module dans son propre historique. Il enregistre une référence vers un commit du sous-module.

### 7. Supprimer un sous-module

La suppression d'un sous-module nécessite plusieurs étapes. Il ne suffit pas toujours de supprimer son dossier.

**Étape 1 : supprimer le sous-module de la configuration Git.**

```bash
# Retirer le sous-module de l'index du dépôt parent
git rm libs/librairie
```

Cette commande retire normalement le sous-module de l'index et prépare la suppression de son chemin de travail. Vérifie ensuite le fichier `.gitmodules` et les modifications avec `git status`.

**Étape 2 : enregistrer la suppression.**

```bash
git add .gitmodules
git commit -m "Suppression du sous-module librairie"
```

Si `.gitmodules` a été modifié automatiquement par `git rm`, la commande `git add .gitmodules` enregistre cette modification. Si le fichier a été supprimé ou si aucun changement n'est nécessaire, adapte les commandes à l'état réel du dépôt.

**Attention :** la suppression du sous-module du dépôt parent ne supprime pas le dépôt distant. Les données locales conservées dans les métadonnées Git peuvent également nécessiter un nettoyage spécifique.

### 8. Gérer la branche distante d'un sous-module

Par défaut, les sous-modules sont souvent utilisés à partir d'un commit précis. Tu peux cependant configurer la branche distante à suivre lors des mises à jour avec `--remote`.

```bash
# Configurer la branche distante à suivre
git config -f .gitmodules submodule.libs/librairie.branch main

# Synchroniser la configuration des sous-modules
git submodule sync --recursive

# Récupérer les commits de la branche configurée
git submodule update --remote libs/librairie
```

Le nom `submodule.libs/librairie.branch` dépend du chemin du sous-module. Si le chemin contient des caractères particuliers, adapte la clé à sa section correspondante dans `.gitmodules`.

Après cette modification, vérifie et valide le fichier `.gitmodules` dans le dépôt parent :

```bash
git add .gitmodules
git commit -m "Configuration de la branche du sous-module"
```

La configuration de branche détermine quelle branche est utilisée lors des mises à jour distantes. Elle ne signifie pas que le dépôt parent suivra automatiquement les nouveaux commits : la nouvelle référence doit toujours être enregistrée dans le dépôt parent.

## Structure d'un projet utilisant des sous-modules

Exemple d'organisation d'un projet web intégrant une bibliothèque externe :

```text
mon-projet/
├── .git/
├── .gitmodules
├── src/
│   └── app.js
├── libs/
│   └── librairie/
│       ├── .git
│       ├── README.md
│       └── src/
└── package.json
```

Le fichier `.gitmodules` peut contenir une configuration similaire à celle-ci :

```ini
[submodule "libs/librairie"]
    path = libs/librairie
    url = https://github.com/exemple/librairie.git
    branch = main
```

Explication :

- `submodule "libs/librairie"` identifie le sous-module.
- `path` indique son emplacement dans le projet parent.
- `url` indique l'adresse du dépôt distant.
- `branch` indique la branche à utiliser lors des mises à jour distantes lorsque cette configuration est prise en compte.

Le fichier `.gitmodules` décrit les paramètres du sous-module. Le dépôt parent enregistre également le commit précis auquel chaque sous-module doit correspondre.

## Cas d'usage fréquents

- **Réutilisation de bibliothèques partagées :** intégrer une bibliothèque développée et versionnée dans un dépôt indépendant.
- **Architecture modulaire :** organiser un projet autour de composants maintenus dans des dépôts distincts.
- **Versionnement maîtrisé :** conserver une référence stable vers une version précise d'une dépendance.
- **Collaboration entre équipes :** permettre à plusieurs équipes de maintenir des composants indépendamment.
- **Gestion de dépendances internes :** intégrer un dépôt privé partagé par plusieurs projets.

## Tableau récapitulatif des commandes

| Besoin | Commande |
| --- | --- |
| Ajouter un sous-module | `git submodule add <URL> <chemin>` |
| Cloner avec les sous-modules | `git clone --recurse-submodules <URL>` |
| Initialiser les sous-modules | `git submodule init` |
| Initialiser et récupérer le contenu | `git submodule update --init` |
| Récupérer récursivement les sous-modules | `git submodule update --init --recursive` |
| Mettre à jour depuis les branches distantes | `git submodule update --remote --recursive` |
| Afficher l'état des sous-modules | `git submodule status` |
| Afficher les différences | `git diff --submodule` |
| Synchroniser les URL configurées | `git submodule sync --recursive` |
| Exécuter une commande dans chaque sous-module | `git submodule foreach '<commande>'` |
| Supprimer un sous-module de l'index | `git rm <chemin>` |

## Mots-clés

| Terme | Définition |
| --- | --- |
| `Submodule` | Dépôt Git indépendant intégré dans un autre dépôt. |
| `.gitmodules` | Fichier décrivant les chemins et URL des sous-modules. |
| `Commit` | Version précise du code identifiée par un identifiant Git. |
| `Dépôt parent` | Dépôt principal qui référence les commits des sous-modules. |
| `Branche distante` | Branche d'un dépôt distant utilisée comme référence pour récupérer les modifications. |
| `Detached HEAD` | État dans lequel Git pointe directement vers un commit plutôt que vers une branche locale. |
| `gitlink` | Référence enregistrée dans le dépôt parent vers un commit du sous-module. |

## Pièges et points de vigilance

- **Oublier l'initialisation :** après un clonage classique, les dossiers des sous-modules peuvent être vides ou non initialisés. Utilise `git submodule update --init --recursive`.
- **Confondre mise à jour et dernière version :** `git submodule update` restaure la référence enregistrée par le parent, tandis que `git submodule update --remote` récupère une version depuis la branche distante configurée.
- **Oublier de valider la nouvelle référence :** après une mise à jour du sous-module, vérifie le dépôt parent et valide le nouveau commit référencé si nécessaire.
- **Travailler en état detached HEAD :** les sous-modules sont souvent positionnés directement sur un commit. Crée ou sélectionne une branche avant de développer des modifications destinées à être publiées.
- **Supprimer incorrectement un sous-module :** vérifie `.gitmodules`, l'index et les métadonnées locales avant de procéder à un nettoyage manuel.
- **Accès aux dépôts privés :** chaque utilisateur doit disposer des droits et de l'authentification nécessaires pour récupérer les sous-modules privés.
- **Modifier une dépendance sans publier ses commits :** si le dépôt parent référence un commit qui n'est pas accessible sur le dépôt distant du sous-module, les autres développeurs risquent de ne pas pouvoir récupérer le projet complet.

## À retenir

Les sous-modules Git permettent d'intégrer des dépôts indépendants tout en conservant un contrôle précis sur leur version.

Les commandes les plus importantes sont :

- `git submodule add <URL>` pour ajouter un sous-module.
- `git clone --recurse-submodules <URL>` pour cloner un projet avec ses sous-modules.
- `git submodule update --init --recursive` pour initialiser et récupérer les sous-modules.
- `git submodule update --remote` pour récupérer les versions distantes configurées.
- `git submodule status` pour contrôler leur état.
- `git submodule sync --recursive` pour synchroniser leurs URL.
- `git rm <chemin>` pour retirer un sous-module du dépôt parent.

**Conseil :** après chaque modification d'un sous-module, vérifie son propre historique ainsi que l'état du dépôt parent. Cette vérification permet de garantir que tous les développeurs récupèrent les mêmes versions des composants intégrés.