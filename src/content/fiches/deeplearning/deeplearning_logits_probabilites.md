---
title: "Logits et probabilités : les deux sorties d'un réseau de neurones"
description: "Comprendre ce qu'est un logit, comment la sigmoïde et le softmax le transforment en probabilité, et pourquoi on entraîne un réseau sur les logits."
technology: deeplearning
difficulty: intermediaire
tags:
  - logits
  - softmax
  - sigmoide
  - cross-entropy
  - pytorch
publishedAt: 2026-11-16
updatedAt: 2026-11-16
draft: false
quiz:
  - question: "Un réseau sort les scores [2.0, 1.0, 0.1] pour trois classes. Que sont ces valeurs ?"
    choices:
      - "Des probabilités, car elles sont positives"
      - "Des logits : des scores bruts qui ne totalisent pas 1"
      - "Des pourcentages de confiance"
    answer: 1
    explanation: "Un logit est un score brut, sans borne. Ces trois valeurs totalisent 3,1 et ne sont pas des probabilités. Le softmax les transforme en 0,66, 0,24 et 0,10."
  - question: "Quelle fonction transforme les logits d'un problème à plusieurs classes qui s'excluent en probabilités ?"
    choices:
      - "La sigmoïde, appliquée à chaque score"
      - "Le softmax, qui divise chaque exponentielle par la somme de toutes"
      - "La fonction ReLU"
    answer: 1
    explanation: "Le softmax produit des probabilités positives qui totalisent 1 : une seule classe l'emporte. La sigmoïde, elle, traite chaque score séparément."
  - question: "Avec PyTorch, quelle entrée faut-il donner à nn.CrossEntropyLoss ?"
    choices:
      - "Les probabilités, après un softmax"
      - "Les logits, sans softmax"
      - "Les étiquettes en one-hot seulement"
    answer: 1
    explanation: "CrossEntropyLoss applique elle-même un log-softmax, de façon stable. Lui donner des probabilités revient à appliquer le softmax deux fois : le code tourne sans erreur, mais l'apprentissage est faussé."
  - question: "Pour une étiquette binaire, quelle perte PyTorch prend directement les logits ?"
    choices:
      - "nn.BCELoss"
      - "nn.BCEWithLogitsLoss"
      - "nn.NLLLoss"
    answer: 1
    explanation: "BCEWithLogitsLoss combine la sigmoïde et la perte binaire en un seul calcul stable. BCELoss attend des probabilités déjà calculées."
  - question: "Pourquoi n'a-t-on pas besoin d'appliquer le softmax pour savoir quelle classe est prédite ?"
    choices:
      - "Parce que le softmax change l'ordre des classes"
      - "Parce que le softmax garde l'ordre : le plus grand logit donne la plus grande probabilité"
      - "Parce que les logits sont déjà des probabilités"
    answer: 1
    explanation: "Le softmax est strictement croissant : la classe au logit le plus fort a aussi la probabilité la plus forte. Le softmax ne sert qu'à afficher une probabilité."
---

## Définition

Un réseau de neurones de classification calcule, à sa dernière couche, un score par classe. Ce score s'appelle un **logit**.

- Un **logit** est un score brut. Il peut être négatif, nul ou très grand : rien ne le borne.
- Une **probabilité** est un nombre entre 0 et 1. Pour des classes qui s'excluent, les probabilités totalisent 1.

On passe du premier au second avec une fonction d'activation : la **sigmoïde** ou le **softmax**.

```text
logits  -->  sigmoïde ou softmax  -->  probabilités
(scores bruts)                          (entre 0 et 1)
```

## Un exemple chiffré

Un réseau classe une image en chat, chien ou oiseau. Il sort ces logits :

| Classe | Logit |
| --- | --- |
| Chat | 2,0 |
| Chien | 1,0 |
| Oiseau | 0,1 |

Ces nombres disent que le chat l'emporte, puis le chien, puis l'oiseau. Mais « 2,0 » ne veut pas dire « 200 % » : la somme fait 3,1. Pour obtenir des probabilités, on applique le **softmax**.

1. On élève *e* à la puissance de chaque logit : 7,389 pour le chat, 2,718 pour le chien, 1,105 pour l'oiseau.
2. On additionne : 11,212.
3. On divise chaque valeur par cette somme.

| Classe | Probabilité |
| --- | --- |
| Chat | 0,659 |
| Chien | 0,242 |
| Oiseau | 0,099 |

Les trois valeurs totalisent bien 1. Le softmax **garde l'ordre** des logits : le plus grand logit donne la plus grande probabilité. Pour savoir quelle classe est prédite, l'`argmax` des logits suffit.

## Sigmoïde et softmax : laquelle utiliser ?

