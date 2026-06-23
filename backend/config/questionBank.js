export const isLocalQuestionFallbackEnabled = () => {
  const configured = process.env.ALLOW_LOCAL_QUESTION_FALLBACK;

  if (configured !== undefined) {
    return ["1", "true", "yes", "on"].includes(String(configured).toLowerCase().trim());
  }

  return process.env.NODE_ENV !== "production";
};
