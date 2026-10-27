# Tasks

## 1. Mesure sur chaque page

- [x] 1.1 Ajouter dans l'en-tête de `src/layouts/Base.astro` le snippet Matomo fourni, laissé brut au build, avec `trackPageView`, `enableLinkTracking`, le site `6` et le collecteur `//matomo.gtiazara.fr/`, et vérifier que `npm run build` réussit
- [x] 1.2 Vérifier dans le HTML construit de l'accueil et de la page introuvable la présence de `matomo.js`, `matomo.php`, `setSiteId` avec `6`, `trackPageView` et `enableLinkTracking`
