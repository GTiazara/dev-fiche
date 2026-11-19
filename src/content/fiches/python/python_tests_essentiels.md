---
title: "Tests en Python : les concepts essentiels avec pytest"
description: "Écrire, lancer et organiser des tests en Python : assertions, fixtures, parametrize, mocks, couverture et bonnes pratiques avec pytest."
technology: python
difficulty: debutant
tags: [python, tests, pytest, assertions, fixtures, mocks, couverture]
publishedAt: 2026-11-19
updatedAt: 2026-11-19
draft: false
quiz:
  - question: "Quelle convention permet à pytest de trouver automatiquement vos tests ?"
    choices:
      - "Un fichier test_*.py avec des fonctions qui commencent par test_"
      - "Un fichier *.test.py avec des classes qui commencent par Test"
      - "N'importe quel fichier .py dès qu'il contient un assert"
    answer: 0
    explanation: "Par défaut, pytest collecte les fichiers test_*.py ou *_test.py, puis les fonctions dont le nom commence par test_."
  - question: "Quel est le rôle principal d'une fixture ?"
    choices:
      - "Fournir un contexte réutilisable avant le test, et le nettoyer ensuite si besoin"
      - "Remplacer tous les assert du test"
      - "Accélérer l'installation de pytest"
    answer: 0
    explanation: "Une fixture prépare ce dont le test a besoin : données, objet, fichier temporaire ou base de test. Le test la demande simplement en paramètre."
  - question: "Pourquoi écrire pytest.approx(0.3) plutôt que 0.1 + 0.2 == 0.3 ?"
    choices:
      - "Parce que == est interdit dans un test"
      - "Parce que les nombres décimaux accumulent des erreurs d'arrondi : approx autorise une tolérance"
      - "Parce que approx convertit les nombres en entiers"
    answer: 1
    explanation: "En virgule flottante, 0.1 + 0.2 vaut environ 0.30000000000000004. approx compare avec une tolérance, sans exiger une égalité bit à bit."
  - question: "À quoi sert unittest.mock.patch dans un test ?"
    choices:
      - "À remplacer temporairement une dépendance lente ou indisponible pendant le test"
      - "À rendre le test plus long pour couvrir plus de lignes"
      - "À corriger une erreur de syntaxe dans le module testé"
    answer: 0
    explanation: "patch remplace une fonction ou un objet le temps du test : on peut ainsi tester sans réseau, sans base de données et sans dépendre de l'heure courante."
  - question: "Un test échoue seulement lorsqu'il est lancé après un autre test. Quelle est la cause la plus probable ?"
    choices:
      - "pytest ne reconnaît pas le nom du fichier"
      - "Le test dépend d'un état laissé par un autre test : il doit être indépendant"
      - "Il faut augmenter le pourcentage de couverture"
    answer: 1
    explanation: "Un test doit pouvoir être lancé seul, dans n'importe quel ordre. S'il dépend du test précédent, il faut déplacer l'état partagé dans une fixture ou le réinitialiser."
---

## Définition

Un **test automatisé** est une fonction Python qui vérifie un comportement du code. Elle prépare un contexte, appelle le code à tester, puis compare le résultat à ce qu'elle attend. Le test passe si la comparaison est vraie, et échoue sinon.

**pytest** est le framework de test le plus utilisé en Python. Il se contente de fonctions : pas besoin d'hériter d'une classe ni d'enregistrer les tests dans une liste. La bibliothèque standard fournit aussi `unittest`, plus verbeux, mais pytest sait exécuter ses tests.

Tester ne sert pas seulement à trouver des bugs : c'est aussi une documentation vivante du comportement attendu et un filet de sécurité quand on modifie le code.

## Mots-clés

