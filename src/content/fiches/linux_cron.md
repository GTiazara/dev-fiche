---
title: Planifier des tâches avec Cron et Crontab
description: "Maîtriser Cron et Crontab pour automatiser des tâches récurrentes sous Linux : syntaxe, expressions temporelles, commandes, logs et bonnes pratiques en développement."
technology: linux
difficulty: debutant
tags: [linux, cron, crontab, automatisation, bash, devops, planification, fullstack]
publishedAt: 2026-10-26
updatedAt: 2026-10-26
draft: false
# quiz:
#   - question: Quelle commande permet de modifier la crontab de l'utilisateur courant ?
#     choices:
#       - crontab -e
#       - crontab -r
#       - cron --edit
#     answer: 0
#     explanation: `crontab -e` ouvre la table des tâches planifiées de l'utilisateur courant dans l'éditeur configuré.
#   - question: Quelle expression Cron permet d'exécuter une tâche toutes les heures, à la minute 0 ?
#     choices:
#       - `0 * * * *`
#       - `* 0 * * *`
#       - `0 0 * * *`
#     answer: 0
#     explanation: Le premier champ représente les minutes et le deuxième les heures. `0 * * * *` signifie toutes les heures, à la minute 0.
#   - question: Quelle commande permet d'afficher la crontab de l'utilisateur courant ?
#     choices:
#       - crontab -l
#       - crontab -e
#       - crontab -d
#     answer: 0
#     explanation: `crontab -l` affiche les tâches planifiées de l'utilisateur courant sans les modifier.
#   - question: À quoi sert le symbole `*` dans une expression Cron ?
#     choices:
#       - À représenter toutes les valeurs possibles du champ
#       - À désactiver une tâche
#       - À exécuter une commande une seule fois
#     answer: 0
#     explanation: L'astérisque indique toutes les valeurs possibles du champ concerné. Par exemple, dans le champ des heures, `*` signifie toutes les heures.
#   - question: Quelle précaution est essentielle pour une tâche Cron qui doit écrire dans un fichier de logs ?
#     choices:
#       - Utiliser un chemin absolu et vérifier les permissions
#       - Utiliser uniquement des chemins relatifs
#       - Exécuter systématiquement la tâche en tant que root
#     answer: 0
#     explanation: Cron fournit un environnement limité. Les chemins absolus et les permissions adaptées rendent l'exécution plus prévisible et sécurisée.
#   - question: Que signifie l'expression `*/5 * * * *` ?
#     choices:
#       - Toutes les 5 minutes
#       - Tous les 5 jours
#       - Toutes les 5 heures
#     answer: 0
#     explanation: `*/5` dans le champ des minutes indique chaque multiple de cinq minutes, soit aux minutes 0, 5, 10, etc.
#   - question: Quelle commande supprime la crontab de l'utilisateur courant ?
#     choices:
#       - crontab -r
#       - crontab -l
#       - crontab -e
#     answer: 0
#     explanation: `crontab -r` supprime la crontab de l'utilisateur courant. Cette action est destructive ; il faut sauvegarder les tâches avant de l'utiliser.
---

## Définition

**Cron** est un service Unix/Linux qui permet d'exécuter automatiquement des commandes ou des scripts à des horaires définis.

**Crontab** signifie « cron table ». Il s'agit du fichier qui contient les règles de planification des tâches d'un utilisateur.

Ces outils sont particulièrement utiles en développement pour automatiser :
- Les sauvegardes de bases de données.
- Le nettoyage de fichiers temporaires.
- L'envoi périodique d'e-mails.
- La génération de rapports.
- L'exécution de scripts de maintenance.
- Le traitement de données en arrière-plan.

## Syntaxe d'une expression Cron

Une expression Cron classique comporte **5 champs temporels**, suivis de la commande à exécuter.

```text
┌───────────── minute (0 - 59)
│ ┌─────────── heure (0 - 23)
│ │ ┌───────── jour du mois (1 - 31)
│ │ │ ┌─────── mois (1 - 12)
│ │ │ │ ┌───── jour de la semaine (0 - 7, dimanche = 0 ou 7)
│ │ │ │ │
* * * * * commande
```

