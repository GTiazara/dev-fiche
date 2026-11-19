# Tasks

## 1. Découvrabilité des pages publiées

- [x] 1.1 Ajouter la génération du plan de site uniquement lorsque `site` est défini, en excluant la page introuvable, et vérifier qu'un build sans `SITE_URL` réussit tandis qu'un build avec `SITE_URL` produit un plan qui cite une fiche publiée et pas le brouillon
- [x] 1.2 Publier `robots.txt` qui autorise l'exploration et, si `site` est défini, indique le plan, et vérifier le fichier construit dans les deux cas
- [x] 1.3 Ajouter l'adresse canonique et les balises de partage en français dans l'en-tête commun quand `site` est défini, demander `noindex` pour la page introuvable, et vérifier ces balises dans le HTML construit avec `SITE_URL`
