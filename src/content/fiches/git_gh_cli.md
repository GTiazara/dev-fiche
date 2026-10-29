---
title: "GitHub CLI (gh) et agents IA : guide de A à Z"
description: "Installer et utiliser GitHub CLI, gérer dépôts, issues et pull requests, puis intégrer un agent IA en mode assisté, semi-autonome ou automatisé."
technology: git
difficulty: debutant
tags:
  - github
  - gh
  - github-cli
  - git
  - agent-ia
  - coding-agent
  - automatisation
  - github-actions
publishedAt: 2026-10-27
updatedAt: 2026-10-27
draft: false
quiz:
  - question: "Quelle est la différence entre git et gh ?"
    choices:
      - "git gère les versions du code, gh interagit avec les fonctionnalités de GitHub"
      - "gh remplace complètement git"
      - "git sert uniquement à ouvrir des pull requests"
    answer: 0
    explanation: "git gère l'historique du code. gh pilote les fonctionnalités de GitHub, comme les issues et les pull requests."
  - question: "Un agent IA peut-il fusionner du code sans validation humaine ?"
    choices:
      - "Oui, systématiquement"
      - "Oui, si ses outils et permissions le permettent, mais cela doit être encadré"
      - "Non, c'est techniquement impossible"
    answer: 1
    explanation: "Un agent peut fusionner s'il en a le droit. Ces droits doivent rester limités et contrôlés."
  - question: "Quelle commande permet de consulter les pull requests d'un dépôt ?"
    choices:
      - "gh pr list"
      - "gh repo status"
      - "git pr show"
    answer: 0
    explanation: "gh pr list affiche les pull requests du dépôt. git n'a pas de commande pr."
---

# 1. Qu'est-ce que GitHub CLI ?

**GitHub CLI**, dont la commande est `gh`, est le client en ligne de commande officiel de GitHub.

Il permet d'interagir avec les fonctionnalités de GitHub directement depuis un terminal :
- consulter et cloner des dépôts ;
- gérer des issues ;
- créer et examiner des pull requests ;
- consulter les workflows GitHub Actions ;
- gérer certaines informations de dépôts et d'organisations ;
- automatiser des opérations dans des scripts ;
- fournir des outils utilisables par des agents IA.

## `git` ou `gh` ?

| Outil | Rôle principal | Exemples |
|---|---|---|
| `git` | Gérer les versions du code | `git commit`, `git branch`, `git merge` |
| `gh` | Interagir avec les fonctionnalités de GitHub | `gh pr create`, `gh issue list`, `gh repo clone` |
| Agent IA | Comprendre une demande et effectuer un travail | Modifier du code, ajouter des tests, proposer une correction |
| GitHub Actions | Exécuter des workflows automatisés | Tests, intégration continue, déploiements |

**À retenir :** `git` gère le dépôt et son historique. `gh` pilote les fonctionnalités GitHub. L'agent IA décide comment accomplir la tâche qui lui est confiée, dans les limites de ses outils et permissions.

# 2. Installer GitHub CLI

Les commandes d'installation dépendent du système d'exploitation.

Consulte la documentation officielle pour choisir la méthode adaptée à ta machine.

Vérifie ensuite l'installation :

```bash
gh --version
```

Affiche l'aide générale :

```bash
gh help
```

Affiche les commandes disponibles :

```bash
gh help
gh repo --help
gh pr --help
gh issue --help
```

# 3. S'authentifier auprès de GitHub

## Connexion interactive

```bash
gh auth login
```

L'assistant te propose de choisir un serveur GitHub, un protocole Git et une méthode d'authentification.

Pour vérifier l'état de la connexion :

```bash
gh auth status
```

Pour consulter le compte actuellement utilisé :

```bash
gh api user
```

Cette dernière commande interroge l'API GitHub avec les informations d'authentification configurées.

## Choisir entre HTTPS et SSH

| Protocole | Principe |
|---|---|
| HTTPS | Les opérations Git passent par HTTPS et un mécanisme d'authentification |
| SSH | Les opérations Git utilisent une clé SSH configurée |

GitHub CLI peut aider à configurer l'authentification Git :

```bash
gh auth setup-git
```

La connexion de `gh` et la configuration de Git sont liées, mais ne sont pas exactement la même chose.

## Sécurité des identifiants

- Ne publie jamais un token GitHub dans un dépôt.
- Ne place pas un token directement dans un script versionné.
- Évite d'afficher les tokens dans les journaux.
- Pour l'automatisation, utilise les mécanismes de secrets prévus par l'environnement.
- Accorde uniquement les permissions nécessaires à la tâche.

