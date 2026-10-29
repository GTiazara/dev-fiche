---
title: Les algorithmes de Machine Learning appliqués à la géomatique
description: Comprendre les principaux algorithmes de Machine Learning, leurs cas d'utilisation et leur mise en œuvre à travers des exemples métiers concrets en géomatique, SIG, télédétection et analyse spatiale.
technology: ml
difficulty: intermediaire
tags: [machine-learning, intelligence-artificielle, geospatial, geomatique, SIG, teledetection, python, scikit-learn, classification, regression, clustering]
publishedAt: 2026-10-28
updatedAt: 2026-10-28
draft: false
quiz:
  - question: Quel algorithme convient pour prédire le prix d'un terrain à partir de ses caractéristiques géographiques ?
    choices:
      - K-Means
      - Random Forest Regressor
      - DBSCAN
    answer: 1
    explanation: Random Forest Regressor est un algorithme de régression qui permet de prédire une valeur numérique, comme le prix d'un terrain, à partir de variables explicatives.
  - question: Quel algorithme permet de regrouper des bâtiments selon leurs caractéristiques sans disposer de classes prédéfinies ?
    choices:
      - K-Means
      - Régression logistique
      - Random Forest Classifier
    answer: 0
    explanation: K-Means est un algorithme de clustering non supervisé qui regroupe les observations en K clusters selon leurs similarités.
  - question: Quel algorithme est particulièrement adapté à la détection de zones denses et de points atypiques à partir de coordonnées spatiales ?
    choices:
      - Régression linéaire
      - DBSCAN
      - Régression logistique
    answer: 1
    explanation: DBSCAN regroupe les observations selon leur densité et identifie les points isolés comme du bruit. Il peut être utilisé pour analyser des concentrations de points géographiques, en tenant compte du système de coordonnées et de la distance choisie.
  - question: Pourquoi faut-il éviter de répartir aléatoirement des pixels voisins entre les jeux d'entraînement et de test en télédétection ?
    choices:
      - Parce que les images satellites ne peuvent pas être utilisées avec le Machine Learning
      - Parce que cela peut créer une fuite d'information spatiale et surestimer les performances
      - Parce que les algorithmes supervisés nécessitent toujours des coordonnées GPS
    answer: 1
    explanation: Les pixels voisins présentent souvent des caractéristiques similaires. Une séparation spatiale indépendante permet de mieux évaluer la capacité du modèle à généraliser à de nouvelles zones géographiques.
  - question: Quelle bibliothèque Python permet notamment d'entraîner des modèles Random Forest, SVM et K-Means ?
    choices:
      - scikit-learn
      - Matplotlib uniquement
      - GeoServer
    answer: 0
    explanation: scikit-learn fournit une large gamme d'algorithmes de Machine Learning, des outils de préparation des données et des métriques d'évaluation.

---

## Définition

Le **Machine Learning (ML), ou apprentissage automatique**, est une branche de l'intelligence artificielle qui consiste à entraîner des algorithmes à identifier des relations et des structures dans les données afin de réaliser des prédictions, des classifications ou des regroupements.

Contrairement à une approche entièrement fondée sur des règles définies manuellement, le Machine Learning apprend des relations à partir d'exemples ou de données disponibles.

En géomatique, ces données peuvent provenir de sources variées :

- **Données vectorielles** : parcelles cadastrales, bâtiments, routes, réseaux et points d'intérêt.
- **Données raster** : images satellites, orthophotographies, modèles numériques de terrain et cartes d'occupation du sol.
- **Données géolocalisées** : accidents, interventions, observations environnementales et déplacements.
- **Données temporelles** : évolution de l'urbanisation, séries d'images satellites et mesures de capteurs.
- **Données attributaires** : population, prix immobiliers, caractéristiques des bâtiments et indicateurs socio-économiques.

L'objectif est de transformer ces données en informations utiles à la décision.

### Exemple concret

Une collectivité souhaite identifier les quartiers les plus exposés aux îlots de chaleur urbains.

Un ingénieur géomaticien peut exploiter :

- La température de surface issue d'images satellites.
- Le taux d'imperméabilisation.
- La densité du bâti.
- La présence de végétation.
- La distance aux espaces verts.
- La hauteur des bâtiments.

Un modèle de Machine Learning peut ensuite contribuer à estimer la température de surface, à identifier des secteurs présentant des caractéristiques similaires ou à détecter les facteurs associés aux températures élevées.

Le modèle ne remplace pas l'analyse géographique : il la complète en permettant de traiter des volumes de données importants et de détecter des relations complexes.

---

## 1. Les grandes familles du Machine Learning

Avant de choisir un algorithme, il faut identifier le type de problème à résoudre.

| Famille | Principe | Exemple en géomatique | Algorithmes représentatifs |
| --- | --- | --- | --- |
| **Apprentissage supervisé** | Apprendre à partir de données dont la réponse attendue est connue | Classifier des parcelles selon leur usage | Random Forest, SVM, régression logistique |
| **Apprentissage non supervisé** | Découvrir des groupes ou des structures sans classes prédéfinies | Identifier des profils de quartiers | K-Means, DBSCAN, clustering hiérarchique |
| **Régression** | Prédire une valeur numérique | Estimer le prix d'un terrain | Régression linéaire, Random Forest Regressor, XGBoost |
| **Détection d'anomalies** | Repérer des observations inhabituelles | Détecter des consommations d'eau atypiques | Isolation Forest, LOF |
| **Apprentissage profond** | Apprendre des représentations complexes à partir de données, notamment des images | Segmenter des bâtiments dans une orthophotographie | CNN, U-Net, modèles de vision |
| **Apprentissage par renforcement** | Apprendre une stratégie à partir de récompenses et d'interactions | Optimiser expérimentalement une stratégie de déplacement | Q-Learning, Deep Q-Networks |

