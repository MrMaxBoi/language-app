export const CHOICE_QUESTION_TYPES = new Set([
  "multiple_choice",
  "meaning_match",
  "translation_choice",
]);

export const getOptionText = (option) => {
  if (typeof option === "string") return option;
  return option?.text || "";
};

export const inferQuestionType = (sourceQuestion = {}) => {
  const text = String(sourceQuestion.questionText || "").trim().toLowerCase();
  const existingType = sourceQuestion.questionType;

  if (existingType && existingType !== "multiple_choice") {
    return existingType;
  }

  if (
    text.startsWith("translate") ||
    text.startsWith("convert") ||
    text.includes("te-form of") ||
    text.includes("correct way to say")
  ) {
    return "fill_in_blank";
  }

  if (
    text.startsWith("what does") ||
    text.startsWith("what is the japanese word") ||
    text.startsWith("how do you say")
  ) {
    return "translation_choice";
  }

  return existingType || "multiple_choice";
};
