import mongoose from "mongoose";

const MemorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    topic: {
      type: String,
      required: true,
      index: true,
    },

    subtopic: {
      type: String,
      required: true,
      index: true,
    },

    skillId: {
      type: String,
      index: true,
    },

    skillName: {
      type: String,
    },

    skillPath: [
      {
        type: String,
      },
    ],

    prerequisiteSkillIds: [
      {
        type: String,
      },
    ],

    jlptLevel: {
      type: String,
      default: "N5",
    },

    strength: {
      type: Number,
      default: 0.3,
      min: 0,
      max: 1,
    },

    reviewInterval: {
      type: Number,
      default: 1,
    },

    nextReviewDate: {
      type: Date,
      default: Date.now,
    },

    lastReviewed: {
      type: Date,
      default: Date.now,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    successfulReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
MemorySchema.index({ userId: 1, topic: 1, subtopic: 1 });
MemorySchema.index({ userId: 1, skillId: 1 });

export default mongoose.model("Memory", MemorySchema);