**Important :** un agent IA qui peut utiliser une authentification disposant de droits d'écriture peut potentiellement modifier des ressources GitHub. Il faut donc contrôler ses permissions, pas seulement son prompt.

# 4. Choisir un dépôt

Place-toi dans un dépôt Git existant :

```bash
cd mon-projet
```

Affiche le dépôt GitHub associé :

```bash
gh repo view
```

Consulte ses informations dans le navigateur :

```bash
gh repo view --web
```

Clone un dépôt :

```bash
gh repo clone ORGANISATION/DEPOT
```

Exemple :

```bash
gh repo clone cli/cli
cd cli
```

Pour utiliser ces commandes sur un autre dépôt, remplace `ORGANISATION/DEPOT` par son propriétaire et son nom.

## Définir explicitement le dépôt cible

Certaines commandes acceptent l'option `--repo` :

```bash
gh issue list --repo ORGANISATION/DEPOT
gh pr list --repo ORGANISATION/DEPOT
```

C'est utile lorsqu'un script ou un agent travaille avec plusieurs dépôts.

# 5. Les commandes essentielles

## Dépôts

| Commande | Utilité |
|---|---|
| `gh repo list` | Lister des dépôts accessibles |
| `gh repo view` | Consulter le dépôt courant |
| `gh repo clone OWNER/REPO` | Cloner un dépôt |
| `gh repo view --web` | Ouvrir le dépôt dans le navigateur |

## Issues

| Commande | Utilité |
|---|---|
| `gh issue list` | Lister les issues |
| `gh issue view 42` | Consulter l'issue 42 |
| `gh issue create` | Créer une issue |
| `gh issue status` | Consulter l'activité liée aux issues et pull requests |

## Pull requests

| Commande | Utilité |
|---|---|
| `gh pr list` | Lister les pull requests |
| `gh pr view 42` | Consulter une pull request |
| `gh pr diff 42` | Examiner ses modifications |
| `gh pr checkout 42` | Récupérer localement sa branche |
| `gh pr create` | Créer une pull request |
| `gh pr checks 42` | Consulter l'état des vérifications |
| `gh pr review 42` | Envoyer une revue |
| `gh pr merge 42` | Fusionner une pull request si les règles l'autorisent |

## Workflows

| Commande | Utilité |
|---|---|
| `gh workflow list` | Lister les workflows |
| `gh run list` | Consulter les exécutions récentes |
| `gh run view ID` | Examiner une exécution |
| `gh run watch ID` | Suivre une exécution |
| `gh run rerun ID` | Relancer une exécution, si autorisé |

# 6. Gérer une issue

Les issues servent à décrire un bug, une amélioration ou une tâche.

Afficher les issues ouvertes :

```bash
gh issue list
```

Consulter une issue :

```bash
gh issue view 42
```

Créer une issue :

```bash
gh issue create \
  --title "Corriger le traitement des données" \
  --body "Décrire le problème, le comportement attendu et les critères de validation."
```

Pour préparer une tâche destinée à un agent IA, une bonne issue contient :
- un objectif précis ;
- le comportement actuel ;
- le comportement attendu ;
- des critères d'acceptation ;
- des contraintes techniques ;
- les tests qui permettront de valider la solution.

Une issue bien rédigée améliore la qualité du travail de l'agent et facilite la revue de ses modifications.

# 7. Gérer les pull requests

Une pull request (PR) propose des changements à intégrer dans une branche cible.

## Cycle classique

Créer une branche avec Git :

```bash
git switch -c fix/traitement-donnees
```

Modifier les fichiers, puis vérifier le travail :

```bash
git status
git diff
```

Ajouter et enregistrer les changements :

```bash
git add fichier.py
git commit -m "Corriger le traitement des données"
```

Envoyer la branche :

```bash
git push -u origin fix/traitement-donnees
```

Créer la PR :

```bash
gh pr create \
  --title "Corriger le traitement des données" \
  --body "Explique la correction et les tests réalisés."
```

Consulter la PR :

```bash
gh pr view
```

Examiner les modifications :

```bash
gh pr diff
```

Vérifier les tests et contrôles :

```bash
gh pr checks
```

**Bonne pratique :** une PR doit être facile à relire. Elle doit expliquer pourquoi les changements sont nécessaires, ce qui a été modifié et comment la solution a été testée.

# 8. Qu'est-ce qu'un agent IA de développement ?

Un agent IA de développement est un système capable d'interpréter une tâche et d'utiliser des outils pour accomplir une partie du travail.

