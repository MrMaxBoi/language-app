import mongoose from "mongoose";

const AttemptSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true,
    index: true
  },

  questionId: {
    type: mongoose.Schema.Types.Mixed, // Allow ObjectId or String (for mock questions)
    required: true,
    index: true
  },

  userAnswer: String,
  correctAnswer: String,
  isCorrect: Boolean,

  topic: String,
  subtopic: String,
  
  difficulty: String,
  tags: [String],
  learningObjective: String,
  commonMistakes: [String],

  responseTime: Number, // future use

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Attempt", AttemptSchema);