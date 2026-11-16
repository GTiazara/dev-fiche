---
title: Comprendre et implémenter les Webhooks
description: "Maîtriser les Webhooks pour connecter des applications et réagir aux événements en temps réel : endpoints HTTP, signatures, paiements, déploiements, sécurité et gestion des erreurs."
technology: backend
difficulty: debutant
tags: [webhooks, api, http, nodejs, javascript, backend, fullstack, integration, evenements, securite]
publishedAt: 2026-10-26
updatedAt: 2026-10-26
draft: false
# quiz:
#   - question: Qu'est-ce qu'un Webhook ?
#     choices:
#       - Un mécanisme qui envoie une notification HTTP lorsqu'un événement survient
#       - Une tâche qui s'exécute obligatoirement toutes les minutes
#       - Une base de données destinée à stocker les événements
#     answer: 0
#     explanation: Un Webhook permet à une application d'informer automatiquement une autre application lorsqu'un événement précis se produit.
#   - question: Quelle est la principale différence entre un Webhook et une tâche Cron ?
#     choices:
#       - Un Webhook est déclenché par un événement, tandis qu'une tâche Cron est déclenchée selon une planification temporelle
#       - Un Webhook fonctionne uniquement en local
#       - Une tâche Cron nécessite obligatoirement une API externe
#     answer: 0
#     explanation: Un Webhook est généralement événementiel. Cron déclenche une tâche selon une expression temporelle prédéfinie.
#   - question: Quelle méthode HTTP est généralement utilisée pour transmettre un événement à un Webhook ?
#     choices:
#       - POST
#       - GET
#       - DELETE
#     answer: 0
#     explanation: POST est couramment utilisé pour transmettre un payload contenant les informations de l'événement au serveur destinataire.
#   - question: Pourquoi faut-il vérifier la signature d'un Webhook ?
#     choices:
#       - Pour vérifier l'authenticité et l'intégrité du message reçu
#       - Pour accélérer automatiquement la requête HTTP
#       - Pour convertir le JSON en HTML
#     answer: 0
#     explanation: Une signature cryptographique permet de vérifier que le message provient d'un émetteur disposant du secret attendu et qu'il n'a pas été modifié.
#   - question: Pourquoi un Webhook doit-il idéalement être idempotent ?
#     choices:
#       - Pour éviter de traiter plusieurs fois le même événement avec des effets indésirables
#       - Pour empêcher toutes les requêtes HTTP
#       - Pour supprimer automatiquement les événements anciens
#     answer: 0
#     explanation: Les fournisseurs peuvent réessayer l'envoi d'un événement. L'idempotence permet d'éviter de créer plusieurs fois une commande ou de créditer plusieurs fois un paiement.
#   - question: Quel code HTTP indique généralement qu'une requête a été acceptée pour traitement ?
#     choices:
#       - 202 Accepted
#       - 404 Not Found
#       - 500 Internal Server Error
#     answer: 0
#     explanation: Le code 202 indique que la requête a été acceptée, sans garantir que le traitement est terminé.
#   - question: Que faire si le fournisseur d'un Webhook exige une réponse rapide ?
#     choices:
#       - Vérifier la requête, enregistrer durablement l'événement, répondre rapidement puis traiter le travail en arrière-plan
#       - Attendre systématiquement la fin de tous les traitements lourds avant de répondre
#       - Désactiver les vérifications de sécurité
#     answer: 0
#     explanation: Une file de messages ou un mécanisme de traitement asynchrone permet d'accuser réception rapidement tout en conservant une trace durable de l'événement.
#   - question: Quelle est une bonne pratique face aux tentatives répétées d'un même Webhook ?
#     choices:
#       - Dédupliquer les événements à partir d'un identifiant unique
#       - Traiter chaque requête comme un nouvel événement sans vérification
#       - Désactiver les journaux du serveur
#     answer: 0
#     explanation: Un identifiant d'événement unique permet de détecter les livraisons répétées et d'éviter les effets de bord en double.
#   - question: Pourquoi un Webhook de paiement ne doit-il pas être considéré comme valide uniquement parce que son JSON indique « paid » ?
#     choices:
#       - Parce qu'il faut vérifier l'authenticité de l'événement et son association à la transaction attendue
#       - Parce que le JSON ne peut jamais contenir de données de paiement
#       - Parce que les Webhooks n'utilisent pas HTTP
#     answer: 0
#     explanation: Le serveur doit vérifier la signature selon les règles du fournisseur et contrôler la transaction concernée avant de modifier l'état d'une commande.
---

