import { StyleSheet, Text, View } from 'react-native';

import { RoadmapNode } from '@/components/roadmap-node';
import { palette, type } from '@/constants/kokoro-theme';
import type { RoadmapLesson, RoadmapUnit as RoadmapUnitType } from '@/types/learning';

type Props = {
  unit: RoadmapUnitType;
  unitIndex: number;
  currentLessonId?: string;
  onLessonPress: (lesson: RoadmapLesson) => void;
};

export function RoadmapUnit({ unit, unitIndex, currentLessonId, onLessonPress }: Props) {
  const completed = unit.lessons.filter((lesson) => lesson.status === 'completed').length;

  return (
    <View style={styles.unit}>
      <View style={styles.headingRow}>
        <View style={styles.rule} />
        <View style={styles.headingCopy}>
          <Text style={styles.kicker}>UNIT {unitIndex + 1}</Text>
          <Text style={styles.title}>{unit.title}</Text>
          <Text style={styles.progress}>{completed} of {unit.lessons.length} complete</Text>
        </View>
        <View style={styles.rule} />
      </View>
      <View style={styles.nodes}>
        {unit.lessons.map((lesson, index) => (
          <RoadmapNode
            key={lesson.id}
            lesson={lesson}
            index={index}
            isCurrent={lesson.id === currentLessonId}
            isLast={index === unit.lessons.length - 1}
            onPress={onLessonPress}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  unit: { marginTop: 36 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headingCopy: { alignItems: 'center', maxWidth: 220 },
  rule: { flex: 1, height: 1, backgroundColor: palette.line },
  kicker: { color: palette.accent, fontFamily: type.body, fontSize: 10, fontWeight: '900' },
  title: { color: palette.ink, fontFamily: type.display, fontSize: 20, textAlign: 'center', marginTop: 4 },
  progress: { color: palette.muted, fontFamily: type.body, fontSize: 11, marginTop: 4 },
  nodes: { marginTop: 10 },
});
