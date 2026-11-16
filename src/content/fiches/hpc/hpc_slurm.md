---
title: "Utiliser Slurm de A à Z"
description: "Guide pratique de Slurm pour soumettre, configurer, suivre, optimiser et déboguer des jobs sur un cluster HPC."
technology: hpc
difficulty: debutant
tags:
  - slurm
  - hpc
  - linux
  - cluster
  - sbatch
  - srun
  - gpu
  - parallelisme
publishedAt: 2026-10-27
updatedAt: 2026-10-27
draft: false
quiz:
  - question: "Quelle commande permet de soumettre un script batch à Slurm ?"
    choices:
      - "squeue"
      - "sbatch"
      - "scancel"
    answer: 1
    explanation: "sbatch envoie le script à l'ordonnanceur. squeue affiche les jobs, scancel en annule un."
  - question: "Quelle option permet de demander 4 CPU par tâche ?"
    choices:
      - "--ntasks=4"
      - "--nodes=4"
      - "--cpus-per-task=4"
    answer: 2
    explanation: "--cpus-per-task fixe les CPU de chaque tâche. --ntasks compte les tâches, --nodes compte les nœuds."
  - question: "Quelle commande permet de consulter l'historique d'un job terminé ?"
    choices:
      - "sacct"
      - "sinfo"
      - "srun"
    answer: 0
    explanation: "sacct lit la comptabilité des jobs terminés. sinfo décrit les partitions, srun lance une étape."
---

# 1. Qu'est-ce que Slurm ?

**Slurm** (*Simple Linux Utility for Resource Management*) est un gestionnaire de ressources et un ordonnanceur de jobs. Il répartit les calculs entre les ressources disponibles d'un cluster HPC.

Il permet de :
- demander des CPU, de la mémoire, des GPU et des nœuds ;
- soumettre des calculs sans rester connecté ;
- exécuter des programmes en parallèle ;
- suivre et annuler des jobs ;
- consulter les ressources consommées.

## Le principe

1. On prépare un script.
2. On demande les ressources nécessaires.
3. On soumet le script à Slurm.
4. Slurm place le job dans la file d'attente.
5. Le job s'exécute lorsque les ressources sont disponibles.
6. On consulte les résultats et les journaux.

**À retenir :** soumettre un job ne signifie pas qu'il démarre immédiatement.

# 2. Le vocabulaire essentiel

| Terme | Signification |
|---|---|
| Cluster | Ensemble de machines interconnectées |
| Nœud (*node*) | Une machine du cluster |
| Job | Travail soumis à Slurm |
| Partition | Groupe de ressources et file de calcul avec des règles spécifiques |
| Allocation | Ressources attribuées à un job |
| Task | Processus lancé par Slurm |
| CPU | Ressource de calcul processeur |
| GPU | Processeur spécialisé pour certains calculs |
| Mémoire | RAM disponible pour le job |
| Walltime | Durée maximale autorisée |
| Job ID | Identifiant attribué à un job |
| Job step | Étape d'exécution à l'intérieur d'une allocation |
| Job array | Ensemble de jobs similaires exécutant des paramètres différents |

# 3. Découvrir le cluster

Avant de soumettre un calcul, il faut connaître les partitions disponibles, les limites de temps et les règles du centre HPC.

## Voir les partitions

```bash
sinfo
```

Affichage détaillé :

```bash
sinfo -o "%P %a %l %D %C"
```

Les colonnes indiquent notamment la partition, sa disponibilité, la limite de temps, le nombre de nœuds et l'état des CPU.

## Voir les GPU d'une partition

`%N` liste les nœuds, `%G` les ressources génériques (les GPU), `%t` l'état court du nœud. `idle` signifie que le nœud est libre. `mix` signifie qu'une partie est déjà prise. `alloc` signifie qu'il est plein. `NOM_PARTITION` se remplace par un nom lu dans la sortie de `sinfo`.

```bash
sinfo -p NOM_PARTITION -o "%N %G %t"
```

Cette commande montre les GPU installés, pas ceux qui restent libres. Pour savoir si un job multi-GPU peut partir, il faut comparer le total et le déjà réservé :

```bash
sinfo -p NOM_PARTITION -N -O "NodeHost:20,Gres:30,GresUsed:30,StateCompact:8"
```

