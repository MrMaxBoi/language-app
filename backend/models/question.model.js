import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  questionText: {
    type: String,
    required: true,
  },

  questionType: {
    type: String,
    default: "multiple_choice",
  },

  options: [
    {
      _id: false,
      text: String,
      isCorrect: Boolean,
    },
  ],

  correctAnswer: {
    type: String,
    required: true,
  },

  explanation: {
    type: String,
    default: "",
  },

  topic: {
    type: String,
    required: true,
  },

  subtopic: {
    type: String,
    required: true,
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

  lessonIds: [
    {
      type: String,
    },
  ],

  conceptIds: [
    {
      type: String,
    },
  ],

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "easy",
  },

  cognitiveType: {
    type: String,
    default: "recognition",
  },

  learningObjective: {
    type: String,
    default: "",
  },

  misconceptionCategory: [
    {
      type: String,
    },
  ],

  commonMistakes: [
    {
      type: String,
    },
  ],

  tags: [
    {
      type: String,
    },
  ],

  jlptLevel: {
    type: String,
    default: "N5",
  },

  masteryWeight: {
    type: Number,
    default: 1,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

QuestionSchema.index({ topic: 1, subtopic: 1 });
QuestionSchema.index({ difficulty: 1 });
QuestionSchema.index({ lessonIds: 1 });
QuestionSchema.index({ conceptIds: 1 });

const Question = mongoose.model("Question", QuestionSchema);

export default Question;
