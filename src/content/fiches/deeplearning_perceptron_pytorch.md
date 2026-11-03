---
title: "Implémenter un perceptron avec PyTorch"
description: "Écrire un perceptron avec nn.Module et nn.Linear, comprendre les formes des tenseurs, l'entraîner sur la porte logique ET puis l'utiliser pour décider."
technology: [deeplearning, python]
difficulty: debutant
tags:
  - perceptron
  - pytorch
  - nn.Module
  - nn.Linear
  - sigmoide
  - entrainement
publishedAt: 2026-11-03
updatedAt: 2026-11-03
draft: false
quiz:
  - question: "Combien de paramètres apprenables contient nn.Linear(in_features=2, out_features=1) ?"
    choices:
      - "2 : un poids par entrée"
      - "3 : deux poids et un biais"
      - "4 : deux poids et deux biais"
    answer: 1
    explanation: "La couche a une matrice de poids de forme (1, 2) et un biais de forme (1,), soit 2 + 1 = 3 nombres."
  - question: "Pourquoi appelle-t-on super().__init__() au début de __init__ ?"
    choices:
      - "Pour que nn.Module prépare l'enregistrement des couches et de leurs paramètres"
      - "Pour lancer l'entraînement"
      - "Pour charger les données"
    answer: 0
    explanation: "Sans cet appel, PyTorch ne peut pas enregistrer self.linear : model.parameters() ne trouverait rien à entraîner."
  - question: "Le modèle renvoie un tenseur de forme (4, 1). Quelle forme doit avoir la cible pour nn.BCELoss ?"
    choices:
      - "(4,)"
      - "(4, 1)"
      - "(1, 4)"
    answer: 1
    explanation: "BCELoss compare deux tenseurs de même forme. Une cible (4,) face à une sortie (4, 1) provoque une erreur."
  - question: "Que fait optimizer.zero_grad() dans la boucle d'entraînement ?"
    choices:
      - "Il remet les poids à zéro"
      - "Il efface les gradients du tour précédent, que PyTorch additionnerait sinon"
      - "Il arrête l'entraînement quand la perte vaut zéro"
    answer: 1
    explanation: "backward() ajoute les nouveaux gradients à ceux déjà stockés. Il faut donc les vider avant chaque calcul."
  - question: "Le forward applique déjà torch.sigmoid. Quelle fonction de perte choisir ?"
    choices:
      - "nn.BCEWithLogitsLoss, qui applique elle aussi une sigmoïde"
      - "nn.BCELoss, qui attend des probabilités entre 0 et 1"
      - "nn.CrossEntropyLoss, qui attend des classes entières"
    answer: 1
    explanation: "BCEWithLogitsLoss attend des logits bruts : avec une sigmoïde déjà dans le forward, elle l'appliquerait deux fois."
---

## L'idée

Un **perceptron** est le plus simple des réseaux de neurones artificiels. Il combine ses entrées par une **somme pondérée**, ajoute un **biais**, puis une **fonction d'activation** transforme cette somme en décision.

```text
z = w₁·x₁ + w₂·x₂ + b
p = σ(z) = 1 / (1 + e^(−z))
```

- `x₁`, `x₂` : les entrées.
- `w₁`, `w₂` : les **poids**, l'importance donnée à chaque entrée.
- `b` : le **biais**, qui décale le seuil de décision.
- `z` : le **logit**, la somme brute, qui peut valoir n'importe quel nombre.
- `σ` : la **sigmoïde**, qui écrase `z` entre 0 et 1. Le résultat `p` se lit comme une probabilité.

La fiche « Le perceptron, premier neurone artificiel » explique la version historique, avec un seuil et une règle de correction à la main. Ici, PyTorch calcule les corrections à notre place.

## Le problème à résoudre

Une voiture doit décider d'**accélérer**. Elle n'accélère que si le feu est vert **et** si la route est libre. C'est la porte logique ET :

| Feu vert (x₁) | Route libre (x₂) | Accélérer ? (y) |
| --- | --- | --- |
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

Le perceptron doit apprendre seul les poids et le biais qui reproduisent ce tableau.

## Étape 1 : écrire le modèle

En PyTorch, un modèle est une classe qui hérite de `nn.Module`. Elle contient deux méthodes :

- `__init__` : on y **déclare** les couches, donc les paramètres à apprendre.
- `forward` : on y **décrit le calcul** qui transforme une entrée en sortie.

```python
import torch
from torch import nn


class Perceptron(nn.Module):
    """Un neurone : somme pondérée des entrées, plus un biais, puis une sigmoïde."""

    def __init__(self, input_features: int = 2, output_features: int = 1) -> None:
        """Crée la couche linéaire qui porte les poids et le biais.

        input_features : nombre d'entrées, 2 par défaut.
        output_features : nombre de sorties, 1 par défaut.
        """
        super().__init__()
        # Un perceptron = une seule couche linéaire (poids + biais).
        self.linear = nn.Linear(
            in_features=input_features,
            out_features=output_features,
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Reçoit un tenseur (batch, input_features).

        Renvoie un tenseur (batch, output_features) de probabilités
        entre 0 et 1 pour la décision « accélérer ».
        """
        logits = self.linear(x)
        # La sigmoïde transforme le logit en probabilité.
        return torch.sigmoid(logits)
```

