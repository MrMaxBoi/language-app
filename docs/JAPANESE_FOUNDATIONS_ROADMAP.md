# Japanese Foundations Roadmap

## Purpose

`japanese-foundations` is the pre-N5 path for learners who cannot yet read
Japanese kana or recognize the language's basic rhythm. It sits before the
existing `n5-foundation` roadmap without replacing it.

The roadmap is curriculum-ready and its first three lessons are learner-ready.
Remaining lessons stay `coming_soon` until each has enough explicitly assigned
questions and validated teaching content.

## Structure

The roadmap contains 5 units and 23 lessons:

1. Hiragana Beginnings: vowels, K-row, S-row, T-row, and N-row
2. Complete Hiragana: H-row, M-row, Y-row, R-row, W-row, and N
3. Hiragana Sound Patterns: voiced sounds, contracted sounds, and small tsu
4. Katakana: core rows, sound patterns, and the long-vowel mark
5. Pronunciation Foundation: mora rhythm, long vowels, small tsu, and syllabic N

## Content Readiness

Every lesson defines `minimumQuestionCount: 5`. Runtime readiness requires both
validated teaching content and enough Atlas questions whose `lessonIds`
explicitly include that lesson.

- Ready lessons can participate in normal roadmap progression.
- Guided teaching interactions, including tracing, do not create Attempts or update learner state.
- Final practice continues through the existing adaptive Session pipeline.
- Underfilled lessons return `status: coming_soon`.
- Coming-soon lessons cannot start a session.
- Lesson sessions prefer explicit `lessonIds` over broad skill-only filtering.

This prevents a lesson such as Hiragana Vowels from selecting unrelated K-row
or N-row questions that share the coarse `kana.hiragana` skill.

## Current Data

- Planned concepts: 102
- Existing concept-tagged questions: 58
- Concepts currently exercised by questions: 26
- Content-ready lessons: 3 of 23
- Hiragana Vowels: 15 questions across all five vowel concepts
- Hiragana K-row: 16 questions across all five K-row concepts
- Hiragana S-row: 15 questions across all five S-row concepts

The original Foundation questions remain assigned to the original N5 foundation
lessons as well. New row questions are dual-mapped in the same way. Existing
stable question IDs and learner history are unchanged.

## Completed Learning Sequence

The Vowels, K-row, and S-row lessons now provide:

1. A 15-step deliberate Vowels pilot plus the stable eight-step K-row and S-row lessons.
2. Tap-to-hear Japanese pronunciation through the native device speech module.
3. Explicit practice coverage for all fifteen taught kana concepts.
4. Explicit lesson-scoped adaptive selection for the final five-question practice.
5. A mobile roadmap selector that exposes Foundations alongside N5.

The version 3 Vowels pilot adds reusable `character_focus`, `character_trace`,
and `word_context` content types. Each vowel receives a dedicated pronunciation
screen and ordered tracing screen. Learned pairs are then used in the quiet
contexts `あい`, `うえ`, and `あお` before the real five-question practice.
Tracing completion remains local teaching state and does not increase mastery.
K-row and S-row remain on the previous renderer until physical-phone feedback
confirms the richer pacing.

The next checkpoint is to tune tracing tolerance and pacing on a physical phone,
then complete K-row, confirm S-row unlocks, and validate the full three-lesson
sequence before migrating the new lesson templates.
