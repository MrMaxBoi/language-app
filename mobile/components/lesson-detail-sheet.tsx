import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, shadow, type } from '@/constants/kokoro-theme';
import type { RoadmapLesson } from '@/types/learning';

type Props = {
  lesson: RoadmapLesson | null;
  isCurrent: boolean;
  visible: boolean;
  isStarting: boolean;
  onClose: () => void;
  onStart: (lesson: RoadmapLesson) => void;
};

const statusCopy = (lesson: RoadmapLesson, isCurrent: boolean) => {
  if (isCurrent && lesson.status !== 'completed') return 'Your next step';
  if (lesson.status === 'completed') return 'Lesson completed';
  if (lesson.status === 'in_progress') return 'Continue learning';
  if (lesson.status === 'coming_soon') return 'Learning content is being prepared';
  if (lesson.status === 'locked') return 'Complete the previous lesson to unlock this';
  return 'Ready when you are';
};

export function LessonDetailSheet({ lesson, isCurrent, visible, isStarting, onClose, onStart }: Props) {
  if (!lesson) return null;
  const locked = lesson.status === 'locked';
  const unavailable = locked || lesson.status === 'coming_soon';
  const accuracy = lesson.progress?.accuracy || 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable accessibilityLabel="Close lesson details" style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <View style={[styles.statusIcon, locked && styles.lockedIcon]}>
              <Ionicons
                name={locked ? 'lock-closed' : lesson.status === 'completed' ? 'checkmark' : 'book-outline'}
                size={22}
                color={locked ? palette.muted : palette.white}
              />
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={12} onPress={onClose}>
              <Ionicons name="close" size={25} color={palette.muted} />
            </Pressable>
          </View>

          <Text style={styles.eyebrow}>{statusCopy(lesson, isCurrent).toUpperCase()}</Text>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.description}>{lesson.description}</Text>

          {!locked && lesson.progress?.attempts > 0 ? (
            <View style={styles.progressRow}>
              <View>
                <Text style={styles.metricValue}>{lesson.progress.attempts}</Text>
                <Text style={styles.metricLabel}>questions practised</Text>
              </View>
              <View style={styles.metricDivider} />
              <View>
                <Text style={styles.metricValue}>{accuracy}%</Text>
                <Text style={styles.metricLabel}>lesson accuracy</Text>
              </View>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={unavailable || isStarting}
            onPress={() => onStart(lesson)}
            style={({ pressed }) => [
              styles.primaryButton,
              unavailable && styles.disabledButton,
              pressed && !unavailable && styles.pressedButton,
            ]}>
            <Text style={[styles.primaryButtonText, unavailable && styles.disabledButtonText]}>
              {lesson.status === 'coming_soon'
                ? 'Coming soon'
                : locked
                  ? 'Locked'
                : isStarting
                  ? 'Preparing lesson...'
                  : lesson.status === 'completed'
                    ? 'Practise again'
                    : lesson.status === 'in_progress'
                      ? 'Continue lesson'
                      : 'Start lesson'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(24, 21, 17, 0.42)' },
  sheet: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 34,
    ...shadow,
  },
  handle: { width: 42, height: 4, borderRadius: 2, backgroundColor: palette.line, alignSelf: 'center', marginBottom: 18 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: palette.accent, alignItems: 'center', justifyContent: 'center' },
  lockedIcon: { backgroundColor: '#E8E2D8' },
  eyebrow: { marginTop: 22, color: palette.accent, fontFamily: type.body, fontSize: 12, fontWeight: '800' },
  title: { marginTop: 7, color: palette.ink, fontFamily: type.display, fontSize: 29, lineHeight: 35 },
  description: { marginTop: 10, color: palette.muted, fontFamily: type.body, fontSize: 16, lineHeight: 24 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 22, backgroundColor: palette.canvas, borderRadius: 8, padding: 16, marginTop: 22 },
  metricValue: { color: palette.ink, fontSize: 20, fontWeight: '800' },
  metricLabel: { color: palette.muted, fontSize: 12, marginTop: 2 },
  metricDivider: { width: 1, height: 36, backgroundColor: palette.line },
  primaryButton: { marginTop: 24, minHeight: 54, borderRadius: 8, backgroundColor: palette.accent, justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { color: palette.white, fontSize: 16, fontWeight: '800' },
  disabledButton: { backgroundColor: '#E6E0D6' },
  disabledButtonText: { color: palette.muted },
  pressedButton: { opacity: 0.86 },
});
