import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KanaHub, type KanaHubItem } from '@/components/lesson/kana-hub';
import { palette, shadow, type } from '@/constants/kokoro-theme';
import { getLessonContent } from '@/services/kokoro-api';
import { lessonKana, practiceHubItems } from '@/store/kana-hub-progress';
import { useSessionStore } from '@/store/session-store';
import type { LessonContent } from '@/types/learning';

type ReportShape = {
  score?: { correct?: number; total?: number; percentage?: number };
  roadmap?: { mode?: string; roadmapId?: string; lessonId?: string; lessonTitle?: string };
  reviewCompletionSummary?: {
    tasksCleared?: number;
    tasksRemaining?: number;
    refreshedSkills?: string[];
  };
};

/** The words the lesson built, for the closing stage. */
function summarizeLesson(content: LessonContent) {
  const words: { japanese: string; meaning: string }[] = [];
  for (const step of content.steps) {
    if (step.type === 'synthesis' || step.type === 'word_context') words.push({ japanese: step.japanese, meaning: step.meaning });
  }
  const kana = lessonKana(content).map(({ key, character }) => ({ key, character }));
  return { kana, words };
}

export default function ResultScreen() {
  const router = useRouter();
  const report = useSessionStore((state) => state.report) as ReportShape | null;
  const sessionRoadmap = useSessionStore((state) => state.roadmap);
  const reset = useSessionStore((state) => state.reset);
  const questions = useSessionStore((state) => state.questions);
  const hub = useSessionStore((state) => state.hub);
  const inkEarned = useSessionStore((state) => state.inkEarned);
  const inkAsked = useSessionStore((state) => state.inkAsked);
  const [lessonSummary, setLessonSummary] = useState<ReturnType<typeof summarizeLesson> | null>(null);
  const score = report?.score || {};
  const isReview = report?.roadmap?.mode === 'daily_review';
  const review = report?.reviewCompletionSummary;
  const lessonId = report?.roadmap?.lessonId || sessionRoadmap?.lessonId;

  // The row keeps exactly the ink earned in practice; it is no longer filled for finishing.
  const hubItems = useMemo<KanaHubItem[]>(() => {
    if (isReview) return [];
    if (hub && hub.lessonId === lessonId) return practiceHubItems(hub.kana, hub.met, questions, inkEarned, inkAsked);
    if (!lessonSummary) return [];
    const metAll = Object.fromEntries(lessonSummary.kana.map((item) => [item.key, true]));
    return practiceHubItems(lessonSummary.kana, metAll, questions, inkEarned, inkAsked);
  }, [hub, inkAsked, inkEarned, isReview, lessonId, lessonSummary, questions]);

  useEffect(() => {
    if (isReview || !lessonId) return undefined;
    let active = true;
    // Decorative only: if the lesson cannot be loaded the score still shows.
    getLessonContent(lessonId)
      .then((content) => { if (active) setLessonSummary(summarizeLesson(content)); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [isReview, lessonId]);

  const returnToMap = () => {
    const roadmapId = report?.roadmap?.roadmapId;
    reset();
    router.replace(roadmapId ? { pathname: '/', params: { roadmapId } } : '/');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.stage}>
          {hubItems.length ? <KanaHub items={hubItems} showTesting /> : null}
          <Text style={styles.title}>{isReview ? 'You kept today’s learning fresh' : 'A little further along your path'}</Text>
          <Text style={styles.score}>{score.correct || 0} of {score.total || 0}</Text>
          <Text style={styles.scoreLabel}>answered correctly</Text>

          {lessonSummary?.words.length ? (
            <View style={styles.words}>
              {lessonSummary.words.map((word) => (
                <View key={word.japanese} style={styles.word}>
                  <Text style={styles.wordJapanese}>{word.japanese}</Text>
                  <Text style={styles.wordMeaning}>{word.meaning}</Text>
                </View>
              ))}
            </View>
          ) : null}

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
        </View>
      </ScrollView>
      <View style={styles.actionBar}>
        <Pressable accessibilityRole="button" style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]} onPress={returnToMap}>
          <Text style={styles.primaryButtonText}>Return to your map</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.canvas },
  content: { flexGrow: 1, padding: 18 },
  stage: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 580,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 28,
    ...shadow,
  },
  title: { color: palette.ink, fontFamily: type.display, fontSize: 27, lineHeight: 36, textAlign: 'center', marginTop: 18 },
  score: { color: palette.accent, fontFamily: type.display, fontSize: 48, marginTop: 22 },
  scoreLabel: { color: palette.muted, fontSize: 15, marginTop: 2 },
  words: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 26 },
  word: { minWidth: 84, alignItems: 'center', borderRadius: 12, backgroundColor: palette.successSoft, paddingVertical: 10, paddingHorizontal: 14 },
  wordJapanese: { color: palette.ink, fontFamily: type.display, fontSize: 24 },
  wordMeaning: { color: palette.success, fontSize: 12, fontWeight: '800', textTransform: 'capitalize' },
  reviewSummary: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: palette.line, paddingTop: 18, marginTop: 26 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { color: palette.ink, fontSize: 23, fontWeight: '900' },
  summaryLabel: { color: palette.muted, fontSize: 13, marginTop: 3 },
  divider: { width: 1, height: 40, backgroundColor: palette.line },
  actionBar: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 12, backgroundColor: palette.surface, borderTopWidth: 1, borderTopColor: palette.line },
  primaryButton: { width: '100%', maxWidth: 580, alignSelf: 'center', minHeight: 54, backgroundColor: palette.accent, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: palette.white, fontSize: 16, fontWeight: '800' },
  pressed: { opacity: 0.82 },
});
