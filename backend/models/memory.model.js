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

export default mongoose.model("Memory", MemorySchema);
