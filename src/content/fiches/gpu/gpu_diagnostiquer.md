---
title: "Diagnostiquer « le GPU ne marche pas » : checklist couche par couche"
description: "Passer en revue matériel, driver, variables d'environnement, build PyTorch et conteneurs pour trouver pourquoi CUDA ou le GPU restent invisibles."
technology: gpu
difficulty: debutant
tags:
  - gpu
  - diagnostic
  - cuda
  - nvidia-smi
  - pytorch
  - troubleshooting
  - docker
publishedAt: 2026-11-23
updatedAt: 2026-11-23
draft: false
quiz:
  - question: "Dans quel ordre faut-il diagnostiquer un GPU qui « ne marche pas » ?"
    choices:
      - "Framework d'abord, puis driver, puis matériel"
      - "Du bas vers le haut : matériel / driver, puis environnement, puis le framework"
      - "Uniquement en relançant Docker"
    answer: 1
    explanation: "Si nvidia-smi échoue, réparer le driver ou le matériel d'abord. Sinon on perd du temps sur pip."
  - question: "nvidia-smi liste une carte, mais torch.version.cuda vaut None. Cause la plus probable ?"
    choices:
      - "Le driver est trop récent"
      - "Une roue PyTorch CPU-only (ou sans CUDA) est installée"
      - "Il manque nvcc"
    answer: 1
    explanation: "None (ou un suffixe +cpu) indique un build sans CUDA. Réinstaller depuis l'index cuXXX."
  - question: "CUDA_VISIBLE_DEVICES est défini à une chaîne vide. Que voit une appli CUDA ?"
    choices:
      - "Tous les GPU"
      - "Aucun GPU"
      - "Seulement le GPU 0"
    answer: 1
    explanation: "NVIDIA documente qu'une valeur vide masque tous les devices. Un -1 a le même effet côté PyTorch."
  - question: "nvidia-smi fonctionne sur l'hôte, mais pas dans un conteneur Docker. Premier réflexe ?"
    choices:
      - "Désinstaller le driver de l'hôte"
      - "Vérifier le NVIDIA Container Toolkit et relancer avec --gpus (accès GPU exposé)"
      - "Installer nvcc dans le conteneur"
    answer: 1
    explanation: "Le conteneur n'hérite pas du GPU tout seul. Il faut le toolkit côté hôte et un lancement avec accès GPU."
  - question: "Quel symptôme renvoie plutôt vers la fiche VRAM, pas vers « GPU invisible » ?"
    choices:
      - "torch.cuda.is_available() est False"
      - "CUDA out of memory pendant un entraînement"
      - "nvidia-smi: command not found"
    answer: 1
    explanation: "L'OOM signifie que le GPU est vu et utilisé, mais la mémoire est pleine. Ce n'est pas le même problème qu'une carte invisible."
---

## Définition

« Le GPU ne marche pas » recouvre plusieurs pannes différentes. Avant de tout réinstaller, **nommer le symptôme**, puis tester **du bas vers le haut** de la pile : matériel → driver → variables d'environnement → framework → conteneur.

Cette fiche est une **checklist**. Les détails d'installation PyTorch, de VRAM ou d'`CUDA_VISIBLE_DEVICES` sont dans les fiches associées.

## Nommer le symptôme

| Ce que vous voyez | Ce que ce n'est (souvent) pas | Piste |
| --- | --- | --- |
| `is_available()` False, `cudaErrorNoDevice`, aucun device | Un simple OOM | Carte invisible ou filtrée |
| `NVIDIA driver … is too old` | Une roue CPU | Incompatibilité driver ↔ runtime |
| `CUDA out of memory` | GPU « cassé » | VRAM pleine (fiche VRAM) |
| Calcul OK mais mauvais GPU / machine saturée | Driver absent | Isolation / machine partagée |
| Très lent, GPU à 0 % d'utilisation | Invisible | Données ou code CPU-bound (autre sujet) |

Si le GPU **est vu** et qu'un tenseur CUDA s'alloue, le problème n'est plus « le GPU ne marche pas » : changez de checklist.

## Checklist : du bas vers le haut

Exécuter les commandes **sur la machine où tourne le job** (nœud de calcul, VM, conteneur), pas seulement sur le laptop de connexion.

### 1. Matériel et bus PCI

```bash
lspci | grep -i nvidia
```

