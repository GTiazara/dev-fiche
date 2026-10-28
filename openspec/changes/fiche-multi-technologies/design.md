# Design

## Context

Le schéma n'accepte qu'un slug dans `technology`. L'accueil, le catalogue, la page d'une technologie, la recherche et les compteurs comparent ce slug avec `===`. Voir proposal.md pour le motif. Les fiches déjà publiées utilisent toutes la forme à un seul slug.

## Goals / Non-Goals

**Goals:**

- Lire un slug ou une liste, et exposer ensuite une liste ordonnée sans doublon.
- Faire utiliser cette liste partout où une fiche est rangée, filtrée, comptée ou affichée.
- Laisser les fichiers de contenu actuels inchangés.

**Non-Goals:**

- Pas de seconde adresse par technologie.
- Pas de technologie « principale » qui exclurait les autres d'un filtre.
- Les tags ne deviennent pas des technologies.
- Aucune fiche existante n'est reclassée dans ce changement.

## Decisions

### Le champ `technology` accepte les deux formes

Le schéma valide soit un slug autorisé, soit une liste non vide de slugs autorisés, puis la réduit en liste ordonnée sans doublon. Après validation, le reste du site lit une liste, plus un slug isolé.

Alternative écartée : un second champ `technologies` à côté de `technology`. Deux champs obligeraient à définir lequel gagne en cas de contradiction. Un seul champ garde la forme actuelle valide.

### Une fonction unique dit si une fiche porte une technologie

Les comparaisons `entry.data.technology === slug` deviennent un test d'appartenance à la liste. L'accueil, l'index des technologies, la page d'une technologie, le catalogue et les compteurs passent par là. Le compteur de technologies distinctes aplatit les listes avant de compter.

Une fiche compte une fois dans le nombre de fiches, et une fois dans chaque technologie qu'elle nomme. La somme des comptes par technologie peut donc dépasser le nombre de fiches.

### Le filtre lit plusieurs slugs sur la carte

La carte expose la liste des slugs, pas un seul. Le filtre du catalogue retient la carte si le slug choisi est dans cette liste. La recherche fait le même test sur le document d'index, qui porte la liste et les libellés dans l'ordre.

L'en-tête de la fiche et le bandeau de la carte affichent un lien par technologie, dans cet ordre.

### Le prétraitement reste hors de ce changement

Aucune règle de découpage de données ne change. Seul le rattachement aux pages de technologie change.

## Risks / Trade-offs

- [Un appel oublié compare encore la liste à un slug] → Le build TypeScript et un passage sur l'accueil, le catalogue, une page de technologie et la recherche le révèlent. Une fiche de test nomme deux technologies.
- [Le filtre HTML ne voit qu'un attribut] → L'attribut de la carte porte tous les slugs. Le filtre du catalogue et celui de la recherche sont mis à jour ensemble.
- [Retour arrière] → Revenir au code précédent. Une fiche déjà écrite avec une liste devra être remise à un seul slug, sinon le build d'avant la refusera.

## Migration Plan

Aucun fichier de contenu existant n'est réécrit. Le déploiement est celui du site statique habituel. Pour annuler, restaurer le code d'avant et retirer les listes éventuellement ajoutées dans les fiches.

## Open Questions

Aucune. L'ordre d'affichage, l'absence de technologie principale et le refus des slugs inconnus sont fixés par la spec.
