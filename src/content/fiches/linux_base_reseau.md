---
title: Les principes fondamentaux des réseaux informatiques
description: "Comprendre les concepts essentiels des réseaux informatiques : adressage IP, sous-réseaux, passerelles, DNS, DHCP, routage, ports et protocoles."
technology: reseau
difficulty: debutant
tags: [reseau, tcp-ip, ipv4, dns, dhcp, routage, ethernet, protocoles, infrastructure, cloud]
publishedAt: 2026-10-26
updatedAt: 2026-10-26
draft: false
quiz:
  - question: Quel est le rôle d'une adresse IP ?
    choices:
      - Identifier une interface réseau pour permettre l'acheminement des paquets IP
      - Chiffrer automatiquement les communications
      - Remplacer le nom de domaine d'un site
    answer: 0
    explanation: "Une adresse IP permet d'identifier une interface réseau dans un contexte donné et participe à l'acheminement des paquets vers leur destination."
  - question: Quel est le rôle du DNS ?
    choices:
      - Attribuer automatiquement des adresses IP aux appareils
      - Associer des noms de domaine à des informations telles que des adresses IP
      - Transmettre les trames Ethernet
    answer: 1
    explanation: "Le DNS permet notamment de retrouver les adresses IP associées aux noms de domaine."
  - question: À quoi sert une passerelle par défaut ?
    choices:
      - À transmettre les paquets vers des destinations qui ne sont pas directement accessibles sur le réseau local
      - À attribuer les adresses MAC
      - À remplacer le serveur DHCP
    answer: 0
    explanation: "La passerelle par défaut permet généralement de joindre d'autres réseaux, notamment Internet."
  - question: Quel protocole attribue généralement une configuration IP automatiquement ?
    choices:
      - HTTP
      - DHCP
      - SSH
    answer: 1
    explanation: "DHCP peut fournir automatiquement une adresse IP, un masque ou préfixe réseau, une passerelle et des serveurs DNS."
  - question: Quelle est la différence fondamentale entre TCP et UDP ?
    choices:
      - TCP est orienté connexion et fournit des mécanismes de fiabilité ; UDP fonctionne sans établissement de connexion préalable
      - UDP chiffre toujours les données, contrairement à TCP
      - TCP fonctionne uniquement sur les réseaux locaux
    answer: 0
    explanation: "TCP fournit notamment la retransmission des données perdues et leur remise en ordre. UDP offre un transport plus simple, sans garantie intrinsèque de livraison ou d'ordre."
---

## 1. Définition

Un **réseau informatique** est un ensemble d'équipements interconnectés qui échangent des données selon des protocoles de communication.

Exemples d'équipements :
- Ordinateurs et serveurs.
- Smartphones et objets connectés.
- Routeurs et commutateurs.
- Conteneurs et machines virtuelles.

**Objectif :** permettre aux équipements de communiquer entre eux, sur un réseau local ou à travers Internet.

## 2. Les notions essentielles

| Notion | Rôle |
| --- | --- |
| Adresse IP | Identifier une interface réseau au niveau IP |
| Adresse MAC | Identifier une interface au niveau de la couche liaison |
| Masque / préfixe | Définir la partie réseau d'une adresse IP |
| Passerelle | Acheminer les paquets vers d'autres réseaux |
| DNS | Résoudre les noms de domaine |
| DHCP | Attribuer automatiquement une configuration IP |
| Routeur | Transférer les paquets entre réseaux IP |
| Switch | Transférer les trames sur un réseau local |
| Port TCP/UDP | Identifier un service de transport sur un hôte |
| Pare-feu | Autoriser ou bloquer des communications selon des règles |

## 3. L'adressage IP

Une adresse IP permet d'identifier une interface réseau pour les communications IP.

### IPv4

Une adresse IPv4 est composée de 32 bits, représentés généralement par quatre nombres séparés par des points.

Exemple fictif :

```text
IP1 = 192.0.2.10
```

Cette adresse appartient à un bloc réservé à la documentation.

### IPv6

IPv6 utilise des adresses de 128 bits, généralement représentées en hexadécimal.

Exemple réservé à la documentation :

```text
2001:db8::10
```

IPv6 offre un espace d'adressage beaucoup plus vaste qu'IPv4.

### Adresse privée et adresse publique

- **Adresse privée :** utilisée dans les réseaux internes. Elle n'est pas directement routable sur Internet.
- **Adresse publique :** utilisée pour l'acheminement sur Internet, sous réserve des règles de routage et de filtrage applicables.

Les plages IPv4 privées sont :
- `10.0.0.0/8`
- `172.16.0.0/12`
- `192.168.0.0/16`

Pour la documentation, les plages `192.0.2.0/24`, `198.51.100.0/24` et `203.0.113.0/24` sont réservées aux exemples.

## 4. Les sous-réseaux

Un sous-réseau permet de regrouper des adresses IP selon un préfixe commun.

Exemple :

```text
IP1 = 192.168.10.20/24
IP2 = 192.168.10.30/24
```

Ces deux adresses appartiennent au même sous-réseau IPv4 : `192.168.10.0/24`.

