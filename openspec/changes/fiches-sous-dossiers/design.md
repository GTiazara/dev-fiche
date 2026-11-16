# Design

## Context

Le chargeur `glob` de `src/content.config.ts` lit déjà `**/*.md`. Il calcule l'identifiant d'une entrée à partir du chemin relatif, donc `git/git_gitignore.md` donne `git/git_gitignore`. Les routes `src/pages/fiches/[slug].astro` et `[slug]/quiz.astro` utilisent cet identifiant comme paramètre. Un paramètre `[slug]` refuse le `/`, et le build échoue avec `Missing parameter: slug`. Un essai avec une fiche dans un sous-dossier l'a confirmé. Voir proposal.md pour le motif.

## Goals / Non-Goals

**Goals:**

- Garder une adresse plate, indépendante du dossier.
- Détecter un doublon de nom de fichier au build, avec un message clair.
- Ranger les fiches actuelles sans changer une seule adresse.

**Non-Goals:**

- Pas d'adresse ni de page par dossier, pas de fil d'Ariane.
- Pas de lien entre dossier et technologie.
- Pas de redirection : aucune adresse ne change.

## Decisions

### L'identifiant vient du nom du fichier

On fournit au chargeur `glob` une fonction `generateId`. Elle prend le chemin relatif de l'entrée, retire les dossiers et l'extension `.md`, et renvoie le reste. Les routes et `src/lib/fiches.ts` continuent de lire `entry.id` : elles ne changent pas.

Le calcul vit dans une fonction pure de `src/lib`, pour être testée sans Astro.

Alternative écartée : routes `[...slug]` avec l'identifiant complet. L'adresse refléterait le dossier, ce qui change l'adresse de chaque fiche déplacée et oblige à des redirections. Le choix du mainteneur est une adresse plate.

Alternative écartée : champ `slug` dans le frontmatter. Il faudrait le remplir pour 49 fiches et il pourrait contredire le nom du fichier.

### Les identifiants actuels sont conservés

Le chargeur nettoie aujourd'hui l'identifiant par défaut. Tous les noms actuels sont déjà en minuscules, sans espace ni accent, donc le nom du fichier est égal à l'identifiant d'aujourd'hui. La tâche de rangement le vérifie en comparant la liste des pages produites avant et après.

### Un doublon fait échouer le build

Deux fichiers au même nom donneraient le même identifiant. Astro n'avertit alors que par un message et garde une seule entrée : une fiche disparaîtrait sans erreur. La fonction `generateId` retient dans une table l'identifiant et le chemin qui l'a produit. Si un autre chemin produit le même identifiant, elle lève une erreur qui cite les deux chemins.

Le même chemin peut repasser (rechargement en développement) sans erreur : on compare les chemins, pas seulement la présence de l'identifiant.

Un test lit aussi le dossier des fiches et vérifie l'unicité des noms, pour que l'erreur remonte avec `npm test`.

### Le rangement des fiches existantes

Un dossier par sujet, un seul niveau, avec les noms de fichiers inchangés :

| Dossier | Fiches |
|---|---|
| `git/` | `git_*`, `le-depot-local`, `les-commits`, `les-branches` |
| `cloud/` | `cloud_*` |
| `hpc/` | `hpc_*` |
| `linux/` | `linux_cron`, `linux_history`, `linux_sshfs`, `linux_timer_sysd` |
| `reseau/` | `reseau_*`, `linux_base_reseau`, `linux_alpine_ip_fix` |
| `transfert-fichiers/` | `transfert_fichiers_*` |
| `ml/` | `ml_*`, `zzz_controle_multi_tech` |
| `deeplearning/` | `deeplearning_*` |
| `ia/` | `ia_metrique` |
| `ia-agent/` | `ia_agent_*` |
| `securite/` | `securite_mfa_totp` |
| `backend/` | `backend_webhook` |
| `python/` | `python_poetry`, `les-*-en-python` |
| `javascript/` | `les-*-en-javascript`, `brouillon-exemple` |

`git_token` va dans `git/` bien que sa technologie soit `devtools` : le dossier suit le sujet du nom, la technologie reste dans le frontmatter. Ranger un fichier ne modifie pas son contenu.

## Risks / Trade-offs

- [Un nom de fichier doit rester unique sur tout le dépôt] → erreur de build explicite et test.
- [Le dossier peut sembler dire la technologie] → la documentation précise que seul le frontmatter compte.
- [Un déplacement fait perdre l'historique Git si l'outil détecte mal le renommage] → utiliser `git mv` pour que le renommage soit suivi.
- [Le cache de contenu garde d'anciens chemins] → purger `.astro` et `node_modules/.astro` avant le build de contrôle.
