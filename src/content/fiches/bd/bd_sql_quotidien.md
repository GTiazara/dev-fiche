---
title: "Les commandes SQL du quotidien"
description: "Lire, écrire et inspecter une base relationnelle avec le SQL qu'un développeur utilise chaque jour."
technology: bd
difficulty: debutant
tags:
  - sql
  - postgresql
  - mysql
  - select
  - transaction
  - information-schema
publishedAt: 2026-11-26
updatedAt: 2026-11-26
draft: false
---

## Définition

SQL (*Structured Query Language*) est le langage pour interroger et modifier des bases relationnelles. Les exemples ci-dessous ciblent surtout **PostgreSQL** ; les variantes MySQL utiles au quotidien sont signalées. Les noms de tables et colonnes sont fictifs (`commandes`, `clients`).

Une requête lit ou change des **lignes** dans des **tables**. Tant qu'une transaction n'est pas validée (`COMMIT`), les écritures peuvent encore être annulées (`ROLLBACK`).

## Se situer sur le serveur

Avant de toucher aux données, vérifier la version et la session.

```sql
SELECT version();                 -- PostgreSQL : texte détaillé du serveur
SHOW server_version;              -- PostgreSQL : numéro seul
SELECT current_database();        -- base courante
SELECT current_user;              -- rôle effectif (sans parenthèses en SQL standard)
```

Sous **MySQL** :

```sql
SELECT VERSION();
SELECT DATABASE();
SELECT CURRENT_USER();
```

`version()` / `VERSION()` confirment qu'on parle au bon moteur et à la bonne version. Pour un test automatique sous PostgreSQL, préférer le paramètre numérique `server_version_num` plutôt que de parser le texte de `version()`.

## Explorer le schéma

Lister les tables et colonnes sans ouvrir un outil graphique. Le schéma `information_schema` fait partie du **SQL standard** et existe sur PostgreSQL, MySQL et d'autres moteurs.

```sql
-- Tables de la base (hors catalogues système)
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_type = 'BASE TABLE'
  AND table_schema NOT IN ('pg_catalog', 'information_schema', 'mysql', 'sys', 'performance_schema')
ORDER BY table_schema, table_name;

-- Colonnes d'une table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'   -- MySQL : nom de la base
  AND table_name = 'commandes'
ORDER BY ordinal_position;
```

Raccourcis courants hors SQL portable :

| Besoin | PostgreSQL (psql) | MySQL |
| --- | --- | --- |
| Lister les tables | `\dt` | `SHOW TABLES;` |
| Décrire une table | `\d commandes` | `DESCRIBE commandes;` ou `SHOW COLUMNS FROM commandes;` |

PostgreSQL n'a pas de `SHOW TABLES`. En SQL pur, on interroge `information_schema` ou la vue `pg_tables`.

## Lire des lignes : SELECT

```sql
SELECT id, statut, total
FROM commandes
WHERE statut = 'payee'
ORDER BY created_at DESC
LIMIT 20;

SELECT c.nom, COUNT(*) AS nb
FROM commandes o
JOIN clients c ON c.id = o.client_id
GROUP BY c.nom
HAVING COUNT(*) >= 3;
```

Ordre utile à retenir : `FROM` / `JOIN` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`. `*` lit toutes les colonnes ; en code applicatif, préférer nommer les colonnes pour éviter les surprises quand le schéma évolue.

Compter sans ramener toutes les lignes :

```sql
SELECT COUNT(*) FROM commandes WHERE statut = 'ouverte';
```

## Écrire : INSERT, UPDATE, DELETE

```sql
INSERT INTO commandes (client_id, statut, total)
VALUES (42, 'ouverte', 19.90)
RETURNING id;   -- PostgreSQL : récupère l'id créé ; MySQL : souvent LAST_INSERT_ID()

UPDATE commandes
SET statut = 'payee', payee_at = NOW()
WHERE id = 1001;

DELETE FROM commandes
WHERE id = 1001;
```

Toujours borner un `UPDATE` ou un `DELETE` avec un `WHERE` (ou une sous-requête) précis. Sans filtre, **toute la table** est modifiée. Avant d'écrire en masse, un `SELECT` avec le même `WHERE` vérifie le périmètre.

## Transactions

Grouper plusieurs écritures qui doivent réussir ou échouer ensemble :

```sql
BEGIN;
UPDATE comptes SET solde = solde - 50 WHERE id = 1;
UPDATE comptes SET solde = solde + 50 WHERE id = 2;
COMMIT;      -- valide
-- ou ROLLBACK;  -- annule tout depuis BEGIN
```

Utile aussi pour tester un `DELETE` / `UPDATE` risqué : `BEGIN;` → modification → contrôle en `SELECT` → `ROLLBACK;` si le résultat ne convient pas.

## Comprendre une requête lente : EXPLAIN

Sous PostgreSQL, `EXPLAIN` montre le plan choisi par l'optimiseur **sans** exécuter la requête. `EXPLAIN ANALYZE` l'exécute vraiment et ajoute les temps réels.

```sql
EXPLAIN
SELECT * FROM commandes WHERE client_id = 42;

BEGIN;
EXPLAIN ANALYZE
UPDATE commandes SET statut = 'archivee' WHERE created_at < DATE '2024-01-01';
ROLLBACK;   -- annule l'effet de l'UPDATE testé
```

Sans `BEGIN` / `ROLLBACK`, un `EXPLAIN ANALYZE` sur un `INSERT` / `UPDATE` / `DELETE` **modifie** les données. MySQL propose `EXPLAIN` (et `EXPLAIN ANALYZE` selon les versions) avec une syntaxe proche pour les `SELECT`.

## À retenir

- `SELECT version()` (PostgreSQL) ou `SELECT VERSION()` (MySQL) : vérifier moteur et version.
- `information_schema.tables` / `columns` : explorer le schéma de façon portable.
- `SELECT` filtre (`WHERE`), trie (`ORDER BY`) et limite (`LIMIT`) ; joindre avec `JOIN`.
- `INSERT` / `UPDATE` / `DELETE` : toujours contrôler le `WHERE` ; transactions avec `BEGIN` / `COMMIT` / `ROLLBACK`.
- `EXPLAIN` lit le plan ; `EXPLAIN ANALYZE` exécute — encapsuler les écritures de test dans une transaction annulable.

## Sources

- [System Information Functions — PostgreSQL](https://www.postgresql.org/docs/current/functions-info.html) : `version()`, `current_database()`, `current_user`
- [SELECT — PostgreSQL](https://www.postgresql.org/docs/current/sql-select.html)
- [The Information Schema — PostgreSQL](https://www.postgresql.org/docs/current/information-schema.html) (vues du SQL standard)
- [EXPLAIN — PostgreSQL](https://www.postgresql.org/docs/current/sql-explain.html)
- [Information Functions — MySQL](https://dev.mysql.com/doc/refman/8.4/en/information-functions.html) : `VERSION()`, `DATABASE()`, `CURRENT_USER()`
- [INFORMATION_SCHEMA TABLES — MySQL](https://dev.mysql.com/doc/refman/8.4/en/information-schema-tables-table.html)