| Champ | Valeurs possibles | Exemple |
| --- | --- | --- |
| Minute | `0-59` | `30` : à la minute 30 |
| Heure | `0-23` | `8` : à 8 heures |
| Jour du mois | `1-31` | `15` : le 15 du mois |
| Mois | `1-12` | `6` : en juin |
| Jour de la semaine | `0-7` | `1` : lundi sur les systèmes utilisant cette convention |

Les noms des jours et des mois peuvent aussi être acceptés sous forme abrégée, selon l'implémentation.

## Les opérateurs Cron

| Opérateur | Signification | Exemple |
| --- | --- | --- |
| `*` | Toutes les valeurs possibles | `* * * * *` : chaque minute |
| `,` | Plusieurs valeurs | `0 8,12,18 * * *` : à 8 h, 12 h et 18 h |
| `-` | Intervalle de valeurs | `0 9-17 * * *` : à chaque heure de 9 h à 17 h |
| `/` | Pas ou fréquence dans le champ | `*/10 * * * *` : toutes les 10 minutes |

## Commandes fondamentales

```bash
# Modifier la crontab de l'utilisateur courant
crontab -e

# Afficher les tâches planifiées
crontab -l

# Supprimer la crontab de l'utilisateur courant
crontab -r

# Afficher la crontab d'un utilisateur (avec les droits appropriés)
sudo crontab -u www-data -l

# Modifier la crontab d'un utilisateur (avec les droits appropriés)
sudo crontab -u www-data -e

# Vérifier l'état du service cron sur Debian/Ubuntu
systemctl status cron

# Démarrer le service cron sur Debian/Ubuntu
sudo systemctl start cron

# Activer son démarrage automatique sur Debian/Ubuntu
sudo systemctl enable cron
```

**Attention :** le nom du service varie selon les distributions. Sur certaines distributions, notamment Fedora, RHEL ou CentOS, le service s'appelle généralement `crond`.

## Exemples de planification

| Expression | Fréquence |
| --- | --- |
| `* * * * *` | Toutes les minutes |
| `*/5 * * * *` | Toutes les 5 minutes |
| `*/15 * * * *` | Toutes les 15 minutes |
| `0 * * * *` | Toutes les heures, à la minute 0 |
| `0 8 * * *` | Tous les jours à 8 h |
| `30 8 * * *` | Tous les jours à 8 h 30 |
| `0 0 * * *` | Tous les jours à minuit |
| `0 2 * * *` | Tous les jours à 2 h |
| `0 9 * * 1` | Tous les lundis à 9 h |
| `0 9 * * 1-5` | Du lundi au vendredi à 9 h |
| `0 8 1 * *` | Le premier jour de chaque mois à 8 h |
| `0 0 1 1 *` | Le 1er janvier à minuit |

Les heures correspondent au fuseau horaire utilisé par le service Cron, généralement celui du système. Vérifiez la configuration du serveur si l'horaire doit correspondre à un fuseau précis.

## Exemple : automatiser une tâche de développement

### 1. Créer un script Bash

Créer le fichier `/home/dev/scripts/cleanup.sh` :

```bash
#!/bin/bash

set -eu

LOG_FILE="/home/dev/logs/cleanup.log"
TEMP_DIR="/home/dev/app/tmp"

mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$TEMP_DIR"

find "$TEMP_DIR" -type f -mtime +7 -print -delete

echo "Nettoyage terminé : $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
```

Ce script supprime les fichiers de plus de sept jours dans le répertoire temporaire indiqué et consigne son exécution dans un fichier de logs.

**Important :** adaptez les chemins à votre environnement et vérifiez les fichiers concernés avant d'activer une suppression automatique.

### 2. Rendre le script exécutable

```bash
chmod +x /home/dev/scripts/cleanup.sh
```

### 3. Ajouter la tâche à la crontab

