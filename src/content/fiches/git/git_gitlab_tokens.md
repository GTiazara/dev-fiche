---
title: "Tokens GitLab : PAT legacy, fine-grained et principaux droits"
description: "Distinguer personal access tokens legacy et fine-grained, choisir les scopes ou permissions minimales, et authentifier Git ou l'API en toute sécurité."
technology: git
difficulty: intermediaire
tags:
  - git
  - gitlab
  - token
  - pat
  - fine-grained
  - legacy
  - permissions
  - securite
publishedAt: 2026-11-23
updatedAt: 2026-11-23
draft: false
quiz:
  - question: "Quelle est la différence principale entre un PAT legacy et un fine-grained ?"
    choices:
      - "Le legacy expire toujours, le fine-grained jamais"
      - "Le legacy utilise des scopes larges sur tout ce que l'utilisateur voit ; le fine-grained limite ressources, permissions et périmètre"
      - "Le fine-grained ne sert qu'à GitLab CI"
    answer: 1
    explanation: "La doc GitLab oppose des scopes (api, read_repository…) à un modèle ressource + permission + boundary."
  - question: "Pour cloner un dépôt privé en HTTPS avec un token fine-grained, quelle permission faut-il ?"
    choices:
      - "Container Repository → Delete"
      - "Code → Download sur le projet"
      - "sudo"
    answer: 1
    explanation: "Git over HTTPS : Code / Download pour clone-pull ; Code / Push pour pousser."
  - question: "Que permet le scope legacy write_repository ?"
    choices:
      - "Uniquement l'API REST complète"
      - "Pull et push Git-over-HTTP sur le périmètre du token ; pas l'auth API"
      - "Uniquement lire les issues"
    answer: 1
    explanation: "write_repository = Git pull/push. L'API complète demande plutôt api (ou un fine-grained adapté)."
  - question: "Une requête avec un token fine-grained est autorisée si…"
    choices:
      - "Seul le token a la permission, même si l'utilisateur n'a pas le droit"
      - "Le token a la permission sur la ressource ET le propriétaire du token a lui-même le droit d'agir"
      - "Le token commence par glpat-"
    answer: 1
    explanation: "Double contrôle documenté par GitLab : token puis droits du propriétaire."
  - question: "Le scope legacy api sur un PAT personnel, c'est…"
    choices:
      - "Lecture seule d'un seul projet"
      - "Lecture/écriture API très large sur les groupes et projets accessibles à l'utilisateur (à éviter si un droit plus étroit suffit)"
      - "Uniquement le calendrier d'expiration"
    answer: 1
    explanation: "api est le scope le plus permissif courant. Préférer read_api, write_repository ou un fine-grained ciblé."
---

## Définition

Un **personal access token (PAT)** GitLab authentifie un utilisateur auprès de l'**API**, de **Git en HTTPS**, du registry, etc. C'est un **secret** : quiconque le possède agit dans la limite des droits du token **et** de ceux du compte.

GitLab propose deux modèles de PAT personnels :

| Modèle | Dans l'UI | Principe |
| --- | --- | --- |
| **Legacy** | *Legacy token* | **Scopes** prédéfinis (`api`, `read_repository`…) sur **tous** les groupes/projets accessibles à l'utilisateur |
| **Fine-grained** | *Fine-grained token* | **Ressources** + **permissions** (souvent Create / Read / Update / Delete) + **périmètre** (projets/groupes choisis, User, Global) |

Les **group access tokens** et **project access tokens** sont d'autres types (liés à un groupe ou un projet, pas à votre profil). Cette fiche traite surtout les **PAT personnels**.

## Legacy vs fine-grained

### PAT legacy (scopes)

Vous cochez un ou plusieurs **scopes**. Un PAT personnel legacy peut atteindre **tout** ce que votre compte voit : le scope ne réduit pas la liste des projets, seulement le **type** d'action.

