---
title: Automatiser les workflows Git avec les Git Hooks
description: Comprendre et maîtriser les Git Hooks pour automatiser les vérifications, les tests, le formatage du code et les contrôles qualité lors des opérations Git.
technology: devops
difficulty: debutant
tags: [git, git-hooks, pre-commit, pre-push, commit-msg, automatisation, devops, qualite-code, fullstack]
publishedAt: 2026-10-26
updatedAt: 2026-10-26
draft: false
# quiz:
#   - question: À quel moment le hook `pre-commit` est-il exécuté ?
#     choices:
#       - Avant la création du commit
#       - Après l'envoi des modifications sur le dépôt distant
#       - Lors de la création d'une branche
#     answer: 0
#     explanation: `pre-commit` s'exécute avant la création du commit. Il peut notamment lancer des vérifications de formatage ou de qualité du code.
#   - question: Quel hook permet de vérifier le message d'un commit avant sa validation ?
#     choices:
#       - `commit-msg`
#       - `post-merge`
#       - `post-checkout`
#     answer: 0
#     explanation: `commit-msg` reçoit le chemin du fichier contenant le message du commit et peut refuser ce message si son format n'est pas conforme.
#   - question: Où Git stocke-t-il généralement les hooks d'un dépôt ?
#     choices:
#       - Dans le répertoire `.git/hooks/`
#       - Dans le répertoire `node_modules/`
#       - Dans le fichier `.gitconfig`
#     answer: 0
#     explanation: Les hooks sont généralement placés dans `.git/hooks/`. Le chemin peut être personnalisé avec la configuration `core.hooksPath`.
#   - question: Quel hook permet d'exécuter des vérifications avant un `git push` ?
#     choices:
#       - `pre-push`
#       - `post-receive`
#       - `post-commit`
#     answer: 0
#     explanation: `pre-push` s'exécute avant l'envoi des références vers le dépôt distant et peut empêcher le push si les vérifications échouent.
#   - question: Comment rendre un script de hook exécutable sous Linux ou macOS ?
#     choices:
#       - `chmod +x .git/hooks/pre-commit`
#       - `git hook enable --all`
#       - `git chmod hook pre-commit`
#     answer: 0
#     explanation: Sous Linux et macOS, le script doit généralement disposer du droit d'exécution. Git ignore les hooks non exécutables.
#   - question: Quelle est la principale différence entre un hook local et un hook serveur ?
#     choices:
#       - Le hook local s'exécute sur la machine du développeur, tandis que le hook serveur s'exécute sur le serveur Git
#       - Le hook local fonctionne uniquement avec GitHub
#       - Le hook serveur ne peut pas refuser une opération Git
#     answer: 0
#     explanation: Les hooks locaux automatisent les opérations sur le poste du développeur. Les hooks serveur permettent notamment d'appliquer des règles à la réception des modifications.
#   - question: Quelle solution permet de partager plus facilement une configuration de hooks dans une équipe JavaScript ?
#     choices:
#       - Husky
#       - `git log`
#       - `git stash`
#     answer: 0
#     explanation: Husky facilite la gestion et le partage des hooks via les fichiers du projet et sa configuration versionnée.
---

## Définition

Les **Git Hooks** sont des scripts exécutés automatiquement à certains moments du cycle de vie de Git.

Ils permettent notamment de :
- Lancer des tests avant un commit ou un push.
- Vérifier le format des messages de commit.
- Formater automatiquement le code.
- Détecter des erreurs de qualité.
- Empêcher certaines opérations si des règles ne sont pas respectées.
- Automatiser des actions après une fusion ou un changement de branche.

Les hooks peuvent être locaux, sur le poste du développeur, ou côté serveur, sur l'infrastructure qui héberge le dépôt Git.

## Les principaux Git Hooks

