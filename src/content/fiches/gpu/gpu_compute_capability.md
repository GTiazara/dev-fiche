---
title: "Compute capability et architectures GPU : Ampere, Ada, Hopper"
description: "Lire le numéro de compute capability, relier architectures et Tensor Cores, et comprendre pourquoi un binaire ou un modèle refuse une carte."
technology: gpu
difficulty: intermediaire
tags:
  - gpu
  - compute-capability
  - architecture
  - tensor-cores
  - cuda
  - nvidia
publishedAt: 2026-11-23
updatedAt: 2026-11-23
draft: false
quiz:
  - question: "Qu'est-ce que la compute capability (CC) ?"
    choices:
      - "La version du driver NVIDIA affichée par apt"
      - "Un numéro majeur.mineur qui décrit les capacités matérielles CUDA d'une génération de GPU"
      - "La quantité de VRAM en Go"
    answer: 1
    explanation: "NVIDIA documente chaque GPU avec une CC (ex. 8.0 Ampere, 8.9 Ada, 9.0 Hopper)."
  - question: "Comment lire la CC des cartes présentes ?"
    choices:
      - "uniquement via nvcc --version"
      - "nvidia-smi --query-gpu=name,compute_cap"
      - "cat /etc/os-release"
    answer: 1
    explanation: "La commande officielle via nvidia-smi interroge name et compute_cap."
  - question: "Pourquoi un framework peut-il refuser une très vieille carte ?"
    choices:
      - "Parce que la CC est inférieure au minimum supporté par la version de CUDA / des libs"
      - "Parce que Python 3 est trop récent"
      - "Parce que pin_memory est activé"
    answer: 0
    explanation: "Chaque runtime et chaque build PyTorch cible un ensemble de architectures (sm_XX). En dessous du plancher, pas de support."
  - question: "À quoi servent surtout les Tensor Cores ?"
    choices:
      - "À remplacer le driver"
      - "À accélérer des opérations matricielles en précisions mixtes (FP16, BF16, TF32, etc.) selon la CC"
      - "À monter la VRAM"
    answer: 1
    explanation: "Les Tensor Cores accélèrent GEMM et ops voisines ; les types supportés dépendent de la CC."
  - question: "Hopper correspond typiquement à quelle CC ?"
    choices:
      - "7.5"
      - "8.0"
      - "9.0"
    answer: 2
    explanation: "Hopper = CC 9.0 (ex. H100). Ampere ≈ 8.0/8.6, Ada ≈ 8.9."
---

## Définition

La **compute capability** (CC) est un numéro **majeur.mineur** (ex. `8.6`, `9.0`) qui résume ce qu'une génération de GPU NVIDIA sait faire en CUDA : jeux d'instructions, limites matérielles, présence et types de **Tensor Cores**.

Ce n'est **pas** la version du driver, ni le `CUDA Version` de `nvidia-smi`. C'est une propriété du **matériel**.

## Lire la CC de sa carte

```bash
nvidia-smi --query-gpu=name,compute_cap --format=csv
```

Exemple de sortie :

```text
name, compute_cap
NVIDIA A100-SXM4-40GB, 8.0
NVIDIA GeForce RTX 4090, 8.9
```

Liste modèle → CC : [CUDA GPU Compute Capability](https://developer.nvidia.com/cuda/gpus).

Depuis PyTorch :

```python
import torch
print(torch.cuda.get_device_capability(0))  # ex. (8, 9)
```

## Architectures courantes (repères)

| Famille (exemples) | CC typiques | Notes utiles ML |
| --- | --- | --- |
| Turing (T4, RTX 20) | 7.5 | Tensor Cores FP16 / INT8 |
| Ampere (A100, RTX 30, A10) | 8.0 / 8.6 | TF32, BF16 (selon carte), FP16 |
| Ada Lovelace (RTX 40, L40) | 8.9 | FP8 côté matériel (selon libs) |
| Hopper (H100) | 9.0 | Transformer Engine / FP8, etc. |
| Blackwell (récent) | 10.x | Nouvelles précisions (FP4/FP6 selon CC) |

Les noms marketing changent ; la **CC** reste la clé pour la compatibilité logicielle.

## Tensor Cores

Les **Tensor Cores** accélèrent surtout des multiplications matricielles en **précision mixte**. Les types disponibles dépendent de la CC (table NVIDIA : FP16 dès 7.5, BF16/TF32 largement à partir d'Ampere, FP8 plus tard, etc.).

En pratique, vous ne programmez presque jamais les Tensor Cores à la main : **cuBLAS**, **cuDNN**, PyTorch AMP / SDPA s'en chargent **si** la carte et la lib le permettent.

## Pourquoi un modèle ou un binaire « refuse » une carte

1. **Plancher de CC** : le build CUDA (PyTorch, image Docker, extension) n'inclut pas votre `sm_XX`.
2. **Fonctionnalité architecture-specific** : depuis CC 9.0, certaines features doivent être compilées pour **exactement** la bonne archi (doc NVIDIA).
3. **Lib trop neuve** : cuDNN / framework exige une CC minimale (voir matrices de support).
4. **Confusion VRAM** : la carte est compatible mais trop petite → OOM (autre problème).

Message typique du genre *no kernel image is available for execution on the device* : binaire sans code pour cette CC.

## Lien avec le reste de la pile

| Notion | Rôle |
| --- | --- |
| CC | Capacités **matérielles** |
| Driver + CUDA Version (`nvidia-smi`) | Ce que le **système** peut exécuter |
| Roue PyTorch `cuXXX` | Runtime + kernels pour un ensemble d'archis |

Une carte récente avec un driver trop vieux échoue malgré une bonne CC. Une carte trop ancienne échoue malgré un driver à jour.

## À retenir

- La CC décrit la **génération matérielle** CUDA, pas le driver.
- La lire avec `nvidia-smi --query-gpu=name,compute_cap`.
- Ampere / Ada / Hopper → CC 8.x / 8.9 / 9.0 (repères).
- Tensor Cores = accélération précision mixte, via les libs.
- « Refus » d'une carte : souvent CC hors plage du binaire, ou feature non compilée pour cette archi.

## Sources

- [Compute Capabilities — CUDA Programming Guide](https://docs.nvidia.com/cuda/cuda-programming-guide/05-appendices/compute-capabilities.html).
- [CUDA GPU Compute Capability (liste)](https://developer.nvidia.com/cuda/gpus).
- [nvidia-smi](https://docs.nvidia.com/deploy/nvidia-smi/).
- Fiches DevFiches associées : pile GPU, driver / compatibilité, précision.
