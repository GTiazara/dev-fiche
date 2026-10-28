---
title: Machine Learning — Algorithmes, choix techniques et applications
description: Guide technique des principaux algorithmes de Machine Learning, de leurs fondements, de leurs performances et de leurs applications professionnelles.
technology: ml
difficulty: avance
tags: [machine-learning, intelligence-artificielle, python, scikit-learn, classification, regression, clustering, deep-learning, model-evaluation, data-science]
publishedAt: 2026-10-28
updatedAt: 2026-10-28
draft: false
quiz:
  - question: Pourquoi utiliser une validation croisée lors du développement d'un modèle de Machine Learning ?
    choices:
      - Pour supprimer automatiquement les valeurs manquantes
      - Pour estimer la capacité de généralisation du modèle et comparer ses configurations
      - Pour garantir que le modèle ne fera aucune erreur en production
    answer: 1
    explanation: La validation croisée permet d'évaluer plusieurs ajustements du modèle sur différents découpages des données. Elle facilite la comparaison des modèles, mais ne garantit pas leurs performances futures.
  - question: Quel algorithme constitue souvent une référence performante pour les données tabulaires complexes ?
    choices:
      - K-Means
      - XGBoost
      - PCA
    answer: 1
    explanation: XGBoost implémente un gradient boosting optimisé sur arbres de décision et fournit souvent d'excellentes performances sur les données tabulaires.
  - question: Quel risque présente une fuite de données (data leakage) ?
    choices:
      - Augmenter systématiquement le temps d'entraînement
      - Surestimer les performances en utilisant indirectement des informations indisponibles au moment de la prédiction
      - Réduire automatiquement le nombre de variables
    answer: 1
    explanation: Une fuite de données introduit dans l'apprentissage des informations qui ne devraient pas être disponibles, ce qui peut produire une évaluation artificiellement optimiste.

---

## 1. Fondamentaux du Machine Learning

Le **Machine Learning (ML)** consiste à estimer une fonction à partir de données afin de prédire une cible, découvrir des structures ou prendre des décisions.

On cherche généralement à apprendre une fonction :

\[
\hat{y} = f_{\theta}(X)
\]

Avec :

- \(X\) : variables explicatives (*features*).
- \(y\) : variable cible (*target*).
- \(f_{\theta}\) : modèle paramétré.
- \(\hat{y}\) : prédiction.

L'entraînement consiste à ajuster les paramètres du modèle en minimisant une fonction de perte, sous certaines contraintes de régularisation.

### Principales familles

| Famille | Objectif | Exemples |
|---|---|---|
| Apprentissage supervisé | Prédire une cible connue | Régression, classification |
| Apprentissage non supervisé | Découvrir des structures | Clustering, réduction de dimension |
| Détection d'anomalies | Identifier des observations atypiques | Isolation Forest, LOF |
| Deep Learning | Apprendre des représentations complexes | CNN, Transformers |
| Apprentissage par renforcement | Apprendre une stratégie de décision | Q-Learning, PPO |

---

## 2. Algorithmes de régression

La régression vise à prédire une variable numérique.

| Algorithme | Principe | Cas d'utilisation |
|---|---|---|
| Régression linéaire | Modélisation linéaire des variables | Prévision d'indicateurs économiques |
| Ridge / Lasso | Régression avec régularisation | Modèles comportant de nombreuses variables corrélées |
| Random Forest Regressor | Agrégation d'arbres de décision | Estimation de prix ou de consommation |
| Gradient Boosting | Construction séquentielle d'arbres | Prévision de ventes et de demande |
| XGBoost / LightGBM | Boosting optimisé | Prédiction sur données tabulaires |
| SVR | Régression par machines à vecteurs de support | Problèmes non linéaires de taille modérée |

### Points techniques

- **Ridge (L2)** : réduit l'amplitude des coefficients et limite le surapprentissage.
- **Lasso (L1)** : peut annuler certains coefficients et réaliser une sélection de variables.
- **Random Forest** : capture les non-linéarités, mais extrapole généralement mal au-delà des valeurs observées.
- **Gradient Boosting** : peut offrir d'excellentes performances, au prix d'un réglage plus poussé.

### Métriques d'évaluation

| Métrique | Interprétation |
|---|---|
| MAE | Erreur absolue moyenne |
| RMSE | Pénalise davantage les erreurs importantes |
| R² | Mesure la qualité d'ajustement par rapport à une référence constante |
| MAPE | Erreur relative en pourcentage, problématique lorsque les valeurs réelles sont nulles ou proches de zéro |

**Exemple métier :** prévoir la demande énergétique d'un bâtiment à partir de la température extérieure, de l'heure, du jour de la semaine et des historiques de consommation.

---

## 3. Algorithmes de classification

La classification consiste à prédire une classe ou la probabilité d'appartenance à une classe.

