---
title: Les métriques d'évaluation des modèles d'intelligence artificielle
description: "Comprendre Accuracy, précision, rappel, F1-Score, IoU et matrice de confusion, avec l'exemple d'un album photo, d'un filtre anti-spam et du détourage d'un chat."
technology: ia
difficulty: debutant
tags: [ia, intelligence-artificielle, machine-learning, deep-learning, metriques, evaluation, precision, recall, f1-score, iou, segmentation-semantique, matrice-de-confusion]
publishedAt: 2026-11-02
updatedAt: 2026-11-02
draft: false
quiz:
  - question: Quelle métrique mesure la proportion de prédictions positives qui sont réellement positives ?
    choices:
      - Accuracy
      - Précision (Precision)
      - Rappel (Recall)
    answer: 1
    explanation: La précision mesure la proportion de prédictions positives correctes parmi toutes les prédictions positives. Elle permet notamment de limiter les faux positifs (sur-détection).

  - question: Quelle métrique permet de mesurer la capacité d'un modèle à retrouver les objets réellement présents ?
    choices:
      - Rappel (Recall)
      - Accuracy
      - IoU
    answer: 0
    explanation: Le rappel mesure la proportion d'éléments réellement positifs qui ont été correctement détectés par le modèle. Il permet notamment de limiter les faux négatifs (sous-détection).

  - question: Quelle formule permet de calculer le F1-Score ?
    choices:
      - (VP + VN) / (VP + VN + FP + FN)
      - VP / (VP + FP)
      - 2 × (Précision × Rappel) / (Précision + Rappel)
    answer: 2
    explanation: Le F1-Score correspond à la moyenne harmonique de la précision et du rappel. Il permet d'obtenir une mesure synthétique de ces deux métriques.

  - question: Dans une matrice de confusion, que représente un faux positif (FP) ?
    choices:
      - Un objet réellement présent mais non détecté
      - Un objet absent mais considéré comme présent par le modèle
      - Un objet correctement identifié comme absent
    answer: 1
    explanation: Un faux positif correspond à une prédiction positive alors que la réalité est négative. Dans le cas de la détection de chats, cela signifie que le modèle détecte un chat là où il n'y en a pas.

  - question: Pourquoi l'Accuracy peut-elle être insuffisante pour évaluer un modèle IA ?
    choices:
      - Elle ne prend en compte que les faux positifs
      - Elle ne mesure que les objets détectés
      - Elle donne une vision globale sans se concentrer sur les performances d'une classe cible
    answer: 2
    explanation: L'Accuracy mesure le taux global de prédictions correctes. Elle peut masquer de mauvaises performances sur une classe d'intérêt, notamment lorsque les classes sont déséquilibrées.
---

## Définition

L'évaluation d'un modèle d'intelligence artificielle consiste à mesurer sa capacité à produire des prédictions conformes à une réalité de référence, appelée **vérité terrain (Ground Truth)**.

Les **métriques d'évaluation** sont des indicateurs mathématiques permettant de quantifier les performances d'un modèle et d'identifier ses erreurs.

Elles permettent notamment de répondre aux questions suivantes :
- Le modèle identifie-t-il correctement les objets recherchés ?
- Détecte-t-il des objets qui n'existent pas réellement ?
- Passe-t-il à côté d'objets pourtant présents ?
- Les prédictions correspondent-elles spatialement aux annotations de référence ?

Dans le domaine de la vision par ordinateur et de la segmentation sémantique, ces métriques sont particulièrement importantes pour évaluer la qualité des classifications produites par un modèle IA.

## Les principales métriques d'évaluation

Les métriques abordées dans cette fiche sont :

- **Accuracy (Exactitude)** : taux global de prédictions correctes.
- **Précision (Precision)** : fiabilité des prédictions positives.
- **Rappel (Recall)** : capacité à retrouver les éléments réellement présents.
- **F1-Score** : équilibre entre précision et rappel.
- **IoU (Intersection over Union)** : mesure du recouvrement entre une prédiction et la réalité.
- **Matrice de confusion** : tableau permettant d'analyser les erreurs de classification.

## Comprendre les erreurs de classification

Avant de calculer les métriques, il est indispensable de comprendre les quatre catégories de résultats possibles.

Prenons l'exemple d'un modèle IA chargé de détecter la présence d'un chat sur des images.

On compare les résultats du modèle à la réalité terrain.

