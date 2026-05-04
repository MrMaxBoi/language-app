import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			default: "guest",
		},
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
				},
			],
			overallAccuracy: {
				type: Number,
				default: 0,
			},
			totalQuestions: {
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