---
title: "Découper les données pour entraîner et évaluer"
description: "Choisir entre un découpage train, validation et test, une validation croisée, et les variantes stratifiée, par groupe ou temporelle."
technology: ml
difficulty: intermediaire
tags:
  - sklearn
  - validation
  - train
  - test
  - cross-validation
publishedAt: 2026-10-28
updatedAt: 2026-10-28
draft: false
quiz:
  - question: "À quoi sert le jeu de test ?"
    choices:
      - "À mesurer une fois le modèle déjà choisi, sans servir à le régler"
      - "À choisir les hyperparamètres à chaque essai"
      - "À remplacer l'entraînement quand les données manquent"
    answer: 0
    explanation: "Le test reste de côté jusqu'à la fin. S'en servir pour choisir le modèle le rend trop optimiste."
  - question: "Que fait une validation croisée à 5 blocs sur le jeu d'entraînement ?"
    choices:
      - "Chaque ligne sert une fois à valider et quatre fois à entraîner"
      - "Elle remplace le jeu de test final"
      - "Elle entraîne cinq modèles sur les mêmes lignes"
    answer: 0
    explanation: "Les données sont coupées en 5. Chaque bloc est la validation à tour de rôle. Le test, s'il a été mis de côté, n'entre pas dans ces blocs."
  - question: "Pourquoi un découpage au hasard est-il trompeur si plusieurs lignes viennent du même patient ?"
    choices:
      - "Le même patient peut se retrouver à la fois dans l'entraînement et dans la validation"
      - "La validation croisée refuse les identifiants"
      - "Un patient ne peut avoir qu'une seule ligne"
    answer: 0
    explanation: "Le modèle reconnaît le patient au lieu de la règle générale. Un découpage par groupe garde chaque patient d'un seul côté."
  - question: "Où regarde-t-on la perte pour décider d'arrêter un réseau trop tôt ?"
    choices:
      - "Sur le jeu de validation"
      - "Sur le jeu de test"
      - "Sur l'ensemble des données, avant le découpage"
    answer: 0
    explanation: "L'arrêt anticipé est un réglage. Il s'appuie sur la validation. Le test ne sert qu'à la mesure finale."
  - question: "Quand les lignes sont datées, comment coupe-t-on ?"
    choices:
      - "L'entraînement est le passé, la validation et le test sont des périodes plus récentes"
      - "On mélange toutes les dates, puis on stratifie"
      - "On met les dates les plus récentes dans l'entraînement"
    answer: 0
    explanation: "Un tirage au hasard met le futur dans l'entraînement. Le score paraît bon, puis le modèle échoue sur la période suivante."
---

# 1. Trois questions, trois rôles

Découper sert à ne pas mesurer un modèle sur les lignes qui lui ont déjà servi à apprendre. On sépare trois questions.

| Rôle | Question | On a le droit d'y revenir ? |
|---|---|---|
| Entraînement | Quels paramètres ajuster ? | Oui, à chaque essai |
| Validation | Quel modèle, quels hyperparamètres ? | Oui, pour comparer |
| Test | Quelle performance attendre sur des données neuves ? | Une fois, à la fin |

Le test ne choisit rien. Dès qu'on relance un essai parce que le score de test déplaît, ce jeu devient une validation déguisée, et le chiffre publié est trop beau.

Les deux approches courantes diffèrent sur la validation. Le test, lui, reste un bloc mis de côté.

# 2. Approche à trois blocs

On coupe une fois, en trois parties fixes. Un partage classique est 60 % d'entraînement, 20 % de validation, 20 % de test.

Le fragment suppose que `X` contient les entrées et `y` la cible. `stratify` garde la proportion de chaque classe. On l'enlève en régression.

```python
from sklearn.model_selection import train_test_split

X_reste, X_test, y_reste, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=0
)
# 0,25 des 80 % restants fait 20 % de validation et 60 % d'entraînement.
X_train, X_val, y_train, y_val = train_test_split(
    X_reste, y_reste, test_size=0.25, stratify=y_reste, random_state=0
)
```

On entraîne sur `X_train`. On compare les modèles sur `X_val`. On choisit. On réentraîne souvent sur `X_train` et `X_val` réunis, puis on mesure une seule fois sur `X_test`.

Ce découpage convient quand les données sont nombreuses, et c'est le réflexe en deep learning. Réentraîner un gros réseau cinq ou dix fois coûte trop cher. La validation sert aussi à l'arrêt anticipé : on stoppe quand la perte de validation remonte, jamais en regardant le test.

`random_state=0` fixe le tirage. Sans lui, deux lancements ne comparent pas les mêmes lignes.

# 3. Validation croisée

La validation croisée répond à la même question que le bloc de validation, en faisant tourner les rôles. Avec 5 blocs, les données d'entraînement sont coupées en 5. Chaque bloc sert une fois de validation, les quatre autres d'entraînement. On obtient 5 scores. La moyenne résume le modèle, l'écart-type dit si ce score est stable.

`modele` est un estimateur déjà construit. `X_reste` et `y_reste` sont tout sauf le test.

```python
from sklearn.model_selection import StratifiedKFold, cross_val_score

blocs = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
scores = cross_val_score(
    modele, X_reste, y_reste, cv=blocs, scoring="f1"
)
scores.mean(), scores.std()
```

Le test n'entre pas dans les blocs.

