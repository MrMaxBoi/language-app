import { create } from 'zustand';

import {
  completeLearningSession,
  startLearningSession,
  submitSessionAnswer,
} from '@/services/kokoro-api';
import type { Question, SessionRoadmap } from '@/types/learning';

type AnswerFeedback = {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  correctAnswer: string;
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
  startLesson: (lessonId: string) => Promise<boolean>;
  startDailyReview: () => Promise<boolean>;
  submitAnswer: (questionId: string, userAnswer: string) => Promise<AnswerFeedback>;
  nextQuestion: () => void;
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