`Gres` est le nombre de GPU installés sur le nœud. `GresUsed` est le nombre déjà réservé. Les GPU libres d'un nœud valent la différence des deux. Un job multi-GPU les demande sur un seul nœud : quatre GPU libres au total, répartis sur deux nœuds, ne suffisent pas pour un job de quatre GPU.

Pour savoir s'il existe au moins un nœud libre avec assez de GPU, limite d'abord l'affichage aux nœuds entièrement disponibles :

```bash
sinfo -p NOM_PARTITION -t idle -h -o "%N %G"
```

S'il existe une ligne dont `%G` annonce au moins autant de GPU que le job, ce nœud peut le recevoir. Une sortie vide ne ferme pas la question : un nœud `mix` peut encore avoir assez de GPU libres. On relit alors `Gres` et `GresUsed`. Exemple pour un job de 4 GPU :

| Nœud | Gres | GresUsed | Libres | Convient |
|---|---|---|---|---|
| nœud A | `gpu:4` | vide | 4 | oui |
| nœud B | `gpu:8` | `gpu:6` | 2 | non |
| nœud C | `gpu:4` | `gpu:4` | 0 | non |

Une seule ligne « oui » suffit pour lancer la tâche. Cette lecture ne tient pas compte du compte, de la durée demandée ni des nœuds réservés ou en maintenance.

## Voir les informations d'une partition

```bash
scontrol show partition NOM_PARTITION
```

Remplace `NOM_PARTITION` par le nom réel d'une partition du cluster.

## Consulter l'aide

```bash
sbatch --help
srun --help
squeue --help
man sbatch
man srun
```

Les partitions, les comptes, les types de GPU et les options autorisées dépendent de l'installation.

# 4. Les commandes Slurm à connaître

| Commande | Utilité |
|---|---|
| `sbatch` | Soumettre un script batch |
| `srun` | Lancer une commande ou une étape de calcul |
| `salloc` | Obtenir une allocation interactive |
| `squeue` | Afficher les jobs en attente ou en cours |
| `scancel` | Annuler un job |
| `sinfo` | Afficher les partitions et l'état des nœuds |
| `scontrol` | Examiner les détails d'un job ou du cluster |
| `sacct` | Consulter l'historique et les statistiques des jobs |
| `sstat` | Consulter les statistiques de jobs en cours, si disponibles |
| `sprio` | Examiner les éléments de priorité d'un job |

# 5. Écrire son premier script Slurm

Crée un fichier `calcul.sh` :

```bash
#!/bin/bash
#SBATCH --job-name=mon_calcul
#SBATCH --output=logs/%x-%j.out
#SBATCH --error=logs/%x-%j.err
#SBATCH --time=00:10:00
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=1
#SBATCH --mem=2G

set -euo pipefail

echo "Début du calcul : $(date)"
echo "Nœud utilisé : $(hostname)"

# Remplacer par la commande de calcul réelle.
python mon_script.py

echo "Fin du calcul : $(date)"
```

Avant de soumettre le job, crée le dossier des journaux :

```bash
mkdir -p logs
```

**Important :** les directives `#SBATCH` doivent apparaître au début du script, avant les commandes shell exécutables. Les variables shell placées dans ces directives ne sont pas développées comme dans une commande classique.

Dans cet exemple :
- `--job-name` définit le nom du job ;
- `--output` définit le fichier de sortie standard ;
- `--error` définit le fichier des erreurs ;
- `--time` définit la durée maximale ;
- `--ntasks` définit le nombre de tâches ;
- `--cpus-per-task` définit le nombre de CPU par tâche ;
- `--mem` demande une quantité de mémoire.

Le script suppose que Python est disponible dans l'environnement du job. Selon le cluster, il peut être nécessaire de charger un module ou d'activer un environnement logiciel.

# 6. Soumettre un job

```bash
sbatch calcul.sh
```

Slurm renvoie généralement un identifiant, par exemple :

```text
Submitted batch job 123456
```

Le nombre `123456` est le **Job ID**. Il servira pour suivre, inspecter ou annuler le job.

## Soumettre avec des options en ligne de commande