Selon l'environnement, il peut :
- lire les fichiers d'un projet ;
- rechercher du code ;
- modifier des fichiers ;
- lancer des tests ;
- utiliser Git ;
- exécuter des commandes terminal ;
- consulter des issues et des pull requests ;
- préparer une branche ou proposer une PR.

L'agent ne possède pas nécessairement toutes ces capacités. Elles dépendent de son environnement, des outils connectés, de sa configuration et des permissions disponibles.

**`gh` n'est pas l'agent : c'est l'un des outils que l'agent peut utiliser.**

# 9. Trois niveaux d'autonomie

## Niveau 1 — Assisté

L'IA suggère des commandes ou du code. Tu vérifies les propositions et les exécutes toi-même.

Exemple :

```text
Utilisateur : explique comment consulter les issues d'un dépôt.

Agent : propose gh issue list.
Utilisateur : exécute la commande et examine le résultat.
```

L'IA n'agit pas directement sur le dépôt.

**Avantages :**
- contrôle humain élevé ;
- apprentissage facilité ;
- faible risque d'action involontaire.

## Niveau 2 — Semi-autonome

L'agent peut lire le projet, modifier les fichiers et lancer des tests dans un environnement autorisé.

Tu lui demandes de préparer une correction, puis tu vérifies les changements.

Exemple de consigne :

```text
Analyse l'issue #42.

Lis le code concerné, identifie la cause probable,
propose une correction minimale et ajoute des tests.

Ne pousse aucune branche, ne crée aucune pull request
et ne fusionne rien sans ma validation.
```

L'agent travaille localement, mais les actions sur GitHub restent soumises à validation.

**Avantages :**
- gain de temps ;
- possibilité d'examiner les changements avant publication ;
- bon compromis entre efficacité et contrôle.

## Niveau 3 — Autonome ou automatisé

L'agent reçoit une tâche et peut effectuer plusieurs étapes sans validation humaine à chaque étape.

Selon la configuration, il peut :
1. récupérer le contexte d'une issue ;
2. analyser le code ;
3. modifier des fichiers ;
4. exécuter les tests ;
5. créer une branche ;
6. publier une PR ;
7. commenter le résultat.

Certaines configurations permettent également d'autres actions, mais elles ne doivent être accordées que si elles sont réellement nécessaires.

**Attention :** autonomie ne signifie pas absence de limites. Les permissions GitHub, les règles de protection des branches, les validations obligatoires et les limites de l'environnement restent essentielles.

# 10. Comment `gh` s'intègre à un agent IA

Une architecture de travail typique ressemble à ceci :

```text
Issue GitHub
     |
     v
Agent IA
     |
     +--> gh issue view
     |
     +--> Lecture du code
     |
     +--> Modifications des fichiers
     |
     +--> Tests
     |
     +--> Git : branche et commit
     |
     +--> gh pr create
                 |
                 v
           Pull request
                 |
                 v
         Revue et validation
```

Il s'agit d'un exemple d'architecture, pas d'un comportement automatique garanti.

L'agent doit disposer :
- d'un environnement où il peut travailler ;
- des outils nécessaires ;
- d'une authentification appropriée ;
- de permissions suffisantes pour les actions demandées ;
- de règles définissant ce qu'il peut ou ne peut pas faire.

# 11. Utiliser un agent local avec `gh`

Un agent de programmation exécuté sur ta machine peut utiliser `gh` si son environnement lui permet d'exécuter des commandes terminal.

## Préparer le dépôt

```bash
cd mon-projet
git status
gh auth status
gh repo view
```

Avant de commencer, vérifie que :
- tu travailles dans le bon dépôt ;
- tes modifications non enregistrées sont identifiées ;
- le compte GitHub actif est le bon ;
- l'agent ne pourra pas écraser des changements importants.

## Donner une tâche à l'agent

Exemple de consigne :

```text
Tu travailles dans ce dépôt Git.

Objectif :
résoudre l'issue #42.

Étapes :
1. Lis l'issue et les fichiers concernés.
2. Identifie la cause du problème.
3. Propose une modification minimale.
4. Ajoute ou adapte les tests.
5. Exécute les tests pertinents.
6. Résume les fichiers modifiés et les résultats.

Contraintes :
- Ne modifie pas les fichiers sans rapport avec la tâche.
- N'utilise pas de secrets présents dans l'environnement.
- Ne pousse aucune modification vers GitHub.
- Ne crée pas de pull request sans validation.
- Signale toute commande destructive avant de l'exécuter.
```

L'agent utilise ensuite les outils qui lui sont disponibles. Cette consigne ne garantit pas, à elle seule, le respect de toutes les limites : les permissions et les mécanismes de contrôle de l'environnement comptent également.