## Définition

Un **Webhook** est un mécanisme qui permet à une application d'envoyer automatiquement une requête HTTP à une autre application lorsqu'un événement se produit.

Contrairement à une tâche planifiée qui s'exécute à un moment défini, un Webhook est généralement déclenché par un événement.

Exemples :
- Un paiement est confirmé.
- Une commande est créée.
- Un utilisateur s'inscrit.
- Un déploiement se termine.
- Un dépôt Git reçoit un nouveau commit.
- Un document est ajouté à un espace de stockage.

## Principe de fonctionnement

Un Webhook repose généralement sur deux acteurs :

- **L'émetteur :** l'application qui détecte l'événement et envoie une requête HTTP.
- **Le récepteur :** l'application qui expose une URL capable de recevoir et de traiter cette requête.

Exemple de fonctionnement :

```text
Client
  |
  v
Application de paiement
  |
  | Paiement confirmé
  v
Événement : payment.succeeded
  |
  | Requête HTTP POST
  v
https://api.example.com/webhooks/payment
  |
  v
Vérification de la signature
  |
  v
Validation de l'événement
  |
  v
Mise à jour de la commande
  |
  v
Réponse HTTP 2xx
```

Le Webhook évite à l'application destinataire de devoir interroger continuellement l'émetteur pour savoir si un événement s'est produit.

## Webhook, API REST et Cron : quelles différences ?

| Mécanisme | Déclenchement | Exemple |
| --- | --- | --- |
| Webhook | Événement survenu chez l'émetteur | Recevoir la confirmation d'un paiement |
| API REST | Requête explicite d'un client | Demander les détails d'une commande |
| Cron | Horaire ou fréquence définie | Nettoyer les fichiers chaque nuit |
| Polling | Interrogation répétée d'un service | Vérifier toutes les minutes le statut d'un paiement |
| File de messages | Message disponible pour un consommateur | Traiter une commande en arrière-plan |

Un Webhook et Cron sont complémentaires. Un Webhook peut déclencher un traitement immédiatement après un événement, tandis qu'une tâche planifiée peut servir à effectuer des vérifications périodiques ou à récupérer des événements manqués.

## Anatomie d'une requête Webhook

Un Webhook est généralement envoyé sous la forme d'une requête HTTP `POST`.

Exemple :

```http
POST /webhooks/orders HTTP/1.1
Host: api.example.com
Content-Type: application/json
X-Event-Type: order.created
X-Event-Id: evt_123456

{
  "id": "evt_123456",
  "type": "order.created",
  "created_at": "2026-10-26T10:30:00Z",
  "data": {
    "order_id": "ORD-1042",
    "status": "created",
    "amount": 49.90,
    "currency": "EUR"
  }
}
```

Les champs et les en-têtes dépendent du fournisseur : cet exemple illustre un format possible, pas une norme universelle.

| Élément | Rôle |
| --- | --- |
| URL de destination | Identifie le endpoint qui reçoit l'événement |
| Méthode HTTP | Généralement `POST` |
| `Content-Type` | Indique le format du corps, souvent `application/json` |
| Headers | Transportent des métadonnées et parfois une signature |
| Payload | Contient les données de l'événement |
| Code HTTP de réponse | Indique si la requête a été acceptée ou rejetée |

## Créer un endpoint Webhook avec Node.js et Express

### 1. Installer les dépendances

```bash
npm install express
```

### 2. Créer le serveur

Fichier `server.js` :

```javascript
const express = require("express");

const app = express();

app.use(express.json());

app.post("/webhooks/orders", async (req, res) => {
  const event = req.body;

  if (!event || !event.id || !event.type) {
    return res.status(400).json({
      error: "Invalid webhook payload",
    });
  }

  console.log("Webhook reçu :", event.type);

  if (event.type === "order.created") {
    console.log("Nouvelle commande :", event.data?.order_id);
  }

  return res.status(200).json({
    received: true,
  });
});

app.listen(3000, () => {
  console.log("Serveur démarré sur le port 3000");
});
```

### 3. Démarrer le serveur

```bash
node server.js
```

### 4. Tester le endpoint

```bash
curl -X POST http://localhost:3000/webhooks/orders \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_123456",
    "type": "order.created",
    "data": {
      "order_id": "ORD-1042"
    }
  }'
```

Le serveur reçoit le JSON et affiche les informations de l'événement.

**Attention :** cet exemple est pédagogique. En production, il faut vérifier l'authenticité de la requête, dédupliquer les événements et contrôler les données avant d'effectuer des opérations métier.

