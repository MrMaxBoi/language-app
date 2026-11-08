import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { palette, type } from '@/constants/kokoro-theme';
import type { LessonContentStep } from '@/types/learning';

type MomentStepData = Extract<LessonContentStep, { type: 'moment' }>;
type MomentLine = MomentStepData['lines'][number];

// The reveal, in ms from the moment the card opens.
const START_MS = 400; // let the page's own fade-in finish first
const PHRASE_GAP_MS = 400;
const FADE_MS = 600;
const WORD_PAUSE_MS = 600; // the beat before the Japanese word
const WORD_RISE_MS = 700;
const BADGE_DELAY_MS = 250;
const ROMAJI_DELAY_MS = 900; // romaji arrives last, as confirmation
const LINE_GAP_MS = 300;
const GLOW_MS = 1800;

// Sized to fill the card: the moment is the whole page, not a caption.
const ENGLISH_SIZE = 25;
const ENGLISH_LINE = 37;
const KANA_SIZE = 54;
const KANA_LINE = 62;

type Timeline = { phraseStarts: number[][]; wordStart: number; end: number };

function buildTimeline(lines: MomentLine[]): Timeline {
  let at = START_MS;
  let wordStart = START_MS;
  const phraseStarts = lines.map((line) => {
    const starts = line.phrases.map(() => {
      const start = at;
      at += PHRASE_GAP_MS;
      return start;
    });
    if (line.word) {
      at += WORD_PAUSE_MS;
      wordStart = at;
      at += ROMAJI_DELAY_MS;
    }
    at += LINE_GAP_MS;
    return starts;
  });
  const end = Math.max(at, wordStart + ROMAJI_DELAY_MS + FADE_MS, wordStart + BADGE_DELAY_MS + GLOW_MS);
  return { phraseStarts, wordStart, end };
}

/** A small golden circle with a half-set sun: "a moment is happening". Not a reward. */
function MomentBadge({ opacity, glow }: { opacity: Animated.AnimatedInterpolation<number>; glow: Animated.AnimatedInterpolation<number> }) {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel="A moment" style={styles.badgeWrap}>
      <Animated.View style={[styles.badgeGlow, { opacity: glow }]} />
      <Animated.View style={[styles.badge, { opacity }]}>
        <Svg width={24} height={24} viewBox="0 0 16 16">
          <Path d="M3.5 10a4.5 4.5 0 0 1 9 0Z" fill={palette.surface} />
          <Path d="M2 10.5h12" stroke={palette.surface} strokeWidth={1.4} strokeLinecap="round" />
        </Svg>
      </Animated.View>
    </View>
  );
}

/**
 * One short English story with a single Japanese word woven in. Phrases fade in one after another,
 * the word lands large and in colour with its sound, the badge marks the moment, and the romaji
 * arrives last, small and grey. The sentence carries the meaning, so there is no English gloss.
 */
