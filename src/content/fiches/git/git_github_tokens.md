---
title: "Tokens GitHub : PAT classic, fine-grained et principaux droits"
description: "Distinguer personal access tokens classic et fine-grained, choisir scopes ou permissions minimales, et authentifier Git ou l'API en toute sécurité."
technology: git
difficulty: intermediaire
tags:
  - git
  - github
  - token
  - pat
  - fine-grained
  - classic
  - permissions
  - securite
publishedAt: 2026-11-23
updatedAt: 2026-11-23
draft: false
quiz:
  - question: "Que recommande GitHub entre PAT classic et fine-grained, quand les deux conviennent ?"
    choices:
      - "Toujours le classic, plus large"
      - "Le fine-grained : dépôt(s) et permissions plus ciblés"
      - "Aucun des deux : seulement un mot de passe de compte"
    answer: 1
    explanation: "La doc Managing PATs recommande les fine-grained dès que le scénario le permet."
  - question: "Pour cloner / pousser le code d'un dépôt privé avec un fine-grained, quelle permission suffit en général ?"
    choices:
      - "Metadata: read uniquement"
      - "Contents: read pour pull ; Contents: write pour push (write inclut read)"
      - "Workflows: write uniquement"
    answer: 1
    explanation: "Contents couvre le code Git. write inclut toujours read d'après GitHub."
  - question: "Un PAT classic avec le scope repo…"
    choices:
      - "Ne voit qu'un seul dépôt choisi à la création"
      - "Accède à tous les dépôts (perso et orgs) auxquels votre compte a déjà accès, dans la limite du scope"
      - "N'autorise jamais le push"
    answer: 1
    explanation: "Le classic ne restreint pas la liste des dépôts : d'où le risque plus élevé."
  - question: "Un token peut-il donner plus de droits que son propriétaire ?"
    choices:
      - "Oui, si on coche admin:org"
      - "Non : scopes/permissions limitent, sans dépasser les droits du compte"
      - "Oui, uniquement sur les gists"
    answer: 1
    explanation: "GitHub : le token hérite des capacités du propriétaire, puis est encore restreint."
  - question: "Pour ouvrir une PR via l'API avec un fine-grained, quels droits minimaux typiques ?"
    choices:
      - "Uniquement Notifications: read"
      - "Contents (souvent write) et Pull requests: write sur le(s) dépôt(s)"
      - "Uniquement delete_repo"
    answer: 1
    explanation: "Créer une PR exige Pull requests write ; pousser la branche exige Contents write. Merger passe aussi par Contents."
---

## Définition

Un **personal access token (PAT)** GitHub remplace le mot de passe pour l'**API**, **Git en HTTPS**, et certains outils (`gh`, IDE…). C'est un **secret** : quiconque le possède agit dans la limite des droits du token **et** de ceux du compte.

GitHub propose deux modèles de PAT personnels :

| Modèle | Dans l'UI | Principe |
| --- | --- | --- |
| **Classic** | *Tokens (classic)* | **Scopes** larges (`repo`, `workflow`…) sur **tous** les dépôts accessibles au compte |
| **Fine-grained** | *Fine-grained tokens* | Un **resource owner** (vous **ou** une org) + dépôts choisis + permissions **read / write / admin** par ressource |

GitHub **recommande** le fine-grained dès que le cas d'usage le permet. Pour une intégration durable au nom d'une org : plutôt une **GitHub App** qu'un PAT perso.

## Classic vs fine-grained

### Points communs

- Liés à l'utilisateur qui les crée ; inactifs si le compte perd l'accès à la ressource.
- **Ne peuvent pas** octroyer plus de droits que le propriétaire (ex. `admin:org` sans être owner d'org → pas d'admin magique).
- À traiter comme un mot de passe ; expiration recommandée (les classic inutilisés depuis un an sont retirés automatiquement).

### PAT classic (scopes)

Le scope définit le **type** d'action, **pas** la liste des dépôts : un classic voit en pratique **tout** ce que votre compte voit.

