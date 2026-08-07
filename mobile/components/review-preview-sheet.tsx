import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { palette, shadow, type } from '@/constants/kokoro-theme';
import type { ReviewOfDay } from '@/types/learning';

type Props = {
  review: ReviewOfDay;
  visible: boolean;
  isStarting: boolean;
  onClose: () => void;
  onStart: () => void;
};

type ReviewReason = ReviewOfDay['topics'][number]['reasons'][number];

const SEGMENT_COLORS = ['#B74635', '#C58B37', '#64806B', '#7A6D91', '#9A8B75'];
const REASON_ORDER: ReviewReason[] = ['mistake', 'memory_due', 'weak_skill'];
const REASON_META = {
  mistake: {
    label: 'Recent mistake',
    icon: 'close-circle-outline',
    color: '#A84238',
    background: '#F6DFDA',
  },
  memory_due: {
    label: 'Memory due',
    icon: 'time-outline',
    color: '#9A681F',
    background: '#F6E8C8',
  },
  weak_skill: {
    label: 'Needs practice',
    icon: 'fitness-outline',
    color: '#4F6F78',
    background: '#DDEBED',
  },
} as const;

const getFocusLabel = (weight: number, maximumWeight: number) => {
  if (weight >= maximumWeight * 0.8) return 'Main focus';
  if (weight >= maximumWeight * 0.45) return 'Focused refresh';
  return 'Quick refresh';
};

function ReasonIcons({ reasons }: { reasons: ReviewReason[] }) {
  return (
    <View style={styles.reasonIcons}>
      {REASON_ORDER.filter((reason) => reasons.includes(reason)).map((reason) => {
        const meta = REASON_META[reason];
        return (
          <View
            key={reason}
            accessible
            accessibilityLabel={meta.label}
            style={[styles.reasonIcon, { backgroundColor: meta.background }]}>
            <Ionicons name={meta.icon} size={14} color={meta.color} />
          </View>
        );
      })}
    </View>
  );
}