## Vérifier la signature d'un Webhook

Un endpoint public ne doit pas faire confiance à une requête simplement parce qu'elle contient un JSON valide.

Un attaquant pourrait essayer d'appeler directement le endpoint pour simuler un paiement ou une commande.

Les fournisseurs de Webhooks proposent souvent une signature cryptographique, fréquemment calculée à l'aide de HMAC-SHA256.

Le principe est le suivant :

1. L'émetteur calcule une signature à partir du contenu du message et d'un secret partagé.
2. Il transmet cette signature dans un en-tête HTTP.
3. Le récepteur recalcule la signature selon la procédure du fournisseur.
4. Il compare les signatures de manière sécurisée.
5. Il rejette la requête si la signature est invalide.

### Exemple avec Node.js

Voici un exemple pédagogique de vérification HMAC. Le format de l'en-tête et les règles exactes doivent correspondre au fournisseur utilisé.

```javascript
const crypto = require("node:crypto");

function verifySignature(rawBody, receivedSignature, secret) {
  if (
    typeof receivedSignature !== "string" ||
    !/^[a-f0-9]{64}$/i.test(receivedSignature)
  ) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest();

  const receivedBuffer = Buffer.from(receivedSignature, "hex");

  return (
    receivedBuffer.length === expectedSignature.length &&
    crypto.timingSafeEqual(receivedBuffer, expectedSignature)
  );
}
```

Le corps utilisé pour calculer la signature doit correspondre exactement aux octets attendus par le fournisseur. Il faut donc généralement conserver le corps HTTP brut avant son analyse JSON.

Configuration Express pour une route utilisant ce type de signature :

```javascript
const express = require("express");
const crypto = require("node:crypto");

const app = express();

const secret = process.env.WEBHOOK_SECRET;

if (!secret) {
  throw new Error("WEBHOOK_SECRET is required");
}

function verifySignature(rawBody, receivedSignature, secret) {
  if (
    typeof receivedSignature !== "string" ||
    !/^[a-f0-9]{64}$/i.test(receivedSignature)
  ) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest();

  const received = Buffer.from(receivedSignature, "hex");

  return (
    received.length === expected.length &&
    crypto.timingSafeEqual(received, expected)
  );
}

app.post(
  "/webhooks/orders",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.get("X-Webhook-Signature");

    if (!verifySignature(req.body, signature, secret)) {
      return res.status(401).json({
        error: "Invalid signature",
      });
    }

    let event;

    try {
      event = JSON.parse(req.body.toString("utf8"));
    } catch {
      return res.status(400).json({
        error: "Invalid JSON",
      });
    }

    if (!event.id || !event.type) {
      return res.status(400).json({
        error: "Invalid event",
      });
    }

    console.log("Événement authentifié :", event.type);

    return res.status(200).json({
      received: true,
    });
  }
);

app.listen(3000);
```

Cette implémentation suppose un fournisseur qui transmet une signature hexadécimale HMAC-SHA256 du corps brut dans `X-Webhook-Signature`. Ce format est un exemple, pas une convention universelle.

En production, respectez les spécifications du fournisseur, notamment la gestion des horodatages, les protections contre le rejeu et le format de signature.

## Traiter un événement de paiement

Un cas classique est la réception d'une confirmation de paiement.

Exemple de payload :

```json
{
  "id": "evt_payment_987",
  "type": "payment.succeeded",
  "data": {
    "payment_id": "pay_456",
    "order_id": "ORD-1042",
    "amount": 4990,
    "currency": "EUR"
  }
}
```

Dans cet exemple, le montant est exprimé en centimes.

Le traitement métier peut suivre cette logique :

```text
Réception du Webhook
        |
        v
Vérification de la signature
        |
        v
Validation du payload
        |
        v
Vérification de l'identifiant de l'événement
        |
        v
Recherche de la commande
        |
        v
Vérification du paiement auprès du fournisseur
si nécessaire
        |
        v
Mise à jour transactionnelle de la commande
        |
        v
Enregistrement de l'événement traité
        |
        v
Réponse HTTP 2xx
```

**Règle essentielle :** ne marquez jamais une commande comme payée uniquement parce qu'un client ou un payload non vérifié affirme que le paiement a réussi.

Il faut authentifier l'événement, vérifier son association à la commande et appliquer les contrôles métier nécessaires.

## Gérer les événements en double avec l'idempotence

Un fournisseur peut envoyer plusieurs fois le même événement, notamment lorsqu'il n'a pas reçu la réponse attendue ou qu'une nouvelle tentative est déclenchée.

