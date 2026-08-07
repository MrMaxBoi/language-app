import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, shadow, type } from '@/constants/kokoro-theme';
import type { RoadmapLesson } from '@/types/learning';

type Props = {
  lesson: RoadmapLesson;
  index: number;
  isCurrent: boolean;
  isLast: boolean;
  onPress: (lesson: RoadmapLesson) => void;
};

const getNodeStyle = (lesson: RoadmapLesson, isCurrent: boolean) => {
  if (lesson.status === 'completed') return { background: palette.success, foreground: palette.white, icon: 'checkmark' as const };
  if (isCurrent || lesson.status === 'in_progress') return { background: palette.accent, foreground: palette.white, icon: 'book' as const };
  if (lesson.status === 'unlocked') return { background: palette.gold, foreground: palette.white, icon: 'play' as const };
  return { background: '#DED8CF', foreground: palette.muted, icon: 'lock-closed' as const };
};

export function RoadmapNode({ lesson, index, isCurrent, isLast, onPress }: Props) {
  const node = getNodeStyle(lesson, isCurrent);
  const labelOnLeft = index % 2 === 0;
  const progressText = lesson.status === 'completed'
    ? 'Completed'
    : isCurrent
      ? 'Next lesson'
      : lesson.status === 'in_progress'
        ? `${lesson.progress.accuracy}% so far`
        : lesson.status === 'locked'
          ? 'Locked'
          : 'Ready';

  const label = (
    <View style={[styles.label, labelOnLeft ? styles.labelLeft : styles.labelRight]}>
      <Text numberOfLines={2} style={[styles.lessonTitle, lesson.status === 'locked' && styles.lockedText]}>{lesson.title}</Text>
      <Text style={[styles.lessonStatus, isCurrent && styles.currentStatus]}>{progressText}</Text>
    </View>
  );

  return (
    <View style={styles.row}>
      {!isLast ? <View style={styles.connector} /> : null}
      {labelOnLeft ? label : <View style={styles.labelSpacer} />}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${lesson.title}, ${progressText}`}
        onPress={() => onPress(lesson)}
        style={({ pressed }) => [
          styles.nodeTouch,
          isCurrent && styles.currentHalo,
          pressed && styles.pressed,
        ]}>
        <View style={[styles.node, { backgroundColor: node.background }, isCurrent && shadow]}>
          <Ionicons name={node.icon} size={isCurrent ? 28 : 24} color={node.foreground} />
        </View>
        {isCurrent ? <View style={styles.currentDot} /> : null}
      </Pressable>
      {!labelOnLeft ? label : <View style={styles.labelSpacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { height: 126, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  connector: { position: 'absolute', width: 2, height: 58, top: 98, left: '50%', marginLeft: -1, backgroundColor: palette.line },
  nodeTouch: { width: 86, height: 86, borderRadius: 43, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  currentHalo: { borderWidth: 2, borderColor: '#E4B3A7', backgroundColor: '#F8E9E3' },
  node: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 5, borderColor: palette.surface },
  currentDot: { position: 'absolute', bottom: 2, width: 7, height: 7, borderRadius: 4, backgroundColor: palette.accent },
  label: { width: 116, paddingHorizontal: 6 },
  labelLeft: { alignItems: 'flex-end' },
  labelRight: { alignItems: 'flex-start' },
  labelSpacer: { width: 116 },
  lessonTitle: { color: palette.ink, fontFamily: type.body, fontSize: 14, lineHeight: 18, fontWeight: '800' },
  lessonStatus: { color: palette.muted, fontFamily: type.body, fontSize: 10, fontWeight: '700', marginTop: 5, textTransform: 'uppercase' },
  currentStatus: { color: palette.accent },
  lockedText: { color: '#9A938A' },
  pressed: { transform: [{ scale: 0.96 }] },
});
