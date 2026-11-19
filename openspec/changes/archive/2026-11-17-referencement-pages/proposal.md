# Proposal

## Why

Un moteur de recherche peut lire les titres et les descriptions déjà présents, mais il ne reçoit ni plan des pages, ni adresse canonique, ni consigne pour ignorer la page introuvable. Le site reste donc difficile à parcourir de façon fiable. Ce changement ne promet pas une place dans les premiers résultats : il rend les pages publiées décrites et découvrables.

## What Changes

- Publier un `robots.txt` qui autorise l'exploration et, lorsque l'adresse du site est connue, indique le plan des pages.
- Publier un plan des pages indexables : accueil, catalogue, technologies, fiches publiées, quiz publiés, page À propos et page de recherche sans paramètre. Exclure les brouillons, la page introuvable et l'index JSON de recherche.
- Ajouter, sur chaque page indexable, une adresse canonique et les balises de partage (titre, description, adresse, langue française) lorsque l'adresse du site est connue au build.
- Demander aux moteurs de ne pas indexer la page introuvable.
- Conserver le build local sans adresse de site : le plan et l'adresse canonique n'apparaissent que si `site` est défini, comme le fait déjà la publication.

Hypothèses retenues :

- L'adresse publique vient de la configuration existante (`SITE_URL` en publication). Elle n'est pas inventée.
- Les titres et descriptions déjà écrits sur chaque page restent la source du texte annoncé aux moteurs.
- Aucun compte d'outil pour webmasters, aucun mot-clé artificiel, aucun texte caché.

## Capabilities

### New Capabilities

- `referencement`: fichiers et balises qui décrivent les pages publiées aux moteurs de recherche, sans garantir un classement.

### Modified Capabilities

Aucune. Le dépôt n'a pas encore de spécification durable pour cette capacité.

## Impact

- En-tête commun des pages, page introuvable, configuration de build.
- Deux fichiers publics supplémentaires lorsque l'adresse du site est connue : `robots.txt` et le plan des pages.
- Aucun changement du contenu des fiches ni du parcours de lecture.
