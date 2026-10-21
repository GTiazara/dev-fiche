import { z } from 'astro/zod';
import { difficulties, technologySlugs } from '../data/technologies';

/**
 * Indique si l'index de la bonne réponse désigne un choix existant.
 * L'index est 0-based : 0 est le premier choix. Un index hors liste est refusé.
 */
export function answerIndexIsValid(answer: number, choiceCount: number): boolean {
  return Number.isInteger(answer) && answer >= 0 && answer < choiceCount;
}

const quizQuestionSchema = z
  .object({
    question: z.string().min(1),
    choices: z.array(z.string().min(1)).min(2),
    answer: z.number().int().nonnegative(),
    explanation: z.string().min(1),
  })
  .refine((question) => answerIndexIsValid(question.answer, question.choices.length), {
    message: 'answer doit être un index de choix, à partir de 0',
  });

/** Schéma d'une fiche. Un objet invalide fait échouer le build. */
export const ficheSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  technology: z.enum(technologySlugs),
  difficulty: z.enum(difficulties),
  tags: z.array(z.string()).default([]),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  draft: z.boolean().default(false),
  // Chemin d'un fichier du dossier public/, par exemple /images/fiches/variables.png.
  image: z.string().startsWith('/').optional(),
  imageAlt: z.string().default(''),
  quiz: z.array(quizQuestionSchema).min(3).max(5).optional(),
});

export type FicheData = z.infer<typeof ficheSchema>;