| Algorithme | Particularités | Cas d'utilisation |
|---|---|---|
| Régression logistique | Modèle probabiliste interprétable | Risque de résiliation |
| Decision Tree | Règles de décision explicites | Aide à la décision |
| Random Forest | Ensemble d'arbres robuste | Détection de fraude |
| SVM | Maximisation de la marge | Classification de données complexes |
| XGBoost / LightGBM | Boosting performant | Scoring client, détection de défaut |
| Naive Bayes | Hypothèse d'indépendance conditionnelle | Classification de textes |
| k-NN | Décision fondée sur les voisins | Classification de référence |

### Points techniques

- Le déséquilibre des classes peut rendre l'accuracy trompeuse.
- Le seuil de décision doit être adapté au coût des faux positifs et des faux négatifs.
- Une probabilité prédite n'est pas nécessairement bien calibrée.
- La validation doit reproduire autant que possible les conditions réelles d'utilisation.

### Métriques essentielles

| Métrique | Utilité |
|---|---|
| Precision | Limiter les faux positifs |
| Recall | Limiter les faux négatifs |
| F1-score | Équilibrer précision et rappel |
| ROC-AUC | Évaluer la capacité de classement sur différents seuils |
| PR-AUC | Évaluer le compromis précision-rappel, notamment en présence de classes rares |
| Log loss | Évaluer la qualité des probabilités prédites |

**Exemple métier :** détecter les transactions frauduleuses en privilégiant un compromis adapté entre fraude manquée et alerte injustifiée.

---

## 4. Algorithmes de clustering et d'apprentissage non supervisé

Ces méthodes recherchent des structures dans les données sans utiliser de cible prédéfinie.

| Algorithme | Principe | Cas d'utilisation |
|---|---|---|
| K-Means | Minimisation de la dispersion intra-cluster | Segmentation client |
| Clustering hiérarchique | Construction d'une hiérarchie de groupes | Typologies |
| DBSCAN | Regroupement par densité | Détection de concentrations |
| HDBSCAN | Clustering par densité à différentes échelles | Groupes de densités variables |
| Gaussian Mixture Models | Mélange de distributions probabilistes | Segmentation probabiliste |
| Spectral Clustering | Regroupement à partir d'une représentation en graphe | Structures complexes |

### Points techniques

- La normalisation des variables influence fortement les méthodes fondées sur la distance.
- K-Means nécessite de définir le nombre de clusters.
- DBSCAN dépend du choix de `eps` et `min_samples`.
- La silhouette mesure une certaine séparation des groupes, mais ne garantit pas leur pertinence métier.

**Exemple métier :** segmenter des clients selon leur fréquence d'achat, leur panier moyen et leur ancienneté afin d'adapter les stratégies commerciales.

---

## 5. Réduction de dimension et sélection de variables

Ces méthodes permettent de simplifier les données, de réduire la redondance et de faciliter leur exploration.

| Méthode | Objectif | Utilisation |
|---|---|---|
| PCA | Maximiser la variance expliquée par des composantes orthogonales | Compression et exploration |
| UMAP | Préserver des structures locales dans une représentation de faible dimension | Visualisation |
| t-SNE | Préserver principalement des voisinages locaux | Exploration visuelle |
| Lasso | Réduire certains coefficients à zéro | Sélection de variables |
| Importance par permutation | Évaluer la dégradation des performances après perturbation d'une variable | Interprétation des modèles |

**Attention :** une projection en deux dimensions peut déformer les distances et les structures. Elle ne doit pas être considérée comme une preuve de séparabilité réelle des données.

---

## 6. Détection d'anomalies

| Algorithme | Principe | Cas d'utilisation |
|---|---|---|
| Isolation Forest | Isolation aléatoire des observations | Transactions inhabituelles |
| Local Outlier Factor | Comparaison des densités locales | Détection d'observations atypiques |
| One-Class SVM | Apprentissage d'une région contenant les observations normales | Contrôle qualité |
| Autoencoders | Détection possible via l'erreur de reconstruction | Anomalies dans des données complexes |

Le choix dépend de la disponibilité de données anormales étiquetées, de la structure des données et du coût des fausses alertes.

**Exemple métier :** détecter des anomalies dans les mesures d'un réseau industriel à partir de capteurs de température, de pression et de débit.

---

## 7. Deep Learning

Le Deep Learning repose sur des réseaux de neurones comportant plusieurs couches de transformation.

| Architecture | Domaine | Applications |
|---|---|---|
| MLP | Données tabulaires ou vecteurs de caractéristiques | Prédiction numérique |
| CNN | Images et données spatiales structurées | Classification et segmentation d'images |
| RNN / LSTM | Séquences | Analyse de séries temporelles |
| Transformers | Texte, séquences et autres modalités | Traduction, assistants, analyse documentaire |
| Autoencoders | Représentation et reconstruction | Compression et détection d'anomalies |
| Graph Neural Networks | Graphes et réseaux | Analyse de réseaux sociaux ou de transport |

### Points techniques

- La disponibilité de données représentatives est déterminante.
- Les modèles peuvent nécessiter des ressources de calcul importantes.
- La régularisation, l'augmentation de données et l'arrêt anticipé peuvent limiter le surapprentissage.
- Le choix de l'architecture doit correspondre à la structure des données.

