---
title: "Précisions GPU : FP16, BF16, TF32 et aperçu de la quantification"
description: "Comparer les formats flottants utilisés en deep learning, l'impact VRAM/vitesse, AMP, et situer la quantification INT8 sans tout couvrir."
technology: gpu
difficulty: intermediaire
tags:
  - gpu
  - fp16
  - bf16
  - amp
  - quantization
  - precision
  - pytorch
publishedAt: 2026-11-23
updatedAt: 2026-11-23
draft: false
quiz:
  - question: "Quel est un avantage principal du FP16 / BF16 vs FP32 pour l'entraînement ?"
    choices:
      - "Doubler la VRAM matérielle"
      - "Réduire la mémoire et souvent accélérer grâce aux Tensor Cores"
      - "Supprimer le besoin de gradients"
    answer: 1
    explanation: "Moins d'octets par valeur + chemins Tensor Core sur les cartes compatibles."
  - question: "Différence clé FP16 vs BF16 ?"
    choices:
      - "Aucune"
      - "BF16 garde une gamme d'exposants proche du FP32 (plus stable), FP16 a plus de mantisse mais underflow plus facile"
      - "FP16 n'existe que sur CPU"
    answer: 1
    explanation: "BF16 ≈ exposant FP32 ; FP16 nécessite souvent un GradScaler en entraînement."
  - question: "TF32 sur Ampere+, en résumé ?"
    choices:
      - "Un format d'affichage HTML"
      - "Un mode matmul qui utilise une mantisse tronquée pour aller plus vite tout en exposant type FP32"
      - "Un remplacement de NCCL"
    answer: 1
    explanation: "TensorFloat-32 : compromis vitesse/précision sur Tensor Cores Ampere+."
  - question: "La quantification INT8 sert surtout à…"
    choices:
      - "Compiler le driver"
      - "Réduire taille et coût d'inférence (parfois entraînement) en représentant poids/activations sur moins de bits"
      - "Augmenter la CC d'une carte"
    answer: 1
    explanation: "Quantization = moins de bits ; typiquement déploiement / inférence."
  - question: "Sous autocast FP16, GradScaler sert à…"
    choices:
      - "Choisir le GPU physique"
      - "Limiter l'underflow des gradients en scalant la loss"
      - "Remplacer DataLoader"
    answer: 1
    explanation: "Voir fiche entraînement / doc torch.amp."
---

## Définition

Les réseaux ne tournent pas qu'en **FP32**. Des formats plus étroits (**FP16**, **BF16**, **TF32**, **FP8**, **INT8**…) réduisent la **VRAM** et exploitent les **Tensor Cores**, au prix d'une précision numérique à surveiller.

Cette fiche donne le **vocabulaire** et les usages typiques. L'AMP pratique est dans la fiche entraînement GPU.

## Formats courants

| Format | Taille | Idée | Usage typique |
| --- | --- | --- | --- |
| **FP32** | 4 o | Référence stable | Poids master, accumulations |
| **FP16** | 2 o | Moins de dynamique d'exposant | AMP + **GradScaler** |
| **BF16** | 2 o | Exposant ≈ FP32, moins de mantisse | AMP souvent **sans** scaler (Ampere+) |
| **TF32** | (mode matmul) | Mantisse réduite, exposant FP32 | Accélération matmul Ampere+ en « FP32 » |
| **FP8** | 1 o | Très compact | Hopper+ / libs récentes (entraînement ou inférence selon stack) |
| **INT8** (etc.) | 1 o | Entier quantifié | Surtout **inférence** / déploiement |

Les types exacts disponibles dépendent de la **compute capability** (fiche CC).

## Impact VRAM et vitesse

- Passer activations / poids en 16 bits ≈ **÷2** sur ces tenseurs (ordre de grandeur ; l'optimiseur FP32 peut rester lourd).
- Tensor Cores : matmuls nettement plus rapides en FP16/BF16/TF32 selon la carte.
- Ce n'est **pas** magique : goulot DataLoader, trop petit batch, ou modèle memory-bound peuvent masquer le gain (fiche profiler).

## AMP : rappel orienté précision

```python
# FP16
with torch.autocast(device_type="cuda", dtype=torch.float16):
    ...
# BF16 (si supporté)
with torch.autocast(device_type="cuda", dtype=torch.bfloat16):
    ...
```

| | FP16 | BF16 |
| --- | --- | --- |
| Vitesse / mémoire | Oui | Oui |
| GradScaler | Souvent **oui** | Souvent **non** |
| Support matériel | Large (Tensor Cores 7.5+) | Surtout Ampere+ |

Ne pas faire `model.half()` **en plus** d'`autocast` (sauf stratégie manuelle consciente).

## TF32 (Ampere+)

PyTorch peut utiliser TF32 pour certains matmuls FP32. Contrôles typiques :

```python
torch.backends.cuda.matmul.allow_tf32 = True   # souvent déjà True selon version
torch.backends.cudnn.allow_tf32 = True
```

Utile à connaître si vous comparez des résultats numériques « FP32 » entre générations de GPU.

## Quantification (aperçu)

**Quantifier**, c'est représenter poids (et parfois activations) sur moins de bits (**INT8**, INT4, etc.) pour :

- réduire la taille du modèle ;
- accélérer l'**inférence** sur matériel compatible.

Ce n'est pas le même outil qu'AMP (entraînement mixte). Pistes PyTorch : `torch.ao.quantization`, backends dynamiques / statiques, ou stacks type bitsandbytes / AWQ pour les LLM (écosystème qui évolue vite).

Pour débuter : maîtriser **FP16/BF16 + AMP** avant la quantization avancée.

## Quand quoi choisir ?

| Situation | Piste |
| --- | --- |
| Entraînement, carte Ampere+, stabilité | **BF16** autocast |
| Carte plus ancienne / recette classique | **FP16** + GradScaler |
| OOM | AMP + batch ↓ (fiche VRAM) |
| Déploiement latence / taille | Quantification INT8 (après validation qualité) |

## À retenir

- FP16 / BF16 : moins de mémoire, plus de débit Tensor Core.
- **BF16** plus stable en exposant ; **FP16** → GradScaler.
- **TF32** accélère des matmuls « FP32 » sur Ampere+.
- **Quantization** = surtout inférence / compression, distincte d'AMP.
- Le support dépend de la **CC** et des libs.

## Sources

- [torch.amp](https://docs.pytorch.org/docs/main/amp.html).
- [CUDA Tensor Core types / CC](https://docs.nvidia.com/cuda/cuda-programming-guide/05-appendices/compute-capabilities.html).
- [PyTorch quantization](https://docs.pytorch.org/docs/stable/quantization.html) — porte d'entrée.
- Fiches DevFiches associées : entraînement GPU, VRAM, compute capability.
