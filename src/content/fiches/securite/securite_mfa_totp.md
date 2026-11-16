---
title: "MFA, 2FA et TOTP : sécuriser un compte avec un code temporaire"
description: "Comprendre la différence entre MFA, 2FA et TOTP, puis activer les codes temporaires sur un compte avec KeePassXC, sans Microsoft Authenticator."
technology: securite
difficulty: debutant
tags:
  - mfa
  - 2fa
  - totp
  - keepassxc
  - authentification
publishedAt: 2026-11-16
updatedAt: 2026-11-16
draft: false
quiz:
  - question: "Un site demande votre mot de passe, puis le nom de votre premier animal. Est-ce de la 2FA ?"
    choices:
      - "Non : les deux éléments sont des choses que vous savez, donc d'une seule famille"
      - "Oui : il y a deux étapes"
      - "Oui : le deuxième élément est secret"
    answer: 0
    explanation: "La 2FA combine deux familles de facteurs différentes : ce que l'on sait, ce que l'on possède, ce que l'on est. Deux secrets mémorisés restent une seule famille."
  - question: "Que signifie TOTP ?"
    choices:
      - "Time-based One-Time Password : un mot de passe à usage unique calculé avec l'heure"
      - "Two-Order Token Protocol : un jeton en deux étapes"
      - "Total Password : la somme de tous vos mots de passe"
    answer: 0
    explanation: "L'application et le serveur partagent une clé secrète. Chacun calcule, à partir de cette clé et de l'heure, le même code à 6 chiffres, valable environ 30 secondes."
  - question: "Pourquoi un code TOTP copié reste-t-il à utiliser rapidement ?"
    choices:
      - "Il change toutes les 30 secondes environ"
      - "Il s'efface après un clic"
      - "Il ne fonctionne que sur le téléphone"
    answer: 0
    explanation: "Le code dépend de la fenêtre de temps en cours. Passé ce délai, le serveur attend un autre code."
  - question: "Pendant l'activation, quelle information faut-il copier dans KeePassXC quand on ne scanne pas le QR code ?"
    choices:
      - "La clé secrète affichée sous le QR code"
      - "Le code à 6 chiffres affiché par le site"
      - "Le mot de passe du compte"
    answer: 0
    explanation: "La clé secrète permet de calculer tous les codes futurs. Le QR code ne fait que la transporter. Les codes à 6 chiffres, eux, changent."
  - question: "Quel est le risque de ranger le mot de passe et la clé TOTP dans le même coffre ?"
    choices:
      - "Qui ouvre ce coffre obtient les deux : les deux facteurs se réduisent à un seul"
      - "Le code TOTP cesse de changer"
      - "Le coffre ne peut plus être chiffré"
    answer: 0
    explanation: "Un coffre ouvert donne le mot de passe et la clé TOTP. Pour un compte sensible, on sépare les deux, par exemple avec une base distincte ou une clé de sécurité matérielle."
---

## Définition

Un **facteur d'authentification** est une preuve que l'on est bien la personne du compte. On en distingue quatre familles, dont les trois premières sont les facteurs principaux.

### 1. La connaissance : ce que vous savez

Le facteur le plus traditionnel : une information que vous seul êtes censé connaître.

- mot de passe ou phrase de passe ;
- code PIN, numérique ou alphanumérique ;
- réponse à une question secrète.

### 2. La possession : ce que vous possédez

Un objet ou un appareil, physique ou virtuel, que vous détenez.

- un téléphone mobile : code reçu par SMS ou appel vocal, ou application d'authentification comme Google Authenticator ou Microsoft Authenticator ;
- une clé de sécurité matérielle : clé USB ou NFC de type YubiKey, ou FIDO2/WebAuthn ;
- un jeton matériel : un objet qui génère des mots de passe à usage unique (OTP) ;
- un badge ou une carte à puce d'accès.

### 3. L'inhérence ou la biométrie : ce que vous êtes

Une caractéristique physique ou biologique propre à la personne.

- empreinte digitale (Touch ID, etc.) ;
- reconnaissance faciale (Face ID, etc.) ;
- reconnaissance vocale ou scan de la rétine.

### 4. La localisation et le contexte : où vous vous trouvez, comment vous vous connectez

Ces facteurs contextuels viennent en plus des trois précédents. Ils servent surtout à renforcer l'analyse des risques : on ne les compte pas comme un facteur principal.

