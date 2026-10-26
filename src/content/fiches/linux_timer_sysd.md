---
title: "Timers systemd : automatiser des tâches sous Linux"
description: "Comprendre, configurer et utiliser les timers systemd pour planifier des tâches automatisées sous Linux."
technology: linux
difficulty: intermediaire
tags:
  - linux
  - systemd
  - automatisation
  - planification
  - devops
publishedAt: 2026-10-26
updatedAt: 2026-10-26
draft: false
quiz:
  - question: "Quel est le rôle d'un fichier `.timer` ?"
    choices:
      - "Déclencher une unité systemd selon un calendrier ou un intervalle"
      - "Décrire directement le script à exécuter"
      - "Consulter les journaux d'un service"
    answer: 0
    explanation: "Le timer définit quand déclencher une autre unité, généralement un fichier `.service`."
  - question: "Quelle directive convient pour exécuter une tâche chaque jour à 2 h ?"
    choices:
      - "`OnCalendar=*-*-* 02:00:00`"
      - "`Persistent=true`"
      - "`WantedBy=timers.target`"
    answer: 0
    explanation: "`OnCalendar=` exprime un horaire calendaire; `systemd-analyze calendar` permet d'en vérifier la syntaxe."
  - question: "Que fait `Persistent=true` pour un timer calendaire ?"
    choices:
      - "Permet de rattraper une échéance manquée pendant que le timer était inactif"
      - "Relance automatiquement un service après chaque échec"
      - "Rejoue toutes les échéances manquées une par une"
    answer: 0
    explanation: "Cette option peut déclencher le service après la réactivation du timer si une échéance calendaire a été manquée."
  - question: "Quelle commande démarre un timer et l'active pour les prochains démarrages ?"
    choices:
      - "`sudo systemctl enable --now backup.timer`"
      - "`sudo systemctl daemon-reload backup.timer`"
      - "`sudo journalctl enable backup.timer`"
    answer: 0
    explanation: "`enable --now` active le timer au démarrage et le démarre immédiatement."
  - question: "Quelle commande aide à consulter les journaux du service déclenché ?"
    choices:
      - "`sudo journalctl -u backup.service`"
      - "`systemd-analyze calendar backup.service`"
      - "`systemctl list-timers backup.service`"
    answer: 0
    explanation: "`journalctl -u` filtre les journaux de l'unité indiquée."
---

## 1. Introduction à systemd

### Qu'est-ce que systemd ?

**systemd** est un système d'initialisation et de gestion des services utilisé par de nombreuses distributions Linux, notamment Debian, Ubuntu, Fedora et leurs dérivées.

Il permet notamment de :
- démarrer et arrêter des services ;
- gérer les dépendances entre services ;
- lancer des tâches au démarrage du système ;
- superviser les processus ;
- centraliser les journaux avec `journald` ;
- planifier l'exécution de tâches grâce aux timers.

Les unités systemd sont décrites dans des fichiers de configuration appelés *unit files*.

Les principaux types d'unités sont :

| Extension | Rôle |
|---|---|
| `.service` | Décrit un service ou une tâche à exécuter |
| `.timer` | Déclenche une unité selon un calendrier ou un intervalle |
| `.target` | Regroupe plusieurs unités dans un état ou une phase du système |
| `.socket` | Permet notamment l'activation d'un service lors d'une connexion à un socket |
| `.mount` | Décrit un point de montage |
| `.path` | Surveille des fichiers ou des répertoires |

**À retenir :** un timer systemd ne décrit généralement pas le travail à effectuer. Il détermine quand une autre unité, le plus souvent un service, doit être déclenchée.

### Qu'est-ce qu'un timer systemd ?

Un **timer systemd** permet de déclencher automatiquement une unité à un moment précis ou à intervalles réguliers.

Il peut servir à :
- sauvegarder une base de données ;
- nettoyer des fichiers temporaires ;
- lancer un script de maintenance ;
- actualiser des données ;
- générer des rapports ;
- exécuter des traitements périodiques ;
- vérifier la disponibilité d'un service.