function ReasonLegend() {
  return (
    <View style={styles.legendRow}>
      {REASON_ORDER.map((reason) => {
        const meta = REASON_META[reason];
        return (
          <View key={reason} style={[styles.legendItem, { backgroundColor: meta.background }]}>
            <Ionicons name={meta.icon} size={14} color={meta.color} />
            <Text style={[styles.legendText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function ReviewPreviewSheet({ review, visible, isStarting, onClose, onStart }: Props) {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const selectedTopic = review.topics.find((topic) => topic.id === selectedTopicId) || null;
  const maximumWeight = review.topics[0]?.relativeWeight || 1;

  useEffect(() => {
    if (!visible) setSelectedTopicId(null);
  }, [visible]);

  const closeSheet = () => {
    setSelectedTopicId(null);
    onClose();
  };

  const handleRequestClose = () => {
    if (selectedTopic) setSelectedTopicId(null);
    else closeSheet();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleRequestClose}>
      <View style={styles.modalRoot}>
        <Pressable accessibilityLabel="Close review preview" style={styles.backdrop} onPress={closeSheet} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            {selectedTopic ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back to today's review"
                hitSlop={12}
                onPress={() => setSelectedTopicId(null)}
                style={styles.headerButton}>
                <Ionicons name="chevron-back" size={24} color={palette.ink} />
              </Pressable>
            ) : <View style={styles.headerButton} />}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={12}
              onPress={closeSheet}
              style={styles.headerButton}>
              <Ionicons name="close" size={25} color={palette.muted} />
            </Pressable>
          </View>

          {selectedTopic ? (
            <View style={styles.body}>
              <Text style={styles.eyebrow}>REVIEW AREA</Text>
              <Text style={styles.title}>{selectedTopic.title}</Text>
              <Text style={styles.meta}>
                {selectedTopic.taskCount} review {selectedTopic.taskCount === 1 ? 'item' : 'items'} across {selectedTopic.skills.length} {selectedTopic.skills.length === 1 ? 'skill' : 'skills'}
              </Text>

              <Text style={styles.sectionLabel}>SKILLS INCLUDED</Text>
              <ScrollView
                style={styles.detailList}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator>
                {selectedTopic.skills.map((skill) => (
                  <View key={skill.skillId} style={styles.skillRow}>
                    <View style={styles.skillHeading}>
                      <Text style={styles.skillTitle}>{skill.title}</Text>
                      <Text style={styles.skillMeta}>{skill.taskCount} {skill.taskCount === 1 ? 'review item' : 'review items'}</Text>
                    </View>
                    <View style={styles.skillReasons}>
                      {REASON_ORDER.filter((reason) => skill.reasons.includes(reason)).map((reason) => {
                        const meta = REASON_META[reason];
                        return (
                          <View key={reason} style={[styles.detailReason, { backgroundColor: meta.background }]}>
                            <Ionicons name={meta.icon} size={14} color={meta.color} />
                            <Text style={[styles.detailReasonText, { color: meta.color }]}>{meta.label}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.body}>
              <Text style={styles.eyebrow}>TODAY&apos;S REVIEW</Text>
              <Text style={styles.title}>Keep {review.topics.length} learning {review.topics.length === 1 ? 'area' : 'areas'} fresh</Text>
              <Text style={styles.meta}>{review.questionCount} questions · About {review.estimatedMinutes} minutes</Text>

              <Text style={styles.sectionLabel}>WHY THESE ARE HERE</Text>
              <ReasonLegend />

              {review.topics.length ? (
                <>
                  <Text style={styles.focusSectionLabel}>TODAY&apos;S FOCUS</Text>
                  <View
                    accessibilityRole="summary"
                    accessibilityLabel={`Review focus across ${review.topics.length} learning areas`}
                    style={styles.focusBar}>
                    {review.topics.map((topic, index) => (
                      <View
                        key={topic.id}
                        style={{ flex: Math.max(1, topic.relativeWeight), backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length] }}
                      />
                    ))}
                  </View>

                  <View style={styles.listHeader}>
                    <Text style={styles.listHeaderTitle}>ALL REVIEW AREAS</Text>
                    <Text style={styles.listHeaderCount}>{review.topics.length}</Text>
                  </View>
                  <ScrollView
                    style={styles.topicList}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator>
                    {review.topics.map((topic, index) => (
                      <Pressable
                        key={topic.id}
                        accessibilityRole="button"
                        accessibilityLabel={`${topic.title}. ${getFocusLabel(topic.relativeWeight, maximumWeight)}. View details`}
                        onPress={() => setSelectedTopicId(topic.id)}
                        style={({ pressed }) => [styles.topicRow, pressed && styles.pressedRow]}>
                        <View style={[styles.legendDot, { backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length] }]} />
                        <View style={styles.topicCopy}>
                          <Text numberOfLines={1} style={styles.topicTitle}>{topic.title}</Text>
                          <Text style={styles.topicMeta}>
                            {topic.taskCount} {topic.taskCount === 1 ? 'item' : 'items'} · {topic.skills.length} {topic.skills.length === 1 ? 'skill' : 'skills'}
                          </Text>
                        </View>
                        <ReasonIcons reasons={topic.reasons} />
                        <Ionicons name="chevron-forward" size={18} color={palette.muted} />
                      </Pressable>
                    ))}
                  </ScrollView>
                </>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Kokoro will choose the memories that most need a refresh.</Text>
                </View>
              )}
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            disabled={isStarting}
            onPress={onStart}
            style={({ pressed }) => [styles.startButton, pressed && !isStarting && styles.pressed]}>
            <Text style={styles.startButtonText}>{isStarting ? 'Preparing review...' : 'Start review'}</Text>
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
    height: '86%',
    backgroundColor: palette.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 34,
    ...shadow,
  },
  handle: { width: 42, height: 4, borderRadius: 2, backgroundColor: palette.line, alignSelf: 'center', marginBottom: 12 },
  headerRow: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, minHeight: 0 },
  eyebrow: { marginTop: 8, color: palette.accent, fontFamily: type.body, fontSize: 11, fontWeight: '900' },
  title: { marginTop: 7, color: palette.ink, fontFamily: type.display, fontSize: 27, lineHeight: 33 },
  meta: { marginTop: 6, color: palette.muted, fontFamily: type.body, fontSize: 13, lineHeight: 19 },
  sectionLabel: { marginTop: 20, color: palette.muted, fontFamily: type.body, fontSize: 10, fontWeight: '900' },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 9 },
  legendItem: { minHeight: 29, borderRadius: 7, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendText: { fontFamily: type.body, fontSize: 10, fontWeight: '800' },
  focusSectionLabel: { marginTop: 18, color: palette.muted, fontFamily: type.body, fontSize: 10, fontWeight: '900' },
  focusBar: { height: 14, flexDirection: 'row', overflow: 'hidden', borderRadius: 7, backgroundColor: palette.line, marginTop: 8, gap: 2 },
  listHeader: { marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  listHeaderTitle: { color: palette.muted, fontFamily: type.body, fontSize: 10, fontWeight: '900' },
  listHeaderCount: { color: palette.accent, fontFamily: type.body, fontSize: 11, fontWeight: '900' },
  topicList: { flex: 1, minHeight: 112, marginTop: 4 },
  detailList: { flex: 1, minHeight: 150, marginTop: 5 },
  listContent: { paddingBottom: 12 },
  topicRow: { minHeight: 60, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: palette.line },
  pressedRow: { backgroundColor: palette.canvas },
  legendDot: { width: 9, height: 9, borderRadius: 5, marginRight: 11 },
  topicCopy: { flex: 1, minWidth: 0, paddingVertical: 9 },
  topicTitle: { color: palette.ink, fontFamily: type.body, fontSize: 14, fontWeight: '800' },
  topicMeta: { color: palette.muted, fontFamily: type.body, fontSize: 11, marginTop: 3 },
  reasonIcons: { flexDirection: 'row', gap: 4, marginHorizontal: 7 },
  reasonIcon: { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  skillRow: { minHeight: 82, borderBottomWidth: 1, borderBottomColor: palette.line, paddingVertical: 13 },
  skillHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 },
  skillTitle: { flex: 1, color: palette.ink, fontFamily: type.body, fontSize: 15, fontWeight: '800' },
  skillMeta: { color: palette.muted, fontFamily: type.body, fontSize: 10 },
  skillReasons: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 9 },
  detailReason: { minHeight: 27, borderRadius: 7, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailReasonText: { fontFamily: type.body, fontSize: 10, fontWeight: '800' },
  emptyState: { backgroundColor: palette.canvas, borderRadius: 8, padding: 16, marginTop: 22 },
  emptyText: { color: palette.muted, fontFamily: type.body, fontSize: 13, lineHeight: 19 },
  startButton: { minHeight: 54, borderRadius: 8, backgroundColor: palette.accent, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  startButtonText: { color: palette.white, fontFamily: type.body, fontSize: 16, fontWeight: '800' },
  pressed: { opacity: 0.86 },
});
