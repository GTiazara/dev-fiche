---
title: "La pile GPU NVIDIA : application, CUDA, driver et outils à connaître"
description: "Comparer les couches Application, CUDA, NVIDIA Driver et GPU, puis utiliser nvidia-smi, NVML et les notions de compatibilité avant de lancer PyTorch ou TensorFlow."
technology: gpu
difficulty: debutant
tags:
  - gpu
  - cuda
  - nvidia
  - nvidia-smi
  - nvml
  - pytorch
  - driver
publishedAt: 2026-11-23
updatedAt: 2026-11-23
draft: false
quiz:
  - question: "Dans la pile NVIDIA, quel composant doit toujours être installé sur la machine pour utiliser le GPU ?"
    choices:
      - "Le CUDA Toolkit complet avec nvcc"
      - "Le NVIDIA Driver"
      - "cuDNN uniquement"
    answer: 1
    explanation: "Le driver est la couche système qui parle au GPU. Sans lui, ni CUDA ni PyTorch ne peuvent utiliser la carte. Le Toolkit, lui, sert surtout à compiler ou à fournir des bibliothèques de développement."
  - question: "Que signifie la ligne « CUDA Version: 12.x » affichée par nvidia-smi ?"
    choices:
      - "Qu'un CUDA Toolkit 12.x est forcément installé et utilisé par PyTorch"
      - "La version maximale de CUDA que le driver installé peut faire tourner"
      - "La version exacte des bibliothèques embarquées dans PyTorch"
    answer: 1
    explanation: "nvidia-smi rapporte la capacité du driver (User Mode Driver). PyTorch peut embarquer une autre runtime CUDA, tant qu'elle reste compatible avec ce driver."
  - question: "Pour seulement exécuter un binaire PyTorch avec GPU, que faut-il en général ?"
    choices:
      - "Un NVIDIA Driver compatible, puis un PyTorch compilé pour CUDA"
      - "Toujours installer le CUDA Toolkit et compiler PyTorch soi-même"
      - "Uniquement cuDNN, sans driver"
    answer: 0
    explanation: "Les roues PyTorch embarquent souvent runtime CUDA et libs mathématiques. Il faut un driver assez récent ; le Toolkit complet n'est pas obligatoire pour seulement exécuter."
  - question: "À quoi sert NVML, et quel outil courant s'appuie dessus ?"
    choices:
      - "À compiler les kernels CUDA ; l'outil est nvcc"
      - "À surveiller et gérer le GPU ; l'outil courant est nvidia-smi"
      - "À choisir la précision FP16 ; l'outil est cuDNN"
    answer: 1
    explanation: "NVML (NVIDIA Management Library) expose l'état du GPU. nvidia-smi est l'outil en ligne de commande construit dessus."
  - question: "Que fait CUDA_VISIBLE_DEVICES=1 avant de lancer un script ?"
    choices:
      - "Il force l'utilisation de tous les GPU"
      - "Il rend visible seulement le GPU d'indice 1, qui devient le device 0 pour l'application"
      - "Il met à jour le NVIDIA Driver"
    answer: 1
    explanation: "La variable filtre et réordonne les GPU visibles. Avec =1, l'application ne voit qu'une carte, numérotée 0 en interne."
---

## Définition

Avant d'entraîner un modèle sur GPU, il faut distinguer **plusieurs couches**. Elles ne s'installent pas toutes de la même façon, et confondre « CUDA de nvidia-smi » avec « CUDA de PyTorch » est l'erreur la plus fréquente.

Pile simplifiée :

```text
Application
(PyTorch / TensorFlow / votre code)
        |
        v
CUDA (runtime + libs : cuBLAS, cuDNN, …)
        |
        v
NVIDIA Driver
        |
        v
GPU NVIDIA (matériel)
```

Chaque flèche signifie « s'appuie sur la couche du dessous ». Si le bas manque ou est trop vieux, le haut échoue.

## Comparer les composants

| Composant | Rôle | Installé comment ? | Comment le vérifier |
| --- | --- | --- | --- |
| **GPU** | Matériel : calcul parallèle, mémoire VRAM | Présent dans la machine / le nœud | `nvidia-smi`, `nvidia-smi -L` |
| **NVIDIA Driver** | « Système d'exploitation » du GPU : parle au matériel | Paquet système (ou installateur NVIDIA) | `nvidia-smi` → `Driver Version` |
| **CUDA Toolkit** | Outils et libs pour **développer** (headers, `nvcc`, samples) | Optionnel pour seulement *exécuter* PyTorch | `nvcc --version` (absent si pas de Toolkit) |
| **CUDA Runtime** | Bibliothèques pour **exécuter** du code CUDA | Souvent embarquée dans PyTorch / TF | Version liée au paquet Python, pas forcément à `nvcc` |
| **Libs accélérées** | cuBLAS (algèbre), cuDNN (réseaux de neurones), etc. | Toolkit, ou roues `nvidia-*` avec PyTorch | Docs / dépendances du framework |
| **Application** | Votre script, PyTorch, TensorFlow | `pip` / `conda` / image Docker | `python -c "import torch; print(torch.cuda.is_available())"` |