Un timer repose généralement sur deux fichiers :

```text
/etc/systemd/system/
├── sauvegarde.service
└── sauvegarde.timer
```

Le fichier `.service` décrit **quoi exécuter**, tandis que le fichier `.timer` décrit **quand l'exécuter**.

---

## Comprendre les timers et les services

### Le fichier `.service`

Un fichier `.service` définit le programme à lancer et les conditions de son exécution.

Exemple : `/etc/systemd/system/maintenance.service`

```ini
[Unit]
Description=Exécution d'une tâche de maintenance

[Service]
Type=oneshot
ExecStart=/usr/local/bin/maintenance.sh
```

Explications :

- `Description=` : décrit le service.
- `Type=oneshot` : indique que le service effectue une tâche ponctuelle puis se termine.
- `ExecStart=` : indique la commande à exécuter.

Le script doit exister et être accessible par le compte qui exécute le service.

Pour ce type de tâche, `Type=oneshot` est généralement adapté.

### Le fichier `.timer`

Le fichier `.timer` définit le calendrier ou l'intervalle d'exécution.

Exemple : `/etc/systemd/system/maintenance.timer`

```ini
[Unit]
Description=Planification de la maintenance

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true
Unit=maintenance.service

[Install]
WantedBy=timers.target
```

Explications :

- `OnCalendar=` : définit un horaire selon un calendrier.
- `Persistent=true` : permet de rattraper une exécution calendaire manquée pendant que le timer était inactif.
- `Unit=` : désigne l'unité déclenchée. Si cette directive est omise, systemd utilise généralement le nom du service correspondant au timer.
- `WantedBy=timers.target` : permet d'activer le timer au démarrage via `systemctl enable`.

Ici, le service est planifié chaque jour à 2 h du matin.

### Comment fonctionne le déclenchement ?

Le fonctionnement peut être résumé ainsi :

1. Le timer est activé.
2. systemd surveille l'échéance configurée.
3. Lorsque l'échéance est atteinte, systemd déclenche le service associé.
4. Le service exécute sa commande.
5. Une fois la tâche terminée, le service s'arrête si son type et son fonctionnement le prévoient.

Un timer ne garantit pas qu'une tâche s'exécutera exactement à la milliseconde prévue. Des paramètres comme `AccuracySec=` peuvent autoriser une certaine marge de déclenchement.

**Point important :** un timer ne lance pas automatiquement une nouvelle instance du même service si ce service est déjà en cours d'exécution. Pour les tâches périodiques, il faut donc tenir compte de leur durée et éviter les chevauchements.

---

## Installer et vérifier systemd

Sur la plupart des distributions modernes utilisant systemd, aucune installation supplémentaire n'est nécessaire.

Pour vérifier le système d'initialisation :

```bash
ps -p 1 -o comm=
```

Si la commande renvoie :

```text
systemd
```

cela indique que le processus numéro 1 est systemd.

Pour vérifier la version :

```bash
systemctl --version
```

Pour consulter l'état général du gestionnaire systemd :

```bash
systemctl is-system-running
```

La commande peut notamment renvoyer `running`, `degraded` ou `maintenance`, selon l'état du système.

---

## Créer son premier timer systemd

Nous allons créer un script qui écrit une date dans un fichier de journal, puis le planifier toutes les cinq minutes.

### Créer le script

Créons le fichier `/usr/local/bin/hello-timer.sh` :

```bash
sudo nano /usr/local/bin/hello-timer.sh
```

Contenu :

```bash
#!/bin/bash

echo "Tâche exécutée le $(date)" >> /var/log/hello-timer.log
```

Rendons le script exécutable :

```bash
sudo chmod +x /usr/local/bin/hello-timer.sh
```

Le fichier `/var/log/hello-timer.log` sera créé si le compte d'exécution dispose des permissions nécessaires.