| Terme | Signification | Exemple |
| --- | --- | --- |
| **VP (Vrai positif)** | L'objet est présent et le modèle le détecte correctement. | Le chat est présent et détecté. |
| **FP (Faux positif)** | L'objet est absent mais le modèle le détecte. | Le modèle détecte un chat alors qu'il n'y en a pas. |
| **VN (Vrai négatif)** | L'objet est absent et le modèle identifie correctement son absence. | Le chat est absent et le modèle indique son absence. |
| **FN (Faux négatif)** | L'objet est présent mais le modèle ne le détecte pas. | Le chat est présent mais le modèle ne le détecte pas. |

Ces quatre valeurs constituent la base du calcul des principales métriques d'évaluation.

## La matrice de confusion

La **matrice de confusion** est un tableau permettant de comparer les prédictions du modèle avec les observations réelles.

Elle permet de visualiser rapidement les bonnes prédictions et les erreurs de classification.

Prenons un exemple avec 7 observations :

| Réalité / Prédiction | Chat | Non chat | Total |
| --- | ---: | ---: | ---: |
| **Chat** | 2 (VP) | 1 (FN) | 3 |
| **Non chat** | 2 (FP) | 2 (VN) | 4 |
| **Total** | 4 | 3 | 7 |

Dans cet exemple :
- 2 chats sont correctement détectés.
- 2 images sans chat sont classées à tort comme contenant un chat.
- 2 images sans chat sont correctement identifiées.
- 1 chat n'est pas détecté.

On obtient donc :
- VP = 2
- FP = 2
- VN = 2
- FN = 1

Ces valeurs seront utilisées pour calculer les métriques suivantes.

## Les métriques fondamentales

### 1. Accuracy / Exactitude / Justesse

L'Accuracy mesure le taux global de correspondance entre les prédictions du modèle et la réalité.

Elle répond à la question :

**Quelle proportion de l'ensemble des prédictions est correcte ?**

Formule :

```python
Accuracy = (VP + VN) / (VP + VN + FP + FN)
```

Avec notre exemple :

```python
Accuracy = (2 + 2) / (2 + 2 + 2 + 1)
Accuracy = 4 / 7
Accuracy = 0.57
Accuracy = 57 %
```

Le modèle obtient donc une exactitude de 57 %.

**Limite :**

L'Accuracy donne une vision globale des performances. Elle ne se concentre pas spécifiquement sur la classe cible.

Un modèle peut obtenir une Accuracy élevée tout en étant peu performant sur une classe particulière, notamment lorsque les classes sont déséquilibrées.

### 2. Précision (Precision)

La précision mesure la fiabilité des détections positives.

Elle répond à la question :

**Parmi toutes les détections positives effectuées par le modèle, quelle proportion est réellement correcte ?**

Formule :

```python
Precision = VP / (VP + FP)
```

Avec notre exemple :

```python
Precision = 2 / (2 + 2)
Precision = 0.5
Precision = 50 %
```

La précision est donc de 50 %.

Cela signifie que seulement 50 % des détections de chat effectuées par le modèle correspondent réellement à la présence d'un chat.

**Interprétation :**

Une précision élevée signifie que le modèle produit peu de faux positifs.

Elle est particulièrement utile lorsque le coût des fausses détections est important.

Exemple : dans un tri automatique de photos, une précision faible remplit l'album « chats » avec des images où aucun chat n'apparaît.

### 3. Rappel (Recall)

Le rappel mesure la capacité du modèle à retrouver les éléments réellement présents dans les données de référence.

Il répond à la question :

**Parmi tous les objets réellement présents, quelle proportion a été correctement détectée par le modèle ?**

Formule :

```python
Recall = VP / (VP + FN)
```

Avec notre exemple :

```python
Recall = 2 / (2 + 1)
Recall = 0.66
Recall = 66 %
```

Le rappel est donc d'environ 66 %.

Cela signifie que le modèle détecte environ deux tiers des chats réellement présents.

**Interprétation :**

Un rappel élevé signifie que le modèle produit peu de faux négatifs.

Il est particulièrement utile lorsque le coût des objets non détectés est important.

Exemple : dans le même tri de photos, un rappel faible laisse de nombreuses photos de chats hors de l'album.

### 4. F1-Score

Le F1-Score est une métrique intermédiaire correspondant à la moyenne harmonique entre la précision et le rappel.

Il permet d'obtenir une mesure synthétique de ces deux indicateurs.

Formule :

```python
F1-Score = 2 × (Precision × Recall) / (Precision + Recall)
```

Avec notre exemple :

```python
Precision = 0.50
Recall = 0.66

F1-Score = 2 × (0.50 × 0.66) / (0.50 + 0.66)

F1-Score ≈ 0.57

F1-Score ≈ 57 %
```

**Interprétation :**

