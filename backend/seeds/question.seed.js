import mongoose from "mongoose";
import dotenv from "dotenv";

import Question from "../models/question.model.js";
import questions from "../data/questions.js";

dotenv.config();

const seedQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Question.deleteMany();

    await Question.insertMany(questions);

    console.log("Questions seeded successfully");

    process.exit();
  } catch (error) {
    console.log("Seed error:", error);
    process.exit(1);
  }
};

seedQuestions();