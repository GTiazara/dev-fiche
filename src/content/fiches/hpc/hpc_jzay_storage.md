---
title: Gestion des espaces disque jzay — HOME, WORK, SCRATCH et STORE
description: Comprendre les espaces de stockage Linux et HPC pour organiser le code source, les données, les fichiers temporaires et les résultats de calcul. Découvrir les variables d'environnement, les commandes de gestion du stockage et les bonnes pratiques.
technology: hpc
difficulty: debutant
tags: [linux, stockage, filesystem, hpc, home, work, scratch, store, calcul-haute-performance, devops]
publishedAt: 2026-10-27
updatedAt: 2026-10-27
draft: false
quiz:
  - question: Quel espace est généralement destiné aux fichiers personnels et aux configurations utilisateur ?
    choices:
      - $HOME
      - $SCRATCH
      - $STORE
    answer: 0
    explanation: "`$HOME` contient généralement les fichiers personnels, les configurations, les scripts et le code source de petite taille."
  - question: Quel espace est généralement adapté aux fichiers temporaires et intermédiaires des calculs HPC ?
    choices:
      - $HOME
      - $SCRATCH
      - $STORE
    answer: 1
    explanation: "`$SCRATCH` est généralement conçu pour les données temporaires et les fichiers intermédiaires. Il peut être nettoyé automatiquement et ne doit pas être considéré comme un espace d'archivage."
  - question: Quelle commande permet d'afficher l'espace disque disponible sur les systèmes de fichiers montés ?
    choices:
      - du -a
      - df -h
      - ls -lh
    answer: 1
    explanation: "`df -h` affiche l'espace total, utilisé et disponible dans un format lisible par un humain."
  - question: Où faut-il conserver durablement les résultats importants d'un calcul ?
    choices:
      - Uniquement dans $SCRATCH
      - Dans un espace de stockage pérenne adapté, tel que $STORE si sa politique le permet
      - Dans /tmp sans sauvegarde
    answer: 1
    explanation: Les résultats importants doivent être transférés vers un espace pérenne et adapté à leur conservation. Les caractéristiques exactes de `$STORE` dépendent de l'infrastructure.
---

## Définition

Dans un environnement Linux ou HPC (*High Performance Computing*, ou calcul haute performance), plusieurs espaces de stockage peuvent être mis à disposition des utilisateurs.

Chaque espace répond à un besoin particulier : conserver les fichiers personnels, développer une application, exécuter des calculs, manipuler des données volumineuses ou archiver des résultats.

Les variables d'environnement telles que `$HOME`, `$WORK`, `$SCRATCH` et `$STORE` permettent d'accéder à ces espaces sans avoir à mémoriser leurs chemins absolus.

**Attention :** ces quatre noms ne constituent pas une norme universelle. Leur disponibilité, leur emplacement, leurs quotas, leurs performances, leurs politiques de sauvegarde et leurs règles de suppression dépendent du système utilisé.

## Comparatif des espaces disque

| Espace | Utilisation habituelle | Type de données | Conservation |
| --- | --- | --- | --- |
| `$HOME` | Fichiers personnels et configuration | Scripts, code source, fichiers cachés, petits outils | Généralement durable, selon la politique du système |
| `$WORK` | Travail actif et données de projet | Code en cours, jeux de données de travail, fichiers nécessaires aux calculs | Variable selon l'infrastructure |
| `$SCRATCH` | Calculs et traitements temporaires | Fichiers intermédiaires, caches, données temporaires, résultats provisoires | Généralement temporaire, parfois avec purge automatique |
| `$STORE` | Conservation de données et de résultats | Résultats importants, données de référence, archives | Potentiellement durable, selon la politique du système |

### Règle générale

- **HOME :** configurer et préparer son environnement.
- **WORK :** travailler sur son projet et ses données actives.
- **SCRATCH :** effectuer les calculs et stocker les données temporaires.
- **STORE :** conserver les données et les résultats qui doivent être préservés, si cet espace est prévu à cet effet.

