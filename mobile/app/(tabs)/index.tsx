import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LessonDetailSheet } from '@/components/lesson-detail-sheet';
import { ReviewPreviewSheet } from '@/components/review-preview-sheet';
import { ReviewOfDayStrip } from '@/components/review-of-day-strip';
import { RoadmapUnit } from '@/components/roadmap-unit';
import { palette, type } from '@/constants/kokoro-theme';
import { getHomeRecommendation, getRoadmap } from '@/services/kokoro-api';
import { useSessionStore } from '@/store/session-store';
import type { HomeRecommendation, RoadmapLesson, RoadmapResponse } from '@/types/learning';

export default function MapScreen() {
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [recommendation, setRecommendation] = useState<HomeRecommendation | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<RoadmapLesson | null>(null);
  const [reviewPreviewVisible, setReviewPreviewVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isStarting, startError, startLesson, startDailyReview } = useSessionStore();

  const loadMap = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const [roadmapData, recommendationData] = await Promise.all([
        getRoadmap('guest'),
        getHomeRecommendation('guest'),
      ]);
      setRoadmap(roadmapData);
      setRecommendation(recommendationData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load your learning path.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMap();
    }, [loadMap]),
  );

  const progress = useMemo(() => {
    const lessons = roadmap?.units.flatMap((unit) => unit.lessons) || [];
    const completed = lessons.filter((lesson) => lesson.status === 'completed').length;
    return { completed, total: lessons.length, percent: lessons.length ? Math.round((completed / lessons.length) * 100) : 0 };
  }, [roadmap]);

  const beginLesson = async (lesson: RoadmapLesson) => {
    const started = await startLesson(lesson.id);
    if (started) {
      setSelectedLesson(null);
      router.push('/session');
    } else {
      Alert.alert('Lesson could not start', useSessionStore.getState().startError || 'Please try again.');
    }
  };

  const beginDailyReview = async () => {
    const started = await startDailyReview();
    if (started) {
      setReviewPreviewVisible(false);
      router.push('/session');
    }
    else Alert.alert('Review could not start', useSessionStore.getState().startError || 'Please try again.');
  };

  const continueNextLesson = () => {
    const nextLesson = roadmap?.nextLesson;
    if (nextLesson) setSelectedLesson(nextLesson);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={palette.accent} />
          <Text style={styles.stateTitle}>Opening your Japanese path</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !roadmap || !recommendation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <View style={styles.errorIcon}><Ionicons name="cloud-offline-outline" size={28} color={palette.accent} /></View>
          <Text style={styles.stateTitle}>Your path could not load</Text>
          <Text style={styles.stateText}>{error || 'Check that the Kokoro backend is running.'}</Text>
          <Pressable style={styles.retryButton} onPress={() => loadMap()}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} tintColor={palette.accent} onRefresh={() => loadMap(true)} />}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentColumn}>
          <View style={styles.header}>
            <View>
              <Text style={styles.wordmark}>Kokoro</Text>
              <Text style={styles.japaneseMark}>こころ</Text>
            </View>
            <View style={styles.progressPill}>
              <Text style={styles.progressValue}>{progress.percent}%</Text>
              <Text style={styles.progressLabel}>N5 PATH</Text>
            </View>
          </View>

          <ReviewOfDayStrip
            recommendation={recommendation}
            isStarting={isStarting}
            onOpenReview={() => setReviewPreviewVisible(true)}
            onContinueLesson={continueNextLesson}
          />
          {startError ? <Text style={styles.inlineError}>{startError}</Text> : null}

          <View style={styles.pathIntro}>
            <Text style={styles.pathEyebrow}>YOUR LEARNING MAP</Text>
            <Text style={styles.pathTitle}>The path to Japanese</Text>
            <Text style={styles.pathMeta}>{progress.completed} of {progress.total} lessons complete</Text>
          </View>

          {roadmap.units.map((unit, unitIndex) => (
            <RoadmapUnit
              key={unit.id}
              unit={unit}
              unitIndex={unitIndex}
              currentLessonId={roadmap.nextLesson?.id}
              onLessonPress={setSelectedLesson}
            />
          ))}

          <View style={styles.journeyEnd}>
            <Ionicons name="flower-outline" size={25} color={palette.gold} />
            <Text style={styles.journeyEndTitle}>More of the journey is still being written</Text>
            <Text style={styles.journeyEndText}>Kokoro will grow beyond this N5 foundation path.</Text>
          </View>
        </View>
      </ScrollView>

      <LessonDetailSheet
        lesson={selectedLesson}
        visible={Boolean(selectedLesson)}
        isCurrent={selectedLesson?.id === roadmap.nextLesson?.id}
        isStarting={isStarting}
        onClose={() => setSelectedLesson(null)}
        onStart={beginLesson}
      />
      <ReviewPreviewSheet
        review={recommendation.reviewOfDay}
        visible={reviewPreviewVisible}
        isStarting={isStarting}
        onClose={() => setReviewPreviewVisible(false)}
        onStart={beginDailyReview}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.canvas },
  scrollContent: { paddingBottom: 48 },
  contentColumn: { width: '100%', maxWidth: 620, alignSelf: 'center', paddingHorizontal: 20 },
  header: { minHeight: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordmark: { color: palette.ink, fontFamily: type.display, fontSize: 27, lineHeight: 30 },
  japaneseMark: { color: palette.accent, fontFamily: type.body, fontSize: 10, fontWeight: '700', marginTop: 1 },
  progressPill: { width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' },
  progressValue: { color: palette.ink, fontSize: 16, fontWeight: '900' },
  progressLabel: { color: palette.muted, fontSize: 8, fontWeight: '800', marginTop: 1 },
  inlineError: { color: palette.danger, fontSize: 12, marginTop: 8 },
  pathIntro: { alignItems: 'center', marginTop: 38, marginBottom: 4 },
  pathEyebrow: { color: palette.accent, fontFamily: type.body, fontSize: 10, fontWeight: '900' },
  pathTitle: { color: palette.ink, fontFamily: type.display, fontSize: 30, lineHeight: 37, marginTop: 6 },
  pathMeta: { color: palette.muted, fontFamily: type.body, fontSize: 13, marginTop: 5 },
  journeyEnd: { alignItems: 'center', borderTopWidth: 1, borderColor: palette.line, marginTop: 34, paddingTop: 32, paddingBottom: 24 },
  journeyEndTitle: { color: palette.ink, fontFamily: type.display, fontSize: 17, textAlign: 'center', marginTop: 10 },
  journeyEndText: { color: palette.muted, fontFamily: type.body, fontSize: 12, textAlign: 'center', marginTop: 5 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34 },
  errorIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: palette.accentSoft, alignItems: 'center', justifyContent: 'center' },
  stateTitle: { color: palette.ink, fontFamily: type.display, fontSize: 22, textAlign: 'center', marginTop: 18 },
  stateText: { color: palette.muted, fontFamily: type.body, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 },
  retryButton: { minWidth: 140, minHeight: 48, backgroundColor: palette.accent, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  retryText: { color: palette.white, fontSize: 15, fontWeight: '800' },
});
