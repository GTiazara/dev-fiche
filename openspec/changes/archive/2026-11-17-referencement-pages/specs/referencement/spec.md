# Spec Delta

## Purpose

Décrit aux moteurs de recherche les pages publiées, par un plan du site, une adresse canonique et l'exclusion de la page introuvable, sans promettre un classement.

## ADDED Requirements

### Requirement: Exploration autorisée
Le site SHALL publier un fichier `robots.txt` qui autorise l'exploration des pages publiques.

#### Scenario: Robot qui lit les consignes
- **WHEN** un robot demande `/robots.txt`
- **THEN** la réponse autorise l'exploration

### Requirement: Plan des pages indexables
Lorsque l'adresse du site est connue au build, le site SHALL publier un plan qui cite l'accueil, le catalogue, les technologies, les fiches publiées, leurs quiz, la page À propos et la page de recherche sans paramètre.

#### Scenario: Fiche publiée
- **WHEN** une fiche est publiée et l'adresse du site est connue
- **THEN** le plan cite l'adresse de cette fiche

#### Scenario: Brouillon et page introuvable
- **WHEN** le plan est produit
- **THEN** il ne cite ni une fiche brouillon, ni la page introuvable, ni l'index JSON de recherche

#### Scenario: Build sans adresse de site
- **WHEN** le build ne connaît pas l'adresse du site
- **THEN** le build réussit
- **THEN** aucun plan d'adresses absolues n'est exigé

### Requirement: Adresse canonique et partage
Lorsque l'adresse du site est connue, chaque page indexable SHALL annoncer son adresse canonique, son titre, sa description et la langue française.

#### Scenario: Page de fiche
- **WHEN** un visiteur ou un robot ouvre une fiche publiée et l'adresse du site est connue
- **THEN** la page indique une adresse canonique absolue de cette fiche
- **THEN** le titre et la description annoncés sont ceux de la page

### Requirement: Page introuvable non indexée
La page introuvable SHALL demander aux moteurs de ne pas l'indexer.

#### Scenario: Adresse inconnue
- **WHEN** le visiteur ouvre une adresse sans page
- **THEN** la page introuvable contient une consigne `noindex`