Cette répartition est indicative. Il faut toujours consulter la documentation de son centre de calcul avant de décider où stocker des données importantes.

## Syntaxe et commandes fondamentales

### 1. Identifier les espaces disponibles

Les variables d'environnement indiquent les chemins associés aux espaces de stockage lorsqu'elles sont définies.

```bash
# Afficher le répertoire personnel
echo "$HOME"

# Afficher les autres espaces s'ils existent
echo "${WORK:-Non défini}"
echo "${SCRATCH:-Non défini}"
echo "${STORE:-Non défini}"

# Afficher les variables d'environnement liées au stockage
env | grep -E '^(HOME|WORK|SCRATCH|STORE)='
```

Si une variable n'est pas définie, elle ne peut pas être utilisée comme chemin valide sans configuration supplémentaire.

**Conseil :** utilise les variables fournies par ton système plutôt que de supposer que les chemins sont identiques d'une machine à l'autre.

### 2. Se déplacer entre les espaces

```bash
# Accéder à son répertoire personnel
cd "$HOME"

# Accéder à WORK si la variable est définie
cd "$WORK"

# Accéder à SCRATCH si la variable est définie
cd "$SCRATCH"

# Accéder à STORE si la variable est définie
cd "$STORE"

# Afficher le répertoire courant
pwd
```

Avant d'utiliser un espace, vérifie que la variable existe :

```bash
# Vérifier WORK
if [ -n "${WORK:-}" ] && [ -d "$WORK" ]; then
    echo "WORK disponible : $WORK"
else
    echo "WORK non défini ou inaccessible"
fi
```

Tu peux reprendre le même modèle pour les autres variables.

### 3. Organiser son projet

Une organisation simple peut séparer le code source, les données d'entrée, les résultats intermédiaires et les résultats définitifs.

Exemple de structure :

```text
WORK/
└── mon-projet/
    ├── src/
    │   ├── main.py
    │   └── utils.py
    ├── scripts/
    │   └── run.sh
    ├── data/
    │   └── input.csv
    └── README.md

SCRATCH/
└── mon-projet/
    ├── cache/
    ├── temporary/
    └── output-intermediate/

STORE/
└── mon-projet/
    ├── results/
    ├── reports/
    └── archives/
```

Cette arborescence est un exemple logique : elle ne signifie pas que les dossiers `WORK`, `SCRATCH` et `STORE` existent nécessairement sur ta machine.

Pour créer les répertoires nécessaires :

```bash
# Créer les dossiers de travail
mkdir -p "$WORK/mon-projet/src"
mkdir -p "$WORK/mon-projet/scripts"

# Créer un dossier temporaire de calcul
mkdir -p "$SCRATCH/mon-projet/temporary"

# Créer un dossier de résultats pérennes
mkdir -p "$STORE/mon-projet/results"
```

Exécute ces commandes uniquement si les variables correspondantes sont définies et si tu disposes des autorisations nécessaires.

### 4. Mesurer l'espace disque disponible

La commande `df` permet de connaître l'espace disponible sur les systèmes de fichiers.

```bash
# Afficher l'espace disque dans un format lisible
df -h

# Examiner le système de fichiers contenant HOME
df -h "$HOME"

# Examiner le système de fichiers contenant WORK
df -h "$WORK"

# Examiner le système de fichiers contenant SCRATCH
df -h "$SCRATCH"
```

Pour connaître la taille d'un répertoire et de son contenu :

```bash
# Taille totale du répertoire personnel
du -sh "$HOME"

# Taille du projet de travail
du -sh "$WORK/mon-projet"

# Taille des données temporaires
du -sh "$SCRATCH/mon-projet"
```

**Différence importante :**

- `df -h` affiche l'espace disponible sur le système de fichiers.
- `du -sh` estime l'espace occupé par un répertoire.