```bash
sbatch --time=00:30:00 --mem=4G calcul.sh
```

Les options données à la commande peuvent remplacer certaines valeurs définies dans le script.

# 7. Comprendre les ressources demandées

## CPU, tâches et nœuds

| Option | Signification | Exemple |
|---|---|---|
| `--nodes=2` | Demander deux nœuds | `#SBATCH --nodes=2` |
| `--ntasks=8` | Demander huit tâches | `#SBATCH --ntasks=8` |
| `--cpus-per-task=4` | Demander quatre CPU par tâche | `#SBATCH --cpus-per-task=4` |
| `--mem=16G` | Demander 16 Go de RAM par nœud, dans la configuration habituelle de Slurm | `#SBATCH --mem=16G` |
| `--time=02:00:00` | Limiter le job à deux heures | `#SBATCH --time=02:00:00` |
| `--partition=compute` | Choisir une partition | `#SBATCH --partition=compute` |
| `--account=mon_compte` | Choisir un compte de calcul si requis | `#SBATCH --account=mon_compte` |

Le nom `compute` et le compte `mon_compte` sont des exemples : utilise les valeurs indiquées par ton centre de calcul.

### Différence entre tâches et CPU

- `--ntasks` correspond au nombre de processus ou tâches lancés.
- `--cpus-per-task` correspond au nombre de CPU alloués à chaque tâche.

Exemples courants :

| Type de programme | Demande indicative |
|---|---|
| Programme séquentiel | 1 tâche, 1 CPU |
| Programme multithread | 1 tâche, plusieurs CPU |
| Programme MPI | Plusieurs tâches, souvent réparties sur plusieurs nœuds |
| Calcul hybride MPI + OpenMP | Plusieurs tâches et plusieurs CPU par tâche |

Les ressources doivent correspondre à la manière dont le programme a été conçu. Demander plus de CPU ne rend pas automatiquement un programme plus rapide.

## Demander un GPU

Exemple générique :

```bash
#SBATCH --gres=gpu:1
```

Certaines installations utilisent plutôt des options telles que `--gpus=1`, des types de GPU ou des partitions spécialisées.

Avant un job multi-GPU, la section « Voir les GPU d'une partition » indique combien de GPU sont encore libres sur un nœud.

Vérifie la syntaxe attendue sur ton cluster avant d'utiliser ces options.

# 8. Suivre les jobs

## Voir ses jobs

```bash
squeue -u "$USER"
```

Voir un job précis :

```bash
squeue -j 123456
```

Examiner les détails :

```bash
scontrol show job 123456
```

Demander une estimation de l'heure de démarrage, lorsque cette fonctionnalité est disponible :

```bash
squeue --start -j 123456
```

Cette estimation n'est pas garantie.

## États courants

| État | Signification |
|---|---|
| `PD` | En attente (*Pending*) |
| `R` | En cours (*Running*) |
| `CG` | En phase de finalisation (*Completing*) |
| `CD` | Terminé (*Completed*) |
| `F` | Échec (*Failed*) |
| `TO` | Temps maximal dépassé (*Timeout*) |
| `CA` | Annulé (*Cancelled*) |
| `OOM` | Dépassement de mémoire (*Out Of Memory*) |
| `NF` | Nœud indisponible (*Node Failure*) |

Les codes exacts et leur présentation peuvent varier selon la version de Slurm.

## Pourquoi mon job est-il en attente ?

```bash
squeue -j 123456 -o "%.18i %.9T %.30R"
```

Cette commande permet notamment d'afficher la raison de l'attente.

Exemples de raisons possibles :
- ressources insuffisantes disponibles pour le moment ;
- priorité trop faible par rapport aux autres jobs ;
- limite de compte ou de partition atteinte ;
- dépendance à un autre job ;
- demande de ressources incompatible avec les règles du cluster.

Un job en attente n'est pas nécessairement bloqué : il peut simplement attendre des ressources.

# 9. Consulter les résultats et les erreurs

Avec les directives suivantes :

```bash
#SBATCH --output=logs/%x-%j.out
#SBATCH --error=logs/%x-%j.err
```

Les fichiers contiennent respectivement la sortie standard et les erreurs du programme.

Pour lire les dernières lignes :

