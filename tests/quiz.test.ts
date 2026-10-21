import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  choiceIsCorrect,
  goNext,
  goPrevious,
  selectAnswer,
  startQuiz,
  viewQuiz,
  type QuizQuestion,
} from '../src/lib/quiz';

const questions: QuizQuestion[] = [
  { question: 'Un', choices: ['a', 'b'], answer: 1, explanation: 'b est juste' },
  { question: 'Deux', choices: ['c', 'd'], answer: 0, explanation: 'c est juste' },
  { question: 'Trois', choices: ['e', 'f'], answer: 0, explanation: 'e est juste' },
];

describe('quiz', () => {
  it('commence à la première question sans réponse', () => {
    const view = viewQuiz(startQuiz(), questions);
    expect(view.index).toBe(0);
    expect(view.total).toBe(3);
    expect(view.revealed).toBe(false);
    expect(view.correct).toBeNull();
    expect(view.canGoPrevious).toBe(false);
  });

  it('corrige tout de suite, avec l’explication', () => {
    const right = viewQuiz(selectAnswer(startQuiz(), questions, 1), questions);
    expect(right.correct).toBe(true);
    expect(right.explanation).toBe('b est juste');
    expect(choiceIsCorrect(questions[0], 1)).toBe(true);

    const wrong = viewQuiz(selectAnswer(startQuiz(), questions, 0), questions);
    expect(wrong.correct).toBe(false);
    expect(wrong.explanation).toBe('b est juste');
  });

  it('ignore un second choix', () => {
    const once = selectAnswer(startQuiz(), questions, 0);
    const twice = selectAnswer(once, questions, 1);
    expect(viewQuiz(twice, questions).selected).toBe(0);
  });

  it('avance, recule, et s’arrête aux bornes', () => {
    const started = startQuiz();
    expect(goPrevious(started)).toBe(started);
    const next = goNext(started, questions.length);
    expect(next.index).toBe(1);
    expect(goPrevious(next).index).toBe(0);
    const last = goNext(goNext(started, questions.length), questions.length);
    expect(last.index).toBe(2);
    expect(goNext(last, questions.length)).toBe(last);
    expect(viewQuiz(last, questions).canGoNext).toBe(false);
  });

  it('retrouve la première question sans réponse après un nouveau départ', () => {
    const answered = selectAnswer(goNext(startQuiz(), questions.length), questions, 0);
    const reloaded = startQuiz();
    expect(viewQuiz(reloaded, questions).index).toBe(0);
    expect(viewQuiz(reloaded, questions).revealed).toBe(false);
    expect(reloaded.selectedByIndex).toEqual({});
    expect(answered.selectedByIndex).not.toEqual(reloaded.selectedByIndex);
  });

  it('ne lit aucun stockage', () => {
    const source = readFileSync(new URL('../src/lib/quiz.ts', import.meta.url), 'utf8');
    const panel = readFileSync(new URL('../src/components/QuizPanel.vue', import.meta.url), 'utf8');
    expect(source.includes('localStorage')).toBe(false);
    expect(source.includes('sessionStorage')).toBe(false);
    expect(panel.includes('localStorage')).toBe(false);
    expect(panel.includes('sessionStorage')).toBe(false);
  });
});