```bash
crontab -e
```

Ajouter cette ligne pour exécuter le script chaque jour à 2 h 30 :

```cron
30 2 * * * /home/dev/scripts/cleanup.sh
```

### 4. Rediriger la sortie vers un fichier de logs

```cron
30 2 * * * /home/dev/scripts/cleanup.sh >> /home/dev/logs/cron.log 2>&1
```

- `>>` ajoute la sortie standard à la fin du fichier.
- `2>&1` redirige également les erreurs vers la même destination.
- Le répertoire de logs doit exister ou être créé préalablement.
- L'utilisateur exécutant la tâche doit disposer des permissions nécessaires.

## Variables d'environnement et contexte d'exécution

Cron ne lance généralement pas les commandes dans le même environnement qu'un terminal interactif.

Il faut notamment faire attention à :
- La variable `PATH`.
- La variable `HOME`.
- L'utilisateur qui exécute la tâche.
- Le répertoire courant.
- Les permissions sur les fichiers.
- La disponibilité des services réseau et des dépendances.

Exemple :

```cron
PATH=/usr/local/bin:/usr/bin:/bin
SHELL=/bin/bash
MAILTO=""

*/10 * * * * /usr/bin/python3 /home/dev/scripts/job.py >> /home/dev/logs/job.log 2>&1
```

Dans cet exemple :
- `PATH` définit les répertoires de recherche des exécutables.
- `SHELL` définit le shell utilisé pour interpréter les commandes.
- `MAILTO=""` désactive les notifications par e-mail générées par Cron dans les implémentations qui utilisent cette variable.
- La tâche Python est exécutée toutes les dix minutes.

Les variables prises en charge et les modalités d'envoi des notifications peuvent varier selon le système.

## Les fichiers et répertoires Cron

Sur de nombreuses distributions Linux, les tâches peuvent être définies à plusieurs endroits.

| Emplacement | Utilisation |
| --- | --- |
| `crontab -e` | Tâches de l'utilisateur courant |
| `/etc/crontab` | Crontab système, avec un champ supplémentaire pour l'utilisateur |
| `/etc/cron.d/` | Fichiers de tâches système supplémentaires |
| `/etc/cron.hourly/` | Scripts exécutés périodiquement par le mécanisme horaire de la distribution |
| `/etc/cron.daily/` | Scripts exécutés périodiquement par le mécanisme quotidien de la distribution |
| `/etc/cron.weekly/` | Scripts exécutés périodiquement par le mécanisme hebdomadaire de la distribution |
| `/etc/cron.monthly/` | Scripts exécutés périodiquement par le mécanisme mensuel de la distribution |

Les répertoires de périodicité sont souvent exécutés par `run-parts`, parfois via `anacron` ou des mécanismes propres à la distribution. Leur fréquence réelle dépend de la configuration du système.

## Cron et le développement Full Stack

Cron peut être utilisé pour automatiser de nombreuses opérations techniques.

| Besoin | Exemple de tâche |
| --- | --- |
| Maintenance | Supprimer les fichiers temporaires anciens |
| Base de données | Lancer une sauvegarde quotidienne |
| Backend | Exécuter un script de traitement de données |
| Notifications | Envoyer des rappels périodiques |
| E-commerce | Générer un rapport de commandes |
| Supervision | Vérifier périodiquement un service |
| Fichiers | Archiver des journaux anciens |
| API | Interroger un service externe à intervalles réguliers |

### Exemple : sauvegarde PostgreSQL

```cron
0 3 * * * /usr/bin/pg_dump -U app_user ma_base > /home/dev/backups/ma_base.sql 2>> /home/dev/logs/backup.log
```

Cette tâche lance une sauvegarde quotidienne à 3 h.

Pour un usage en production, prévoyez notamment :
- Un répertoire de sauvegarde protégé.
- Une authentification sécurisée, par exemple via un fichier `.pgpass` correctement protégé.
- Une rotation des sauvegardes.
- Une surveillance des erreurs.
- Des tests réguliers de restauration.
- Une stratégie de stockage externe si nécessaire.

