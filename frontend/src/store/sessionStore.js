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

	startSession: async () => {
		const res = await fetch("/api/sessions/start", {
			method: "POST",
		});
		const data = await res.json();
		if (data.success) {
			set({ sessionId: data.data.sessionId, questions: data.data.questions, currentIndex: 0, answers: [], report: null });
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
		console.log("completeSession response:", data);
		if (data.success) {
			storeReportSessionId(sessionId);
			set({
				sessionId: null,
				questions: [],
				currentIndex: 0,
				answers: [],
				report: data.data,
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