| Hook | Moment d'exécution | Cas d'utilisation |
| --- | --- | --- |
| `pre-commit` | Avant la création du commit | Lancer le lint et les vérifications rapides |
| `prepare-commit-msg` | Avant l'ouverture ou l'utilisation finale de l'éditeur du message de commit | Préremplir le message |
| `commit-msg` | Après la saisie du message, avant la création du commit | Vérifier le format du message |
| `post-commit` | Après la création du commit | Afficher une notification ou déclencher une action locale |
| `pre-push` | Avant l'envoi des références au dépôt distant | Lancer des tests avant le push |
| `post-checkout` | Après un changement de branche ou un checkout | Actualiser certains éléments de l'environnement |
| `post-merge` | Après une fusion réussie | Installer ou actualiser des dépendances si nécessaire |
| `pre-rebase` | Avant une opération de rebase | Contrôler certaines conditions avant la réécriture de l'historique |
| `pre-receive` | Côté serveur, à la réception d'un push | Refuser un ensemble de références non conformes |
| `update` | Côté serveur, pour chaque référence mise à jour | Appliquer des règles par branche |
| `post-receive` | Côté serveur, après la réception des références | Déclencher une notification ou une intégration |

**À retenir :** les hooks dont le nom commence par `pre-` servent généralement à contrôler une opération avant qu'elle soit effectuée. Les hooks `post-` interviennent après l'opération correspondante.

## Emplacement et configuration des hooks

### 1. Répertoire par défaut

Dans un dépôt Git classique, les hooks se trouvent généralement dans :

```bash
.git/hooks/
```

Git crée souvent des exemples de hooks avec l'extension `.sample`.

Exemple :

```text
.git/
└── hooks/
    ├── pre-commit.sample
    ├── commit-msg.sample
    ├── pre-push.sample
    └── post-merge.sample
```

Pour activer un hook, créez un fichier portant le nom exact attendu, sans l'extension `.sample`.

### 2. Vérifier le répertoire utilisé

```bash
git rev-parse --git-path hooks
```

Cette commande affiche le chemin du répertoire de hooks utilisé par le dépôt.

### 3. Configurer un répertoire personnalisé

```bash
git config core.hooksPath .githooks
```

Les hooks seront alors recherchés dans le répertoire `.githooks`, à condition que ce chemin soit correctement interprété depuis le répertoire de travail.

Pour consulter cette configuration :

```bash
git config --get core.hooksPath
```

Pour revenir au comportement par défaut :

```bash
git config --unset core.hooksPath
```

**Important :** un chemin configuré au niveau global peut également influencer plusieurs dépôts. Vérifiez la configuration effective avant de modifier des hooks.

## Créer un hook `pre-commit`

L'objectif est d'empêcher un commit si les vérifications de qualité du code échouent.

### 1. Créer le fichier

Dans un dépôt utilisant le répertoire par défaut :

```bash
nano .git/hooks/pre-commit
```

### 2. Ajouter un script Bash

```bash
#!/usr/bin/env bash

set -e

echo "Vérification du code avant le commit..."

if ! npm run lint; then
  echo "Erreur : le lint a échoué."
  exit 1
fi

echo "Vérifications terminées avec succès."
```

Ce script :
- Affiche un message.
- Exécute le script `lint` défini dans le `package.json`.
- Interrompt le commit si le lint échoue.
- Autorise le commit si les vérifications réussissent.

Le projet doit évidemment disposer d'un script `lint` fonctionnel.

### 3. Rendre le hook exécutable

```bash
chmod +x .git/hooks/pre-commit
```

### 4. Tester le hook

```bash
git add .
git commit -m "feat: add user profile"
```

Si le lint échoue, Git interrompt normalement la création du commit.

Pour ce type de hook, utilisez des vérifications rapides afin de ne pas ralentir excessivement le travail des développeurs.

## Vérifier les messages avec `commit-msg`

Les équipes peuvent adopter une convention de messages de commit, par exemple Conventional Commits.

Format courant :

```text
type(scope): description
```

Exemples :

```text
feat(auth): add login endpoint
fix(api): handle missing user
docs(readme): update installation guide
test(users): add profile tests
refactor(database): simplify query builder
```

Créer le fichier :

```bash
nano .git/hooks/commit-msg
```

Ajouter :

```bash
#!/usr/bin/env bash

set -e

COMMIT_MSG_FILE="$1"
COMMIT_MSG="$(head -n 1 "$COMMIT_MSG_FILE")"

PATTERN='^(feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert)(\([a-zA-Z0-9._/-]+\))?!?: .+'

if ! printf '%s\n' "$COMMIT_MSG" | grep -Eq "$PATTERN"; then
  echo "Erreur : le message de commit ne respecte pas la convention."
  echo "Exemple attendu : feat(auth): add login endpoint"
  exit 1
fi

echo "Message de commit valide."
```