Ligne par ligne :

| Code | Rôle |
| --- | --- |
| `class Perceptron(nn.Module)` | Hérite de tout ce qu'il faut : liste des paramètres, passage CPU/GPU, sauvegarde |
| `super().__init__()` | Prépare `nn.Module`. **Obligatoire** avant de créer une couche, sinon PyTorch lève une erreur |
| `self.linear = nn.Linear(2, 1)` | Crée 2 poids et 1 biais. Comme c'est un attribut, PyTorch l'enregistre automatiquement |
| `self.linear(x)` | Calcule `z = x · Wᵀ + b` pour toutes les lignes de `x` à la fois |
| `torch.sigmoid(logits)` | Ramène chaque `z` entre 0 et 1 |

On n'appelle jamais `forward` directement : on écrit `model(x)`. PyTorch appelle alors `forward` et gère en plus ses mécanismes internes.

## Étape 2 : regarder à l'intérieur

```python
torch.manual_seed(0)  # Mêmes poids de départ à chaque exécution.
model = Perceptron()

print(model)
print(model.linear.weight.shape)  # torch.Size([1, 2])
print(model.linear.bias.shape)    # torch.Size([1])
print(sum(p.numel() for p in model.parameters()))  # 3
```

- `weight` a la forme `(sorties, entrées)`, soit `(1, 2)` : **une ligne de poids par sortie**.
- `bias` a la forme `(sorties,)`, soit `(1,)`.
- Au total, **3 nombres** à apprendre.

Au départ, ces valeurs sont tirées au hasard dans un petit intervalle. Le modèle ne sait donc encore rien faire.

## Étape 3 : préparer les données

```python
X = torch.tensor([
    [0.0, 0.0],
    [0.0, 1.0],
    [1.0, 0.0],
    [1.0, 1.0],
])                                           # forme (4, 2)
y = torch.tensor([[0.0], [0.0], [0.0], [1.0]])  # forme (4, 1)
```

Deux règles à respecter :

1. **Les entrées sont des `float`.** `nn.Linear` calcule en `float32`. Écrire `0.0` et non `0` évite une erreur de type.
2. **La cible a la même forme que la sortie.** Le modèle renvoie `(4, 1)`, donc `y` est `(4, 1)` et non `(4,)`.

Chaque **ligne** de `X` est un exemple. Le **batch** est l'ensemble des lignes traitées en une fois, ici les 4.

## Étape 4 : entraîner

Entraîner, c'est répéter quatre gestes :

```text
1. prédire              model(X)
2. mesurer l'erreur     loss_fn(proba, y)
3. calculer gradients   loss.backward()
4. corriger les poids   optimizer.step()
   → recommencer en 1
```

```python
loss_fn = nn.BCELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.5)

for epoch in range(1000):
    optimizer.zero_grad()      # 0. Vider les gradients du tour précédent
    proba = model(X)           # 1. Prédire
    loss = loss_fn(proba, y)   # 2. Mesurer l'erreur
    loss.backward()            # 3. Calculer les gradients
    optimizer.step()           # 4. Corriger les poids

    if epoch % 200 == 0:
        print(f"époque {epoch:4d}  perte {loss.item():.4f}")
```

| Élément | Rôle |
| --- | --- |
| `nn.BCELoss()` | *Binary Cross-Entropy* : mesure l'écart entre une probabilité et une cible 0 ou 1. Grande quand le modèle est sûr de lui et se trompe |
| `torch.optim.SGD` | Descente de gradient : déplace chaque paramètre un peu dans la direction qui fait baisser la perte |
| `model.parameters()` | Les 3 nombres que l'optimiseur a le droit de modifier |
| `lr=0.5` | *Learning rate*, la taille du pas. Trop petit : lent. Trop grand : la perte oscille |
| `loss.backward()` | PyTorch remonte le calcul et trouve, pour chaque poids, dans quel sens il faut le bouger |
| `optimizer.zero_grad()` | `backward()` **ajoute** les gradients à ceux déjà stockés. Sans remise à zéro, ils s'accumulent d'un tour à l'autre |
| Époque | Un passage complet sur toutes les données |

La perte affichée doit **diminuer** au fil des époques. Si elle stagne ou augmente, vérifier d'abord le taux d'apprentissage.

## Étape 5 : utiliser le modèle

```python
with torch.no_grad():
    proba = model(X)
    decision = (proba >= 0.5).float()

print(proba.squeeze(1))     # 3 valeurs proches de 0, la dernière au-dessus de 0,5
print(decision.squeeze(1))  # tensor([0., 0., 0., 1.])
print(model.linear.weight, model.linear.bias)
```

- `torch.no_grad()` : on ne fait que prédire, pas besoin de mémoriser le calcul pour les gradients. C'est plus rapide et plus léger.
- `proba >= 0.5` : la probabilité devient une décision oui/non. 0,5 correspond exactement à `z = 0`.
- `squeeze(1)` : retire la dimension de taille 1 pour un affichage plus lisible, `(4, 1)` devient `(4,)`.