export function MomentStep({
  step,
  onPlayWord,
}: {
  step: MomentStepData;
  /** `auto` is true for the playback as the word lands, false when the learner taps it. */
  onPlayWord: (japanese: string, auto: boolean) => void;
}) {
  const reduceMotion = useReducedMotion();
  const timeline = useMemo(() => buildTimeline(step.lines), [step.lines]);
  const [clock] = useState(() => new Animated.Value(0));
  const wordColor = step.tone === 'indigo' ? palette.indigo : palette.accent;
  const word = step.lines.find((line) => line.word)?.word;

  useEffect(() => {
    clock.stopAnimation();
    clock.setValue(0);
    if (reduceMotion) {
      clock.setValue(timeline.end);
    } else {
      Animated.timing(clock, {
        toValue: timeline.end,
        duration: timeline.end,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    }
    if (!word) return () => clock.stopAnimation();
    const speak = setTimeout(() => onPlayWord(word.japanese, true), reduceMotion ? 300 : timeline.wordStart);
    return () => {
      clearTimeout(speak);
      clock.stopAnimation();
    };
    // Replays only when a different moment opens; onPlayWord is a fresh closure each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clock, reduceMotion, step.id, timeline]);

  const fadeFrom = (start: number) => clock.interpolate({
    inputRange: [start, start + FADE_MS],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const wordOpacity = fadeFrom(timeline.wordStart);
  const wordRise = clock.interpolate({
    inputRange: [timeline.wordStart, timeline.wordStart + WORD_RISE_MS],
    outputRange: [6, 0],
    extrapolate: 'clamp',
  });
  const romajiOpacity = fadeFrom(timeline.wordStart + ROMAJI_DELAY_MS);
  const badgeStart = timeline.wordStart + BADGE_DELAY_MS;
  const badgeOpacity = fadeFrom(badgeStart);
  const badgeGlow = reduceMotion
    ? clock.interpolate({ inputRange: [0, 1], outputRange: [0, 0] })
    : clock.interpolate({
      inputRange: [badgeStart, badgeStart + 500, badgeStart + GLOW_MS],
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });

  return (
    <View style={styles.container}>
      <MomentBadge opacity={badgeOpacity} glow={badgeGlow} />
      {step.lines.map((line, lineIndex) => {
        const spoken = [...line.phrases, line.word ? `${line.word.japanese}, read ${line.word.romanization}${line.word.tail || ''}` : '']
          .filter(Boolean)
          .join(' ');
        return (
          <View
            key={`${step.id}-line-${lineIndex}`}
            accessible
            accessibilityLabel={line.word ? `${spoken} Double tap to hear it.` : spoken}
            accessibilityActions={line.word ? [{ name: 'activate' }] : undefined}
            onAccessibilityAction={line.word ? () => onPlayWord(line.word!.japanese, false) : undefined}
            style={[styles.line, line.word && styles.lineWithWord]}>
            {line.phrases.flatMap((phrase, phraseIndex) => {
              const opacity = fadeFrom(timeline.phraseStarts[lineIndex][phraseIndex]);
              // Words, not whole phrases, so the line wraps like running text.
              return phrase.split(' ').filter(Boolean).map((piece, pieceIndex) => (
                <Animated.Text
                  key={`${phraseIndex}-${pieceIndex}`}
                  style={[styles.english, { opacity }]}>
                  {piece}
                </Animated.Text>
              ));
            })}
            {line.word ? (
              // Word and punctuation travel together, so "!" can never wrap away from うえ.
              <View style={styles.wordGroup}>
                <Pressable
                  importantForAccessibility="no"
                  hitSlop={8}
                  onPress={() => onPlayWord(line.word!.japanese, false)}
                  style={styles.wordBox}>
                  <Animated.Text
                    style={[
                      styles.japanese,
                      { color: wordColor, opacity: wordOpacity, transform: [{ translateY: wordRise }] },
                    ]}>
                    {line.word.japanese}
                  </Animated.Text>
                  {/* Hangs below the word without moving it off the line's centre. */}
                  <Animated.Text style={[styles.romaji, { opacity: romajiOpacity }]}>
                    {line.word.romanization}
                  </Animated.Text>
                </Pressable>
                {line.word.tail ? (
                  <Animated.Text style={[styles.english, styles.tail, { opacity: wordOpacity }]}>
                    {line.word.tail}
                  </Animated.Text>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingTop: 64, paddingBottom: 24, gap: 34 },
  line: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 7, rowGap: 4 },
  // Extra row room so the romaji under the word never meets the next row.
  lineWithWord: { rowGap: 26 },
  english: { color: palette.ink, fontFamily: type.display, fontSize: ENGLISH_SIZE, lineHeight: ENGLISH_LINE },
  wordGroup: { flexDirection: 'row', alignItems: 'center', marginLeft: 2 },
  // A fixed-height box, so the romaji can hang at a known distance below the kana.
  wordBox: { height: KANA_LINE, justifyContent: 'center' },
  japanese: { fontFamily: type.kana, fontSize: KANA_SIZE, lineHeight: KANA_LINE },
  romaji: {
    position: 'absolute',
    left: -16,
    right: -16,
    top: KANA_LINE - 4,
    color: palette.muted,
    fontSize: 14,
    lineHeight: 17,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  tail: { marginLeft: 2 },
  badgeWrap: { position: 'absolute', top: 0, right: 0, width: 54, height: 54, alignItems: 'center', justifyContent: 'center' },
  badgeGlow: { position: 'absolute', width: 54, height: 54, borderRadius: 27, backgroundColor: palette.goldSoft },
  badge: { width: 36, height: 36, borderRadius: 18, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center' },
});
