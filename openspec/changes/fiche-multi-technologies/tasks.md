# Tasks

## 1. Lecture du champ

- [x] 1.1 Accepter dans le schéma un slug ou une liste non vide de slugs autorisés, réduire le résultat en liste ordonnée sans doublon, et vérifier que `npm run build` accepte encore les fiches actuelles à un seul slug
- [x] 1.2 Exposer une fonction qui dit si une liste contient un slug, l'utiliser à la place des comparaisons directes, et vérifier par le typage qu'aucun appel ne compare encore la liste à un slug avec `===`

## 2. Listes, filtres et affichage

- [x] 2.1 Ranger, compter et lister les fiches avec cette liste sur l'accueil, l'index des technologies, la page d'une technologie et le catalogue, et vérifier qu'une technologie nommée seulement en seconde position a une page et un compteur
- [x] 2.2 Afficher un lien par technologie, dans l'ordre, sur la carte et dans l'en-tête de la fiche, et vérifier le HTML d'une fiche qui en nomme deux
- [x] 2.3 Filtrer le catalogue et la recherche dès qu'une des technologies de la fiche correspond, afficher tous les libellés dans les résultats, et vérifier qu'un filtre sur la seconde technologie garde la fiche

## 3. Contrôle d'ensemble

- [x] 3.1 Publier le temps du contrôle une fiche nommant deux technologies, lancer `npm run build`, vérifier qu'elle apparaît sur ces deux pages et pas sur une troisième, que son adresse est unique, puis retirer cette fiche de contrôle