| Situation | Fonction | Résultat |
| --- | --- | --- |
| Binaire : deux classes | Sigmoïde sur **un** logit | Probabilité de la classe positive |
| Multiclasse : une classe parmi plusieurs | Softmax sur **tous** les logits | Probabilités qui totalisent 1 |
| Multilabel : plusieurs étiquettes possibles | Sigmoïde sur **chaque** logit | Une probabilité indépendante par étiquette, sans total imposé |

La fiche sur les types d'annotation détaille ces trois cas.

La sigmoïde vaut `1 / (1 + e^(-z))`. Elle donne 0,5 pour un logit nul, un nombre proche de 0 pour un logit très négatif, et proche de 1 pour un logit très positif.

| Logit `z` | Sigmoïde(`z`) |
| --- | --- |
| -4 | 0,018 |
| 0 | 0,5 |
| 2 | 0,881 |

### Le logit, un logarithme de cote

Dans le cas **binaire**, le logit a un sens précis : c'est le logarithme de la cote (*log-odds*) de la classe positive.

```text
logit(p) = ln( p / (1 - p) )
```

Pour `p = 0,8`, la cote est 0,8 / 0,2 = 4 et le logit est `ln(4) ≈ 1,386`. La sigmoïde fait le chemin inverse : `sigmoïde(1,386) = 0,8`.

Dans le cas **multiclasse**, les logits sont des scores bruts, sans cette lecture en cote. Un softmax à deux classes redonne la sigmoïde de la différence des deux scores : les deux fonctions sont cohérentes.

## Pourquoi on entraîne sur les logits

On pourrait imaginer un réseau qui sort directement des probabilités. En pratique, on garde les logits pour calculer la perte, pour deux raisons.

### 1. La stabilité numérique

Le softmax calcule des exponentielles. Avec de grands logits, elles débordent.

```python
import torch

logits = torch.tensor([[1000.0, 999.0, 998.0]])

# Calcul naïf : exp(1000) dépasse la plus grande valeur représentable.
naif = torch.exp(logits) / torch.exp(logits).sum()
print(naif)                          # tensor([[nan, nan, nan]])

# Version stable : on soustrait le plus grand logit avant l'exponentielle.
print(torch.softmax(logits, dim=1))  # tensor([[0.6652, 0.2447, 0.0900]])
```

Soustraire le plus grand logit ne change pas les probabilités, mais évite de calculer `exp(1000)`. Les bibliothèques le font pour vous.

Le deuxième risque est le logarithme. La perte utilise `log(p)` : si une probabilité s'écrase à 0, le logarithme vaut moins l'infini.

```python
import torch

logits = torch.tensor([[200.0, 0.0]])
probabilites = torch.softmax(logits, dim=1)

print(torch.log(probabilites))        # tensor([[0., -inf]])
print(torch.log_softmax(logits, dim=1))  # tensor([[0., -200.]])
```

`log_softmax` calcule le logarithme directement à partir des logits et garde la valeur exacte, -200. C'est ce que font les fonctions de perte « avec logits ».

### 2. Un gradient simple

Pour la perte d'entropie croisée, le gradient par rapport aux logits est très simple :

```text
gradient pour le logit i  =  p_i - y_i
```

`p_i` est la probabilité prédite pour la classe `i`, et `y_i` vaut 1 pour la bonne classe, 0 sinon. Si le réseau est sûr à tort, l'écart est grand et le gradient aussi, mais il reste **borné entre -1 et 1**.

Si on dérive par rapport à la probabilité `p` de la bonne classe, on obtient `-1 / p` : pour `p = 0,000001`, le gradient atteint un million. Les bibliothèques ne calculent pas cette étape intermédiaire, car la formule `p - y` regroupe softmax et perte en un seul calcul.

Vérifions avec PyTorch.

```python
import torch
import torch.nn as nn

logits = torch.tensor([[2.0, 1.0, 0.1]], requires_grad=True)
etiquette = torch.tensor([0])  # la bonne classe est la classe 0 : chat

perte = nn.CrossEntropyLoss()(logits, etiquette)
perte.backward()

print(perte.item())  # 0.417, soit -ln(0.659)
print(logits.grad)   # tensor([[-0.3410,  0.2424,  0.0986]])
```

Le gradient est `[0,659 - 1 ; 0,242 - 0 ; 0,099 - 0]`, soit exactement `p - y`.

## Quelle perte pour quelle sortie ?

