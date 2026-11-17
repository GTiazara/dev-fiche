---
title: "Les types d'annotation en machine learning : binaire, multiclasse, multilabel"
description: "Savoir si une tâche est binaire, multiclasse, multilabel, ordinale ou une régression, et ce que ce choix change pour les étiquettes, le modèle et les métriques."
technology: ml
difficulty: debutant
tags:
  - classification
  - etiquette
  - annotation
  - multilabel
  - scikit-learn
publishedAt: 2026-11-16
updatedAt: 2026-11-16
draft: false
quiz:
  - question: "Un modèle classe des photos en « chat », « chien » ou « oiseau ». Chaque photo montre un seul animal. De quel type de tâche s'agit-il ?"
    choices:
      - "Binaire : il y a deux réponses possibles"
      - "Multiclasse : une seule classe parmi plus de deux"
      - "Multilabel : une photo peut porter plusieurs étiquettes"
    answer: 1
    explanation: "Il y a trois classes qui s'excluent : une photo reçoit exactement une étiquette. C'est du multiclasse."
  - question: "Un article de blog peut avoir à la fois les étiquettes « python » et « git ». Quel type d'annotation faut-il ?"
    choices:
      - "Multiclasse, avec une seule étiquette par article"
      - "Multilabel, avec zéro, une ou plusieurs étiquettes par article"
      - "Binaire, avec « python » ou « git »"
    answer: 1
    explanation: "Les étiquettes ne s'excluent pas : un article peut en porter plusieurs, ou aucune. C'est du multilabel."
  - question: "Quelle forme prennent les étiquettes d'un problème multilabel avec trois étiquettes possibles ?"
    choices:
      - "Un entier entre 0 et 2 par exemple"
      - "Une ligne de trois 0 ou 1 par exemple, un par étiquette"
      - "Un nombre décimal par exemple"
    answer: 1
    explanation: "Chaque étiquette est un oui ou un non indépendant. Pour trois étiquettes, un exemple s'écrit [1, 0, 1] si la première et la troisième s'appliquent."
  - question: "Les niveaux « mauvais », « moyen » et « bon » sont ordonnés. Quel est le piège à éviter avec un modèle multiclasse classique ?"
    choices:
      - "Il traite « mauvais » et « bon » comme aussi éloignés que « moyen » et « bon »"
      - "Il refuse de prédire plus de deux classes"
      - "Il ne peut pas utiliser de probabilités"
    answer: 0
    explanation: "Le multiclasse ignore l'ordre : se tromper de deux niveaux n'est pas pénalisé davantage que d'un niveau. Pour une échelle ordonnée, on parle de classification ordinale."
  - question: "Quelle question permet de distinguer le multiclasse du multilabel ?"
    choices:
      - "Combien d'exemples contient le jeu de données ?"
      - "Un exemple peut-il avoir plusieurs étiquettes en même temps ?"
      - "Le modèle est-il un réseau de neurones ?"
    answer: 1
    explanation: "Si une seule étiquette s'applique à la fois, c'est du multiclasse. Si plusieurs peuvent s'appliquer ensemble, c'est du multilabel."
---

## Définition

**Annoter** un jeu de données, c'est associer à chaque exemple la bonne réponse : son **étiquette** (*label* en anglais). Par exemple, indiquer qu'un e-mail est un spam, qu'une photo montre un chat, ou qu'un article parle de Python.

Le **type d'annotation** décide de tout le reste : la forme des étiquettes, la sortie du modèle, la perte utilisée pour l'entraîner et les métriques pour l'évaluer. Le bon réflexe est de se poser la question avant d'annoter.

## Les trois questions à se poser

1. La réponse est-elle un **nombre** (un prix, une température) ? C'est une régression.
2. Sinon, la réponse est un choix parmi des classes. Y en a-t-il **deux** seulement ? C'est du binaire.
3. Y en a-t-il **plus de deux**, et un exemple peut-il en avoir **plusieurs à la fois** ? Si non, c'est du multiclasse. Si oui, c'est du multilabel.

## Vue d'ensemble

| Type | Réponse attendue | Exemple | Forme de l'étiquette |
| --- | --- | --- | --- |
| Binaire | Oui ou non | Spam ou non | `0` ou `1` |
| Multiclasse | Une classe parmi plus de deux | Chat, chien ou oiseau | Un entier ou un texte |
| Multilabel | Zéro, une ou plusieurs étiquettes | Tags d'un article | Un vecteur de `0` et de `1` |
| Ordinale | Un niveau dans une échelle | Note de 1 à 5 | Un entier qui garde l'ordre |
| Régression | Un nombre | Prix d'un logement | Un nombre décimal |

## Binaire

Deux classes qui s'excluent : **positive** (`1`) et **négative** (`0`). Exemples : spam ou non, fraude ou non, malade ou sain.

- Le modèle sort **une probabilité**, celle de la classe positive. Un seuil, souvent 0,5, la transforme en décision.
- Métriques : précision, rappel, F1, AUC. Voir la fiche sur les métriques.
- Piège : les classes sont souvent **déséquilibrées**. Si 1 % des transactions sont frauduleuses, un modèle qui répond toujours « pas de fraude » a 99 % d'exactitude et ne sert à rien. Regarder le rappel et la précision, pas seulement l'exactitude.

## Multiclasse

Plus de deux classes, qui **s'excluent** : chaque exemple en a exactement une. Exemple : reconnaître un chiffre écrit à la main (10 classes), ou une espèce de fleur.