## Examiner le travail

```bash
git status
git diff
git diff --check
```

Puis lance les tests appropriés au projet.

Si les changements sont satisfaisants, tu peux créer le commit et publier la branche selon ton processus habituel.

# 12. Automatiser le cycle avec `gh`

Voici un exemple de séquence manuelle, une fois les changements validés.

```bash
git switch -c fix/issue-42
```

Après les modifications et les tests :

```bash
git add .
git diff --cached
git commit -m "Fix issue 42"
git push -u origin fix/issue-42
```

Puis :

```bash
gh pr create \
  --title "Fix issue 42" \
  --body "Résout l'issue #42. Les tests pertinents ont été exécutés."
```

Il vaut mieux éviter `git add .` si le dépôt contient des fichiers générés, des données ou d'autres modifications sans rapport. Vérifie toujours le contenu du commit avant de le publier.

L'agent peut réaliser certaines étapes à ta place si tu lui donnes les outils et autorisations nécessaires. Il est préférable de commencer avec une PR créée mais non fusionnée automatiquement.

# 13. Les tâches d'agent proposées par GitHub CLI

Certaines versions de GitHub CLI proposent la famille de commandes `gh agent-task`, actuellement présentée comme une fonctionnalité en préversion dans la documentation consultée.

Pour vérifier si elle est disponible dans ton installation :

```bash
gh help agent-task
```

Si la commande est disponible, la documentation décrit notamment les opérations suivantes :

```bash
gh agent-task create --help
gh agent-task list
gh agent-task view --help
```

La création d'une tâche d'agent peut, selon la configuration et la version, accepter une description de travail et des options liées à la branche cible ou à un agent personnalisé.

Exemple illustratif :

```bash
gh agent-task create \
  "Analyser l'issue #42 et proposer une correction accompagnée de tests"
```

Vérifie les options prises en charge par ta version avant d'utiliser cet exemple.

**À retenir :** cette fonctionnalité n'est pas équivalente à une installation générique de n'importe quel agent IA local. Elle dépend des fonctionnalités disponibles sur ton compte, ton dépôt et ton environnement GitHub.

# 14. Les workflows agentiques avec `gh aw`

GitHub propose également une extension appelée **GitHub Agentic Workflows**, accessible par la commande `gh aw`.

Elle permet de définir des workflows faisant intervenir un moteur d'IA et de les exécuter dans l'environnement d'automatisation GitHub Actions.

Installation de l'extension :

```bash
gh extension install github/gh-aw
```

Découvrir les commandes disponibles :

```bash
gh aw --help
```

Quelques commandes documentées :

| Commande | Rôle |
|---|---|
| `gh aw init` | Initialiser un dépôt pour les workflows agentiques |
| `gh aw add-wizard` | Ajouter un workflow avec un assistant de configuration |
| `gh aw new` | Créer un nouveau workflow |
| `gh aw compile` | Compiler un workflow depuis sa source Markdown |
| `gh aw list` | Lister les workflows |
| `gh aw status` | Examiner leur état |
| `gh aw logs` | Consulter les journaux disponibles |
| `gh aw doctor` | Diagnostiquer la configuration |

Exemple de démarrage :

```bash
gh aw init
```

Pour ajouter un workflow existant à l'aide de l'assistant :

```bash
gh aw add-wizard
```

L'assistant et les étapes suivantes dépendent du workflow, du moteur IA sélectionné et de la configuration d'authentification.

## Quelle différence avec un agent local ?

| Agent local | Workflow agentique GitHub |
|---|---|
| S'exécute dans ton environnement local ou un environnement de développement | S'exécute dans un environnement d'automatisation configuré |
| Peut travailler directement sur le dépôt local | Travaille selon le contexte et les permissions du workflow |
| Peut utiliser `gh` si disponible | Peut utiliser les outils et permissions prévus dans le workflow |
| Convient aux tâches interactives et au développement quotidien | Convient aux tâches déclenchées ou répétées automatiquement |

Un workflow agentique peut, par exemple, analyser un dépôt ou aider à produire un rapport. Il ne faut toutefois pas supposer que toutes les actions sont autorisées par défaut : les permissions et les sorties permises doivent être configurées explicitement.

# 15. Faire fonctionner un agent de manière autonome : règles de sécurité

Un agent qui peut lire des fichiers et lancer des commandes dispose d'un accès plus large qu'un simple assistant conversationnel.

Si ses outils sont connectés à GitHub, il peut aussi être capable de modifier des ressources distantes.

## Principes à respecter

