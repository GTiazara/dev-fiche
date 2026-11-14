---
title: "Installer LineageOS sur un Redmi Note 9 Pro Global : guide et bilan"
description: "Exemple pour le Redmi Note 9 Pro Global (miatoll) : avantages, prérequis et étapes officielles d'installation de LineageOS, avec des repères prudents sur le stockage et la RAM."
technology: android
difficulty: intermediaire
tags: [android, xiaomi, redmi, lineageos, rom-alternative, bootloader]
publishedAt: 2026-11-10
updatedAt: 2026-11-10
draft: false
---

## Définition

**LineageOS** est un système Android alternatif maintenu par une communauté. L'installer à la place du système fourni par Xiaomi peut donner une nouvelle vie à un téléphone, mais cela ne garantit ni une meilleure autonomie ni la prise en charge de toutes ses fonctions.

« Redmi Note Pro » désigne plusieurs téléphones différents. La compatibilité et la procédure dépendent du modèle exact et de son nom de code : une image prévue pour un autre Redmi, même proche, peut rendre le téléphone inutilisable.

## Avantages et limites

| Aspect | Ce que LineageOS peut apporter | À vérifier avant de décider |
| --- | --- | --- |
| Mises à jour | Une version Android ou des correctifs peuvent rester disponibles après l'arrêt du suivi constructeur | Le suivi dépend de l'appareil et de ses mainteneurs ; il n'est pas garanti à vie |
| Applications | Possibilité de réduire certaines applications préinstallées par le constructeur | Les services Google ne sont pas inclus par défaut ; leur ajout est facultatif et doit correspondre à la version installée |
| Personnalisation | Davantage de contrôle sur le système et ses réglages | Le système alternatif demande parfois plus de configuration et de dépannage |
| Fonctions du téléphone | Le téléphone peut rester utile plus longtemps | Appareil photo, NFC, appels, empreinte ou applications bancaires peuvent fonctionner différemment ou ne pas fonctionner |
| Confidentialité | Possibilité de choisir les services installés | Installer LineageOS ne rend pas automatiquement le téléphone privé : les applications et services utilisés comptent aussi |

## Ordres de grandeur : stockage et RAM