Le F1-Score permet de prendre en compte simultanément :
- Les faux positifs, à travers la précision.
- Les faux négatifs, à travers le rappel.

Un F1-Score élevé indique un bon équilibre entre la fiabilité des détections et la capacité à retrouver les objets réellement présents.

Il est particulièrement intéressant lorsque l'on souhaite éviter aussi bien la sur-détection que la sous-détection.

### 5. IoU (Intersection over Union)

L'IoU est une métrique particulièrement utilisée en vision par ordinateur, notamment pour la segmentation sémantique et la détection d'objets.

Elle mesure le degré de recouvrement spatial entre une prédiction et une annotation de référence.

Elle répond à la question :

**Quelle proportion de la surface totale occupée par la prédiction et la réalité correspond à leur intersection ?**

Formule :

```python
IoU = Surface_intersection / Surface_union
```

Dans le cas d'une segmentation :

```python
IoU = VP / (VP + FP + FN)
```

Interprétation :
- IoU = 1 : correspondance parfaite entre prédiction et réalité.
- IoU = 0 : aucun recouvrement entre prédiction et réalité.
- IoU proche de 1 : très bon recouvrement spatial.
- IoU proche de 0 : faible correspondance spatiale.

Avec notre exemple :

```python
IoU = 2 / (2 + 2 + 1)

IoU = 0.40

IoU = 40 %
```

**Attention :**

L'IoU dépend du niveau d'analyse choisi.

En segmentation sémantique, il peut être calculé au niveau du pixel, tandis que dans d'autres applications, il peut être calculé au niveau de l'objet ou de la géométrie.

## Comparatif des métriques

Chaque métrique possède ses propres avantages et limites. Il est donc important de choisir les indicateurs adaptés à l'objectif de l'étude.

| Métrique | Ce qu'elle mesure | Erreur principalement surveillée | Limite |
| --- | --- | --- | --- |
| **Accuracy** | Taux global de prédictions correctes | Ensemble des erreurs | Ne se concentre pas sur la classe cible. |
| **Précision** | Fiabilité des prédictions positives | Faux positifs (FP) | Ignore les objets réellement présents mais non détectés. |
| **Rappel** | Capacité à détecter les objets présents | Faux négatifs (FN) | Ignore les détections positives incorrectes. |
| **F1-Score** | Équilibre entre précision et rappel | FP et FN | Ne prend pas directement en compte les vrais négatifs. |
| **IoU** | Recouvrement spatial entre prédiction et référence | FP et FN | Nécessite de définir le niveau spatial de comparaison. |

**À retenir :**

Les métriques ne doivent pas être interprétées individuellement. Leur combinaison permet de mieux comprendre le comportement d'un modèle.

## Trois usages du quotidien

Les mêmes quatre cases servent dès qu'un modèle répond oui ou non.

| Usage | Question du modèle | Faux positif | Faux négatif |
| --- | --- | --- | --- |
| Album photo | Cette photo contient-elle un chat ? | Un coussin est classé comme un chat | Une photo de chat reste hors de l'album |
| Boîte mail | Ce message est-il un spam ? | Un mail d'un proche part dans les indésirables | Une arnaque reste dans la boîte de réception |
| Sonnette | Y a-t-il une personne devant la porte ? | Un chat qui passe déclenche l'alerte | Un livreur n'est pas signalé |

Le coût n'est pas le même. Rater une arnaque ou un livreur pèse plus que rater une photo de chat. On choisit alors la métrique selon ce que l'on veut éviter, pas selon le score le plus flatteur.

## Détourer une photo

Une application qui découpe le chat pour en faire un sticker ne se contente pas de dire « il y a un chat ». Elle attribue une classe à chaque pixel : chat, personne, canapé ou sol.

On compare cette image peinte par le modèle à une image peinte à la main, la vérité terrain.

| Niveau | Principe | Ce que l'on juge |
| --- | --- | --- |
| Pixel | Chaque pixel est-il de la bonne classe ? | Le contour est-il juste ? |
| Objet | L'objet entier est-il retrouvé ? | Le chat est-il trouvé, même si une oreille dépasse ? |

Le modèle peut trouver le chat et rater le contour : l'oreille est coupée, ou un bout de canapé reste dans le sticker. L'IoU mesure ce recouvrement. Un score d'objet élevé avec un IoU faible veut dire : « le chat est reconnu, mais le détourage est mauvais ».

## Constituer un jeu de photos fiable

Les métriques ne valent que si les bonnes réponses sont connues et assez nombreuses.

Pour l'album, on annote à la main un échantillon : chat présent ou absent, et, pour le détourage, le contour du chat. On y met des cas faciles et des cas pièges : chat de dos, chat dans l'ombre, coussin rayé, chien qui lui ressemble.