Dans cet exemple, le service sera exécuté par défaut avec les privilèges de l'utilisateur système, généralement `root`. Pour une application réelle, il est préférable d'utiliser un compte dédié lorsque cela est possible.

### Créer le service

Créons le fichier :

```bash
sudo nano /etc/systemd/system/hello-timer.service
```

Contenu :

```ini
[Unit]
Description=Exécution du script hello-timer

[Service]
Type=oneshot
ExecStart=/usr/local/bin/hello-timer.sh
```

Le service est de type `oneshot` car il exécute une commande ponctuelle puis se termine.

### Créer le timer

Créons le fichier :

```bash
sudo nano /etc/systemd/system/hello-timer.timer
```

Contenu :

```ini
[Unit]
Description=Exécution de hello-timer toutes les cinq minutes

[Timer]
OnCalendar=*-*-* *:0/5:00
Unit=hello-timer.service

[Install]
WantedBy=timers.target
```

L'expression `OnCalendar=*-*-* *:0/5:00` indique une exécution toutes les cinq minutes, à partir de la première minute multiple de cinq après l'activation.

Une autre méthode, souvent plus simple pour exprimer un intervalle régulier, consiste à utiliser `OnUnitActiveSec=`. Elle sera présentée plus loin.

### Recharger la configuration systemd

Après la création ou la modification d'un fichier d'unité, rechargeons la configuration :

```bash
sudo systemctl daemon-reload
```

Cette commande demande à systemd de relire les fichiers d'unités.

### Tester le service manuellement

Avant d'activer le timer, vérifions que le service fonctionne :

```bash
sudo systemctl start hello-timer.service
```

Consultons le résultat :

```bash
sudo cat /var/log/hello-timer.log
```

Si le fichier contient une date, le script a probablement été exécuté correctement.

Nous pouvons également consulter les journaux systemd :

```bash
sudo journalctl -u hello-timer.service
```

### Activer le timer

Pour démarrer le timer immédiatement :

```bash
sudo systemctl start hello-timer.timer
```

Pour qu'il soit activé automatiquement lors des démarrages suivants :

```bash
sudo systemctl enable hello-timer.timer
```

Pour effectuer les deux opérations en une seule commande :

```bash
sudo systemctl enable --now hello-timer.timer
```

Vérifions son état :

```bash
systemctl status hello-timer.timer
```

**À retenir :** il faut activer le fichier `.timer`, pas seulement le fichier `.service`, pour mettre en place cette planification.

---

## Planifier une tâche avec OnCalendar

### Comprendre OnCalendar

La directive `OnCalendar=` permet de définir une échéance selon un calendrier.

Elle accepte des expressions décrivant une date, une heure ou une périodicité.

Exemples :

| Expression | Signification |
|---|---|
| `*-*-* 02:00:00` | Tous les jours à 2 h |
| `Mon *-*-* 08:00:00` | Tous les lundis à 8 h |
| `*-*-01 00:00:00` | Le premier jour de chaque mois à minuit |
| `*-*-* 12:00:00` | Tous les jours à midi |
| `*-*-* *:00:00` | Toutes les heures, au début de l'heure |
| `*-*-* *:0/15:00` | Toutes les quinze minutes |
| `Mon..Fri *-*-* 09:00:00` | Du lundi au vendredi à 9 h |
| `*-*-* 09,13,17:00:00` | Tous les jours à 9 h, 13 h et 17 h |

Ces expressions utilisent la syntaxe de calendrier propre à systemd. Elles ne sont pas identiques aux expressions cron.

### Exécuter un script tous les jours à 3 h

Fichier `/etc/systemd/system/backup.timer` :

```ini
[Unit]
Description=Sauvegarde quotidienne

[Timer]
OnCalendar=*-*-* 03:00:00
Persistent=true
Unit=backup.service

[Install]
WantedBy=timers.target
```

Le service associé est déclenché chaque jour à 3 h.

### Exécuter un script chaque lundi à 8 h

