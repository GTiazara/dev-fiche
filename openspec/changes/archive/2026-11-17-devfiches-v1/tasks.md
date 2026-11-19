# Tasks

## 1. Socle du site statique

- [x] 1.1 Créer le projet Astro en TypeScript, avec `output: 'static'`, Tailwind et l'intégration Vue, et vérifier que `astro build` produit un dossier de fichiers sans adaptateur serveur
- [x] 1.2 Laisser `site` et `base` prêts pour une URL GitHub Pages encore inconnue, documentés au seul endroit de configuration, et vérifier qu'un build local place l'accueil à la racine du dossier publié

## 2. Modèle de fiche

- [x] 2.1 Déclarer la liste `javascript`, `python`, `git` et le schéma de fiche du design (champs, niveau, quiz de 3 à 5 questions, index de réponse valide), avec un commentaire français sur chaque fonction, et vérifier qu'un test rejette un fichier invalide
- [x] 2.2 Calculer la durée de lecture (mots / 200, plancher une minute) avec un commentaire sur le plancher, et vérifier qu'un test couvre un texte court et un texte plus long
- [x] 2.3 Exclure `draft: true` de toute requête de fiches publiées, et vérifier qu'un test ne retourne pas le brouillon dans la liste, la recherche ni les compteurs

## 3. Habillage commun

- [x] 3.1 Poser l'en-tête (Accueil, Fiches, Technologies, À propos, recherche), le thème sombre et le menu replié sur petit écran, et vérifier dans le HTML construit l'absence d'icône de compte, de favori et de bouton PDF
- [x] 3.2 Ajouter la page À propos à `/a-propos` avec un texte court livré dans le dépôt, et vérifier que cette adresse rend ce texte sans liste de fiches
- [x] 3.3 Ajouter la page introuvable avec un lien vers `/fiches`, et vérifier qu'une adresse inconnue rend cette page

## 4. Catalogue

- [x] 4.1 Construire l'accueil `/`, le catalogue `/fiches` et la liste `/technologies` à partir des fiches publiées, triées par `updatedAt` décroissante, et vérifier qu'une carte montre le titre, l'extrait, la technologie, le niveau et la durée, et que les compteurs égalent le nombre de fiches publiées
- [x] 4.2 Construire `/technologies/<identifiant>` et les filtres technologie + niveau sur le catalogue et sur la page technologie, et vérifier qu'un couple sans fiche affiche une liste vide explicite
- [x] 4.3 Produire au build l'index JSON des fiches publiées et filtrer dans le navigateur sans casse ni accents, avec un commentaire sur la normalisation, et vérifier qu'un test accepte « Fonction » pour « fonction » et refuse un mot absent
- [x] 4.4 Afficher `/recherche` avec le paramètre `q` et les mêmes filtres, et vérifier qu'une requête sans correspondance laisse la page vide et explicite

## 5. Fiche

- [x] 5.1 Rendre `/fiches/<slug>` pour une fiche publiée (titre, technologie, niveau, durée, tags, corps), répondre introuvable pour un brouillon, et vérifier ces deux adresses dans le dossier construit
- [x] 5.2 Construire le sommaire depuis les titres et rendre la section « À retenir » en encadré, et vérifier l'ordre du sommaire ainsi que l'absence d'encadré quand la section manque
- [x] 5.3 Afficher les blocs de code et permettre de les copier par un îlot Vue, et vérifier que l'action reprend le texte affiché de l'exemple
- [x] 5.4 Montrer le lien vers le quiz seulement si la fiche en a un, et vérifier les deux cas sur une fiche avec quiz et une fiche sans quiz

## 6. Quiz

- [x] 6.1 Extraire la logique du quiz (choix unique, correction, explication, précédent, suivant, bornes, retour à la première question) avec un commentaire sur l'index 0-based, et vérifier ces cas par un test sans stockage
- [x] 6.2 Afficher `/fiches/<slug>/quiz` avec l'îlot Vue branché sur cette logique, annoncer la position et le total (3 à 5), et vérifier qu'un rechargement réaffiche la première question sans score

## 7. Contenu d'amorçage

- [x] 7.1 Rédiger neuf fiches publiées, trois par technologie, dont une avec quiz pour JavaScript, une pour Python et une pour Git, plus une fiche brouillon, et vérifier que le build publie les neuf adresses et omet le brouillon

## 8. Vérification d'ensemble

- [x] 8.1 Lancer le build complet et vérifier que le dossier publié contient `/`, `/fiches`, `/technologies`, une page technologie, `/recherche`, `/a-propos`, une fiche, son quiz, et la page introuvable, sans serveur
- [x] 8.2 Ajouter le workflow GitHub Actions qui publie le dossier de build sur GitHub Pages, et vérifier que sa commande de build est celle qui a réussi en local, sans y inscrire d'URL inventée