**Attention :** la régression est une tâche d'apprentissage supervisé, et l'apprentissage profond constitue une famille de méthodes qui peut répondre à plusieurs types de problèmes. Ces catégories ne sont donc pas toutes mutuellement exclusives.

---

## 2. Les algorithmes de classification

La classification consiste à attribuer une classe à une observation.

En géomatique, cette tâche permet notamment de classer des parcelles, des bâtiments, des pixels satellitaires ou des secteurs géographiques.

### 2.1. Random Forest Classifier

**Principe**

Random Forest est un algorithme d'ensemble qui entraîne plusieurs arbres de décision et combine leurs prédictions.

Chaque arbre apprend des règles à partir d'un échantillon des données et d'un sous-ensemble de variables. La prédiction finale est obtenue par vote majoritaire dans le cas d'une classification.

**Cas d'utilisation en géomatique**

- Classification de l'occupation du sol.
- Identification de bâtiments résidentiels, industriels ou commerciaux à partir de leurs attributs.
- Classification de parcelles agricoles selon leur type de culture.
- Détection de zones potentiellement artificialisées.
- Classification de secteurs selon leurs caractéristiques environnementales.

**Exemple métier : classification de l'occupation du sol**

Un organisme public dispose de polygones de référence décrivant différentes catégories d'occupation du sol.

Pour chaque polygone, il extrait :

| Variable | Description |
| --- | --- |
| `ndvi_mean` | Valeur moyenne de l'indice de végétation |
| `ndbi_mean` | Valeur moyenne d'un indice associé aux surfaces bâties |
| `slope` | Pente moyenne du terrain |
| `distance_road` | Distance à la route la plus proche |
| `class_landcover` | Classe d'occupation du sol à prédire |

Le modèle apprend à distinguer les catégories à partir des exemples connus, puis prédit la classe des nouvelles observations.

**Exemple de code Python**

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Variables explicatives et variable cible
X = gdf[
    ["ndvi_mean", "ndbi_mean", "slope", "distance_road"]
]

y = gdf["class_landcover"]

# Séparation des données
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Entraînement du modèle
model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    class_weight="balanced"
)

model.fit(X_train, y_train)

# Prédictions
y_pred = model.predict(X_test)

# Évaluation
print(classification_report(y_test, y_pred))
```

Dans cet exemple, `gdf` est un GeoDataFrame GeoPandas contenant les variables calculées pour les polygones de référence.

Le code suppose que les données ont déjà été préparées et que les variables explicatives sont numériques, sans valeurs manquantes non traitées.

**Avantages**

- Fonctionne bien sur de nombreuses données tabulaires.
- Capture des relations non linéaires.
- Nécessite généralement peu de normalisation des variables.
- Fournit des indicateurs d'importance des variables, à interpréter avec précaution.

**Limites**

- Peut être volumineux et coûteux à exécuter sur des rasters très importants.
- Les prédictions dépendent de la représentativité des données d'entraînement.
- L'importance des variables ne prouve pas une relation causale.

### 2.2. Support Vector Machine (SVM)

**Principe**

Le SVM cherche une frontière permettant de séparer les classes en maximisant la marge entre elles.

Grâce aux fonctions noyau (*kernels*), il peut également représenter des frontières de décision non linéaires.

**Cas d'utilisation**

- Classification d'images satellites à partir de variables spectrales.
- Distinction entre différentes catégories d'occupation du sol.
- Classification de parcelles agricoles.
- Classification de profils territoriaux comportant de nombreuses variables.

**Exemple métier**

Un bureau d'études doit distinguer des surfaces agricoles, forestières, urbaines et aquatiques à partir de signatures spectrales extraites d'images satellites.

Un SVM peut apprendre à partir d'échantillons déjà étiquetés et classifier de nouveaux pixels.

```python
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

model = make_pipeline(
    StandardScaler(),
    SVC(kernel="rbf", C=10, gamma="scale")
)

model.fit(X_train, y_train)

y_pred = model.predict(X_test)
```

La normalisation est importante pour de nombreuses configurations de SVM, car l'échelle des variables influence la construction de la frontière de décision.

**Avantages**

- Efficace sur de nombreux jeux de données de taille modérée.
- Peut apprendre des frontières complexes.
- Adapté à des données comportant plusieurs variables spectrales.

**Limites**

- La sélection des paramètres peut être délicate.
- L'entraînement peut devenir coûteux lorsque le nombre d'observations augmente fortement.
- L'interprétation est moins directe que celle d'un arbre de décision.

### 2.3. Régression logistique

**Principe**

Malgré son nom, la régression logistique est principalement utilisée pour la classification.

Elle estime la probabilité qu'une observation appartienne à une classe. Une règle de décision permet ensuite d'attribuer une catégorie.

**Cas d'utilisation**

- Identifier les parcelles susceptibles d'être artificialisées.
- Estimer la probabilité qu'un bâtiment présente un risque de surchauffe.
- Repérer des secteurs susceptibles de connaître une évolution d'usage.
- Classer des observations selon une probabilité de présence.

**Exemple métier : probabilité d'artificialisation**

Un établissement public souhaite estimer la probabilité qu'une parcelle devienne artificialisée à partir de variables comme la distance au centre urbain, l'accessibilité routière, le zonage réglementaire et les évolutions passées.

Le modèle produit une probabilité qui peut contribuer à prioriser les parcelles à examiner.

```python
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

model = make_pipeline(
    StandardScaler(),
    LogisticRegression(max_iter=2000)
)

