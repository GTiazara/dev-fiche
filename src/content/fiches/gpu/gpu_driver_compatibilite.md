---
title: "Driver NVIDIA et compatibilité CUDA : tables, majeures et mineures"
description: "Comprendre la rétrocompatibilité du driver, la compatibilité mineure CUDA 11+, et savoir quand mettre à jour driver ou roue cuXXX."
technology: gpu
difficulty: intermediaire
tags:
  - gpu
  - driver
  - cuda
  - compatibilite
  - nvidia-smi
  - pytorch
publishedAt: 2026-11-23
updatedAt: 2026-11-23
draft: false
quiz:
  - question: "Que signifie le champ CUDA Version en haut à droite de nvidia-smi ?"
    choices:
      - "Que le CUDA Toolkit de cette version exacte est installé"
      - "La version maximale de CUDA que le driver installé peut faire tourner"
      - "La version de Python"
    answer: 1
    explanation: "C'est la capacité du driver (User Mode Driver), pas la preuve qu'un Toolkit est présent."
  - question: "Un driver plus récent peut-il en général exécuter une appli compilée pour une CUDA plus ancienne ?"
    choices:
      - "Non, jamais"
      - "Oui : le driver NVIDIA est rétrocompatible avec les binaires CUDA plus anciens"
      - "Seulement sous Windows"
    answer: 1
    explanation: "Backward compatibility : anciennes apps sur nouveaux drivers. L'inverse est plus contraint."
  - question: "Depuis CUDA 11, la « minor version compatibility » permet surtout…"
    choices:
      - "D'ignorer complètement le driver"
      - "À une appli d'une famille majeure (ex. 12.x) de tourner sur un driver assez récent de cette famille, avec limites"
      - "De remplacer nvidia-smi par nvcc"
    answer: 1
    explanation: "Ex. CUDA 12.x → driver ≥ 525 (ordres de grandeur documentés par NVIDIA ; vérifier la table du jour)."
  - question: "Message « NVIDIA driver on your system is too old ». Action typique ?"
    choices:
      - "Supprimer tous les GPU"
      - "Mettre à jour le driver, ou installer une runtime / roue cuXXX plus ancienne compatible"
      - "Augmenter le batch size"
    answer: 1
    explanation: "La runtime embarquée exige un driver trop neuf par rapport à l'installé."
  - question: "Faut-il toujours installer le CUDA Toolkit pour faire tourner PyTorch GPU ?"
    choices:
      - "Oui"
      - "Non : un driver compatible + une roue CUDA suffisent souvent pour exécuter"
      - "Uniquement via Snap"
    answer: 1
    explanation: "Le Toolkit (nvcc) sert surtout à compiler. Voir fiche installer PyTorch."
---

## Définition

Pour qu'une application CUDA (PyTorch, TensorFlow, binaire custom) tourne, le **NVIDIA Driver** doit être **assez récent** pour la **runtime CUDA** utilisée. NVIDIA documente :

1. la **rétrocompatibilité** du driver (anciennes apps sur drivers neufs) ;
2. depuis CUDA 11, une **compatibilité mineure** à l'intérieur d'une famille majeure (11.x, 12.x, 13.x), avec un **plancher** de driver.

Cette fiche explique comment lire les tables et **quand** mettre à jour.

## Les repères sur la machine

```bash
nvidia-smi
# Driver Version : ...
# CUDA Version   : ...   ← plafond supporté par CE driver
```

| Affichage | Signification |
| --- | --- |
| **Driver Version** | Version du driver installé |
| **CUDA Version** (`nvidia-smi`) | Max que ce driver peut exécuter |
| `torch.version.cuda` | Runtime **dans** votre build PyTorch |
| `nvcc --version` | Toolkit système (optionnel pour exécuter) |

Règle pratique pour une roue `cu126` : le `CUDA Version` de `nvidia-smi` doit être **≥** la CUDA de la roue (souvent dans la même majeure, selon tables NVIDIA / PyTorch).

## Rétrocompatibilité vs « driver too old »

```text
Driver neuf  →  peut faire tourner des binaires CUDA plus anciens
Binaire neuf →  exige un driver au moins aussi capable (sinon « too old »)
```

D'où le message fréquent avec une roue PyTorch trop récente sur un serveur au driver figé : mettre à jour le **driver**, ou descendre le **`cuXXX`**.

## Compatibilité mineure (CUDA 11+)

NVIDIA publie des planchers du type (valeurs indicatives — **vérifier** [CUDA Compatibility](https://docs.nvidia.com/deploy/cuda-compatibility/latest/minor-version-compatibility.html) et les release notes du Toolkit) :

| Famille Toolkit / runtime | Driver minimum (ordre de grandeur) |
| --- | --- |
| CUDA 11.x | ≥ 450 |
| CUDA 12.x | ≥ 525 |
| CUDA 13.x | ≥ 580 |

Limites importantes documentées par NVIDIA :

- certaines **features** neuves exigent un driver encore plus récent (`cudaErrorCallRequiresNewerDriver`) ;
- le code **PTX** JIT peut se comporter différemment sur un driver plus ancien ;
- les chiffres exacts évoluent : toujours lire la table officielle du Toolkit utilisé.

## Quand mettre à jour quoi ?

| Situation | Action préférable |
| --- | --- |
| Serveur partagé, driver figé par l'admin | Choisir une roue / image **plus ancienne** (`cuXXX` plus bas) |
| Machine perso / nœud que vous contrôlez | **Mettre à jour le driver**, puis garder des roues récentes |
| Nouveau GPU (Blackwell, etc.) | Driver **récent** obligatoire + stack logicielle adaptée |
| Seulement compiler des extensions | Toolkit (`nvcc`) en plus du driver (fiche extension CUDA) |

Sur un cluster HPC, vous ne « mettez pas à jour le driver » vous-même : vous chargez le **module** / l'image compatible (fiche GPU + SLURM).

## Lien avec PyTorch

1. Lire `CUDA Version` via `nvidia-smi`.
2. Ouvrir le [sélecteur PyTorch](https://pytorch.org/get-started/locally/).
3. Prendre un `cuXXX` **compatible** (en pratique ≤ plafond driver, d'après la doc du moment).
4. Si `driver is too old` → driver ↑ ou `cuXXX` ↓.

Détail d'installation : fiche installer PyTorch CUDA. Diagnostic : fiche diagnostiquer.

## À retenir

- `nvidia-smi` → **CUDA Version** = plafond du **driver**, pas le Toolkit installé.
- Drivers **neufs** font tourner d'anciens binaires ; binaires **neufs** exigent un driver assez récent.
- Depuis CUDA 11 : compatibilité **mineure** dans une majeure, avec plancher de driver.
- Choisir : **monter le driver** ou **baisser `cuXXX` / l'image**.
- Toujours vérifier les **tables officielles** NVIDIA : les numéros bougent.

## Sources

- [Minor Version Compatibility — CUDA Compatibility](https://docs.nvidia.com/deploy/cuda-compatibility/latest/minor-version-compatibility.html).
- [CUDA Toolkit Release Notes — Driver](https://docs.nvidia.com/cuda/cuda-toolkit-release-notes/).
- [PyTorch Get Started](https://pytorch.org/get-started/locally/).
- [PyTorch Discuss — driver et CUDA](https://discuss.pytorch.org/t/what-is-the-interplay-between-the-nvidia-driver-and-cuda/217811).
- Fiches DevFiches associées : pile GPU, installer PyTorch, diagnostic.
