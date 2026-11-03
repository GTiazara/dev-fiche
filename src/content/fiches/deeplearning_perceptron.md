---
title: "Le perceptron, premier neurone artificiel"
description: "Comprendre le perceptron avec des fleurs : une somme, un seuil, puis une correction seulement quand la réponse est fausse."
technology: deeplearning
difficulty: debutant
tags:
  - perceptron
  - neurone
  - classification
  - iris
  - sklearn
publishedAt: 2026-11-03
updatedAt: 2026-11-03
draft: false
quiz:
  - question: "Que compare le perceptron pour répondre +1 ou −1 ?"
    choices:
      - "Une somme des mesures, chacune multipliée par un poids, à laquelle on ajoute un biais"
      - "La moyenne de toutes les fleurs du tableau"
      - "Le nombre de colonnes du tableau"
    answer: 0
    explanation: "On calcule z. Si z est positif ou nul, la réponse est +1. Sinon, elle est −1."
  - question: "Le perceptron a bien classé une fleur. Que deviennent les poids ?"
    choices:
      - "Ils restent les mêmes"
      - "Ils sont remis à zéro"
      - "Ils sont doublés"
    answer: 0
    explanation: "La correction vaut zéro quand la prédiction est juste. Seule une erreur déplace les poids."
  - question: "Sur setosa contre versicolor, que se passe-t-il après la première époque ?"
    choices:
      - "Plus aucune correction : toutes les fleurs d'entraînement sont bien classées"
      - "Le modèle recommence avec des poids au hasard"
      - "Il faut encore neuf époques pour trouver une droite"
    answer: 0
    explanation: "Sept corrections suffisent. Les époques suivantes affichent zéro correction, et le test est lui aussi parfait."
  - question: "Pourquoi un seul perceptron ne peut-il pas apprendre un XOR ?"
    choices:
      - "Les réponses oui ne sont pas toutes du même côté d'une droite"
      - "Il n'y a que quatre exemples"
      - "Les entrées doivent être des centimètres"
    answer: 0
    explanation: "Les oui occupent une diagonale du carré, les non l'autre. Une droite ne sépare pas ces deux diagonales. Une couche de neurones en plus le peut."
  - question: "Un seul découpage annonce 100 % sur les trois espèces d'Iris. Pourquoi s'en méfier ?"
    choices:
      - "Un autre découpage des mêmes fleurs descend jusqu'à 77 %, et la moyenne vaut 86 %"
      - "100 % signifie que le code a une erreur"
      - "Le perceptron refuse les tableaux de plus de deux colonnes"
    answer: 0
    explanation: "Avec peu de fleurs, le hasard du découpage change le score. La validation croisée fait tourner le test et montre cette variation."
---

## L'idée

Un perceptron répond par oui ou par non. Il regarde quelques mesures, les additionne en donnant plus de poids à certaines, puis compare le total à un seuil.

C'est le neurone artificiel le plus simple. Dans un réseau profond, chaque neurone commence lui aussi par une somme pondérée, puis applique une activation non linéaire. Frank Rosenblatt a décrit le perceptron en 1958.

On le voit ici sur des iris, des fleurs mesurées en centimètres. Le sépale est la partie extérieure qui protège la fleur ; le pétale est la partie généralement colorée. Le tableau compte 150 fleurs, 50 de chaque espèce : setosa, versicolor, virginica. Quatre mesures par fleur, aucune case vide. Comme les trois groupes ont la même taille, un pourcentage de bonnes réponses se lit sans piège.

## Un calcul, avant les mots

Prenons deux mesures : la longueur du sépale et celle du pétale. On demande au neurone de séparer setosa (−1) et versicolor (+1).

On choisit les poids à la main : le sépale ne compte pas, le pétale compte pour 1, et on retire 2,5 au total.

Pour une fleur de pétale 1,9 cm :

`z = 0 × sépale + 1 × 1,9 − 2,5 = −0,6`

`z` est négatif, donc la réponse est −1 : setosa. Pour un pétale de 4,5 cm, `z = 2` : la réponse est +1, versicolor.

Autrement dit, la règle est : « pétale plus long que 2,5 cm → versicolor ». Sur les 70 fleurs gardées pour l'entraînement, cette règle ne se trompe pas. La frontière est une droite horizontale, parce que le sépale n'entre pas dans le calcul.

La même opération s'écrit, quel que soit le nombre de mesures :

`z = w · x + b`

- `x` contient les mesures de la fleur ;
- `w` contient un poids par mesure ;
- `b` est le biais ;
- la prédiction vaut +1 si `z ≥ 0`, sinon −1.

| Mot | Ce que c'est, sur cet exemple |
| --- | --- |
| Entrée | Une mesure, ici 1,9 cm de pétale |
| Poids | L'importance de cette mesure. 0 pour le sépale, 1 pour le pétale |
| Biais | Le nombre qu'on ajoute toujours, ici −2,5. Il place le seuil |
| z | Le total. Le signe de z est la réponse |
| Étiquette | La bonne réponse, −1 ou +1, connue pendant l'entraînement |

