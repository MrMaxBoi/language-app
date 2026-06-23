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
knowledgeCoverageSchema.index({ userId: 1, skillId: 1 });

const KnowledgeCoverage = mongoose.model("KnowledgeCoverage", knowledgeCoverageSchema);

export default KnowledgeCoverage;
