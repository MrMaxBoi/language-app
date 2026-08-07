export type LessonStatus = 'completed' | 'in_progress' | 'unlocked' | 'locked';

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
  status: LessonStatus;
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
  completionRule: { minimumAttempts: number; accuracyThreshold: number };
  units: RoadmapUnit[];
  nextLesson: RoadmapLesson | null;
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
