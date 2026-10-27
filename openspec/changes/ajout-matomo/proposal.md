# Proposal

## Why

Le mainteneur veut savoir quelles pages sont consultées, sans compte lecteur et sans serveur applicatif. Le site est déjà un ensemble de fichiers statiques ; il manque seulement le script de mesure fourni pour l'instance Matomo du projet.

## What Changes

- Charger, sur chaque page publique, le script Matomo indiqué : vue de page, suivi des liens, site `6`, collecteur `//matomo.gtiazara.fr/`.
- Ne pas ajouter de bannière de consentement, de compte, ni de collecte côté serveur. Le snippet fourni est utilisé tel quel.

Hypothèses retenues :

- Toutes les pages passent par la même mise en page. Le script y est donc présent partout, y compris la page introuvable.
- Chaque navigation est un chargement complet de page. Il n'y a pas de routeur côté navigateur à instrumenter.
- L'identifiant de site et l'adresse du collecteur sont ceux du snippet. Ils ne sont pas devinés.

## Capabilities

### New Capabilities

- `mesure-audience`: envoi d'une vue de page et du suivi des liens vers le collecteur Matomo configuré, à chaque chargement d'une page publique.

### Modified Capabilities

Aucune. Le dépôt n'a pas encore de spécification durable.

## Impact

- Mise en page commune des pages HTML.
- Aucune dépendance npm. Le navigateur charge `matomo.js` depuis `matomo.gtiazara.fr`.
- Le site reste lisible si le collecteur ne répond pas : le script est asynchrone et ne bloque pas le contenu.