### Driver vs CUDA Toolkit

D'après la [documentation CUDA](https://docs.nvidia.com/cuda/cuda-programming-guide/01-introduction/cuda-platform.html) :

- le **driver** est obligatoire pour tout usage GPU (affichage, Vulkan, CUDA) ;
- le **Toolkit** est un produit **séparé** : libs, headers, outils d'analyse et de compilation.

Pour **seulement lancer** PyTorch avec GPU, un driver compatible suffit en général : les binaires PyTorch embarquent leur runtime CUDA et des libs. Pour **compiler** une extension CUDA ou reconstruire PyTorch, il faut le Toolkit (`nvcc`).

En pratique, avec PyTorch ou TensorFlow, vous n'appelez pas CUDA à la main : le framework le fait pour vous. L'important est que le **driver** soit assez récent pour la runtime CUDA embarquée dans le paquet.

## nvidia-smi et NVML

**NVML** (*NVIDIA Management Library*) est la bibliothèque C pour **surveiller et gérer** les GPU.  
**nvidia-smi** (aussi appelé NVSMI) est l'outil en ligne de commande construit dessus. La [doc nvidia-smi](https://docs.nvidia.com/deploy/nvidia-smi/) le rappelle : pour un outil durable, préférer NVML (ou les bindings Python) plutôt que de parser la sortie textuelle de `nvidia-smi`, qui n'est pas garantie stable.

Commandes utiles :

```bash
nvidia-smi
nvidia-smi -L
nvidia-smi --query-gpu=name,driver_version,memory.total,compute_cap --format=csv
```

Lire la sortie :

| Champ | Signification |
| --- | --- |
| `Driver Version` | Version du NVIDIA Driver installé |
| `CUDA Version` | **Version maximale de CUDA supportée par ce driver**, pas la preuve qu'un Toolkit est installé |
| Mémoire / processus | VRAM utilisée et programmes qui occupent le GPU |

