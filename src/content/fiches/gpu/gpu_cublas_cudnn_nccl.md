---
title: "cuBLAS, cuDNN et NCCL : le rôle de chaque bibliothèque"
description: "Situer cuBLAS (algèbre), cuDNN (réseaux de neurones) et NCCL (multi-GPU) sous PyTorch, sans réécrire toute la doc NVIDIA."
technology: gpu
difficulty: intermediaire
tags:
  - gpu
  - cublas
  - cudnn
  - nccl
  - cuda
  - pytorch
publishedAt: 2026-11-23
updatedAt: 2026-11-23
draft: false
quiz:
  - question: "cuBLAS sert surtout à…"
    choices:
      - "Communiquer entre nœuds InfiniBand uniquement"
      - "L'algèbre linéaire dense sur GPU (GEMM, etc.)"
      - "Afficher nvidia-smi"
    answer: 1
    explanation: "BLAS = Basic Linear Algebra Subprograms. cuBLAS est la version CUDA."
  - question: "Une convolution nn.Conv2d s'appuie souvent sur…"
    choices:
      - "NCCL"
      - "cuDNN"
      - "apt install firefox"
    answer: 1
    explanation: "cuDNN fournit des primitives DNN (convolutions, attentions liées, etc.)."
  - question: "NCCL intervient surtout quand…"
    choices:
      - "On lit un CSV sur CPU"
      - "Plusieurs GPU (ou nœuds) doivent échanger tenseurs / gradients efficacement"
      - "On compile un document LaTeX"
    answer: 1
    explanation: "NCCL = collectives haute perf (all-reduce, etc.), backend typique de DDP."
  - question: "Faut-il importer cuBLAS dans un script PyTorch débutant ?"
    choices:
      - "Oui, import cublas obligatoire"
      - "Non : PyTorch / les roues nvidia-* les appellent pour vous"
      - "Uniquement via Java"
    answer: 1
    explanation: "Vous écrivez torch.matmul ; en dessous, cuBLAS peut s'exécuter."
  - question: "Une erreur du type « cuDNN version mismatch » indique surtout…"
    choices:
      - "Un problème de police d'écran"
      - "Des versions de libs CUDA-X incompatibles avec le PyTorch / la runtime installés"
      - "Que le batch est trop petit"
    answer: 1
    explanation: "Aligner les versions (réinstaller un stack cohérent, image NGC, modules HPC)."
---

## Définition

Sous PyTorch (et d'autres frameworks) tournent des bibliothèques **CUDA-X**. Trois noms reviennent sans cesse :

| Lib | Domaine | Vous l'appelez ? |
| --- | --- | --- |
| **cuBLAS** | Algèbre linéaire (surtout **GEMM**) | Rarement en direct |
| **cuDNN** | Primitives de **deep learning** | Rarement en direct |
| **NCCL** | **Collectives** multi-GPU / multi-nœuds | Via DDP / backends |

Comprendre leur rôle évite de « debugger CUDA » au mauvais étage.

## cuBLAS

**cuBLAS** = BLAS sur GPU : produits de matrices, certains solveurs, etc.

Exemples d'appels PyTorch qui y passent souvent :

- `torch.matmul`, `@`, couches `nn.Linear` ;
- de nombreuses ops d'algèbre dense.

Les **Tensor Cores** sont souvent exercés **via** cuBLAS (et cousins) quand la précision et la CC le permettent.

## cuDNN

**cuDNN** (*CUDA Deep Neural Network library*) accélère des briques de réseaux :

- convolutions, pooling, normalisations, RNN, etc. ;
- selon versions : chemins liés à l'attention / transformers.

Exemples :

- `nn.Conv2d`, `nn.Conv3d` ;
- certaines configs d'entraînement CNN / vision.

PyTorch active en général cuDNN automatiquement (`torch.backends.cudnn.enabled`). Des flags comme `benchmark=True` laissent cuDNN **choisir un algo** selon la taille des tenseurs (utile si les formes sont stables).

## NCCL

**NCCL** (*NVIDIA Collective Communications Library*) optimise les échanges :

- **all-reduce** des gradients (cœur de DDP) ;
- broadcast, all-gather, reduce-scatter, etc. ;
- mono-nœud multi-GPU et multi-nœuds (selon réseau : NVLink, IB, …).

Vous ne l'appelez presque jamais : `backend="nccl"` dans `init_process_group` suffit. Si NCCL échoue (timeout, mauvaise topo), le symptôme apparaît au **lancement distribué**, pas sur un simple `matmul` mono-GPU.

## Où elles vivent sur disque

Avec les roues PyTorch récentes, beaucoup de libs arrivent en paquets `nvidia-cublas-cu12`, `nvidia-cudnn-cu12`, `nvidia-nccl-cu12`, etc. Sur HPC, elles viennent des **modules** ou d'images **NGC**.

Conséquence : un mélange `pip` + modules système peut provoquer des **mismatches** de versions.

## Quand s'en préoccuper

| Symptôme | Piste |
| --- | --- |
| Matmul / Linear anormalement lent | Précision, CC, ou chemin non Tensor Core |
| Conv lente / erreur cuDNN | Version cuDNN, `cudnn.benchmark`, formes |
| DDP hang / NCCL error | Réseau, `NCCL_DEBUG=INFO`, GPU visibles, firewall |
| `undefined symbol` / version mismatch | Stack réinstallé de façon cohérente |

Pour un mono-GPU débutant qui entraîne un petit modèle : **rien à configurer** — savoir que ces libs existent suffit.

## À retenir

- **cuBLAS** → algèbre (matmul, Linear).
- **cuDNN** → primitives DNN (convolutions…).
- **NCCL** → communication multi-GPU (DDP).
- PyTorch les utilise **pour vous** ; aligner les versions du stack.
- Debugger NCCL seulement dès qu'on passe **distribué**.

## Sources

- [cuBLAS](https://docs.nvidia.com/cuda/cublas/) — doc NVIDIA.
- [cuDNN](https://docs.nvidia.com/deeplearning/cudnn/) et [support matrix](https://docs.nvidia.com/deeplearning/cudnn/backend/latest/reference/support-matrix.html).
- [NCCL](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/index.html).
- Fiches DevFiches associées : pile GPU, DDP, compute capability.
