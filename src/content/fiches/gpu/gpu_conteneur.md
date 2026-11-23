---
title: "GPU en conteneur : NVIDIA Container Toolkit et --gpus"
description: "Exposer un GPU NVIDIA à Docker, comprendre que le driver reste sur l'hôte, et éviter les pièges d'image CUDA et de volumes."
technology: gpu
difficulty: debutant
tags:
  - gpu
  - docker
  - conteneur
  - nvidia
  - cuda
  - toolkit
publishedAt: 2026-11-23
updatedAt: 2026-11-23
draft: false
quiz:
  - question: "Dans un conteneur CUDA typique, où vit le NVIDIA Driver ?"
    choices:
      - "Uniquement dans l'image Docker, recopié à chaque pull"
      - "Sur l'hôte ; le toolkit injecte les libs driver dans le conteneur"
      - "Dans le fichier Dockerfile seulement"
    answer: 1
    explanation: "NVIDIA : l'hôte a le driver ; le conteneur apporte Toolkit/runtime d'app, pas un second driver."
  - question: "Quelle option Docker courante expose tous les GPU ?"
    choices:
      - "docker run --cpus all"
      - "docker run --gpus all …"
      - "docker run --privileged uniquement, sans toolkit"
    answer: 1
    explanation: "--gpus all (avec NVIDIA Container Toolkit) est le chemin documenté."
  - question: "nvidia-smi marche sur l'hôte mais pas dans le conteneur. Cause fréquente ?"
    choices:
      - "Python trop récent"
      - "Conteneur lancé sans accès GPU / toolkit mal installé"
      - "Batch size trop grand"
    answer: 1
    explanation: "Sans --gpus (ou runtime nvidia), /dev/nvidia* n'est pas là."
  - question: "Pourquoi une image « CUDA 12.6 » peut échouer sur un hôte au driver ancien ?"
    choices:
      - "Parce que Docker ignore toujours le driver"
      - "Parce que la runtime CUDA de l'image exige un driver hôte assez récent"
      - "Parce que le Dockerfile contient du Markdown"
    answer: 1
    explanation: "Même règle que hors conteneur : compatibilité driver ↔ CUDA (fiche driver)."
  - question: "Que permet docker run --gpus '\"device=1\"' … ?"
    choices:
      - "D'utiliser uniquement le GPU hôte d'indice 1"
      - "De formater le disque"
      - "D'installer nvcc sur l'hôte"
    answer: 0
    explanation: "On peut sélectionner un sous-ensemble de devices, analogue à CUDA_VISIBLE_DEVICES."
---

## Définition

Un conteneur **n'embarque pas** le driver NVIDIA de l'hôte. Pour qu'un process Docker voie le GPU, il faut :

1. un **driver** compatible sur l'**hôte** ;
2. le **NVIDIA Container Toolkit** (runtime) ;
3. un lancement qui **expose** le(s) GPU (`--gpus`).

L'image apporte souvent CUDA runtime / libs / PyTorch ; le driver reste **partagé** depuis la machine.

## Prérequis hôte

```bash
nvidia-smi                          # doit fonctionner sur l'hôte
# Installer le NVIDIA Container Toolkit (doc NVIDIA Cloud Native)
docker run --rm --gpus all nvidia/cuda:12.6.0-base-ubuntu22.04 nvidia-smi
```

Si le smoke test affiche les cartes : la chaîne hôte → toolkit → conteneur est OK.

## Lancer avec GPU

```bash
# Tous les GPU
docker run --rm --gpus all -it mon_image:tag bash

# Un seul GPU (indice hôte 1)
docker run --rm --gpus '"device=1"' -it mon_image:tag bash

# Compose : section deploy.reservations / device_requests selon version
```

Variables souvent injectées / utiles dans l'image :

- `NVIDIA_VISIBLE_DEVICES`
- `NVIDIA_DRIVER_CAPABILITIES=compute,utility`

## Image vs driver

| Couche | Où | Rôle |
| --- | --- | --- |
| Driver | Hôte | Parle au matériel |
| Toolkit conteneur | Hôte | Monte libs / devices dans le container |
| Image (`nvidia/cuda`, NGC, custom) | Conteneur | Runtime CUDA, Python, PyTorch… |

Choisir une image dont la CUDA est **compatible** avec le driver hôte (mêmes règles que la fiche driver / installer PyTorch). Un tag « cuda12.x-devel » plus neuf que le driver → `driver too old` / `is_available() False`.

## Pièges fréquents

| Piège | Effet | Contre-mesure |
| --- | --- | --- |
| Oubli de `--gpus` | Pas de `/dev/nvidia*`, `nvidia-smi` KO | Relancer avec `--gpus` |
| Toolkit absent / runtime non configuré | Même symptôme | Installer / configurer le toolkit, redémarrer Docker |
| Volume qui écrase des libs CUDA | Comportement bizarre | Ne pas monter n'importe quel `/usr/local/cuda` de l'hôte sans besoin |
| Mauvais `LD_LIBRARY_PATH` | Compat libs avant le driver hôte | Suivre la doc image / NIM troubleshooting |
| GPU exposé mais roue PyTorch CPU | `torch.version.cuda is None` | Réinstaller build CUDA dans l'image |

## Kubernetes (aperçu)

Le pod demande la ressource `nvidia.com/gpu`. Le cluster doit avoir le **device plugin** NVIDIA. Même idée : driver sur les nœuds, pas « dans » chaque image comme substitut.

## Lien avec le diagnostic

Ordre utile si ça marche hors Docker mais pas dedans :

1. smoke `docker run --gpus all … nvidia-smi` ;
2. vérifier toolkit ;
3. puis PyTorch dans l'image (fiche diagnostic).

## À retenir

- Driver = **hôte** ; image = app + runtime CUDA.
- **NVIDIA Container Toolkit** + **`--gpus`**.
- Smoke test : conteneur officiel + `nvidia-smi`.
- Compatibilité **driver hôte ↔ CUDA de l'image**.
- Sélectionner un GPU : `--gpus device=…` (ou variables NVIDIA).

## Sources

- [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/index.html).
- [Container images / --gpus](https://nvidia.github.io/container-wiki/toolkit/container-images.html).
- [CUDA Compatibility](https://docs.nvidia.com/deploy/cuda-compatibility/latest/minor-version-compatibility.html).
- Fiches DevFiches associées : installer PyTorch, diagnostic, driver.
