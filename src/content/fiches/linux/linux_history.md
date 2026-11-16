---
title: "Retrouver et réutiliser ses commandes avec history"
description: "Chercher, relancer et corriger une commande déjà tapée, puis régler l'historique Bash pour plusieurs terminaux."
technology: linux
difficulty: debutant
tags:
  - linux
  - bash
  - history
  - terminal
publishedAt: 2026-10-28
updatedAt: 2026-10-28
draft: false
quiz:
  - question: "Que fait sudo !! ?"
    choices:
      - "Relance la commande précédente en la précédant de sudo"
      - "Efface tout l'historique"
      - "Affiche les deux dernières commandes"
    answer: 0
    explanation: "!! désigne la dernière commande. sudo !! la relance avec les droits d'administration, sans la retaper."
  - question: "À quoi sert !$ ?"
    choices:
      - "Au dernier argument de la commande précédente"
      - "Au numéro de la commande dans l'historique"
      - "Au nom du fichier d'historique"
    answer: 0
    explanation: "!$ reprend le dernier mot de la commande précédente, souvent un chemin ou un nom de fichier."
  - question: "Pourquoi commencer une commande par une espace quand ignorespace est actif ?"
    choices:
      - "Pour qu'elle ne soit pas enregistrée dans l'historique"
      - "Pour l'exécuter en arrière-plan"
      - "Pour l'enregistrer deux fois"
    answer: 0
    explanation: "Une ligne qui commence par une espace est ignorée. C'est utile pour une commande qui contient un secret."
  - question: "À quoi sert shopt -s histappend ?"
    choices:
      - "À ajouter les nouvelles lignes au fichier au lieu de le remplacer"
      - "À effacer l'historique à la fermeture du terminal"
      - "À afficher la date devant chaque commande"
    answer: 0
    explanation: "Sans histappend, la fermeture d'un terminal peut remplacer le fichier d'historique et faire perdre les commandes des autres fenêtres."
---

# 1. Où vont les commandes

Dans un terminal Bash, chaque commande validée avec Entrée rejoint une liste. `history` affiche cette liste. Le numéro de gauche sert à la relancer.

Deux endroits comptent.

| Endroit | Rôle |
|---|---|
| La mémoire du terminal ouvert | Ce que `history` montre tout de suite |
| Le fichier `~/.bash_history` | Ce qui reste après la fermeture du terminal |

Ces formes sont celles de Bash, le shell habituel sur Linux. Zsh a la même idée, avec d'autres réglages.

# 2. Relire et chercher

```bash
history
history 20
history | grep ssh
```

`history 20` limite l'affichage aux 20 dernières lignes. `grep` filtre sur un mot : un serveur, un fichier, un outil.

Ctrl+R ouvre la recherche en arrière dans le terminal. On tape quelques lettres, Ctrl+R recule encore d'une occurrence. Entrée lance la ligne trouvée. La flèche droite la dépose dans le prompt pour la modifier. Ctrl+G abandonne la recherche.

# 3. Relancer sans retaper

| Saisie | Effet |
|---|---|
| `!!` | Dernière commande |
| `!42` | Commande numéro 42 |
| `!ssh` | Dernière commande qui commence par `ssh` |
| `sudo !!` | Dernière commande, précédée de `sudo` |

`sudo !!` sert quand une commande a échoué faute de droits. On ne la réécrit pas.

Avant d'appuyer sur Entrée, Bash remplace `!42` par le texte de la commande 42. Un numéro faux lance une autre commande. Pour seulement l'afficher :

```bash
!42:p
```

`:p` imprime le texte et l'ajoute à l'historique, sans l'exécuter.

# 4. Reprendre un argument

| Saisie | Effet |
|---|---|
| `!$` | Dernier argument de la commande précédente |
| `!^` | Premier argument |
| `!*` | Tous les arguments, sans le nom de la commande |

Après `mkdir projets/demo`, la commande `cd !$` entre dans `projets/demo`.

Alt+. (ou Échap puis `.`) colle ce dernier argument dans la ligne en cours. On peut l'enchaîner pour remonter aux commandes d'avant. C'est un raccourci du terminal, pas une commande de `history`.

# 5. Corriger la dernière ligne

```bash
^nginx^apache
```

Cette forme remplace la première occurrence de `nginx` par `apache` dans la commande précédente, puis la lance. Utile quand un seul mot était faux.

`fc` ouvre la dernière commande dans l'éditeur. On la corrige, on enregistre, on quitte : Bash l'exécute. `fc 42` fait la même chose pour le numéro 42.

# 6. Voir ce qu'on tape le plus

```bash
HISTTIMEFORMAT= history | awk '{print $2}' | sort | uniq -c | sort -nr | head
```

Le nombre de gauche est le nombre d'apparitions. Le mot de droite est le début de la commande (`git`, `ssh`, `cd`).

`HISTTIMEFORMAT=` vide l'affichage des dates pour cette seule commande. Sans cela, si les dates sont affichées, `awk` compterait l'année au lieu de la commande.

# 7. Régler l'historique

Ces lignes se placent dans `~/.bashrc`, puis un nouveau terminal les prend en compte.

```bash
HISTSIZE=5000
HISTFILESIZE=20000
HISTCONTROL=ignoredups:ignorespace
HISTTIMEFORMAT="%F %T  "
shopt -s histappend
```

| Réglage | Effet |
|---|---|
| `HISTSIZE` | Nombre de lignes gardées en mémoire |
| `HISTFILESIZE` | Nombre de lignes gardées dans le fichier |
| `ignoredups` | N'enregistre pas une commande identique à la précédente |
| `ignorespace` | Ignore une ligne qui commence par une espace |
| `HISTTIMEFORMAT` | Affiche la date devant chaque ligne |
| `histappend` | Ajoute au fichier au lieu de le remplacer |

Une commande qui contient un mot de passe peut commencer par une espace. Avec `ignorespace`, elle tourne et n'est pas écrite dans `~/.bash_history`.

Plusieurs terminaux ouverts en même temps s'écrasent sinon le fichier à la fermeture. `histappend` limite cela. Pour partager les nouvelles commandes sans fermer la fenêtre :

```bash
history -a
history -n
```

`history -a` ajoute au fichier les lignes nouvelles de ce terminal. `history -n` relit celles écrites par les autres depuis l'ouverture.

# 8. Retirer une ligne

```bash
history -d 42
```

`history -d` retire la ligne 42 de la session. Les numéros d'après se décalent. Pour que le fichier suive, on édite `~/.bash_history`, ou on réécrit le fichier avec `history -w` quand la session contient bien tout ce qu'on veut garder. `history -w` remplace le fichier par la mémoire du terminal : les lignes présentes seulement dans un autre terminal peuvent disparaître.

`history -c` vide la liste de la session. Combiné à `history -w`, il vide aussi le fichier.

## À retenir

- `history` et `history | grep mot` retrouvent une commande. Ctrl+R la cherche depuis le clavier.
- `!!` relance la dernière. `sudo !!` la relance avec `sudo`. `!42:p` montre la commande 42 sans l'exécuter.
- `!$` et Alt+. reprennent le dernier argument.
- `^ancien^nouveau` corrige un mot de la ligne précédente.
- Une espace en début de ligne, avec `ignorespace`, évite d'enregistrer un secret.
- `histappend` empêche un terminal de remplacer l'historique des autres.