```ini
[Timer]
OnCalendar=Mon *-*-* 08:00:00
Unit=rapport.service
```

Cette configuration convient, par exemple, à la génération hebdomadaire d'un rapport.

### Vérifier une expression de calendrier

Pour vérifier la syntaxe d'une expression :

```bash
systemd-analyze calendar '*-*-* 02:00:00'
```

La commande affiche l'interprétation de l'expression ainsi que la prochaine échéance calculée.

Pour afficher plusieurs prochaines occurrences :

```bash
systemd-analyze calendar --iterations=5 '*-*-* 02:00:00'
```

Cette vérification est particulièrement utile avant de déployer une planification en production.

---

## Planifier une tâche à intervalles réguliers

### Utiliser OnUnitActiveSec

La directive `OnUnitActiveSec=` définit un délai relatif à la dernière activation de l'unité associée.

Exemple :

```ini
[Timer]
OnUnitActiveSec=5min
Unit=maintenance.service
```

Ce paramètre permet de programmer un nouveau déclenchement cinq minutes après l'activation précédente du service.

Avec un service `oneshot`, cela permet d'obtenir un fonctionnement périodique lorsque le timer reste actif.

### Utiliser OnBootSec

La directive `OnBootSec=` définit un délai après le démarrage du système.

Exemple :

```ini
[Timer]
OnBootSec=2min
Unit=initialisation.service
```

Le service est déclenché deux minutes après le démarrage du système.

Cette méthode est adaptée à une tâche qui doit s'exécuter peu après le démarrage, sans attendre une heure fixe.

### Combiner plusieurs directives

Il est possible de combiner plusieurs événements de déclenchement dans un même timer.

Exemple :

```ini
[Timer]
OnBootSec=2min
OnUnitActiveSec=15min
Unit=surveillance.service
```

Le timer prévoit une première activation après le démarrage, puis des activations répétées selon l'intervalle défini.

**Attention :** les délais relatifs ne constituent pas un calendrier absolu. Pour une tâche devant être exécutée à une heure précise chaque jour, préférez `OnCalendar=`.

### Comparaison entre les principales directives

| Directive | Fonction |
|---|---|
| `OnCalendar=` | Déclenchement selon une date ou une heure |
| `OnBootSec=` | Déclenchement après le démarrage du système |
| `OnStartupSec=` | Déclenchement après le démarrage du gestionnaire systemd |
| `OnUnitActiveSec=` | Délai calculé depuis la dernière activation de l'unité |
| `OnUnitInactiveSec=` | Délai calculé depuis la dernière désactivation de l'unité |
| `OnActiveSec=` | Délai calculé depuis l'activation du timer |

Ces directives ne sont pas interchangeables. Le choix dépend de la référence temporelle souhaitée.

---

## Comprendre Persistent=true

### À quoi sert Persistent ?

La directive `Persistent=true` concerne les timers qui utilisent `OnCalendar=`.

Elle permet de détecter qu'une échéance a été manquée pendant que le timer était inactif et de déclencher le service lorsqu'il est réactivé.

Exemple :

```ini
[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true
Unit=backup.service
```

Imaginons que :
- une sauvegarde est planifiée tous les jours à 2 h ;
- le serveur est arrêté à cette heure ;
- le serveur redémarre à 8 h.

Si une échéance a été manquée pendant l'arrêt, systemd peut déclencher le service après la réactivation du timer.

### Ce que Persistent ne garantit pas

`Persistent=true` ne signifie pas que toutes les exécutions manquées seront rejouées individuellement.

Il ne garantit pas non plus :
- la réussite de la sauvegarde ;
- l'exécution si le timer n'est jamais réactivé ;
- le rattrapage des échéances d'un timer purement relatif ;
- la répétition automatique d'une tâche qui a échoué.

Pour une sauvegarde critique, il reste nécessaire de vérifier les résultats et de prévoir une stratégie de reprise.

---

## Gérer les timers avec systemctl

`systemctl` est la commande principale pour gérer les unités systemd.

