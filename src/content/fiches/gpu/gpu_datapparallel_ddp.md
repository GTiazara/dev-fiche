---
title: "DataParallel vs DistributedDataParallel : idée et quand passer au multi-GPU"
description: "Comparer DP et DDP, comprendre un processus par GPU, et savoir quand un seul GPU suffit encore."
technology: gpu
difficulty: intermediaire
tags:
  - gpu
  - pytorch
  - ddp
  - dataparallel
  - multi-gpu
  - distributed
publishedAt: 2026-11-23
updatedAt: 2026-11-23
draft: false
quiz:
  - question: "Que recommande en général PyTorch entre DataParallel et DistributedDataParallel ?"
    choices:
      - "DataParallel pour tout, y compris 8 GPU"
      - "DistributedDataParallel : meilleures performances et meilleur passage à l'échelle"
      - "Les deux sont identiques en interne"
    answer: 1
    explanation: "Le guide de tuning PyTorch indique que DDP scale nettement mieux que DP."
  - question: "Modèle typique recommandé pour DDP ?"
    choices:
      - "Un seul processus Python qui pilote huit GPU via des threads"
      - "Un processus (et souvent un GPU) par rang, coordonnés par un backend de communication"
      - "Huit notebooks Jupyter sans lanceur"
    answer: 1
    explanation: "Best practice : 1 GPU par process. torchrun / lanceurs créent les rangs."
  - question: "DataParallel, en résumé, c'est…"
    choices:
      - "Plusieurs machines sans réseau"
      - "Un processus, réplication du module sur plusieurs GPU, gathering sur le GPU 0 (souvent moins efficace)"
      - "Uniquement pour CPU"
    answer: 1
    explanation: "DP est simple à brancher (nn.DataParallel) mais le GPU 0 et le GIL limitent le scaling."
  - question: "Quand rester sur un seul GPU est souvent raisonnable ?"
    choices:
      - "Jamais"
      - "Modèle et batch tiennent en VRAM, le GPU est déjà bien utilisé, le code reste simple"
      - "Seulement si on n'a pas de driver"
    answer: 1
    explanation: "Le multi-GPU ajoute complexité (sync, lancement, bugs). D'abord saturer une carte."
  - question: "Quel outil lance typiquement un job DDP local ?"
    choices:
      - "nvidia-smi -l 1"
      - "torchrun --nproc_per_node=N train.py"
      - "pip install torch"
    answer: 1
    explanation: "torchrun (ex-launch) démarre N processus avec les variables de rang attendues par DDP."
---

## Définition

Pour entraîner **plus vite** ou avec un **batch global** plus grand, on peut répartir le travail sur **plusieurs GPU**. PyTorch propose surtout deux approches « data parallel » :

| | **DataParallel (DP)** | **DistributedDataParallel (DDP)** |
| --- | --- | --- |
| Processus | **1** processus | **1 processus par GPU** (typique) |
| API | `nn.DataParallel(model)` | `DistributedDataParallel(model)` |
| Perf | Simple, **moins** bon scaling | **Recommandé**, bien meilleur scaling |
| Usage | Proto rapide multi-GPU mono-machine | Standard labo / prod / multi-nœuds |

Cette fiche donne l'**idée** et le **quand**, pas un tutoriel cluster complet.

## D'abord : faut-il du multi-GPU ?

Restez sur **un GPU** si :

- le modèle + batch tiennent en VRAM ;
- `nvidia-smi` montre déjà une **forte** utilisation ;
- vous déboguez encore le modèle.

Passez multi-GPU si :

- vous voulez un **batch global** plus grand (stats plus stables / throughput) ;
- un GPU est saturé et le wall-clock doit baisser ;
- le modèle est trop gros pour une carte → plutôt *model parallel* / FSDP (hors détail ici), pas seulement DP/DDP classique.

## DataParallel (aperçu)

```python
model = MonModele().cuda()
model = nn.DataParallel(model)  # utilise les GPU visibles
out = model(xb.cuda())
```

- Réplique le module, découpe le batch, rassemble souvent sur le **device 0**.
- Implémentation simple, mais goulot fréquent sur le GPU 0 et le parallélisme limité.

Utile pour un **essai** en cinq lignes. Pour un vrai run : **DDP**.

## DistributedDataParallel (idée)

Chaque **rang** (processus) :

1. voit en général **un** GPU (`CUDA_VISIBLE_DEVICES` ou `LOCAL_RANK`) ;
2. charge une **copie** du modèle ;
3. traite sa portion de données ;
4. **moyenne les gradients** avec les autres rangs (NCCL sur GPU NVIDIA) avant l'`optimizer.step()`.

Lancement local typique :

```bash
torchrun --standalone --nproc_per_node=2 train_ddp.py
```

Dans le script (schéma) :

```python
import os
import torch
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP

dist.init_process_group(backend="nccl")
local_rank = int(os.environ["LOCAL_RANK"])
torch.cuda.set_device(local_rank)

model = MonModele().to(local_rank)
model = DDP(model, device_ids=[local_rank])
# DataLoader + DistributedSampler ...
```

Points à ne pas oublier :

- **`DistributedSampler`** (ou équivalent) pour ne pas lire les mêmes samples sur chaque rang ;
- backend **`nccl`** sur GPU NVIDIA ;
- initialiser le process group **avant** d'envelopper le modèle.

## DP vs DDP : choix

| Besoin | Choix |
| --- | --- |
| Démo 2 GPU en 2 minutes | DP acceptable |
| Entraînement sérieux mono-machine | **DDP** + `torchrun` |
| Plusieurs nœuds | **DDP** (pas DP) |
| Guide perf PyTorch | **Préférer DDP** |

## Erreurs fréquentes

- Lancer DDP sans `DistributedSampler` → overfitting / data leakage entre rangs.
- Utiliser DP en prod multi-GPU « parce que c'est plus court ».
- Oublier que le **batch global** = batch local × nombre de GPU (ajuster le LR selon la pratique de l'équipe).
- Mélanger tous les GPU dans un seul process DDP « multi-device » sans suivre la doc (préférez 1 GPU / process).

## À retenir

- **Un GPU bien utilisé** d'abord ; multi-GPU ensuite.
- **DP** = simple, scaling mediocre ; **DDP** = standard performant.
- DDP = **un process par GPU**, sync des gradients (NCCL).
- Lancer avec **`torchrun`** ; sampler distribué obligatoire.
- Multi-nœuds ⇒ DDP (ou stacks dérivées), pas DataParallel.

## Sources

- [Performance tuning — efficient data-parallel backend](https://docs.pytorch.org/tutorials/recipes/recipes/tuning_guide.html).
- [DistributedDataParallel](https://docs.pytorch.org/docs/stable/generated/torch.nn.parallel.DistributedDataParallel.html).
- [DataParallel](https://docs.pytorch.org/docs/stable/generated/torch.nn.DataParallel.html).
- Fiches DevFiches associées : isolation GPU, NCCL (libs), cluster / SLURM.
