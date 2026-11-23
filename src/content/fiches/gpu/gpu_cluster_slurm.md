---
title: "GPU sur cluster SLURM : demander une carte et lancer correctement"
description: "Réserver un GPU avec #SBATCH, vérifier les variables, isoler la carte, et coexister avec les pratiques HPC / modules."
technology: gpu
difficulty: debutant
tags:
  - gpu
  - slurm
  - hpc
  - cluster
  - cuda
  - sbatch
publishedAt: 2026-11-23
updatedAt: 2026-11-23
draft: false
quiz:
  - question: "Où faut-il lancer un entraînement GPU long sur un cluster type Jean Zay ?"
    choices:
      - "Sur le nœud de connexion (login), en premier plan"
      - "Via un job SLURM sur une partition / nœud de calcul GPU"
      - "Uniquement dans le navigateur"
    answer: 1
    explanation: "Les login nodes ne sont pas faits pour le calcul GPU. sbatch / srun sur partition GPU."
  - question: "À quoi sert souvent #SBATCH --gres=gpu:1 ?"
    choices:
      - "À formater le GPU"
      - "À demander une ressource GPU au scheduler (syntaxe fréquente ; le site peut utiliser --gpus=…)"
      - "À installer le driver utilisateur"
    answer: 1
    explanation: "gres=gpu:N est très courant. Toujours vérifier la doc du centre (parfois --gpus=1)."
  - question: "Pourquoi nvidia-smi peut-il échouer sur le nœud de login mais marcher dans le job ?"
    choices:
      - "Parce que Git est absent"
      - "Parce que les GPU sont sur les nœuds de calcul, pas forcément sur le login"
      - "Parce que Python est trop vieux"
    answer: 1
    explanation: "Tester le GPU dans une session interactive ou un job alloué, pas seulement sur le frontend."
  - question: "Après allocation d'un GPU, bonne pratique applicative ?"
    choices:
      - "Ignorer CUDA_VISIBLE_DEVICES et prendre tous les GPU du nœud"
      - "Respecter les devices exposés par SLURM / isoler avec CUDA_VISIBLE_DEVICES si besoin"
      - "Désinstaller les modules CUDA"
    answer: 1
    explanation: "Le job ne doit pas monopoliser des cartes non allouées. SLURM positionne souvent la visibilité."
  - question: "Pour un job multi-GPU DDP sous SLURM, il faut en plus…"
    choices:
      - "Rien : DataParallel suffit toujours"
      - "Demander assez de GPU, lancer torchrun/srun avec le bon nombre de processus, backend NCCL"
      - "Uniquement augmenter --mem sans GPU"
    answer: 1
    explanation: "Allouer N GPU + N processus DDP + comm NCCL. Voir fiche DDP."
---

## Définition

Sur un **cluster HPC**, les GPU sont des ressources **partagées**, allouées par **SLURM**. On ne « prend » pas une carte comme sur un laptop : on **demande** une partition GPU, un nombre de cartes, éventuellement un type, puis on lance le code **dans** le job.

Cette fiche relie GPU et SLURM. Les bases `sbatch` / `squeue` / espaces disque restent dans les fiches HPC du site.

## Ne pas calculer sur le login

| Nœud | Rôle |
| --- | --- |
| Login / frontaux | Éditer, soumettre, transferts légers |
| Calcul GPU | Jobs `sbatch` / sessions `salloc`+`srun` avec GPU |

`nvidia-smi` sur le login peut être vide ou trompeur. Vérifier **dans** l'allocation.

## Demander un GPU

La syntaxe **dépend du site**. Deux familles fréquentes :

```bash
#SBATCH --partition=gpu          # nom local : gpu, gpu_p13, a100, …
#SBATCH --gres=gpu:1             # 1 GPU (très courant)
# parfois :
#SBATCH --gpus=1
#SBATCH --gpus-per-node=1
```

Types / contraintes (exemples) :

