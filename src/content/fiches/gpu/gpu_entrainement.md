---
title: "Entraîner sur GPU : DataLoader, pin_memory et mixed precision (AMP)"
description: "Brancher un entraînement PyTorch sur CUDA : batches sur device, pin_memory, non_blocking, et introduction à autocast / GradScaler."
technology: gpu
difficulty: debutant
tags:
  - gpu
  - pytorch
  - entrainement
  - dataloader
  - amp
  - pin-memory
publishedAt: 2026-11-23
updatedAt: 2026-11-23
draft: false
quiz:
  - question: "Que fait pin_memory=True dans un DataLoader ?"
    choices:
      - "Il place automatiquement le modèle sur le GPU"
      - "Il met les tenseurs du batch en mémoire CPU épinglée, pour accélérer les copies vers le GPU"
      - "Il divise la VRAM par deux"
    answer: 1
    explanation: "La doc DataLoader : les copies host→GPU sont plus rapides depuis de la mémoire page-locked."
  - question: "Où placer model.to(device) dans un script d'entraînement ?"
    choices:
      - "À chaque itération, après loss.backward()"
      - "Une fois, avant la boucle d'epochs"
      - "Uniquement dans nvidia-smi"
    answer: 1
    explanation: "Le modèle reste sur le GPU ; seuls les batches se déplacent à chaque step."
  - question: "Dans le schéma AMP courant en FP16, à quoi sert GradScaler ?"
    choices:
      - "À scaler la loss pour éviter underflow des gradients en FP16, puis à déscaler avant l'update"
      - "À choisir le numéro de GPU"
      - "À remplacer l'optimiseur Adam"
    answer: 0
    explanation: "autocast accélère le forward ; GradScaler stabilise le backward FP16."
  - question: "Faut-il appeler model.half() soi-même quand on utilise torch.autocast ?"
    choices:
      - "Oui, toujours, sinon AMP ne fonctionne pas"
      - "Non : la doc déconseille half()/bfloat16() manuel sur modèle et entrées sous autocast"
      - "Uniquement sur le DataLoader"
    answer: 1
    explanation: "autocast choisit les dtypes par op. Forcer half() à la main est une autre stratégie."
  - question: "num_workers > 0 sert surtout à…"
    choices:
      - "Multiplier le nombre de GPU"
      - "Charger et préparer les données en parallèle sur CPU pendant que le GPU calcule"
      - "Désactiver CUDA"
    answer: 1
    explanation: "Des workers évitent que le GPU attende le chargement disque / CPU."
---

## Définition

Entraîner « sur GPU », ce n'est pas seulement `model.cuda()`. Il faut : placer le **modèle** une fois, envoyer chaque **batch** sur le device, garder le CPU occupé à préparer la suite, et optionnellement utiliser la **mixed precision** (AMP) pour aller plus vite et consommer moins de VRAM.

Les bases device / `.to()` sont dans la fiche tenseurs GPU. Ici : la **boucle** d'entraînement.

## Squelette minimal

```python
import torch
from torch import nn
from torch.utils.data import DataLoader

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = MonModele().to(device)
opt = torch.optim.Adam(model.parameters(), lr=1e-3)
loss_fn = nn.CrossEntropyLoss()

loader = DataLoader(
    dataset,
    batch_size=64,
    shuffle=True,
    num_workers=4,
    pin_memory=(device.type == "cuda"),
)

model.train()
for xb, yb in loader:
    xb = xb.to(device, non_blocking=True)
    yb = yb.to(device, non_blocking=True)

    opt.zero_grad(set_to_none=True)
    logits = model(xb)
    loss = loss_fn(logits, yb)
    loss.backward()
    opt.step()
```

Points clés :

1. **`model.to(device)`** une fois.
2. **`batch.to(device)`** à chaque itération.
3. **`pin_memory=True`** si CUDA : DataLoader prépare des buffers épinglés.
4. **`non_blocking=True`** : le thread principal n'attend pas chaque copie.
5. **`num_workers`** : parallélise le chargement (valeur typique : quelques CPU ; trop peut saturer la RAM).