| Tâche | Sortie du modèle | Perte PyTorch | Keras |
| --- | --- | --- | --- |
| Binaire | 1 logit | `nn.BCEWithLogitsLoss` | `BinaryCrossentropy(from_logits=True)` |
| Multiclasse | 1 logit par classe | `nn.CrossEntropyLoss` | `SparseCategoricalCrossentropy(from_logits=True)` |
| Multilabel | 1 logit par étiquette | `nn.BCEWithLogitsLoss` | `BinaryCrossentropy(from_logits=True)` |

Les pertes qui attendent des **probabilités** existent aussi : `nn.BCELoss` (après une sigmoïde) et `nn.NLLLoss` (après un `log_softmax`). Elles sont moins sûres numériquement.

Exemple multiclasse complet, avec des logits et une perte :

```python
import torch
import torch.nn as nn

# Sortie du modèle pour 2 exemples et 3 classes : des logits, pas de softmax.
logits = torch.tensor([[2.0, 1.0, 0.1],
                       [0.2, 0.3, 2.5]])
etiquettes = torch.tensor([0, 2])  # numéro de la bonne classe de chaque exemple

perte = nn.CrossEntropyLoss()(logits, etiquettes)
print(f"Perte : {perte.item():.3f}")
```

Exemple multilabel :

```python
import torch
import torch.nn as nn

# Trois étiquettes possibles pour un exemple, un logit chacune.
logits = torch.tensor([[2.0, -1.0, 0.5]])
cibles = torch.tensor([[1.0, 0.0, 1.0]])  # étiquettes 1 et 3 présentes

perte = nn.BCEWithLogitsLoss()(logits, cibles)

# À l'inférence seulement : sigmoïde, puis un seuil par étiquette.
probabilites = torch.sigmoid(logits)
print(probabilites)               # tensor([[0.8808, 0.2689, 0.6225]])
print((probabilites > 0.5).int()) # tensor([[1, 0, 1]], dtype=torch.int32)
```

Les trois probabilités ne totalisent pas 1 : chaque étiquette est un oui ou un non indépendant.

## Quand appliquer le softmax ou la sigmoïde

- **Pendant l'entraînement** : jamais avant la perte. On lui donne les logits.
- **À l'inférence** : seulement si l'on veut **afficher** une probabilité, ou appliquer un seuil sur une probabilité. Pour la seule classe prédite, l'`argmax` des logits suffit.

## Erreurs fréquentes

- **Un softmax avant `CrossEntropyLoss`.** C'est un double softmax. Le code tourne sans erreur, mais la perte est faussée. Avec les mêmes logits `[2.0, 1.0, 0.1]`, la perte passe de 0,417 à 0,802.
- **Une couche `softmax` à la fin du modèle, avec une perte Keras `from_logits=True`.** Même double application. Il faut que la couche finale et la perte soient d'accord.
- **Lire un logit comme un pourcentage.** Un logit de 2,0 n'est pas 200 % de confiance.
- **Croire qu'une probabilité de 0,99 est fiable.** Un réseau est souvent trop confiant : la probabilité de sortie n'est pas une vraie fréquence d'erreur tant qu'elle n'est pas calibrée.

## À retenir

- Un **logit** est un score brut, sans borne. Une **probabilité** est entre 0 et 1, et totalise 1 pour des classes qui s'excluent.
- **Sigmoïde** pour le binaire et le multilabel (un logit par décision), **softmax** pour le multiclasse (tous les logits ensemble).
- En binaire, le logit est le logarithme de la cote : `ln(p / (1 - p))`.
- Le softmax garde l'ordre : la classe prédite est l'`argmax` des logits.
- On entraîne sur les **logits** : le calcul est stable et le gradient vaut simplement `p - y`.
- PyTorch : `CrossEntropyLoss` (multiclasse) et `BCEWithLogitsLoss` (binaire, multilabel) attendent des logits. Ne jamais leur donner de probabilités.
- La sigmoïde ou le softmax se calculent à l'inférence, pour afficher une probabilité.

## Sources

Cette fiche s'appuie sur l'article [Logits vs. Probabilities](https://illuri-sandeep5454.medium.com/logits-vs-probabilities-understanding-neural-network-outputs-clearly-0e86a4256a0e) d'Illuri Sandeep, complété par :

- la documentation PyTorch de [`BCEWithLogitsLoss`](https://docs.pytorch.org/docs/stable/generated/torch.nn.BCEWithLogitsLoss.md) ;
- [Interpreting logits: Sigmoid vs Softmax](https://web.stanford.edu/~nanbhas/blog/sigmoid-softmax/) de Nandita Bhaskhar ;
- [Softmax and Multinomial Logistic Loss Explained](https://sebastianraschka.com/faq/docs/softmax.html) et [Cross-Entropy Loss in PyTorch and Its Alternatives](https://sebastianraschka.com/faq/docs/pytorch-crossentropy.html) de Sebastian Raschka.
