import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, type } from '@/constants/kokoro-theme';
import type { LessonContentStep } from '@/types/learning';

type SceneStepData = Extract<LessonContentStep, { type: 'scene' }>;

/** A short story moment where the words the learner just built are used by characters. */
export function SceneStep({
  step,
  speakingId,
  onPlayLine,
}: {
  step: SceneStepData;
  speakingId: string | null;
  onPlayLine: (index: number, japanese: string) => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.setting}>{step.setting}</Text>
      <View style={styles.lines}>
        {step.lines.map((line, index) => {
          const isPlaying = speakingId === `${step.id}-line-${index}`;
          return (
            <Pressable
              key={`${line.speaker}-${index}`}
              accessibilityRole="button"
              accessibilityLabel={`${line.speaker} says ${line.japanese}, ${line.meaning}. Tap to hear it.`}
              disabled={Boolean(speakingId)}
              onPress={() => onPlayLine(index, line.japanese)}
              style={({ pressed }) => [styles.line, pressed && styles.pressed]}>
              <Text style={styles.speaker}>{line.speaker}</Text>
              <View style={styles.lineBody}>
                <Text style={styles.japanese}>{line.japanese}</Text>
                <Text style={styles.meaning}>{line.meaning}</Text>
              </View>
              {isPlaying
                ? <ActivityIndicator size="small" color={palette.accent} />
                : <Ionicons name="volume-medium-outline" size={18} color={palette.muted} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  setting: { color: palette.muted, fontFamily: type.display, fontSize: 18, lineHeight: 27, fontStyle: 'italic', textAlign: 'center' },
  lines: { gap: 14, marginTop: 26 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 },
  speaker: { width: 72, color: palette.accent, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  lineBody: { flex: 1, borderLeftWidth: 2, borderLeftColor: palette.line, paddingLeft: 12 },
  japanese: { color: palette.ink, fontFamily: type.display, fontSize: 28, lineHeight: 36 },
  meaning: { color: palette.muted, fontSize: 14, lineHeight: 20 },
  pressed: { opacity: 0.82 },
});