Dans les environnements HPC, des quotas peuvent limiter ton espace indépendamment de l'espace libre affiché par `df`. Certains systèmes limitent également le nombre de fichiers et de répertoires.

### 5. Copier des données entre les espaces

Lorsqu'un calcul est terminé, les résultats à conserver doivent être copiés vers un espace pérenne adapté.

```bash
# Copier un fichier de résultats vers STORE
cp "$SCRATCH/mon-projet/resultat.csv" \
   "$STORE/mon-projet/results/"

# Copier un répertoire de résultats
cp -r "$SCRATCH/mon-projet/output/" \
      "$STORE/mon-projet/results/"
```

Pour les gros volumes de données, `rsync` permet de synchroniser les fichiers plus efficacement :

```bash
# Synchroniser un dossier de résultats
rsync -av \
    "$SCRATCH/mon-projet/output/" \
    "$STORE/mon-projet/results/"
```

Dans cette commande, la barre oblique finale du chemin source indique que l'on synchronise le contenu du dossier `output`.

**Attention :** la copie ne supprime pas les fichiers sources. Vérifie la réussite du transfert avant de nettoyer les données temporaires.

### 6. Nettoyer les fichiers temporaires

Les espaces temporaires peuvent accumuler des fichiers inutiles et consommer rapidement le quota disponible.

Avant toute suppression, vérifie le chemin concerné :

```bash
# Afficher le chemin SCRATCH
printf 'SCRATCH = %s\n' "$SCRATCH"

# Afficher le contenu du dossier temporaire
ls -lah "$SCRATCH/mon-projet/temporary"
```

Pour supprimer un fichier temporaire précis :

```bash
rm -- "$SCRATCH/mon-projet/temporary/fichier.tmp"
```

Pour supprimer un dossier temporaire spécifique et son contenu :

```bash
rm -r -- "$SCRATCH/mon-projet/temporary"
```

**Point de vigilance :** vérifie toujours le chemin avant d'utiliser `rm -r`. Ne lance pas une suppression sur une variable potentiellement vide ou incorrecte.

De nombreux centres HPC disposent également d'une politique de purge automatique de `$SCRATCH`. Consulte leur documentation pour connaître les délais et les critères de suppression.

## Exemple pratique : exécuter un calcul et conserver les résultats

Imaginons un programme Python qui lit un jeu de données, réalise un calcul et produit un fichier de résultats.

Le principe consiste à conserver le code dans un espace de travail et à exécuter le traitement dans un répertoire temporaire.

```bash
# Vérifier que les espaces nécessaires sont définis
: "${WORK:?La variable WORK doit être définie}"
: "${SCRATCH:?La variable SCRATCH doit être définie}"
: "${STORE:?La variable STORE doit être définie}"

# Définir les répertoires du projet
PROJECT="$WORK/mon-projet"
JOB_DIR="$SCRATCH/mon-projet/job-001"
RESULT_DIR="$STORE/mon-projet/results"

# Créer les répertoires nécessaires
mkdir -p "$JOB_DIR" "$RESULT_DIR"

# Copier le script dans l'espace de calcul
cp "$PROJECT/src/main.py" "$JOB_DIR/"

# Exécuter le programme depuis le répertoire temporaire
cd "$JOB_DIR"
python main.py

# Copier les résultats vers l'espace pérenne
cp resultat.csv "$RESULT_DIR/"
```

Cet exemple suppose que Python est installé, que le programme génère `resultat.csv` et que les chemins utilisés correspondent à ton infrastructure.

Pour un calcul HPC lancé avec un ordonnanceur comme Slurm, il faut également tenir compte des variables et des règles propres aux nœuds de calcul.

## Cas d'usage fréquents

