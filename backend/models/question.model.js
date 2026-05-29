import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
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

const Question = mongoose.model("Question", QuestionSchema);

export default Question;