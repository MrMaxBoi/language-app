import { create } from 'zustand';

const LAST_REPORT_SESSION_ID_KEY = "kokoro:lastReportSessionId";

const getStoredReportSessionId = () => {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem(LAST_REPORT_SESSION_ID_KEY);
};

const storeReportSessionId = (sessionId) => {
	if (typeof window === "undefined" || !sessionId) return;
	window.localStorage.setItem(LAST_REPORT_SESSION_ID_KEY, sessionId);
};

export const useSessionStore = create((set, get) => ({
	sessionId: null,
	questions: [],
	currentIndex: 0,
	answers: [],
	report: null,
	activeRoadmap: null,
	reviewSessionMeta: null,

	startSession: async (sessionOptions = null) => {
		const body =
			typeof sessionOptions === "string"
				? { lessonId: sessionOptions }
				: sessionOptions && typeof sessionOptions === "object"
					? sessionOptions
					: {};
		const res = await fetch("/api/sessions/start", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});
		const data = await res.json();
		if (data.success) {
			set({
				sessionId: data.data.sessionId,
				questions: data.data.questions,
				currentIndex: 0,
				answers: [],
				report: null,
				activeRoadmap: data.data.roadmap || null,
			});
			return { success: true };
		} else {
			return { success: false, message: "Failed to start session" };
		}
	},

	submitAnswer: async (questionId, userAnswer) => {
		const { sessionId } = get();
		if (!sessionId) {
			return { success: false, message: "No active session" };
		}
		const res = await fetch(`/api/sessions/${sessionId}/answer`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ questionId, userAnswer }),
		});
		const data = await res.json();
		if (data.success) {
			set((state) => ({
				answers: [...state.answers, {
					questionId,
					userAnswer,
					isCorrect: data.data.isCorrect,
					correctAnswer: data.data.correctAnswer
				}]
			}));
			return { success: true, isCorrect: data.data.isCorrect, correctAnswer: data.data.correctAnswer };
		} else {
			return { success: false, message: data.message };
		}
	},

	startDailyReview: async (settings = {}) => {
		const res = await fetch("/api/sessions/start", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ mode: "daily_review", ...settings }),
		});
		const data = await res.json();
		if (!data.success) {
			return { success: false, message: data.message || "Failed to start today's review" };
		}

		const reviewSessionMeta = {
			taskIds: data.data.taskIds || [],
			skillIds: data.data.skillIds || [],
			questionCount: data.data.questionCount || data.data.questions?.length || 0,
			estimatedMinutes: data.data.estimatedMinutes || 0,
			summary: data.data.summary || {},
		};
		set({
			sessionId: data.data.sessionId,
			questions: data.data.questions || [],
			currentIndex: 0,
			answers: [],
			report: null,
			activeRoadmap: data.data.roadmap || { mode: "daily_review", ...reviewSessionMeta },
			reviewSessionMeta,
		});
		return { success: true, data: data.data };
	},

	fetchCorrectAnswer: async (questionId) => {
		const res = await fetch(`/api/sessions/questions/${questionId}/answer`);
		const data = await res.json();
		if (data.success) {
			return { success: true, correctAnswer: data.data.correctAnswer };
		}
		return { success: false, message: data.message || "Failed to fetch correct answer" };
	},

	nextQuestion: () => set((state) => ({ currentIndex: state.currentIndex + 1 })),

	getCurrentQuestion: () => {
		const { questions, currentIndex } = get();
		return questions[currentIndex] || null;
	},

	completeSession: async () => {
		const { sessionId } = get();
		console.log("🚀 Calling completeSession for sessionId:", sessionId);
		const res = await fetch(`/api/sessions/${sessionId}/complete`, {
			method: "POST",
		});
		const data = await res.json();
		// completeSession response shape:
		// { success, data: { score, skillSummary, weakSkills, strongSkills, nextFocus,
		//   suggestedPractice, answers, analysis, analytics, roadmap,
		//   reviewRefreshResults, reviewTaskResults, reviewCompletionSummary } }
		console.log("completeSession response:", data);
		if (data.success) {
			if (["review", "daily_review"].includes(data.data?.roadmap?.mode)) {
				console.log("🧹 Review refresh result:", data.data.reviewRefreshResults || []);
				try {
					const learnerStateRes = await fetch("/api/learner-state/guest");
					const learnerStateJson = await learnerStateRes.json();
					console.log("🧠 Review queue after session:", learnerStateJson.data?.reviewQueue || []);
				} catch (error) {
					console.log("Could not fetch learner state after review session:", error.message);
				}
			}
			storeReportSessionId(sessionId);
			set({
				sessionId: null,
				questions: [],
				currentIndex: 0,
				answers: [],
				report: data.data,
				activeRoadmap: null,
				reviewSessionMeta: null,
			});
			console.log("Stored report in Zustand:", data.data);
			return { success: true, data: data.data };
		} else {
			return { success: false, message: data.message };
		}
	},

	fetchReport: async () => {
		const sessionId = get().report?.sessionId || getStoredReportSessionId();
		if (!sessionId) {
			return { success: false, message: "No completed session found" };
		}
		const res = await fetch(`/api/sessions/${sessionId}/report`);
		const data = await res.json();
		if (data.success) {
			storeReportSessionId(sessionId);
			set({ report: data.data });
			return { success: true, data: data.data };
		} else {
			return { success: false, message: data.message };
		}
	},
}));