| Notion | Rôle |
| --- | --- |
| `test_` | Préfixe d'un fichier ou d'une fonction découvert par pytest |
| `assert` | Vérification : si la condition est fausse, le test échoue |
| Arrangement / Action / Assertion | Structure d'un test : préparer, agir, vérifier |
| fixture | Contexte réutilisable fourni à un test en paramètre |
| `conftest.py` | Fichier de fixtures et de réglages partagés par plusieurs fichiers de test |
| `@pytest.mark.parametrize` | Lance le même test avec plusieurs jeux de valeurs |
| `unittest.mock.patch` | Remplace temporairement une dépendance pendant un test |
| couverture | Proportion de lignes de code exécutées par les tests |

## Les niveaux de test

| Niveau | Ce qu'il vérifie | Exemple |
| --- | --- | --- |
| Unitaire | Une petite fonction isolée | `prix_ttc(10, 2)` renvoie bien 24 |
| Intégration | Plusieurs briques qui travaillent ensemble | Une requête HTTP, la lecture en base et la réponse |
| Bout en bout (*end to end*) | Un parcours complet vu par l'utilisateur | Inscription, connexion puis achat dans un navigateur |

Les tests unitaires sont rapides et nombreux ; les tests de bout en bout sont lents et plus fragiles. Une suite de tests saine ressemble à une pyramide : beaucoup de tests unitaires, quelques tests d'intégration, peu de tests bout en bout.

## Écrire un premier test

Un test suit presque toujours les trois temps **Arrangement / Action / Assertion** (souvent abrégés *Arrange, Act, Assert*) :

```python
# test_calcul.py
from calcul import prix_ttc


def test_prix_ttc_avec_quantite() -> None:
    # Arrangement : les données d'entrée
    prix_unitaire = 10.0
    quantite = 2

    # Action : le code à tester
    resultat = prix_ttc(prix_unitaire, quantite)

    # Assertion : le comportement attendu
    assert resultat == 24.0
```

Quelques conventions à respecter dès le départ :

- le fichier s'appelle `test_calcul.py` (ou `calcul_test.py`) et la fonction commence par `test_` ;
- le nom du test décrit le comportement attendu, pas l'implémentation : `test_prix_ttc_refuse_un_prix_negatif` ;
- un test vérifie une seule idée : quand il échoue, on sait immédiatement ce qui est cassé.

## Lancer les tests

```bash
# Toute la suite, depuis la racine du projet
python -m pytest

# Plus lisible, avec un résumé des échecs
python -m pytest -v --tb=short

# Un seul fichier, un seul test, ou un mot-clé dans les noms
python -m pytest tests/test_calcul.py
python -m pytest tests/test_calcul.py::test_prix_ttc_avec_quantite
python -m pytest -k "prix_ttc"

# S'arrêter au premier échec
python -m pytest -x
```

`python -m pytest` et `pytest` lancent le même outil, mais la première forme utilise explicitement l'interpréteur Python actif : l'import du code du projet fonctionne sans ambiguïté sur l'environnement virtuel. C'est le réflexe le plus sûr, surtout dans un projet qui n'est pas installé comme paquet.

Pytest installe le paquet dans l'environnement du projet, par exemple `python -m pip install pytest`, ou `poetry add pytest --group dev` si le projet utilise Poetry.

## Les assertions

`assert` est la base : suivi d'une expression, il fait échouer le test si elle est fausse. Pytest réécrit les assertions pour afficher les valeurs comparées dans le message d'échec, ce qui rend le diagnostic bien plus clair qu'un simple `AssertionError`.

```python
def test_verifications_courantes() -> None:
    noms = ["python", "pytest"]

    assert 2 + 2 == 4
    assert "python" in "python pytest"
    assert noms == ["python", "pytest"]
```

Quelques outils complémentaires :

| Besoin | Écriture |
| --- | --- |
| Vérifier qu'une exception est levée | `with pytest.raises(ValueError): ...` |
| Vérifier le message de l'exception | `pytest.raises(ValueError, match="positif")` |
| Comparer des nombres décimaux | `pytest.approx(0.3)` |
| Comparer des identités | `assert resultat is None` |

Deux pièges classiques :