```bash
#SBATCH --gres=gpu:a100:1        # si le site nomme le modèle dans GRES
#SBATCH --constraint=a100        # autre style fréquent
```

Toujours lire la doc du centre (IDRIS, GENCI, labo…) : partitions, quotas, durée max, modules.

Exemple minimal de script :

```bash
#!/bin/bash
#SBATCH --job-name=train-gpu
#SBATCH --output=logs/%x-%j.out
#SBATCH --error=logs/%x-%j.err
#SBATCH --time=01:00:00
#SBATCH --partition=NOM_PARTITION_GPU
#SBATCH --gres=gpu:1
#SBATCH --cpus-per-task=8
#SBATCH --mem=32G

module purge
module load pytorch   # exemple : suivre les modules du site

nvidia-smi
python train.py
```

## Que fait SLURM pour vous ?

Selon la config du cluster, une allocation GPU peut :

- exposer seulement les cartes réservées ;
- définir **`CUDA_VISIBLE_DEVICES`** ;
- poser d'autres variables (`SLURM_JOB_GPUS`, etc.).

Bonnes pratiques :

1. Au début du job : `nvidia-smi` / `echo $CUDA_VISIBLE_DEVICES`.
2. Ne pas écraser `CUDA_VISIBLE_DEVICES` pour « prendre » d'autres cartes du nœud.
3. Aligner **nombre de processus DDP** et **GPU alloués**.

Voir aussi la fiche isolation GPU pour le sens de cette variable.

## Modules et environnements

Sur HPC, CUDA / PyTorch viennent souvent de **`module load`**, pas d'un `pip` sauvage sur le login. Ordre typique :

1. `module purge`
2. charger compilateur / CUDA / Python / PyTorch selon la doc
3. éventuellement `venv` / conda **compatibles** avec ces modules

Mélanger une roue `pip` récente avec un driver/module ancien → mêmes erreurs que la fiche driver.

## Session interactive

```bash
salloc --partition=NOM_PARTITION_GPU --gres=gpu:1 --time=00:30:00 --cpus-per-task=4
# puis sur le nœud alloué :
srun nvidia-smi
srun python -c "import torch; print(torch.cuda.is_available())"
```

Utile pour debugger avant un long `sbatch`.

## Multi-GPU sous SLURM (aperçu)

```bash
#SBATCH --gres=gpu:4
#SBATCH --ntasks=1          # souvent 1 tâche + torchrun interne
#SBATCH --cpus-per-task=… 
srun torchrun --nproc_per_node=4 train_ddp.py
```

Le détail exact (`ntasks` vs `torchrun`) varie : suivre les recettes du centre. Idée DDP : fiche DataParallel / DDP.

## Erreurs fréquentes

| Symptôme | Cause | Action |
| --- | --- | --- |
| Job pending longtemps | Partition pleine / compte / QoS | `squeue`, doc quotas |
| `CUDA not available` dans le job | Mauvais module, pas de GPU alloué, mauvaise partition | `nvidia-smi` dans le job ; vérifier `#SBATCH` |
| OOM GPU | Batch / modèle | Fiche VRAM |
| Prendre 4 GPU sans les demander | Abuse du nœud partagé | Respecter l'allocation |

## À retenir

- Calcul GPU = **job SLURM** sur partition GPU, pas le login.
- Demander le GPU avec la syntaxe **du site** (`--gres=gpu:N` ou `--gpus`).
- Vérifier `nvidia-smi` et `CUDA_VISIBLE_DEVICES` **dans** le job.
- Modules / images alignés sur le driver du cluster.
- Multi-GPU : allouer N cartes + lancer N processus (DDP).

## Sources

- Doc SLURM du centre de calcul utilisé (ex. IDRIS / Jean Zay pour les sites français).
- [Slurm — Generic Resource Scheduling](https://slurm.schedmd.com/gres.html) — principe des GRES GPU.
- Fiches DevFiches associées : SLURM HPC, isolation GPU, DDP, diagnostic.