```bash
tail -n 50 logs/mon_calcul-123456.out
tail -n 50 logs/mon_calcul-123456.err
```

Pour suivre un fichier pendant l'exécution :

```bash
tail -f logs/mon_calcul-123456.out
```

Le fichier de sortie peut ne pas apparaître immédiatement ou rester vide tant que le programme n'écrit rien. Certains programmes mettent également leur sortie en mémoire tampon.

# 10. Annuler un job

Annuler un job précis :

```bash
scancel 123456
```

Annuler tous ses jobs :

```bash
scancel -u "$USER"
```

**Attention :** la seconde commande peut interrompre tous les calculs associés à ton compte. Vérifie la liste avant de l'utiliser.

# 11. Exécuter un job interactif

Une session interactive permet de tester une commande ou de déboguer un programme sur les ressources attribuées par Slurm.

Exemple :

```bash
srun --partition=debug \
     --time=00:15:00 \
     --ntasks=1 \
     --cpus-per-task=2 \
     --mem=4G \
     --pty bash
```

`debug` est ici un nom fictif à remplacer par une partition interactive réellement disponible.

La même session peut demander un nœud, une tâche et dix cœurs. `interactif` est aussi un nom fictif. La liste des partitions s'obtient avec `sinfo`.

```bash
srun --pty \
  --nodes=1 \
  --ntasks-per-node=1 \
  --cpus-per-task=10 \
  --partition=interactif \
  --hint=nomultithread \
  --time=01:00:00 \
  bash
```

`--pty` attache un terminal à la tâche. `--hint=nomultithread` réserve des cœurs, pas les threads matériels. `--time` limite la session. Sans cette option, la durée dépend de la politique de la partition. Si le centre exige un compte, ajoute `--account` avec le compte du projet. La commande `exit` ferme la session et rend les ressources.

Une fois la session ouverte, exécute tes commandes sur les ressources attribuées. Pour quitter :

```bash
exit
```

Une session interactive doit respecter les mêmes règles de ressources que les autres jobs. Évite de lancer des calculs lourds directement sur un nœud de connexion.

# 12. Utiliser `srun` dans un job

`srun` lance une commande dans les ressources allouées au job.

Exemple de script :

```bash
#!/bin/bash
#SBATCH --job-name=test_srun
#SBATCH --output=logs/test-%j.out
#SBATCH --time=00:10:00
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=2
#SBATCH --mem=2G

mkdir -p logs
srun python mon_script.py
```

Dans cet exemple, `srun` lance une tâche Python au sein de l'allocation.

Pour un programme MPI, on peut par exemple demander plusieurs tâches :

```bash
#SBATCH --ntasks=4
```

puis lancer l'application avec :

```bash
srun ./mon_programme_mpi
```

Cela ne garantit pas que n'importe quel programme sera parallélisé : l'application doit être compatible avec le mode de parallélisme choisi.

# 13. Les jobs multithreadés

Un programme utilisant plusieurs threads peut demander plusieurs CPU pour une seule tâche.

Exemple :

```bash
#!/bin/bash
#SBATCH --job-name=threads
#SBATCH --output=logs/threads-%j.out
#SBATCH --time=00:20:00
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=8
#SBATCH --mem=8G

export OMP_NUM_THREADS="$SLURM_CPUS_PER_TASK"

srun ./mon_programme_openmp
```

Ici, le programme reçoit huit CPU et la variable `OMP_NUM_THREADS` indique à OpenMP le nombre de threads à utiliser.

Cette configuration n'est pertinente que si le programme prend en charge OpenMP ou une bibliothèque multithreadée compatible.

# 14. Lancer plusieurs calculs avec un job array

Un *job array* est utile lorsqu'on doit exécuter le même programme avec plusieurs jeux de paramètres.

Exemple : dix calculs indépendants.

```bash
#!/bin/bash
#SBATCH --job-name=serie
#SBATCH --output=logs/serie-%A_%a.out
#SBATCH --error=logs/serie-%A_%a.err
#SBATCH --time=00:10:00
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=1
#SBATCH --mem=2G
#SBATCH --array=0-9%3

set -euo pipefail

mkdir -p logs

echo "Index du calcul : $SLURM_ARRAY_TASK_ID"

python mon_script.py "$SLURM_ARRAY_TASK_ID"
```

