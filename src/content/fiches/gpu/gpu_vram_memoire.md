---
title: "VRAM et mémoire GPU : comprendre, mesurer et éviter l'OOM"
description: "Distinguer VRAM allouée et réservée, lire nvidia-smi, réduire un out of memory, et choisir la taille de batch sans confondre empty_cache avec une vraie libération."
technology: gpu
difficulty: debutant
tags:
  - gpu
  - vram
  - memoire
  - oom
  - pytorch
  - nvidia-smi
  - batch-size
publishedAt: 2026-11-23
updatedAt: 2026-11-23
draft: false
quiz:
  - question: "Qu'est-ce que la VRAM ?"
    choices:
      - "La mémoire vive du processeur (CPU)"
      - "La mémoire embarquée sur la carte GPU, limitée et partagée par les processus qui l'utilisent"
      - "Le disque où sont stockés les checkpoints"
    answer: 1
    explanation: "La VRAM est sur le GPU. Quand elle est pleine, CUDA refuse de nouvelles allocations : out of memory."
  - question: "Pourquoi nvidia-smi peut-il afficher plus de mémoire « utilisée » que torch.cuda.memory_allocated() ?"
    choices:
      - "Parce que nvidia-smi est toujours faux"
      - "Parce que PyTorch garde un cache d'allocation : de la mémoire réservée n'est plus dans des tenseurs actifs"
      - "Parce que memory_allocated compte aussi le disque"
    answer: 1
    explanation: "PyTorch utilise un allocateur avec cache. memory_allocated = tenseurs ; memory_reserved / nvidia-smi incluent aussi le cache encore détenu par PyTorch."
  - question: "Que fait torch.cuda.empty_cache() ?"
    choices:
      - "Il augmente la mémoire disponible pour PyTorch en effaçant les tenseurs"
      - "Il rend au système la mémoire du cache inutilisée, visible pour d'autres applis ; les tenseurs restent alloués"
      - "Il divise la taille de batch par deux"
    answer: 1
    explanation: "La doc PyTorch le dit clairement : empty_cache ne libère pas la mémoire des tenseurs et n'augmente pas le budget PyTorch pour de nouvelles allocations."
  - question: "Premier levier simple contre un CUDA out of memory pendant l'entraînement ?"
    choices:
      - "Réduire la taille de batch"
      - "Désinstaller le NVIDIA Driver"
      - "Appeler uniquement empty_cache en boucle"
    answer: 0
    explanation: "Le batch multiplie activations et gradients en mémoire. Le réduire (ou accumuler les gradients) est le premier geste efficace."
  - question: "À quoi sert PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:128 ?"
    choices:
      - "À doubler la VRAM matérielle"
      - "À limiter le découpage de gros blocs du cache, pour réduire la fragmentation dans certains OOM"
      - "À forcer l'entraînement sur CPU"
    answer: 1
    explanation: "Option de dernier recours documentée par PyTorch : évite de fractionner les grands blocs. À tester si l'OOM s'accompagne de beaucoup de mémoire « inactive split »."
---

## Définition

La **VRAM** (*Video RAM*) est la mémoire **embarquée sur le GPU**. Les tenseurs, le modèle, les activations et une partie des buffers CUDA y vivent pendant le calcul.

Elle est :

- **limitée** (par exemple 8 Go, 24 Go, 80 Go selon la carte) ;
- **beaucoup plus rapide** d'accès pour le GPU que la RAM CPU ;
- **partagée** entre les processus qui utilisent la même carte.

Quand une allocation dépasse ce qui reste libre, CUDA lève une erreur du type **`CUDA out of memory`** (OOM).

La fiche sur la pile GPU situe la VRAM au niveau **matériel**. Ici, on regarde comment elle se remplit et comment la mesurer.

## Ce qui occupe la VRAM

Pendant un entraînement typique :

| Élément | Rôle mémoire |
| --- | --- |
| **Paramètres du modèle** | Poids (et souvent les gradients) |
| **Optimiseur** | États Adam, etc. : souvent plusieurs fois la taille des poids |
| **Activations** | Sorties intermédiaires pour le backward ; grossissent avec le **batch** et la profondeur |
| **Batch / entrées** | Images, tokens, tenseurs d'entrée sur GPU |
| **Cache de l'allocateur** | Mémoire que PyTorch garde « sous le coude » pour réallouer vite |

Règle simple : **doubler le batch** peut presque doubler (ou plus) la mémoire des activations, alors que la taille des poids change peu.

## Allouée, réservée, vue par nvidia-smi

PyTorch n'appelle pas `cudaMalloc` à chaque petit tenseur. Il utilise un **allocateur avec cache** ([CUDA semantics](https://docs.pytorch.org/docs/main/notes/cuda.html)) :

```python
import torch

# Mémoire occupée par des tenseurs vivants
print(torch.cuda.memory_allocated() / 1024**2, "MiB")

# Mémoire gérée par le cache PyTorch (tenseurs + blocs gardés)
print(torch.cuda.memory_reserved() / 1024**2, "MiB")
```

| Notion | Signification |
| --- | --- |
| `memory_allocated` | Octets réellement dans des **tenseurs** |
| `memory_reserved` | Octets **réservés** par l'allocateur PyTorch (cache inclus) |
| `nvidia-smi` → Memory-Usage | Ce que le **driver** voit comme pris sur la carte (souvent proche du réservé + contexte CUDA) |

Conséquence : `nvidia-smi` peut montrer beaucoup de VRAM « utilisée » alors que `memory_allocated` est plus bas. Ce n'est pas forcément une fuite : c'est souvent le **cache**.

### empty_cache : ce qu'il fait / ne fait pas

```python
torch.cuda.empty_cache()
```

