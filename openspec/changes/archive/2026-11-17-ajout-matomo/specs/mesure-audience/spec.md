# Spec Delta

## Purpose

Envoie une vue de page et le suivi des liens vers le collecteur Matomo du projet à chaque chargement d'une page publique.

## ADDED Requirements

### Requirement: Vue de page
Chaque page publique SHALL demander l'enregistrement d'une vue de page auprès du collecteur configuré, au chargement de la page.

#### Scenario: Ouverture d'une page
- **WHEN** le visiteur ouvre une page publique
- **THEN** le navigateur prépare une vue de page pour le site `6` du collecteur `//matomo.gtiazara.fr/`

#### Scenario: Page introuvable
- **WHEN** le visiteur ouvre une adresse qui affiche la page introuvable
- **THEN** cette page prépare aussi une vue de page pour le même collecteur et le même site

### Requirement: Suivi des liens
Chaque page publique SHALL activer le suivi des liens en plus de la vue de page.

#### Scenario: Chargement
- **WHEN** une page publique a chargé le mesureur
- **THEN** le suivi des liens est activé avant l'exécution du fichier `matomo.js`

### Requirement: Chargement du mesureur
Le navigateur SHALL charger `matomo.js` depuis `//matomo.gtiazara.fr/`, de façon asynchrone, et SHALL envoyer les mesures à `//matomo.gtiazara.fr/matomo.php`.

#### Scenario: Script présent
- **WHEN** le visiteur ouvre une page publique
- **THEN** la page référence `//matomo.gtiazara.fr/matomo.js`
- **THEN** l'adresse d'envoi est `//matomo.gtiazara.fr/matomo.php`
- **THEN** l'identifiant de site est `6`

#### Scenario: Collecteur injoignable
- **WHEN** le collecteur ne répond pas
- **THEN** le texte de la page reste affiché
