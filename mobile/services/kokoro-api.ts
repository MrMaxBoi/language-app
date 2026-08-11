import { Platform } from 'react-native';

import type { HomeRecommendation, LessonContent, RoadmapResponse, SessionStartResponse } from '@/types/learning';

const developmentBaseUrl = Platform.select({
  android: 'http://10.0.2.2:5050',
  ios: 'http://127.0.0.1:5050',
  default: 'http://localhost:5050',
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || developmentBaseUrl;

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: options?.signal || controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || `Kokoro request failed (${response.status})`);
    }
    return payload.data as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Could not reach Kokoro at ${API_BASE_URL}. Check the local network and try again.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

export const getRoadmap = (userId = 'guest', roadmapId?: string) => {
  const roadmapQuery = roadmapId ? `&roadmapId=${encodeURIComponent(roadmapId)}` : '';
  return request<RoadmapResponse>(`/api/roadmap?userId=${encodeURIComponent(userId)}${roadmapQuery}`);
};

export const getHomeRecommendation = (userId = 'guest', roadmapId?: string) => {
  const roadmapQuery = roadmapId ? `?roadmapId=${encodeURIComponent(roadmapId)}` : '';
  return request<HomeRecommendation>(`/api/recommendations/home/${encodeURIComponent(userId)}${roadmapQuery}`);
};

export const getLessonContent = (lessonId: string) =>
  request<LessonContent>(`/api/lessons/${encodeURIComponent(lessonId)}/content`);

export const startLearningSession = (payload: Record<string, unknown>) =>
  request<SessionStartResponse>('/api/sessions/start', {
    method: 'POST',
    body: JSON.stringify({ userId: 'guest', ...payload }),
  });

export const submitSessionAnswer = (sessionId: string, questionId: string, userAnswer: string) =>
  request<{ isCorrect: boolean; correctAnswer: string }>(`/api/sessions/${sessionId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ questionId, userAnswer }),
  });

export const completeLearningSession = (sessionId: string) =>
  request<Record<string, unknown>>(`/api/sessions/${sessionId}/complete`, { method: 'POST' });