Soumission :

```bash
sbatch serie.sh
```

À retenir :
- `--array=0-9` crée dix indices de calcul ;
- `%3` limite à trois le nombre de tâches de ce tableau exécutées simultanément ;
- `SLURM_ARRAY_TASK_ID` contient l'indice courant ;
- `%A` représente l'identifiant du tableau ;
- `%a` représente l'indice du calcul.

Ton programme doit interpréter cet indice pour sélectionner le jeu de paramètres correspondant.

# 15. Enchaîner des jobs avec des dépendances

Certains calculs doivent attendre la fin d'un job précédent.

Exemple : exécuter `analyse.sh` seulement si `preparation.sh` réussit.

```bash
sbatch preparation.sh
```

Supposons que Slurm retourne l'identifiant `123456` :

```bash
sbatch --dependency=afterok:123456 analyse.sh
```

Types de dépendances courants :

| Option | Signification |
|---|---|
| `afterok:ID` | Démarrer si le job précédent se termine avec succès |
| `afterany:ID` | Attendre la fin du job précédent, quel que soit son résultat |
| `after:ID` | Attendre que le job précédent ait commencé |
| `aftercorr:ID` | Dépendance entre tâches correspondantes de tableaux de jobs, selon les règles de Slurm |

Les dépendances peuvent être combinées, mais il faut respecter la syntaxe documentée pour la version installée.

# 16. Vérifier l'historique et les performances

Après l'exécution :

```bash
sacct -j 123456
```

Afficher quelques champs utiles :

```bash
sacct -j 123456 \
  --format=JobID,JobName,State,ExitCode,Elapsed,AllocCPUS,MaxRSS
```

Les informations disponibles dépendent de la configuration comptable du cluster.

Champs importants :
- `State` : état final du job ;
- `ExitCode` : code de retour ;
- `Elapsed` : durée écoulée ;
- `AllocCPUS` : nombre de CPU alloués ;
- `MaxRSS` : pic de mémoire résidente mesuré pour une tâche ou étape, selon le relevé.

Un job terminé avec le code de retour `0:0` a généralement réussi du point de vue de son processus principal. Il reste important de vérifier les journaux et les résultats produits.

## Ajuster les demandes de ressources

Après plusieurs exécutions :
1. compare le temps demandé au temps réellement utilisé ;
2. vérifie la mémoire consommée ;
3. observe si tous les CPU alloués sont utiles ;
4. adapte les ressources lors de la prochaine soumission.

Le but est de demander suffisamment de ressources pour réussir, sans réserver inutilement des ressources au détriment des autres utilisateurs.

# 17. Charger les logiciels et environnements

Sur de nombreux clusters, les logiciels sont installés sous forme de modules.

Commandes typiques :

```bash
module avail
module list
module load NOM_DU_MODULE
```

Le système de modules n'est pas identique sur tous les clusters. Certains environnements utilisent aussi Conda, des environnements Python ou des conteneurs.

Exemple de script avec un module :

```bash
#!/bin/bash
#SBATCH --job-name=python
#SBATCH --output=logs/python-%j.out
#SBATCH --time=00:10:00
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=1
#SBATCH --mem=2G

module load python

python mon_script.py
```

Remplace `python` par le nom et la version du module réellement disponibles. Si le cluster ne propose pas de commande `module`, suis sa documentation logicielle.

# 18. Entraîner un modèle sur plusieurs GPU

NCCL (*NVIDIA Collective Communications Library*) est la bibliothèque que PyTorch utilise pour que les GPU s'échangent les gradients. Sur un seul nœud, cet échange passe par NVLink, le PCIe ou la mémoire partagée. Entre plusieurs nœuds, il passe par le réseau rapide de la machine. Un mauvais réglage NCCL ne bloque pas l'affichage du script : le job démarre, puis les GPU restent en attente les uns des autres.

Deux façons de lancer les processus, à ne pas mélanger :

| Lancement | Tâches Slurm | Qui crée les processus GPU |
|---|---|---|
| PyTorch Lightning avec `srun` | Une tâche par GPU | `srun` |
| `torchrun` | Une seule tâche pour le nœud | `torchrun --nproc_per_node` |

