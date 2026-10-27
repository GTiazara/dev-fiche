---
title: "Analyser les données avant d'entraîner un modèle"
description: "Préparer un tableau pour le machine learning : contrôles, fuite d'information, découpage, imputation et mise à l'échelle selon le modèle."
technology: ml
difficulty: intermediaire
tags:
  - pandas
  - analyse
  - classification
  - donnees
  - entrainement
publishedAt: 2026-10-27
updatedAt: 2026-10-27
draft: false
quiz:
  - question: "Pourquoi l'exactitude seule est-elle trompeuse si presque tous les clients refusent le produit ?"
    choices:
      - "Parce qu'un modèle qui prédit toujours le refus obtient une exactitude élevée sans rien détecter"
      - "Parce que l'exactitude ne se calcule que sur des variables numériques"
      - "Parce qu'une classe rare augmente toujours l'exactitude"
    answer: 0
    explanation: "Si 88 % des clients refusent, prédire toujours « non » atteint environ 88 % d'exactitude. Le rappel et la précision mesurent la classe rare."
  - question: "Que signifie en général le code 999 dans la colonne pdays du jeu Bank Marketing ?"
    choices:
      - "Le client a été contacté il y a 999 jours"
      - "Le client n'a pas été contacté lors d'une campagne précédente"
      - "La valeur est une moyenne de 999 jours"
    answer: 1
    explanation: "999 est un code sentinelle : il marque l'absence de contact précédent, pas une durée de 999 jours."
  - question: "Pourquoi ne pas utiliser la durée du dernier appel pour choisir qui contacter ?"
    choices:
      - "La durée n'est connue qu'après l'appel, donc elle n'existe pas au moment de la décision"
      - "La durée est toujours indépendante de la souscription"
      - "Une durée longue diminue forcément le taux de souscription"
    answer: 0
    explanation: "La durée de l'appel n'est observée qu'une fois le contact terminé. S'en servir pour cibler avant l'appel fait fuiter une information future."
  - question: "Un test du khi-deux significatif prouve-t-il qu'une variable cause la souscription ?"
    choices:
      - "Oui, une p-value inférieure à 0,05 établit la cause"
      - "Non, il signale une association statistique, pas une cause"
      - "Oui, dès que le V de Cramér dépasse 0,1"
    answer: 1
    explanation: "Le khi-deux et le V de Cramér mesurent une association. Ils ne disent pas qu'une catégorie provoque la souscription."
  - question: "Où calcule-t-on la médiane qui remplace les valeurs manquantes ?"
    choices:
      - "Sur tout le tableau, avant de le découper"
      - "Sur l'entraînement seul, puis on applique cette médiane au test"
      - "Sur le test seul, pour coller à la réalité"
    answer: 1
    explanation: "La médiane du test ne doit pas entrer dans la préparation. On l'estime sur l'entraînement, puis on transforme le test avec cette même valeur."
---

# 1. À quoi sert cette analyse

Avant d'entraîner un modèle, le tableau doit être compris. L'analyse répond à quatre questions.

- Les colonnes ont-elles le bon type, et les codes spéciaux sont-ils de vraies mesures ?
- La classe à prédire est-elle rare ?
- Quelles variables séparent les deux groupes, et lesquelles sont redondantes ?
- Une colonne contient-elle une information qui n'existera pas au moment de la prédiction ?

L'exemple est une campagne bancaire : chaque ligne est un client, et `y` vaut `yes` ou `no`. Les contrôles servent pour tout tableau. La fin de la fiche dit quoi changer pour une régression, des dates ou un réseau de neurones.

# 2. Vérifier le chargement

Un export mal lu peut coller toutes les colonnes dans une seule chaîne, souvent séparée par des points-virgules et entourée de guillemets. On contrôle d'abord le nombre de colonnes, les types et quelques lignes.

```python
import pandas as pd

df = pd.read_feather("bank.feather")

if df.shape[1] == 1:
    brut = df.iloc[:, 0].astype(str).str.strip('"')
    df = brut.str.split(";", expand=True)
    df.columns = [
        "age", "job", "marital", "education", "default", "balance",
        "housing", "loan", "contact", "day", "month", "duration",
        "campaign", "pdays", "previous", "poutcome", "y",
    ]

numeriques = ["age", "balance", "day", "duration", "campaign", "pdays", "previous"]
for col in numeriques:
    df[col] = pd.to_numeric(df[col], errors="coerce")

df.shape
df.dtypes
df.head()
```

`errors="coerce"` transforme une valeur illisible en valeur manquante. Une colonne qui devrait être numérique et qui reste du texte fausse ensuite les moyennes et les graphiques.

# 3. Valeurs manquantes et codes sentinelles

Une case vide n'est pas la seule forme d'absence. Certains jeux écrivent `unknown`, `-1` ou `999` à la place.

