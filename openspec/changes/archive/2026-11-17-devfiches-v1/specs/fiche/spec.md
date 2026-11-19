# Spec Delta

## Purpose

Permet au visiteur de lire une fiche publiée, avec ses exemples de code, et d'en ouvrir le quiz lorsqu'il existe.

## ADDED Requirements

### Requirement: Fiche publiée
Le site SHALL afficher une fiche publiée avec son titre, sa technologie, son niveau, sa durée de lecture, ses tags et son texte.

#### Scenario: Ouverture d'une fiche publiée
- **WHEN** le visiteur ouvre l'adresse d'une fiche publiée
- **THEN** il voit le titre, la technologie, le niveau, la durée, les tags et le corps de la fiche

### Requirement: Adresse d'une fiche
Le site SHALL exposer chaque fiche publiée à `/fiches/<identifiant>`, où l'identifiant est celui du fichier de fiche.

#### Scenario: Identifiant de fichier
- **WHEN** une fiche publiée a pour identifiant `les-variables-en-javascript`
- **THEN** elle est accessible à `/fiches/les-variables-en-javascript`

### Requirement: Sommaire
Le site SHALL construire le sommaire d'une fiche à partir des titres de son texte.

#### Scenario: Titres présents
- **WHEN** le texte d'une fiche contient des titres
- **THEN** le sommaire reprend ces titres dans le même ordre
- **THEN** chaque entrée du sommaire mène au passage correspondant

#### Scenario: Texte sans titre
- **WHEN** le texte d'une fiche ne contient aucun titre
- **THEN** la fiche reste lisible sans sommaire

### Requirement: Exemples de code
Le site SHALL afficher chaque exemple de code de la fiche comme du code, et SHALL permettre de le copier.

#### Scenario: Copie d'un exemple
- **WHEN** le visiteur demande la copie d'un exemple de code
- **THEN** le texte de cet exemple est copié tel qu'il est affiché

### Requirement: Encadré à retenir
Le site SHALL présenter la section titrée « À retenir » comme un encadré distinct du reste du texte.

#### Scenario: Section présente
- **WHEN** une fiche contient une section titrée « À retenir »
- **THEN** son contenu apparaît dans un encadré identifiable

#### Scenario: Section absente
- **WHEN** une fiche ne contient pas de section « À retenir »
- **THEN** la fiche s'affiche sans cet encadré

### Requirement: Durée de lecture
Le site SHALL afficher une durée de lecture d'au moins une minute, déduite du texte de la fiche.

#### Scenario: Texte court
- **WHEN** le texte d'une fiche est très court
- **THEN** la durée affichée vaut une minute

### Requirement: Fiche brouillon introuvable
Le site SHALL répondre par une page introuvable lorsqu'on demande l'adresse d'une fiche brouillon.

#### Scenario: Adresse d'un brouillon
- **WHEN** le visiteur ouvre l'adresse d'une fiche marquée brouillon
- **THEN** il obtient la page introuvable

### Requirement: Accès au quiz
La fiche SHALL proposer d'ouvrir son quiz lorsqu'elle en a un, et SHALL NOT proposer cette action lorsqu'elle n'en a pas.

#### Scenario: Fiche avec quiz
- **WHEN** le visiteur lit une fiche publiée qui a un quiz
- **THEN** la fiche propose d'ouvrir ce quiz

#### Scenario: Fiche sans quiz
- **WHEN** le visiteur lit une fiche publiée sans quiz
- **THEN** la fiche ne propose pas de quiz

### Requirement: Lecture sans compte
Une fiche SHALL être lisible sans compte, et SHALL NOT proposer de favori ni de téléchargement PDF.

#### Scenario: Visiteur anonyme
- **WHEN** un visiteur ouvre une fiche publiée
- **THEN** il lit la fiche sans s'identifier
- **THEN** aucun favori ni téléchargement PDF n'est proposé