### Démarrer un timer

```bash
sudo systemctl start backup.timer
```

Le timer démarre immédiatement, mais cette commande ne garantit pas son activation aux prochains démarrages.

### Activer un timer au démarrage

```bash
sudo systemctl enable backup.timer
```

Cette commande configure son activation automatique selon les dépendances définies.

### Démarrer et activer simultanément

```bash
sudo systemctl enable --now backup.timer
```

C'est une commande pratique pour mettre en place une planification.

### Arrêter un timer

```bash
sudo systemctl stop backup.timer
```

Le timer cesse de déclencher de nouvelles exécutions. Cela n'interrompt pas nécessairement un service déjà en cours.

### Désactiver un timer au démarrage

```bash
sudo systemctl disable backup.timer
```

Cette commande supprime son activation automatique, mais ne garantit pas qu'il soit arrêté immédiatement s'il est actuellement actif.

Pour le désactiver et l'arrêter :

```bash
sudo systemctl disable --now backup.timer
```

### Lister les timers

```bash
systemctl list-timers
```

Pour afficher aussi les timers qui ne sont pas actifs :

```bash
systemctl list-timers --all
```

La liste présente notamment :
- la prochaine échéance ;
- le temps restant ;
- la dernière exécution ;
- l'unité déclenchée.

### Consulter l'état d'un timer

```bash
systemctl status backup.timer
```

Cette commande permet de vérifier si le timer est chargé, actif et correctement reconnu par systemd.

---

## Consulter les journaux et diagnostiquer les erreurs

### Afficher les journaux d'un service

```bash
sudo journalctl -u backup.service
```

Pour afficher les journaux les plus récents :

```bash
sudo journalctl -u backup.service -n 50
```

Pour suivre les journaux en temps réel :

```bash
sudo journalctl -u backup.service -f
```

### Consulter les journaux d'un timer

```bash
sudo journalctl -u backup.timer
```

Le journal du timer permet notamment de rechercher des informations relatives à son activation et à son fonctionnement.

Pour comprendre pourquoi la tâche elle-même a échoué, consultez également les journaux du service associé.

### Vérifier la configuration

Pour examiner la configuration effective d'une unité :

```bash
systemctl cat backup.timer
```

Pour afficher certaines propriétés :

```bash
systemctl show backup.timer
```

Après une modification, rechargez les fichiers d'unités :

```bash
sudo systemctl daemon-reload
```

Si le timer est déjà actif et que son calendrier doit être recalculé, un redémarrage explicite peut être utile :

```bash
sudo systemctl restart backup.timer
```

### Erreurs fréquentes

#### Erreur : le script ne s'exécute pas

Causes possibles :
- chemin incorrect dans `ExecStart=` ;
- permissions insuffisantes ;
- script non exécutable ;
- interpréteur absent ;
- erreur dans le script.

Vérifications :

```bash
ls -l /usr/local/bin/backup.sh
```

```bash
sudo /usr/local/bin/backup.sh
```

Le test manuel doit être effectué avec un contexte d'exécution aussi proche que possible de celui du service.

#### Erreur : le timer n'apparaît pas

Vérifiez :
- que le fichier `.timer` existe ;
- que `systemctl daemon-reload` a été exécuté ;
- que le timer est démarré ;
- que la syntaxe du fichier est valide.

Commandes utiles :

```bash
systemctl status backup.timer
```

```bash
systemctl list-timers --all
```

#### Erreur : la tâche ne s'exécute pas à l'heure attendue

Vérifiez l'expression `OnCalendar=` :

```bash
systemd-analyze calendar '*-*-* 02:00:00'
```

Contrôlez aussi le fuseau horaire du système :

```bash
timedatectl
```

Les horaires calendaires sont normalement interprétés dans le fuseau horaire système, sauf configuration spécifique.

#### Erreur : la tâche fonctionne manuellement, mais échoue via systemd

L'environnement d'exécution d'un service systemd peut différer de celui d'un terminal interactif.