| Code | Lecture habituelle dans ce jeu |
|---|---|
| `NaN` | Valeur absente après conversion |
| `unknown` | Catégorie inconnue, à garder comme modalité ou à traiter à part |
| `-1` | Souvent « pas de contact précédent » selon le fichier |
| `999` dans `pdays` | Pas de contact précédent, pas « 999 jours » |

```python
df.isna().sum()
(df == "unknown").sum()
(df[numeriques] == -1).sum()
(df["pdays"] == 999).sum()
```

Remplacer `999` par une durée fausserait la moyenne de `pdays`. On crée plutôt un indicateur `deja_contacte`, puis on n'interprète `pdays` que pour les clients déjà contactés.

# 4. Regarder le déséquilibre

On compte les deux classes avant de choisir une métrique.

```python
df["y"].value_counts()
df["y"].value_counts(normalize=True).mul(100).round(1)
```

Dans ce jeu, environ 88 % des clients refusent. Un modèle qui répond toujours `no` a donc une exactitude élevée et un rappel nul sur `yes`. Pour une campagne, on suit le **rappel** (part des souscripteurs retrouvés), la **précision** (part de vrais souscripteurs parmi les clients ciblés) et le **F1**, pas l'exactitude seule. À l'entraînement, on peut donner plus de poids à la classe rare. Ce poids ne remplace pas ces trois mesures.

# 5. Décrire les variables numériques

`describe` donne l'effectif, la moyenne, l'écart-type et les quartiles. Un histogramme montre si la distribution est symétrique ou tirée par quelques valeurs extrêmes. `balance` et `duration` sont souvent dissymétriques : la médiane résume mieux le client typique que la moyenne.

```python
df[numeriques].describe().round(2)
```

Une variable dont les deux groupes se recouvrent beaucoup discrimine peu **seule**. Elle peut rester utile combinée aux autres.

# 6. Taux et effectifs des catégories

Pour une colonne comme `job` ou `month`, le taux de souscription ne suffit pas. Une petite catégorie peut avoir un taux élevé et peu de souscriptions.

```python
resultats = df.groupby("job", observed=True).agg(
    nombre_clients=("y", "size"),
    souscriptions=("y", lambda s: (s == "yes").sum()),
)
resultats["taux_pourcent"] = (
    resultats["souscriptions"] / resultats["nombre_clients"] * 100
)
resultats.sort_values("taux_pourcent", ascending=False).round(2)
```

On retient à la fois le taux et le nombre de clients. Le même tableau se refait pour `education`, `contact`, `housing`, `month` et `poutcome`.

# 7. Encoder sans inventer un ordre

| Type de variable | Encodage adapté | Piège |
|---|---|---|
| Catégorie sans ordre (`job`, `contact`) | Variables indicatrices (one-hot) | Un encodage par entiers 0, 1, 2 fait croire à un ordre |
| Catégorie ordonnée réelle | Entiers croissants, si l'ordre est métier | Inventer l'ordre |
| Numérique | Laisser le nombre, puis mettre à l'échelle dans le modèle si besoin | Traiter `999` comme une mesure |

L'encodage se calcule sur l'ensemble d'entraînement, puis on l'applique au jeu de test. Ajuster l'encodage sur tout le tableau avant le découpage fait fuiter la répartition du test.

# 8. Mesurer l'association, pas la cause

**Spearman** compare des variables numériques. Le coefficient va de −1 à +1. Proche de 0, pas de lien monotone marqué. Proche de +1 ou −1, lien monotone fort. `previous` et `pdays` peuvent se recouper : garder les deux sans les lire peut doubler la même information.

**Khi-deux** compare deux colonnes catégorielles, ici une caractéristique et `y`. Une p-value inférieure à 0,05 va contre l'hypothèse d'indépendance. Elle ne mesure pas la force du lien et ne prouve pas une cause.

**V de Cramér** reprend le khi-deux et le ramène entre 0 et 1. Proche de 0, association faible. Plus la valeur monte, plus l'association est marquée. Il n'y a pas de seuil universel : on compare les variables entre elles.

```python
import numpy as np
import pandas as pd
from scipy.stats import chi2_contingency

def v_cramer(tableau: pd.DataFrame) -> float:
    chi2 = chi2_contingency(tableau)[0]
    n = tableau.to_numpy().sum()
    lignes, colonnes = tableau.shape
    denominateur = n * min(lignes - 1, colonnes - 1)
    if denominateur == 0:
        return np.nan
    return float(np.sqrt(chi2 / denominateur))
```

Dans ce jeu, `poutcome`, `month` et `contact` ressortent plus fortement que `education` ou `marital`. Ce sont des candidates pour le modèle, pas des preuves que le mois « cause » la souscription. Le mois mélange la saison, le volume d'appels et les règles de la campagne.

# 9. Comparer les deux groupes

Pour `age`, `balance` ou `campaign`, on compare moyenne, médiane et boîtes à moustaches selon `y`. Le test de **Mann-Whitney** compare les distributions de deux groupes sans supposer une courbe en cloche. Il convient quand le solde ou le nombre d'appels est dissymétrique.