- géolocalisation : connexion autorisée seulement depuis un pays ou une zone donnée ;
- adresse IP ou réseau d'entreprise de confiance, par exemple via un VPN ;
- heure de la tentative ou appareil reconnu.

### Résumé

| Famille | Question à se poser | Exemples |
| --- | --- | --- |
| Connaissance | Quel secret ai-je en tête ? | Mot de passe, code PIN |
| Possession | Quel objet ai-je en main ? | Téléphone, clé de sécurité, jeton, carte à puce |
| Inhérence | Quelle caractéristique de mon corps me identifie ? | Empreinte, visage |
| Contexte | D'où et comment est-ce que je me connecte ? | Pays, réseau de confiance, appareil reconnu |

## MFA, 2FA et TOTP : la différence

- **2FA** (Two-Factor Authentication) : exactement deux facteurs, de familles différentes. Exemple : un mot de passe plus un code reçu par SMS.
- **MFA** (Multi-Factor Authentication) : terme générique pour deux facteurs ou plus. La 2FA est donc un cas particulier de MFA.
- **TOTP** (Time-based One-Time Password) : une manière de réaliser le facteur de possession, avec un code à 6 chiffres qui change toutes les 30 secondes.

Les facteurs doivent être de familles différentes. Un mot de passe suivi d'une question secrète donne deux fois « ce que je sais » : ce n'est pas de la 2FA.

## Pourquoi l'utiliser

Un mot de passe peut être deviné, réutilisé sur un autre site, volé par un faux site de connexion ou dans une fuite de données. Avec un second facteur, le mot de passe seul ne suffit plus. Une personne qui l'a obtenu doit encore posséder l'objet ou la clé qui produit le code.

Le second facteur peut être un SMS ou un appel, une application de codes, ou une clé matérielle. Les codes d'une application comme TOTP ne dépendent pas du réseau téléphonique. Dans l'exemple ci-dessous, le service n'autorise la méthode par téléphone qu'un nombre limité de fois, ce qui oblige à passer aux codes temporaires.

## Comment fonctionne TOTP

Au moment de l'activation, le service et l'application s'échangent **une seule fois** une clé secrète. Ensuite, chacun calcule seul le code, sans rien s'envoyer :

1. on prend la clé secrète ;
2. on prend l'heure, découpée en fenêtres de 30 secondes ;
3. on mélange les deux avec un calcul standard (HMAC) ;
4. on garde 6 chiffres.

Même clé et même fenêtre de temps donnent le même code des deux côtés. À la connexion, le service compare le code reçu à celui qu'il calcule lui-même.

Cela explique deux points pratiques. Le code change quand la fenêtre change, donc on le saisit vite. Et si l'horloge de l'appareil est décalée de plusieurs dizaines de secondes, les codes sont refusés : on resynchronise l'heure.

Le calcul tient en quelques lignes. Cet exemple sert à comprendre, pas à remplacer une application de confiance :

```python
import base64
import hashlib
import hmac
import struct
import time


def totp(secret_base32: str, pas: int = 30, chiffres: int = 6) -> str:
    """Renvoie le code TOTP courant pour une clé secrète encodée en base 32."""
    cle = base64.b32decode(secret_base32.upper())
    # Numéro de la fenêtre de 30 s : le même pour le service et l'application.
    compteur = int(time.time()) // pas
    mac = hmac.new(cle, struct.pack(">Q", compteur), hashlib.sha1).digest()
    # Les 4 derniers bits du résultat désignent où lire 4 octets à garder.
    decalage = mac[-1] & 0x0F
    entier = struct.unpack(">I", mac[decalage:decalage + 4])[0] & 0x7FFFFFFF
    return str(entier % 10**chiffres).zfill(chiffres)


# Clé d'exemple. Une vraie clé est un secret : on ne la publie jamais.
print(totp("JBSWY3DPEHPK3PXP"))
```

Ce calcul est celui de la norme RFC 6238. Une clé secrète fait donc de l'application un simple calculateur : n'importe quel logiciel qui sait faire ce calcul produit les mêmes codes.


## Reource
[totp-avec-keepassxc](https://www.imo.universite-paris-saclay.fr/fr/intranet/informatique/cyber-attaque-faq-lmo/totp-avec-keepassxc/). La norme du calcul est décrite dans la [RFC 6238](https://www.rfc-editor.org/rfc/rfc6238).