Piège classique (confirmé côté [PyTorch Discuss](https://discuss.pytorch.org/t/what-is-the-interplay-between-the-nvidia-driver-and-cuda/217811)) : `nvidia-smi` affiche `CUDA Version: 12.4` alors que votre PyTorch tourne avec une runtime 12.6 embarquée. Les deux peuvent coexister si le **driver** est assez récent pour la runtime utilisée.

## Autres notions à connaître avant d'utiliser le GPU

### Compute capability

Chaque GPU a une **compute capability** (ex. `8.0`, `8.9`, `9.0`) : elle indique les fonctionnalités matérielles (Tensor Cores, précisions, etc.). Ce n'est **pas** la version du driver.

```bash
nvidia-smi --query-gpu=name,compute_cap --format=csv
```

La table officielle : [CUDA GPU Compute Capability](https://developer.nvidia.com/cuda/gpus).

### Bibliothèques « CUDA-X » : PyTorch s'en sert pour vous

| Lib | Rôle | Exemple concret |
| --- | --- | --- |
| **cuBLAS** | Algèbre linéaire sur GPU | Un `torch.matmul` ou une couche linéaire passe souvent par cuBLAS |
| **cuDNN** | Primitives de réseaux de neurones | Une convolution `nn.Conv2d` s'appuie souvent sur cuDNN |
| **cuFFT**, **NCCL**, … | Transformées ; communication multi-GPU | Entraînement sur plusieurs cartes |

Vous n'importez en général **ni cuBLAS ni cuDNN** dans votre script. Ils arrivent avec le Toolkit ou, plus souvent, avec les roues `nvidia-*` installées en même temps que PyTorch. Leur version doit rester compatible avec la runtime CUDA et le driver : voir la [matrice cuDNN](https://docs.nvidia.com/deeplearning/cudnn/backend/latest/reference/support-matrix.html).

### Choisir un GPU : `CUDA_VISIBLE_DEVICES`

Avant de lancer le processus :

```bash
# Seul le GPU physique 1 est visible ; pour l'app, il devient le device 0
CUDA_VISIBLE_DEVICES=1 python mon_script.py
```

Documenté dans la [guide CUDA](https://docs.nvidia.com/cuda/cuda-programming-guide/05-appendices/environment-variables.html) : la variable filtre et **réordonne** les GPU visibles.

### Vérifier depuis Python (PyTorch)

```python
import torch

print(torch.cuda.is_available())
print(torch.version.cuda)          # runtime CUDA liée à ce binaire PyTorch
print(torch.cuda.get_device_name(0))
```

Si `nvidia-smi` fonctionne mais `torch.cuda.is_available()` est faux, causes fréquentes : binaire PyTorch **CPU-only**, ou **driver trop vieux** pour la runtime CUDA du paquet PyTorch.

## Ordre de mise en place recommandé

1. **Matériel** : un GPU NVIDIA reconnu (`nvidia-smi` répond).
2. **Driver** : version compatible avec la CUDA que vous voulez utiliser (table de compatibilité NVIDIA).
3. **Framework** : installer PyTorch / TensorFlow **avec** support CUDA adapté au driver (pas forcément le Toolkit complet).
4. **Contrôle** : `nvidia-smi`, puis un petit tenseur CUDA dans Python.
5. **Toolkit** : seulement si vous compilez du CUDA ou des extensions.

## Je vois l'erreur X → c'est la couche Y

| Symptôme | Couche à suspecter | Que faire |
| --- | --- | --- |
| `nvidia-smi: command not found` ou aucun GPU listé | **Driver** / matériel | Installer ou charger le driver NVIDIA ; vérifier qu'un GPU NVIDIA est présent |
| `nvidia-smi` OK, mais `torch.cuda.is_available()` est `False` | **Application** (paquet) ou **compatibilité driver ↔ runtime** | Vérifier que PyTorch n'est pas en build CPU-only ; comparer `torch.version.cuda` au `CUDA Version` de `nvidia-smi` |
| `NVIDIA driver on your system is too old` | **Driver** trop vieux pour la runtime du framework | Mettre à jour le driver, ou installer un PyTorch lié à une CUDA plus ancienne |
| `CUDA out of memory` | **GPU** (VRAM) / **application** | Réduire le batch, libérer la mémoire, ou choisir une autre carte avec `CUDA_VISIBLE_DEVICES` |
| `nvcc: command not found` alors que PyTorch tourne sur GPU | **Toolkit** absent — souvent **normal** | Pas besoin de `nvcc` pour seulement exécuter ; l'installer seulement pour compiler |
| Un script utilise le mauvais GPU sur une machine partagée | Visibilité des devices | Fixer `CUDA_VISIBLE_DEVICES` avant le lancement |

En résumé : si le bas de la pile est cassé (`nvidia-smi`), réparer le driver d'abord. Si `nvidia-smi` va bien et Python échoue, regarder le **paquet** et la **compatibilité** des versions.

## Erreurs fréquentes

- Croire que `CUDA Version` de `nvidia-smi` = version utilisée par PyTorch.
- Installer le Toolkit en pensant que cela remplace le driver (ou l'inverse).
- Installer un PyTorch « cuda 12.x » sur un driver qui ne supporte que CUDA 11.x.
- Parser `nvidia-smi` dans un script fragile au lieu d'utiliser NVML.
- Oublier `CUDA_VISIBLE_DEVICES` sur une machine multi-GPU partagée.

## À retenir

- Pile : **Application → CUDA (runtime/libs) → Driver → GPU**.
- Le **driver** est indispensable. Le **Toolkit** sert surtout à développer / compiler.
- **nvidia-smi** s'appuie sur **NVML** ; sa « CUDA Version » est le **maximum** supporté par le driver.
- PyTorch embarque souvent sa propre runtime CUDA : elle doit rester **compatible** avec le driver.
- cuBLAS et cuDNN travaillent **sous** vos appels (`matmul`, convolutions) : vous ne les appelez en général pas directement.
- Diagnostiquer du bas vers le haut : `nvidia-smi` d'abord, puis le framework, puis la VRAM / le choix de GPU.

## Sources

- [The CUDA platform](https://docs.nvidia.com/cuda/cuda-programming-guide/01-introduction/cuda-platform.html) — driver, Toolkit, runtime, compute capability.
- [nvidia-smi](https://docs.nvidia.com/deploy/nvidia-smi/) et [NVML](https://docs.nvidia.com/deploy/nvml-api/index.html) — surveillance et gestion GPU.
- [Compute Capabilities](https://docs.nvidia.com/cuda/cuda-programming-guide/05-appendices/compute-capabilities.html) et [liste des GPU](https://developer.nvidia.com/cuda/gpus).
- [CUDA environment variables](https://docs.nvidia.com/cuda/cuda-programming-guide/05-appendices/environment-variables.html) — `CUDA_VISIBLE_DEVICES`.
- [cuDNN support matrix](https://docs.nvidia.com/deeplearning/cudnn/backend/latest/reference/support-matrix.html) — compatibilité libs / CUDA / driver.
- [PyTorch Discuss : driver et CUDA](https://discuss.pytorch.org/t/what-is-the-interplay-between-the-nvidia-driver-and-cuda/217811) — clarifications d'un mainteneur PyTorch sur `nvidia-smi` vs runtime embarquée.
