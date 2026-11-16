---
title: "Diagnostic réseau Alpine Linux : routage Ethernet, Wi-Fi et accès Internet"
description: "Comprendre et résoudre les problèmes d'accès à Internet sur Alpine Linux liés aux routes par défaut, à la coexistence Ethernet et Wi-Fi et à la configuration du routage IP."
technology: reseau
difficulty: intermediaire
tags: [linux, alpine-linux, reseau, ethernet, wifi, routage, dns, ip, docker, administration-systeme]
publishedAt: 2026-10-26
updatedAt: 2026-10-26
draft: false
quiz:
  - question: Quelle commande permet d'afficher la table de routage IP sous Alpine Linux ?
    choices:
      - ip addr
      - ip route
      - ip neigh
    answer: 1
    explanation: "La commande `ip route` affiche les routes connues du noyau Linux, notamment les routes par défaut utilisées pour joindre les réseaux externes."
  - question: Quelle route est normalement privilégiée lorsque deux routes par défaut ont des métriques différentes ?
    choices:
      - Celle dont la métrique est la plus faible
      - Celle dont la métrique est la plus élevée
      - Celle qui apparaît en dernier dans la table
    answer: 0
    explanation: "À destination équivalente, Linux privilégie normalement la route ayant la métrique la plus faible, sous réserve des autres règles de routage applicables."
  - question: Quelle commande permet de supprimer temporairement une route par défaut passant par Ethernet ?
    choices:
      - ip addr flush eth0
      - ip route del default via IP1 dev eth0
      - rm /etc/resolv.conf
    answer: 1
    explanation: "`ip route del` supprime la route correspondante de la table de routage active. Cette modification n'est normalement pas persistante après un redémarrage ou une reconfiguration réseau."
  - question: Quelle commande permet de tester la connectivité IP externe sans dépendre de la résolution DNS ?
    choices:
      - ping -c 4 IP2
      - ping -c 4 example.com
      - cat /etc/resolv.conf
    answer: 0
    explanation: "Une adresse IP numérique évite d'avoir besoin de résoudre un nom de domaine. Toutefois, un échec du ping ne prouve pas à lui seul une absence d'accès Internet, car ICMP peut être filtré."
  - question: Quel est le rôle de la commande `ip neigh show` ?
    choices:
      - Afficher les voisins réseau connus et leur état de résolution
      - Modifier les serveurs DNS
      - Supprimer les conteneurs Docker
    answer: 0
    explanation: "`ip neigh show` affiche les entrées du cache de voisinage, notamment les correspondances IPv4/MAC obtenues via ARP et leur état."
---

## Définition

Le **routage IP** est le mécanisme qui permet à un système Linux de choisir l'interface réseau et le prochain saut à utiliser pour transmettre les paquets vers leur destination.

Sur Alpine Linux, un serveur peut utiliser simultanément plusieurs interfaces réseau :

- **Ethernet (`eth0`)** : connexion filaire.
- **Wi-Fi (`wlan0`)** : connexion sans fil.
- **Docker (`docker0`, `br-*`)** : interfaces virtuelles utilisées par les conteneurs.

Lorsque plusieurs interfaces sont actives, plusieurs routes peuvent coexister. Une mauvaise configuration, une passerelle indisponible ou une route devenue inutile peuvent perturber la connectivité.

### Convention des adresses IP

Dans cette fiche, les adresses IP sont remplacées par des identifiants fictifs :

| Identifiant | Signification |
| --- | --- |
| `IP1` | Adresse IP de la passerelle locale |
| `IP2` | Adresse IP externe utilisée pour tester la connectivité |
| `IP3` | Adresse IP de l'interface Ethernet |
| `IP4` | Adresse IP de l'interface Wi-Fi |
| `IP5` | Adresse IP du serveur DNS |
| `IP6` | Adresse IP d'un autre équipement du réseau local |

**Attention :** `IP1`, `IP2`, etc. sont des placeholders explicatifs, pas des adresses IP utilisables directement dans les commandes. Il faut les remplacer par les véritables adresses de votre environnement.

## Comprendre une route par défaut

Une route par défaut est utilisée lorsqu'aucune route plus spécifique ne correspond à la destination recherchée.

Exemple :

```text
default via IP1 dev eth0 metric 202
default via IP1 dev wlan0 metric 303
```

Interprétation :

