import { FOUNDATION_CONCEPT_GROUPS as concepts } from "../concepts.js";
import { lessonNode } from "../roadmapBuilder.js";

const foundationLesson = (definition) =>
  lessonNode({
    minimumQuestionCount: 5,
    recommendedQuestionTypes: ["multiple_choice", "meaning_match"],
    requiresTeachingContent: true,
    ...definition,
  });

export const JAPANESE_FOUNDATIONS_ROADMAP = {
  id: "japanese-foundations",
  title: "Japanese Foundations",
  shortLabel: "FOUNDATIONS",
  description: "Learn the Japanese sound system and both kana scripts before beginning the N5 path.",
  level: "pre-n5",
  units: [
    {
      id: "foundations-unit-1-hiragana-beginnings",
      title: "Hiragana Beginnings",
      description: "Start with the most common sound rows in the native Japanese script.",
      lessons: [
        foundationLesson({ id: "foundations-hiragana-vowels", title: "Hiragana Vowels", description: "Learn あ, い, う, え, and お.", primarySkillIds: ["kana.hiragana"], conceptIds: concepts.hiragana.vowels }),
        foundationLesson({ id: "foundations-hiragana-k-row", title: "Hiragana K-row", description: "Learn か, き, く, け, and こ.", primarySkillIds: ["kana.hiragana"], conceptIds: concepts.hiragana.k }),
        foundationLesson({ id: "foundations-hiragana-s-row", title: "Hiragana S-row", description: "Learn さ, し, す, せ, and そ.", primarySkillIds: ["kana.hiragana"], conceptIds: concepts.hiragana.s }),
        foundationLesson({ id: "foundations-hiragana-t-row", title: "Hiragana T-row", description: "Learn た, ち, つ, て, and と.", primarySkillIds: ["kana.hiragana"], conceptIds: concepts.hiragana.t }),
        foundationLesson({ id: "foundations-hiragana-n-row", title: "Hiragana N-row", description: "Learn な, に, ぬ, ね, and の.", primarySkillIds: ["kana.hiragana"], conceptIds: concepts.hiragana.n }),
      ],
    },
    {
      id: "foundations-unit-2-complete-hiragana",
      title: "Complete Hiragana",
      description: "Finish the core 46 Hiragana symbols.",
      lessons: [
        foundationLesson({ id: "foundations-hiragana-h-row", title: "Hiragana H-row", description: "Learn は, ひ, ふ, へ, and ほ.", primarySkillIds: ["kana.hiragana"], conceptIds: concepts.hiragana.h }),
        foundationLesson({ id: "foundations-hiragana-m-row", title: "Hiragana M-row", description: "Learn ま, み, む, め, and も.", primarySkillIds: ["kana.hiragana"], conceptIds: concepts.hiragana.m }),
        foundationLesson({ id: "foundations-hiragana-y-row", title: "Hiragana Y-row", description: "Learn や, ゆ, and よ.", primarySkillIds: ["kana.hiragana"], conceptIds: concepts.hiragana.y }),
        foundationLesson({ id: "foundations-hiragana-r-row", title: "Hiragana R-row", description: "Learn ら, り, る, れ, and ろ.", primarySkillIds: ["kana.hiragana"], conceptIds: concepts.hiragana.r }),
        foundationLesson({ id: "foundations-hiragana-w-row-n", title: "Hiragana W-row and N", description: "Learn わ, を, and ん.", primarySkillIds: ["kana.hiragana"], conceptIds: concepts.hiragana.w_n }),
      ],
    },
    {
      id: "foundations-unit-3-hiragana-patterns",
      title: "Hiragana Sound Patterns",
      description: "Learn the marks and combinations that extend core Hiragana.",
      lessons: [
        foundationLesson({ id: "foundations-hiragana-voiced", title: "Voiced Hiragana", description: "Use dakuten and handakuten to form sounds such as が, ざ, ば, and ぱ.", primarySkillIds: ["kana.hiragana"], conceptIds: concepts.patterns.hiraganaVoiced }),
        foundationLesson({ id: "foundations-hiragana-contracted", title: "Contracted Hiragana", description: "Read combinations such as きゃ, しゅ, and ちょ.", primarySkillIds: ["kana.hiragana"], conceptIds: concepts.patterns.hiraganaContracted }),
        foundationLesson({ id: "foundations-hiragana-small-tsu", title: "Small Tsu", description: "Recognize the brief consonant pause written with small っ.", primarySkillIds: ["kana.hiragana"], conceptIds: concepts.patterns.hiraganaSmallTsu }),
      ],
    },
    {
      id: "foundations-unit-4-katakana",
      title: "Katakana",
      description: "Transfer familiar Japanese sounds into the script used for many borrowed words.",
      lessons: [
        foundationLesson({ id: "foundations-katakana-vowels-k", title: "Katakana Vowels and K-row", description: "Learn the first ten Katakana symbols.", primarySkillIds: ["kana.katakana"], conceptIds: [...concepts.katakana.vowels, ...concepts.katakana.k] }),
        foundationLesson({ id: "foundations-katakana-s-t", title: "Katakana S-row and T-row", description: "Continue with the S and T sound rows.", primarySkillIds: ["kana.katakana"], conceptIds: [...concepts.katakana.s, ...concepts.katakana.t] }),
        foundationLesson({ id: "foundations-katakana-n-h", title: "Katakana N-row and H-row", description: "Learn the N and H sound rows.", primarySkillIds: ["kana.katakana"], conceptIds: [...concepts.katakana.n, ...concepts.katakana.h] }),
        foundationLesson({ id: "foundations-katakana-m-y", title: "Katakana M-row and Y-row", description: "Learn the M and Y sound rows.", primarySkillIds: ["kana.katakana"], conceptIds: [...concepts.katakana.m, ...concepts.katakana.y] }),
        foundationLesson({ id: "foundations-katakana-r-w-n", title: "Katakana R-row, W-row, and N", description: "Complete the core Katakana set.", primarySkillIds: ["kana.katakana"], conceptIds: [...concepts.katakana.r, ...concepts.katakana.w_n] }),
        foundationLesson({ id: "foundations-katakana-patterns", title: "Katakana Sound Patterns", description: "Practice voiced sounds, contracted sounds, and the long-vowel mark.", primarySkillIds: ["kana.katakana"], conceptIds: [...concepts.patterns.katakanaVoiced, ...concepts.patterns.katakanaContracted, ...concepts.patterns.katakanaLongVowel] }),
      ],
    },
    {
      id: "foundations-unit-5-pronunciation",
      title: "Pronunciation Foundation",
      description: "Build the rhythm and sound awareness needed to read Japanese naturally.",
      lessons: [
        foundationLesson({ id: "foundations-pronunciation-mora", title: "Japanese Rhythm", description: "Count mora instead of relying on English-style syllables.", primarySkillIds: ["pronunciation.basic"], supportSkillIds: ["kana.hiragana"], conceptIds: concepts.pronunciation.mora }),
        foundationLesson({ id: "foundations-pronunciation-long-vowels", title: "Long Vowels", description: "Hear and read meaningful differences in vowel length.", primarySkillIds: ["pronunciation.basic"], supportSkillIds: ["kana.hiragana"], conceptIds: concepts.pronunciation.longVowels }),
        foundationLesson({ id: "foundations-pronunciation-small-tsu", title: "The Small Tsu Pause", description: "Practice the consonant pause represented by small っ.", primarySkillIds: ["pronunciation.basic"], supportSkillIds: ["kana.hiragana"], conceptIds: concepts.pronunciation.smallTsu }),
        foundationLesson({ id: "foundations-pronunciation-syllabic-n", title: "The Sound ん", description: "Treat ん as its own rhythm unit and recognize its changing sound.", primarySkillIds: ["pronunciation.basic"], supportSkillIds: ["kana.hiragana"], conceptIds: concepts.pronunciation.syllabicN }),
      ],
    },
  ],
};
