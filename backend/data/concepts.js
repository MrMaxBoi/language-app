const concept = ({ id, name, skillId, description = "", ...metadata }) => ({
  id,
  name,
  skillId,
  description,
  ...metadata,
});

const CORE_KANA_ROWS = {
  vowels: [
    ["a", "あ", "ア"],
    ["i", "い", "イ"],
    ["u", "う", "ウ"],
    ["e", "え", "エ"],
    ["o", "お", "オ"],
  ],
  k: [
    ["ka", "か", "カ"], ["ki", "き", "キ"], ["ku", "く", "ク"],
    ["ke", "け", "ケ"], ["ko", "こ", "コ"],
  ],
  s: [
    ["sa", "さ", "サ"], ["shi", "し", "シ"], ["su", "す", "ス"],
    ["se", "せ", "セ"], ["so", "そ", "ソ"],
  ],
  t: [
    ["ta", "た", "タ"], ["chi", "ち", "チ"], ["tsu", "つ", "ツ"],
    ["te", "て", "テ"], ["to", "と", "ト"],
  ],
  n: [
    ["na", "な", "ナ"], ["ni", "に", "ニ"], ["nu", "ぬ", "ヌ"],
    ["ne", "ね", "ネ"], ["no", "の", "ノ"],
  ],
  h: [
    ["ha", "は", "ハ"], ["hi", "ひ", "ヒ"], ["fu", "ふ", "フ"],
    ["he", "へ", "ヘ"], ["ho", "ほ", "ホ"],
  ],
  m: [
    ["ma", "ま", "マ"], ["mi", "み", "ミ"], ["mu", "む", "ム"],
    ["me", "め", "メ"], ["mo", "も", "モ"],
  ],
  y: [["ya", "や", "ヤ"], ["yu", "ゆ", "ユ"], ["yo", "よ", "ヨ"]],
  r: [
    ["ra", "ら", "ラ"], ["ri", "り", "リ"], ["ru", "る", "ル"],
    ["re", "れ", "レ"], ["ro", "ろ", "ロ"],
  ],
  w_n: [["wa", "わ", "ワ"], ["wo", "を", "ヲ"], ["n", "ん", "ン"]],
};

const createKanaConcepts = ({ script, skillId, symbolIndex }) =>
  Object.entries(CORE_KANA_ROWS).flatMap(([row, entries]) =>
    entries.map(([reading, hiragana, katakana]) => {
      const symbol = symbolIndex === 1 ? hiragana : katakana;
      return concept({
        id: `kana.${script}.${reading}`,
        name: `${script === "hiragana" ? "Hiragana" : "Katakana"} ${reading}`,
        skillId,
        group: row,
        symbol,
        reading,
      });
    })
  );

const hiraganaConcepts = createKanaConcepts({
  script: "hiragana",
  skillId: "kana.hiragana",
  symbolIndex: 1,
});
const katakanaConcepts = createKanaConcepts({
  script: "katakana",
  skillId: "kana.katakana",
  symbolIndex: 2,
});

const patternConcepts = [
  concept({ id: "kana.hiragana.voiced_sounds", name: "Hiragana voiced sounds", skillId: "kana.hiragana", group: "patterns" }),
  concept({ id: "kana.hiragana.contracted_sounds", name: "Hiragana contracted sounds", skillId: "kana.hiragana", group: "patterns" }),
  concept({ id: "kana.hiragana.small_tsu", name: "Hiragana small tsu", skillId: "kana.hiragana", group: "patterns" }),
  concept({ id: "kana.katakana.voiced_sounds", name: "Katakana voiced sounds", skillId: "kana.katakana", group: "patterns" }),
  concept({ id: "kana.katakana.contracted_sounds", name: "Katakana contracted sounds", skillId: "kana.katakana", group: "patterns" }),
  concept({ id: "kana.katakana.long_vowel_mark", name: "Katakana long-vowel mark", skillId: "kana.katakana", group: "patterns" }),
];

const pronunciationConcepts = [
  concept({
    id: "pronunciation.mora_counting",
    name: "Mora counting",
    skillId: "pronunciation.basic",
    description: "Count Japanese rhythm units, including small kana and moraic sounds.",
  }),
  concept({
    id: "pronunciation.small_tsu",
    name: "Small tsu",
    skillId: "pronunciation.basic",
    description: "Recognize the consonant pause represented by small tsu.",
  }),
  concept({
    id: "pronunciation.long_vowels",
    name: "Long vowels",
    skillId: "pronunciation.basic",
    description: "Recognize vowel length as a meaningful sound feature.",
  }),
  concept({
    id: "pronunciation.syllabic_n",
    name: "Syllabic n",
    skillId: "pronunciation.basic",
    description: "Recognize the independent mora represented by n.",
  }),
];

export const CONCEPTS = [
  ...hiraganaConcepts,
  ...katakanaConcepts,
  ...patternConcepts,
  ...pronunciationConcepts,
];

export const FOUNDATION_CONCEPT_GROUPS = {
  hiragana: Object.fromEntries(
    Object.keys(CORE_KANA_ROWS).map((row) => [
      row,
      hiraganaConcepts.filter((item) => item.group === row).map((item) => item.id),
    ])
  ),
  katakana: Object.fromEntries(
    Object.keys(CORE_KANA_ROWS).map((row) => [
      row,
      katakanaConcepts.filter((item) => item.group === row).map((item) => item.id),
    ])
  ),
  patterns: {
    hiraganaVoiced: ["kana.hiragana.voiced_sounds"],
    hiraganaContracted: ["kana.hiragana.contracted_sounds"],
    hiraganaSmallTsu: ["kana.hiragana.small_tsu"],
    katakanaVoiced: ["kana.katakana.voiced_sounds"],
    katakanaContracted: ["kana.katakana.contracted_sounds"],
    katakanaLongVowel: ["kana.katakana.long_vowel_mark"],
  },
  pronunciation: {
    mora: ["pronunciation.mora_counting"],
    smallTsu: ["pronunciation.small_tsu"],
    longVowels: ["pronunciation.long_vowels"],
    syllabicN: ["pronunciation.syllabic_n"],
  },
};

const conceptsById = new Map(CONCEPTS.map((item) => [item.id, item]));

export const getConceptById = (conceptId) => conceptsById.get(conceptId) || null;
