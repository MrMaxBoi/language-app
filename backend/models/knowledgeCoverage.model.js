import mongoose from "mongoose";

const knowledgeCoverageSchema = new mongoose.Schema(
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
    exposureCount: {
      type: Number,
      default: 0,
    },
    mastery: {
      type: Number,
      default: 0,
    },
    lastSeenAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

knowledgeCoverageSchema.index({ userId: 1, topic: 1, subtopic: 1 }, { unique: true });

const KnowledgeCoverage = mongoose.model("KnowledgeCoverage", knowledgeCoverageSchema);

export default KnowledgeCoverage;