## pin_memory et non_blocking

D'après la doc PyTorch :

- Les copies **host → GPU** sont plus rapides depuis de la mémoire **épinglée**.
- `DataLoader(..., pin_memory=True)` le fait pour les tenseurs du batch.
- `to(device, non_blocking=True)` évite de bloquer le CPU à chaque transfert.

Ne pas confondre avec appeler `tensor.pin_memory()` à la main juste avant `.to()` dans la boucle : cela peut **annuler** le gain. Laisser le DataLoader gérer le pinning.

## Mixed precision (AMP) — introduction

**AMP** (*Automatic Mixed Precision*) exécute certaines ops en **FP16** ou **BF16**, d'autres en FP32. Objectifs : plus de débit, moins de VRAM, précision globale acceptable.

API actuelle recommandée : `torch.autocast` et `torch.amp.GradScaler` (les anciens `torch.cuda.amp.*` sont dépréciés).

```python
scaler = torch.amp.GradScaler("cuda")

for xb, yb in loader:
    xb = xb.to(device, non_blocking=True)
    yb = yb.to(device, non_blocking=True)
    opt.zero_grad(set_to_none=True)

    with torch.autocast(device_type="cuda", dtype=torch.float16):
        logits = model(xb)
        loss = loss_fn(logits, yb)

    scaler.scale(loss).backward()
    scaler.step(opt)
    scaler.update()
```

| Élément | Rôle |
| --- | --- |
| `autocast` | Choisit FP16/BF16/FP32 **par opération** dans le forward (+ loss) |
| `GradScaler` | Nécessaire surtout en **FP16** pour éviter l'underflow des gradients |
| **BF16** | Souvent sans scaler (meilleure gamme dynamique) ; besoin d'une carte qui le gère bien (Ampere+) |

Ne pas appeler `model.half()` en plus d'`autocast`. Sortir d'`autocast` **avant** `backward` dans le schéma standard.

Détail FP16 / BF16 / quantization : fiche précision GPU.

## Quand le GPU attend (aperçu)

Si `nvidia-smi` montre une **faible** utilisation GPU :

- `num_workers=0` et chargement disque lent ;
- trop de travail Python entre deux batches ;
- batch trop petit (GPU sous-alimenté) ;
- sync fréquentes (`.item()`, prints, trop de `synchronize`).

La fiche profiler développe ces goulots.

## Erreurs fréquentes

| Symptôme | Cause | Action |
| --- | --- | --- |
| OOM dès les premiers steps | Batch / modèle trop gros | Réduire batch ; AMP ; fiche VRAM |
| Devices mélangés | Oubli de `.to(device)` sur cibles ou aux | Aligner tous les tenseurs |
| AMP instable (loss NaN) | FP16 sans scaler, ou LR trop fort | GradScaler ; tester BF16 ; baisser LR |
| GPU à 0–10 % | DataLoader / CPU bound | `num_workers`, `pin_memory`, profiler |

## À retenir

- Modèle **une fois** sur GPU ; batches **à chaque step**.
- `pin_memory` + `non_blocking` + `num_workers` pour nourrir le GPU.
- AMP = `autocast` (+ `GradScaler` en FP16) pour vitesse et VRAM.
- Ne pas forcer `half()` en plus d'`autocast`.
- Faible utilisation GPU → regarder le chargement de données avant d'accuser CUDA.

## Sources

- [torch.utils.data — Memory pinning](https://docs.pytorch.org/docs/main/utils/data.html) — `pin_memory` du DataLoader.
- [pin_memory et non_blocking](https://docs.pytorch.org/tutorials/intermediate/pinmem_nonblock.html).
- [torch.amp](https://docs.pytorch.org/docs/main/amp.html) et [exemples AMP](https://docs.pytorch.org/docs/main/notes/amp_examples.html).
- [Performance tuning guide](https://docs.pytorch.org/tutorials/recipes/recipes/tuning_guide.html).
- Fiches DevFiches associées : tenseurs GPU, VRAM, profiler, précision.