Les points où `z = 0` forment la frontière. D'un côté on répond +1, de l'autre −1. Le biais déplace cette droite. Les poids la font tourner.

Dès qu'il y a beaucoup de mesures, on ne devine plus les poids en regardant un dessin. Il faut une règle pour les trouver.

## Il n'apprend que lorsqu'il se trompe

On part de poids nuls et d'un biais nul. Le perceptron prend les fleurs une par une. S'il a raison, il ne change rien. S'il a tort, il pousse les poids pour que cette fleur soit mieux notée la prochaine fois.

Le pas de cette poussée s'appelle le taux d'apprentissage. Ici il vaut 0,1. Comme les réponses valent −1 ou +1, une erreur déplace les poids de `0,2` fois les mesures de la fleur.

Les trois premières fleurs de l'entraînement :

| Fleur | Bonne réponse | z avant correction | Réponse donnée | Suite |
| --- | --- | --- | --- | --- |
| Sépale 5,1, pétale 1,9 | −1, setosa | 0 | +1, faux | On retire 0,2 fois cette fleur |
| Sépale 5,4, pétale 4,5 | +1, versicolor | −7,42 | −1, faux | On ajoute 0,2 fois cette fleur |
| Sépale 6,6, pétale 4,4 | +1, versicolor | 2,68 | +1, juste | Les poids ne bougent pas |

Au départ, `z` vaut 0 et la règle « positif ou nul → +1 » se trompe sur la setosa. Après la correction, les poids valent (−1,02, −0,38) et le biais vaut −0,2. La fleur suivante, une versicolor, est alors mal classée dans l'autre sens, et la correction inverse remonte les poids.

Un tour complet sur les 70 fleurs s'appelle une époque. Ce premier tour fait 7 corrections, aux fleurs numéro 0, 1, 4, 8, 9, 11 et 14. Ensuite, plus aucune erreur. Les poids finaux sont (−0,54, 1,42), le biais vaut −0,2. Le poids du pétale est le plus grand : l'algorithme a retrouvé tout seul que le pétale sépare les deux espèces.

Chaque correction ne regarde qu'une fleur. Elle peut déclasser les autres avant de retomber sur une droite correcte. C'est normal. La règle promet seulement de finir par séparer les deux groupes, s'il existe une droite qui les sépare.

```python
import numpy as np
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split

iris = load_iris()
# Deux espèces, deux mesures : sépale (colonne 0) et pétale (colonne 2).
masque = iris.target < 2
X = iris.data[masque][:, [0, 2]]
y = np.where(iris.target[masque] == 0, -1, 1)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=2, stratify=y
)

w = np.zeros(2)
b = 0.0
corrections = []
for _ in range(10):
    n = 0
    for xi, cible in zip(X_train, y_train):
        prediction = 1 if xi @ w + b >= 0 else -1
        if prediction != cible:
            # 0,1 × (cible − prédiction) vaut +0,2 ou −0,2.
            delta = 0.1 * (cible - prediction)
            w = w + delta * xi
            b = b + delta
            n += 1
    corrections.append(n)

exactitude_test = (np.where(X_test @ w + b >= 0, 1, -1) == y_test).mean()
```

`stratify=y` garde autant de setosa que de versicolor des deux côtés : 35 et 35 à l'entraînement, 15 et 15 au test. Le découpage se fait avant l'apprentissage.

`corrections` vaut `[7, 0, 0, 0, 0, 0, 0, 0, 0, 0]`. Un zéro veut dire que toutes les fleurs d'entraînement sont déjà bien placées. Les époques de plus ne servent plus. L'exactitude vaut 1,00 sur l'entraînement et sur le test. La version de scikit-learn trouve aussi 1,00, avec d'autres poids : plusieurs droites séparent ces deux espèces. Un score parfait dit que ce problème est facile, pas que le perceptron réussit toujours.

## Pour aller plus loin : trois réglages

**Agrandir le pas change-t-il la réponse ?** Si l'on part de zéro, non. Un taux de 0,0001, de 0,1 ou de 1 produit les mêmes 7 corrections puis des zéros, et la même exactitude. Les poids sont simplement dix fois plus grands quand le taux est dix fois plus grand. Le signe de `z` ne change pas, donc la fleur reste du même côté de la droite. Cette tranquillité disparaît dès que la réponse n'est plus un simple oui ou non brutal, comme dans les réseaux des fiches suivantes : un pas trop grand fait alors diverger l'apprentissage.

**L'ordre des fleurs change-t-il la droite ?** Oui. Le perceptron s'arrête à la première droite sans erreur. Il ne cherche pas la meilleure. En mélangeant les fleurs avec trois graines différentes, on obtient trois pentes, 0,51, 0,39 et 0,49, et trois exactitudes de 1,00. Une droite qui frôle un groupe classe mal une fleur nouvelle située juste à côté. Une autre méthode, le SVM linéaire, choisit parmi les droites celle qui passe le plus loin des deux groupes.