model.fit(X_train, y_train)

probabilities = model.predict_proba(X_test)[:, 1]
```

**Avantages**

- Simple à mettre en œuvre.
- Permet d'obtenir des probabilités.
- Les coefficients peuvent être interprétés dans le cadre du modèle.

**Limites**

- Les relations apprises sont relativement contraintes sans transformation des variables.
- La calibration des probabilités doit être vérifiée.
- Une bonne probabilité prédictive ne démontre pas qu'une variable est la cause du phénomène.

### 2.4. XGBoost et les algorithmes de boosting

**Principe**

Les algorithmes de boosting construisent progressivement un ensemble de modèles, chaque étape cherchant à corriger les erreurs des précédentes.

XGBoost est une implémentation optimisée du gradient boosting sur arbres de décision.

**Cas d'utilisation**

- Prédiction de l'évolution de la valeur foncière.
- Classification de parcelles à partir de nombreuses variables.
- Estimation du risque d'inondation à partir de caractéristiques de terrain et d'observations historiques.
- Modélisation de phénomènes urbains à partir de données tabulaires.

**Exemple métier**

Un observatoire foncier cherche à identifier les facteurs associés à la transformation de parcelles agricoles en parcelles urbanisées.

Il rassemble des observations historiques, des caractéristiques des parcelles, leur accessibilité, le zonage et des indicateurs de pression urbaine.

Un modèle de boosting peut apprendre les relations prédictives présentes dans ces données.

**Avantages**

- Très performant sur de nombreux problèmes tabulaires.
- Capture des relations non linéaires et les interactions entre variables.
- Permet de régler finement la complexité du modèle.

**Limites**

- Demande un réglage plus approfondi des hyperparamètres.
- Peut surapprendre si les données sont insuffisantes ou si le modèle est trop complexe.
- Les probabilités et les importances des variables nécessitent une évaluation adaptée.

**À retenir :** Random Forest constitue souvent un bon point de départ. XGBoost est une alternative à tester lorsque la performance prédictive est un objectif important.

---

## 3. Les algorithmes de régression

La régression vise à prédire une valeur numérique plutôt qu'une catégorie.

### 3.1. Régression linéaire

**Principe**

La régression linéaire modélise une variable numérique en fonction d'une combinaison linéaire de variables explicatives.

**Cas d'utilisation en géomatique**

- Estimation d'un prix immobilier.
- Analyse de la relation entre la densité urbaine et la température de surface.
- Estimation d'indicateurs territoriaux.
- Analyse de la consommation d'eau en fonction de caractéristiques observées.

**Exemple métier : estimation de la valeur foncière**

Un observatoire immobilier souhaite estimer le prix d'une parcelle à partir de sa surface, de sa localisation, de son accessibilité et de la proximité des services.

```python
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error

X = gdf[
    ["area_m2", "distance_station", "distance_center"]
]