Rendre le script exécutable :

```bash
chmod +x .git/hooks/commit-msg
```

**Remarque :** cette expression régulière vérifie une convention courante, mais ne constitue pas une implémentation exhaustive de la spécification Conventional Commits.

## Exécuter des tests avec `pre-push`

Le hook `pre-push` permet de lancer des vérifications avant d'envoyer les commits vers un dépôt distant.

Créer le fichier :

```bash
nano .git/hooks/pre-push
```

Exemple :

```bash
#!/usr/bin/env bash

set -e

echo "Exécution des tests avant le push..."

npm test

echo "Tests réussis. Push autorisé."
```

Puis :

```bash
chmod +x .git/hooks/pre-push
```

Désormais, un échec de `npm test` interrompt normalement le push.

**Bonne pratique :** privilégiez les tests rapides dans ce hook. Les suites de tests longues peuvent être exécutées dans une pipeline CI.

## Partager les hooks avec toute l'équipe

Les hooks présents dans `.git/hooks/` ne sont pas versionnés par Git. Chaque clone du dépôt possède son propre répertoire interne.

Pour partager des hooks, une approche simple consiste à créer un répertoire dans le projet :

```text
mon-projet/
├── .githooks/
│   ├── pre-commit
│   ├── commit-msg
│   └── pre-push
├── package.json
└── src/
```

Configurer Git :

```bash
git config core.hooksPath .githooks
```

Les fichiers du répertoire `.githooks/` peuvent ainsi être versionnés et partagés.

Cependant, chaque développeur doit activer cette configuration localement, ou le projet doit prévoir une procédure d'installation adaptée.

## Utiliser Husky dans un projet JavaScript

**Husky** est un outil populaire qui simplifie la gestion des hooks dans les projets JavaScript et TypeScript.

Documentation officielle : https://typicode.github.io/husky/

### 1. Installer Husky

```bash
npm install --save-dev husky
```

### 2. Initialiser la configuration

```bash
npx husky init
```

Cette commande configure Husky selon la version installée et le projet.

### 3. Configurer un hook

Selon la version de Husky, les hooks sont généralement définis dans des fichiers placés dans `.husky/`.

Exemple de fichier `.husky/pre-commit` :

```sh
npm run lint
```

Exemple de fichier `.husky/commit-msg` :

```sh
npx commitlint --edit "$1"
```

Pour utiliser Commitlint, installez-le et configurez-le conformément à sa documentation officielle : https://commitlint.js.org/

**Attention :** la syntaxe et la procédure d'installation de Husky ont évolué au fil des versions. Utilisez les instructions correspondant à la version présente dans votre projet.

## Git Hooks et qualité du code

Les hooks peuvent être combinés avec des outils spécialisés.

| Outil | Utilisation |
| --- | --- |
| ESLint | Détecter des problèmes dans le code JavaScript ou TypeScript |
| Prettier | Formater automatiquement le code |
| lint-staged | Exécuter des commandes uniquement sur les fichiers préparés pour le commit |
| Commitlint | Vérifier les messages de commit |
| Husky | Simplifier la gestion des hooks Git |
| Tests unitaires | Vérifier le comportement de certaines fonctions |
| Tests d'intégration | Vérifier l'interaction entre plusieurs composants |

Exemple d'enchaînement :

```text
Développeur
    |
    v
git add
    |
    v
git commit
    |
    v
Hook pre-commit
    |
    +----> Lint
    |
    +----> Formatage / contrôles ciblés
    |
    v
Hook commit-msg
    |
    +----> Validation du message
    |
    v
Commit créé
    |
    v
git push
    |
    v
Hook pre-push
    |
    +----> Tests
    |
    v
Envoi au dépôt distant
    |
    v
Pipeline CI/CD
```

Les hooks locaux améliorent l'expérience des développeurs, mais la pipeline CI/CD reste essentielle pour effectuer des vérifications fiables sur le serveur.

