<script setup lang="ts">
import { onMounted } from 'vue';
import { textToCopy } from '../lib/copy-code';

/**
 * Ajoute un bouton « Copier » sur chaque exemple déjà rendu.
 * Le texte envoyé au presse-papiers est celui affiché dans le bloc.
 */
function attachCopyButtons(root: ParentNode): void {
  root.querySelectorAll('pre').forEach((block) => {
    if (block.querySelector('.copy-code')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-code';
    button.textContent = 'Copier';
    button.addEventListener('click', async () => {
      const displayed = block.querySelector('code')?.textContent ?? '';
      try {
        await navigator.clipboard.writeText(textToCopy(displayed));
        button.textContent = 'Copié';
      } catch {
        button.textContent = 'Copie impossible';
      }
    });
    block.append(button);
  });
}

onMounted(() => {
  const article = document.querySelector('article');
  if (article) attachCopyButtons(article);
});
</script>

<template>
  <span class="sr-only">La copie des exemples est disponible sur chaque bloc de code.</span>
</template>
