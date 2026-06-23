const normalizeText = (value) =>
  String(value || "unknown")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

const slug = (value) =>
  normalizeText(value)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "unknown";

const skillNode = ({
  id,
  name,
  domain,
  strand,
  jlptLevel = "N5",
  level = "foundation",
  description = "",
  aliases = [],
  prerequisites = [],
}) => ({
  id,
  name,
  domain,
  strand,
  jlptLevel,
  level,
  description,
  aliases,
  prerequisites,
});

export const SKILL_GRAPH = [
  skillNode({
    id: "kana.hiragana",
    name: "Hiragana recognition",
    domain: "kana",
    strand: "Foundation",
    description: "Recognize core hiragana characters and sounds.",
  }),
  skillNode({
    id: "kana.katakana",
    name: "Katakana recognition",
    domain: "kana",
    strand: "Foundation",
    description: "Recognize core katakana characters and sounds.",
    prerequisites: ["kana.hiragana"],
  }),
  skillNode({
    id: "pronunciation.basic",
    name: "Basic pronunciation",
    domain: "pronunciation",
    strand: "Foundation",
    description: "Connect kana, mora timing, and common sound patterns.",
    prerequisites: ["kana.hiragana"],
  }),
  skillNode({
    id: "grammar.basic_sentence_structure",
    name: "Basic sentence structure",
    domain: "grammar",
    strand: "Grammar",
    description: "Understand simple Japanese word order and predicate endings.",
    prerequisites: ["kana.hiragana"],
  }),
  skillNode({
    id: "vocab.basic_nouns",
    name: "Basic nouns",
    domain: "vocabulary",
    strand: "Vocabulary",
    description: "Recognize high-frequency everyday nouns.",
    prerequisites: ["kana.hiragana"],
    aliases: [
      ["vocabulary", "basic nouns"],
      ["vocabulary", "daily objects"],
      ["vocabulary", "objects"],
      ["vocabulary", "quantity"],
    ],
  }),
  skillNode({
    id: "vocab.people_school",
    name: "People and school vocabulary",
    domain: "vocabulary",
    strand: "Vocabulary",
    description: "Recognize common people, role, and school terms.",
    prerequisites: ["kana.hiragana"],
    aliases: [
      ["vocabulary", "people"],
      ["vocabulary", "school vocabulary"],
    ],
  }),
  skillNode({
    id: "vocab.animals",
    name: "Animal vocabulary",
    domain: "vocabulary",
    strand: "Vocabulary",
    description: "Recognize basic animal vocabulary.",
    prerequisites: ["kana.hiragana"],
    aliases: [["vocabulary", "animals"]],
  }),
  skillNode({
    id: "vocab.family",
    name: "Family vocabulary",
    domain: "vocabulary",
    strand: "Vocabulary",
    description: "Recognize common family terms.",
    prerequisites: ["kana.hiragana"],
  }),
  skillNode({
    id: "vocab.food_drinks",
    name: "Food and drinks",
    domain: "food",
    strand: "Vocabulary",
    description: "Recognize common food and drink terms.",
    prerequisites: ["kana.hiragana"],
    aliases: [
      ["food", "basic food vocabulary"],
      ["food", "food vocabulary"],
      ["food", "drinks"],
    ],
  }),
  skillNode({
    id: "vocab.transportation",
    name: "Transportation vocabulary",
    domain: "travel",
    strand: "Vocabulary",
    description: "Recognize travel and transportation terms.",
    prerequisites: ["kana.hiragana"],
    aliases: [
      ["travel", "transport"],
      ["travel", "transportation"],
      ["travel", "travel locations"],
      ["travel", "accommodation"],
    ],
  }),
  skillNode({
    id: "vocab.places",
    name: "Places vocabulary",
    domain: "travel",
    strand: "Vocabulary",
    description: "Recognize common place and location words.",
    prerequisites: ["kana.hiragana"],
  }),
  skillNode({
    id: "vocab.daily_activities",
    name: "Daily activities vocabulary",
    domain: "vocabulary",
    strand: "Vocabulary",
    description: "Recognize common daily activity words.",
    prerequisites: ["kana.hiragana"],
  }),
  skillNode({
    id: "greetings.daily",
    name: "Daily greetings",
    domain: "greetings",
    strand: "Conversation",
    description: "Use basic greetings and polite everyday expressions.",
    prerequisites: ["kana.hiragana"],
    aliases: [
      ["greetings", "daily greetings"],
      ["greetings", "basic responses"],
      ["greetings", "farewells"],
      ["greetings", "night expressions"],
      ["greetings", "polite expressions"],
    ],
  }),
  skillNode({
    id: "numbers.basic_counting",
    name: "Basic counting",
    domain: "numbers",
    strand: "Vocabulary",
    description: "Recognize and use basic Japanese numbers.",
    prerequisites: ["kana.hiragana"],
    aliases: [
      ["numbers", "basic counting"],
      ["numbers", "counting"],
      ["numbers", "compound numbers"],
    ],
  }),
  skillNode({
    id: "time.weekdays",
    name: "Weekdays and daily time",
    domain: "time/date",
    strand: "Vocabulary",
    description: "Recognize weekdays and common time expressions.",
    prerequisites: ["numbers.basic_counting"],
    aliases: [
      ["time/date", "days of the week"],
      ["time/date", "daily time expressions"],
    ],
  }),
  skillNode({
    id: "time.asking_time",
    name: "Asking time",
    domain: "time/date",
    strand: "Conversation",
    description: "Ask and answer simple time questions.",
    aliases: [["time/date", "asking time"]],
    prerequisites: ["numbers.basic_counting"],
  }),
  skillNode({
    id: "particles.topic_wa",
    name: "Topic particle wa",
    domain: "particles",
    strand: "Particles",
    description: "Use は to mark the topic of a sentence.",
    prerequisites: ["grammar.basic_sentence_structure"],
    aliases: [
      ["particles", "topic particle"],
      ["particles", "topic marking"],
    ],
  }),
  skillNode({
    id: "particles.subject_ga",
    name: "Subject particle ga and existence",
    domain: "particles",
    strand: "Particles",
    description: "Use が for subjects and simple existence patterns.",
    prerequisites: ["grammar.basic_sentence_structure"],
    aliases: [
      ["particles", "existence"],
      ["grammar", "existence"],
      ["grammar", "existence verbs"],
    ],
  }),
  skillNode({
    id: "particles.object_wo",
    name: "Object particle wo",
    domain: "particles",
    strand: "Particles",
    description: "Use を to mark direct objects.",
    prerequisites: ["grammar.basic_sentence_structure", "verbs.present_polite"],
    aliases: [
      ["particles", "object particle"],
      ["particles", "object marking"],
    ],
  }),
  skillNode({
    id: "particles.destination_ni",
    name: "Destination particle ni",
    domain: "particles",
    strand: "Particles",
    description: "Use に to mark destinations and movement targets.",
    prerequisites: ["grammar.basic_sentence_structure", "vocab.transportation"],
    aliases: [
      ["particles", "destination"],
      ["particles", "destination particle"],
      ["particles", "movement"],
      ["particles", "movement destination"],
    ],
  }),
  skillNode({
    id: "particles.location_de",
    name: "Location and means particles",
    domain: "particles",
    strand: "Particles",
    description: "Use で for action locations and means.",
    prerequisites: ["grammar.basic_sentence_structure"],
    aliases: [
      ["particles", "location of action"],
      ["particles", "means"],
      ["grammar", "location of action"],
    ],
  }),
  skillNode({
    id: "particles.noun_links",
    name: "Noun-linking particles",
    domain: "particles",
    strand: "Particles",
    description: "Use の and と to connect nouns and companions.",
    prerequisites: ["grammar.basic_sentence_structure"],
    aliases: [
      ["particles", "possession"],
      ["particles", "companion particle"],
      ["grammar", "noun connection"],
    ],
  }),
  skillNode({
    id: "particles.advanced",
    name: "Advanced particles",
    domain: "particles",
    strand: "Particles",
    level: "early-intermediate",
    description: "Recognize less frequent N5/N4 particle patterns.",
    prerequisites: ["particles.topic_wa", "particles.subject_ga", "particles.object_wo"],
    aliases: [["particles", "advanced particles"]],
  }),
  skillNode({
    id: "verbs.present_polite",
    name: "Present polite verbs",
    domain: "verbs",
    strand: "Verbs",
    description: "Use polite non-past verb forms.",
    prerequisites: ["grammar.basic_sentence_structure"],
    aliases: [
      ["verbs", "present tense verbs"],
      ["verbs", "daily routine"],
      ["verbs", "daily habits"],
      ["verbs", "future plan"],
      ["grammar", "future intention"],
      ["grammar", "intentions"],
    ],
  }),
  skillNode({
    id: "verbs.past_polite",
    name: "Past polite verbs",
    domain: "verbs",
    strand: "Verbs",
    description: "Convert common verbs into polite past tense.",
    aliases: [
      ["verbs", "past tense"],
      ["verbs", "past tense conjugation"],
      ["verbs", "past tense verbs"],
      ["verbs", "past interaction"],
      ["travel", "travel sentences"],
    ],
    prerequisites: ["verbs.present_polite"],
  }),
  skillNode({
    id: "verbs.negative_polite",
    name: "Negative polite verbs",
    domain: "verbs",
    strand: "Verbs",
    description: "Convert common verbs into polite negative forms.",
    aliases: [
      ["verbs", "negative verbs"],
      ["verbs", "negative polite form"],
      ["verbs", "past negative"],
    ],
    prerequisites: ["verbs.present_polite"],
  }),
  skillNode({
    id: "verbs.te_form",
    name: "Te-form and requests",
    domain: "verbs",
    strand: "Verbs",
    level: "core",
    description: "Use te-form in simple request and connection patterns.",
    aliases: [
      ["verbs", "te-form"],
      ["grammar", "requests"],
    ],
    prerequisites: ["verbs.present_polite"],
  }),
  skillNode({
    id: "verbs.advanced_forms",
    name: "Advanced verb forms",
    domain: "verbs",
    strand: "Verbs",
    level: "early-intermediate",
    description: "Recognize ability, causative, aspect, and related verb patterns.",
    aliases: [
      ["verbs", "ability"],
      ["verbs", "aspect"],
      ["verbs", "casual form"],
      ["verbs", "causative"],
      ["verbs", "causative passive"],
      ["grammar", "desire form"],
      ["grammar", "experience"],
      ["grammar", "advice expressions"],
      ["grammar", "keigo"],
    ],
    prerequisites: ["verbs.te_form", "verbs.negative_polite"],
  }),
  skillNode({
    id: "adjectives.core",
    name: "Core adjectives",
    domain: "adjectives",
    strand: "Adjectives",
    description: "Recognize and use common i-adjectives and descriptors.",
    prerequisites: ["grammar.basic_sentence_structure"],
    aliases: [
      ["adjectives", "i-adjectives"],
      ["adjectives", "descriptive adjectives"],
      ["adjectives", "descriptions"],
      ["adjectives", "characteristics"],
      ["adjectives", "feelings"],
      ["adjectives", "opinions"],
      ["adjectives", "abstract"],
      ["adjectives", "abstract adjectives"],
      ["adjectives", "shopping adjectives"],
    ],
  }),
  skillNode({
    id: "adjectives.weather",
    name: "Weather adjectives",
    domain: "adjectives",
    strand: "Adjectives",
    description: "Describe basic weather conditions.",
    prerequisites: ["adjectives.core"],
    aliases: [
      ["adjectives", "weather"],
      ["adjectives", "weather adjectives"],
    ],
  }),
  skillNode({
    id: "adjectives.na",
    name: "Na-adjectives",
    domain: "adjectives",
    strand: "Adjectives",
    description: "Recognize and use common na-adjective patterns.",
    prerequisites: ["grammar.basic_sentence_structure"],
  }),
  skillNode({
    id: "grammar.questions",
    name: "Questions with ka",
    domain: "grammar",
    strand: "Grammar",
    description: "Form and understand simple questions with か.",
    prerequisites: ["grammar.basic_sentence_structure"],
  }),
  skillNode({
    id: "grammar.likes_dislikes",
    name: "Likes and dislikes",
    domain: "grammar",
    strand: "Grammar",
    description: "Express likes, dislikes, and preferences.",
    prerequisites: ["particles.subject_ga", "adjectives.na"],
  }),
  skillNode({
    id: "grammar.wants_desires",
    name: "Wants and desires",
    domain: "grammar",
    strand: "Grammar",
    description: "Express wanting objects or wanting to do actions.",
    prerequisites: ["verbs.present_polite", "adjectives.core"],
  }),
  skillNode({
    id: "grammar.comparison_conditionals",
    name: "Comparison and conditionals",
    domain: "grammar",
    strand: "Grammar",
    level: "early-intermediate",
    description: "Compare items and understand simple conditional/concessive patterns.",
    prerequisites: ["adjectives.core", "grammar.basic_sentence_structure"],
    aliases: [
      ["grammar", "comparison"],
      ["grammar", "conditional"],
      ["grammar", "concessive"],
      ["grammar", "contrast expressions"],
    ],
  }),
  skillNode({
    id: "grammar.clauses_uncertainty",
    name: "Clauses and uncertainty",
    domain: "grammar",
    strand: "Grammar",
    level: "early-intermediate",
    description: "Recognize relative clauses, speculation, and uncertainty patterns.",
    prerequisites: ["grammar.basic_sentence_structure", "verbs.present_polite"],
    aliases: [
      ["grammar", "relative clauses"],
      ["grammar", "speculation"],
      ["grammar", "uncertainty"],
    ],
  }),
  skillNode({
    id: "reading.word_recognition",
    name: "Word recognition",
    domain: "reading",
    strand: "Reading",
    description: "Recognize familiar words in kana and simple kanji contexts.",
    prerequisites: ["kana.hiragana", "kana.katakana"],
  }),
  skillNode({
    id: "reading.sentence_reading",
    name: "Sentence reading",
    domain: "reading",
    strand: "Reading",
    description: "Read short N5 sentences for literal meaning.",
    prerequisites: ["reading.word_recognition", "grammar.basic_sentence_structure"],
  }),
  skillNode({
    id: "reading.context_understanding",
    name: "Context understanding",
    domain: "reading",
    strand: "Reading",
    description: "Use context to infer meaning across short connected sentences.",
    prerequisites: ["reading.sentence_reading"],
  }),
];