Les causes fréquentes sont :
- variables d'environnement absentes ;
- répertoire de travail différent ;
- droits d'accès différents ;
- dépendance à un profil shell ;
- commande disponible dans le terminal, mais non résolue par le service.

Pour éviter ces problèmes, utilisez des chemins absolus et configurez explicitement les variables nécessaires.

---

## Sécuriser les services exécutés par des timers

Une tâche automatisée peut s'exécuter sans intervention humaine pendant une longue période. Il est donc essentiel de limiter ses privilèges et ses effets.

### Utiliser un compte dédié

Un service n'a pas toujours besoin de s'exécuter en tant que `root`.

Exemple :

```ini
[Service]
Type=oneshot
User=appuser
Group=appgroup
ExecStart=/usr/local/bin/maintenance.sh
```

Le compte et le groupe doivent exister, et disposer des permissions nécessaires sur les fichiers utilisés.

### Utiliser des chemins absolus

Préférez :

```ini
ExecStart=/usr/bin/python3 /opt/app/maintenance.py
```

plutôt que :

```ini
ExecStart=python3 maintenance.py
```

Le chemin absolu évite certaines ambiguïtés liées à l'environnement d'exécution.

### Définir le répertoire de travail

Si la tâche doit travailler dans un répertoire particulier :

```ini
[Service]
Type=oneshot
WorkingDirectory=/opt/app
ExecStart=/usr/bin/python3 /opt/app/maintenance.py
```

Le répertoire de travail est ainsi explicite.

### Ajouter des restrictions de sécurité

Selon les besoins de la tâche et les possibilités de la version de systemd, certaines protections peuvent être appliquées :

```ini
[Service]
Type=oneshot
User=appuser
ExecStart=/opt/app/maintenance.sh
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
```

Ces options renforcent l'isolation du service, mais peuvent empêcher une tâche légitime d'accéder à certains fichiers ou répertoires.

Il faut donc les tester et prévoir explicitement les accès nécessaires. Par exemple, un service qui doit écrire dans un répertoire protégé peut nécessiter une configuration adaptée, comme `ReadWritePaths=`.

**Bonne pratique :** appliquer le principe du moindre privilège et ne pas ajouter de restrictions sans vérifier leur effet sur le fonctionnement du service.

---

## Régler la précision et le comportement des timers

### La directive AccuracySec

Par défaut, systemd peut regrouper certains déclenchements proches afin de réduire l'activité du système.

La directive `AccuracySec=` permet de contrôler la fenêtre de précision associée au déclenchement.

Exemple :

```ini
[Timer]
OnCalendar=*-*-* 02:00:00
AccuracySec=1s
Unit=backup.service
```

Cette configuration réduit la fenêtre de précision à une seconde.

Elle ne constitue cependant pas une garantie d'exécution en temps réel. La charge système, les dépendances et d'autres contraintes peuvent encore influencer le moment effectif du lancement.

### La directive RandomizedDelaySec

`RandomizedDelaySec=` permet d'ajouter un délai aléatoire avant l'exécution.

Exemple :

```ini
[Timer]
OnCalendar=*-*-* 02:00:00
RandomizedDelaySec=10min
Unit=backup.service
```

La tâche peut alors être déclenchée avec un délai aléatoire pouvant atteindre dix minutes.

Cette option est utile lorsque de nombreux serveurs doivent effectuer une tâche similaire, afin d'éviter qu'ils ne lancent tous leurs traitements au même instant.

Elle est particulièrement pertinente pour :
- les mises à jour ;
- les sauvegardes distribuées ;
- les opérations de maintenance ;
- les contrôles périodiques.

---

## Comparaison entre systemd timers et cron

`cron` est un autre mécanisme couramment utilisé pour planifier des tâches sous Linux.