| Élément | Signification |
| --- | --- |
| `default` | Route utilisée pour les destinations sans route plus spécifique |
| `via IP1` | Passerelle vers laquelle envoyer les paquets |
| `dev eth0` | Interface Ethernet utilisée |
| `dev wlan0` | Interface Wi-Fi utilisée |
| `metric 202` | Coût associé à la route |
| `metric 303` | Coût associé à la seconde route |

À conditions équivalentes, une route ayant une métrique de `202` est normalement préférée à une route ayant une métrique de `303`.

Dans cet exemple, Ethernet est donc normalement privilégié.

**Point de vigilance :** la présence de deux routes par défaut n'est pas nécessairement une erreur. Linux peut gérer plusieurs routes simultanément. Le problème apparaît notamment lorsque le chemin privilégié n'est plus opérationnel ou lorsque la configuration des interfaces et des passerelles est incohérente.

## 1. Commandes fondamentales de diagnostic

### Afficher les interfaces réseau

```sh
ip addr
```

Cette commande affiche les interfaces, leur état et leurs adresses IP.

Exemple :

```text
eth0: IP3/24
wlan0: IP4/24
```

Les deux interfaces sont ici représentées comme appartenant au même sous-réseau IPv4. Le suffixe `/24` est un exemple de longueur de préfixe réseau.

### Afficher la table de routage

```sh
ip route
```

Pour afficher uniquement les routes par défaut :

```sh
ip route show default
```

Pour connaître le chemin choisi par Linux vers une destination :

```sh
ip route get IP2
```

Cette dernière commande est particulièrement utile pour identifier l'interface et la passerelle sélectionnées pour joindre une adresse IP externe.

### Vérifier le voisinage réseau

```sh
ip neigh show
```

Cette commande permet d'observer les voisins connus sur le réseau local et l'état de résolution de leur adresse matérielle.

Une entrée associée à la passerelle peut notamment apparaître avec un état tel que `REACHABLE`, `STALE`, `INCOMPLETE` ou `FAILED`.

Ces états doivent être interprétés dans leur contexte : une entrée `STALE`, par exemple, n'indique pas nécessairement un problème.

## 2. Tester la connectivité par étapes

Pour éviter de modifier la configuration au hasard, il faut isoler les différentes couches du réseau.

### Étape 1 : tester la passerelle

Pour le Wi-Fi :

```sh
ping -I wlan0 -c 4 IP1
```

Pour Ethernet :

```sh
ping -I eth0 -c 4 IP1
```

Remplacez `IP1` par l'adresse réelle de la passerelle.

Si la passerelle ne répond pas, vérifiez l'état de l'interface, son adresse IP, le sous-réseau et la connectivité locale. Certains équipements filtrent cependant les requêtes ICMP.

### Étape 2 : tester une adresse IP externe

```sh
ping -c 4 IP2
```

Ce test permet de vérifier si des paquets peuvent atteindre une destination externe sans nécessiter de résolution DNS.

Pour tester chaque interface séparément :

```sh
ping -I wlan0 -c 4 IP2
```

```sh
ping -I eth0 -c 4 IP2
```

Remplacez `IP2` par une adresse IP externe réelle et joignable.

Si une interface fonctionne et que l'autre échoue, cela oriente le diagnostic vers le chemin réseau utilisé, sans constituer à lui seul une preuve définitive.

### Étape 3 : tester le DNS

Afficher la configuration DNS :

```sh
cat /etc/resolv.conf
```

Exemple de contenu :

```text
nameserver IP5
```

Tester ensuite un nom de domaine :

```sh
ping -c 4 example.com
```

Interprétation :

| Test IP | Résolution du nom | Orientation du diagnostic |
| --- | --- | --- |
| Fonctionne | Fonctionne | La connectivité IP et la résolution DNS semblent opérationnelles |
| Fonctionne | Échoue | Vérifier le DNS et la résolution des noms |
| Échoue | Fonctionne ou échoue | Examiner le routage, la passerelle, le filtrage et la connectivité externe |
| Échoue | Échoue | Le problème peut concerner le réseau, le routage ou plusieurs composants simultanément |

Un ping réussi ne garantit pas que tous les services Internet fonctionnent. Inversement, un ping échoué ne signifie pas nécessairement que le service HTTP ou HTTPS est inaccessible.

Pour approfondir le diagnostic DNS, si `nslookup` est disponible :

```sh
nslookup example.com
```

## 3. Résolution d'un problème après débranchement Ethernet

### Situation rencontrée

Un serveur Alpine Linux fonctionnait auparavant en Wi-Fi. Un câble Ethernet a ensuite été branché, puis débranché.

La table de routage affichait :

