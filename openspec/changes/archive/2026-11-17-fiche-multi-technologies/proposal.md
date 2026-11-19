# Proposal

## Why

Une fiche ne peut citer qu'une technologie. Une page qui sert à la fois au machine learning et à Linux, par exemple, n'apparaît que dans l'une des deux listes. Le visiteur qui parcourt l'autre technologie ne la trouve pas.

## What Changes

- Permettre à une fiche publiée de nommer une ou plusieurs technologies autorisées.
- Afficher la fiche dans la liste de chacune de ces technologies, sur l'accueil, dans le catalogue et dans la recherche filtrée.
- Montrer chaque technologie de la fiche comme un lien, sur la fiche et sur sa carte.
- Conserver les fiches actuelles, qui n'en nomment qu'une, sans les réécrire.

Hypothèses retenues :

- Le champ existant `technology` accepte toujours un seul slug. Il accepte aussi une liste de slugs. Les deux formes désignent les mêmes technologies, sans technologie « principale » pour le filtre.
- L'ordre de la liste est l'ordre d'affichage des liens. Un slug répété ne compte qu'une fois.
- Un slug inconnu ou une liste vide restent refusés au build.
- Les tags ne créent pas une page de technologie. L'adresse de la fiche reste unique.

## Capabilities

### New Capabilities

- `fiche-technologies`: une fiche publiée apparaît dans chacune des technologies qu'elle nomme, et seulement dans celles-là.

### Modified Capabilities

Aucune. Le dépôt n'a pas encore de spécification durable pour cette capacité.

## Impact

- Schéma des fiches et lecture du champ `technology`.
- Pages d'accueil, catalogue, page d'une technologie, page d'une fiche.
- Filtres du catalogue et de la recherche, cartes et index de recherche.
- Compteurs de technologies : une technologie compte dès qu'une fiche publiée la nomme.
