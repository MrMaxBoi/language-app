/**
 * Dashboard Service
 * API client for learner intelligence dashboard
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5050/api";

/**
 * Fetch aggregated analytics for a user
 */
export const fetchAnalytics = async (userId = "guest") => {
	try {
		const response = await fetch(`${API_BASE}/analytics/${userId}`);
		if (!response.ok) throw new Error("Failed to fetch analytics");
		const json = await response.json();
		return json.data;
	} catch (error) {
		console.error("Error fetching analytics:", error);
		throw error;
	}
};

/**
 * Fetch memory health metrics for a user
 */
export const fetchMemoryHealth = async (userId = "guest") => {
	try {
		const response = await fetch(`${API_BASE}/memory/${userId}`);
		if (!response.ok) throw new Error("Failed to fetch memory health");
		const json = await response.json();
		return json.data;
	} catch (error) {
		console.error("Error fetching memory health:", error);
		throw error;
	}
};

/**
 * Fetch recommendation explanations
 */
export const fetchRecommendationInsights = async (userId = "guest") => {
	try {
		const response = await fetch(
			`${API_BASE}/recommendations/explain/${userId}`
		);
		if (!response.ok)
			throw new Error("Failed to fetch recommendation insights");
		const json = await response.json();
		return json.data;
	} catch (error) {
		console.error("Error fetching recommendation insights:", error);
		throw error;
	}
};

export const fetchEngineIntelligence = async (userId = "guest") => {
	try {
		const response = await fetch(
			`${API_BASE}/debug/engine-intelligence/${userId}`
		);
		if (!response.ok) throw new Error("Failed to fetch engine intelligence");
		const json = await response.json();
		return json.data;
	} catch (error) {
		console.error("Error fetching engine intelligence:", error);
		throw error;
	}
};

export const fetchRoadmap = async (userId = "guest", roadmapId = null) => {
	try {
		const roadmapQuery = roadmapId ? `&roadmapId=${encodeURIComponent(roadmapId)}` : "";
		const response = await fetch(`${API_BASE}/roadmap?userId=${encodeURIComponent(userId)}${roadmapQuery}`);
		if (!response.ok) throw new Error("Failed to fetch roadmap");
		const json = await response.json();
		return json.data;
	} catch (error) {
		console.error("Error fetching roadmap:", error);
		throw error;
	}
};

export const fetchLearnerState = async (userId = "guest") => {
	try {
		const response = await fetch(`${API_BASE}/learner-state/${encodeURIComponent(userId)}`);
		if (!response.ok) throw new Error("Failed to fetch learner state");
		const json = await response.json();
		return json.data;
	} catch (error) {
		console.error("Error fetching learner state:", error);
		throw error;
	}
};

export const fetchReviewTasks = async (userId = "guest") => {
	try {
		const response = await fetch(`${API_BASE}/review-tasks/${encodeURIComponent(userId)}`);
		if (!response.ok) throw new Error("Failed to fetch review tasks");
		const json = await response.json();
		return json.data;
	} catch (error) {
		console.error("Error fetching review tasks:", error);
		throw error;
	}
};

export const fetchHomeRecommendation = async (userId = "guest") => {
	try {
		const response = await fetch(`${API_BASE}/recommendations/home/${encodeURIComponent(userId)}`);
		if (!response.ok) throw new Error("Failed to fetch home recommendation");
		const json = await response.json();
		return json.data;
	} catch (error) {
		console.error("Error fetching home recommendation:", error);
		throw error;
	}
};