- `assert` peut être supprimé par Python avec l'option `-O` (optimisation). Les tests ne se lancent jamais avec cette option, mais un `assert` ne doit pas servir à valider des données dans le code de production ;
- `==` compare des valeurs, `is` compare des identités d'objets. Pour `None`, `True` et `False`, utiliser `is` ; pour une chaîne ou une liste recréée, utiliser `==`.

## Les fixtures

Une **fixture** prépare un contexte dont plusieurs tests ont besoin. On la déclare avec `@pytest.fixture`, puis on la demande en paramètre du test : pytest l'appelle et transmet sa valeur de retour.

```python
import pytest


@pytest.fixture
def prix_unitaire() -> float:
    """Fournit un prix simple utilisable par plusieurs tests."""
    return 10.0


def test_prix_avec_unitaire(prix_unitaire: float) -> None:
    assert prix_unitaire * 2 == 20.0
```

Les fixtures communes à plusieurs fichiers vont dans un `conftest.py` placé à la racine des tests : pytest le charge automatiquement, il n'y a rien à importer.

| Portée (`scope`) | Durée de vie | Usage typique |
| --- | --- | --- |
| `function` (défaut) | Un test | Données simples, aucune fuite entre les tests |
| `module` | Un fichier de test | Contexte coûteux partagé par les tests d'un fichier |
| `session` | Toute la suite | Connexion à une base de test, serveur lancé une fois |

Une fixture qui doit nettoyer après le test utilise `yield` au lieu de `return` : le code après `yield` s'exécute à la fin, même si le test échoue. Les fixtures intégrées `tmp_path` (dossier temporaire propre par test) et `monkeypatch` (modification d'une variable le temps du test) couvrent déjà beaucoup de besoins.

Le point le plus important : une fixture ne doit **pas** masquer une dépendance cachée entre deux tests. Chaque test reste indépendant et peut être lancé seul.

## Tester plusieurs cas avec `parametrize`

Quand plusieurs tests ne diffèrent que par les valeurs d'entrée, `@pytest.mark.parametrize` les remplace par un seul test paramétré. Chaque ligne devient un test indépendant dans le rapport.

```python
import pytest

from calcul import prix_ttc


@pytest.mark.parametrize(
    ("prix_ht", "quantite", "attendu"),
    [
        (10.0, 1, 12.0),
        (10.0, 2, 24.0),
        (0.0, 5, 0.0),
    ],
)
def test_prix_ttc(prix_ht: float, quantite: int, attendu: float) -> None:
    assert prix_ttc(prix_ht, quantite) == pytest.approx(attendu)
```

C'est plus court, plus lisible, et l'échec indique directement la combinaison de valeurs qui pose problème.

## Remplacer une dépendance avec un mock

Un **mock** est un objet qui imite une dépendance. On l'utilise pour tester une fonction sans accéder au réseau, à une base de données ou à l'heure réelle : le test devient rapide et reproductible.

```python
# blog.py
from datetime import datetime


def annee_publication() -> int:
    """Renvoie l'année courante, calculée à partir de l'horloge système."""
    return datetime.now().year
```

```python
# test_blog.py
from unittest.mock import patch

from blog import annee_publication


def test_annee_publication() -> None:
    with patch("blog.datetime") as datetime_fausse:
        datetime_fausse.now.return_value.year = 2026
        assert annee_publication() == 2026
```

La cible du `patch` est le nom **dans le module testé** (`blog.datetime`), pas le nom d'origine (`datetime.datetime`) : c'est l'objet que `blog` a importé qui est utilisé au moment de l'appel.

La règle d'or : simuler ce que le code **consomme**, jamais ce qu'il doit **faire**. Si l'on remplace la fonction testée elle-même, le test ne vérifie plus rien.

## Marqueurs, sélection et couverture

Les marqueurs ajoutent une étiquette à un test :

| Marqueur | Effet |
| --- | --- |
| `@pytest.mark.skip(reason="...")` | Test ignoré, avec une raison affichée |
| `@pytest.mark.xfail(reason="...")` | Échec attendu, connu et documenté |
| `@pytest.mark.parametrize(...)` | Plusieurs jeux de valeurs pour un même test |