Avec un préfixe `/24`, les 24 premiers bits identifient le réseau. Il reste 8 bits pour les adresses de la partie hôte.

Le masque correspondant est :

```text
255.255.255.0
```

**À retenir :** deux équipements appartenant au même sous-réseau peuvent généralement communiquer directement au niveau IP, sous réserve de la configuration et du filtrage.

## 5. Passerelle et routage

La **passerelle par défaut** est généralement le routeur utilisé pour joindre les destinations qui ne sont pas directement accessibles sur le réseau local.

Exemple de table de routage :

```text
default via IP1 dev eth0
192.168.10.0/24 dev eth0
```

- `default` : route utilisée en l'absence de route plus spécifique.
- `via IP1` : passerelle à utiliser.
- `dev eth0` : interface de sortie.

Sous Linux, les commandes essentielles sont :

```sh
ip addr
ip route
ip route get IP2
```

La commande `ip route get IP2` permet de déterminer le chemin que le noyau prévoit d'utiliser pour atteindre une destination.

## 6. DNS et DHCP

### DNS : résolution des noms

Le DNS associe les noms de domaine à des informations utiles à la communication, notamment des adresses IP.

Exemple :

```text
example.com → adresse IP
```

Commande de diagnostic :

```sh
nslookup example.com
```

### DHCP : configuration automatique

DHCP permet notamment d'attribuer automatiquement :
- Une adresse IP.
- Un masque ou préfixe réseau.
- Une passerelle.
- Des serveurs DNS.

Sans configuration automatique ni configuration manuelle valide, un équipement peut ne pas disposer des paramètres nécessaires pour communiquer correctement.

## 7. TCP, UDP et les ports

TCP et UDP sont des protocoles de transport utilisant des ports pour identifier les services de communication.

| Protocole | Port courant | Usage |
| --- | ---: | --- |
| HTTP | TCP 80 | Web non chiffré |
| HTTPS | TCP 443 | Web chiffré avec TLS |
| SSH | TCP 22 | Administration distante sécurisée |
| DNS | UDP/TCP 53 | Résolution de noms |
| DHCPv4 | UDP 67/68 | Configuration réseau automatique |
| SMTP | TCP 25 | Transport de courriels entre serveurs |

Ces ports sont des valeurs conventionnelles : une application peut être configurée pour utiliser d'autres ports.

**TCP** fournit notamment des mécanismes de fiabilité, de remise en ordre et de contrôle de flux.

**UDP** transmet des datagrammes sans établir de connexion préalable et sans garantir intrinsèquement leur livraison ou leur ordre.

## 8. Le modèle TCP/IP

Le modèle TCP/IP permet de comprendre les différentes fonctions nécessaires à une communication réseau.

| Couche | Fonction | Exemples |
| --- | --- | --- |
| Application | Protocoles utilisés par les applications | HTTP, DNS, SSH |
| Transport | Communication entre services | TCP, UDP |
| Internet | Adressage et acheminement IP | IPv4, IPv6, ICMP |
| Accès réseau | Transmission sur le réseau local | Ethernet, Wi-Fi |

Lorsqu'un navigateur contacte un serveur Web, les données sont encapsulées dans les différentes couches avant d'être transmises au réseau.

## 9. Les équipements réseau

| Équipement | Fonction principale |
| --- | --- |
| Switch | Relier des équipements dans un réseau local |
| Routeur | Acheminer les paquets entre réseaux |
| Point d'accès Wi-Fi | Connecter des appareils sans fil au réseau |
| Pare-feu | Filtrer les communications selon des règles |
| Modem ou équipement d'accès | Assurer l'accès au réseau du fournisseur, selon la technologie |

Un même équipement domestique peut combiner plusieurs de ces fonctions.

## 10. Méthode de diagnostic réseau

Lorsqu'un service ou un site Web est inaccessible, procéder par étapes :

**1. Vérifier l'interface réseau**

```sh
ip addr
```

**2. Vérifier la route**

```sh
ip route
```

**3. Tester la passerelle**

```sh
ping -c 4 IP1
```

**4. Tester une adresse IP externe**

```sh
ping -c 4 IP2
```

**5. Vérifier la résolution DNS**

```sh
nslookup example.com
```

**6. Tester le service concerné**

Si `curl` est installé :

```sh
curl -I https://example.com
```

Le résultat permet d'examiner la réponse HTTP ou HTTPS, si la connexion peut être établie.

Un échec de ping ne suffit pas à prouver une panne Internet : certaines destinations ou certains réseaux filtrent ICMP.

## 11. À retenir

Un réseau repose sur plusieurs mécanismes complémentaires :

- **IP** identifie les interfaces et permet l'acheminement des paquets.
- **Le sous-réseau** détermine les adresses considérées comme directement accessibles.
- **La passerelle et le routage** permettent de joindre d'autres réseaux.
- **DNS** permet de résoudre les noms de domaine.
- **DHCP** automatise la configuration IP.
- **TCP et UDP** assurent le transport des données.
- **Les ports** identifient les services de transport.
- **Les pare-feu** contrôlent les communications autorisées.

Pour diagnostiquer une panne, vérifiez dans l'ordre l'interface, le routage, la connectivité IP, le DNS et enfin le service applicatif.