Si `ntasks-per-node` vaut 3 et que la commande lance aussi `torchrun --nproc_per_node=3`, le nœud démarre neuf processus au lieu de trois.

L'exemple suivant vise le premier cas : un nœud, trois GPU, une tâche par GPU, un conteneur Apptainer. Les noms sont fictifs. Le dossier `logs/` doit exister avant `sbatch`, parce que Slurm ouvre les journaux au moment de la soumission.

```bash
mkdir -p logs
sbatch entrainement.sh
```

```bash
#!/bin/bash
#SBATCH --job-name=entrainement-swin
#SBATCH --nodes=1
#SBATCH --ntasks-per-node=3
#SBATCH --cpus-per-task=8
#SBATCH --gres=gpu:3
#SBATCH --hint=nomultithread
#SBATCH --mem=180G
#SBATCH --time=04:00:00
#SBATCH --partition=gpu
#SBATCH --account=projet-hpc
#SBATCH --output=logs/%x-%j.out
#SBATCH --error=logs/%x-%j.err

# Le produit tâches × CPU doit rester dans les cœurs physiques du nœud.
# --hint=nomultithread réserve des cœurs, pas les threads matériels.
# --mem réserve de la mémoire pour le nœud. Une valeur énorme peut bloquer le nœud entier.

set -euo pipefail

echo "Script soumis :"
cat "$0"

# Un thread OpenMP par processus GPU. Une valeur haute se multiplie par le nombre de tâches.
export OMP_NUM_THREADS=1
# srun ne reprend pas toujours --cpus-per-task. Cette variable aligne les deux.
export SRUN_CPUS_PER_TASK=8

export PYTHONFAULTHANDLER=1
# Un rang NCCL en erreur fait échouer les autres, au lieu d'un job qui attend sans fin.
export TORCH_NCCL_ASYNC_ERROR_HANDLING=1

# À n'activer que pour comprendre un blocage, puis à retirer.
# export TORCH_DISTRIBUTED_DEBUG=INFO
# export TORCH_SHOW_CPP_STACKTRACES=1
# export TORCH_NCCL_BLOCKING_WAIT=1
# export NCCL_DEBUG=INFO
# export NCCL_SOCKET_IFNAME=bond0

# Décommenter seulement si les GPU d'un même nœud ne se voient pas.
# Sur une machine saine, cette option coupe NVLink et ralentit l'entraînement.
# export NCCL_P2P_DISABLE=1

PROJET="${WORK:-$HOME}/hpc-demo"
IMAGE="${PROJET}/images/entrainement.sif"

cd "$PROJET"
# --nv rend les GPU visibles dans le conteneur.
# srun lance la commande une fois par tâche, donc trois fois ici.
srun apptainer exec --nv "$IMAGE" \
  python entrainer.py --config configs/hpc.yaml
```

Remplace la partition, le compte, le nombre de GPU et le nom d'interface par ceux de ta machine. `bond0` est un exemple d'interface réseau agrégée : ce nom n'existe pas partout. La commande `ip -br link` liste les interfaces du nœud.

| Variable | Rôle |
|---|---|
| `NCCL_DEBUG` | Niveau de journal NCCL. `WARN` suffit en régime normal. `INFO` montre l'algorithme et l'interface utilisés. `TRACE` noie le journal. |
| `NCCL_SOCKET_IFNAME` | Interface réseau du rendez-vous entre processus. Un nom absent et les GPU ne se trouvent pas. |
| `NCCL_P2P_DISABLE=1` | Coupe l'échange direct entre GPU du même nœud. Contournement, pas un réglage de performance. |
| `TORCH_NCCL_BLOCKING_WAIT=1` | PyTorch attend la fin de l'échange. Un blocage devient visible. Ancien nom : `NCCL_BLOCKING_WAIT`. |
| `TORCH_NCCL_ASYNC_ERROR_HANDLING=1` | Une erreur NCCL sur un GPU interrompt les autres rangs. Ancien nom : `NCCL_ASYNC_ERROR_HANDLING`. |
| `TORCH_DISTRIBUTED_DEBUG` | Journal PyTorch du démarrage distribué : `INFO` ou `DETAIL`. Utile au premier essai, bruyant ensuite. |
| `TORCH_SHOW_CPP_STACKTRACES=1` | Ajoute la pile C++ aux erreurs PyTorch. |
| `PYTHONFAULTHANDLER=1` | Affiche une trace Python si le processus plante. |
| `OMP_NUM_THREADS` | Threads CPU à l'intérieur de chaque processus. `1` veut dire un thread par processus, pas un thread par cœur. |
| `SRUN_CPUS_PER_TASK` | Redonne à `srun` le nombre de CPU demandé par `#SBATCH --cpus-per-task`. Les deux valeurs doivent être égales. |

