---
title: "Profiler un run GPU : utilisation, CPU-bound et goulots"
description: "Lire nvidia-smi, distinguer GPU bound et CPU bound, chronométrer correctement avec synchronize, et repérer où le temps part vraiment."
technology: gpu
difficulty: debutant
tags:
  - gpu
  - profiling
  - nvidia-smi
  - performance
  - pytorch
  - goulot
publishedAt: 2026-11-23
updatedAt: 2026-11-23
draft: false
quiz:
  - question: "nvidia-smi montre utilization.gpu à 5–15 % pendant l'entraînement. Interprétation la plus probable ?"
    choices:
      - "Le GPU calcule à plein régime"
      - "Le GPU attend souvent (données, CPU, sync) : run plutôt CPU-bound ou I/O-bound"
      - "Le driver est forcément cassé"
    answer: 1
    explanation: "Une faible utilisation indique que le GPU n'est pas alimenté en continu, pas qu'il est « trop rapide »."
  - question: "Pourquoi time.time() autour d'un kernel CUDA sans synchronize peut mentir ?"
    choices:
      - "Parce que CUDA est synchrone par défaut pour le CPU"
      - "Parce que le CPU envoie le travail au GPU et continue : le chronomètre s'arrête avant la fin du calcul GPU"
      - "Parce que nvidia-smi remplace time"
    answer: 1
    explanation: "Les lancements CUDA sont asynchrones. Il faut torch.cuda.synchronize() (ou des events) pour mesurer le vrai temps GPU."
  - question: "Memory-Usage élevé + utilisation GPU basse : situation typique ?"
    choices:
      - "Impossible"
      - "Beaucoup de VRAM réservée / modèle chargé, mais peu de kernels en cours (attente données ou idle)"
      - "Preuve que FP64 est actif"
    answer: 1
    explanation: "VRAM occupée ≠ GPU qui calcule. Le cache PyTorch et un modèle chargé remplissent la mémoire sans saturer les SM."
  - question: "Premier levier si le DataLoader est le goulot ?"
    choices:
      - "Acheter une deuxième carte sans changer le code"
      - "num_workers, pin_memory, moins de prétraitement Python lent, stockage plus rapide"
      - "Désinstaller le driver"
    answer: 1
    explanation: "Nourrir le GPU : paralléliser et accélérer le chemin données → device."
  - question: "À quoi sert nvidia-smi -l 1 pendant un run ?"
    choices:
      - "À compiler le modèle"
      - "À rafraîchir périodiquement utilisation et mémoire pour voir le comportement en direct"
      - "À fixer CUDA_VISIBLE_DEVICES"
    answer: 1
    explanation: "-l 1 interroge les GPU toutes les secondes : utile pour voir les pics et les creux."
---

## Définition

**Profiler**, ici, c'est répondre : *où passe le temps ?* Le GPU peut être saturé (**GPU-bound**), ou attendre données / CPU / copies (**CPU-bound** / **I/O-bound**). Sans mesure, on « optimise » au mauvais endroit.

Cette fiche donne des outils **simples** : `nvidia-smi`, lecture d'utilisation, chronométrage correct, checklist de goulots. Les traceurs avancés (Nsight, PyTorch Profiler) sont cités en ouverture.

## Lire nvidia-smi en direct

```bash
nvidia-smi
nvidia-smi --query-gpu=index,name,utilization.gpu,utilization.memory,memory.used,memory.total --format=csv -l 1
```

| Champ | Lecture utile |
| --- | --- |
| `utilization.gpu` | % de temps récent où un kernel tourne sur le GPU |
| `utilization.memory` | Activité du contrôleur mémoire (pas « % de VRAM pleine ») |
| `memory.used` | VRAM occupée vue par le driver |
| Processus | Qui tient la carte |

Interprétations courantes :

- **Utilisation haute (70–100 %)** + débit stable → souvent GPU-bound (ou proche).
- **Utilisation basse** + step lent → le GPU **attend** : DataLoader, Python, sync, I/O.
- **VRAM pleine** + utilisation basse → modèle chargé / cache, mais peu de calcul en cours.

## GPU-bound vs CPU-bound

```text
[Disque / Dataset] → [CPU workers] → [pin + copie PCIe] → [Kernels GPU] → [éventuel retour CPU]
```

| Zone lente | Signes | Pistes |
| --- | --- | --- |
| Dataset / disque | GPU idle, disque actif | Cache local, format plus rapide, moins d'augments lourds |
| CPU Python | 1 cœur à 100 %, GPU bas | Vectoriser, moins de `.item()`, `num_workers` |
| Copie PCIe | Transferts gros / fréquents | `pin_memory`, `non_blocking`, moins de sync |
| Kernels GPU | utilisation haute | Batch, AMP, modèle / ops plus efficaces |

## Chronométrer correctement

Les kernels CUDA sont **asynchrones** : le CPU peut « finir » le `forward` avant que le GPU ait terminé.

```python
import time
import torch

torch.cuda.synchronize()
t0 = time.perf_counter()

# ... travail GPU ...
out = model(x)

torch.cuda.synchronize()
dt = time.perf_counter() - t0
print(f"{dt * 1e3:.2f} ms")
```

Alternative propre : `torch.cuda.Event` (record / elapsed_time) pour mesurer sur le flux CUDA.

Sans `synchronize`, vous chronométrez surtout la **file d'attente** côté host.

## Checklist rapide pendant un entraînement

1. Lancer `nvidia-smi -l 1` dans un autre terminal.
2. Noter `utilization.gpu` et `memory.used` en régime.
3. Si GPU bas → augmenter `num_workers` / `pin_memory`, réduire le travail Python par sample.
4. Si GPU haut mais trop lent → batch / AMP / architecture (fiche entraînement, précision).
5. Si OOM → fiche VRAM (réduire batch, etc.).
6. Vérifier qu'on est sur la **bonne carte** (`CUDA_VISIBLE_DEVICES`, fiche isolation).

## Outils plus poussés (aperçu)

| Outil | Usage |
| --- | --- |
| [PyTorch Profiler](https://docs.pytorch.org/docs/stable/profiler.html) | Ops CPU/GPU, TensorBoard / chrome trace |
| NVIDIA Nsight Systems / Compute | Timeline système et kernels |
| `torch.cuda.memory_summary()` | Pic mémoire et fragmentation |

Pour débuter, `nvidia-smi` + un chrono synchronisé suffisent souvent à orienter.

## Erreurs fréquentes

- Croire que « VRAM utilisée = GPU qui travaille ».
- Chronométrer sans `synchronize`.
- Optimiser le modèle alors que le DataLoader est le goulot.
- Profiler sur un nœud de login au lieu du nœud de calcul.

## À retenir

- **Utilisation GPU basse** → souvent attente données / CPU, pas « GPU trop faible ».
- **Utilisation haute** → optimiser calcul (batch, AMP, modèle).
- Chronométrer CUDA avec **`synchronize`** ou des **Events**.
- Séparer mémoire pleine et GPU actif.
- `nvidia-smi -l 1` est le premier instrument de bord.

## Sources

- [nvidia-smi](https://docs.nvidia.com/deploy/nvidia-smi/) — champs utilisation et mémoire.
- [CUDA semantics — PyTorch](https://docs.pytorch.org/docs/stable/notes/cuda.html) — asynchronisme.
- [PyTorch Profiler](https://docs.pytorch.org/docs/stable/profiler.html).
- [Performance tuning guide](https://docs.pytorch.org/tutorials/recipes/recipes/tuning_guide.html).
- Fiches DevFiches associées : entraînement GPU, VRAM, isolation.
