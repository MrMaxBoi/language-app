import { create } from 'zustand';

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

	nextQuestion: () => set((state) => ({ currentIndex: state.currentIndex + 1 })),

	getCurrentQuestion: () => {
		const { questions, currentIndex } = get();
		return questions[currentIndex] || null;
	},

	completeSession: async () => {
		const { sessionId } = get();
		const res = await fetch(`/api/sessions/${sessionId}/complete`, {
			method: "POST",
		});
		const data = await res.json();
		console.log("completeSession response:", data);
		if (data.success) {
			set({ report: data.data });
			console.log("Stored report in Zustand:", data.data);
			return { success: true, data: data.data };
		} else {
			return { success: false, message: data.message };
		}
	},

	fetchReport: async () => {
		const { sessionId } = get();
		const res = await fetch(`/api/sessions/${sessionId}/report`);
		const data = await res.json();
		if (data.success) {
			return { success: true, data: data.data };
		} else {
			return { success: false, message: data.message };
		}
	},
}));