- Le modèle sort **une probabilité par classe**, et ces probabilités totalisent 1 (fonction *softmax*). On retient la plus forte.
- Les étiquettes s'écrivent comme un entier, un texte, ou un vecteur *one-hot* avec un seul `1` : `[0, 1, 0]` pour la deuxième classe.
- Métriques : exactitude, F1 *macro* (moyenne des classes, chacune comptant autant) ou F1 *pondéré* (selon la taille des classes), matrice de confusion.

## Multilabel

Plusieurs étiquettes possibles **en même temps**, et parfois aucune. Exemples : les tags d'un article (`python` et `git`), les objets présents sur une photo, les genres d'un film.

- Chaque étiquette est un **oui ou non indépendant**. Le modèle sort une probabilité par étiquette, **sans** qu'elles totalisent 1 (fonction *sigmoïde* pour chacune), puis un seuil par étiquette.
- Les étiquettes s'écrivent comme un vecteur de `0` et de `1`, une colonne par étiquette possible.
- Métriques : F1 *micro* ou *macro*, perte de Hamming (part des étiquettes mal prédites), ou exactitude stricte (toutes les étiquettes justes, plus sévère).

### Multiclasse ou multilabel ?

La confusion est fréquente, car les deux ont plus de deux étiquettes possibles. La seule différence : **un exemple a-t-il une seule étiquette ou plusieurs ?** Un animal sur une photo, c'est du multiclasse. Une photo où l'on cherche chat, chien et canapé, c'est du multilabel.

## Voir la différence dans le code

Cet exemple est exécutable avec `scikit-learn` installé. Il écrit les trois formes d'étiquettes, puis demande à la bibliothèque de les reconnaître.

```python
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.multiclass import OneVsRestClassifier
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.utils.multiclass import type_of_target

# Binaire : une valeur 0 ou 1 par exemple.
y_binaire = [0, 1, 1, 0]
# Multiclasse : une seule classe par exemple, parmi plus de deux.
y_multiclasse = ["chat", "chien", "oiseau", "chat"]
# Multilabel : une liste d'étiquettes par exemple, éventuellement vide.
y_multilabel = [["python", "git"], ["linux"], [], ["python"]]

# Une colonne par étiquette possible, 1 si elle s'applique.
mlb = MultiLabelBinarizer()
y_matrice = mlb.fit_transform(y_multilabel)
print(mlb.classes_)   # ['git' 'linux' 'python']
print(y_matrice)      # [[1 0 1] [0 1 0] [0 0 0] [0 0 1]]

# type_of_target devine le type de tâche d'après la forme des étiquettes.
print(type_of_target(y_binaire))             # binary
print(type_of_target(y_multiclasse))         # multiclass
print(type_of_target(y_matrice))             # multilabel-indicator
print(type_of_target([1.5, 2.0, 3.2]))       # continuous

# Un modèle multilabel : une régression logistique par étiquette.
X = np.array([[1, 0], [0, 1], [1, 1], [0, 0]])
modele = OneVsRestClassifier(LogisticRegression()).fit(X, y_matrice)
print(modele.predict_proba(X).shape)         # (4, 3) : une probabilité par étiquette
```

## Autres types courants

### Ordinale

Les classes ont un **ordre** : « mauvais » < « moyen » < « bon », ou une note de 1 à 5. Un modèle multiclasse l'ignore et pénalise de la même façon une erreur d'un niveau et une erreur de quatre niveaux. Pour mesurer l'écart, on utilise une métrique qui compte la distance, comme l'erreur absolue moyenne sur les rangs.

### Régression

L'étiquette est un **nombre continu** : un prix, une durée, une température. Ce n'est plus une classification. Les métriques sont l'erreur absolue moyenne (MAE) ou l'erreur quadratique moyenne (RMSE).

### Annotation de la position dans une image ou un texte

On n'étiquette plus l'exemple entier, mais **une partie** de celui-ci.

| Type | Ce que l'on annote | Exemple |
| --- | --- | --- |
| Détection d'objets | Une boîte autour de chaque objet, avec sa classe | Les voitures et les piétons d'une photo de rue |
| Segmentation | La classe de chaque pixel | Bâtiment, route ou végétation sur une image satellite |
| Étiquetage de séquence | La classe de chaque mot ou groupe de mots | Repérer les noms de personnes et de lieux dans un texte |

### Sans étiquette

Si aucun exemple n'est annoté, ce n'est plus de l'apprentissage supervisé. Le modèle cherche une structure par lui-même, par exemple en regroupant des exemples proches (*clustering*).

## Bien annoter

- Écrire des **consignes claires**, avec des exemples de cas difficiles : deux personnes annotent mieux de la même façon quand la règle est écrite.
- Faire annoter une partie des exemples par **deux personnes** et comparer leurs réponses. Un fort désaccord montre une consigne floue, pas forcément une erreur.
- Garder une classe « autre » ou « incertain » quand un exemple n'entre dans aucune case, plutôt que de forcer un choix.

## À retenir

- Une étiquette est la bonne réponse associée à un exemple. Son type détermine la tâche, la sortie du modèle et les métriques.
- **Binaire** : deux classes, une probabilité, un seuil. Se méfier du déséquilibre des classes.
- **Multiclasse** : plus de deux classes qui s'excluent, une seule étiquette par exemple, des probabilités qui totalisent 1.
- **Multilabel** : plusieurs étiquettes possibles à la fois, un vecteur de 0 et de 1, une probabilité par étiquette indépendante.
- Pour distinguer multiclasse et multilabel : un exemple peut-il avoir plusieurs étiquettes en même temps ?
- Une échelle ordonnée est **ordinale**, un nombre est une **régression**, et une partie d'image ou de texte relève de la détection, de la segmentation ou de l'étiquetage de séquence.
- `type_of_target` de `scikit-learn` dit comment la bibliothèque lit vos étiquettes.
