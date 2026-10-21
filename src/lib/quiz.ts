export type QuizQuestion = {
  question: string;
  choices: string[];
  /** Index 0-based du bon choix. 0 est le premier choix, pas le deuxième. */
  answer: number;
  explanation: string;
};

export type QuizSession = {
  index: number;
  selectedByIndex: Record<number, number>;
};

export type QuizView = {
  index: number;
  total: number;
  selected: number | null;
  revealed: boolean;
  correct: boolean | null;
  explanation: string | null;
  canGoPrevious: boolean;
  canGoNext: boolean;
};

/**
 * Session neuve, première question, aucune réponse.
 * À appeler à chaque chargement de page : rien n'est relu depuis un stockage.
 */
export function startQuiz(): QuizSession {
  return { index: 0, selectedByIndex: {} };
}

/**
 * Indique si le choix retenu est le bon.
 * Compare à `answer`, un index 0-based. Le décaler d'un cran inverserait le résultat.
 */
export function choiceIsCorrect(question: QuizQuestion, choiceIndex: number): boolean {
  return choiceIndex === question.answer;
}

/**
 * Vue affichable d'une session.
 * Reçoit la session et les questions. N'écrit rien et ne calcule pas de score global.
 */
export function viewQuiz(session: QuizSession, questions: QuizQuestion[]): QuizView {
  const question = questions[session.index];
  const selected = session.selectedByIndex[session.index];
  const revealed = selected !== undefined;
  return {
    index: session.index,
    total: questions.length,
    selected: revealed ? selected : null,
    revealed,
    correct: revealed ? choiceIsCorrect(question, selected) : null,
    explanation: revealed ? question.explanation : null,
    canGoPrevious: session.index > 0,
    canGoNext: session.index < questions.length - 1,
  };
}

/**
 * Retient un seul choix pour la question courante.
 * Un second choix est ignoré. La session renvoyée reste en mémoire, sans stockage.
 */
export function selectAnswer(
  session: QuizSession,
  questions: QuizQuestion[],
  choiceIndex: number,
): QuizSession {
  if (session.selectedByIndex[session.index] !== undefined) return session;
  if (choiceIndex < 0 || choiceIndex >= questions[session.index].choices.length) return session;
  return {
    index: session.index,
    selectedByIndex: { ...session.selectedByIndex, [session.index]: choiceIndex },
  };
}

/**
 * Passe à la question suivante.
 * Sur la dernière question, la session ne change pas.
 */
export function goNext(session: QuizSession, total: number): QuizSession {
  if (session.index >= total - 1) return session;
  return { ...session, index: session.index + 1 };
}

/**
 * Revient à la question précédente.
 * Sur la première question, la session ne change pas.
 */
export function goPrevious(session: QuizSession): QuizSession {
  if (session.index <= 0) return session;
  return { ...session, index: session.index - 1 };
}