La fiche officielle du [Redmi Note 9 Pro Global](https://wiki.lineageos.org/devices/miatoll/variant3/) indique des versions avec **4, 6 ou 8 Go de RAM** et **64 ou 128 Go de stockage**. Elle ne publie pas de mesure comparative de l'espace occupé ou de la RAM utilisée entre MIUI et LineageOS.

| Mesure | Repère prudent | Pourquoi le résultat varie |
| --- | --- | --- |
| Stockage récupéré | Penser en **quelques Go au mieux**, pas en dizaines de Go ; aucun gain précis n'est garanti | Version de MIUI, applications préinstallées, services Google ajoutés et mises à jour changent l'espace libre. Les partitions système ne sont pas toutes présentées comme de l'espace utilisateur |
| RAM au repos | Un gain de **quelques centaines de Mo** est possible, mais il peut être nul ; ce n'est pas une mesure publiée pour ce modèle | Applications installées, synchronisations et durée depuis le redémarrage modifient l'usage. Android utilise aussi la RAM libre pour mettre des données en cache : « utilisée » ne signifie pas automatiquement « gaspillée » |

Pour comparer correctement, relever l'espace libre après une installation propre et les mêmes applications, puis comparer la RAM au repos après un redémarrage et un délai identique. Un seul relevé ne permet pas de conclure à une meilleure autonomie ou à de meilleures performances.

## Mots-clés

| Terme | Signification |
| --- | --- |
| ROM | Image du système Android à installer sur l'appareil |
| Bootloader | Programme de démarrage qui vérifie et lance le système |
| Déverrouillage | Autorisation d'installer un autre système ; elle peut effacer les données et réduire certaines protections au démarrage |
| Nom de code | Identifiant précis utilisé dans les guides et téléchargements d'un appareil |
| Recovery | Environnement de démarrage utilisé pour installer ou réparer le système |

## Vérifier la compatibilité du Redmi

1. Relever le nom commercial complet et la variante régionale dans les paramètres, sur la boîte ou dans les informations de l'appareil.
2. Retrouver son nom de code exact. Ne pas le déduire d'un autre modèle de la gamme.
3. Chercher ce modèle dans la [liste officielle des appareils LineageOS](https://wiki.lineageos.org/devices/).
4. Si l'appareil est listé, lire son guide d'installation en entier et vérifier les versions Android, firmware et fichiers requis.

La liste officielle précise que les appareils absents ne sont pas pris en charge et que les images d'un modèle ne doivent pas être utilisées sur un autre. Une ROM non officielle trouvée sur un forum n'offre pas les mêmes garanties : vérifier son origine, son suivi et les retours propres à la variante avant d'envisager son installation.

## Préparer la migration

La procédure publiée par LineageOS varie selon l'appareil. Il n'existe donc pas de suite universelle de commandes pour tous les Redmi Note Pro.

1. Sauvegarder les photos, fichiers, conversations et données d'applications ailleurs que sur le téléphone. Le déverrouillage du bootloader efface souvent les données.
2. Vérifier que le modèle exact est pris en charge, puis suivre uniquement le guide correspondant à son nom de code.
3. Lire les prérequis, notamment la version de firmware et les fichiers à télécharger, avant de modifier le téléphone.
4. Installer le système en respectant l'ordre indiqué par le guide. Si des services Google sont souhaités, vérifier si le guide demande de les installer au même moment que LineageOS.
5. Ne pas reverrouiller le bootloader, sauf si le guide officiel de cet appareil le demande explicitement.
6. Après le premier démarrage, tester les fonctions importantes et vérifier comment les mises à jour seront distribuées pour cet appareil.

Un appareil dont le bootloader reste déverrouillé peut perdre une partie des protections de démarrage sécurisé. Certaines applications qui vérifient l'intégrité de l'appareil, notamment pour le paiement ou les services bancaires, peuvent aussi refuser de fonctionner. Le résultat varie selon l'application et la configuration ; aucune méthode de contournement n'est garantie.

## Exemple : Redmi Note 9 Pro Global (miatoll)

Cet exemple correspond uniquement au modèle **M2003J6B2G**, appelé Redmi Note 9 Pro Global dans le wiki. La page indique LineageOS 22.2 au moment de sa consultation. Les guides évoluent : relire la page officielle juste avant l'installation et suivre la version qui y est publiée.

### Avant de commencer

- Vérifier que le numéro de modèle est exactement `M2003J6B2G`. Ne pas appliquer ces étapes à un Redmi Note 9S, Note 9 Pro Max, POCO M2 Pro ou à une autre variante simplement parce qu'ils partagent le nom de code `miatoll`.
- Lire le [guide officiel complet](https://wiki.lineageos.org/devices/miatoll/install/variant3/) avant de commencer. Il demande `adb` et `fastboot` sur l'ordinateur et le débogage USB activé.
- Démarrer d'abord le système Xiaomi d'origine et tester les appels et SMS, ainsi que VoLTE/VoWiFi si utilisés. Retirer les comptes Google pour éviter le verrouillage de réactivation après réinitialisation.
- Le guide consulté demande le firmware `V14.0.3.0.SJZMIXM` basé sur Android 12. Vérifier la version réellement requise dans le guide à jour; ne pas continuer si le firmware ne correspond pas.
- Sauvegarder tout le contenu ailleurs. Le déverrouillage du bootloader et le formatage de l'installation effacent les données du téléphone.

### Déroulement résumé

1. Déverrouiller le bootloader avec l'outil Xiaomi Mi Unlock, en suivant le guide. Xiaomi peut imposer un délai d'attente, parfois jusqu'à 30 jours. Le téléphone est réinitialisé; réactiver ensuite le débogage USB.
2. Télécharger le fichier `recovery.img` et le paquet ZIP LineageOS depuis la [page de téléchargement miatoll](https://download.lineageos.org/devices/miatoll). N'utiliser que les fichiers destinés à ce modèle.
3. Démarrer le téléphone en mode Fastboot (éteint, maintenir Volume bas + Marche), puis vérifier la connexion depuis l'ordinateur :

	```sh
	fastboot devices
	```

4. Depuis le dossier contenant `recovery.img`, installer la recovery officielle puis y démarrer :

	```sh
	fastboot flash recovery recovery.img
	fastboot reboot recovery
	```

5. Dans Lineage Recovery, choisir **Factory Reset**, puis **Format data / factory reset**. Cette étape efface les fichiers de la mémoire interne. Revenir au menu principal, choisir **Apply update**, puis **Apply from ADB**.
6. Sur l'ordinateur, envoyer le ZIP LineageOS. Remplacer le chemin d'exemple par le nom et l'emplacement réels du fichier téléchargé :

	```sh
	adb -d sideload /chemin/vers/lineageos.zip
	```

7. Si des Google Apps sont souhaitées, le guide demande de les installer depuis la recovery **avant le premier démarrage** et avec l'architecture `arm64`. Cette étape est facultative; suivre le lien et les consignes de version présents dans le guide.
8. Redémarrer le système depuis la recovery et effectuer la configuration initiale. En cas d'erreur à une étape, arrêter là et consulter le dépannage officiel plutôt que d'enchaîner les commandes.

Ces commandes résument le guide et ne remplacent pas sa lecture intégrale. Une installation interrompue, un firmware incompatible ou un fichier destiné à une autre variante peut empêcher le démarrage du téléphone.

## À retenir

- LineageOS peut prolonger l'usage d'un téléphone et offrir plus de contrôle, si l'appareil bénéficie d'un suivi adapté.
- « Redmi Note Pro » ne suffit pas pour choisir une ROM : il faut identifier le modèle et le nom de code exacts.
- Sauvegarder les données et suivre le guide officiel dédié à l'appareil avant tout déverrouillage ou installation.
- Vérifier les compromis possibles sur les fonctions, les applications sensibles et la sécurité du démarrage.

## Sources officielles

- [Appareils pris en charge et guides d'installation LineageOS](https://wiki.lineageos.org/devices/)
- [Redmi Note 9 Pro Global (miatoll), variante M2003J6B2G](https://wiki.lineageos.org/devices/miatoll/variant3/)
- [Guide d'installation officiel LineageOS 22.2](https://wiki.lineageos.org/devices/miatoll/install/variant3/)
- [Téléchargements officiels miatoll](https://download.lineageos.org/devices/miatoll)
- [FAQ officielle LineageOS](https://wiki.lineageos.org/faq/)