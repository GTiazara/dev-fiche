<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps<{
  listId: string;
  emptyId: string;
  showTechnology: boolean;
  technologies: { slug: string; label: string }[];
}>();

const technology = ref('');
const difficulty = ref('');

const levels = [
  { slug: 'debutant', label: 'Débutant' },
  { slug: 'intermediaire', label: 'Intermédiaire' },
  { slug: 'avance', label: 'Avancé' },
];

/**
 * Cache les cartes qui ne correspondent pas aux filtres choisis.
 * Si aucune carte ne reste, le message de liste vide devient visible.
 */
function applyFilters(): void {
  const list = document.getElementById(props.listId);
  const empty = document.getElementById(props.emptyId);
  if (!list || !empty) return;
  let visible = 0;
  list.querySelectorAll<HTMLElement>('[data-technology]').forEach((item) => {
    const technologyOk = !technology.value || item.dataset.technology === technology.value;
    const levelOk = !difficulty.value || item.dataset.difficulty === difficulty.value;
    const show = technologyOk && levelOk;
    item.hidden = !show;
    if (show) visible += 1;
  });
  empty.hidden = visible !== 0;
}

onMounted(applyFilters);
</script>

<template>
  <form class="filters" @submit.prevent="applyFilters">
    <label v-if="showTechnology">
      Technologie
      <select v-model="technology" @change="applyFilters">
        <option value="">Toutes</option>
        <option v-for="item in technologies" :key="item.slug" :value="item.slug">
          {{ item.label }}
        </option>
      </select>
    </label>
    <label>
      Niveau
      <select v-model="difficulty" @change="applyFilters">
        <option value="">Tous les niveaux</option>
        <option v-for="level in levels" :key="level.slug" :value="level.slug">
          {{ level.label }}
        </option>
      </select>
    </label>
  </form>
</template>
