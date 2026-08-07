import mongoose from "mongoose";

const SkillStateSchema = new mongoose.Schema(
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
      default: "Japanese skill",
    },
    skillPath: [String],
    topic: {
      type: String,
      default: "Skill",
    },
    subtopic: {
      type: String,
      default: "unknown",
    },
    mastery: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    recentAccuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    correct: {
      type: Number,
      default: 0,
    },
    lastPracticedAt: Date,
    lastCorrectAt: Date,
    lastIncorrectAt: Date,
    status: {
      type: String,
      enum: ["new", "learning", "reviewing", "comfortable", "mastered"],
      default: "new",
      index: true,
    },
    sourceUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

SkillStateSchema.index({ userId: 1, skillId: 1 }, { unique: true });
SkillStateSchema.index({ userId: 1, status: 1 });

export default mongoose.model("SkillState", SkillStateSchema);