| Scope | Usage principal |
| --- | --- |
| `repo` | Accès **complet** aux dépôts privés et publics (code, hooks, invitations, déploiements, etc.) — très large |
| `public_repo` | Lecture/écriture limitée aux dépôts **publics** |
| `repo:status` / `repo_deployment` | Statuts de commit / déploiements sans forcément tout le code |
| `workflow` | Ajouter / mettre à jour des fichiers de workflow Actions |
| `write:packages` / `read:packages` / `delete:packages` | GitHub Packages |
| `delete_repo` | Supprimer des dépôts administrables |
| `admin:org` / `write:org` / `read:org` | Organisation, équipes, membership |
| `admin:repo_hook` / `write:repo_hook` / `read:repo_hook` | Webhooks de dépôt |
| `notifications` | Notifications, watch, abonnements |
| `user` / `read:user` / `user:email` | Profil / e-mails |
| `gist` | Écriture sur les gists |
| `project` / `read:project` | Projects |
| `codespace` | Gérer des Codespaces |
| `(aucun scope)` | Infos **publiques** en lecture seule |

Table complète : [Scopes for OAuth apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps) (mêmes scopes que les classic PAT).

Les owners d'org peuvent **interdire** les classic sur leur organisation → 403 ; passer en fine-grained, App ou OAuth.

### PAT fine-grained (permissions)

À la création :

1. **Resource owner** — compte utilisateur **ou** **une** organisation (pas plusieurs orgs sur le même token) ;
2. **Repository access** — tous les dépôts de ce owner, ou une **sélection** (accès lecture aux dépôts publics GitHub toujours inclus) ;
3. **Permissions** — par catégorie, niveaux `read`, `write`, parfois `admin`.

Règles GitHub :

- **`write` inclut `read`** ; **`admin` inclut `write`** ;
- le token reste plafonné par **vos** droits sur le dépôt / l'org ;
- une org peut exiger une **approbation** (token `pending` : lecture publique seulement en attendant).

Limite : **50** fine-grained par utilisateur ; au-delà, viser une GitHub App.

#### Limitations actuelles du fine-grained

D'après la doc GitHub (liste évolutive) :

- contribuer à des dépôts **publics** où vous n'êtes pas membre ;
- accès en tant que **outside collaborator** ;
- **plusieurs organisations** avec un seul token ;
- **Packages** ;
- **Checks API** ;
- **Projects** d'un compte utilisateur.

Dans ces cas, un **classic** (ou une App) peut encore être nécessaire.

## Permissions fine-grained les plus utiles

### Dépôt (repository)

| Permission (UI) | Niveaux | Usage typique |
| --- | --- | --- |
| **Contents** | read / write | Lire le code ; **clone / pull** (read) ; **push** (write) |
| **Metadata** | read | Métadonnées du dépôt (souvent indispensable ; accès de base) |
| **Pull requests** | read / write | Lister, créer, commenter des PR |
| **Issues** | read / write | Issues et commentaires associés |
| **Actions** | read / write | Workflows runs, artefacts |
| **Workflows** | write | Modifier les fichiers `.github/workflows` |
| **Administration** | read / write | Paramètres sensibles du dépôt — à éviter par défaut |
| **Secrets** / **Variables** | read / write | Secrets / variables Actions du dépôt |
| **Deployments**, **Environments**, **Pages** | read / write | Selon le pipeline de déploiement |
| **Discussions** | read / write | Discussions du dépôt |

Piège fréquent : **merger** une PR via l'API relève souvent de **Contents: write**, pas seulement de Pull requests.

### Organisation (si resource owner = org)

Exemples : **Members**, **Organization projects**, **Organization secrets**, self-hosted runners, administration d'org. À n'accorder que si l'automation le exige.

### Compte (si resource owner = vous)

Exemples : e-mails, clés SSH/GPG, gists, Copilot requests. Uniquement quand le owner est votre utilisateur.

Référence endpoint par endpoint : [Permissions required for fine-grained PATs](https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens). L'en-tête de réponse `X-Accepted-GitHub-Permissions` indique ce qui manque.

## Quel token pour quel usage ?