y = gdf["price_euros"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = LinearRegression()
model.fit(X_train, y_train)

y_pred = model.predict(X_test)

print("MAE :", mean_absolute_error(y_test, y_pred))
```

La MAE (*Mean Absolute Error*) mesure l'erreur absolue moyenne entre les prix observés et les prix prédits. Elle s'exprime ici en euros.

**Avantages**

- Facile à comprendre et à expliquer.
- Rapide à entraîner.
- Constitue une référence pertinente pour comparer des modèles plus complexes.

**Limites**

- Les relations modélisées sont linéaires dans les variables utilisées.
- Les valeurs atypiques peuvent influencer fortement le résultat.
- Une structure spatiale non modélisée peut limiter les performances.

### 3.2. Random Forest Regressor

**Principe**

Il s'agit de la version régression de Random Forest. Au lieu de voter pour une catégorie, les arbres produisent des valeurs numériques combinées pour obtenir la prédiction finale.

**Cas d'utilisation**

- Estimation de la température de surface.
- Prédiction du prix des terrains.
- Estimation de la biomasse à partir de variables issues de la télédétection.
- Prédiction d'indicateurs environnementaux.
- Estimation de la consommation d'eau ou d'énergie à partir de caractéristiques territoriales.

**Exemple métier**

Une collectivité souhaite estimer la température de surface à partir de l'indice de végétation, de l'imperméabilisation, de la densité bâtie et de variables topographiques.

Le modèle peut apprendre des relations non linéaires entre ces variables et les températures observées.

**Avantages**

- Capture des relations complexes.
- Robuste sur de nombreux jeux de données tabulaires.
- Ne nécessite généralement pas de standardiser les variables.

**Limites**

- Les prédictions restent fortement dépendantes des données d'entraînement.
- L'extrapolation au-delà des valeurs observées est généralement limitée.
- Les résultats doivent être évalués sur des zones indépendantes pour estimer leur capacité de généralisation spatiale.

### 3.3. Gradient Boosting Regressor

**Principe**

Le modèle construit une succession d'arbres de décision destinés à améliorer progressivement les prédictions.

**Cas d'utilisation**

- Prévision de valeurs foncières.
- Estimation de la demande en services urbains.
- Modélisation de variables environnementales.
- Prédiction de mesures issues de capteurs géolocalisés.

**Exemple métier**

Un gestionnaire de réseau d'eau souhaite estimer la consommation attendue d'un secteur en fonction de la population, du type de bâtiments, de la saison et des caractéristiques territoriales.

Un modèle de boosting peut apprendre les relations présentes dans les données historiques, à condition que les variables disponibles correspondent bien au moment de la prédiction.

**À retenir :** la régression linéaire constitue une bonne référence. Random Forest et Gradient Boosting sont à envisager lorsque les relations entre les variables sont plus complexes.

---

## 4. Les algorithmes de clustering

Le clustering, ou regroupement non supervisé, permet de découvrir des groupes d'observations similaires sans disposer de classes de référence.

En géomatique, il peut être utilisé pour identifier des profils de quartiers, des concentrations de points ou des typologies territoriales.

### 4.1. K-Means

**Principe**

K-Means répartit les observations en K groupes en minimisant la distance entre les observations et le centre de leur groupe.

Le nombre de groupes doit être choisi avant l'entraînement.

**Cas d'utilisation**

- Typologie de quartiers.
- Regroupement de bâtiments selon leurs caractéristiques.
- Segmentation de profils territoriaux.
- Analyse de zones présentant des caractéristiques environnementales similaires.
- Regroupement de parcelles selon leurs attributs.

**Exemple métier : typologie des quartiers**

Une agence d'urbanisme souhaite identifier différents profils de quartiers à partir des variables suivantes :

- Densité de population.
- Part des espaces verts.
- Densité du bâti.
- Accessibilité aux transports.
- Part des logements collectifs.

```python
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

features = gdf[
    [
        "population_density",
        "green_space_ratio",
        "building_density",
        "public_transport_access"
    ]
]

model = make_pipeline(
    StandardScaler(),
    KMeans(
        n_clusters=4,
        random_state=42,
        n_init=10
    )
)

gdf["cluster"] = model.fit_predict(features)
```

Le résultat attribue à chaque quartier un numéro de groupe compris entre 0 et 3.

Ces numéros ne correspondent pas automatiquement à des catégories métier. Il faut analyser les caractéristiques moyennes des groupes pour déterminer si l'on retrouve, par exemple, des quartiers denses, résidentiels, végétalisés ou périphériques.

**Avantages**

- Simple à utiliser.
- Efficace sur de nombreux jeux de données numériques.
- Produit des groupes faciles à cartographier.

**Limites**

- Il faut définir K à l'avance.
- Les résultats dépendent de l'échelle des variables et de l'initialisation.
- L'algorithme ne garantit pas que les groupes obtenus seront géographiquement contigus.

**Point de vigilance géomatique :** K-Means regroupe des observations selon les variables utilisées, pas nécessairement selon leur proximité géographique. Si l'objectif est de créer des zones contiguës, des contraintes spatiales supplémentaires sont nécessaires.

### 4.2. DBSCAN

**Principe**

DBSCAN regroupe les observations situées dans des zones suffisamment denses et identifie les observations isolées comme du bruit.

Deux paramètres principaux sont utilisés :

- `eps` : distance maximale définissant le voisinage.
- `min_samples` : nombre minimal d'observations nécessaires pour caractériser une zone dense.

**Cas d'utilisation**

- Détection de concentrations d'accidents.
- Identification de regroupements de commerces.
- Analyse des concentrations de signalements urbains.
- Détection de points géographiques atypiques.
- Exploration de la répartition spatiale d'événements.

**Exemple métier : analyse des accidents routiers**

Un service de sécurité routière dispose des coordonnées de plusieurs milliers d'accidents.

Il souhaite identifier les secteurs présentant des concentrations locales d'événements afin de prioriser les diagnostics de terrain.

```python
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler

# coords_m contient les coordonnées projetées en mètres.
coords_m = gdf[["x_m", "y_m"]].to_numpy()

model = DBSCAN(
    eps=100,
    min_samples=5
)

gdf["cluster"] = model.fit_predict(coords_m)
```

Dans cet exemple, `eps=100` signifie que le voisinage est défini sur une distance de 100 unités dans le système de coordonnées utilisé. Si les coordonnées sont exprimées en mètres, il s'agit de 100 mètres.

La valeur `-1` indique les observations que DBSCAN n'a affectées à aucun cluster.

**Avantages**

- Ne nécessite pas de définir le nombre de clusters.
- Détecte des groupes de formes variées.
- Identifie les observations isolées.

**Limites**

- Le choix des paramètres est déterminant.
- Les résultats dépendent de la densité des observations.
- Une distance fixe peut être inadaptée à des zones de densités très différentes.

**Point de vigilance géomatique :** ne pas appliquer directement une distance en mètres à des coordonnées longitude/latitude exprimées en degrés. Il faut choisir un système de coordonnées approprié ou une méthode de distance géodésique adaptée.

### 4.3. Clustering hiérarchique

**Principe**

Le clustering hiérarchique construit une hiérarchie de groupes qui peut être représentée sous la forme d'un dendrogramme.

Il est possible d'examiner différents niveaux de regroupement sans imposer immédiatement une partition définitive.

**Cas d'utilisation**

- Construction de typologies territoriales.
- Classification de profils communaux.
- Analyse exploratoire de caractéristiques de quartiers.
- Regroupement de territoires selon des indicateurs socio-économiques.

**Exemple métier**

Un observatoire territorial souhaite comparer plusieurs centaines de communes à partir de variables telles que la densité de population, l'évolution démographique, l'accès aux transports et la part des espaces naturels.

Le clustering hiérarchique peut révéler une organisation progressive des communes en grands profils territoriaux puis en sous-groupes plus spécialisés.

**À retenir :** K-Means est souvent adapté à une première segmentation de données numériques. DBSCAN convient davantage à l'exploration de concentrations denses et de points isolés. Le clustering hiérarchique est utile pour explorer les relations entre groupes à différents niveaux.

---

## 5. Détection d'anomalies

La détection d'anomalies cherche à identifier des observations qui se distinguent du comportement habituel des données.

Une anomalie statistique n'est pas nécessairement une erreur : elle peut représenter un phénomène réel, une situation rare ou un problème de mesure.

### 5.1. Isolation Forest

**Principe**

Isolation Forest isole progressivement les observations au moyen d'arbres aléatoires. Les observations atypiques ont tendance à être isolées plus rapidement.

**Cas d'utilisation**

- Détection de valeurs atypiques dans des bases géographiques.
- Identification de mesures inhabituelles provenant de capteurs.
- Repérage de caractéristiques de bâtiments rares.
- Contrôle qualité de données attributaires.
- Détection de consommations inhabituelles dans un réseau.

**Exemple métier : contrôle qualité d'une base de bâtiments**

Une collectivité dispose d'une base comprenant la surface des bâtiments, leur hauteur, leur emprise au sol et le nombre d'étages.

Le modèle peut repérer les observations qui présentent des combinaisons de caractéristiques inhabituelles et aider à sélectionner les bâtiments à contrôler.

```python
from sklearn.ensemble import IsolationForest

features = gdf[
    ["area_m2", "height_m", "footprint_m2", "floor_count"]
]

model = IsolationForest(
    contamination=0.02,
    random_state=42
)

gdf["anomaly"] = model.fit_predict(features)

# -1 : observation signalée comme atypique
#  1 : observation non signalée comme atypique
```

Le paramètre `contamination=0.02` correspond à une hypothèse d'environ 2 % d'observations atypiques. Il ne faut pas l'interpréter comme une proportion connue de véritables erreurs.

**Avantages**

- Adapté à l'exploration de grands jeux de données tabulaires.
- Ne nécessite pas de disposer d'une classe « anomalie » pour chaque observation.
- Peut aider à prioriser les contrôles.

**Limites**

- Peut signaler des observations rares mais parfaitement valides.
- Les résultats dépendent des variables sélectionnées et des paramètres.
- Ne remplace pas des règles métier de validation des données.

### 5.2. Local Outlier Factor (LOF)

**Principe**

LOF compare la densité locale d'une observation à celle de ses voisins.

Une observation peut être considérée comme atypique si elle se trouve dans une région nettement moins dense que son voisinage.

**Cas d'utilisation**

- Repérage de bâtiments atypiques par rapport aux bâtiments voisins.
- Détection de profils territoriaux inhabituels.
- Analyse de valeurs anormales dans des mesures géolocalisées.

**Exemple métier**

Dans une base de bâtiments, LOF peut identifier des constructions dont les caractéristiques sont inhabituelles par rapport aux bâtiments similaires situés dans leur voisinage statistique.

Pour une analyse spatiale stricte, il est nécessaire de construire explicitement le voisinage géographique plutôt que de supposer que les voisins dans l'espace des variables sont nécessairement les voisins géographiques.

---

## 6. Machine Learning appliqué à la télédétection

La télédétection constitue un domaine particulièrement intéressant pour le Machine Learning, car les images satellitaires et aériennes fournissent des volumes importants de données.

### 6.1. Classification supervisée des images satellites

**Objectif métier**

Produire une carte d'occupation du sol distinguant, par exemple :

- Les surfaces artificialisées.
- La végétation.
- Les sols nus.
- Les surfaces en eau.
- Les différentes catégories agricoles.

**Méthodes possibles**

| Algorithme | Utilisation |
| --- | --- |
| Random Forest | Classification à partir de variables spectrales et auxiliaires |
| SVM | Classification de données spectrales, notamment sur des jeux de taille modérée |
| XGBoost | Classification de variables tabulaires dérivées des images |
| CNN | Apprentissage spatial à partir de voisinages de pixels ou de données image |
| U-Net | Segmentation sémantique de pixels à partir d'images |

Pour une première approche opérationnelle, Random Forest constitue souvent un choix pertinent, notamment lorsque des échantillons de référence sont disponibles.

### 6.2. Indices spectraux et variables auxiliaires

Un modèle n'exploite pas nécessairement l'image brute. Il peut utiliser des variables dérivées de l'image et des données géographiques complémentaires.

Exemples :

| Variable | Signification | Utilisation possible |
| --- | --- | --- |
| NDVI | Indice de végétation | Caractérisation de la végétation |
| NDBI | Indice associé aux surfaces bâties | Aide à la discrimination de certaines surfaces artificialisées |
| NDWI | Indice spectral lié à l'eau selon sa formulation | Aide à la détection de certaines surfaces en eau |
| Altitude | Valeur issue d'un MNT | Classification environnementale |
| Pente | Dérivée du MNT | Analyse du relief |
| Distance aux routes | Proximité du réseau routier | Modélisation de phénomènes territoriaux |
| Distance aux bâtiments | Proximité du bâti | Analyse de l'occupation du sol |

Ces indices ne déterminent pas automatiquement une classe : ils constituent des variables explicatives dont la pertinence dépend des données et du contexte.

### 6.3. Apprentissage profond pour la segmentation d'images

Les réseaux de neurones convolutifs, ou CNN, sont particulièrement adaptés à l'apprentissage de motifs spatiaux dans les images.

**U-Net** est une architecture fréquemment utilisée pour la segmentation sémantique d'images.

Contrairement à une classification classique par pixel, un modèle de segmentation apprend à attribuer une classe aux pixels en exploitant le contexte spatial de l'image.

**Exemple métier : extraction automatique des bâtiments**

Un service cartographique souhaite produire une couche de bâtiments à partir d'orthophotographies.

Le flux de travail peut comprendre :

1. La collecte d'orthophotographies et de polygones de bâtiments de référence.
2. La préparation des images et des masques de segmentation.
3. L'entraînement d'un modèle U-Net.
4. La prédiction des masques de bâtiments sur de nouvelles images.
5. La vectorisation des masques.
6. Le nettoyage géométrique et la validation des résultats.

**Avantages**

- Exploite le contexte spatial des images.
- Peut reconnaître des motifs complexes.
- Convient à des tâches telles que la segmentation de bâtiments, de routes ou de surfaces végétalisées.

**Limites**

- Nécessite généralement des données d'entraînement annotées.
- Demande davantage de ressources de calcul et de compétences techniques.
- La qualité dépend fortement des annotations, des images et de la diversité des conditions d'acquisition.

**À retenir :** les méthodes classiques comme Random Forest sont souvent un bon point de départ. Les modèles profonds deviennent particulièrement intéressants lorsque la forme et le contexte spatial des objets sont essentiels.

---

## 7. Comment choisir le bon algorithme ?

Le choix dépend avant tout de la question métier, de la nature des données et de la façon dont les résultats seront utilisés.

| Besoin métier | Type de problème | Algorithmes à tester en priorité |
| --- | --- | --- |
| Produire une carte d'occupation du sol à partir d'échantillons étiquetés | Classification | Random Forest, SVM |
| Extraire des bâtiments à partir d'orthophotographies | Segmentation d'images | U-Net, autres CNN |
| Estimer le prix d'une parcelle | Régression | Régression linéaire, Random Forest Regressor, XGBoost |
| Regrouper des quartiers selon leur profil socio-économique | Clustering | K-Means, clustering hiérarchique |
| Identifier des concentrations d'accidents | Clustering spatial | DBSCAN, méthodes de statistiques spatiales |
| Détecter des valeurs inhabituelles dans une base de bâtiments | Détection d'anomalies | Isolation Forest, LOF |
| Estimer la température de surface | Régression | Random Forest Regressor, Gradient Boosting |
| Classer des parcelles selon des caractéristiques multiples | Classification | Random Forest, XGBoost |
| Détecter des zones présentant des caractéristiques similaires | Clustering | K-Means, méthodes de regroupement spatial |

Il ne faut pas rechercher systématiquement l'algorithme le plus complexe. Une méthode simple, correctement évaluée et adaptée au besoin métier, peut être préférable à un modèle plus sophistiqué difficile à expliquer ou à maintenir.

---

## 8. Le workflow Machine Learning d'un ingénieur géomaticien

Un projet de Machine Learning géospatial comprend généralement plusieurs étapes.

### Étape 1 : définir le problème métier

Il faut préciser la décision ou la production attendue.

Exemples :

- Produire une carte d'occupation du sol.
- Identifier des bâtiments à contrôler.
- Estimer la valeur foncière de parcelles.
- Détecter des concentrations d'accidents.
- Segmenter automatiquement des objets sur des images.

La définition du problème permet de choisir la bonne famille d'algorithmes et la bonne métrique d'évaluation.

### Étape 2 : collecter et préparer les données

Les données peuvent provenir :

- De fichiers GeoPackage ou Shapefile.
- De bases PostGIS.
- D'images Sentinel ou Landsat.
- D'orthophotographies.
- De modèles numériques de terrain.
- De données ouvertes et de référentiels métiers.

Les outils Python couramment utilisés comprennent :

| Bibliothèque | Rôle |
| --- | --- |
| GeoPandas | Manipulation de données vectorielles |
| Rasterio | Lecture et traitement de rasters |
| NumPy | Calcul numérique |
| pandas | Préparation des données tabulaires |
| scikit-learn | Algorithmes de Machine Learning |
| XGBoost | Gradient boosting |
| PyTorch | Construction et entraînement de réseaux de neurones |
| Shapely | Opérations géométriques |
| Matplotlib | Visualisation des résultats |

### Étape 3 : construire les variables explicatives

Cette étape est souvent appelée *feature engineering*.

Elle consiste à transformer les données brutes en variables pertinentes pour le problème.

Exemples :

- Calcul du NDVI à partir d'une image satellite.
- Calcul de la pente à partir d'un MNT.
- Calcul de la surface des parcelles.
- Mesure de la distance aux transports en commun.
- Calcul de la densité de bâtiments dans un quartier.
- Agrégation de données de population par unité spatiale.

La qualité de ces variables peut avoir un effet majeur sur les performances du modèle.

### Étape 4 : séparer les données d'entraînement et de test

Le modèle doit être évalué sur des observations qui n'ont pas servi à son apprentissage.

En géomatique, une séparation aléatoire classique peut être insuffisante.

Par exemple, si des pixels voisins d'une même image sont répartis entre l'entraînement et le test, leurs caractéristiques peuvent être très similaires. Le modèle risque alors d'obtenir des résultats trop optimistes.

Lorsque l'objectif est de prédire sur de nouvelles zones, il est souvent préférable de réserver des secteurs géographiques indépendants pour le test.

Selon le contexte, une séparation temporelle peut également être nécessaire pour prédire des phénomènes futurs.

### Étape 5 : entraîner le modèle

Le modèle apprend les relations présentes dans les données d'entraînement.

Cette étape consiste notamment à :

- Choisir l'algorithme.
- Définir ses hyperparamètres.
- Entraîner le modèle.
- Comparer plusieurs approches.
- Contrôler le surapprentissage.

### Étape 6 : évaluer les performances

Les métriques dépendent du problème.

| Type de problème | Métriques pertinentes |
| --- | --- |
| Classification | Accuracy, précision, rappel, F1-score, matrice de confusion |
| Régression | MAE, RMSE, R² |
| Clustering | Silhouette, stabilité des groupes, interprétabilité métier |
| Détection d'anomalies | Précision, rappel et taux de faux positifs lorsque des références existent |
| Segmentation d'images | IoU, Dice, précision et rappel par classe |

Une métrique globale peut masquer de mauvaises performances sur certaines classes ou certaines zones géographiques. Il est donc important d'examiner les résultats par classe et par secteur.

### Étape 7 : produire et contrôler les résultats géographiques

Une fois les prédictions calculées, elles peuvent être intégrées dans un SIG.

Exemples :

- Création d'une nouvelle colonne attributaire.
- Production d'un raster classifié.
- Création d'une couche de probabilités.
- Cartographie des erreurs.
- Export des résultats dans un GeoPackage.
- Publication des résultats via PostGIS et GeoServer.

Les résultats doivent être contrôlés avant leur utilisation opérationnelle.

### Étape 8 : déployer et surveiller le modèle

Pour un usage régulier, il faut également prévoir :

- La version des données et du modèle.
- La reproductibilité des traitements.
- Le suivi des performances.
- La détection des changements de distribution des données.
- La réévaluation du modèle lorsque les conditions géographiques évoluent.

Un modèle entraîné sur une région, une saison ou une période donnée n'est pas automatiquement valable ailleurs.

---

## 9. Évaluation des modèles : les métriques essentielles

### 9.1. Classification

**Accuracy**

Proportion de prédictions correctes parmi toutes les observations.

Elle peut être trompeuse lorsque les classes sont déséquilibrées.

**Précision**

Parmi les observations prédites positives, proportion de véritables positifs.

**Rappel**

Parmi les véritables observations positives, proportion correctement détectée.

**F1-score**

Moyenne harmonique de la précision et du rappel.

**Exemple métier**

Pour détecter des bâtiments susceptibles d'être mal classés dans un référentiel, il peut être nécessaire de privilégier le rappel si l'objectif est de limiter les erreurs manquées. À l'inverse, si chaque contrôle de terrain est coûteux, la précision peut être particulièrement importante.

### 9.2. Régression

**MAE : Mean Absolute Error**

Mesure l'erreur absolue moyenne. Elle s'exprime dans l'unité de la variable prédite.

**RMSE : Root Mean Squared Error**

Pénalise davantage les grandes erreurs que la MAE.

**R²**

Mesure la proportion de variabilité expliquée par le modèle dans le cadre de son évaluation. Il ne représente pas, à lui seul, une garantie de qualité prédictive.

### 9.3. Clustering

Les métriques numériques peuvent aider à comparer les regroupements, mais elles ne suffisent pas.

Il faut également vérifier :

- La stabilité des groupes.
- Leur interprétabilité métier.
- Leur cohérence avec les objectifs de l'analyse.
- Leur pertinence géographique.
- Leur sensibilité aux variables sélectionnées.

Un clustering mathématiquement satisfaisant n'est pas nécessairement une bonne typologie territoriale.

---

## 10. Les spécificités du Machine Learning géospatial

Le Machine Learning appliqué à la géomatique présente plusieurs particularités.

### 10.1. Autocorrélation spatiale

Les observations géographiquement proches ont souvent des caractéristiques similaires.

Cette dépendance spatiale peut rendre les jeux d'entraînement et de test trop semblables lorsque leur séparation est mal conçue.

**Bonne pratique :** utiliser une validation spatiale lorsque l'objectif consiste à prédire sur de nouvelles zones.

### 10.2. Choix du système de coordonnées

Les distances, les surfaces et les relations géométriques dépendent du système de coordonnées utilisé.

**Bonne pratique :** utiliser une projection adaptée à la zone d'étude pour les calculs métriques, en tenant compte de la précision recherchée.

### 10.3. Hétérogénéité géographique

Un modèle peut fonctionner correctement dans une zone urbaine dense et beaucoup moins bien dans une zone rurale.

Les différences de morphologie urbaine, de climat, de saison ou de capteur peuvent modifier les relations apprises.

**Bonne pratique :** évaluer les performances sur plusieurs secteurs et examiner les erreurs cartographiées.

### 10.4. Changement temporel

Les données géographiques évoluent :

- De nouveaux bâtiments apparaissent.
- Les usages des sols changent.
- Les réseaux de transport se développent.
- Les conditions environnementales évoluent.

Un modèle peut devenir moins performant si les données récentes diffèrent de celles utilisées lors de l'entraînement.

**Bonne pratique :** prévoir une actualisation et une réévaluation régulières.

### 10.5. Qualité des données de référence

Un modèle supervisé apprend à partir des étiquettes disponibles. Si les classes de référence sont erronées, ambiguës ou incomplètes, les prédictions risquent de reproduire ces défauts.

**Bonne pratique :** contrôler les échantillons de référence et documenter les règles utilisées pour construire les classes.

---

## 11. Les outils à connaître en tant qu'ingénieur géomaticien

| Outil | Utilisation |
| --- | --- |
| **Python** | Langage central pour automatiser les traitements et développer les modèles |
| **scikit-learn** | Classification, régression, clustering et détection d'anomalies |
| **GeoPandas** | Manipulation de données vectorielles géographiques |
| **Rasterio** | Lecture et traitement des images raster |
| **QGIS** | Exploration, préparation et contrôle visuel des données |
| **PostGIS** | Stockage et traitement des données spatiales en base PostgreSQL |
| **XGBoost** | Modélisation prédictive sur des données tabulaires |
| **PyTorch** | Entraînement de modèles d'apprentissage profond |
| **Jupyter** | Exploration des données et expérimentation |
| **MLflow** | Suivi des expériences et gestion du cycle de vie des modèles |

Une architecture de travail courante peut combiner PostGIS pour le stockage, Python pour les traitements, scikit-learn pour le Machine Learning et QGIS pour la validation cartographique.

---

## 12. Les erreurs fréquentes à éviter

- **Choisir un algorithme avant de définir le problème métier.** Il faut d'abord déterminer si l'on cherche à prédire une valeur, classer une observation ou découvrir des groupes.
- **Utiliser une séparation aléatoire sans tenir compte de l'espace.** Cela peut conduire à surestimer les performances sur de nouvelles zones.
- **Confondre corrélation et causalité.** Une variable importante pour le modèle n'est pas nécessairement la cause du phénomène étudié.
- **Négliger la qualité des étiquettes.** Des données de référence incorrectes limitent les performances atteignables.
- **Comparer des modèles avec des métriques inadaptées.** L'accuracy n'est pas toujours suffisante pour une classification déséquilibrée.
- **Ignorer le déséquilibre des classes.** Les catégories rares peuvent être mal détectées même si la performance globale semble bonne.
- **Confondre clustering et zonage spatial.** Des groupes de caractéristiques similaires ne constituent pas automatiquement des zones géographiques contiguës.
- **Interpréter toutes les anomalies comme des erreurs.** Une observation rare peut correspondre à un phénomène réel.
- **Utiliser un modèle hors de son domaine de validité.** Les performances doivent être contrôlées lorsque l'on change de territoire, de période ou de source de données.
- **Oublier la traçabilité.** Les données, paramètres, versions des bibliothèques et résultats doivent être documentés.

---

## 13. Parcours d'apprentissage recommandé

Pour un ingénieur géomaticien souhaitant développer ses compétences en Machine Learning, un parcours progressif est préférable.

### Niveau 1 : fondamentaux

À maîtriser :

- Python, pandas et NumPy.
- Préparation des données.
- Statistiques descriptives.
- Séparation entraînement/test.
- Classification et régression.
- Métriques d'évaluation.

**Objectif pratique :** entraîner un premier Random Forest à partir d'une table de données géographiques.

### Niveau 2 : Machine Learning appliqué aux SIG

À maîtriser :

- GeoPandas et Rasterio.
- Construction de variables spatiales.
- Random Forest, SVM et XGBoost.
- K-Means et DBSCAN.
- Validation spatiale.
- Export des prédictions vers un SIG.

**Objectif pratique :** produire une carte d'occupation du sol ou une typologie de quartiers.

### Niveau 3 : télédétection et apprentissage profond

À approfondir :

- Traitement des images satellites.
- Calcul des indices spectraux.
- Préparation de données d'entraînement.
- Réseaux convolutifs.
- Segmentation sémantique avec U-Net.
- Évaluation cartographique des erreurs.

**Objectif pratique :** extraire automatiquement des bâtiments ou des surfaces végétalisées à partir d'orthophotographies.

### Niveau 4 : industrialisation

À approfondir :

- Pipelines reproductibles.
- Gestion des versions de données et de modèles.
- Automatisation des traitements.
- Déploiement de modèles.
- Surveillance des performances.
- Intégration avec PostGIS et les infrastructures SIG existantes.

**Objectif pratique :** construire une chaîne de traitement permettant de produire, actualiser et diffuser des prédictions géographiques.

---

## 14. Mots-clés essentiels

| Terme | Définition |
| --- | --- |
| `Dataset` | Ensemble de données utilisé pour l'analyse ou l'apprentissage |
| `Feature` | Variable explicative utilisée par un modèle |
| `Target` | Variable que le modèle cherche à prédire |
| `Training set` | Données utilisées pour entraîner le modèle |
| `Test set` | Données réservées à l'évaluation finale |
| `Validation set` | Données utilisées pour comparer les configurations pendant le développement |
| `Classification` | Attribution d'une classe à une observation |
| `Regression` | Prédiction d'une valeur numérique |
| `Clustering` | Regroupement d'observations similaires |
| `Feature engineering` | Création et transformation des variables explicatives |
| `Overfitting` | Surapprentissage : le modèle s'adapte excessivement aux données d'entraînement |
| `Hyperparameter` | Paramètre de configuration défini avant ou pendant le processus de sélection du modèle |
| `Cross-validation` | Procédure de comparaison et d'évaluation de plusieurs ajustements du modèle |
| `Spatial cross-validation` | Validation conçue pour limiter la dépendance entre les zones d'entraînement et d'évaluation |
| `Data leakage` | Fuite d'information entre les données utilisées pour apprendre et celles servant à évaluer le modèle |
| `Pipeline` | Enchaînement reproductible de transformations et d'étapes de modélisation |
| `Prediction raster` | Raster contenant les prédictions du modèle |
| `Model drift` | Dégradation possible des performances lorsque les données ou les relations évoluent |

---

## À retenir

Le Machine Learning offre aux ingénieurs géomaticiens de nombreuses possibilités pour automatiser les analyses spatiales, exploiter les données de télédétection et construire des outils d'aide à la décision territoriale.

Les principaux réflexes à retenir sont les suivants :

- **Random Forest** : un excellent point de départ pour la classification et la régression sur des données tabulaires géographiques.
- **SVM** : une méthode intéressante pour classifier des données spectrales ou des jeux de taille modérée.
- **XGBoost** : une solution performante à tester pour les problèmes tabulaires complexes.
- **K-Means** : une méthode simple pour construire des typologies territoriales.
- **DBSCAN** : un outil pertinent pour explorer les concentrations spatiales de points.
- **Isolation Forest** : une méthode utile pour repérer des observations atypiques.
- **U-Net et les CNN** : des approches à considérer pour la segmentation d'images aériennes ou satellitaires.

Enfin, la qualité d'un projet géospatial ne dépend pas uniquement de l'algorithme choisi. Elle repose aussi sur la qualité des données, la pertinence des variables explicatives, la validation spatiale et la capacité à interpréter les résultats dans leur contexte métier.