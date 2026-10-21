# Règles pour les agents — sites web statiques

Ces règles valent pour tout projet de site web statique. Les choix propres à un dépôt (pages, contenu, framework, hébergement) sont dans ses spécifications, lorsqu'il en a.

## Commenter le code

Documenter le code dans le code.

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

## Qualité de base

- HTML sémantique, navigation utilisable au clavier, un titre par page.
- Le site reste utilisable sur un petit écran.
- Le contraste du texte reste lisible.