### Exemple type sur Jean Zay

Sur Jean Zay, le compte, la partition et la QoS viennent de l'allocation du projet. L'exemple vise quatre GPU V100. Le projet `demo`, le login `ada00001` et l'adresse `ada@exemple.fr` sont fictifs. Le dossier de logs doit exister avant `sbatch`.

Une ligne `# #SBATCH` est un commentaire. Pour changer de modèle de GPU ou de QoS, on retire un `#` et on en ajoute un sur l'autre ligne. Les directives `#SBATCH` ne développent pas `$WORK` : le chemin des journaux est donc écrit en toutes lettres.

```bash
#!/bin/bash
#SBATCH --account=demo@v100
#SBATCH --job-name=entrainement-swin
# #SBATCH -C v100-32g
# #SBATCH -C v100-16g
#SBATCH --partition=gpu_p13
# gpu_p2 et gpu_p13 sont des exemples de partitions V100
#SBATCH --qos=qos_gpu-t3
# qos_gpu-t3 et qos_gpu-t4 changent la durée maximale autorisée
#SBATCH --time=20:00:00
#SBATCH --output=/gpfswork/rech/demo/ada00001/logs/hpc/%x_%j.out
#SBATCH --error=/gpfswork/rech/demo/ada00001/logs/hpc/%x_%j.err
#SBATCH --nodes=1
#SBATCH --ntasks=4
#SBATCH --ntasks-per-node=4
#SBATCH --gres=gpu:4
#SBATCH --cpus-per-task=10
#SBATCH --hint=nomultithread
#SBATCH --mail-user=ada@exemple.fr
#SBATCH --mail-type=END,FAIL

set -euo pipefail
set -x

# PyTorch écrit ses fichiers temporaires ici, pas sur le disque local du nœud.
mkdir -p "$SCRATCH/torch_tmp"
export TMPDIR="$SCRATCH/torch_tmp"
export SRUN_CPUS_PER_TASK=10

PROJET="/gpfswork/rech/demo/ada00001/src/hpc-demo"
cd "$PROJET"

module purge
module load singularity

# Quatre tâches : la commande part quatre fois. Le Makefile doit lancer un processus distribué.
srun --verbose make run-entrainement-singularity
```

| Directive | Rôle sur Jean Zay |
|---|---|
| `--account=demo@v100` | Compte d'heures GPU. Le suffixe `@v100` désigne les heures V100 du projet. Un projet A100 ou H100 porte un autre suffixe. |
| `-C v100-16g` ou `-C v100-32g` | Contrainte de modèle. Elle choisit la mémoire du V100 lorsque plusieurs modèles partagent la partition. |
| `--partition=gpu_p13` | File d'attente des nœuds visés. Le nom dépend de l'allocation. |
| `--qos=qos_gpu-t3` | Politique de durée et de priorité. Une QoS plus longue, comme `qos_gpu-t4`, n'accepte pas forcément le même `--time`. |
| `--cpus-per-task=10` | Avec 4 GPU et `--hint=nomultithread`, 4 × 10 cœurs occupent un nœud V100 de 40 cœurs. |
| `--mail-type=END,FAIL` | Un message en fin de job ou en échec. `ALL` écrit aussi au démarrage et à chaque changement d'état. |
| `module load singularity` | Environnement de conteneur proposé sur Jean Zay après `module purge`. |
| `TMPDIR=$SCRATCH/torch_tmp` | Évite de remplir `/tmp` du nœud de calcul. `$SCRATCH` est l'espace temporaire du projet. |

`srun --verbose` détaille le lancement dans le journal. On le retire une fois le job au point.