| Besoin | Choix recommandé |
| --- | --- |
| Clone / pull d'un dépôt privé | Fine-grained : **Contents: read** (+ Metadata) sur ce dépôt |
| Push de branches | Fine-grained : **Contents: write** |
| Ouvrir une PR | **Contents: write** + **Pull requests: write** |
| Lire issues / commenter | **Issues: read** ou **write** |
| Modifier un workflow Actions | **Workflows: write** (et Contents selon les fichiers) |
| Packages | Souvent **classic** (`read:packages` / `write:packages`) tant que le fine-grained ne couvre pas Packages |
| Outside collaborator / multi-org | Classic ou GitHub App |
| CI dans un workflow | **`GITHUB_TOKEN`** du job, pas un PAT perso durable |
| Intégration org long terme | **GitHub App** |

## Créer un token

### Fine-grained

1. Avatar → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
2. **Generate new token**
3. Nom, expiration, description
4. **Resource owner** (vous ou une org)
5. **Repository access** (sélection minimale)
6. Permissions repository / org / account minimales
7. **Generate token** — secret affiché **une seule fois**

Modèles d'URL préremplis possibles (`contents=read`, `pull_requests=write`, …) : doc *Managing your personal access tokens*.

### Classic

1. Même zone → **Tokens (classic)**
2. **Generate new token (classic)**
3. Note, expiration, **scopes**
4. **Generate token**
5. Si l'org utilise le **SAML SSO** : **Authorize** le token pour cette org

## S'authentifier

### API REST

```bash
curl -H "Authorization: Bearer <TOKEN>" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user
```

(`Authorization: token <TOKEN>` reste aussi documenté.)

### Git HTTPS

- Username : `x-access-token` (ou votre login ; certaines recettes utilisent le token en username)
- Password : le PAT

```bash
git clone https://github.com/OWNER/REPO.git
# password = le personal access token
```

Éviter `https://USER:TOKEN@github.com/...` : le secret finit dans l'historique et souvent dans `.git/config`.

### GitHub CLI

```bash
# Fine-grained : privilégier GH_TOKEN dans l'environnement
export GH_TOKEN  # après saisie sécurisée, sans l'afficher
gh auth status
```

Pour un classic, `gh auth login --with-token` est aussi documenté. Détails : fiche / doc `gh` associée.

## Alternatives plus sûres

| Contexte | Préférer |
| --- | --- |
| Ligne de commande interactive | `gh auth login` / Git Credential Manager |
| Workflow Actions | `permissions:` + `GITHUB_TOKEN` |
| Automation org | GitHub App |

## Erreurs fréquentes

| Symptôme | Cause | Action |
| --- | --- | --- |
| 401 | Token révoqué / expiré / mauvais header | Régénérer ; `Bearer` correct |
| 403 sur une org | Classic interdit, fine-grained non approuvé, SSO non autorisé | Politique org ; Approve SSO ; attendre l'approval fine-grained |
| `Resource not accessible by personal access token` | Permission fine-grained manquante | Lire `X-Accepted-GitHub-Permissions` ; ajuster Contents / PR / Issues… |
| Push OK, merge API KO | Manque **Contents: write** | Ajouter Contents write |
| Packages / Checks / multi-org | Limite fine-grained | Classic ciblé ou App |

## À retenir

- Préférer un **fine-grained** : un owner, des dépôts précis, permissions minimales.
- **Classic** = scopes larges sur **tous** vos dépôts — dernier recours ou gaps (Packages, outside collaborator…).
- **Contents** = code Git ; **Pull requests** / **Issues** = collaboration ; `write` ⊃ `read`.
- Le token **ne dépasse jamais** les droits du compte.
- En Actions : **`GITHUB_TOKEN`** ; en prod org : **GitHub App**.
- Expiration, un token par usage, jamais dans le dépôt.

## Sources

- [Managing your personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) — classic vs fine-grained, création, limites.
- [Scopes for OAuth apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps) — scopes classic.
- [Permissions required for fine-grained personal access tokens](https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens) — mapping API.
- [Authenticating to the REST API](https://docs.github.com/en/rest/authentication/authenticating-to-the-rest-api).
- [Introducing fine-grained PATs](https://github.blog/security/application-security/introducing-fine-grained-personal-access-tokens-for-github/) — annonce GitHub Blog.
- Version FR : [Gérer vos personal access tokens](https://docs.github.com/fr/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).
