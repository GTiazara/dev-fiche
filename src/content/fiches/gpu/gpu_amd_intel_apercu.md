---
title: "GPU AMD et Intel : aperçu ROCm et oneAPI hors du monde NVIDIA"
description: "Savoir que CUDA n'est pas le seul écosystème : situer ROCm (AMD), les stacks Intel GPU, et ce qui change pour PyTorch sans tout détailler."
technology: gpu
difficulty: debutant
tags:
  - gpu
  - amd
  - intel
  - rocm
  - oneapi
  - pytorch
  - cuda
publishedAt: 2026-11-23
updatedAt: 2026-11-23
draft: false
quiz:
  - question: "CUDA est…"
    choices:
      - "Un standard ouvert supporté à l'identique par tous les fabricants de GPU"
      - "La plateforme de calcul GPU de NVIDIA (driver + runtime + outils)"
      - "Un format de fichier CSV"
    answer: 1
    explanation: "CUDA est l'écosystème NVIDIA. AMD et Intel ont d'autres stacks."
  - question: "ROCm est surtout associé à…"
    choices:
      - "Apple Silicon uniquement"
      - "Les GPU AMD (stack open visant le calcul / ML)"
      - "Les imprimantes"
    answer: 1
    explanation: "ROCm = plateforme AMD pour GPU compute."
  - question: "Pour installer PyTorch sur GPU AMD, le sélecteur officiel propose souvent…"
    choices:
      - "Uniquement cu126"
      - "Une option ROCm (index pip dédié), distincte de CUDA"
      - "Uniquement CPU"
    answer: 1
    explanation: "Get Started propose CUDA, CPU, ROCm (selon versions supportées)."
  - question: "nvidia-smi sur une machine AMD Radeon…"
    choices:
      - "Fonctionne toujours de la même façon"
      - "Ne s'applique pas : c'est l'outil NVIDIA ; AMD a d'autres outils (ex. rocm-smi)"
      - "Remplace GRUB"
    answer: 1
    explanation: "Chaque stack a ses outils de monitoring."
  - question: "Pourquoi cette fiche reste un « aperçu » ?"
    choices:
      - "Parce que les commandes AMD/Intel n'existent pas"
      - "Parce que support matériel, drivers et builds évoluent vite et restent plus fragmentés que CUDA NVIDIA"
      - "Parce que Python refuse AMD"
    answer: 1
    explanation: "Le message utile : savoir que ça existe, vérifier la matrice de support du jour."
---

## Définition

La majorité des fiches GPU de ce site parlent de **NVIDIA + CUDA** : c'est l'écosystème le plus documenté en deep learning aujourd'hui. Ce n'est **pas** le seul.

| Fabricant | Stack calcul (repère) | Outil monitoring typique |
| --- | --- | --- |
| **NVIDIA** | CUDA, CUDA-X | `nvidia-smi` |
| **AMD** | **ROCm** | `rocm-smi` (selon install) |
| **Intel** | **oneAPI** / Level Zero, drivers GPU Intel | outils Intel (`xpu-smi`, etc. selon gén.) |

Objectif ici : **savoir que ça existe**, quoi chercher, et ce qui change conceptuellement — pas remplacer la doc AMD/Intel.

## Ce qui reste vrai partout

- Il faut un **driver** adapté au matériel.
- Le framework (PyTorch…) doit fournir un **build** pour cette plateforme.
- La **mémoire GPU** est limitée → mêmes idées OOM / batch.
- Isoler une carte et profiler l'utilisation restent des réflexes utiles.

Ce qui change : noms des outils, matrices de **cartes supportées**, maturité des libs (équivalent cuDNN/NCCL), Docker, cloud.

## AMD et ROCm

**ROCm** (*Radeon Open Compute*) est la plateforme AMD pour le calcul GPU.

Points pratiques :

1. Vérifier que **votre GPU** est dans la liste supportée ROCm / PyTorch ROCm du moment (beaucoup de cartes consumer sont exclues ou partielles).
2. Installer le stack ROCm (ou utiliser une image / cloud déjà prêt).
3. Installer PyTorch via l'index **ROCm** du [sélecteur officiel](https://pytorch.org/get-started/locally/), pas l'index `cuXXX`.
4. Tester : `torch.cuda.is_available()` peut encore apparaître dans certaines builds ROCm pour des raisons d'historique d'API — lire la doc de **votre** version ; des builds exposent aussi des devices spécifiques AMD.

Monitoring : `rocm-smi` plutôt que `nvidia-smi`.

## Intel GPU

Intel pousse une stack autour de **oneAPI**, SYCL, et des backends PyTorch **XPU** (selon versions).

Points pratiques :

1. Driver GPU Intel à jour (selon iGPU / Arc / Data Center GPU).
2. Suivre la doc Intel + PyTorch pour l'install **XPU** du moment.
3. Les noms d'API (`xpu` vs `cuda`) et la maturité des ops varient : valider votre modèle sur un petit script avant un gros run.

L'écosystème bouge vite : traiter chaque install comme une **matrice de compatibilité** à vérifier, pas comme « CUDA avec un autre logo ».

## Quand rester sur NVIDIA

- Tutoriels, stacks ML et clusters HPC académiques encore **CUDA-first**.
- Besoin de NCCL / images NGC / recettes éprouvées.
- Carte déjà NVIDIA disponible.

## Quand considérer AMD / Intel

- Matériel déjà là (poste, cloud AMD MI…, Arc…).
- Contraintes coût / dispo NVIDIA.
- Projet volontairement portable (abstractions, tests multi-backends) — effort d'ingénierie réel.

## À retenir

- **CUDA = NVIDIA** ; AMD → **ROCm** ; Intel → **oneAPI / XPU**.
- Toujours vérifier la **liste de GPU supportés** + le build PyTorch adapté.
- Les idées VRAM / batch / isolation restent ; les **outils** changent (`rocm-smi`, etc.).
- Pour la plupart des fiches DevFiches « GPU », le chemin détaillé reste NVIDIA — celui-ci ouvre la porte aux autres.

## Sources

- [PyTorch Get Started](https://pytorch.org/get-started/locally/) — options CUDA / CPU / ROCm.
- [ROCm documentation](https://rocm.docs.amd.com/) — plateforme AMD.
- [Intel oneAPI / PyTorch XPU](https://www.intel.com/content/www/us/en/developer/tools/oneapi/overview.html) — porte d'entrée Intel (suivre les guides PyTorch XPU à jour).
- Fiches DevFiches associées : pile GPU NVIDIA, installer PyTorch CUDA (pour le contraste).
