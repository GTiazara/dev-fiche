
## Contexte de DevFiches

DevFiches est un site statique de fiches d'apprentissage et d'aide-mémoire sur le développement informatique. Il s'adresse aux débutants, aux étudiants et aux développeurs. Chaque fiche est une page pratique consacrée à une notion : la comprendre, puis retrouver la commande ou l'exemple. Ce n'est pas un article d'actualité.

Les fiches sont des fichiers Markdown avec frontmatter YAML dans `src/content/fiches/`. Les spécifications produit et technique du dépôt font foi pour le contenu, les champs et les contraintes de publication.

## Qualité de code après modification: 
Après chaque modification/chagement de code ou content, éxécute `npm run build` pour vérifier s'il n'y a pas bug

## Commenter le code

Documenter le code.

- Chaque fonction, méthode ou composant qui contient de la logique porte un commentaire juste au-dessus. Il dit à quoi elle sert, ce qu'elle reçoit, ce qu'elle renvoie, et l'effet de bord s'il y en a un.
- Chaque passage un peu délicat porte un commentaire à l'endroit du passage. Il explique le pourquoi : une règle facile à casser, un index, un cas limite, une différence entre le build et le navigateur.
- Les commentaires sont en français.
- Le commentaire complète le code. Il ne répète pas le nom de la fonction ni ce qu'une ligne évidente fait déjà.
- Le balisage d'une page, une feuille de style et un fichier de contenu n'ont pas besoin d'un commentaire par ligne.

```ts
/**
 * Nombre de mots d'un texte.
 * Reçoit ce texte. Renvoie 0 s'il est vide.
 */
export function wordCount(plainText: string): number {
  return plainText.trim().split(/\s+/).filter(Boolean).length;
}

// Les mois de l'objet Date sont numérotés à partir de 0.
// Ajouter 1 avant d'afficher un mois calendaire.
const displayedMonth = date.getMonth() + 1;
```

## Site statique

- Le site livré est un ensemble de fichiers produits au build. La lecture ne dépend pas d'un serveur applicatif.
- Le JavaScript exécuté dans le navigateur couvre l'interaction utile. Le reste de la page est du HTML.
- Le contenu éditorial vit dans des fichiers de contenu. Il n'est pas écrit en dur dans les composants.
- Un serveur, une base de données ou un compte lecteur n'entrent dans le projet que si sa spécification les demande.

## Spécifications

- Les spécifications du dépôt font foi pour le périmètre, les pages et les données.
- Une exigence décrit ce que le visiteur voit et les fichiers que le mainteneur dépose. Elle ne dépend d'aucun éditeur, IDE ou assistant.
- La langue de l'interface est celle écrite dans le projet.
- OpenSpec décrit les fonctionnalités : une page, un parcours, un champ qui change le comportement, une interaction. Une nouvelle fiche, un nouveau texte ou une technologie ajoutée à la liste du projet ne s'y reportent pas.
- Avant de modifier le code pour une fonctionnalité, une interaction ou un parcours, lancer `/openspec-propose` pour spécifier le changement, puis `/openspec-apply-change` pour l'appliquer. Une fiche, un texte ou une technologie ne passent pas par ces commandes.

## Règles de rédaction des fiches

- Écrire en français, avec un niveau adapté à la difficulté indiquée dans les métadonnées.
- Traiter une notion ou un objectif précis. Aller directement à l'essentiel et éviter les répétitions, les généralités et les sections qui n'apportent rien.
- Expliquer les termes nécessaires, puis montrer l'idée avec un exemple juste et pertinent lorsque cela aide à comprendre.
- Organiser le texte pour apprendre puis retrouver l'essentiel : définition, mots-clés et exemple de code selon le sujet. Chaque fiche doit comporter une section « À retenir » qui résume les points essentiels.
- Baliser chaque bloc de code avec son langage et ne pas présenter un exemple comme exécutable s'il est incomplet.
- Le quiz est facultatif. S'il est présent, respecter le schéma technique : 3 à 5 questions, une seule bonne réponse par question et une explication courte.
- Vérifier le frontmatter et lancer le build après toute modification d'une fiche; un contenu invalide fait échouer la publication.

## Typage

- Quand le langage vérifie les types, chaque paramètre et chaque valeur déstructurée porte un type explicite. Un `any` implicite est une erreur à corriger.
- Un fichier de route dont le nom finit par `.json.ts` ou `.txt.ts` peut être relu comme du JavaScript au build. Dans ce cas, écrire le type sur place, sans `import type`.

## Qualité de base

- HTML sémantique, navigation utilisable au clavier, un titre par page.
- Le site reste utilisable sur un petit écran (site mobile first - mobile ready)
- Le contraste du texte reste lisible.