Une sauvegarde non testée ne garantit pas que les données pourront être restaurées.

## Cron dans un environnement Docker

Dans une architecture Docker, il est généralement préférable de séparer les responsabilités des conteneurs.

Pour une tâche planifiée, plusieurs solutions sont possibles :
- Un service dédié exécutant Cron.
- Un conteneur de tâche lancé périodiquement par un ordonnanceur externe.
- Un ordonnanceur intégré à la plateforme d'hébergement.
- Un ordonnanceur applicatif adapté aux besoins du projet.

Il est déconseillé de lancer plusieurs processus indépendants dans un conteneur applicatif sans avoir prévu leur supervision.

Exemple de service dédié dans un fichier Compose :

```yaml
services:
  scheduler:
    build: .
    command: ["cron", "-f"]
    restart: unless-stopped
```

Cet exemple suppose que l'image est basée sur un système disposant de Cron et que le service a été correctement configuré pour charger les tâches planifiées. La commande `cron -f` est notamment adaptée à certaines images Debian ou Ubuntu ; d'autres images peuvent utiliser une syntaxe différente.

Pour des besoins complexes, comme la gestion des dépendances entre tâches, les nouvelles tentatives ou le suivi des exécutions, un ordonnanceur spécialisé peut être préférable.

## Pièges et points de vigilance

- **Chemins relatifs :** privilégiez les chemins absolus dans les tâches Cron.
- **Permissions :** vérifiez les droits de l'utilisateur exécutant le script.
- **Environnement limité :** définissez explicitement les variables indispensables.
- **Logs absents :** redirigez la sortie standard et les erreurs pour faciliter le diagnostic.
- **Exécutions simultanées :** une tâche longue peut encore tourner lorsque l'exécution suivante commence.
- **Fuseau horaire :** vérifiez le fuseau du système et le comportement lors des changements d'heure.
- **Commandes destructrices :** testez soigneusement les scripts avant leur planification.
- **Secrets :** ne placez pas de mots de passe directement dans une crontab accessible à d'autres utilisateurs.
- **Disponibilité :** les tâches Cron ne sont pas nécessairement rejouées après l'arrêt du serveur.
- **Droits root :** n'exécutez pas systématiquement toutes les tâches avec des privilèges élevés.

### Éviter les exécutions simultanées avec `flock`

Pour une tâche qui ne doit pas s'exécuter en parallèle avec elle-même, `flock` peut être utilisé lorsqu'il est disponible :

```cron
*/5 * * * * /usr/bin/flock -n /tmp/mon-job.lock /home/dev/scripts/job.sh >> /home/dev/logs/job.log 2>&1
```

Si le verrou est déjà détenu, la nouvelle exécution ne démarre pas.

Le fichier de verrouillage doit être placé dans un répertoire approprié et accessible à l'utilisateur concerné.

## À retenir

Cron est un mécanisme de planification de tâches sous Linux. Crontab permet de définir ces tâches à l'aide de cinq champs temporels : minute, heure, jour du mois, mois et jour de la semaine.

Les commandes essentielles sont :
- `crontab -e` : modifier les tâches.
- `crontab -l` : afficher les tâches.
- `crontab -r` : supprimer la crontab.
- `systemctl status cron` : vérifier le service sur Debian/Ubuntu.

Pour un développeur, les points essentiels sont la maîtrise de la syntaxe Cron, l'utilisation de chemins absolus, la gestion des logs, la vérification des permissions et la prévention des exécutions simultanées.

## Sources

- [Documentation officielle Linux man-pages — crontab(1)](https://man7.org/linux/man-pages/man1/crontab.1.html)
- [Documentation officielle Linux man-pages — crontab(5)](https://man7.org/linux/man-pages/man5/crontab.5.html)
- [Documentation officielle Debian — cron](https://wiki.debian.org/cron)
- [Documentation Docker — bonnes pratiques](https://docs.docker.com/build/building/best-practices/)