| Critère | Timers systemd | cron |
|---|---|---|
| Configuration | Fichiers `.timer` et `.service` | Crontab |
| Gestion du service | Intégrée à systemd | Processus lancé par cron |
| Journaux | Intégration avec journald | Dépend de la configuration du système |
| Dépendances | Gestion possible via les unités systemd | Gestion généralement à construire séparément |
| Exécution au démarrage | Possible selon le type de timer et sa configuration | Le rattrapage des tâches manquées dépend de l'implémentation et de la configuration |
| Contrôle de l'exécution | `systemctl`, `journalctl` | Outils cron et journaux associés |
| Isolation | Options de sécurité des services systemd | Dépend de la manière dont la tâche est exécutée |
| Portabilité | Nécessite systemd | Disponible sur de nombreux systèmes Unix et Linux |

### Quand utiliser systemd timers ?

Les timers systemd sont particulièrement adaptés lorsque :
- le système utilise déjà systemd ;
- la tâche doit être gérée comme un service ;
- les journaux doivent être centralisés ;
- des dépendances ou des restrictions de sécurité sont nécessaires ;
- on souhaite bénéficier de `Persistent=true` pour certaines tâches calendaires.

### Quand utiliser cron ?

cron reste pertinent lorsque :
- une tâche simple doit être planifiée rapidement ;
- une infrastructure existante utilise déjà cron ;
- la portabilité entre différents environnements Unix est importante ;
- l'équipe maîtrise déjà les crontabs et leur supervision.

**À retenir :** systemd timers et cron répondent à des besoins similaires. Le meilleur choix dépend de l'environnement, des exigences d'exploitation et des outils déjà utilisés.

---

## Exemple pratique : automatiser une sauvegarde

Nous allons créer un timer quotidien pour lancer une sauvegarde.

### Créer le script de sauvegarde

Fichier `/usr/local/bin/backup.sh` :

```bash
#!/bin/bash

set -eu

SOURCE="/opt/app/data"
DESTINATION="/var/backups/app"

mkdir -p "$DESTINATION"

ARCHIVE="$DESTINATION/backup-$(date +%F-%H%M%S).tar.gz"

tar -czf "$ARCHIVE" -C "$SOURCE" .

echo "Sauvegarde créée : $ARCHIVE"
```

Rendons le script exécutable :

```bash
sudo chmod +x /usr/local/bin/backup.sh
```

Ce script crée une archive compressée horodatée du contenu du répertoire source.

Avant de l'utiliser, vérifiez que le répertoire source existe et que le compte d'exécution peut lire les données et écrire dans le répertoire de destination.

Cet exemple est volontairement simple : une stratégie de sauvegarde réelle doit également prévoir la rétention, la surveillance des échecs, l'espace disque disponible et des tests de restauration.

### Créer le service

Fichier `/etc/systemd/system/backup.service` :

```ini
[Unit]
Description=Sauvegarde de l'application

[Service]
Type=oneshot
ExecStart=/usr/local/bin/backup.sh
```

### Créer le timer

Fichier `/etc/systemd/system/backup.timer` :

```ini
[Unit]
Description=Sauvegarde quotidienne de l'application

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true
Unit=backup.service

[Install]
WantedBy=timers.target
```

### Activer la planification

Rechargeons la configuration :

```bash
sudo systemctl daemon-reload
```

Testons le service :

```bash
sudo systemctl start backup.service
```

Consultons les journaux :

```bash
sudo journalctl -u backup.service -n 50
```

Puis activons le timer :

```bash
sudo systemctl enable --now backup.timer
```

Enfin, vérifions la prochaine échéance :

```bash
systemctl list-timers backup.timer
```

La sauvegarde est maintenant planifiée chaque jour à 2 h, sous réserve que le système soit en fonctionnement et que le service puisse s'exécuter.

---

## Bonnes pratiques

Pour exploiter correctement les timers systemd :

