---
title: "Tenseurs sur GPU : device, .to() et copies CPU ↔ CUDA"
description: "Placer un tenseur sur cuda, comprendre les copies host/device, non_blocking et les pièges de performance courants avec PyTorch."
technology: gpu
difficulty: debutant
tags:
  - gpu
  - pytorch
  - tenseurs
  - cuda
  - device
  - performance
publishedAt: 2026-11-23
updatedAt: 2026-11-23
draft: false
quiz:
  - question: "Que fait x = x.to('cuda') sur un tenseur CPU ?"
    choices:
      - "Il renomme le tenseur sans déplacer les données"
      - "Il alloue un nouveau tenseur sur le GPU et y copie les données (opération coûteuse)"
      - "Il convertit uniquement le type en float16"
    answer: 1
    explanation: "to('cuda') copie host → device. Répéter cette copie dans une boucle ralenti fortement."
  - question: "Pourquoi éviter model.parameters()[0] + batch_cpu dans une boucle d'entraînement ?"
    choices:
      - "Parce que l'addition CPU + GPU force des copies ou une erreur de device"
      - "Parce que PyTorch refuse toujours les float"
      - "Parce que nvidia-smi devient faux"
    answer: 0
    explanation: "Tous les opérandes d'une opération doivent être sur le même device (sauf cas documentés). Sinon RuntimeError ou copies implicites coûteuses."
  - question: "À quoi sert non_blocking=True dans batch.to(device, non_blocking=True) ?"
    choices:
      - "À supprimer la nécessité d'un GPU"
      - "À ne pas bloquer le thread CPU pendant la copie vers le GPU (copie asynchrone côté hôte)"
      - "À forcer le calcul sur CPU"
    answer: 1
    explanation: "Avec non_blocking, le host n'attend pas la fin de chaque cudaMemcpy. Utile surtout avec pin_memory côté DataLoader."
  - question: "Où faut-il créer le modèle pour un entraînement GPU ?"
    choices:
      - "Sur CPU uniquement, sans jamais le déplacer"
      - "Sur le même device que les batches (souvent model.to(device) une fois)"
      - "Uniquement via nvidia-smi"
    answer: 1
    explanation: "Poids et données doivent être sur le même device. On place le modèle une fois, pas à chaque itération."
  - question: "Que renvoie torch.cuda.is_available() si aucune carte n'est utilisable ?"
    choices:
      - "True"
      - "False"
      - "None"
    answer: 1
    explanation: "False : rester sur cpu ou diagnostiquer (fiche diagnostic GPU)."
---

## Définition

