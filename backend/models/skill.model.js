import mongoose from "mongoose";

const SkillSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: "guest",
    index: true
  },

  topic: {
    type: String,
    required: true,
    index: true
  },

  subtopic: {
    type: String,
    required: true,
    index: true
  },

  skillId: {
    type: String,
    index: true
  },

  skillName: {
    type: String
  },

  skillPath: [
    {
      type: String
    }
  ],

  prerequisiteSkillIds: [
    {
      type: String
    }
  ],

  jlptLevel: {
    type: String,
    default: "N5"
  },

  mastery: {
    type: Number,
    default: 0 // 0 → 1 scale
  },

  attempts: {
    type: Number,
    default: 0
  },

  correct: {
    type: Number,
    default: 0
  },

  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

SkillSchema.index({ userId: 1, skillId: 1 });

export default mongoose.model("Skill", SkillSchema);