| Scope | Usage principal |
| --- | --- |
| `api` | Lecture **et** écriture API (très large). Pour un PAT perso, inclut aussi registry / dépôt via Git-over-HTTP |
| `read_api` | Lecture API (registry / packages selon le type de token) |
| `read_repository` | **Pull** Git-over-HTTP (+ files API) |
| `write_repository` | **Pull et push** Git-over-HTTP ; **pas** l'auth API |
| `read_registry` / `write_registry` | Pull / push d'images container registry |
| `read_virtual_registry` / `write_virtual_registry` | Dependency proxy |
| `create_runner` / `manage_runner` | Créer / gérer des runners |
| `ai_features` | APIs GitLab Duo (selon offre / version) |
| `k8s_proxy` | Appels Kubernetes via l'agent |
| `self_rotate` | Faire tourner **ce** token |
| `read_user` | Profil utilisateur authentifié (`/user`, lecture `/users`) |
| `sudo` | Agir comme n'importe quel utilisateur (**admin** seulement) — très sensible |
| `admin_mode` | Actions API en Admin Mode (**admin** Self-Managed) |

La table complète et à jour : [Access token scopes](https://docs.gitlab.com/security/tokens/access_token_scopes/).

### PAT fine-grained (ressources + permissions)

À la création, vous définissez :

1. **Où** — accès groupe/projet : projets personnels seulement, tous vos memberships, ou une **sélection** ;
2. **Quoi** — ressources regroupées en boundaries **Group and project**, **User**, **Global** ;
3. **Comment** — permissions par ressource (souvent CRUD, parfois Download / Push / Use).

Chaque requête API exige **deux** conditions (doc GitLab) :

1. le token a la permission sur la ressource demandée ;
2. **vous** avez déjà le droit d'effectuer l'opération.

Le token ne peut donc pas « gagner » des droits que votre compte n'a pas.

Listes détaillées :

- [Fine-grained personal access tokens](https://docs.gitlab.com/auth/tokens/fine_grained_access_tokens/)
- [Permissions REST](https://docs.gitlab.com/auth/tokens/fine_grained_access_tokens_rest/)
- [Permissions Git et autres](https://docs.gitlab.com/auth/tokens/fine_grained_access_tokens_other/)

## Droits fine-grained les plus utiles

### Git (HTTPS)

| Opération | Resource | Permission |
| --- | --- | --- |
| Clone / pull | **Code** | **Download** |
| Push | **Code** | **Push** |
| LFS download / upload | **Code** | **Download** / **Push** |
| Archive du dépôt | **Code** | **Download** |

### Travail quotidien API / UI automatisée

| Besoin typique | Resource (exemples) | Permissions usuelles |
| --- | --- | --- |
| Lire / gérer des MR | **Merge Request** | Read, Create, Update… |
| Issues / work items | **Work Item** | Read, Create, Update… |
| Pipelines / jobs | ressources CI liées au projet (voir table REST) | Read / Update selon l'endpoint |
| Lire le projet | **Project** | Read |

Les noms exacts dans l'UI suivent la doc REST : une action manquante = 403 même si votre rôle projet le permettrait.

### Container registry (limite importante)

| Opération | Resource | Permission |
| --- | --- | --- |
| Pull d'images | **Container Repository** | **Read** |
| Supprimer images / tags | **Container Repository** | **Delete** |

D'après GitLab : **on ne peut pas pousser** d'images registry avec un PAT **fine-grained**. Pour un `docker push`, rester sur un token **legacy** (`write_registry` + souvent `read_registry`) ou un autre mécanisme adapté.

## Quel token pour quel usage ?

| Besoin | Choix recommandé |
| --- | --- |
| Clone / pull d'un projet | Fine-grained : **Code → Download** sur ce projet ; ou legacy `read_repository` |
| Push de code | Fine-grained : **Code → Push** ; ou legacy `write_repository` |
| Script API limité (MR, issues) | Fine-grained : ressources MR / Work Item + périmètre projet |
| Automatisation large « comme mon compte » | Legacy `api` — **dernier recours** (surface d'attaque maximale) |
| Push d'images Docker | Legacy `read_registry` + `write_registry` (fine-grained : pas de push) |
| CI/CD dans un pipeline | Préférer un **CI job token** ou un **project/group access token**, pas votre PAT perso |
| Impersonation admin | Legacy `sudo` ou fine-grained avec capacité sudo (admin) — **très restreint** |

Principe : **un token par usage**, expiration courte, droits minimaux.

## Créer un token

Chemin commun (avatar → **Edit profile** → **Access** → **Personal access tokens**) :

### Fine-grained

1. **Generate token** → *Fine-grained token*
2. Nom, description, **date d'expiration** (défaut 365 jours si vide ; plafond souvent 365 jours, modifiable par admin)
3. Choisir l'accès **Group and project**
4. Ajouter les **resource permissions** (onglets Group and project / User / Global)
5. **Generate token** — le secret n'est montré **qu'une fois**

### Legacy

1. **Generate token** → *Legacy token*
2. Nom, description, expiration
3. Cocher les **scopes**
4. **Generate token**

## S'authentifier

### API REST

```bash
curl --header "PRIVATE-TOKEN: <votre_token>" \
  --url "https://gitlab.example.com/api/v4/projects"
```

### Git HTTPS

- **Username** : n'importe quelle chaîne non vide (GitLab ne la valide pas comme identité)
- **Password** : le personal access token

```bash
git clone https://gitlab.example.com/namespace/projet.git
# au prompt : password = le token
```

Éviter d'incruster le token dans l'URL (`https://user:token@…`) : il finit dans l'historique shell et souvent dans `.git/config`.

Avec **glab** : suivre la doc d'auth de la CLI (`glab auth login`) plutôt que de coller le token dans des scripts versionnés.

## Rotation, révocation, expiration

- **Rotate** : nouveau secret, mêmes droits ; l'ancien devient inactif tout de suite.
- **Revoke** : invalidation immédiate.
- Expiration à **minuit UTC** le jour choisi ; mails de rappel (7 / 30 / 60 jours selon version).

Si le token fuit : **révoquer** immédiatement, puis en créer un nouveau plus étroit.

## Obligation du fine-grained (admin / owner)

Les instances / groupes peuvent **exiger** les fine-grained après une date :

- au niveau d'un **groupe racine** (Owner) ;
- ou de toute l'**instance** Self-Managed (admin).

Après la date, les legacy peuvent être **refusés** sur ces ressources (ou la création de legacy bloquée selon le mode). Les group / project access tokens et certains tokens de service accounts ne sont pas forcément concernés de la même façon — voir la doc *Enforce fine-grained personal access tokens*.

## Erreurs fréquentes

| Symptôme | Cause | Action |
| --- | --- | --- |
| 401 / auth failed | Token expiré, révoqué, ou mauvais header | Vérifier PAT actifs ; `PRIVATE-TOKEN` |
| 403 sur une API | Permission fine-grained manquante ou rôle projet insuffisant | Ajouter la resource/permission ; vérifier votre rôle |
| Push Git refusé | Pas de `write_repository` / pas de **Code → Push** | Étendre le token ou le périmètre |
| `docker push` KO avec fine-grained | Non supporté pour ce type de PAT | Legacy registry scopes |
| Token « trop large » après fuite | Scope `api` sur tout le compte | Révoquer ; repasser en fine-grained ciblé |

## À retenir

- **Legacy** = scopes larges sur tout votre accès ; **fine-grained** = ressource + permission + périmètre.
- Double contrôle fine-grained : droits du **token** et droits du **compte**.
- Git : **Code → Download** (pull), **Code → Push** (push) ; legacy : `read_repository` / `write_repository`.
- Éviter `api` et `sudo` sauf nécessité réelle.
- Fine-grained : **pas de push** container registry (doc GitLab).
- Expiration, rotation, un token par usage ; jamais dans le dépôt.

## Sources

- [Personal access tokens](https://docs.gitlab.com/user/profile/personal_access_tokens/) — création, Git HTTPS, API, rotation.
- [Access token scopes](https://docs.gitlab.com/security/tokens/access_token_scopes/) — scopes legacy.
- [Fine-grained personal access tokens](https://docs.gitlab.com/auth/tokens/fine_grained_access_tokens/) — modèle, double contrôle, enforcement.
- [Fine-grained permissions for Git and other operations](https://docs.gitlab.com/auth/tokens/fine_grained_access_tokens_other/) — Code Download/Push, registry, feeds.
- [Fine-grained permissions for REST API](https://docs.gitlab.com/auth/tokens/fine_grained_access_tokens_rest/) — mapping endpoints.
- [Limit credential exposure with fine-grained PATs](https://about.gitlab.com/blog/fine-grained-pats/) — annonce produit GitLab.
