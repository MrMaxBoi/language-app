import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { HomeRecommendation, LessonContent, Question, RoadmapResponse, SessionStartResponse } from '@/types/learning';

const API_PORT = 5050;

// The backend runs on the same Mac as the Expo dev server, so reuse the host
// the app was loaded from. Expo Go reports it as hostUri ("192.168.x.x:8081"),
// which follows the Mac's current Wi-Fi address with no configuration.
const devServerHost = (): string => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.hostname;
  }
  // Different Expo versions expose the dev server address in different fields,
  // so try each: "192.168.x.x:8081" or "exp://192.168.x.x:8081/...".
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.linkingUri,
  ];
  for (const candidate of candidates) {
    const host = candidate?.replace(/^[a-z]+:\/\//i, '').split(/[:/]/)[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') return host;
  }
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
};

export const API_BASE_URL = `http://${devServerHost()}:${API_PORT}`;

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
    if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TypeError')) {
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
  request<{ isCorrect: boolean; correctAnswer: string; explanation?: string | null }>(`/api/sessions/${sessionId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ questionId, userAnswer }),
  });

/** Ask for up to `count` (1-3) repair questions. The server caps the session at 6, so `added` may be 0. */
export const extendLearningSession = (sessionId: string, count: number) =>
  request<{ questions: Question[]; added: number; plannedQuestionCount?: number; max: number }>(
    `/api/sessions/${sessionId}/extend`,
    { method: 'POST', body: JSON.stringify({ count }) },
  );

export const completeLearningSession = (sessionId: string) =>
  request<Record<string, unknown>>(`/api/sessions/${sessionId}/complete`, { method: 'POST' });
