import type { KanaHubItem } from '@/components/lesson/kana-hub';
import type { LessonContent, Question } from '@/types/learning';

export type HubKana = { key: string; character: string };

export type LessonKana = HubKana & {
  /** The kana's first own teaching step (listen/focus). Reaching it is what "meets" the kana. */
  firstIndex: number;
  lastIndex: number;
};

/** Ink for a correct first answer, and for a correct answer on the end-of-session second look. */
export const FIRST_TRY_CREDIT = 1;
export const SECOND_LOOK_CREDIT = 0.5;

/**
 * The unit's kana in teaching order. The prologue's sound beats are deliberately not counted,
 * so the hub stays blank until each kana's own step.
 */
export function lessonKana(content: LessonContent | null | undefined): LessonKana[] {
  const byConcept = new Map<string, LessonKana>();
  const note = (key: string, character: string, index: number) => {
    const existing = byConcept.get(key);
    if (existing) existing.lastIndex = index;
    else byConcept.set(key, { key, character, firstIndex: index, lastIndex: index });
  };
  content?.steps.forEach((step, index) => {
    if (step.type === 'character_focus' || step.type === 'character_trace') note(step.conceptId, step.character, index);
    if (step.type === 'kana_group') step.items.forEach((kana) => note(kana.conceptId, kana.character, index));
  });
  return [...byConcept.values()];
}

/** How many first-attempt questions in this session touch each hub kana. This is the ink's denominator. */
export function plannedQuestionCounts(questions: Question[], kana: HubKana[]): Record<string, number> {
  const keys = new Set(kana.map((item) => item.key));
  const counts: Record<string, number> = {};
  for (const question of questions) {
    for (const conceptId of new Set(question.conceptIds || [])) {
      if (keys.has(conceptId)) counts[conceptId] = (counts[conceptId] || 0) + 1;
    }
  }
  return counts;
}

/**
 * Hub tiles for practice and results. Ink = credit earned / questions planned for that kana,
 * so it only ever rises during a session. A kana the session never asks about stays uninked
 * and is marked "not tested yet" rather than looking failed.
 */
export function practiceHubItems(
  kana: HubKana[],
  met: Record<string, boolean>,
  questions: Question[],
  earned: Record<string, number>,
  asked: Record<string, boolean>,
): KanaHubItem[] {
  const planned = plannedQuestionCounts(questions, kana);
  return kana.map((item) => {
    const total = planned[item.key] || 0;
    return {
      key: item.key,
      character: item.character,
      met: Boolean(met[item.key]),
      tested: Boolean(asked[item.key]),
      ink: total ? Math.min(1, (earned[item.key] || 0) / total) : 0,
    };
  });
}