- Aucune ligne NVIDIA → pas de carte (ou pas de passthrough VM / mauvais type d'instance cloud).
- Une ligne apparaît → passer au driver.

### 2. Driver et nvidia-smi

```bash
nvidia-smi
lsmod | grep nvidia
ls -l /dev/nvidia*
```

| Résultat | Action |
| --- | --- |
| `command not found` / « couldn't communicate with the NVIDIA driver » | Installer ou réparer le **driver** pour le noyau actuel ; redémarrer si besoin |
| Module absent après une MAJ noyau | Rebuild / réinstall du driver (DKMS), puis reboot |
| `nvidia-smi` OK, GPU listés | Noter `CUDA Version` (plafond driver) et passer à l'étape 3 |

`nvidia-smi` parle à **NVML**. S'il échoue, inutile de debugger `pip` tant que le driver n'est pas OK.

### 3. Variables qui masquent les GPU

```bash
echo "CUDA_VISIBLE_DEVICES=[$CUDA_VISIBLE_DEVICES]"
```

- Variable **vide** (`""`) → **aucun** GPU visible (doc NVIDIA).
- Valeur `-1` → souvent aucun GPU côté PyTorch.
- Indice hors plage / UUID faux → devices filtrés trop tôt dans la liste.
- Variable définie **après** l'import de `torch` dans un shell parent → le processus déjà lancé ne la voit pas.

Test rapide :

```bash
unset CUDA_VISIBLE_DEVICES
# ou : CUDA_VISIBLE_DEVICES=0 python -c "import torch; print(torch.cuda.is_available())"
```

Sur un cluster, le scheduler peut fixer cette variable pour vous : vérifier le script de job.

### 4. Framework (PyTorch)

```bash
which python
python -c "import torch; print(torch.__version__); print(torch.version.cuda); print(torch.cuda.is_available()); print(torch.cuda.device_count())"
```

| Lecture | Interprétation |
| --- | --- |
| Version `+cpu` ou `torch.version.cuda is None` | Roue **CPU** → réinstaller avec index `cuXXX` (fiche installer PyTorch) |
| `cuda` = `12.x` mais `is_available()` False | Driver trop vieux, devices masqués, ou init CUDA en échec |
| `is_available()` True | Faire un petit calcul (voir ci-dessous) |

Petit test d'exécution :

```python
import torch

x = torch.randn(256, 256, device="cuda")
y = x @ x
torch.cuda.synchronize()
print("OK", y.device, torch.cuda.get_device_name(0))
```

Message typique `NVIDIA driver on your system is too old` : mettre à jour le driver, ou prendre une roue `cuXXX` plus ancienne, compatible avec le `CUDA Version` de `nvidia-smi`.

### 5. Conteneur Docker / Kubernetes

Sur l'hôte, `nvidia-smi` peut être OK alors que le conteneur ne voit rien.

1. NVIDIA Container Toolkit installé sur l'hôte.
2. Lancement avec accès GPU, ex. `docker run --gpus all …`.
3. Smoke test :

```bash
docker run --rm --gpus all nvidia/cuda:12.6.0-base-ubuntu22.04 nvidia-smi
```

Dans le conteneur : les nœuds `/dev/nvidia*` doivent exister. Le **driver reste celui de l'hôte** ; l'image n'en apporte pas un second. Même logique en Kubernetes : ressource `nvidia.com/gpu` + device plugin.

### 6. Cas particuliers (rapide)

| Contexte | Point critique |
| --- | --- |
| **WSL2** | Driver NVIDIA côté **Windows** ; ne pas installer un driver d'affichage Linux dans la distro |
| **VM** | GPU uniquement si le hyperviseur fait du **passthrough** |
| **Mauvais Python** | `which python` ≠ le venv où vous avez installé la roue CUDA |
| **OOM** | GPU vu : réduire batch / mémoire (fiche VRAM), pas réinstaller CUDA |

## Tableau récapitulatif

| Symptôme | Couche | Première action |
| --- | --- | --- |
| Pas de NVIDIA dans `lspci` | Matériel / cloud / VM | Changer d'instance ou activer le passthrough |
| `nvidia-smi` échoue | Driver | Installer / rebuild driver + reboot |
| `CUDA_VISIBLE_DEVICES` vide ou `-1` | Environnement | `unset` ou fixer un indice valide **avant** le lancement |
| `torch.version.cuda is None` | Application | Roue CUDA via le sélecteur PyTorch |
| `driver is too old` | Driver ↔ runtime | Driver plus récent ou `cuXXX` plus ancien |
| OK hors Docker, KO dedans | Conteneur | Toolkit + `--gpus` |
| `out of memory` | VRAM | Fiche VRAM — le GPU « marche » |

## Script de contrôle (copier-coller)

```bash
echo "=== PCI ==="
lspci | grep -i nvidia || echo "(aucune carte NVIDIA vue)"
echo "=== nvidia-smi ==="
nvidia-smi || echo "(driver / nvidia-smi KO)"
echo "=== env ==="
echo "CUDA_VISIBLE_DEVICES=[$CUDA_VISIBLE_DEVICES]"
echo "=== python ==="
python - <<'PY'
import torch
print("torch", torch.__version__)
print("cuda build", torch.version.cuda)
print("available", torch.cuda.is_available())
print("count", torch.cuda.device_count())
if torch.cuda.is_available():
    print("name", torch.cuda.get_device_name(0))
PY
```

S'arrêter à la **première** étape qui échoue : c'est en général la couche à réparer.

## À retenir

- Distinguer **GPU invisible**, **incompatibilité de versions**, **OOM** et **mauvais device**.
- Diagnostiquer **du bas vers le haut** : `lspci` → `nvidia-smi` → env → PyTorch → conteneur.
- `CUDA_VISIBLE_DEVICES` vide ou `-1` masque tout ; la définir **avant** le processus.
- `torch.version.cuda is None` = build CPU ; `driver too old` = driver / `cuXXX` à aligner.
- Docker : toolkit hôte + `--gpus` ; le driver reste celui de l'hôte.

## Sources

- [CUDA environment variables](https://docs.nvidia.com/cuda/cuda-programming-guide/05-appendices/environment-variables.html) — `CUDA_VISIBLE_DEVICES` vide = aucun device.
- [PyTorch CUDA environment variables](https://docs.pytorch.org/docs/main/cuda_environment_variables.html) — valeur `-1`.
- [PyTorch CUDA semantics](https://docs.pytorch.org/docs/stable/notes/cuda.html) — `is_available()`, devices.
- [nvidia-smi](https://docs.nvidia.com/deploy/nvidia-smi/) — surveillance driver / GPU.
- [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/index.html) — GPU dans Docker.
- Fiches DevFiches associées : pile GPU, installer PyTorch CUDA, VRAM, choix / isolation de GPU.