```text
default via IP1 dev eth0 metric 202
default via IP1 dev wlan0 metric 303
IP6/24 dev wlan0 scope link src IP4
IP6/24 dev eth0 scope link src IP3
```

Dans cet exemple, `IP6/24` représente le réseau local sous forme symbolique. Dans une véritable table de routage, il faut utiliser une notation réseau valide, telle que `192.0.2.0/24`, dans les exemples de documentation ou la véritable plage réseau de l'environnement.

Le ping vers une adresse externe échouait.

Même après le débranchement du câble, la route par défaut associée à `eth0` était toujours présente.

Linux pouvait donc continuer à préférer cette route, car sa métrique était plus faible.

### Étape 1 : confirmer l'état de la table

```sh
ip route show default
```

Vérifiez si une route par défaut utilisant `eth0` subsiste alors que cette interface n'est plus censée assurer la connectivité.

### Étape 2 : supprimer la route devenue inutile

Si vous avez confirmé que la route Ethernet est obsolète et que le Wi-Fi doit rester la connexion principale, vous pouvez supprimer temporairement cette route :

```sh
ip route del default via IP1 dev eth0
```

Remplacez `IP1` par la véritable adresse de la passerelle.

Cette commande modifie uniquement la table de routage active.

Elle ne supprime ni l'adresse IP de l'interface, ni les réseaux Docker, ni la configuration permanente du système.

**Attention :** ne lancez pas cette commande sans vérifier la route concernée. Si Ethernet est votre seule connexion fonctionnelle ou si vous administrez le serveur à distance, vous pourriez interrompre votre accès.

### Étape 3 : vérifier le résultat

```sh
ip route show default
```

Une route Wi-Fi peut alors rester seule :

```text
default via IP1 dev wlan0 metric 303
```

### Étape 4 : retester la connectivité

```sh
ping -I wlan0 -c 4 IP1
```

Puis :

```sh
ping -I wlan0 -c 4 IP2
```

Enfin :

```sh
ping -c 4 example.com
```

Si la connexion fonctionne de nouveau, la route Ethernet persistante était probablement impliquée dans le problème.

Il reste toutefois important de distinguer une corrélation d'une preuve absolue : la confirmation vient du résultat des tests effectués avant et après la correction.

## 4. Comprendre les réseaux Docker

Une machine exécutant Docker peut afficher de nombreuses routes supplémentaires :

```text
172.17.0.0/16 dev docker0 scope link src 172.17.0.1
172.18.0.0/16 dev br-XXXXXXXXXXXX scope link src 172.18.0.1
172.19.0.0/16 dev br-YYYYYYYYYYYY scope link src 172.19.0.1
```

Les identifiants `XXXXXXXXXXXX` et `YYYYYYYYYYYY` représentent des noms d'interfaces fictifs.

Ces routes correspondent généralement aux réseaux virtuels créés par Docker.

Elles permettent aux conteneurs de communiquer entre eux et avec l'hôte selon la configuration réseau.

**Il ne faut pas les supprimer pour résoudre un problème de route par défaut Ethernet/Wi-Fi.**

Pour examiner les réseaux Docker :

```sh
docker network ls
```

Pour afficher les détails d'un réseau particulier :

```sh
docker network inspect bridge
```

Les noms des réseaux peuvent varier selon les projets et les fichiers Compose utilisés.

## 5. Rendre la correction persistante

La commande `ip route del` ne constitue pas une correction permanente.

Une route peut réapparaître après :

- un redémarrage ;
- une reconnexion réseau ;
- un renouvellement DHCP ;
- le redémarrage d'un service de gestion réseau ;
- une modification de la configuration de l'interface.

Il faut donc identifier le mécanisme qui configure les interfaces avant de modifier durablement le système.

### Examiner la configuration réseau

```sh
cat /etc/network/interfaces
```

Si le fichier existe et contient la configuration utilisée par le système, vérifiez comment les interfaces `eth0` et `wlan0` sont configurées.

Examiner également les services réseau :

```sh
rc-service networking status
```

Sur Alpine Linux, OpenRC gère de nombreux services système. La méthode de configuration dépend cependant de l'installation et des outils utilisés.

Si le réseau est géré par DHCP, le serveur DHCP ou le gestionnaire réseau peut réinstaller une route par défaut après la modification manuelle.

### Bonnes pratiques

- Utiliser une seule connexion par défaut lorsque cela correspond au besoin du serveur.
- Configurer correctement les métriques si Ethernet et Wi-Fi doivent coexister.
- Éviter de modifier directement les routes sans identifier leur origine.
- Tester la configuration après reconnexion et après redémarrage.
- Préserver l'accès SSH et les réseaux Docker pendant les opérations.

