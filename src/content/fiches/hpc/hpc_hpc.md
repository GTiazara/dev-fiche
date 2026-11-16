---
title: Comprendre le HPC (High Performance Computing)
description: Découvrir les principes essentiels du calcul haute performance, son architecture, ses usages et les outils couramment utilisés.
technology: hpc
difficulty: debutant
tags: [hpc, calcul-haute-performance, supercalculateur, linux, cluster, parallelisme, slurm]
publishedAt: 2026-10-27
updatedAt: 2026-10-27
draft: false
quiz:
  - question: Que signifie HPC ?
    choices:
      - High Performance Computing
      - High Processing Connection
      - Host Parallel Configuration
    answer: 0
    explanation: HPC signifie High Performance Computing, ou calcul haute performance en français.
  - question: Quel outil permet de planifier les tâches sur de nombreux clusters HPC ?
    choices:
      - Slurm
      - Git
      - Docker Compose
    answer: 0
    explanation: Slurm est un ordonnanceur qui gère les ressources informatiques et planifie l'exécution des tâches sur un cluster.
  - question: Quel est l'objectif principal du HPC ?
    choices:
      - Accélérer les calculs complexes grâce à des ressources informatiques puissantes et souvent parallèles
      - Remplacer tous les systèmes d'exploitation
      - Stocker uniquement des fichiers personnels
    answer: 0
    explanation: Le HPC mobilise des ressources de calcul puissantes, souvent réparties sur plusieurs nœuds, pour résoudre des problèmes exigeants.
---

## Définition

Le **HPC (High Performance Computing)**, ou **calcul haute performance**, consiste à utiliser des ressources informatiques puissantes, souvent regroupées en clusters, pour effectuer des calculs complexes rapidement.

## Architecture d'un HPC

| Composant | Rôle |
|---|---|
| **Nœuds de calcul** | Exécutent les programmes et les calculs. |
| **CPU / GPU** | Effectuent les opérations de calcul. |
| **Réseau rapide** | Permet aux nœuds de communiquer. |
| **Stockage** | Conserve les données et les résultats. |
| **Ordonnanceur / orchestrateur (Slurm)** | Distribue les ressources et planifie les tâches. |

## Fonctionnement général

1. Préparer le code et les données.
2. Soumettre un travail (*job*) à l'ordonnanceur.
3. Obtenir les ressources nécessaires.
4. Exécuter le calcul sur un ou plusieurs nœuds.
5. Récupérer et conserver les résultats.

### Exemple de commande Slurm

```bash
# Soumettre un script de calcul
sbatch calcul.sh

# Consulter ses travaux
squeue -u "$USER"
```

## Cas d'usage

- **Météorologie :** prévisions météorologiques et simulations climatiques.
- **Recherche scientifique :** simulations physiques et chimiques.
- **Intelligence artificielle :** entraînement de modèles volumineux.
- **Biologie :** analyse génomique et simulations moléculaires.
- **Ingénierie :** simulations numériques et conception assistée.

## HPC vs ordinateur classique

| Critère | Ordinateur classique | HPC |
|---|---|---|
| Ressources | Généralement une machine | Plusieurs nœuds ou une machine spécialisée |
| Calcul | Principalement local | Parallèle et distribué selon le programme |
| Gestion des tâches | Utilisateur et système d'exploitation | Souvent un ordonnanceur |
| Usage | Bureautique, développement, applications courantes | Calculs scientifiques et problèmes complexes |

## Ressources Internet

- **[TOP500](https://www.top500.org/)** — Classement des supercalculateurs les plus puissants au monde.
- **[Documentation officielle de Slurm](https://slurm.schedmd.com/documentation.html)** — Comprendre la gestion des tâches et des ressources HPC.
<!-- - **[HPC Wiki](https://hpc-wiki.info/)** — Ressources pédagogiques sur les clusters, le calcul parallèle et les environnements HPC. -->

## À retenir

Le **HPC** permet de résoudre des problèmes complexes en mobilisant des ressources de calcul puissantes. Un environnement HPC associe généralement des nœuds de calcul, du stockage, un réseau performant et un ordonnanceur tel que Slurm.

**L'idée essentielle :** préparer un calcul, demander des ressources, exécuter le programme et récupérer les résultats.