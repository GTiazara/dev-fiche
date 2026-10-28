<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ficheMatchesQuery, matchesFilters, type SearchableFiche } from '../lib/search';
import { withBase } from '../lib/paths';

type Result = SearchableFiche & {
  id: string;
  href: string;
  difficultyLabel: string;
  minutes: number;
};

const props = defineProps<{
  technologies: { slug: string; label: string }[];
}>();

const query = ref('');
const technology = ref('');
const difficulty = ref('');
const documents = ref<Result[]>([]);
const ready = ref(false);

const levels = [
  { slug: 'debutant', label: 'Débutant' },
  { slug: 'intermediaire', label: 'Intermédiaire' },
  { slug: 'avance', label: 'Avancé' },
];

/**
 * Résultats visibles : la requête et les deux filtres se cumulent.
 * Une requête sans mot correspondant donne une liste vide.
 */
const results = computed(() =>
  documents.value.filter(
    (fiche) =>
      ficheMatchesQuery(fiche, query.value) &&
      matchesFilters(fiche, technology.value, difficulty.value),
  ),
);

/**
 * Charge l'index produit au build et lit `q` dans l'adresse.
 * L'index ne contient que des fiches publiées.
 */
async function loadIndex(): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  query.value = params.get('q') ?? '';
  const response = await fetch(withBase('/search-index.json', import.meta.env.BASE_URL || '/'));
  documents.value = (await response.json()) as Result[];
  ready.value = true;
}

onMounted(() => {
  void loadIndex();
});
</script>

<template>
  <form class="filters" action="#" @submit.prevent>
    <label>
      Recherche
      <input v-model="query" type="search" name="q" />
    </label>
    <label>
      Technologie
      <select v-model="technology">
        <option value="">Toutes</option>
        <option v-for="item in props.technologies" :key="item.slug" :value="item.slug">
          {{ item.label }}
        </option>
      </select>
    </label>
    <label>
      Niveau
      <select v-model="difficulty">
        <option value="">Tous les niveaux</option>
        <option v-for="level in levels" :key="level.slug" :value="level.slug">
          {{ level.label }}
        </option>
      </select>
    </label>
  </form>
  <p v-if="ready && results.length === 0" class="empty">Aucune fiche ne correspond à cette recherche.</p>
  <ul v-else class="card-grid">
    <li v-for="fiche in results" :key="fiche.id" class="card">
      <h2><a :href="fiche.href">{{ fiche.title }}</a></h2>
      <p>{{ fiche.description }}</p>
      <p class="meta">
        {{ fiche.technologies.map((tech) => tech.label).join(', ') }} · {{ fiche.difficultyLabel }} · {{ fiche.minutes }} min
      </p>
    </li>
  </ul>
</template>