Si l'on teste plusieurs colonnes, certaines p-values passent sous 0,05 par hasard. La correction de **Holm** limite ces faux signaux. Une différence détectable peut rester trop petite pour être utile en campagne : on regarde aussi l'écart de médianes.

# 10. Écarter ce qui n'est pas connu à temps

`duration` est fortement liée à `y`, parce qu'un appel qui aboutit à une souscription dure souvent plus longtemps. Cette durée n'existe qu'après l'appel. L'utiliser pour choisir qui appeler donne un modèle optimiste, inutilisable avant le contact.

La même règle s'applique à toute colonne produite par le résultat qu'on cherche à prédire.

# 11. Préparer le tableau dans cet ordre

Comprendre le tableau ne le prépare pas. L'ordre compte, parce qu'une statistique calculée trop tôt laisse le test influencer l'entraînement.

| Ordre | Geste | Idée à retenir |
|---|---|---|
| 1 | Retirer les doublons exacts | La même ligne deux fois pèse deux fois |
| 2 | Fixer la cible et retirer les fuites | Une colonne produite par le résultat n'est pas une entrée |
| 3 | Découper entraînement et test | Le test reste invisible jusqu'à l'évaluation |
| 4 | Remplacer les manquants | Médiane ou mode appris sur l'entraînement. Une colonne 0/1 garde la trace de l'absence quand elle informe |
| 5 | Regrouper les catégories rares | Une modalité vue trois fois ne se généralise pas. Le seuil se choisit sur l'entraînement |
| 6 | Encoder | One-hot s'il y a peu de modalités |
| 7 | Mettre à l'échelle seulement si le modèle l'exige | Un arbre s'en passe. Un modèle linéaire et un réseau en ont besoin |

Le fragment suivant suppose que `X` contient déjà les colonnes numériques et que `y` est la cible. Il montre la règle, pas un script complet de campagne.

```python
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# stratify garde la proportion de chaque classe. On le retire en régression.
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=0
)

# fit lit l'entraînement. transform applique la même règle au test.
mediane = SimpleImputer(strategy="median").fit(X_train)
X_train = mediane.transform(X_train)
X_test = mediane.transform(X_test)

echelle = StandardScaler().fit(X_train)
X_train = echelle.transform(X_train)
X_test = echelle.transform(X_test)
```

`StandardScaler` centre chaque colonne à 0 et la ramène à un écart-type de 1. Sans cela, un solde en milliers écrase un âge entre 18 et 95 dans une régression linéaire, un SVM ou un réseau.

# 12. Arbre, modèle linéaire ou réseau

| Modèle | Mise à l'échelle | Catégories | Valeurs manquantes |
|---|---|---|---|
| Arbre, forêt, gradient boosting | Inutile : seul l'ordre des seuils compte | One-hot, ou catégories natives si l'outil les accepte | Souvent acceptées. Un code sentinelle (`999`) reste à corriger |
| Régression linéaire, SVM | Nécessaire | One-hot | Imputation avant le modèle |
| Réseau de neurones | Nécessaire | Embedding dès que les modalités deviennent nombreuses | Imputation, plus une colonne « était manquant » |

Un embedding est une petite liste de nombres apprise pour chaque modalité. Avec des centaines de métiers ou de codes produit, le one-hot fabrique des centaines de colonnes presque vides. L'embedding reste compact.

Une valeur extrême se voit sur un histogramme. Un arbre l'isole dans une feuille. Une régression linéaire ou un réseau lui donne un poids énorme : un log du solde, par exemple, limite cet effet. On ne supprime la ligne que si la valeur est une erreur de saisie.

# 13. Adapter le découpage à la question

| Question | Découpage | Mesure |
|---|---|---|
| Deux classes, ou davantage | `stratify` pour garder la proportion de chaque classe | Rappel, précision, F1 |
| Régression : un montant, une durée, une note | Pas de classe à équilibrer | Erreur moyenne, pas le rappel |
| Lignes datées | Le test est la période qui vient après l'entraînement | La même mesure, sur cette période future |

Un tirage au hasard sur des dates met le futur dans l'entraînement. Le score est alors trop beau, et le modèle échoue dès la semaine suivante.

On compare ensuite quelques modèles simples, avec la mesure choisie avant l'entraînement.

## À retenir

- Contrôler les types et les codes `unknown`, `-1` et `999` avant toute moyenne.
- Croiser taux et effectif. L'exactitude seule masque une classe rare : suivre le rappel, la précision et le F1.
- Imputation, encodage et échelle s'apprennent sur l'entraînement seul, puis s'appliquent au test.
- Un arbre n'a pas besoin d'échelle. Un modèle linéaire et un réseau en ont besoin. Avec beaucoup de modalités, le réseau utilise un embedding.
- Une association n'est pas une cause. Une colonne connue seulement après l'événement est une fuite.
- Des lignes datées se coupent dans le temps. Une régression se juge à l'erreur, pas au rappel.