## Git Hooks côté serveur

Git permet également d'exécuter des hooks sur un serveur hébergeant un dépôt.

Les hooks serveur sont utiles pour appliquer des règles qui ne doivent pas dépendre uniquement de la configuration locale des développeurs.

### Exemples

- `pre-receive` : contrôler l'ensemble des références reçues et refuser la réception si une règle n'est pas respectée.
- `update` : appliquer des règles lors de la mise à jour d'une référence particulière.
- `post-receive` : déclencher des actions après la réception des références, par exemple une notification ou une intégration.

Sur un serveur Git auto-hébergé, ces hooks peuvent contribuer à appliquer les règles de l'équipe.

Sur des plateformes comme GitHub ou GitLab, les possibilités dépendent de la plateforme, de l'offre utilisée et de la configuration du dépôt. Les contrôles serveur peuvent notamment passer par des règles de protection de branches et des pipelines CI/CD.

## Ignorer temporairement les hooks

Git permet de contourner certains hooks locaux avec l'option `--no-verify`.

Exemple :

```bash
git -c core.hooksPath=/dev/null commit -m "chore: temporary local change"
```

Sur les systèmes Unix, cette commande désactive les hooks pour cette invocation de Git en utilisant un chemin de hooks vide.

Pour les opérations compatibles avec cette option, il est également possible d'utiliser :

```bash
git commit --no-verify -m "fix(api): correct response status"
```

L'option `--no-verify` contourne notamment les hooks `pre-commit` et `commit-msg` lors d'un commit, ainsi que le hook `pre-push` lors d'un push.

**Attention :** contourner les hooks peut laisser passer des erreurs de qualité ou des messages non conformes. Cette possibilité ne doit pas remplacer les contrôles obligatoires côté CI ou serveur.

## Pièges et points de vigilance

- **Droits d'exécution :** sous Linux et macOS, un hook doit généralement être exécutable.
- **Hooks non partagés par défaut :** les fichiers de `.git/hooks/` ne sont pas versionnés.
- **Environnement différent :** les variables d'environnement et le `PATH` peuvent différer du terminal habituel.
- **Performance :** des tests trop longs dans `pre-commit` ou `pre-push` ralentissent le développement.
- **Dépendances absentes :** un hook utilisant `npm`, `php`, `python` ou un autre outil peut échouer si cet outil n'est pas disponible.
- **Contournement possible :** les hooks locaux ne constituent pas une garantie de sécurité à eux seuls.
- **Sécurité :** un hook est un script exécutable ; vérifiez son contenu avant de l'exécuter.
- **Répertoire personnalisé :** la configuration `core.hooksPath` peut déplacer les hooks hors de `.git/hooks/`.
- **CI/CD :** les tests et contrôles essentiels doivent également être exécutés sur une infrastructure de confiance.
- **Fichiers partiellement préparés :** un hook qui analyse tout le répertoire de travail peut examiner des modifications qui ne font pas partie du commit. Pour éviter ce problème, des outils comme `lint-staged` peuvent cibler les fichiers concernés.

## À retenir

Les Git Hooks permettent d'automatiser des actions lors des opérations Git.

Les hooks essentiels à connaître sont :
- `pre-commit` : vérifier le code avant un commit.
- `commit-msg` : contrôler le message du commit.
- `pre-push` : lancer des contrôles avant un push.
- `post-merge` : automatiser certaines actions après une fusion.
- `pre-receive` : appliquer des règles côté serveur.

Pour un développeur Full Stack, une configuration efficace consiste à utiliser les hooks locaux pour les contrôles rapides, des outils comme Husky et lint-staged pour partager les règles dans l'équipe, puis une pipeline CI/CD pour valider les modifications de manière centralisée.

## Sources

- Documentation officielle Git — [Git Hooks](https://git-scm.com/docs/githooks)
- Documentation officielle Git — [git-config](https://git-scm.com/docs/git-config)
- Documentation officielle Husky — [Husky](https://typicode.github.io/husky/)
- Documentation officielle Commitlint — [Commitlint](https://commitlint.js.org/)
- Documentation officielle lint-staged — [lint-staged](https://github.com/lint-staged/lint-staged)