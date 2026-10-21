# Spec Delta

## Purpose

Permet au visiteur de répondre au questionnaire à choix multiples d'une fiche, avec une correction immédiate et sans conserver de score.

## ADDED Requirements

### Requirement: Vue dédiée du quiz
Le site SHALL ouvrir le quiz d'une fiche publiée dans une vue dédiée, atteinte depuis cette fiche.

#### Scenario: Ouverture depuis la fiche
- **WHEN** le visiteur demande le quiz d'une fiche qui en possède un
- **THEN** il arrive sur la vue du quiz de cette fiche
- **THEN** la première question est affichée, avec sa position dans le questionnaire

### Requirement: Questions à une seule bonne réponse
Chaque question publiée SHALL proposer au moins deux choix, dont un seul est la bonne réponse.

#### Scenario: Choix affichés
- **WHEN** une question est affichée
- **THEN** le visiteur voit tous ses choix
- **THEN** il ne peut en retenir qu'un seul

### Requirement: Taille d'un quiz publié
Un quiz publié SHALL contenir de trois à cinq questions.

#### Scenario: Quiz affiché
- **WHEN** le visiteur ouvre un quiz publié
- **THEN** le nombre total de questions annoncé est compris entre 3 et 5

### Requirement: Correction immédiate
Le site SHALL indiquer si le choix retenu est juste et SHALL afficher l'explication de la question.

#### Scenario: Bonne réponse
- **WHEN** le visiteur retient le bon choix
- **THEN** la vue indique que la réponse est juste
- **THEN** l'explication de la question est visible

#### Scenario: Mauvaise réponse
- **WHEN** le visiteur retient un autre choix
- **THEN** la vue indique que la réponse est fausse
- **THEN** l'explication de la question est visible

### Requirement: Passage d'une question à l'autre
Le visiteur SHALL pouvoir passer à la question suivante et revenir à la précédente.

#### Scenario: Question suivante
- **WHEN** le visiteur est sur une question qui n'est pas la dernière et demande la suivante
- **THEN** la question suivante s'affiche

#### Scenario: Question précédente
- **WHEN** le visiteur est sur une question qui n'est pas la première et demande la précédente
- **THEN** la question précédente s'affiche

#### Scenario: Bornes du questionnaire
- **WHEN** le visiteur est sur la première question
- **THEN** il ne peut pas revenir à une question antérieure
- **WHEN** le visiteur est sur la dernière question
- **THEN** il ne peut pas avancer vers une question inexistante

### Requirement: Aucune mémoire du quiz
Le site SHALL NOT conserver le score, les réponses ni la question en cours après que le visiteur quitte ou recharge la vue.

#### Scenario: Rechargement
- **WHEN** le visiteur a répondu à une question puis recharge la vue du quiz
- **THEN** la première question s'affiche à nouveau
- **THEN** aucun score ni réponse précédente n'est montré

### Requirement: Quiz sans compte
Le quiz SHALL être utilisable sans compte.

#### Scenario: Visiteur anonyme
- **WHEN** un visiteur ouvre un quiz
- **THEN** il peut répondre sans s'identifier