Les valeurs exactes des poids varient avec la graine aléatoire. Le résultat attendu, lui, ne varie pas : les deux poids sont **positifs** et le biais est **négatif**. La somme ne dépasse le seuil que si les deux entrées valent 1 : c'est bien un ET.

## Bonne pratique : renvoyer le logit

La version ci-dessus fonctionne et se lit facilement. En pratique, on préfère que `forward` renvoie le **logit**, et on confie la sigmoïde à la fonction de perte `nn.BCEWithLogitsLoss`. Elle combine les deux calculs de façon plus stable numériquement quand `z` devient très grand ou très petit.

```python
class PerceptronLogit(nn.Module):
    """Perceptron qui renvoie le logit brut, sans activation."""

    def __init__(self, input_features: int = 2, output_features: int = 1) -> None:
        super().__init__()
        self.linear = nn.Linear(input_features, output_features)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Renvoie un tenseur (batch, output_features) de logits."""
        return self.linear(x)


model = PerceptronLogit()
loss_fn = nn.BCEWithLogitsLoss()  # Applique elle-même la sigmoïde.
# ... même boucle d'entraînement ...

with torch.no_grad():
    proba = torch.sigmoid(model(X))  # Sigmoïde seulement pour prédire.
```

| `forward` renvoie | Perte à utiliser |
| --- | --- |
| une probabilité (sigmoïde incluse) | `nn.BCELoss` |
| un logit (pas de sigmoïde) | `nn.BCEWithLogitsLoss` |

Mélanger les deux applique la sigmoïde deux fois. Le code tourne sans erreur, mais le modèle apprend mal.

## Erreurs fréquentes

| Symptôme | Cause | Correction |
| --- | --- | --- |
| `ValueError` : *target size different to the input size* | Cible `(4,)` face à une sortie `(4, 1)` | `y = y.unsqueeze(1)` ou écrire `[[0.0], ...]` |
| Erreur de type *Long* / *Float* | Tenseur créé avec des entiers `0`, `1` | Écrire `0.0`, `1.0` ou ajouter `.float()` |
| `AttributeError` à la création de la couche | `super().__init__()` oublié | L'appeler en première ligne de `__init__` |
| La perte varie de façon erratique | `optimizer.zero_grad()` oublié | Le placer au début de chaque tour |
| La perte stagne vers 0,69 | Le modèle répond 0,5 partout. Problème non séparable ou pas trop petit | Voir la limite ci-dessous, ou augmenter `lr` |

## La limite : le OU exclusif

Remplacer la cible par le **XOR** : accélérer si **une seule** des deux entrées vaut 1.

```python
y_xor = torch.tensor([[0.0], [1.0], [1.0], [0.0]])
```

Avec le même code, la perte reste bloquée autour de 0,69, soit `ln 2`, et les quatre probabilités tendent vers 0,5. Le modèle ne trouve pas mieux que « je ne sais pas ».

Ce n'est pas un problème de réglage. La frontière d'un perceptron, `z = 0`, est une **droite**. Aucune droite ne sépare les points (0, 1) et (1, 0) des points (0, 0) et (1, 1). Il faut une **couche cachée** de plusieurs neurones avec une activation non linéaire entre les deux couches :

```python
mlp = nn.Sequential(
    nn.Linear(2, 4),
    nn.ReLU(),
    nn.Linear(4, 1),
)
```

C'est le **perceptron multicouche**, la base des réseaux profonds.

## Perceptron historique ou perceptron PyTorch ?

| | Perceptron de Rosenblatt | Version PyTorch de cette fiche |
| --- | --- | --- |
| Activation | Seuil : 1 si `z ≥ 0`, sinon 0 | Sigmoïde : valeur entre 0 et 1 |
| Apprentissage | Correction seulement en cas d'erreur | Descente de gradient sur la perte |
| Sortie | Une classe | Une probabilité, puis une classe |

Le seuil n'a pas de pente utilisable : sa dérivée vaut 0 presque partout, donc `backward()` ne pourrait rien corriger. La sigmoïde est **dérivable**, ce qui permet le calcul des gradients. Au sens strict, un neurone linéaire suivi d'une sigmoïde est une **régression logistique**. On garde le nom de perceptron par habitude.

## À retenir

- Un modèle PyTorch hérite de `nn.Module` : couches déclarées dans `__init__`, calcul décrit dans `forward`, appel avec `model(x)`.
- `super().__init__()` vient toujours en premier.
- `nn.Linear(2, 1)` porte 2 poids et 1 biais. `weight` a la forme `(sorties, entrées)`.
- Entrées en `float`, cible de même forme que la sortie : `(batch, 1)`.
- La boucle d'entraînement : `zero_grad()`, prédire, perte, `backward()`, `step()`.
- Sigmoïde dans `forward` → `BCELoss`. Logit brut → `BCEWithLogitsLoss`, plus stable.
- Prédire sous `torch.no_grad()`, puis seuil à 0,5.
- Un perceptron trace une droite : il apprend ET, pas XOR. Pour XOR, il faut une couche cachée.
