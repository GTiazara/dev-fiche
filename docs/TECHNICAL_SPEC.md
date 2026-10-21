# DevFiches — spécification technique

Le site est entièrement statique. Le dépôt Git contient les fiches et le code qui les affiche. GitHub Pages sert le résultat du build, pas les sources Markdown.

Aucune exigence ne dépend d'un IDE ou d'un assistant. Un fichier conforme au schéma ci-dessous suffit, quel que soit l'outil qui l'a produit.

## Décisions

| Élément | Décision |
|---|---|
| Framework | Astro, export statique (`output: 'static'`) |
| Interactivité | Vue, limité aux îlots qui en ont besoin |
| Langage | TypeScript |
| Style | Tailwind CSS |
| Contenu des fiches | Markdown + frontmatter YAML |
| Validation | Schéma contrôlé au build ; un fichier invalide fait échouer le build |
| Stockage | Fichiers locaux dans le dépôt |
| Hébergement | GitHub Pages |
| Versions | Git |
| Recherche | Index JSON produit au build, filtrage dans le navigateur |
| Thème | Sombre uniquement |

Markdown est le format de publication. Le frontmatter porte les métadonnées et le quiz, le corps porte le texte. MDX n'est pas retenu : il mélange le contenu et des composants, et un fichier de fiche peut alors casser le build.

## Rôle de Vue

Astro génère le HTML des pages. Vue n'intervient que pour :

- le quiz ;
- la recherche et les filtres ;
- la copie d'un bloc de code ;
- le menu sur petit écran.

Le reste de la page reste du HTML statique.

## Schéma d'une fiche

Emplacement : `src/content/fiches/<slug>.md`. Le nom du fichier est l'identifiant de la fiche.

Les technologies autorisées vivent dans une liste du projet (`slug` et libellé). La première version n'en déclare que trois : `javascript`, `python`, `git`. Ajouter une technologie, c'est l'ajouter à cette liste.

```yaml
title: Les variables en JavaScript
description: Une variable permet de stocker une valeur afin de la réutiliser.
technology: javascript          # slug présent dans la liste des technologies
difficulty: debutant            # debutant | intermediaire | avance
tags: [variables, fondamentaux]
publishedAt: 2026-10-21
updatedAt: 2026-10-21
draft: false
quiz:                           # omis si la fiche n'a pas de quiz
  - question: Quel mot-clé empêche la réaffectation ?
    choices: [let, const, var] # au moins deux choix
    answer: 1                   # index du bon choix, à partir de 0
    explanation: const bloque la réaffectation du lien.
```

Règles :

- `title`, `description`, `technology`, `difficulty`, `publishedAt` et `updatedAt` sont obligatoires.
- `tags` est une liste, éventuellement vide.
- `draft: true` exclut la fiche de toutes les pages, de la recherche et des compteurs.
- Un quiz présent contient de 3 à 5 questions. Chaque question a au moins deux choix et un index de réponse valide.
- Le corps est du Markdown. Les titres alimentent le sommaire. Un tableau Markdown sert aux mots-clés. La section titrée « À retenir » est rendue comme un encadré. Les exemples sont des blocs de code balisés avec leur langage.
- La durée affichée est calculée au build à partir du texte, avec un plancher d'une minute.

## Routes

| Route | Page |
|---|---|
| `/` | Accueil |
| `/fiches` | Catalogue |
| `/fiches/<slug>` | Fiche |
| `/technologies` | Liste des technologies |
| `/technologies/<slug>` | Fiches d'une technologie |
| `/recherche` | Résultats, requête dans `q` |
| `/a-propos` | À propos |

L'adresse inconnue rend une page 404 statique.

## Recherche

Le build produit un index JSON des fiches publiées : slug, url, titre, description, tags, technologie, difficulté, titres de sections, texte brut.

Dans le navigateur, la comparaison ignore la casse et les accents. Elle cherche les mots de la requête dans ces champs. La tolérance aux fautes de frappe n'est pas prévue dans cette version. Aucun service de recherche n'est déployé.

## Build et GitHub Pages

- `astro build` produit un dossier de fichiers statiques.
- Un workflow GitHub Actions, déclenché sur la branche publiée, construit le site et le déploie sur GitHub Pages.
- `site` et `base` d'Astro prennent l'URL réelle du dépôt Pages. Pour un site de projet, `base` est le nom du dépôt. Ces deux valeurs restent vides tant que l'URL n'est pas connue.
- Pas d'adaptateur serveur, pas de routes dynamiques côté serveur, pas de base de données, pas d'authentification.

## Hors de cette version

Comptes, favoris, génération de PDF, stockage de la progression, thème clair, interface d'administration, et tout traitement qui exigerait un serveur au moment de la lecture.