Le serveur doit donc éviter d'appliquer plusieurs fois la même opération.

### Exemple de problème

```text
Webhook reçu : payment.succeeded
    |
    v
Commande marquée comme payée
    |
    v
Même Webhook reçu une deuxième fois
    |
    v
Risque : traitement métier exécuté deux fois
```

### Solution

Enregistrez un identifiant unique d'événement dans une base de données et protégez son unicité avec une contrainte adaptée.

```sql
CREATE TABLE processed_webhooks (
    event_id VARCHAR(255) PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Lors du traitement, l'application peut tenter d'enregistrer l'identifiant de l'événement.

```sql
INSERT INTO processed_webhooks (event_id, event_type)
VALUES ('evt_payment_987', 'payment.succeeded')
ON CONFLICT (event_id) DO NOTHING;
```

Cet exemple utilise PostgreSQL.

Le code applicatif doit vérifier si l'insertion a réellement eu lieu. Si l'événement existe déjà, il faut éviter de répéter les effets métier.

**Important :** l'enregistrement de l'événement et la mise à jour métier doivent être organisés de façon transactionnelle pour éviter les états incohérents. Une insertion d'identifiant suivie d'un traitement qui échoue nécessite une stratégie de reprise.

## Répondre rapidement et traiter en arrière-plan

Les fournisseurs peuvent imposer un délai maximal pour recevoir une réponse.

Si le traitement prend trop de temps, le fournisseur peut considérer la livraison comme échouée et réessayer.

Pour les traitements lourds, une architecture courante consiste à :

1. Vérifier la signature.
2. Valider le format de l'événement.
3. Enregistrer durablement l'événement ou le placer dans une file de messages.
4. Retourner rapidement une réponse HTTP adaptée.
5. Traiter l'événement en arrière-plan.
6. Enregistrer le résultat et prévoir une stratégie de reprise.

Exemple :

```text
Fournisseur Webhook
        |
        v
Endpoint HTTP
        |
        v
Vérification de signature
        |
        v
Enregistrement durable
        |
        v
Réponse HTTP 202
        |
        v
File de messages
        |
        v
Worker
        |
        v
Traitement métier
```

Le code `202 Accepted` signifie que la requête a été acceptée pour traitement. Il ne garantit pas que le traitement est terminé.

Ne renvoyez pas une réponse de succès avant d'avoir enregistré durablement l'événement lorsque la fiabilité du traitement l'exige.

## Gérer les erreurs et les nouvelles tentatives

Un Webhook peut échouer pour plusieurs raisons :

- Le serveur destinataire est indisponible.
- La connexion réseau échoue.
- Le serveur retourne une erreur HTTP.
- La signature est invalide.
- Le payload ne respecte pas le format attendu.
- Une dépendance externe est temporairement indisponible.

Les fournisseurs n'appliquent pas tous les mêmes règles de nouvelle tentative.

| Situation | Réponse ou stratégie possible |
| --- | --- |
| Requête mal formée | Retourner `400 Bad Request` |
| Signature invalide | Retourner `401 Unauthorized` ou `403 Forbidden`, selon le contrat |
| Événement authentifié et accepté | Retourner un code `2xx` |
| Traitement asynchrone accepté durablement | Retourner `202 Accepted` |
| Indisponibilité temporaire avant acceptation | Retourner une erreur adaptée afin de permettre une éventuelle nouvelle tentative |
| Événement déjà traité | Retourner généralement `2xx` si le traitement précédent a été confirmé |

Les codes de réponse et les politiques de nouvelle tentative dépendent du fournisseur.

Pour un événement invalide, une nouvelle tentative ne résoudra généralement pas le problème. Pour une indisponibilité temporaire, elle peut permettre au traitement de réussir ultérieurement.

## Tester un Webhook en développement

Les fournisseurs envoient souvent leurs événements vers une URL publique. Un serveur exécuté sur `localhost` n'est normalement pas accessible directement depuis Internet.

Plusieurs solutions existent :

- Utiliser l'outil de test fourni par le prestataire.
- Exposer temporairement un endpoint local avec un tunnel HTTPS.
- Utiliser un environnement de préproduction accessible.
- Simuler une requête HTTP avec `curl`.

Exemple de test local :

```bash
curl -X POST http://localhost:3000/webhooks/orders \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_test_001",
    "type": "order.created",
    "data": {
      "order_id": "ORD-1001"
    }
  }'
