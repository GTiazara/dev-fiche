<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  goNext,
  goPrevious,
  selectAnswer,
  startQuiz,
  viewQuiz,
  type QuizQuestion,
} from '../lib/quiz';

const props = defineProps<{ questions: QuizQuestion[] }>();

// Nouvel état à chaque affichage. Recharger la page rappelle startQuiz et efface les réponses.
const session = ref(startQuiz());
const view = computed(() => viewQuiz(session.value, props.questions));
const current = computed(() => props.questions[view.value.index]);

/**
 * Retient le choix de la question affichée.
 * Un second clic ne remplace pas le premier.
 */
function choose(choiceIndex: number): void {
  session.value = selectAnswer(session.value, props.questions, choiceIndex);
}

/**
 * Affiche la question suivante tant qu'il en reste une.
 */
function next(): void {
  session.value = goNext(session.value, props.questions.length);
}

/**
 * Affiche la question précédente tant que la première n'est pas atteinte.
 */
function previous(): void {
  session.value = goPrevious(session.value);
}
</script>

<template>
  <p>Question {{ view.index + 1 }} sur {{ view.total }}</p>
  <fieldset>
    <legend>{{ current.question }}</legend>
    <label v-for="(choice, index) in current.choices" :key="choice" class="quiz-choice">
      <input
        type="radio"
        :name="'question-' + view.index"
        :value="index"
        :checked="view.selected === index"
        :disabled="view.revealed"
        @change="choose(index)"
      />
      {{ choice }}
    </label>
  </fieldset>
  <p v-if="view.revealed" role="status" :class="view.correct ? 'ok' : 'bad'">
    {{ view.correct ? 'Bonne réponse.' : "Ce n'est pas la bonne réponse." }}
    {{ view.explanation }}
  </p>
  <div class="button-row">
    <button type="button" :disabled="!view.canGoPrevious" @click="previous">Précédent</button>
    <button type="button" :disabled="!view.canGoNext" @click="next">Suivant</button>
  </div>
</template>
