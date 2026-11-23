---
title: "Installer PyTorch avec CUDA : driver, roues GPU et vérification"
description: "Choisir une roue PyTorch CUDA compatible avec le driver, éviter le build CPU-only, vérifier torch.cuda.is_available, et savoir quand le Toolkit ou Docker interviennent."
technology: gpu
difficulty: debutant
tags:
  - gpu
  - pytorch
  - cuda
  - installation
  - pip
  - driver
publishedAt: 2026-11-23
updatedAt: 2026-11-23
draft: false
quiz:
  - question: "Pour exécuter un PyTorch GPU précompilé, que faut-il en général sur la machine ?"
    choices:
      - "Le CUDA Toolkit complet avec nvcc"
      - "Un NVIDIA Driver assez récent pour la runtime de la roue, et une roue PyTorch CUDA"
      - "Uniquement Python, sans driver"
    answer: 1
    explanation: "Les roues embarquent la runtime CUDA. Le Toolkit sert surtout à compiler. Sans driver compatible, is_available() reste faux."
  - question: "Que signifie souvent torch.version.cuda égal à None ?"
    choices:
      - "Que le driver est trop récent"
      - "Qu'un build CPU-only (ou sans CUDA) est installé"
      - "Que nvidia-smi est cassé"
    answer: 1
    explanation: "Sur une roue CPU, torch.version.cuda vaut None et is_available() reste False même si une carte est présente."
  - question: "Comment choisir l'index pip (cu126, cu128, …) ?"
    choices:
      - "Au hasard, le plus grand numéro est toujours le meilleur"
      - "Via le sélecteur officiel PyTorch, avec une CUDA de roue ≤ CUDA Version de nvidia-smi"
      - "En installant toujours depuis PyPI sans --index-url"
    answer: 1
    explanation: "La roue ne doit pas exiger une CUDA plus récente que ce que le driver accepte. Le site Get Started donne la commande à jour."
  - question: "nvidia-smi fonctionne, mais torch.cuda.is_available() est False. Première chose à vérifier ?"
    choices:
      - "Si la version installée est +cpu / torch.version.cuda is None"
      - "Si le disque est plein"
      - "Si Git est installé"
    answer: 0
    explanation: "Le cas le plus fréquent est une roue CPU. Ensuite seulement : incompatibilité driver ↔ runtime de la roue."
  - question: "À quoi sert le CUDA Toolkit (nvcc) dans ce parcours ?"
    choices:
      - "Il est obligatoire pour pip install torch avec CUDA"
      - "Il n'est pas nécessaire pour exécuter une roue ; utile pour compiler des extensions CUDA"
      - "Il remplace le NVIDIA Driver"
    answer: 1
    explanation: "Exécuter ≠ compiler. Les binaires PyTorch n'utilisent pas le nvcc système pour tourner."
---

## Définition

Installer « PyTorch avec GPU », ce n'est pas seulement `pip install torch`. Il existe des **roues CPU** et des **roues CUDA**. Une roue CUDA embarque sa **runtime** ; elle exige un **NVIDIA Driver** assez récent, pas forcément le CUDA Toolkit (`nvcc`).

Cette fiche enchaîne : préparer le driver → choisir la bonne roue → installer → vérifier. Les notions de pile (driver / CUDA / application) sont dans la fiche pile GPU.

## Les trois « versions CUDA » (à ne pas confondre)

| Où | Ce que ça dit |
| --- | --- |
| `nvidia-smi` → `CUDA Version` | Maximum que le **driver** peut faire tourner |
| `torch.version.cuda` | Runtime CUDA **embarquée** dans votre build PyTorch (`None` = pas de CUDA) |
| `nvcc --version` | Toolkit **système**, optionnel pour seulement exécuter |

Un driver **plus récent** peut faire tourner une roue compilée pour une CUDA **plus ancienne**. L'inverse échoue souvent : roue trop neuve pour un driver trop vieux → `driver is too old` ou `is_available() == False`.

## Avant d'installer

```bash
nvidia-smi
```

- Si la commande échoue : installer / réparer le **driver** d'abord (fiche pile GPU).
- Noter le `CUDA Version` en haut à droite : plafond pour choisir `cuXXX`.
- Environnement Python dédié recommandé (`venv` / conda), pour ne pas mélanger CPU et GPU.