```

Cette commande teste la réception du JSON, mais ne simule pas automatiquement une signature valide.

Pour tester la sécurité, utilisez une signature calculée avec le secret de test et le format exact attendu par votre application.

## Webhooks dans un environnement Full Stack

Les Webhooks sont couramment utilisés pour connecter le frontend, le backend et des services externes.

| Cas d'usage | Événement | Action du backend |
| --- | --- | --- |
| Paiement | `payment.succeeded` | Confirmer la commande après validation |
| Paiement | `payment.failed` | Mettre à jour l'état du paiement |
| Git | `push` | Déclencher une pipeline CI/CD |
| Déploiement | `deployment.completed` | Notifier l'équipe |
| E-commerce | `order.created` | Lancer le traitement de la commande |
| Stockage | `file.uploaded` | Déclencher un traitement du fichier |
| Communication | `message.delivered` | Actualiser le statut d'un message |

Les noms d'événements ci-dessus sont illustratifs. Chaque service possède ses propres conventions.

## Webhooks et sécurité

Un endpoint Webhook accessible publiquement doit être protégé.

Les principales mesures sont :

- **Vérification de signature :** authentifier l'émetteur selon le protocole du fournisseur.
- **HTTPS :** protéger les communications en transit.
- **Protection contre le rejeu :** vérifier les horodatages ou les identifiants d'événements lorsque le fournisseur le permet.
- **Idempotence :** éviter les doubles traitements.
- **Validation des données :** contrôler le schéma et les valeurs reçues.
- **Gestion des secrets :** conserver les clés dans des variables d'environnement ou un gestionnaire de secrets adapté.
- **Limitation des ressources :** définir des limites de taille pour les payloads et appliquer une stratégie de limitation du trafic.
- **Journalisation :** enregistrer les identifiants d'événements et les erreurs sans exposer les données sensibles.
- **Contrôle des autorisations :** vérifier que l'événement peut réellement modifier la ressource concernée.

Évitez de considérer une adresse IP ou un en-tête arbitraire comme une preuve suffisante d'authenticité.

## Pièges et points de vigilance

- **Endpoint inaccessible :** le fournisseur doit pouvoir atteindre l'URL de destination.
- **Réponse trop lente :** les traitements longs peuvent provoquer des délais d'expiration et des livraisons répétées.
- **Doublons :** un même événement peut être livré plusieurs fois.
- **Ordre des événements :** les événements peuvent arriver dans un ordre différent de celui de leur création.
- **Signature incorrecte :** le corps brut et le format de signature doivent respecter les règles du fournisseur.
- **Événements ignorés :** prévoyez un comportement explicite pour les types d'événements inconnus.
- **Absence de reprise :** conservez suffisamment d'informations pour diagnostiquer et retraiter les événements échoués.
- **Dépendance au fournisseur :** consultez sa documentation pour connaître les délais, les codes de réponse et les règles de nouvelle tentative.
- **Secrets exposés :** ne publiez jamais de secret de signature dans le frontend ou dans un dépôt public.
- **Logs sensibles :** évitez d'enregistrer des données personnelles ou des informations de paiement inutiles.
- **Absence de garantie absolue :** un Webhook ne garantit pas, à lui seul, une livraison exactement une fois.

## À retenir

Un Webhook permet à une application de notifier une autre application lorsqu'un événement se produit.

Les notions essentielles sont :

- `POST` : méthode HTTP couramment utilisée pour envoyer un événement.
- **Endpoint** : URL qui reçoit le Webhook.
- **Payload** : données associées à l'événement.
- **Signature** : mécanisme permettant de vérifier l'authenticité du message.
- **Idempotence** : protection contre les traitements répétés.
- **File de messages** : moyen de traiter les événements en arrière-plan.
- **Retry** : nouvelle tentative après un échec.
- **HTTPS** : protection des échanges en transit.

Pour un développeur Full Stack, une bonne implémentation doit vérifier la signature, valider les données, éviter les doublons, répondre dans les délais attendus et prévoir une stratégie de reprise.

## Sources

- Documentation MDN — [Méthode HTTP POST](https://developer.mozilla.org/fr/docs/Web/HTTP/Methods/POST)
- Documentation Stripe — [Webhooks](https://docs.stripe.com/webhooks)
- Documentation GitHub — [Webhooks](https://docs.github.com/en/webhooks)
- Documentation Express — [API Express](https://expressjs.com/en/4x/api.html)
- Documentation Node.js — [Module crypto](https://nodejs.org/api/crypto.html)
- Documentation CloudEvents — [Spécification des événements](https://cloudevents.io/)