Un **tenseur** PyTorch vit sur un **device** : `cpu` ou `cuda:0`, `cuda:1`, … Le GPU ne calcule que sur les tenseurs qui sont **déjà** en VRAM. Passer de la RAM à la VRAM (et l'inverse) est une **copie** : souvent le goulot oublié.

Cette fiche montre comment choisir le device, déplacer tenseurs et modèles, et éviter les copies inutiles.

## Choisir le device

```python
import torch

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(device)
```

- `"cuda"` sans indice = device courant (souvent `cuda:0`).
- Sur multi-GPU, préférer isoler avec `CUDA_VISIBLE_DEVICES` (fiche isolation) puis travailler sur `cuda:0` du processus.

## Créer directement sur le GPU

```python
x = torch.randn(1024, 1024, device=device)
y = torch.zeros(3, 224, 224, device=device, dtype=torch.float32)
```

Créer **déjà** sur `cuda` évite une copie initiale. Utile pour poids, buffers, tenseurs temporaires de calcul.

## Déplacer avec `.to()` / `.cuda()` / `.cpu()`

```python
x_cpu = torch.randn(1000, 1000)
x_gpu = x_cpu.to(device)          # copie vers GPU
x_back = x_gpu.to("cpu")          # copie vers CPU (ex. pour numpy / sauvegarde)
# équivalents fréquents :
x_gpu2 = x_cpu.cuda()             # si un GPU est dispo
x_cpu2 = x_gpu.cpu()
```

| Méthode | Effet |
| --- | --- |
| `.to(device)` / `.to("cuda")` | Copie (ou no-op si déjà sur place) |
| `.cuda()` / `.cpu()` | Raccourcis ; `.to(device)` reste le plus clair |
| `.to(dtype)` | Change le **type** (FP32 → FP16…), distinct du device |

`.to()` **renvoie** un tenseur (parfois le même objet). Il faut réaffecter : `x = x.to(device)`.

### Modèle entier

```python
model = MonReseau()
model = model.to(device)   # une fois, avant la boucle
```

Tous les paramètres et buffers suivent. Les **nouveaux** tenseurs créés dans `forward` (ex. `torch.zeros(...)` sans `device=`) peuvent retomber sur CPU : passer `device=` ou `.to(x.device)`.

## Copies et performance

Chaque `cpu → gpu` ou `gpu → cpu` coûte du temps (bus PCIe). Pièges fréquents :

1. **Copier le batch à chaque ligne** dans un traitement Python lent, au lieu d'un seul `.to(device)` par batch.
2. **`.item()` / `.cpu().numpy()`** dans une boucle chaude : synchronise le GPU et copie.
3. **Mélanger devices** : `a_cuda + b_cpu` → erreur ou comportement coûteux.
4. **Logger trop souvent** des métriques GPU → CPU à chaque step.

Pattern DataLoader (détail dans la fiche entraînement) :

```python
batch = batch.to(device, non_blocking=True)
```

`non_blocking=True` laisse le CPU continuer pendant la copie. Le gain est clair surtout si les données viennent de **mémoire épinglée** (`pin_memory=True` dans le DataLoader). Appeler `pin_memory()` à la main sur le thread principal juste avant `.to()` peut au contraire **ralentir** : la doc PyTorch le détaille.

## Vérifier où est un tenseur

```python
print(x.device)                 # cuda:0 ou cpu
print(x.is_cuda)
print(next(model.parameters()).device)
```

Avant un `loss.backward()`, modèle, entrées et cibles doivent être alignés.

## Exemple minimal

```python
import torch
import torch.nn as nn

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = nn.Linear(64, 10).to(device)
x = torch.randn(32, 64, device=device)
y = model(x)
print(y.shape, y.device)
```

## Erreurs fréquentes

| Symptôme | Cause | Action |
| --- | --- | --- |
| `Expected all tensors to be on the same device` | Mélange CPU / CUDA | `.to(device)` sur les opérandes manquants |
| Entraînement très lent malgré GPU | Copies excessives, sync (`.item()`), données pas sur GPU | Profiler transferts ; réduire sync |
| `is_available()` False | Install / driver | Fiche diagnostic / installer PyTorch CUDA |

## À retenir

- Un calcul GPU exige des tenseurs (et le modèle) sur **`cuda`**.
- `.to(device)` **copie** ; le faire **une fois** par batch / une fois pour le modèle.
- Éviter les allers-retours CPU ↔ GPU et les `.item()` dans la boucle chaude.
- `non_blocking=True` + DataLoader `pin_memory` pour chevaucher chargement et copie.
- Vérifier avec `.device` / `next(model.parameters()).device`.

## Sources

- [CUDA semantics — PyTorch](https://docs.pytorch.org/docs/stable/notes/cuda.html) — devices, code agnostique.
- [pin_memory et non_blocking](https://docs.pytorch.org/tutorials/intermediate/pinmem_nonblock.html) — copies asynchrones et pièges.
- [Performance tuning guide](https://docs.pytorch.org/tutorials/recipes/recipes/tuning_guide.html) — bonnes pratiques GPU.
- Fiches DevFiches associées : VRAM, entraînement GPU, diagnostic.
