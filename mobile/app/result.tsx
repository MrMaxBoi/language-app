import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, type } from '@/constants/kokoro-theme';
import { useSessionStore } from '@/store/session-store';

type ReportShape = {
  score?: { correct?: number; total?: number; percentage?: number };
  roadmap?: { mode?: string; roadmapId?: string; lessonTitle?: string };
  reviewCompletionSummary?: {
    tasksCleared?: number;
    tasksRemaining?: number;
    refreshedSkills?: string[];
  };
};

export default function ResultScreen() {
  const router = useRouter();
  const report = useSessionStore((state) => state.report) as ReportShape | null;
  const reset = useSessionStore((state) => state.reset);
  const score = report?.score || {};
  const isReview = report?.roadmap?.mode === 'daily_review';
  const review = report?.reviewCompletionSummary;

  const returnToMap = () => {
    const roadmapId = report?.roadmap?.roadmapId;
    reset();
    router.replace(roadmapId ? { pathname: '/', params: { roadmapId } } : '/');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mark}>
          <Ionicons name="checkmark" size={38} color={palette.white} />
        </View>
        <Text style={styles.eyebrow}>{isReview ? 'REVIEW COMPLETE' : 'LESSON COMPLETE'}</Text>
        <Text style={styles.title}>{isReview ? 'You kept today’s learning fresh' : 'A little further along your path'}</Text>
        <Text style={styles.score}>{score.percentage || 0}%</Text>
        <Text style={styles.scoreLabel}>{score.correct || 0} of {score.total || 0} correct</Text>

        {isReview && review ? (
          <View style={styles.reviewSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{review.tasksCleared || 0}</Text>
              <Text style={styles.summaryLabel}>refreshed</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{review.tasksRemaining || 0}</Text>
              <Text style={styles.summaryLabel}>returning later</Text>
            </View>
          </View>
        ) : null}

        <Pressable style={styles.primaryButton} onPress={returnToMap}>
          <Text style={styles.primaryButtonText}>Return to your map</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.canvas },
  content: { flexGrow: 1, width: '100%', maxWidth: 580, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', padding: 28 },
  mark: { width: 74, height: 74, borderRadius: 37, backgroundColor: palette.success, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { color: palette.success, fontSize: 11, fontWeight: '900', marginTop: 24 },
  title: { color: palette.ink, fontFamily: type.display, fontSize: 29, lineHeight: 37, textAlign: 'center', marginTop: 8 },
  score: { color: palette.accent, fontFamily: type.display, fontSize: 56, marginTop: 26 },
  scoreLabel: { color: palette.muted, fontSize: 14, marginTop: 2 },
  reviewSummary: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: 8, paddingVertical: 18, marginTop: 26 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { color: palette.ink, fontSize: 23, fontWeight: '900' },
  summaryLabel: { color: palette.muted, fontSize: 12, marginTop: 3 },
  divider: { width: 1, height: 40, backgroundColor: palette.line },
  primaryButton: { width: '100%', minHeight: 54, backgroundColor: palette.accent, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 30 },
  primaryButtonText: { color: palette.white, fontSize: 16, fontWeight: '800' },
});
