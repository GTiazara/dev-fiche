---
title: Gérer un projet Python avec Poetry
description: Créer un projet avec poetry new, adopter Poetry dans un projet existant avec poetry init, gérer les dépendances, le fichier poetry.lock et l'environnement virtuel.
technology: python
difficulty: debutant
tags: [python, poetry, dependances, pyproject, environnement-virtuel, packaging]
publishedAt: 2026-11-03
updatedAt: 2026-11-03
draft: false
quiz:
  - question: Quelle commande crée un nouveau dossier de projet avec une arborescence prête à l'emploi ?
    choices:
      - poetry init poetry-demo
      - poetry new poetry-demo
      - poetry create poetry-demo
    answer: 1
    explanation: poetry new crée le dossier, le pyproject.toml, le README, le paquet dans src/ et le dossier tests/.
  - question: Vous avez déjà un dossier avec du code Python. Quelle commande ajoute seulement un pyproject.toml ?
    choices:
      - poetry new .
      - poetry install
      - poetry init
    answer: 2
    explanation: poetry init pose quelques questions puis écrit un pyproject.toml dans le dossier courant, sans toucher au code existant.
  - question: À quoi sert le fichier poetry.lock ?
    choices:
      - Il fige les versions exactes installées pour que tout le monde ait le même environnement
      - Il empêche de modifier le pyproject.toml
      - Il contient le mot de passe du dépôt PyPI
    answer: 0
    explanation: Le lock enregistre les versions exactes résolues. poetry install les réutilise, d'où des installations reproductibles.
  - question: Comment ajouter pytest uniquement pour le développement ?
    choices:
      - poetry add pytest --dev-only
      - poetry add pytest --group dev
      - pip install pytest
    answer: 1
    explanation: L'option --group (ou -G) range la dépendance dans un groupe ; dev n'est pas nécessaire en production.
  - question: Le projet sert seulement à lancer des scripts, sans être publié comme paquet. Quel réglage utiliser ?
    choices:
      - package-mode = false dans [tool.poetry]
      - requires-python = false
      - poetry install --publish
    answer: 0
    explanation: En mode non-paquet, name et version deviennent facultatifs et poetry install n'installe que les dépendances.
---

## Définition

**Poetry** est un outil de **gestion des dépendances** et de **packaging** pour Python. Il remplace l'enchaînement `python -m venv` + `pip install` + `requirements.txt` par un seul outil.

Poetry s'appuie sur deux fichiers :

| Fichier | Rôle | À versionner ? |
| --- | --- | --- |
| `pyproject.toml` | Décrit le projet : nom, version Python acceptée, dépendances voulues | Oui |
| `poetry.lock` | Fige les **versions exactes** installées, sous-dépendances comprises | Oui pour une application |

Il crée aussi un **environnement virtuel** (*virtualenv*) propre à chaque projet : les paquets d'un projet n'entrent pas en conflit avec ceux d'un autre.

## Installer Poetry

La documentation officielle recommande `pipx`, qui installe Poetry dans son propre environnement isolé.

```bash
pipx install poetry
poetry --version
```

Poetry ne doit pas être installé dans l'environnement du projet qu'il gère. Il demande Python 3.10 ou plus récent pour fonctionner, mais ne télécharge pas d'interpréteur Python pour vos projets : il utilise celui présent sur la machine.

## Cas 1 : créer un nouveau projet avec `poetry new`

```bash
poetry new poetry-demo
cd poetry-demo
```

Poetry crée l'arborescence de base :

```text
poetry-demo
├── pyproject.toml
├── README.md
├── src
│   └── poetry_demo
│       └── __init__.py
└── tests
    └── __init__.py
```

| Élément | Rôle |
| --- | --- |
| `pyproject.toml` | Fichier central du projet |
| `README.md` | Présentation du projet |
| `src/poetry_demo/` | Le code du paquet. Le tiret du nom devient un tiret bas, car un nom de module Python ne peut pas contenir de `-` |
| `tests/` | Les tests |

Le `pyproject.toml` généré ressemble à ceci :

```toml
[project]
name = "poetry-demo"
version = "0.1.0"
description = ""
authors = [
    {name = "Votre Nom", email = "vous@example.com"}
]
readme = "README.md"
requires-python = ">=3.10"
dependencies = [
]

[build-system]
requires = ["poetry-core>=2.0.0,<3.0.0"]
build-backend = "poetry.core.masonry.api"
```

- `[project]` contient les métadonnées au format standard Python (PEP 621).
- `requires-python` indique les versions de Python **supportées**. Ce n'est pas une installation de Python.
- `[build-system]` indique l'outil qui construit le paquet (`poetry-core`).

Pour mettre le code directement à la racine plutôt que dans `src/`, utiliser `poetry new --flat poetry-demo`.

## Cas 2 : un projet existant avec `poetry init`

Le dossier contient déjà du code, par exemple des scripts écrits sans gestionnaire de dépendances :

```text
pre-existing-project
├── main.py
└── requirements.txt
```

```bash
cd pre-existing-project
poetry init
```

`poetry init` pose des questions (nom, version, auteur, version de Python, dépendances) puis écrit **uniquement** un `pyproject.toml`. Le code existant n'est ni déplacé ni modifié.

Pour éviter les questions, passer les réponses en options :

```bash
poetry init --no-interaction --name pre-existing-project --python ">=3.10"
```

Reprendre ensuite les dépendances listées dans `requirements.txt` :

```bash
poetry add requests pandas
```

### Projet indépendant : sans paquet à publier

