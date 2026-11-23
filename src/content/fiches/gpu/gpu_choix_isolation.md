---
title: "Choisir et isoler un GPU : CUDA_VISIBLE_DEVICES et machines partagées"
description: "Lister les cartes, aligner les indices avec nvidia-smi, masquer les autres GPU, et éviter de monopoliser une machine multi-GPU."
technology: gpu
difficulty: debutant
tags:
  - gpu
  - cuda
  - CUDA_VISIBLE_DEVICES
  - multi-gpu
  - nvidia-smi
  - pytorch
publishedAt: 2026-11-23
updatedAt: 2026-11-23
draft: false
quiz:
  - question: "Avec CUDA_VISIBLE_DEVICES=2, quel device PyTorch voit-il en général ?"
    choices:
      - "cuda:2, et les autres GPU restent visibles"
      - "Un seul GPU, nommé cuda:0, qui correspond au GPU physique 2"
      - "Aucun GPU"
    answer: 1
    explanation: "La variable filtre et réordonne. Le premier GPU listé devient l'ordinal 0 pour l'application."
  - question: "Pourquoi les indices CUDA et ceux de nvidia-smi peuvent-ils différer ?"
    choices:
      - "Parce que nvidia-smi numérote au hasard"
      - "Parce que CUDA ordonne par défaut du plus rapide au plus lent (FASTEST_FIRST), alors que nvidia-smi suit souvent le bus PCI"
      - "Parce que PyTorch ignore toujours le driver"
    answer: 1
    explanation: "CUDA_DEVICE_ORDER vaut FASTEST_FIRST par défaut. Avec PCI_BUS_ID, l'ordre rejoint celui de nvidia-smi."
  - question: "Quand faut-il définir CUDA_VISIBLE_DEVICES ?"
    choices:
      - "Après le premier torch.tensor(..., device='cuda')"
      - "Avant de lancer le processus (et avant l'init CUDA), idéalement sur la même ligne de commande"
      - "Uniquement dans nvidia-smi"
    answer: 1
    explanation: "Une fois CUDA initialisé, changer la variable dans le shell parent ne recalcule pas les devices du processus déjà lancé."
  - question: "Que recommande souvent PyTorch à la place de torch.cuda.set_device pour choisir une carte ?"
    choices:
      - "CUDA_VISIBLE_DEVICES, et des tenseurs créés avec un device explicite"
      - "Désinstaller toutes les cartes sauf une"
      - "Toujours entraîner sur cpu"
    answer: 0
    explanation: "La doc de set_device déconseille son usage courant au profit de CUDA_VISIBLE_DEVICES et d'un device explicite."
  - question: "Sur une machine partagée, que faire avant de lancer un gros entraînement ?"
    choices:
      - "Prendre tous les GPU sans regarder nvidia-smi"
      - "Regarder qui utilise déjà de la VRAM, choisir une carte libre, et s'y restreindre avec CUDA_VISIBLE_DEVICES"
      - "Exporter CUDA_VISIBLE_DEVICES vide pour forcer le multi-GPU"
    answer: 1
    explanation: "Isoler une carte libre évite l'OOM partagé et laisse les autres utilisateurs travailler."
---

## Définition

Sur une machine à **plusieurs GPU**, chaque processus CUDA voit par défaut **toutes** les cartes. Sans précaution, un script prend souvent le **device 0**, déjà occupé, ou réserve de la mémoire sur plusieurs GPU sans le vouloir.

**Isoler un GPU**, c'est faire en sorte que votre programme n'en voie qu'un (ou qu'une liste choisie). L'outil principal est la variable d'environnement **`CUDA_VISIBLE_DEVICES`**, documentée par NVIDIA.

## Voir les GPU disponibles

```bash
nvidia-smi
nvidia-smi -L
nvidia-smi --query-gpu=index,name,memory.used,memory.total,utilization.gpu --format=csv
```

Exemple de sortie de `-L` :

```text
GPU 0: NVIDIA A100-SXM4-40GB (UUID: GPU-8932f937-…)
GPU 1: NVIDIA A100-SXM4-40GB (UUID: GPU-a1b2c3d4-…)
```

Avant de lancer un job long : regarder **Memory-Usage** et les processus. Une carte à 95 % de VRAM n'est pas « libre ».

## CUDA_VISIBLE_DEVICES : filtrer et renuméroter

Définie **avant** le lancement du programme :

```bash
# Seul le GPU physique 1 est visible → pour Python, c'est cuda:0
CUDA_VISIBLE_DEVICES=1 python mon_script.py

# Deux cartes, dans cet ordre : physiques 2 puis 0 → cuda:0 et cuda:1
CUDA_VISIBLE_DEVICES=2,0 python mon_script.py

# Aucun GPU visible (force le CPU côté CUDA)
CUDA_VISIBLE_DEVICES= python mon_script.py
```

D'après la [doc CUDA](https://docs.nvidia.com/cuda/cuda-programming-guide/05-appendices/environment-variables.html) :

| Réglage | Effet |
| --- | --- |
| Non définie | Tous les GPU sont visibles |
| `2` | Seul le GPU d'indice 2 ; l'app le voit comme **0** |
| `2,1` | GPU 2 puis 1 → ordinaux **0** et **1** |
| Chaîne vide | Aucun GPU visible |
| UUID `GPU-8932f937-…` | Même filtre, plus stable que l'indice |

```bash
# Plus robuste sur un cluster où l'ordre des indices change
CUDA_VISIBLE_DEVICES=GPU-8932f937 python mon_script.py
```

### Vérifier côté PyTorch

