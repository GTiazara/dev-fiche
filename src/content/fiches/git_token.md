---
title: "GitHub Token et gh : authentification et gestion des permissions"
description: "Créer et utiliser un token GitHub avec GitHub CLI, comprendre les droits de lecture et d'écriture, et sécuriser l'accès d'un agent IA autonome."
technology: devtools
difficulty: intermediaire
tags:
  - github
  - gh
  - token
  - pat
  - authentification
  - permissions
  - securite
  - agent-ia
publishedAt: 2026-10-27
updatedAt: 2026-10-27
draft: false
quiz:
  - question: "Quelle variable d'environnement permet à gh d'utiliser un token sur github.com ?"
    choices:
      - "GIT_PASSWORD"
      - "GH_TOKEN"
      - "GITHUB_USER"
    answer: 1
    explanation: "GH_TOKEN fournit le token que gh utilise pour github.com. GIT_PASSWORD et GITHUB_USER ne jouent pas ce rôle."
  - question: "Quel niveau d'accès faut-il privilégier pour un agent qui doit uniquement consulter le code ?"
    choices:
      - "Administration"
      - "Lecture seule"
      - "Accès complet"
    answer: 1
    explanation: "Un agent qui ne fait que lire le code se contente d'un accès en lecture. L'écriture et l'administration élargissent le risque."
  - question: "Un token peut-il donner accès à un dépôt auquel son propriétaire n'a pas accès ?"
    choices:
      - "Oui, toujours"
      - "Non, il ne peut pas dépasser les accès et permissions qui lui sont accordés"
      - "Oui, si le token n'expire jamais"
    answer: 1
    explanation: "Un token reste limité aux dépôts et aux droits accordés à son propriétaire. Une absence d'expiration n'ajoute pas de dépôts."
---

# 1. Qu'est-ce qu'un token GitHub ?

Un **Personal Access Token (PAT)** est un jeton permettant de s'authentifier auprès de GitHub sans utiliser directement son mot de passe.

Avec GitHub CLI (`gh`), un token permet d'exécuter des commandes authentifiées, par exemple pour consulter un dépôt, créer une issue ou proposer une pull request.

Un token doit être considéré comme un **mot de passe technique** : une personne ou un programme qui le récupère peut potentiellement l'utiliser jusqu'à son expiration ou sa révocation.

