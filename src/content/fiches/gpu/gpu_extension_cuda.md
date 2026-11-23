---
title: "Compiler une extension CUDA : quand nvcc et le Toolkit deviennent nécessaires"
description: "Distinguer exécuter une roue PyTorch et compiler du code device, installer le Toolkit, et brancher une extension CUDA minimale avec PyTorch."
technology: gpu
difficulty: intermediaire
tags:
  - gpu
  - cuda
  - nvcc
  - toolkit
  - extension
  - pytorch
  - compilation
publishedAt: 2026-11-23
updatedAt: 2026-11-23
draft: false
quiz:
  - question: "Pour seulement exécuter un PyTorch GPU précompilé, le CUDA Toolkit (nvcc) est-il obligatoire ?"
    choices:
      - "Oui, toujours"
      - "Non : driver + roue CUDA suffisent en général"
      - "Uniquement sur macOS"
    answer: 1
    explanation: "Exécuter ≠ compiler. nvcc sert quand on construit du code CUDA."
  - question: "À quoi sert nvcc ?"
    choices:
      - "À surveiller la VRAM comme nvidia-smi"
      - "À compiler le code source CUDA (host + device) vers un binaire / objet"
      - "À choisir CUDA_VISIBLE_DEVICES"
    answer: 1
    explanation: "nvcc est le compilateur du Toolkit."
  - question: "Quand devez-vous installer le Toolkit ?"
    choices:
      - "Dès que vous tapez import torch"
      - "Quand vous compilez des extensions CUDA, des kernels custom, ou certains packages sources"
      - "Pour lire un CSV"
    answer: 1
    explanation: "Extensions PyTorch CUDA, projets C++/CUDA, builds from source."
  - question: "La CC passée à nvcc (-arch=sm_XX) doit…"
    choices:
      - "Être ignorée"
      - "Correspondre (ou inclure) la compute capability des GPU cibles"
      - "Toujours être sm_50 pour toutes les cartes 2026"
    answer: 1
    explanation: "Sans le bon sm_XX, « no kernel image is available for execution on the device »."
  - question: "load_inline / CUDAExtension côté PyTorch servent à…"
    choices:
      - "Remplacer le driver"
      - "Compiler et charger une petite extension CUDA depuis Python"
      - "Formater le disque"
    answer: 1
    explanation: "API d'extensions pour coller du CUDA custom à PyTorch."
---

## Définition

Deux besoins distincts :

| Besoin | Driver | Toolkit (`nvcc`) | Roue PyTorch CUDA |
| --- | --- | --- | --- |
| **Exécuter** un entraînement | Oui | Non (souvent) | Oui |
| **Compiler** un kernel / une extension | Oui | **Oui** | Souvent + headers PyTorch |

Cette fiche traite le second cas : quand et comment le **CUDA Toolkit** entre en jeu.

## Quand le Toolkit devient nécessaire

- Écrire / compiler un **`.cu`** (kernel custom).
- Installer un package Python qui **build** une extension CUDA (`CUDAExtension`, `torch.utils.cpp_extension`).
- Compiler PyTorch ou une lib **from source**.
- Utiliser des outils qui invoquent **`nvcc`**.

Si votre `pip install torch` + script Python suffisent : **ne pas** installer le Toolkit « par précaution ».

## Vérifier le Toolkit

```bash
nvcc --version
which nvcc
```

Sur cluster : `module load cuda` (nom selon le site) puis retester.

Le `CUDA Version` de `nvidia-smi` (driver) et celui de `nvcc` (Toolkit) peuvent **différer**. Pour compiler, le Toolkit doit être **compatible** avec le driver (tables NVIDIA) ; pour seulement exécuter le résultat, le driver doit pouvoir faire tourner le code produit.

## Cibler la bonne architecture

```bash
nvidia-smi --query-gpu=compute_cap --format=csv,noheader
# ex. 8.6 → souvent -arch=sm_86
```

Exemple :

```bash
nvcc -O3 -arch=sm_86 mon_kernel.cu -o mon_kernel
```

Plusieurs archis : `-gencode=arch=compute_80,code=sm_80` (etc.) pour un binaire « fat ». Sans la CC de la machine cible → erreur au runtime sur cette carte.

## Extension PyTorch (idée)

PyTorch fournit `torch.utils.cpp_extension` pour compiler du C++/CUDA **lié** aux tenseurs.

Schéma conceptuel (pas un projet complet) :

```python
# illustration : API, pas un mini-projet à coller tel quel en prod
from torch.utils.cpp_extension import load_inline

source = r"""
#include <torch/extension.h>
// ... kernel CUDA + wrapper ...
"""

# module = load_inline(name="mon_ext", cpp_sources=[...], cuda_sources=[...], ...)
```

En packaging sérieux : `CUDAExtension` dans un `setup.py` / `setup.cfg`, avec `nvcc` visible au build.

Prérequis typiques : Toolkit, compilateur C++ compatible, headers PyTorch, GPU + driver pour **tester**.

## Erreurs fréquentes

| Symptôme | Cause | Action |
| --- | --- | --- |
| `nvcc: command not found` | Toolkit absent / module non chargé | Installer ou `module load` |
| `unsupported gpu architecture` | Mauvais `-arch` | Aligner sur la CC |
| `no kernel image is available…` | Binaire sans code pour cette CC | Recompiler avec le bon `sm_XX` |
| Build pip échoue sans GPU | Extension compile au install | Machine de build avec Toolkit ; runtime peut être ailleurs |

## À retenir

- **Exécuter** PyTorch GPU ≠ **compiler** du CUDA.
- **`nvcc`** + Toolkit seulement si vous **construisez** du code device.
- Cibler la **compute capability** des GPU visés.
- Extensions PyTorch : `cpp_extension` / `CUDAExtension`.
- Sur HPC : modules CUDA du centre plutôt qu'un Toolkit bricolé.

## Sources

- [CUDA Toolkit](https://developer.nvidia.com/cuda-toolkit) — installation officielle.
- [nvcc — CUDA Compiler Driver](https://docs.nvidia.com/cuda/cuda-compiler-driver-nvcc/).
- [PyTorch C++ / CUDA extensions](https://docs.pytorch.org/docs/stable/cpp_extension.html).
- [Compute Capabilities](https://docs.nvidia.com/cuda/cuda-programming-guide/05-appendices/compute-capabilities.html).
- Fiches DevFiches associées : pile GPU, driver, compute capability.