## Choisir la bonne roue

1. Ouvrir le sélecteur officiel : [Get Started — PyTorch](https://pytorch.org/get-started/locally/).
2. OS = Linux (ou Windows), Package = Pip, Language = Python.
3. **Compute Platform** = une version **CUDA** adaptée à votre driver (souvent la plus récente encore ≤ le plafond `nvidia-smi`), pas « CPU » si vous voulez le GPU.
4. Copier la commande affichée. Elle ressemble à :

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu126
```

Le suffixe `cu126` est un **exemple** : les indices évoluent (`cu128`, `cu130`, …). Toujours prendre la commande du sélecteur du jour.

| Besoin | Choix typique |
| --- | --- |
| GPU NVIDIA | Index `…/whl/cuXXX` |
| Pas de GPU / CI CPU | Plateforme **CPU** du sélecteur |
| GPU AMD | Index **ROCm** (hors détail ici) |

### Remplacer une mauvaise install

```bash
pip uninstall -y torch torchvision torchaudio
# puis la commande du sélecteur avec --index-url …/cuXXX
```

Sans désinstaller, `pip` peut garder une ancienne roue `+cpu` en cache.

## Vérifier que le GPU est bien vu

```python
import torch

print(torch.__version__)
print(torch.version.cuda)              # ex. '12.6' — pas None
print(torch.cuda.is_available())       # True
print(torch.cuda.get_device_name(0))

x = torch.randn(1024, 1024, device="cuda")
y = x @ x
torch.cuda.synchronize()
print("OK sur", x.device)
```

| Résultat | Interprétation |
| --- | --- |
| `version` avec `+cpu`, `cuda` = `None` | Roue CPU → réinstaller depuis l'index CUDA |
| `cuda` = `12.x` mais `is_available()` False | Driver trop vieux, pas de GPU, ou mauvais device / conteneur sans GPU |
| `is_available()` True + matmul OK | Installation GPU fonctionnelle |

## Docker : rappel court

Dans un conteneur, il faut :

1. le **NVIDIA Container Toolkit** sur l'hôte ;
2. lancer avec accès GPU, par ex. `docker run --gpus all …` ;
3. une **image** dont la CUDA de PyTorch reste compatible avec le **driver de l'hôte** (le conteneur n'embarque pas le driver).

Même logique qu'en local : driver hôte + roue / image adaptés.

## TensorFlow (aperçu)

Même idée : builds CPU vs GPU, driver obligatoire, Toolkit souvent inutile pour seulement exécuter. La commande exacte change selon la version TF : suivre la doc TensorFlow « GPU support » du moment, et vérifier avec un petit tenseur sur `/GPU:0`.

## Erreurs fréquentes

| Symptôme | Cause | Action |
| --- | --- | --- |
| `is_available()` False, `cuda` is `None` | Roue CPU | Désinstaller, réinstaller avec `--index-url …/cuXXX` |
| `NVIDIA driver … is too old` | Roue plus neuve que le driver | Mettre à jour le driver, ou prendre un `cuXXX` plus ancien |
| `nvidia-smi` OK, Python non | Mauvais venv / mauvais `python` | Vérifier `which python` et le venv activé |
| Ça marche hors Docker, pas dedans | Conteneur sans `--gpus` | Relancer avec accès GPU |

## À retenir

- **Driver d'abord** ; Toolkit (`nvcc`) seulement pour compiler.
- Utiliser le **sélecteur PyTorch** et un index `cuXXX` ≤ `CUDA Version` de `nvidia-smi`.
- Distinguer roue **CPU** (`torch.version.cuda is None`) et roue **CUDA**.
- Vérifier : `is_available()`, nom du device, petit calcul sur `cuda`.
- En Docker : GPU exposé + compatibilité **driver hôte** ↔ CUDA de l'image.

## Sources

- [PyTorch Get Started](https://pytorch.org/get-started/locally/) — sélecteur et commandes officielles.
- [PyTorch Discuss — driver et CUDA](https://discuss.pytorch.org/t/what-is-the-interplay-between-the-nvidia-driver-and-cuda/217811) — roues embarquent la runtime ; driver suffisant pour exécuter.
- Fiches DevFiches associées : pile GPU, VRAM, choix / isolation de GPU.