- **Développement logiciel :** conserver les scripts, le code et les fichiers de configuration dans `$HOME` ou `$WORK`, selon les recommandations locales.
- **Calcul scientifique :** utiliser `$SCRATCH` pour les fichiers intermédiaires volumineux.
- **Analyse de données :** conserver les données d'entrée dans un espace adapté et déplacer les résultats définitifs vers un stockage pérenne.
- **Calculs HPC :** limiter les opérations intensives sur le système de fichiers personnel lorsque celui-ci n'est pas conçu pour les entrées-sorties parallèles.
- **Archivage :** utiliser `$STORE` uniquement après avoir vérifié sa politique de conservation et son adéquation avec les données à archiver.

## Mots-clés

| Terme | Définition |
| --- | --- |
| `HOME` | Espace personnel contenant généralement les configurations et les fichiers utilisateur. |
| `WORK` | Espace de travail destiné aux projets et aux données actives sur les systèmes qui le proposent. |
| `SCRATCH` | Espace généralement réservé aux données temporaires et aux traitements. |
| `STORE` | Espace de stockage dont la fonction peut être la conservation durable ou l'archivage. |
| `Quota` | Limite de stockage ou de nombre de fichiers attribuée à un utilisateur ou à un projet. |
| `Filesystem` | Système qui organise et gère les fichiers sur un support de stockage. |
| `Purge` | Suppression automatique de fichiers selon une politique définie par l'administrateur. |
| `Sauvegarde` | Copie permettant de restaurer des données après une perte ou un incident. |
| `Variable d'environnement` | Valeur accessible aux programmes et aux commandes d'un environnement de shell. |

## Pièges et points de vigilance

- **Supposer que toutes les variables existent :** `$WORK`, `$SCRATCH` et `$STORE` ne sont pas systématiquement définies.
- **Confondre stockage et sauvegarde :** un espace pérenne n'est pas nécessairement sauvegardé.
- **Conserver des résultats importants dans SCRATCH :** une purge automatique peut entraîner leur perte.
- **Dépasser les quotas :** surveille la taille des fichiers et le nombre de fichiers créés.
- **Utiliser HOME pour des calculs intensifs :** certains systèmes de fichiers personnels sont peu adaptés aux entrées-sorties massives.
- **Supprimer des fichiers sans vérifier le chemin :** contrôle les variables d'environnement avant d'utiliser une commande destructive.
- **Ignorer les politiques locales :** les durées de conservation, les quotas et les performances doivent être vérifiés dans la documentation du centre de calcul.

## Ressources Internet

La référence pour les espaces disques de Jean Zay est la documentation IDRIS. Les quotas, les sauvegardes et la durée de vie des fichiers y sont ceux de cette machine.

1. **[IDRIS — Espaces disques de Jean Zay](http://www.idris.fr/docs/jean-zay/environnement/espaces-disques/)**  
   HOME, WORK, SCRATCH, JOBSCRATCH, STORE et DSDIR : chemins (`$HOME`, `$WORK`, `$SCRATCH`, `$STORE`), quotas et usages sur Jean Zay.

2. **[GNU Coreutils — Disk usage](https://www.gnu.org/software/coreutils/manual/html_node/du-invocation.html)**  
   Documentation de la commande `du`, utilisée pour mesurer la taille d'un répertoire.

3. **[GNU Coreutils — Disk free](https://www.gnu.org/software/coreutils/manual/html_node/df-invocation.html)**  
   Documentation de la commande `df`, utilisée pour afficher l'espace disque disponible.

## À retenir

Le choix du bon espace disque est essentiel pour éviter les pertes de données, les problèmes de quotas et les ralentissements.

Retenons cette règle générale :

- `$HOME` : fichiers personnels et configuration.
- `$WORK` : code et données de travail.
- `$SCRATCH` : calculs et données temporaires.
- `$STORE` : résultats à conserver, si l'espace est prévu pour cet usage.

**Règle d'or :** avant de stocker des données importantes, vérifie la documentation de ton infrastructure, les quotas, les politiques de sauvegarde et les délais de purge.