1. **Appliquer le moindre privilège.** Accorde uniquement les droits nécessaires.
2. **Séparer lecture et écriture.** Commence avec un accès en lecture quand c'est possible.
3. **Protéger les branches principales.** Utilise les règles de protection et les contrôles obligatoires.
4. **Exiger une revue humaine pour les changements importants.** La création d'une PR ne doit pas entraîner automatiquement sa fusion.
5. **Protéger les secrets.** Ne donne pas à l'agent accès à des tokens, clés privées ou données confidentielles dont il n'a pas besoin.
6. **Examiner les commandes proposées.** Les opérations destructives ou irréversibles doivent faire l'objet d'une vérification particulière.
7. **Contrôler les déclencheurs automatiques.** Un événement GitHub peut déclencher un workflow dans un contexte inattendu.
8. **Conserver des journaux.** Ils facilitent le diagnostic et l'audit des actions réalisées.

Les instructions données à l'agent ne remplacent pas les protections techniques. Une consigne disant « ne publie rien » est moins fiable qu'un environnement où l'agent ne possède tout simplement pas les permissions de publication.

# 16. Tableau de décision : quel mode choisir ?

| Besoin | Approche conseillée |
|---|---|
| Comprendre une erreur ou apprendre `gh` | Mode assisté |
| Modifier du code avec contrôle des changements | Agent local semi-autonome |
| Automatiser la création d'une PR | Agent avec droits d'écriture limités et revue |
| Exécuter régulièrement une analyse de dépôt | GitHub Actions ou workflow agentique |
| Modifier ou fusionner automatiquement du code critique | Contrôles renforcés, permissions minimales et validation appropriée |
| Traiter plusieurs issues indépendantes | Agent ou job orchestré avec suivi de chaque tâche |

Pour débuter, le meilleur compromis est généralement un agent qui peut lire, modifier et tester le code, mais qui ne peut ni pousser ni fusionner sans validation.

# 17. Dépannage

## `gh: command not found`

GitHub CLI n'est pas installé ou n'est pas présent dans le `PATH`.

```bash
gh --version
```

Vérifie l'installation et le chemin d'accès à l'exécutable.

## `gh auth status` signale une erreur

Relance la procédure d'authentification :

```bash
gh auth login
gh auth status
```

Vérifie aussi que le compte actif dispose des droits requis sur le dépôt concerné.

## `gh pr create` échoue

Vérifie les éléments suivants :

```bash
git status
git branch --show-current
git remote -v
gh auth status
gh repo view
```

La branche doit être prête à être publiée, le dépôt distant doit être correct et le compte doit disposer des permissions nécessaires.

## Un agent ne peut pas exécuter `gh`

Vérifie :
- que `gh` est installé dans l'environnement de l'agent ;
- que l'agent utilise le bon répertoire de travail ;
- que l'authentification est disponible dans cet environnement ;
- que les permissions suffisent à l'action demandée ;
- que la commande n'est pas bloquée par une règle de sécurité.

L'authentification présente dans ton terminal local n'est pas nécessairement disponible dans un conteneur, une machine distante ou un workflow GitHub Actions.

# 18. Mémo : les commandes à retenir

```bash
# Authentification
gh auth login
gh auth status

# Dépôt
gh repo view
gh repo clone OWNER/REPO

# Issues
gh issue list
gh issue view 42
gh issue create

# Pull requests
gh pr list
gh pr view 42
gh pr diff 42
gh pr checks 42
gh pr create

# Actions
gh workflow list
gh run list
gh run view ID
gh run watch ID

# Aide
gh help
gh pr --help
gh issue --help
```

# 19. Ressources à consulter

- Documentation officielle de GitHub CLI.
- Manuel des commandes `gh`.
- Documentation GitHub sur les agents de développement.
- Documentation GitHub sur les workflows agentiques.
- Documentation GitHub Actions.
- Documentation GitHub sur les permissions et la sécurité des dépôts.

Les fonctionnalités liées aux agents évoluent rapidement. Vérifie la documentation correspondant à la version installée, notamment pour les commandes en préversion.

# 20. Conclusion

`gh` est une interface pratique pour intégrer GitHub au terminal, aux scripts et aux outils de développement.

Associé à un agent IA, il permet de construire un cycle de travail plus efficace :

1. recevoir une tâche ou une issue ;
2. analyser le dépôt ;
3. proposer ou réaliser une modification ;
4. exécuter les tests ;
5. préparer une branche et une pull request ;
6. examiner les contrôles ;
7. valider les changements avant leur intégration.

**Le principe fondamental : automatiser les tâches répétitives, limiter les permissions et conserver des contrôles adaptés aux conséquences des actions.**
