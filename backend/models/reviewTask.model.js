import mongoose from "mongoose";

const ReviewTaskSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      default: "guest",
      index: true,
    },
    skillId: {
      type: String,
      required: true,
      index: true,
    },
    skillName: {
      type: String,
      default: "Review topic",
    },
    skillPath: [String],
    type: {
      type: String,
      enum: ["mistake", "memory_due", "weak_skill"],
      required: true,
      index: true,
    },
    reason: {
      type: String,
      default: "Kokoro marked this for review.",
    },
    status: {
      type: String,
      enum: ["active", "completed", "dismissed"],
      default: "active",
      index: true,
    },
    priority: {
      type: Number,
      default: 1,
      index: true,
    },
    dueAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    completedAt: Date,
    source: {
      attemptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attempt",
      },
      sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
      },
      memoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Memory",
      },
    },
    clearCondition: {
      requiredCorrect: {
        type: Number,
        default: 2,
      },
      requiredAttempts: {
        type: Number,
        default: 2,
      },
    },
    progress: {
      correct: {
        type: Number,
        default: 0,
      },
      attempts: {
        type: Number,
        default: 0,
      },
    },
    lastPracticedAt: Date,
  },
  { timestamps: true }
);

ReviewTaskSchema.index({ userId: 1, status: 1, dueAt: 1 });
ReviewTaskSchema.index({ userId: 1, skillId: 1, type: 1, status: 1 });

export default mongoose.model("ReviewTask", ReviewTaskSchema);