# 19. Les erreurs les plus fréquentes

| Problème | Cause possible | Vérification |
|---|---|---|
| `Invalid partition name` | Partition inexistante ou inaccessible | `sinfo` |
| `QOSMaxWallDurationPerJobLimit` | Durée demandée trop longue pour la politique applicable | Réduire `--time` |
| `OUT_OF_MEMORY` ou `OOM` | Mémoire insuffisante | Consulter les journaux et `sacct` |
| `TIMEOUT` | Durée maximale dépassée | Vérifier `Elapsed` et `--time` |
| `Command not found` | Logiciel absent du `PATH` ou module non chargé | Vérifier l'environnement |
| `Permission denied` | Droits insuffisants ou fichier non exécutable | Vérifier les permissions |
| Aucun fichier de sortie | Mauvais chemin, dossier absent ou programme silencieux | Vérifier `--output`, `--error` et les dossiers |
| Job toujours en attente | Ressources, priorité, limite ou dépendance | `squeue` et `scontrol show job ID` |

Commandes utiles pour diagnostiquer un échec :

```bash
scontrol show job 123456
sacct -j 123456 --format=JobID,State,ExitCode,Elapsed,MaxRSS
```

Puis examiner le fichier `.out` et le fichier `.err`.

# 20. Les bonnes pratiques

- **Tester petit avant de lancer grand.** Vérifie ton programme avec peu de données et des ressources modestes.
- **Estimer correctement le temps.** Une durée trop courte peut interrompre le calcul ; une durée excessive peut rendre la planification moins efficace.
- **Demander la bonne mémoire.** Le dépassement de mémoire peut faire échouer le job.
- **Ne pas calculer sur le nœud de connexion.** Utilise les ressources attribuées par Slurm.
- **Enregistrer les sorties.** Configure des fichiers de logs faciles à retrouver.
- **Utiliser des job arrays** pour les calculs indépendants répétitifs.
- **Vérifier l'état final.** Un job soumis ou démarré n'est pas nécessairement un job réussi.
- **Respecter les politiques du cluster.** Comptes, partitions, limites de temps, GPU et stockage varient selon les centres.
- **Prévoir la sauvegarde des résultats.** Ne considère pas les répertoires temporaires comme un stockage permanent.

# 21. Mémo : les commandes indispensables

| Objectif | Commande |
|---|---|
| Voir les partitions | `sinfo` |
| Soumettre un script | `sbatch calcul.sh` |
| Voir ses jobs | `squeue -u "$USER"` |
| Inspecter un job | `scontrol show job ID` |
| Annuler un job | `scancel ID` |
| Voir l'historique | `sacct -j ID` |
| Ouvrir une session interactive | `srun ... --pty bash` |
| Consulter l'aide | `man sbatch` |
| Afficher les modules | `module avail` |
| Vérifier les logs | `less logs/fichier.out` |

# 22. Ressources officielles et tutoriels

- [Documentation officielle de Slurm](https://slurm.schedmd.com/documentation.html)
- [Guide de démarrage rapide](https://slurm.schedmd.com/quickstart.html)
- [Documentation de `sbatch`](https://slurm.schedmd.com/sbatch.html)
- [Documentation de `srun`](https://slurm.schedmd.com/srun.html)
- [Documentation de `squeue`](https://slurm.schedmd.com/squeue.html)
- [Documentation de `sacct`](https://slurm.schedmd.com/sacct.html)
- [Tutoriel Slurm de la TU Delft](https://doc.daic.tudelft.nl/tutorials/slurm/)

# 23. Conclusion

Pour utiliser Slurm au quotidien, retiens surtout ce cycle :

1. **Explorer** les ressources avec `sinfo`.
2. **Préparer** un script avec les directives `#SBATCH`.
3. **Soumettre** avec `sbatch`.
4. **Suivre** avec `squeue`.
5. **Diagnostiquer** avec `scontrol`, `sacct` et les journaux.
6. **Annuler** avec `scancel` si nécessaire.
7. **Ajuster** les ressources selon les résultats obtenus.

Les commandes sont relativement standard, mais les partitions, les comptes, les logiciels et les politiques de ressources dépendent du cluster. La documentation locale reste donc la référence pour les paramètres exacts.