const skillById = new Map(SKILL_GRAPH.map((skill) => [skill.id, skill]));

const aliasToSkillId = new Map();
for (const skill of SKILL_GRAPH) {
  for (const [topic, subtopic] of skill.aliases) {
    aliasToSkillId.set(`${normalizeText(topic)}||${normalizeText(subtopic)}`, skill.id);
  }
}

export const getSkillById = (skillId) => skillById.get(skillId) || null;

export const getQuestionSkill = (question = {}) => {
  if (question.skillId && skillById.has(question.skillId)) {
    const skill = skillById.get(question.skillId);
    return {
      skillId: skill.id,
      skillName: skill.name,
      skillPath: [skill.strand, skill.domain, skill.name],
      prerequisiteSkillIds: skill.prerequisites,
      jlptLevel: skill.jlptLevel,
      skillLevel: skill.level,
      skillDescription: skill.description,
      isGeneratedSkill: false,
    };
  }

  const topic = normalizeText(question.topic);
  const subtopic = normalizeText(question.subtopic);
  const skillId = aliasToSkillId.get(`${topic}||${subtopic}`);
  const skill = skillId ? skillById.get(skillId) : null;

  if (skill) {
    return {
      skillId: skill.id,
      skillName: skill.name,
      skillPath: [skill.strand, skill.domain, skill.name],
      prerequisiteSkillIds: skill.prerequisites,
      jlptLevel: skill.jlptLevel,
      skillLevel: skill.level,
      skillDescription: skill.description,
      isGeneratedSkill: false,
    };
  }

  const generatedSkillId = `${slug(question.topic)}.${slug(question.subtopic)}`;
  return {
    skillId: generatedSkillId,
    skillName: String(question.subtopic || question.topic || "Unknown skill").trim(),
    skillPath: ["Unmapped", String(question.topic || "unknown").trim(), String(question.subtopic || "unknown").trim()],
    prerequisiteSkillIds: [],
    jlptLevel: question.jlptLevel || "N5",
    skillLevel: "unmapped",
    skillDescription: "",
    isGeneratedSkill: true,
  };
};

