export type LessonStatus = 'completed' | 'in_progress' | 'unlocked' | 'locked' | 'coming_soon';

export type LessonProgress = {
  attempts: number;
  correct: number;
  accuracy: number;
  completedSessions: number;
  lastCompletedAt: string | null;
};

export type RoadmapLesson = {
  id: string;
  title: string;
  description: string;
  primarySkillIds: string[];
  supportSkillIds: string[];
  skillIds: string[];
  conceptIds: string[];
  minimumQuestionCount: number;
  roadmapId: string;
  status: LessonStatus;
  content: {
    availableQuestionCount: number;
    minimumQuestionCount: number;
    hasTeachingContent: boolean;
    teachingContentReady: boolean;
    questionContentReady: boolean;
    ready: boolean;
  };
  progress: LessonProgress;
};

export type RoadmapUnit = {
  id: string;
  title: string;
  description: string;
  lessons: RoadmapLesson[];
};

export type RoadmapResponse = {
  userId: string;
  roadmapId: string;
  title: string;
  shortLabel: string;
  description: string;
  level: string;
  availableRoadmaps: {
    id: string;
    title: string;
    shortLabel: string;
    description: string;
    level: string;
    unitCount: number;
    lessonCount: number;
  }[];
  completionRule: { minimumAttempts: number; accuracyThreshold: number };
  units: RoadmapUnit[];
  nextLesson: RoadmapLesson | null;
  contentSummary: {
    readyLessons: number;
    plannedLessons: number;
    availableQuestions: number;
  };
};

export type ReviewOfDay = {
  state: 'ready' | 'completed' | 'caught_up';
  completedAt: string | null;
  completion: {
    tasksCleared?: number;
    tasksRemaining?: number;
    refreshedSkills?: string[];
  } | null;
  questionCount: number;
  estimatedMinutes: number;
  activeTaskCount: number;
  breakdown: {
    mistakeTasks: number;
    memoryDueTasks: number;
    weakSkillTasks: number;
  };
  topics: {
    id: string;
    title: string;
    skillIds: string[];
    taskCount: number;
    reasons: ('mistake' | 'memory_due' | 'weak_skill')[];
    skills: {
      skillId: string;
      title: string;
      taskCount: number;
      reasons: ('mistake' | 'memory_due' | 'weak_skill')[];
    }[];
    relativeWeight: number;
  }[];
};

export type HomeRecommendation = {
  primaryAction: {
    type: 'daily_review' | 'lesson';
    title: string;
    description: string;
    ctaLabel: string;
    payload: Record<string, unknown>;
  };
  nextLesson: (RoadmapLesson & { metadata?: string; payload?: { lessonId: string } }) | null;
  reviewOfDay: ReviewOfDay;
};

export type Question = {
  _id: string;
  questionId: string;
  questionText: string;
  questionType: string;
  options: (string | { text: string; isCorrect?: boolean })[];
  skillId?: string;
  skillName?: string;
  difficulty?: string;
};

export type SessionRoadmap = {
  mode: 'adaptive' | 'roadmap_lesson' | 'review' | 'daily_review';
  roadmapId?: string;
  lessonId?: string;
  lessonTitle?: string;
  unitTitle?: string;
  estimatedMinutes?: number;
};

export type SessionStartResponse = {
  sessionId: string;
  questions: Question[];
  roadmap: SessionRoadmap;
};

export type LessonKanaItem = {
  conceptId: string;
  character: string;
  romanization: string;
  pronunciationHint: string;
  example: { japanese: string; reading: string; meaning: string };
};

export type LessonContentStep =
  | {
      id: string;
      type: 'introduction';
      title: string;
      body: string;
      callout?: string;
    }
  | {
      id: string;
      type: 'character_focus';
      conceptId: string;
      title: string;
      character: string;
      romanization: string;
      soundCue: string;
      soundNote: string;
      audioText: string;
    }
  | {
      id: string;
      type: 'character_trace';
      conceptId: string;
      title: string;
      character: string;
      romanization: string;
      tracingKey: string;
    }
  | {
      id: string;
      type: 'word_example';
      conceptId: string;
      title: string;
      body: string;
      illustrationKey: string;
      illustrationAlt: string;
      japanese: string;
      meaning: string;
      audioText: string;
      note?: string;
      segments: {
        character: string;
        romanization: string;
        isTarget?: boolean;
      }[];
    }
  | {
      id: string;
      type: 'word_context';
      conceptIds: string[];
      illustrationKey: string;
      illustrationAlt: string;
      japanese: string;
      meaning: string;
      audioText: string;
      segments: {
        character: string;
        romanization: string;
      }[];
    }
  | {
      id: string;
      type: 'kana_group';
      title: string;
      body: string;
      items: LessonKanaItem[];
      callout?: string;
    }
  | {
      id: string;
      type: 'guided_choice';
      prompt: string;
      choices: { text: string; isCorrect: boolean }[];
      correctAnswer: string;
      explanation: string;
      hint: string;
    }
  | {
      id: string;
      type: 'recap';
      title: string;
      body?: string;
      items: { character: string; romanization: string }[];
    };

export type LessonContent = {
  lessonId: string;
  roadmapId: string;
  version: number;
  eyebrow: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  objectives: string[];
  primarySkillIds: string[];
  conceptIds: string[];
  steps: LessonContentStep[];
  practice: {
    questionCount: number;
    title: string;
    description: string;
    ctaLabel: string;
  };
};