Ne désactivez pas systématiquement le Wi-Fi ou Ethernet : certaines configurations nécessitent plusieurs interfaces actives.

## 6. Arbre de diagnostic rapide

```text
Les sites externes sont inaccessibles
                |
                v
        Afficher les routes
           ip route
                |
                v
     Plusieurs routes par défaut ?
          /             \
        Oui              Non
         |                |
         v                v
 Vérifier métriques    Vérifier la route
 et interfaces         et la passerelle
         |                |
         v                v
 Identifier la route choisie
       ip route get IP2
                |
                v
       Tester la passerelle
                |
                v
      Tester une IP externe
                |
          +-----+-----+
          |           |
       Succès        Échec
          |           |
          v           v
     Tester DNS    Examiner le routage,
                   le filtrage et le réseau
```

## 7. Tableau récapitulatif des commandes

| Objectif | Commande |
| --- | --- |
| Afficher les interfaces et adresses IP | `ip addr` |
| Afficher toutes les routes | `ip route` |
| Afficher les routes par défaut | `ip route show default` |
| Connaître la route choisie vers une IP | `ip route get IP2` |
| Examiner les voisins réseau | `ip neigh show` |
| Tester la passerelle | `ping -c 4 IP1` |
| Tester une IP externe | `ping -c 4 IP2` |
| Tester une interface spécifique | `ping -I wlan0 -c 4 IP2` |
| Afficher la configuration DNS | `cat /etc/resolv.conf` |
| Tester la résolution DNS | `nslookup example.com` |
| Supprimer une route par défaut précise | `ip route del default via IP1 dev eth0` |
| Lister les réseaux Docker | `docker network ls` |

## Mots-clés

| Terme | Définition |
| --- | --- |
| `Route par défaut` | Route utilisée lorsqu'aucune route plus spécifique ne correspond à la destination |
| `Passerelle` | Équipement permettant de transférer les paquets vers un autre réseau |
| `Métrique` | Coût utilisé pour départager certaines routes concurrentes |
| `Interface réseau` | Interface physique ou virtuelle permettant la communication réseau |
| `DNS` | Système qui associe les noms de domaine aux adresses IP |
| `DHCP` | Protocole permettant d'attribuer automatiquement des paramètres réseau |
| `ARP` | Protocole de résolution des adresses IPv4 vers les adresses MAC sur le réseau local |
| `Docker bridge` | Réseau virtuel permettant la communication entre conteneurs et, selon la configuration, avec l'hôte |

## Pièges et points de vigilance

- **Supposer que le câble débranché supprime automatiquement la route :** une route peut rester présente dans la table même si l'interface ne dispose plus de connectivité physique.
- **Confondre routage et DNS :** si une adresse IP externe est joignable mais pas les noms de domaine, il faut examiner la résolution DNS.
- **Supprimer toutes les routes par défaut :** cela peut interrompre la connectivité externe et l'accès distant.
- **Modifier les réseaux Docker inutilement :** les routes Docker sont généralement indépendantes du problème de route par défaut Ethernet/Wi-Fi.
- **Considérer un ping échoué comme une preuve absolue :** ICMP peut être bloqué par le réseau ou la destination.
- **Oublier la persistance :** une correction manuelle peut être annulée par DHCP ou au redémarrage.
- **Laisser deux interfaces sur le même sous-réseau sans vérifier la configuration :** cette situation peut compliquer le diagnostic, même si elle n'est pas systématiquement incorrecte.

## À retenir

Lorsqu'un serveur Alpine Linux perd l'accès aux sites externes après le branchement puis le débranchement d'un câble Ethernet, il faut commencer par examiner la table de routage.

La commande `ip route` permet de repérer les routes par défaut. Si une route Ethernet devenue inutile reste prioritaire sur le Wi-Fi, sa suppression ciblée avec `ip route del` peut rétablir la connectivité.

La méthode à retenir est la suivante :

1. Examiner les interfaces avec `ip addr`.
2. Afficher les routes avec `ip route`.
3. Vérifier le chemin sélectionné avec `ip route get`.
4. Tester la passerelle et une adresse IP externe.
5. Vérifier le DNS si la connectivité IP fonctionne.
6. Corriger la configuration persistante une fois la cause identifiée.

**Le principe essentiel : diagnostiquer d'abord, modifier uniquement la route concernée, puis vérifier que la connectivité fonctionne de nouveau.**