1. **Séparer la planification du traitement.** Utilisez un fichier `.timer` pour l'horaire et un fichier `.service` pour la tâche.
2. **Tester le service manuellement.** Vérifiez le script avant d'activer la planification.
3. **Utiliser des chemins absolus.** Ne supposez pas que l'environnement sera identique à celui d'un terminal.
4. **Limiter les privilèges.** Exécutez les tâches avec un compte dédié lorsque c'est possible.
5. **Consulter les journaux.** Utilisez `journalctl` pour diagnostiquer les erreurs.
6. **Vérifier les calendriers.** Utilisez `systemd-analyze calendar` pour tester les expressions `OnCalendar=`.
7. **Comprendre `Persistent=true`.** Cette option aide à rattraper certaines échéances calendaires manquées, mais ne rejoue pas nécessairement chaque occurrence.
8. **Surveiller les durées d'exécution.** Une tâche qui dure plus longtemps que son intervalle peut ne pas se comporter comme prévu.
9. **Prévoir des alertes.** Les journaux seuls ne garantissent pas qu'un échec sera détecté à temps.
10. **Tester la restauration des sauvegardes.** Une archive créée n'est utile que si elle peut être restaurée.
11. **Contrôler les fuseaux horaires.** Une modification de l'heure système peut changer l'interprétation d'un calendrier.
12. **Recharger systemd après une modification.** Utilisez `systemctl daemon-reload`, puis redémarrez le timer si nécessaire.

---

## Commandes essentielles à retenir

| Objectif | Commande |
|---|---|
| Vérifier la version de systemd | `systemctl --version` |
| Recharger les fichiers d'unités | `sudo systemctl daemon-reload` |
| Démarrer un timer | `sudo systemctl start backup.timer` |
| Activer un timer au démarrage | `sudo systemctl enable backup.timer` |
| Démarrer et activer un timer | `sudo systemctl enable --now backup.timer` |
| Arrêter un timer | `sudo systemctl stop backup.timer` |
| Désactiver un timer | `sudo systemctl disable backup.timer` |
| Vérifier l'état d'un timer | `systemctl status backup.timer` |
| Lister les timers actifs | `systemctl list-timers` |
| Lister tous les timers | `systemctl list-timers --all` |
| Exécuter manuellement un service | `sudo systemctl start backup.service` |
| Consulter les journaux d'un service | `sudo journalctl -u backup.service` |
| Suivre les journaux en direct | `sudo journalctl -u backup.service -f` |
| Vérifier un calendrier | `systemd-analyze calendar '*-*-* 02:00:00'` |
| Afficher la configuration d'une unité | `systemctl cat backup.timer` |
| Vérifier le fuseau horaire | `timedatectl` |

---

## À retenir

Les timers systemd constituent un mécanisme puissant pour automatiser des tâches sous Linux.

Ils permettent de planifier des traitements selon un calendrier ou des intervalles relatifs, tout en bénéficiant de l'intégration avec les services systemd et les journaux du système.

Pour les utiliser efficacement, il faut maîtriser trois éléments essentiels :

- **Le service `.service`** : il définit la tâche à exécuter.
- **Le timer `.timer`** : il définit quand déclencher cette tâche.
- **Les outils de diagnostic** : `systemctl`, `journalctl` et `systemd-analyze` permettent de vérifier et de dépanner la configuration.

La meilleure approche consiste à commencer par une tâche simple, à tester son service manuellement, puis à activer son timer et à vérifier les journaux.

Ces compétences sont particulièrement utiles en administration Linux, en développement back-end et dans les pratiques DevOps, notamment pour les sauvegardes, la maintenance et les traitements périodiques.

---

## Sources et documentation

- Documentation officielle de systemd : https://systemd.io/
- Manuel de `systemd.timer` : https://www.freedesktop.org/software/systemd/man/latest/systemd.timer.html
- Manuel de `systemd.service` : https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html
- Manuel de `systemctl` : https://www.freedesktop.org/software/systemd/man/latest/systemctl.html
- Manuel de `systemd-analyze` : https://www.freedesktop.org/software/systemd/man/latest/systemd-analyze.html
- Manuel de `journalctl` : https://www.freedesktop.org/software/systemd/man/latest/journalctl.html