**Exemple métier :** analyser automatiquement des documents, extraire des informations de factures ou segmenter des objets dans des images industrielles.

---

## 8. Workflow d'un projet de Machine Learning

Un projet robuste suit généralement les étapes suivantes :

1. **Cadrage métier** : définir la cible, les contraintes et le coût des erreurs.
2. **Exploration des données** : contrôler les distributions, les valeurs manquantes, les biais et les fuites potentielles.
3. **Prétraitement** : imputation, encodage, normalisation si nécessaire.
4. **Séparation des données** : constituer des jeux d'entraînement, de validation et de test.
5. **Baseline** : construire un modèle de référence simple.
6. **Entraînement** : comparer plusieurs algorithmes.
7. **Optimisation** : ajuster les hyperparamètres par validation croisée.
8. **Évaluation finale** : mesurer les performances sur un jeu de test indépendant.
9. **Déploiement** : exposer le modèle dans une application ou un pipeline.
10. **Monitoring** : suivre les performances, les dérives et les coûts en production.

### Exemple de pipeline scikit-learn

```python
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier

numeric_features = ["age", "income"]
categorical_features = ["region", "contract_type"]

numeric_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler())
])

categorical_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("encoder", OneHotEncoder(handle_unknown="ignore"))
])

preprocessor = ColumnTransformer([
    ("numeric", numeric_pipeline, numeric_features),
    ("categorical", categorical_pipeline, categorical_features)
])

model = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        class_weight="balanced"
    ))
])

model.fit(X_train, y_train)
predictions = model.predict(X_test)
```

Le pipeline regroupe le prétraitement et l'entraînement afin de faciliter la reproductibilité et de limiter les fuites de données. Les jeux de validation et de test doivent rester indépendants des étapes d'ajustement du modèle.

---

## 9. Choisir une architecture adaptée

| Situation | Approche recommandée |
|---|---|
| Données tabulaires et besoin d'interprétabilité | Régression logistique ou modèle linéaire régularisé |
| Données tabulaires et performance prédictive | Random Forest, XGBoost ou LightGBM |
| Données non étiquetées | K-Means, clustering hiérarchique ou HDBSCAN |
| Images | CNN ou architectures de vision modernes |
| Texte | Transformers préentraînés |
| Séries temporelles | Modèles statistiques, boosting avec variables temporelles ou réseaux adaptés |
| Données sous forme de réseau | Algorithmes de graphes et Graph Neural Networks |

Ces recommandations constituent des points de départ, pas des règles absolues. Une baseline simple doit être comparée aux approches plus complexes sur un protocole d'évaluation cohérent.

---

## 10. Bibliothèques et outils essentiels

| Outil | Usage |
|---|---|
| `NumPy` / `pandas` | Calcul et manipulation des données |
| `scikit-learn` | ML classique et pipelines |
| `XGBoost` / `LightGBM` | Gradient boosting |
| `PyTorch` | Deep Learning |
| `TensorFlow / Keras` | Réseaux de neurones |
| `Optuna` | Optimisation des hyperparamètres |
| `MLflow` | Suivi des expériences et des modèles |
| `SHAP` | Interprétation des prédictions |
| `DVC` | Versionnement des données et des artefacts |
| `FastAPI` | Exposition d'un modèle via une API |

---

## 11. Pièges techniques à éviter

- **Data leakage** : utiliser indirectement des informations indisponibles au moment de la prédiction.
- **Surapprentissage** : obtenir d'excellents résultats à l'entraînement, mais de mauvaises performances sur de nouvelles données.
- **Mauvais découpage des données** : ignorer les dépendances temporelles, spatiales ou individuelles.
- **Métrique inadaptée** : privilégier l'accuracy malgré un fort déséquilibre des classes.
- **Optimisation excessive** : sélectionner les modèles en réutilisant le jeu de test.
- **Mauvaise calibration** : interpréter les probabilités prédites comme des probabilités fiables sans vérification.
- **Dérive des données** : ne pas surveiller l'évolution des données en production.
- **Interprétation abusive** : confondre importance prédictive et causalité.

---

## À retenir

Le choix d'un algorithme de Machine Learning repose sur cinq critères principaux :

1. **Nature du problème** : classification, régression, clustering ou détection d'anomalies.
2. **Structure des données** : données tabulaires, images, texte, séries temporelles ou graphes.
3. **Qualité des données** : volume, représentativité, bruit et disponibilité des étiquettes.
4. **Contraintes opérationnelles** : latence, ressources, explicabilité et maintenance.
5. **Protocole d'évaluation** : métriques pertinentes et test représentatif des conditions réelles.

Pour un projet professionnel, une démarche efficace consiste à établir une baseline, comparer plusieurs modèles adaptés, valider rigoureusement les résultats puis industrialiser uniquement la solution dont les performances et les contraintes opérationnelles sont satisfaisantes.