Un projet de scripts, un notebook ou une application qui ne sera jamais publiée sur PyPI n'a pas besoin d'être un paquet. Ajouter dans `pyproject.toml` :

```toml
[tool.poetry]
package-mode = false
```

Dans ce mode, `name` et `version` deviennent facultatifs, et `poetry install` installe seulement les dépendances, sans chercher de dossier `src/nom_du_projet`. C'est l'équivalent de `poetry install --no-root`.

Sans ce réglage, `poetry install` échoue si aucun dossier ne porte le nom du projet.

## Gérer les dépendances

```bash
# Ajouter une dépendance (écrite dans pyproject.toml, installée, verrouillée)
poetry add requests

# Ajouter une dépendance avec une contrainte de version
poetry add "pendulum>=2.1,<3.0"

# Ajouter un outil de développement dans le groupe dev
poetry add pytest --group dev

# Retirer une dépendance
poetry remove requests

# Voir les dépendances installées sous forme d'arbre
poetry show --tree
```

Après ces commandes, le `pyproject.toml` contient par exemple :

```toml
[project]
dependencies = [
    "requests (>=2.32.3,<3.0.0)"
]

[tool.poetry.group.dev.dependencies]
pytest = "^8.3.4"
```

Les numéros de version dépendent du moment où la commande est lancée. Selon la version de Poetry et le fichier existant, le groupe peut aussi être écrit dans une section standard `[dependency-groups]` (PEP 735) : les deux formes sont reconnues.

## Installer et mettre à jour

| Commande | Effet |
| --- | --- |
| `poetry install` | Installe les dépendances. Utilise `poetry.lock` s'il existe, sinon le crée |
| `poetry install --without dev` | Installe sans le groupe `dev`, par exemple en production |
| `poetry install --no-root` | Installe les dépendances sans installer le projet lui-même |
| `poetry lock` | Recalcule `poetry.lock` après une modification manuelle du `pyproject.toml` |
| `poetry update` | Monte les dépendances à la dernière version autorisée par les contraintes |
| `poetry sync` | Aligne l'environnement exactement sur le lock : retire ce qui n'y figure pas |

Un collègue qui clone le dépôt lance seulement :

```bash
git clone https://example.com/equipe/poetry-demo.git
cd poetry-demo
poetry install
```

Il obtient les mêmes versions que vous, grâce à `poetry.lock`.

## Utiliser l'environnement virtuel

```bash
# Lancer une commande dans l'environnement du projet
poetry run python src/poetry_demo/main.py
poetry run pytest

# Activer l'environnement dans le shell courant
eval "$(poetry env activate)"

# Voir où se trouve l'environnement
poetry env info --path
```

Par défaut, l'environnement est rangé dans le cache de Poetry. Pour qu'il soit créé dans un dossier `.venv` à la racine du projet, pratique pour un éditeur comme VS Code :

```bash
poetry config virtualenvs.in-project true
```

Ajouter alors `.venv/` au `.gitignore`.

Pour forcer la création d'un environnement virtuel dans ce projet seulement, sans changer la configuration globale :

```bash
poetry config virtualenvs.create true --local
```

L'option `--local` écrit le réglage dans un fichier `poetry.toml` à la racine du projet, au lieu de la configuration de l'utilisateur. `virtualenvs.create true` est la valeur par défaut : elle sert surtout à annuler un `false` défini globalement, par exemple sur une machine où Poetry doit installer dans l'environnement déjà actif.

### Créer et activer le venv pas à pas

```bash
cd poetry-demo

# 1. Configurer le projet : créer un venv, dans .venv/
poetry config virtualenvs.create true --local
poetry config virtualenvs.in-project true --local

# 2. Créer le venv avec un interpréteur précis (facultatif)
poetry env use python3

# 3. Installer les dépendances (crée le venv s'il n'existe pas encore)
poetry install

# 4. Activer le venv dans le shell courant
eval "$(poetry env activate)"
# ou, puisque le venv est dans le projet :
source .venv/bin/activate

# 5. Vérifier puis quitter
which python
deactivate
```

- `poetry env activate` affiche la commande d'activation ; `eval` l'exécute dans le shell courant.
- Depuis Poetry 2.0, `poetry shell` n'est plus disponible par défaut : il faut le plugin `poetry-plugin-shell`.
- Sans activation, `poetry run <commande>` suffit pour exécuter une commande dans le venv.

## Exemple complet

```bash
poetry new poetry-demo
cd poetry-demo
poetry add requests
poetry add pytest --group dev
```

```python
# src/poetry_demo/main.py
import requests


def status(url: str) -> int:
    return requests.get(url, timeout=5).status_code


if __name__ == "__main__":
    print(status("https://python-poetry.org"))
```

```bash
poetry run python src/poetry_demo/main.py
```

## Ressources

- [Documentation officielle de Poetry](https://python-poetry.org/docs/)
- [Utilisation de base](https://python-poetry.org/docs/basic-usage/)
- [Gestion des dépendances et groupes](https://python-poetry.org/docs/managing-dependencies/)
- [Liste des commandes](https://python-poetry.org/docs/cli/)

## À retenir

- `poetry new nom` crée un nouveau projet complet : `pyproject.toml`, `README.md`, `src/`, `tests/`.
- `poetry init` ajoute seulement un `pyproject.toml` dans un dossier existant.
- `package-mode = false` sert aux projets qui ne seront pas publiés comme paquet.
- `poetry add` / `poetry remove` modifient les dépendances ; `--group dev` sépare les outils de développement.
- `poetry.lock` fige les versions exactes : le versionner pour une application.
- `poetry install` reproduit l'environnement ; `poetry run` exécute une commande dedans.