export const getLearningKey = (record = {}) => {
  if (record.skillId) return String(record.skillId).trim();
  return `${String(record.topic || "unknown").trim()}||${String(record.subtopic || "unknown").trim()}`;
};

export const buildSkillQuestionCoverage = (questions = []) => {
  const coverage = SKILL_GRAPH.reduce((lookup, skill) => {
    lookup[skill.id] = {
      ...skill,
      questionCount: 0,
      aliasesCovered: 0,
    };
    return lookup;
  }, {});

  let generatedFallbackCount = 0;
  const seenQuestions = new Set();
  for (const question of questions) {
    const questionKey = String(question._id || question.questionId || question.questionText || "");
    if (questionKey && seenQuestions.has(questionKey)) continue;
    if (questionKey) seenQuestions.add(questionKey);

    const skill = getQuestionSkill(question);
    if (skill.isGeneratedSkill) {
      generatedFallbackCount += 1;
      continue;
    }
    if (coverage[skill.skillId]) {
      coverage[skill.skillId].questionCount += 1;
    }
  }

  for (const skill of Object.values(coverage)) {
    skill.aliasesCovered = skill.aliases.length;
  }

  const mappedSkills = Object.values(coverage).filter((skill) => skill.questionCount > 0);
  const unmappedSkills = Object.values(coverage).filter((skill) => skill.questionCount === 0);
  const uniqueQuestionCount = seenQuestions.size || questions.length;

  return {
    totalSkills: SKILL_GRAPH.length,
    mappedSkills: mappedSkills.length,
    unmappedSkills: unmappedSkills.length,
    mappedQuestions: uniqueQuestionCount - generatedFallbackCount,
    generatedFallbackCount,
    bySkill: Object.values(coverage),
  };
};
