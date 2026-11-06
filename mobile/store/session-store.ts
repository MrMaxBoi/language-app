import { create } from 'zustand';

import {
  completeLearningSession,
  extendLearningSession,
  startLearningSession,
  submitSessionAnswer,
} from '@/services/kokoro-api';
import type { HubKana } from '@/store/kana-hub-progress';
import type { Question, SessionRoadmap } from '@/types/learning';

/**
 * The lesson's kana row, shared by the lesson, practice and result screens.
 * The lesson screen writes `met`; practice writes `inkEarned`/`inkAsked`; result only reads.
 * Kept in memory only: leaving and re-entering a lesson starts the row blank again.
 */
type KanaHubProgress = {
  lessonId: string;
  kana: HubKana[];
  met: Record<string, boolean>;
};

type AnswerFeedback = {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  correctAnswer: string;
  explanation?: string | null;
};

type SessionState = {
  sessionId: string | null;
  questions: Question[];
  currentIndex: number;
  roadmap: SessionRoadmap | null;
  answers: AnswerFeedback[];
  report: Record<string, unknown> | null;
  isStarting: boolean;
  startError: string | null;
  hub: KanaHubProgress | null;
  inkEarned: Record<string, number>;
  inkAsked: Record<string, boolean>;
  /** Start a blank row for a lesson. `metAll` reveals every kana (practice opened without teaching). */
  beginHub: (lessonId: string, kana: HubKana[], metAll?: boolean) => void;
  markMet: (keys: string[]) => void;
  /** Mark these concepts as asked and add `credit` ink to each (0 for a miss). */
  recordInk: (conceptIds: string[], credit: number) => void;
  startLesson: (lessonId: string) => Promise<boolean>;
  startDailyReview: () => Promise<boolean>;
  submitAnswer: (questionId: string, userAnswer: string) => Promise<AnswerFeedback>;
  nextQuestion: () => void;
  /**
   * Ask the server for up to `count` repair questions and add them to `questions`.
   * Resolves to the index of the first added question and how many were added (0 when
   * the server is at its cap or the request fails; the session then simply ends as planned).
   */
  extendSession: (count: number) => Promise<{ firstIndex: number; added: number }>;
  completeSession: () => Promise<boolean>;
  reset: () => void;
};

const initialSession = {
  sessionId: null,
  questions: [],
  currentIndex: 0,
  roadmap: null,
  answers: [],
  report: null,
  startError: null,
  hub: null,
  inkEarned: {},
  inkAsked: {},
};

export const useSessionStore = create<SessionState>((set, get) => {
  const start = async (payload: Record<string, unknown>) => {
    try {
      set({ isStarting: true, startError: null });
      const session = await startLearningSession(payload);
      set({
        sessionId: session.sessionId,
        questions: session.questions,
        currentIndex: 0,
        roadmap: session.roadmap,
        answers: [],
        report: null,
        isStarting: false,
        // Ink is earned per session; the revealed kana (hub.met) carry over from the lesson.
        inkEarned: {},
        inkAsked: {},
      });
      return true;
    } catch (error) {
      set({
        isStarting: false,
        startError: error instanceof Error ? error.message : 'Could not start this session.',
      });
      return false;
    }
  };

  return {
    ...initialSession,
    isStarting: false,
    beginHub: (lessonId, kana, metAll = false) => set({
      hub: {
        lessonId,
        kana,
        met: metAll ? Object.fromEntries(kana.map((item) => [item.key, true])) : {},
      },
    }),
    markMet: (keys) => set((state) => {
      if (!state.hub || keys.every((key) => state.hub?.met[key])) return state;
      const met = { ...state.hub.met };
      keys.forEach((key) => { met[key] = true; });
      return { hub: { ...state.hub, met } };
    }),
    recordInk: (conceptIds, credit) => set((state) => {
      const inkEarned = { ...state.inkEarned };
      const inkAsked = { ...state.inkAsked };
      for (const conceptId of new Set(conceptIds)) {
        inkAsked[conceptId] = true;
        inkEarned[conceptId] = (inkEarned[conceptId] || 0) + credit;
      }
      return { inkEarned, inkAsked };
    }),
    startLesson: (lessonId) => start({ lessonId }),
    startDailyReview: () => start({ mode: 'daily_review' }),
    submitAnswer: async (questionId, userAnswer) => {
      const sessionId = get().sessionId;
      if (!sessionId) throw new Error('No active session.');
      const result = await submitSessionAnswer(sessionId, questionId, userAnswer);
      const feedback = { questionId, userAnswer, ...result };
      set((state) => ({ answers: [...state.answers, feedback] }));
      return feedback;
    },
    nextQuestion: () => set((state) => ({ currentIndex: state.currentIndex + 1 })),
    extendSession: async (count) => {
      const sessionId = get().sessionId;
      const none = { firstIndex: get().questions.length, added: 0 };
      if (!sessionId) return none;
      try {
        const result = await extendLearningSession(sessionId, count);
        // The server only excludes questions already answered, so drop any that are
        // still waiting in this session's queue.
        const idOf = (question: Question) => String(question._id || question.questionId);
        const current = get().questions;
        const known = new Set(current.map(idOf));
        const fresh = (result.questions || []).filter((question) => !known.has(idOf(question)));
        if (!fresh.length || get().sessionId !== sessionId) return none;
        set({ questions: [...current, ...fresh] });
        return { firstIndex: current.length, added: fresh.length };
      } catch {
        return none;
      }
    },
    completeSession: async () => {
      const sessionId = get().sessionId;
      if (!sessionId) return false;
      try {
        const report = await completeLearningSession(sessionId);
        set({ report, sessionId: null });
        return true;
      } catch {
        return false;
      }
    },
    reset: () => set({ ...initialSession, isStarting: false }),
  };
});