On l'utilise quand un bloc fixe de 20 % serait trop petit pour départager deux modèles, ce qui est fréquent en machine learning classique sur un tableau de taille moyenne. Cinq blocs est le défaut usuel. Dix blocs laissent plus de lignes à l'entraînement, pour un coût double.

Le modèle final est réentraîné sur tout `X_reste`, puis mesuré une fois sur le test.

# 4. Les deux approches ensemble

| Situation | Validation | Test |
|---|---|---|
| Beaucoup de lignes, ou un réseau coûteux | Un bloc fixe | Un bloc fixe, touché une fois |
| Tableau moyen, modèles classiques | Validation croisée à 5 blocs | Un bloc fixe, touché une fois |
| Très peu de lignes | Validation croisée, parfois sans test séparé | Le score annoncé est alors celui de la croisée, pas d'un test |

Sans test séparé, le chiffre n'est honnête que si le choix du modèle est refait à l'intérieur de chaque bloc. C'est la validation croisée imbriquée : une boucle interne choisit les hyperparamètres, une boucle externe mesure. En pratique, `GridSearchCV` dans `cross_val_score` fait ces deux boucles. Le coût suit la grille : 5 blocs externes fois 5 blocs internes fois le nombre de combinaisons.

`grille` est le dictionnaire des valeurs à essayer.

```python
from sklearn.model_selection import GridSearchCV, cross_val_score

recherche = GridSearchCV(modele, grille, cv=5, scoring="f1")
scores = cross_val_score(recherche, X_reste, y_reste, cv=5, scoring="f1")
```

Après cette estimation, on ajuste `recherche` sur tout `X_reste` et on ne regarde `X_test` qu'une fois.

# 5. Variantes à connaître

| Variante | Quand les lignes ne sont pas interchangeables |
|---|---|
| Stratifiée | La classe rare doit rester présente dans chaque bloc |
| Par groupe | Plusieurs lignes partagent un patient, un client ou un site |
| Temporelle | L'ordre du temps compte : le futur ne doit pas entraîner |
| Leave-one-out | Très peu de lignes : chaque ligne est seule dans son bloc de validation |
| Imbriquée | On règle et on mesure sans réutiliser le même score |
| Bootstrap | On tire avec remise. Les lignes non tirées forment une estimation hors sac |

## Par groupe

Si deux lignes du même patient sont l'une en entraînement et l'autre en validation, le modèle peut reconnaître le patient. Le score ne dit plus ce qui se passera pour un patient nouveau.

```python
from sklearn.model_selection import GroupKFold, cross_val_score

blocs = GroupKFold(n_splits=5)
scores = cross_val_score(
    modele, X_reste, y_reste, cv=blocs, groups=groupes, scoring="f1"
)
```

`groupes` est l'identifiant du patient, du client ou du site, une valeur par ligne. Un même identifiant ne traverse pas la frontière d'un bloc. Il faut au moins autant de groupes que de blocs. `StratifiedGroupKFold` ajoute la contrainte de proportion des classes quand les deux comptent.

## Dans le temps

On n'entraîne que sur le passé. La validation est la période suivante, le test une période encore plus récente.

```python
from sklearn.model_selection import TimeSeriesSplit

blocs = TimeSeriesSplit(n_splits=5)
```

Chaque bloc de validation est plus tardif que son entraînement. La fenêtre d'entraînement s'allonge au fil des blocs. On ne mélange pas les dates.

Si l'étiquette d'une ligne dépend d'une fenêtre future, les lignes collées à la coupure se ressemblent des deux côtés. On écarte alors quelques lignes à la frontière. Ce trou s'appelle un embargo.

## Leave-one-out et bootstrap

Leave-one-out est une validation croisée dont chaque bloc de validation ne contient qu'une ligne. Utile sous quelques dizaines de lignes, coûteux au-delà, et le score varie beaucoup.

Le bootstrap tire des lignes avec remise pour entraîner. Celles qui ne sortent pas servent à estimer. Une forêt aléatoire le fait en interne : c'est l'erreur out-of-bag. Ce n'est pas un remplacement du test quand les lignes sont liées par un groupe ou par le temps.

# 6. Préparer à l'intérieur du bloc

Une médiane, un encodage ou une échelle appris sur toutes les lignes avant le découpage voient la validation et le test. Il faut les calculer seulement sur la partie entraînement de chaque bloc. Un pipeline le fait tout seul.

```python
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

blocs = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
pipe = make_pipeline(StandardScaler(), LogisticRegression())
scores = cross_val_score(pipe, X_reste, y_reste, cv=blocs, scoring="f1")
```

La même règle vaut pour le découpage fixe : on ajuste le préparateur sur `X_train`, on l'applique à `X_val` et, à la fin, à `X_test`.

## À retenir

- L'entraînement apprend, la validation choisit, le test mesure une seule fois.
- Trois blocs fixes : 60 % / 20 % / 20 %. C'est le réflexe quand les données sont nombreuses ou que le modèle est un réseau.
- La validation croisée fait tourner la validation. Elle remplace le bloc de validation, pas le test.
- Stratifier si une classe est rare. Grouper si plusieurs lignes partagent une personne ou un site. Couper dans le temps si les dates comptent.
- La recherche d'hyperparamètres et le prétraitement restent à l'intérieur des blocs d'entraînement.
