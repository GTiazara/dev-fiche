# DevFiches — spécification produit

DevFiches est un site de fiches d'apprentissage et d'aide-mémoire pour le développement informatique. Le lecteur y trouve une notion, la comprend, retrouve l'essentiel, puis peut se tester.

Le site se présente comme un blog de fiches : chaque fiche est une page stable, consacrée à une notion. Ce n'est pas un fil d'articles signés, datés pour l'actualité, ni un espace de commentaires.

Les exigences décrivent ce que le lecteur voit et ce que le mainteneur publie. Elles ne dépendent d'aucun éditeur, IDE ou assistant. La façon de rédiger une fiche reste libre, tant que le fichier déposé respecte le schéma de la spécification technique.

La maquette dans `docs/designe example/` guide la disposition des pages. L'icône de compte, le favori et le téléchargement PDF qui y figurent ne font pas partie de cette version.

## Lecteurs

- Débutants
- Étudiants
- Développeurs

Une seule interface sert ces trois publics. Le niveau de la fiche — débutant, intermédiaire ou avancé — indique à qui elle s'adresse. Il n'y a pas de parcours séparé par public.

## Publication

Il n'y a pas de compte lecteur, ni d'inscription, ni d'espace personnel.

Le mainteneur du dépôt publie les fiches en y ajoutant un fichier. Une fiche marquée comme brouillon n'apparaît nulle part sur le site.

## Classement

Chaque fiche a :

- une technologie principale, par exemple JavaScript, Python ou Git ;
- un seul niveau de difficulté ;
- des tags libres pour les notions transverses, par exemple « fondamentaux » ou « variables ».

Les technologies tiennent lieu de catégories. L'interface ne propose pas un second classement parallèle.

## Fonctionnalités de la première version

### Catalogue des fiches

- **Accueil.** Promesse du site, champ de recherche, technologies, dernières fiches. Les compteurs affichés sont calculés à partir des fiches publiées. Aucun volume fictif.
- **Liste des fiches.** Carte avec titre, extrait, technologie, difficulté et durée de lecture. Filtres par technologie et par difficulté. Tri par date de mise à jour, les plus récentes d'abord.
- **Page technologie.** Toutes les fiches de cette technologie, avec le filtre de difficulté.
- **Recherche d'une notion.** La requête porte sur le titre, l'extrait, les titres de sections et le corps. La page de résultats reprend les mêmes filtres que la liste.
- **À propos.** Page courte sur le site. Le texte est rédigé par le mainteneur.
- **Page introuvable.** Message clair et lien vers le catalogue.

### Consulter une fiche

Une fiche publiée affiche :

- le titre, la technologie, la difficulté, la durée de lecture et les tags ;
- un sommaire construit à partir des titres du texte ;
- le corps, organisé en définition, mots-clés, exemple de code et encadré « À retenir » ;
- un moyen de copier chaque exemple de code ;
- le quiz, lorsqu'il existe.

La durée de lecture est déduite du texte. Elle n'est pas saisie à la main.

La fiche ne propose ni favori, ni export PDF, ni identification du lecteur.

### Quiz interactifs

- Le quiz est rattaché à une fiche. Une fiche peut ne pas en avoir.
- Lorsqu'il existe, il contient de 3 à 5 questions.
- Chaque question est un questionnaire à choix multiples, avec une seule bonne réponse.
- Le lecteur voit immédiatement si sa réponse est juste, accompagnée d'une courte explication.
- Il peut passer à la question suivante ou revenir à la précédente.
- Aucun score, aucune réponse et aucune progression ne sont conservés après la visite.

## Expérience

- Navigation simple, y compris sur un petit écran : menu replié, cartes empilées, quiz utilisable au doigt.
- Lecture agréable : texte aéré, code lisible, thème sombre.
- Interface, contenu et adresses en français : `/fiches`, `/technologies`, `/recherche`, `/a-propos`.
- La navigation, la recherche et le quiz sont utilisables au clavier. Le contraste du thème sombre reste lisible.
- Chaque page expose son propre titre et sa propre description.

## Contenu d'amorçage

La première version contient 9 fiches : trois en JavaScript, trois en Python, trois en Git. Trois fiches parmi elles ont un quiz.

## Évolutions ultérieures

Ces sujets sont hors de la première version :

- comptes lecteurs et icône utilisateur ;
- favoris ;
- export PDF ou mise en page d'impression ;
- score, historique, progression ou révision espacée ;
- thème clair ;
- plusieurs auteurs, ou contributions des lecteurs depuis le site ;
- commentaires ;
- exécution de code dans le navigateur ;
- traduction ;
- recherche tolérante aux fautes, synonymes, fiches liées ;
- flux RSS et mesure d'audience.

Les mentions légales, la licence du contenu et l'origine des exemples de code sont à écrire avant une mise en ligne publique. Elles ne bloquent pas la construction du site en local.
