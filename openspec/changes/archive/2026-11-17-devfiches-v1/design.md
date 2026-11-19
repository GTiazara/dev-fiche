# Design

## Context

Le dépôt n'a pas de code d'application. Le cadrage technique est dans `docs/TECHNICAL_SPEC.md`. Les exigences de comportement sont dans les specs de ce changement. Voir `proposal.md` pour le motif.

Le site livré doit être un dossier de fichiers. La lecture ne dépend d'aucun serveur. Les commentaires de code suivent `AGENTS.md` : chaque fonction et chaque passage délicat, en français.

## Goals / Non-Goals

**Goals:**

- Produire un site statique dont les pages des specs sont du HTML, et dont le JavaScript ne couvre que l'interaction.
- Valider chaque fiche au build, et exclure les brouillons de tout ce qui est publié.
- Garder le quiz, la recherche, la copie de code et le menu mobile comme seuls îlots interactifs.

**Non-Goals:**

- Choisir l'URL GitHub Pages définitive.
- Tolérer les fautes de frappe, mémoriser un score, ou fournir un thème clair.
- Ajouter un adaptateur serveur, une base de données ou une authentification.

## Decisions

### Site statique Astro, îlots Vue

Astro génère le HTML avec `output: 'static'`. Vue ne sert que le quiz, la recherche et les filtres, la copie d'un bloc de code, et le menu sur petit écran.

Alternative considérée : une application Vue unique, ou Next.js avec un serveur. Elle ajouterait un runtime de lecture que GitHub Pages ne fournit pas, et que les specs n'exigent pas.

### Fiches en Markdown et frontmatter YAML

Chaque fiche est `src/content/fiches/<slug>.md`. Le nom du fichier est l'identifiant d'adresse. Le frontmatter porte les métadonnées et le quiz. Le corps porte le texte. Un schéma vérifié au build rejette un fichier invalide.

Champs obligatoires : `title`, `description`, `technology`, `difficulty` (`debutant`, `intermediaire`, `avance`), `publishedAt`, `updatedAt`. `tags` est une liste. `draft: true` retire la fiche de toutes les requêtes publiées. `quiz` est omis, ou contient 3 à 5 questions. Chaque question a `question`, au moins deux `choices`, un `answer` qui est l'index du bon choix à partir de 0, et `explanation`.

Les technologies autorisées sont une liste du projet, `slug` et libellé. Cette version déclare `javascript`, `python` et `git`.

La durée affichée est le nombre de mots du texte divisé par 200, arrondi, avec un plancher d'une minute. Les titres du corps deviennent le sommaire. Une section dont le titre est « À retenir » est rendue en encadré. Les blocs de code balisés restent du code.

Alternative considérée : MDX. Un composant dans une fiche pourrait casser le build. Le quiz reste donc une donnée, pas un composant écrit dans la fiche.

### Recherche dans le navigateur

Le build écrit un JSON des fiches publiées : identifiant, adresse, titre, extrait, tags, technologie, niveau, titres, texte brut. Le navigateur compare les mots après avoir retiré la casse et les accents. La page `/recherche` lit `q`. Les filtres de technologie et de niveau s'appliquent sur cette même liste, au catalogue, sur une technologie et sur les résultats.

Alternative considérée : un service de recherche, ou un index tiers. Le corpus de départ tient en neuf fiches. Un JSON suffit et reste un fichier statique.

### Quiz sans mémoire

La vue `/fiches/<slug>/quiz` est une page statique qui embarque un îlot Vue. L'état des réponses vit dans la mémoire de la page. Recharger réaffiche la première question. Aucun stockage local, aucun score.

Alternative considérée : un quiz inclus dans le défilement de la fiche. La maquette en fait un écran, et la spec demande une vue dédiée. La fiche ne fait que proposer le lien lorsque `quiz` est présent.

### Thème sombre et maquette

Tailwind porte le thème sombre. La grille, les cartes, la colonne de fiche et le quiz s'inspirent de la maquette. L'en-tête n'a pas d'icône de compte. La fiche n'a ni favori ni PDF.

### Publication

`astro build` produit le dossier publié. Un workflow GitHub Actions déploie ce dossier sur GitHub Pages lors d'un push sur la branche publiée. `site` et `base` restent ceux d'un site local tant que l'URL Pages n'est pas connue. Les documenter au seul endroit de configuration évite de disperser le préfixe.

## Risks / Trade-offs

- [L'URL GitHub Pages est inconnue] → Le site se construit en local avec un préfixe vide. Un seul réglage `site` / `base` recevra l'URL plus tard.
- [Un brouillon ou un index de réponse faux passerait dans le site] → Le schéma échoue le build. L'index de réponse est contrôlé contre la longueur des choix.
- [La comparaison sans accents rate un mot français] → La normalisation est couverte par un contrôle sur « fonction » / « Fonction » et sur un mot accentué.
- [La maquette pousse à ajouter le compte, le cœur ou le PDF] → Ces contrôles sont absents des gabarits de cette version.
- [Recharger le quiz efface la réponse en cours] → C'est le comportement exigé. Aucun contournement par stockage local.

## Migration Plan

Il n'y a pas de site précédent à migrer. Le premier déploiement publie le dossier de build. Revenir en arrière consiste à redéployer le commit précédent. Aucune donnée de visiteur n'est à conserver.

## Open Questions

- Quelle sera l'URL GitHub Pages, site utilisateur ou site de projet ? Cela ne change que `site` et `base`, pas les specs ni les pages.