```python
import torch

print(torch.cuda.device_count())       # nombre de GPU *visibles*
print(torch.cuda.get_device_name(0)) # nom du premier visible
x = torch.randn(2, 3, device="cuda:0")
```

Avec `CUDA_VISIBLE_DEVICES=2`, `device_count()` vaut **1** et `cuda:0` est le GPU physique 2.

## Aligner les indices avec nvidia-smi

Par défaut, CUDA peut énumérer les GPU en **`FASTEST_FIRST`** (du plus rapide au plus lent).  
`nvidia-smi`, lui, suit en général l'ordre du **bus PCI**. Les numéros peuvent donc **ne pas coincider**.

Pour que `CUDA_VISIBLE_DEVICES=0` désigne le même GPU que la ligne 0 de `nvidia-smi` :

```bash
CUDA_DEVICE_ORDER=PCI_BUS_ID CUDA_VISIBLE_DEVICES=0 python mon_script.py
```

| Variable | Valeurs utiles |
| --- | --- |
| `CUDA_DEVICE_ORDER=PCI_BUS_ID` | Ordre aligné sur `nvidia-smi` |
| `CUDA_DEVICE_ORDER=FASTEST_FIRST` | Défaut CUDA : plus rapide d'abord |

Astuce pratique : sur machine hétérogène, beaucoup d'équipes exportent toujours `PCI_BUS_ID` pour éviter les malentendus.

## Choisir un device dans le code

### Préférer le masquage + un device explicite

```bash
CUDA_DEVICE_ORDER=PCI_BUS_ID CUDA_VISIBLE_DEVICES=1 python train.py
```

```python
import torch

device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
model = model.to(device)
batch = batch.to(device)
```

Une fois isolé, **un seul** GPU est visible : `cuda:0` suffit.

### `torch.cuda.set_device`

```python
torch.cuda.set_device(0)  # device courant du thread
```

La [doc PyTorch](https://docs.pytorch.org/docs/main/generated/torch.cuda.set_device.html) **déconseille** son usage courant : mieux vaut `CUDA_VISIBLE_DEVICES` et `.to(device)`.  
`set_device` ne masque pas les autres cartes : un tenseur créé sans device explicite, ou une lib tierce, peut encore toucher un autre GPU.

### Attention à l'ordre dans le script

```python
# Trop tard si torch.cuda a déjà été initialisé plus haut
import os
os.environ["CUDA_VISIBLE_DEVICES"] = "1"  # risqué après import torch / premier tenseur CUDA
```

Définir la variable **dans le shell** (ou tout au début, avant tout appel CUDA) est plus sûr.

## Machines partagées : bonnes manières

1. **`nvidia-smi`** : quelle carte a encore de la VRAM libre ?
2. **S'y restreindre** : `CUDA_VISIBLE_DEVICES=…` pour ne pas initialiser un contexte sur le GPU 0 « par défaut ».
3. **Un job = les GPU annoncés** : ne pas laisser tourner un second script qui reprend la même carte sans le savoir.
4. **UUID** si les indices bougent entre reboots ou nœuds.

Sur un **cluster** (SLURM, etc.), le gestionnaire de jobs attribue souvent déjà les GPU (variables du type `CUDA_VISIBLE_DEVICES` ou `SLURM_STEP_GPUS`). Respecter l'allocation : ne pas viser à la main une carte d'un autre job.

Le **vrai** multi-GPU (DataParallel, DDP, une process par carte) est un autre sujet : ici on parle surtout d'**isolement** pour un entraînement mono-GPU correct.

## Erreurs fréquentes

| Symptôme | Cause probable |
| --- | --- |
| « J'ai demandé le GPU 2, le script utilise encore le 0 » | Indices CUDA ≠ `nvidia-smi` (manque `PCI_BUS_ID`), ou variable définie trop tard |
| OOM sur une carte pleine alors qu'une autre est libre | Pas de `CUDA_VISIBLE_DEVICES` : défaut = device 0 |
| `device_count()` vaut 4 alors que je voulais une carte | Variable non exportée pour ce processus |
| Deux utilisateurs se marchent dessus | Chacun sans isolation sur le même GPU 0 |

## À retenir

- **`CUDA_VISIBLE_DEVICES`** filtre les GPU et **renumérote** : le premier de la liste devient `cuda:0`.
- **`CUDA_DEVICE_ORDER=PCI_BUS_ID`** aligne les indices sur **`nvidia-smi`**.
- Définir la variable **avant** le lancement (même ligne de commande = plus sûr).
- Préférer l'isolation + `.to("cuda:0")` plutôt que de compter sur `set_device` seul.
- Sur machine partagée : regarder la VRAM libre, choisir une carte, s'y restreindre ; sur cluster, respecter l'allocation.
- Les UUID évitent les surprises quand l'ordre des indices change.

## Sources

- [CUDA environment variables — `CUDA_VISIBLE_DEVICES` / `CUDA_DEVICE_ORDER`](https://docs.nvidia.com/cuda/cuda-programming-guide/05-appendices/environment-variables.html)
- [NVIDIA deploy — CUDA_VISIBLE_DEVICES](https://docs.nvidia.com/deploy/topics/topic_5_2_1.html) (indices, UUID, MPS)
- [torch.cuda.set_device](https://docs.pytorch.org/docs/main/generated/torch.cuda.set_device.html)
- [Hugging Face — Select and order GPUs](https://huggingface.co/docs/transformers/nvidia_gpu) — exemples pratiques `PCI_BUS_ID` + `CUDA_VISIBLE_DEVICES`