**Faut-il mettre les mesures à la même échelle ?** Oui, surtout si leurs unités ou leurs ordres de grandeur diffèrent. On retire la moyenne, puis on divise par l'écart-type, les deux calculés sur l'entraînement seulement. Ici, le nombre de corrections passe de 7 à 3. On applique ensuite la même transformation au test. La calculer sur tout le tableau ferait voir au modèle des fleurs qu'il est censé découvrir plus tard.

## La limite essentielle : le XOR

Le OU exclusif, ou XOR, répond oui si une seule des deux entrées vaut 1.

| Entrée 1 | Entrée 2 | ET | OU | XOR |
| --- | --- | --- | --- | --- |
| 0 | 0 | non | non | non |
| 0 | 1 | non | oui | oui |
| 1 | 0 | non | oui | oui |
| 1 | 1 | oui | oui | non |

ET et OU s'apprennent en quelques époques : une droite isole un coin du carré. XOR place les oui sur une diagonale et les non sur l'autre. Aucune droite ne sépare ces deux diagonales. Après 20 époques, le perceptron se trompe encore sur 2 points sur 4, et les corrections ne s'arrêtent pas.

Ce n'est pas un mauvais réglage : un perceptron seul ne peut représenter cette frontière. Un petit réseau ajoute une couche de neurones entre l'entrée et la sortie. Chaque neurone de cette couche trace sa propre droite, puis le neurone final combine leurs réponses. C'est le principe du perceptron multicouche.

## Pour aller plus loin : des classes qui se mélangent

**Les espèces se mélangent.** Versicolor et virginica se recouvrent sur les pétales. Il reste toujours au moins une fleur du mauvais côté. Le perceptron continue donc de corriger, et chaque correction en aide une en gênant d'autres. Sur 70 fleurs d'entraînement, les erreurs en fin d'époque oscillent entre 5 et 10. Elles ne tombent pas à zéro.

La droite finale dépend alors du moment où l'on arrête. Selon l'époque, l'exactitude sur le test va de 0,87 à 0,97. Après 50 époques, elle vaut 0,90. L'algorithme pocket garde en mémoire les poids qui ont fait le moins d'erreurs depuis le début, ici 5, au lieu de garder les derniers. Il obtient 0,97 sur le test. Ce choix d'époque se fait sur un jeu de validation, jamais en regardant le test : sinon le chiffre final est trop optimiste.

## Pour aller plus loin : un 100 % à relire

Un perceptron répond à une seule question. Pour trois espèces, on en entraîne trois : « est-ce une setosa ? », « une versicolor ? », « une virginica ? ». On garde l'espèce dont le total `z` est le plus grand.

Avec les quatre mesures remises à la même échelle, un découpage au hasard donne 100 % sur 45 fleurs de test. En refaisant l'expérience cinq fois, de façon que chaque fleur serve une fois de test, les scores sont 100 %, 77 %, 83 %, 83 % et 87 %. La moyenne vaut 86 %.

Le 100 % n'était pas une erreur de calcul. Les quelques fleurs difficiles étaient toutes tombées hors du test. Avec un petit tableau, un seul découpage peut donc gagner ou perdre plus de vingt points.

```python
from sklearn.datasets import load_iris
from sklearn.linear_model import Perceptron
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

iris = load_iris()
# Le normaliseur est réappris dans chaque pli, sans voir les fleurs de test de ce pli.
modele = make_pipeline(StandardScaler(), Perceptron(max_iter=100, random_state=0))
plis = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
scores = cross_val_score(modele, iris.data, iris.target, cv=plis)
```

## Du perceptron aux réseaux modernes

La règle de Rosenblatt reste utile pour comprendre comment une erreur déplace une frontière. Les réseaux modernes ne l'utilisent cependant pas telle quelle :

- ils remplacent la marche brutale par des activations comme ReLU ou la sigmoïde ;
- ils mesurent l'erreur avec une fonction de perte ;
- ils calculent l'effet de cette erreur dans toutes les couches par rétropropagation ;
- ils ajustent les poids par descente de gradient, souvent sur de petits lots d'exemples.

La somme `w · x + b` reste la même brique. Ce sont l'activation, la perte et la méthode d'apprentissage qui rendent possibles les réseaux profonds.

## À retenir

- Le perceptron additionne des mesures pondérées, ajoute un biais, puis répond +1 ou −1 selon le signe du total. Sa frontière est une droite.
- Il ne change ses poids que lorsqu'il se trompe. S'il existe une droite entre les deux groupes, il finit par la trouver.
- Partir de zéro rend le taux d'apprentissage sans effet sur les réponses. L'ordre des exemples change la droite obtenue.
- Remettre les mesures à la même échelle, à partir de l'entraînement seul, réduit le nombre de corrections.
- Si les groupes se mélangent, l'apprentissage ne s'arrête pas. Si les oui ne tiennent pas d'un seul côté d'une droite, comme pour le XOR, il faut une couche de neurones en plus.
- Un 100 % sur un seul découpage se revérifie. Sur les trois iris, la moyenne de cinq découpages vaut 86 %.