Les réglages du projet peuvent vivre dans `pyproject.toml` :

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-ra --strict-markers"
markers = ["lent: tests qui dépassent quelques secondes"]
```

`--strict-markers` refuse les marqueurs mal orthographiés, et `-ra` affiche un résumé des tests ignorés ou attendus.

La **couverture** mesure quelles lignes ont été exécutées par les tests, avec le plugin `pytest-cov` :

```bash
python -m pytest --cov=calcul --cov-report=term-missing
```

Le rapport signale les lignes jamais parcourues. Un fort pourcentage ne prouve pas que les tests sont bons : il faut tout de même vérifier les cas limites, les erreurs et les valeurs particulières.

## Bonnes pratiques

- Un test **indépendant** : il passe seul, dans n'importe quel ordre, sans dépendre d'un fichier laissé par un autre test.
- Un test **reproductible** : pas d'heure courante, de nombre aléatoire ou de réseau non contrôlé ; utiliser `patch`, `tmp_path` ou `monkeypatch`.
- Un test **rapide** : les tests lents découragent les lancements fréquents. Isoler les cas lents derrière un marqueur.
- Un test **lisible** : le nom énonce le comportement attendu ; la structure Arrangement / Action / Assertion reste visible.
- Tester les cas limites : zéro, vide, valeur négative, liste d'un élément, chaîne avec accents, exception.
- Corriger le test avec le code : un test qui échoue après une modification vérifie parfois une ancienne règle, pas toujours un bug.

## Exemple complet

Avec `panier.py` à la racine du projet :

```python
# panier.py
"""Calcul du prix d'une ligne de panier."""

TVA = 0.2


def prix_ttc(prix_ht: float, quantite: int = 1) -> float:
    """Renvoie le prix toutes taxes, arrondi à deux décimales."""
    if prix_ht < 0 or quantite < 0:
        raise ValueError("le prix et la quantité doivent être positifs")
    return round(prix_ht * quantite * (1 + TVA), 2)
```

Et `tests/test_panier.py` :

```python
# tests/test_panier.py
import pytest

from panier import prix_ttc


@pytest.fixture
def prix_unitaire() -> float:
    """Fournit le prix de référence utilisé par les tests."""
    return 10.0


@pytest.mark.parametrize(
    ("prix_ht", "quantite", "attendu"),
    [(10.0, 1, 12.0), (10.0, 2, 24.0), (0.0, 5, 0.0)],
)
def test_prix_ttc(prix_ht: float, quantite: int, attendu: float) -> None:
    assert prix_ttc(prix_ht, quantite) == pytest.approx(attendu)


def test_prix_ttc_utilise_la_fixture(prix_unitaire: float) -> None:
    assert prix_ttc(prix_unitaire, 2) == pytest.approx(24.0)


def test_prix_negatif_refuse() -> None:
    with pytest.raises(ValueError, match="positifs"):
        prix_ttc(-1.0)
```

```bash
python -m pytest tests/test_panier.py -v
```

Cet exemple rassemble l'essentiel : découverte automatique, paramétrage, fixture, assertion approchée et vérification d'exception.

## Ressources

- [Documentation officielle de pytest](https://docs.pytest.org/)
- [Guide de démarrage de pytest](https://docs.pytest.org/en/stable/how-to/usage.html)
- [Documentation de `unittest.mock`](https://docs.python.org/3/library/unittest.mock.html)

## À retenir

- Un test est une fonction : préparer les données, appeler le code, vérifier avec `assert`.
- Pytest trouve les fichiers `test_*.py` et les fonctions `test_*` ; on le lance avec `python -m pytest`.
- Une fixture fournit un contexte réutilisable ; `conftest.py` la partage entre fichiers.
- `pytest.raises`, `pytest.approx` et `@pytest.mark.parametrize` couvrent la plupart des besoins courants.
- Un mock remplace une dépendance pendant le test ; on ne simule jamais le code que l'on teste.
- Un bon test est indépendant, reproductible, rapide et nommé d'après le comportement attendu.
