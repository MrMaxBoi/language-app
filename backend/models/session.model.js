import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			default: "guest",
		},
		// ⚠️ DEPRECATED: Answers are now stored exclusively in Attempt collection
		// This field is kept for backward compatibility only - do NOT use for new code
		answers: [
			{
				questionId: {
					type: String,
					required: true,
				},
				userAnswer: {
					type: String,
					required: true,
				},
				correctAnswer: {
					type: String,
					required: true,
				},
				isCorrect: {
					type: Boolean,
					required: true,
				},
				topic: {
					type: String,
					required: true,
				},
				subtopic: {
					type: String,
					default: "unknown",
				},
				difficulty: {
					type: String,
					enum: ["easy", "medium", "hard"],
					default: "easy",
				},
				tags: [String],
				learningObjective: {
					type: String,
					default: "",
				},
				commonMistakes: [String],
			},
		],
		score: {
			correct: {
				type: Number,
				default: 0,
			},
			total: {
				type: Number,
				default: 0,
			},
			percentage: {
				type: Number,
				default: 0,
			},
		},
		analysis: {
			weakestTopics: [
				{
					topic: {
						type: String,
						required: true,
					},
					accuracy: {
						type: Number,
						required: true,
					},
					_id: false,
				},
			],
			strongestTopics: [
				{
					topic: {
						type: String,
						required: true,
					},
					accuracy: {
						type: Number,
						required: true,
					},
					_id: false,
				},
			],
			weakestSubtopics: [
				{
					subtopic: {
						type: String,
						required: true,
					},
					accuracy: {
						type: Number,
						required: true,
					},
					_id: false,
				},
			],
			difficultyBreakdown: {
				easy: {
					type: Number,
					default: 0,
				},
				medium: {
					type: Number,
					default: 0,
				},
				hard: {
					type: Number,
					default: 0,
				},
			},
			repeatedMistakes: [String],
			improvementAreas: [String],
			estimatedSkillLevel: {
				type: String,
				default: "beginner",
			},
			overallAccuracy: {
				type: Number,
				default: 0,
			},
			totalCorrect: {
				type: Number,
				default: 0,
			},
			totalIncorrect: {
				type: Number,
				default: 0,
			},
			aiFeedback: {
				type: String,
				default: "",
			},
		},
		analytics: {
			difficultyBreakdown: {
				easy: {
					correct: { type: Number, default: 0 },
					total: { type: Number, default: 0 },
					accuracy: { type: Number, default: 0 },
				},
				medium: {
					correct: { type: Number, default: 0 },
					total: { type: Number, default: 0 },
					accuracy: { type: Number, default: 0 },
				},
				hard: {
					correct: { type: Number, default: 0 },
					total: { type: Number, default: 0 },
					accuracy: { type: Number, default: 0 },
				},
			},
			weakTopics: [String],
			strongTopics: [String],
			memoryImpact: {
				strengthened: { type: Number, default: 0 },
				weakened: { type: Number, default: 0 },
			},
			recommendationEffectiveness: {
				type: Number,
				default: 0,
			},
			accuracyTrend: {
				type: Number,
				default: 0,
			},
		},

		completedAt: {
			type: Date,
		},
		status: {
			type: String,
			enum: ["in_progress", "completed"],
			default: "in_progress",
		},
	},
	{
		timestamps: true, // createdAt
	}
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;