D'après la [doc PyTorch](https://docs.pytorch.org/docs/main/generated/torch.cuda.memory.empty_cache.html) :

- il rend au système la mémoire du **cache inutilisée**, pour d'autres applications ou pour `nvidia-smi` ;
- il **ne détruit pas** les tenseurs encore référencés ;
- il **n'augmente pas** le budget mémoire disponible **pour PyTorch** lui-même.

Pour vraiment libérer de la VRAM côté PyTorch : supprimer les références (`del`, sortir de portée), éventuellement `gc.collect()`, et éviter de garder des graphes de calcul inutiles.

## Mesurer

### Avec nvidia-smi

```bash
nvidia-smi
nvidia-smi --query-gpu=index,name,memory.total,memory.used,memory.free --format=csv
# Suivi toutes les 1 s
nvidia-smi --query-gpu=memory.used,utilization.gpu --format=csv -l 1
```

Repères :

- `memory.total` : capacité de la carte ;
- `memory.used` / `memory.free` : occupé / restant **vus par le driver** ;
- la liste des processus indique **qui** tient de la VRAM.

### Avec PyTorch

```python
import torch

x = torch.randn(1024, 1024, device="cuda")
print(torch.cuda.memory_summary())
```

`memory_summary()` et `memory_stats()` aident à voir pics, fragmentation et blocs inactifs. Pour un diagnostic poussé, la doc pointe aussi les outils de trace mémoire CUDA.

## Out of memory : que faire, dans l'ordre

Message typique :

```text
torch.cuda.OutOfMemoryError: CUDA out of memory.
Tried to allocate X MiB (GPU 0; Y GiB total capacity; ...)
```

### 1. Réduire la taille de batch

C'est le levier le plus simple et le plus efficace.

```python
# Avant
loader = DataLoader(dataset, batch_size=64)
# Après
loader = DataLoader(dataset, batch_size=16)
```

Si vous voulez garder un « batch effectif » grand : **gradient accumulation** (plusieurs petits pas avant `optimizer.step()`).

### 2. Libérer ce qui n'est plus utile

```python
loss.backward()
optimizer.step()
optimizer.zero_grad(set_to_none=True)  # évite de garder d'anciens tenseurs de gradient
```

Éviter de stocker toutes les pertes ou activations sur GPU « pour plus tard » sans besoin.

### 3. Mixed precision (aperçu)

L'entraînement en **FP16 / BF16** (AMP) réduit souvent la VRAM des activations et accélère le calcul sur GPU récents. À traiter en détail dans une fiche dédiée ; l'idée : moins d'octets par valeur → plus de marge mémoire.

### 4. Autres leviers courants

| Levier | Effet |
| --- | --- |
| Modèle plus petit / moins de couches | Moins de poids et d'activations |
| Images / séquences plus courtes | Moins d'activations |
| `torch.no_grad()` en inférence | Pas de graphe pour le backward |
| Une seule carte dédiée | Éviter de partager la VRAM avec un autre job (`CUDA_VISIBLE_DEVICES`) |
| Checkpointing d'activations | Moins de VRAM, plus de calcul (recompute) |

### 5. Fragmentation : dernier recours

Si l'OOM survient alors qu'il semble rester de la mémoire, et que les stats montrent beaucoup de blocs **inactive split**, PyTorch documente :

```bash
export PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:128
```

(`PYTORCH_ALLOC_CONF` est le nom actuel ; `PYTORCH_CUDA_ALLOC_CONF` reste accepté.)  
Cela limite le découpage des gros blocs du cache. À utiliser en **dernier recours** : le coût perf dépend du programme.

## Batch size : intuition

La VRAM d'entraînement ressemble souvent à :

```text
mémoire ≈ poids + états optimiseur + (coût par exemple × taille de batch)
```

- baisser le batch → baisse surtout le terme **× batch** ;
- un modèle énorme peut OOM même avec `batch_size=1` : là, il faut d'autres leviers (précision, checkpointing, autre carte).

En **inférence**, pas d'optimiseur ni (souvent) de gradients : on peut en général monter le batch plus haut qu'à l'entraînement, à VRAM égale.

## Bonnes pratiques

- Surveiller **pendant** un run : un terminal `nvidia-smi -l 1` à côté du script.
- Distinguer **fuite** (la courbe ne redescend jamais) et **cache** (réservé haut, allocated plus bas).
- Sur machine partagée : vérifier qu'un autre processus n'a pas déjà pris 90 % de la VRAM.
- Noter le `batch_size` qui passe sur **cette** carte : il dépend du modèle, de la résolution et des autres jobs.

## À retenir

- La **VRAM** est la mémoire limitée du GPU ; l'OOM arrive quand une allocation ne tient plus.
- `memory_allocated` ≠ `nvidia-smi` : PyTorch **réserve** un cache ; `empty_cache` ne libère pas les tenseurs.
- Premier levier anti-OOM : **réduire le batch** (ou accumuler les gradients).
- Mesurer avec `nvidia-smi` et `torch.cuda.memory_*` ; agir sur références, précision, taille d'entrée.
- `max_split_size_mb` : option avancée contre la **fragmentation**, pas un substitut à un batch trop grand.

## Sources

- [PyTorch CUDA semantics — Memory management](https://docs.pytorch.org/docs/main/notes/cuda.html) — cache, allocated / reserved, `empty_cache`, `PYTORCH_ALLOC_CONF`.
- [torch.cuda.memory_allocated](https://docs.pytorch.org/docs/main/generated/torch.cuda.memory.memory_allocated.html) et [empty_cache](https://docs.pytorch.org/docs/main/generated/torch.cuda.memory.empty_cache.html).
- [nvidia-smi](https://docs.nvidia.com/deploy/nvidia-smi/) — observation de la mémoire côté driver.
