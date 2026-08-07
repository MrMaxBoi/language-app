import { getQuestionSkill } from "../data/skillGraph.js";
import { CHOICE_QUESTION_TYPES, getOptionText } from "./questionType.js";

const HIRAGANA_RE = /^[\u3040-\u309fー]+$/;
const KATAKANA_RE = /^[\u30a0-\u30ffー]+$/;
const KANA_RE = /^[\u3040-\u30ffー]+$/;
const JAPANESE_RE = /[\u3040-\u30ff\u3400-\u9fff]/;
const LATIN_RE = /[a-zA-Z]/;
const PARTICLE_ANSWERS = new Set(["は", "が", "を", "に", "で", "の", "と", "へ", "も", "から", "まで", "より"]);

const normalizeAnswer = (answer) => String(answer || "").trim();

const uniqueAnswers = (answers) => [...new Set(answers.map(normalizeAnswer).filter(Boolean))];

export const classifyAnswerStyle = (answer) => {
  const text = normalizeAnswer(answer);
  if (!text) return "empty";

  if (PARTICLE_ANSWERS.has(text)) return "particle";
  if (JAPANESE_RE.test(text) && text.length >= 8) return "japanese_sentence";
  if (HIRAGANA_RE.test(text)) return "hiragana";
  if (KATAKANA_RE.test(text)) return "katakana";
  if (KANA_RE.test(text)) return "kana";
  if (JAPANESE_RE.test(text)) return "japanese_word";
  if (LATIN_RE.test(text) && text.split(/\s+/).length > 3) return "english_phrase";
  if (LATIN_RE.test(text)) return "english_word";
  return "other";
};

const isCompatibleStyle = (candidateStyle, correctStyle) => {
  if (candidateStyle === correctStyle) return true;
  if (correctStyle === "kana") return candidateStyle === "hiragana" || candidateStyle === "katakana";
  if (correctStyle === "hiragana") return candidateStyle === "hiragana";
  if (correctStyle === "katakana") return candidateStyle === "katakana";
  if (correctStyle === "japanese_word") return ["hiragana", "katakana", "kana", "japanese_word"].includes(candidateStyle);
  if (correctStyle === "english_word") return candidateStyle === "english_word";
  return false;
};

const getQuestionAnswerStyle = (question) => {
  const style = classifyAnswerStyle(question.correctAnswer);
  if (style === "japanese_sentence" && ["greetings", "conversation"].includes(question.topic)) {
    return "hiragana";
  }
  return style;
};

const getCandidatePriority = ({ question, candidate, correctSkillId, correctStyle }) => {
  const candidateSkillId = getQuestionSkill(candidate).skillId;
  const candidateStyle = getQuestionAnswerStyle(candidate);
  let priority = 0;

  if (candidateSkillId === correctSkillId) priority += 50;
  if (candidate.topic === question.topic) priority += 25;
  if (candidate.subtopic === question.subtopic) priority += 15;
  if (candidateStyle === correctStyle) priority += 10;

  return priority;
};

export const generateOptionDraft = (question, questions, targetCount = 4) => {
  const questionType = question.questionType || "multiple_choice";
  const existingOptions = (question.options || []).map(getOptionText).filter(Boolean);
  const correctAnswer = normalizeAnswer(question.correctAnswer);

  if (!CHOICE_QUESTION_TYPES.has(questionType) || !correctAnswer) {
    return {
      options: [],
      source: "not_choice_question",
      answerStyle: getQuestionAnswerStyle(question),
      warnings: [],
      recommendation: "manual_only",
    };
  }

  if (existingOptions.length >= targetCount) {
    return {
      options: existingOptions.slice(0, targetCount),
      source: "existing_options",
      answerStyle: getQuestionAnswerStyle(question),
      warnings: [],
      recommendation: "auto_ready",
    };
  }

  const correctStyle = getQuestionAnswerStyle(question);
  const correctSkillId = getQuestionSkill(question).skillId;
  const warnings = [];

  const candidates = questions
    .filter((candidate) => String(candidate.questionId || candidate._id) !== String(question.questionId || question._id))
    .map((candidate) => ({
      answer: normalizeAnswer(candidate.correctAnswer),
      style: getQuestionAnswerStyle(candidate),
      priority: getCandidatePriority({ question, candidate, correctSkillId, correctStyle }),
    }))
    .filter((candidate) => candidate.answer && candidate.answer.toLowerCase() !== correctAnswer.toLowerCase())
    .filter((candidate) => isCompatibleStyle(candidate.style, correctStyle))
    .sort((a, b) => b.priority - a.priority || a.answer.localeCompare(b.answer));

  const distractors = uniqueAnswers(candidates.map((candidate) => candidate.answer)).slice(0, targetCount - 1);
  const options = uniqueAnswers([correctAnswer, ...distractors]);
  const optionStyles = [...new Set(options.map((option) => getQuestionAnswerStyle({ ...question, correctAnswer: option })))];

  if (options.length < targetCount) warnings.push("too_few_options");
  if (optionStyles.length > 1) warnings.push("mixed_answer_styles");
  if (!distractors.length) warnings.push("no_safe_distractors");
  if (["japanese_sentence", "english_phrase", "other"].includes(correctStyle)) warnings.push("manual_style_review");
  if (questionType === "multiple_choice" && question.topic === "grammar") warnings.push("grammar_manual_review");
  if (questionType === "multiple_choice" && question.topic === "particles") warnings.push("particle_manual_review");

  let recommendation = "auto_ready";
  if (warnings.includes("too_few_options") || warnings.includes("no_safe_distractors")) {
    recommendation = "manual_only";
  } else if (warnings.length > 0) {
    recommendation = "needs_review";
  }

  return {
    options,
    source: "generated_draft",
    answerStyle: correctStyle,
    warnings,
    recommendation,
  };
};
