import mongoose from "mongoose";

const questionExposureSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    questionId: {
      type: String,
      required: true,
      index: true,
    },
    exposureCount: {
      type: Number,
      default: 0,
    },
    correctCount: {
      type: Number,
      default: 0,
    },
    incorrectCount: {
      type: Number,
      default: 0,
    },
    lastSeenAt: {
      type: Date,
    },
    firstSeenAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

questionExposureSchema.index({ userId: 1, questionId: 1 }, { unique: true });

const QuestionExposure = mongoose.model("QuestionExposure", questionExposureSchema);

export default QuestionExposure;
