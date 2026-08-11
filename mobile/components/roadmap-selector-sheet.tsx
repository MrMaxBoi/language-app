import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, shadow, type } from '@/constants/kokoro-theme';
import type { RoadmapResponse } from '@/types/learning';

type RoadmapOption = RoadmapResponse['availableRoadmaps'][number];

type Props = {
  visible: boolean;
  roadmaps: RoadmapOption[];
  selectedRoadmapId: string;
  onClose: () => void;
  onSelect: (roadmapId: string) => void;
};

export function RoadmapSelectorSheet({ visible, roadmaps, selectedRoadmapId, onClose, onSelect }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable accessibilityLabel="Close roadmap chooser" style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>LEARNING PATH</Text>
              <Text style={styles.title}>Choose your roadmap</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={12} onPress={onClose}>
              <Ionicons name="close" size={25} color={palette.muted} />
            </Pressable>
          </View>
          <View style={styles.list}>
            {roadmaps.map((roadmap) => {
              const selected = roadmap.id === selectedRoadmapId;
              return (
                <Pressable
                  key={roadmap.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => onSelect(roadmap.id)}
                  style={({ pressed }) => [styles.option, selected && styles.selectedOption, pressed && styles.pressed]}>
                  <View style={[styles.optionMark, selected && styles.selectedMark]}>
                    <Text style={[styles.optionMarkText, selected && styles.selectedMarkText]}>
                      {roadmap.level === 'pre-n5' ? 'あ' : 'N5'}
                    </Text>
                  </View>
                  <View style={styles.optionCopy}>
                    <Text style={styles.optionTitle}>{roadmap.title}</Text>
                    <Text style={styles.optionDescription} numberOfLines={2}>{roadmap.description}</Text>
                    <Text style={styles.optionMeta}>{roadmap.lessonCount} lessons · {roadmap.unitCount} chapters</Text>
                  </View>
                  <Ionicons
                    name={selected ? 'checkmark-circle' : 'chevron-forward'}
                    size={22}
                    color={selected ? palette.success : palette.muted}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(24, 21, 17, 0.42)' },
  sheet: { backgroundColor: palette.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 34, ...shadow },
  handle: { width: 42, height: 4, borderRadius: 2, backgroundColor: palette.line, alignSelf: 'center', marginBottom: 18 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 },
  eyebrow: { color: palette.accent, fontSize: 10, fontWeight: '900' },
  title: { color: palette.ink, fontFamily: type.display, fontSize: 25, marginTop: 5 },
  list: { gap: 12, marginTop: 22 },
  option: { minHeight: 108, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: palette.line, borderRadius: 8, padding: 14, backgroundColor: palette.canvas },
  selectedOption: { borderColor: palette.accent, backgroundColor: palette.accentSoft },
  optionMark: { width: 48, height: 48, borderRadius: 24, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, alignItems: 'center', justifyContent: 'center' },
  selectedMark: { backgroundColor: palette.accent, borderColor: palette.accent },
  optionMarkText: { color: palette.ink, fontSize: 14, fontWeight: '900' },
  selectedMarkText: { color: palette.white },
  optionCopy: { flex: 1, minWidth: 0 },
  optionTitle: { color: palette.ink, fontSize: 15, fontWeight: '900' },
  optionDescription: { color: palette.muted, fontSize: 11, lineHeight: 16, marginTop: 4 },
  optionMeta: { color: palette.accent, fontSize: 10, fontWeight: '800', marginTop: 7 },
  pressed: { opacity: 0.82 },
});
