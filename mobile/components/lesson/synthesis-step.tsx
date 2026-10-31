import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { palette, type } from '@/constants/kokoro-theme';
import type { LessonContentStep } from '@/types/learning';

type SynthesisStepData = Extract<LessonContentStep, { type: 'synthesis' }>;

/** Characters the learner just met fuse into a real word: あ + い → あい. */
export function SynthesisStep({
  step,
  illustration,
  speakingId,
  onPlayWord,
  onPlaySegment,
}: {
  step: SynthesisStepData;
  illustration?: number;
  speakingId: string | null;
  onPlayWord: () => void;
  onPlaySegment: (index: number, character: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const reveal = useSharedValue(reduceMotion ? 1 : 0);
  const wordPlaybackId = `${step.id}-word`;
  const isWordPlaying = speakingId === wordPlaybackId;

  useEffect(() => {
    if (reduceMotion) {
      reveal.value = 1;
      return;
    }
    reveal.value = 0;
    reveal.value = withDelay(350, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
  }, [reduceMotion, reveal, step.id]);

  const wordStyle = useAnimatedStyle(() => ({
    opacity: reveal.value,
    transform: [{ scale: 0.92 + (reveal.value * 0.08) }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.equation}>
        {step.segments.map((segment, index) => {
          const playbackId = `${step.id}-segment-${index}`;
          const isPlaying = speakingId === playbackId;
          return (
            <View key={`${segment.character}-${index}`} style={styles.equationPart}>
              {index > 0 ? <Text style={styles.operator}>+</Text> : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Hear ${segment.romanization}`}
                disabled={Boolean(speakingId)}
                onPress={() => onPlaySegment(index, segment.character)}
                style={({ pressed }) => [styles.segment, isPlaying && styles.activeSegment, pressed && styles.pressed]}>
                <Text style={[styles.segmentCharacter, isPlaying && styles.activeSegmentText]}>{segment.character}</Text>
                <Text style={[styles.segmentReading, isPlaying && styles.activeSegmentText]}>{segment.romanization}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      {illustration ? (
        <Image
          source={illustration}
          accessibilityLabel={step.illustrationAlt}
          contentFit="contain"
          transition={180}
          style={styles.illustration}
        />
      ) : null}

      <Animated.View style={[styles.wordBlock, wordStyle]}>
        <Text style={styles.word}>{step.japanese}</Text>
        <Text style={styles.meaning}>{step.meaning}</Text>
      </Animated.View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Hear ${step.japanese}`}
        disabled={Boolean(speakingId)}
        onPress={onPlayWord}
        style={({ pressed }) => [styles.listenButton, isWordPlaying && styles.activeListenButton, pressed && styles.pressed]}>
        {isWordPlaying
          ? <ActivityIndicator size="small" color={palette.white} />
          : <Ionicons name="volume-high" size={19} color={palette.accent} />}
        <Text style={[styles.listenText, isWordPlaying && styles.activeSegmentText]}>Hear {step.japanese}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  equation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  equationPart: { flexDirection: 'row', alignItems: 'center' },
  operator: { color: palette.muted, fontSize: 20, fontWeight: '700', marginHorizontal: 10 },
  segment: {
    minWidth: 58,
    minHeight: 58,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 999,
    backgroundColor: palette.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  activeSegment: { borderColor: palette.accent, backgroundColor: palette.accent },
  segmentCharacter: { color: palette.ink, fontFamily: type.display, fontSize: 24 },
  segmentReading: { color: palette.success, fontSize: 11, fontWeight: '800' },
  activeSegmentText: { color: palette.white },
  illustration: { width: '70%', maxWidth: 260, aspectRatio: 1.35, marginTop: 18 },
  wordBlock: { alignItems: 'center', marginTop: 12 },
  word: { color: palette.ink, fontFamily: type.display, fontSize: 72, lineHeight: 84 },
  meaning: { color: palette.accent, fontFamily: type.display, fontSize: 20, fontStyle: 'italic', textTransform: 'capitalize' },
  listenButton: {
    minHeight: 46,
    marginTop: 18,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.accent,
    backgroundColor: palette.accentSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeListenButton: { backgroundColor: palette.accent },
  listenText: { color: palette.accent, fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.82 },
});