Documentation : [Gestion des tokens personnels GitHub](https://docs.github.com/fr/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).

# 2. Les trois éléments à distinguer

Pour comprendre les accès, il faut distinguer trois notions.

| Notion | Question | Exemple |
|---|---|---|
| Identité | Qui s'authentifie ? | Un compte GitHub |
| Permissions | Quelles opérations sont autorisées ? | Lire le code ou créer une PR |
| Périmètre | Sur quelles ressources ? | Un dépôt spécifique |

Un token ne donne pas automatiquement tous les droits sur GitHub. Il est limité par les permissions accordées, les accès de son propriétaire et les éventuelles politiques de l'organisation.

# 3. Les principaux types de tokens

## A. Fine-grained Personal Access Token

C'est généralement le meilleur choix lorsqu'un token personnel est nécessaire pour un usage limité à certains dépôts.

Il permet notamment de définir :
- le propriétaire des ressources concernées ;
- les dépôts accessibles ;
- les permissions par catégorie de ressource ;
- une date d'expiration.

Il est particulièrement utile lorsqu'un outil ou un agent doit travailler sur un seul dépôt.

## B. Personal Access Token classic

Le token classique utilise un système de scopes plus général.

Il peut être nécessaire pour certains usages anciens ou certaines fonctionnalités qui ne sont pas couvertes par les tokens affinés.

Il peut donner un accès plus large que nécessaire si ses scopes sont trop permissifs.

**Recommandation :** privilégie un token finement limité lorsqu'il couvre les besoins de ton utilisation.

## C. `GITHUB_TOKEN` dans GitHub Actions

Dans un workflow GitHub Actions, la variable `GITHUB_TOKEN` représente un token temporaire fourni pour le workflow.

Ses permissions peuvent être configurées dans le fichier YAML.

Exemple en lecture seule :

```yaml
permissions:
  contents: read
```

Exemple autorisant également la création ou la modification de pull requests :

```yaml
permissions:
  contents: read
  pull-requests: write
```

Ces exemples ne donnent que les permissions indiquées. Certaines opérations peuvent nécessiter des permissions supplémentaires.

**À retenir :** pour un workflow GitHub Actions, préfère le token intégré quand il suffit, plutôt qu'un token personnel durable.

# 4. Les principales permissions

Les tokens à permissions affinées permettent d'accorder des droits par catégorie de ressource. Les droits exacts disponibles dépendent de la fonctionnalité utilisée.

| Permission | Lecture (`read`) | Écriture (`write`) | Administration (`admin`), si proposée |
|---|---|---|---|
| Contents | Lire le code et les fichiers | Modifier le contenu du dépôt | Gérer certains paramètres liés au contenu |
| Issues | Lire les issues | Créer ou modifier des issues et certains commentaires | Selon les capacités disponibles |
| Pull requests | Lire les PR et leurs informations | Créer ou modifier des PR et certaines revues | Selon les capacités disponibles |
| Actions | Consulter les workflows et leurs exécutions | Déclencher ou modifier certaines opérations liées aux Actions | Gérer des paramètres plus sensibles |
| Workflows | Consulter les fichiers de workflow | Modifier certains fichiers de workflow | — |
| Metadata | Consulter certaines métadonnées du dépôt | Généralement lecture seule | — |
| Discussions | Lire les discussions | Publier ou modifier du contenu pris en charge | Selon les capacités disponibles |
| Administration | Lire certains paramètres, si permis | — | Gérer des paramètres administratifs du dépôt |

Les possibilités précises varient selon les ressources et les points de terminaison de l'API. Certains actes nécessitent plusieurs permissions simultanées.

Documentation : [Permissions requises pour les tokens affinés](https://docs.github.com/fr/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens).

# 5. Quels droits donner à un agent IA ?

Le bon choix dépend de ce que tu souhaites lui permettre de faire.

| Mission de l'agent | Accès indicatif |
|---|---|
| Lire le code et répondre à des questions | `Contents: read` |
| Examiner les issues | `Issues: read` |
| Lire les pull requests | `Pull requests: read` |
| Analyser les workflows | `Actions: read` |
| Créer ou modifier des issues | `Issues: write` |
| Créer une pull request | `Pull requests: write` et accès de lecture au contenu nécessaire |
| Pousser des modifications de code | `Contents: write` |
| Modifier des workflows | Permissions supplémentaires appropriées, notamment selon la gestion des fichiers de workflow |
| Modifier les paramètres du dépôt | Droits administratifs spécifiques, uniquement si indispensables |

Ces droits sont indicatifs : vérifie les exigences de l'opération souhaitée avant de créer le token.

## Exemple 1 : agent lecteur

L'agent doit :
- comprendre le code ;
- lire les issues ;
- examiner les PR ;
- proposer des modifications dans son environnement local.

Il n'a pas besoin de publier ses modifications sur GitHub.

Privilégie les droits de lecture et garde les opérations d'écriture sous ton contrôle.

## Exemple 2 : agent qui prépare des pull requests

L'agent doit :
- lire le code ;
- créer une branche ;
- pousser des changements ;
- ouvrir une PR.

Il lui faut des permissions d'écriture adaptées au dépôt et à la création de PR.

Cela ne signifie pas qu'il doit pouvoir fusionner les PR ou administrer le dépôt.

## Exemple 3 : agent d'administration

Un agent chargé de modifier des paramètres du dépôt peut nécessiter des droits administratifs.

C'est un niveau de risque nettement plus élevé. Évite de donner ce type de permission à un agent généraliste qui effectue simplement des tâches de programmation.

# 6. Créer un token GitHub

Pour créer un token personnel à permissions affinées :

1. Ouvre les paramètres de ton compte GitHub.
2. Accède aux paramètres de développeur.
3. Ouvre la section des tokens personnels affinés.
4. Crée un nouveau token.
5. Choisis un nom explicite, par exemple `agent-dev-test`.
6. Sélectionne le propriétaire des dépôts.
7. Limite l'accès aux seuls dépôts nécessaires.
8. Choisis une expiration.
9. Sélectionne les permissions requises.
10. Crée le token et copie-le dans un emplacement sécurisé.

Le token ne doit pas être enregistré dans le dépôt, dans un fichier de configuration versionné ou dans les instructions données à un agent IA.

La disponibilité des droits peut également dépendre de l'approbation de l'organisation propriétaire du dépôt.

# 7. Utiliser le token avec `gh`

Pour GitHub CLI, la méthode dépend du type de token et du contexte d'exécution.

## Méthode recommandée pour un token affiné : `GH_TOKEN`

Dans un terminal Bash, définis le token dans l'environnement courant :

```bash
read -rsp "Token GitHub : " GH_TOKEN
echo
export GH_TOKEN

gh auth status
gh repo view OWNER/REPO
```

Le token est saisi sans être affiché par le terminal. Cette méthode évite de l'écrire en clair dans la commande.

Pour terminer la session :

```bash
unset GH_TOKEN
```

Remplace `OWNER/REPO` par le dépôt concerné.

`GH_TOKEN` est prioritaire sur les identifiants enregistrés localement pour les commandes visant `github.com`. Vérifie donc quel token est effectivement utilisé avant d'effectuer une opération sensible.

Documentation : [Variables d'environnement de GitHub CLI](https://cli.github.com/manual/gh_help_environment).

## Méthode alternative : `gh auth login --with-token`

Cette méthode est principalement documentée pour les tokens personnels classiques.

```bash
gh auth login --with-token < mon-token.txt
```

Le fichier `mon-token.txt` contient le token. Il doit être protégé et ne doit jamais être ajouté au dépôt.

Attention : GitHub CLI recommande de privilégier `GH_TOKEN` pour les tokens à permissions affinées, car leur périmètre restreint peut produire des comportements inattendus avec `--with-token`.

Évite de conserver un token dans un fichier ordinaire si une méthode plus sûre est disponible.

# 8. Utiliser un token dans un script

Exemple d'utilisation d'un token fourni par l'environnement :

```bash
#!/usr/bin/env bash
set -euo pipefail

: "${GH_TOKEN:?La variable GH_TOKEN doit être définie}"

gh auth status
gh issue list --repo OWNER/REPO
```

Ce script vérifie la présence de la variable et consulte les issues du dépôt.

Le token n'est pas inscrit dans le script. L'environnement d'exécution doit fournir la variable de manière sécurisée.

Évite les pratiques suivantes :

```bash
# À NE PAS FAIRE
export GH_TOKEN="COLLER_LE_TOKEN_ICI"
```

Ne place pas de véritable token dans un script, un historique de commandes, un fichier `.env` versionné ou un message adressé à un agent IA.

# 9. Configurer le token dans GitHub Actions

Pour une automatisation hébergée par GitHub Actions, commence par le token intégré au workflow.

Exemple de lecture du dépôt :

```yaml
name: Analyse du dépôt

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  analyse:
    runs-on: ubuntu-latest
    steps:
      - name: Récupérer le dépôt
        uses: actions/checkout@v4

      - name: Vérifier GitHub CLI
        env:
          GH_TOKEN: ${{ github.token }}
        run: gh repo view "$GITHUB_REPOSITORY"
```

Cet exemple fournit un accès en lecture au contenu du dépôt. Il ne permet pas automatiquement de publier des modifications.

Pour créer une PR, il faut ajuster les permissions et les étapes du workflow en fonction de la tâche.

Si le token intégré ne permet pas une opération, vérifie d'abord si le workflow peut être configuré avec des permissions plus précises avant d'ajouter un token personnel.

# 10. Sécuriser l'utilisation par un agent IA

Un agent peut exécuter des commandes et éventuellement accéder aux variables d'environnement de son processus. Il ne faut donc pas lui transmettre un token plus puissant que nécessaire.

## Bonnes pratiques

- Utilise un token réservé à une tâche ou à un contexte particulier.
- Limite le token aux dépôts nécessaires.
- Commence par les droits de lecture.
- Accorde l'écriture uniquement si l'agent doit réellement publier des modifications.
- Définis une expiration adaptée.
- Évite les droits administratifs.
- Ne place jamais le token dans le prompt, les fichiers du projet ou les journaux.
- Contrôle les commandes qui modifient ou suppriment des ressources.
- Protège les branches importantes et impose des contrôles de PR.
- Révoque immédiatement un token suspect ou exposé.

**Important :** un prompt demandant à un agent de ne pas modifier certains éléments ne remplace pas les permissions GitHub. Si le token permet une action, l'agent peut techniquement tenter de l'effectuer.

# 11. Quel niveau d'accès choisir ?

| Profil | Permissions conseillées |
|---|---|
| Assistant qui explique le code | Lecture seule |
| Agent qui analyse les issues | Lecture sur le contenu et les issues |
| Agent qui propose des changements locaux | Lecture distante, écriture locale |
| Agent qui publie des PR | Écriture strictement limitée aux opérations nécessaires |
| Agent qui fusionne automatiquement | Éviter par défaut ; protections et validations renforcées nécessaires |
| Agent administrateur | À réserver à un besoin précis et à un environnement contrôlé |

Pour un premier agent de développement, une configuration où l'agent peut analyser le dépôt et préparer une correction sans publier directement sur GitHub est un bon point de départ.

# 12. Vérifier et révoquer un token

Vérifie l'état de l'authentification :

```bash
gh auth status
```

Si tu utilises `GH_TOKEN`, vérifie aussi quelle variable est présente, sans afficher sa valeur :

```bash
if [[ -n "${GH_TOKEN:-}" ]]; then
  echo "GH_TOKEN est défini"
else
  echo "GH_TOKEN n'est pas défini"
fi
```

Pour supprimer une authentification enregistrée localement :

```bash
gh auth logout
```

Cette commande supprime la configuration locale correspondante, mais **ne révoque pas à elle seule tous les tokens auprès de GitHub**.

Si un token est exposé, révoque-le dans les paramètres de GitHub et crée-en un nouveau si nécessaire.

# 13. Références officielles

- [Créer et gérer des tokens personnels](https://docs.github.com/fr/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [Permissions des tokens affinés](https://docs.github.com/fr/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens)
- [Authentification de GitHub CLI](https://cli.github.com/manual/gh_auth_login)
- [Variables d'environnement de GitHub CLI](https://cli.github.com/manual/gh_help_environment)
- [Sécuriser les secrets dans GitHub Actions](https://docs.github.com/fr/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)

# 14. Conclusion

Pour connecter `gh` à un agent IA, il faut définir précisément son périmètre d'action.

Le principe à retenir est simple :

**Identité + permissions minimales + dépôts ciblés + expiration + validation adaptée.**

Pour un agent qui doit seulement lire et analyser du code, commence avec un accès en lecture. Pour un agent qui doit créer des PR, ajoute les permissions d'écriture nécessaires, sans lui accorder automatiquement le droit de fusionner ou d'administrer le dépôt.