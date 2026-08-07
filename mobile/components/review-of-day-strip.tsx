import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, type } from '@/constants/kokoro-theme';
import type { HomeRecommendation } from '@/types/learning';

type Props = {
  recommendation: HomeRecommendation;
  isStarting: boolean;
  onOpenReview: () => void;
  onContinueLesson: () => void;
};

export function ReviewOfDayStrip({ recommendation, isStarting, onOpenReview, onContinueLesson }: Props) {
  const review = recommendation.reviewOfDay;
  const completed = review.state === 'completed';
  const caughtUp = review.state === 'caught_up';
  const action = completed || caughtUp ? onContinueLesson : onOpenReview;
  const icon = completed ? 'checkmark-circle' : caughtUp ? 'sparkles-outline' : 'refresh-circle';
  const label = completed ? 'Review complete' : caughtUp ? 'All caught up' : 'Review of the day';
  const title = completed
    ? `You kept ${review.completion?.tasksCleared || 0} ${review.completion?.tasksCleared === 1 ? 'memory' : 'memories'} fresh`
    : caughtUp
      ? 'Nothing needs a refresh today'
      : 'Keep your Japanese fresh';
  const detail = completed || caughtUp
    ? `Next: ${recommendation.nextLesson?.title || 'Continue your Japanese path'}`
    : `${review.questionCount} questions · About ${review.estimatedMinutes} minutes`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${title}`}
      disabled={isStarting}
      onPress={action}
      style={({ pressed }) => [styles.strip, completed && styles.completedStrip, pressed && styles.pressed]}>
      <View style={[styles.iconWrap, completed && styles.completedIcon]}>
        <Ionicons name={icon} size={24} color={completed ? palette.success : palette.accent} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.label, completed && styles.completedLabel]}>{label.toUpperCase()}</Text>
        <Text numberOfLines={1} style={styles.title}>{title}</Text>
        <Text numberOfLines={1} style={styles.detail}>{isStarting ? 'Preparing your review...' : detail}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={palette.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  strip: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: '#DEC6BC',
    backgroundColor: palette.accentSoft,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  completedStrip: { borderColor: '#C8D8C9', backgroundColor: palette.successSoft },
  iconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' },
  completedIcon: { backgroundColor: '#F7FBF7' },
  copy: { flex: 1, minWidth: 0 },
  label: { color: palette.accent, fontFamily: type.body, fontSize: 10, fontWeight: '900' },
  completedLabel: { color: palette.success },
  title: { color: palette.ink, fontFamily: type.body, fontSize: 15, fontWeight: '800', marginTop: 3 },
  detail: { color: palette.muted, fontFamily: type.body, fontSize: 12, marginTop: 3 },
  pressed: { opacity: 0.82 },
});