Une classe presque absente de cet échantillon ne peut pas être jugée. Si l'album ne contient que trois photos de hamster, un score parfait sur le hamster ne dit rien : trois images ne suffisent pas. Les classes fréquentes, ici les chats et les personnes, donnent un chiffre plus stable.

**Point de vigilance :** une métrique ne peut être interprétée correctement sans tenir compte du nombre d'exemples de chaque classe.

## Cas d'usage fréquents

- **Évaluation d'un modèle de classification** : mesurer la capacité d'un modèle à attribuer la bonne classe à des données.
- **Segmentation sémantique d'images** : évaluer la correspondance entre les pixels prédits et les pixels de référence.
- **Détection d'objets** : mesurer la fiabilité des détections et la capacité à retrouver les objets présents.
- **Tri de photos, courrier indésirable, sonnette** : choisir la métrique selon le coût d'une erreur.
- **Comparaison de modèles IA** : comparer plusieurs architectures à partir d'indicateurs communs.
- **Contrôle qualité des inférences** : identifier les zones de sur-détection, de sous-détection et de confusion entre classes.

## Mots-clés

| Terme | Définition |
| --- | --- |
| `Vérité terrain (Ground Truth)` | Donnée de référence considérée comme représentant la réalité observée. |
| `VP (Vrai positif)` | Prédiction positive correcte. |
| `FP (Faux positif)` | Prédiction positive incorrecte. |
| `VN (Vrai négatif)` | Prédiction négative correcte. |
| `FN (Faux négatif)` | Prédiction négative incorrecte. |
| `Accuracy` | Proportion globale de prédictions correctes. |
| `Precision` | Proportion de prédictions positives qui sont correctes. |
| `Recall` | Proportion des éléments réellement positifs qui sont détectés. |
| `F1-Score` | Moyenne harmonique entre précision et rappel. |
| `IoU` | Rapport entre l'intersection et l'union de deux surfaces. |
| `Segmentation sémantique` | Attribution d'une classe à chaque pixel d'une image. |
| `Inférence` | Application d'un modèle entraîné à de nouvelles données pour produire des prédictions. |
| `Sur-détection` | Identification incorrecte d'objets absents de la réalité. |
| `Sous-détection` | Absence de détection d'objets pourtant présents dans la réalité. |

## Pièges et points de vigilance

- **Déséquilibre des classes** : une classe très représentée peut influencer fortement l'Accuracy globale et masquer les mauvaises performances sur les classes minoritaires.

- **Interprétation isolée des métriques** : une bonne précision ne signifie pas nécessairement que le modèle détecte tous les objets présents. Il faut également examiner le rappel.

- **Sur-détection** : un rappel élevé ne garantit pas une bonne qualité de classification. Un modèle peut détecter tous les objets recherchés tout en produisant de nombreux faux positifs.

- **Sous-détection** : une précision élevée ne garantit pas que tous les objets présents ont été identifiés.

- **Qualité de la vérité terrain** : des annotations incorrectes, imprécises ou obsolètes peuvent fausser l'évaluation du modèle.

- **Classes absentes du jeu de référence** : une classe non représentée dans les données d'évaluation ne peut pas faire l'objet d'une évaluation pertinente.

- **Confusion entre classes** : un modèle peut trouver un animal et le prendre pour un chat alors que c'est un chien.

- **Différence entre évaluation pixel et objet** : trouver le chat ne garantit pas que son contour, oreilles comprises, est juste.

## À retenir

Les métriques d'évaluation permettent de comprendre les performances réelles d'un modèle d'intelligence artificielle.

Il est essentiel de retenir les distinctions suivantes :

- **Accuracy** : quelle proportion de toutes les prédictions est correcte ?
- **Précision** : parmi les détections positives, combien sont correctes ?
- **Rappel** : parmi les objets réellement présents, combien sont détectés ?
- **F1-Score** : quel est l'équilibre entre précision et rappel ?
- **IoU** : quel est le niveau de recouvrement spatial entre la prédiction et la réalité ?
- **Matrice de confusion** : quelles sont les erreurs commises par le modèle ?

**Une bonne évaluation ne repose pas sur une seule métrique.** Il faut sélectionner et croiser plusieurs indicateurs en fonction de la classe étudiée, du niveau d'analyse (pixel ou objet) et des conséquences des erreurs de classification.

L'objectif final n'est pas simplement d'obtenir un score élevé, mais de comprendre dans quelles situations le modèle fonctionne correctement et dans lesquelles il présente des limites.