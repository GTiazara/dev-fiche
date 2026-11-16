# Tasks

## 1. Identifiant et doublons

- [x] 1.1 Écrire une fonction pure qui renvoie le nom d'un fichier sans dossier ni extension, la brancher sur le chargeur de la collection, et vérifier par `npm run build` qu'une fiche d'essai dans un sous-dossier est servie à l'adresse plate et à son quiz, puis supprimer cet essai
- [x] 1.2 Faire échouer le build quand deux chemins donnent le même identifiant, sans erreur au simple rechargement du même chemin, et vérifier que le message cite les deux chemins
- [x] 1.3 Ajouter des tests pour le calcul de l'identifiant (racine, un niveau, deux niveaux) et pour l'unicité des noms dans `src/content/fiches/`, puis lancer `npm test`

## 2. Rangement des fiches existantes

- [x] 2.1 Noter la liste des pages produites par `npm run build` avant tout déplacement
- [x] 2.2 Déplacer avec `git mv` les 49 fiches dans les dossiers du design, sans modifier leur contenu, puis purger `.astro`, `node_modules/.astro` et `dist`
- [x] 2.3 Lancer `npm run build` et vérifier que la liste des pages est identique à celle d'avant, que le brouillon n'a pas de page et que les tests passent

## 3. Documentation

- [x] 3.1 Mettre à jour `README.md` et `docs/TECHNICAL_SPEC.md` : dossier libre, nom de fichier unique, identifiant égal au nom du fichier, dossier sans effet sur la technologie ; vérifier avec `npm run build`
