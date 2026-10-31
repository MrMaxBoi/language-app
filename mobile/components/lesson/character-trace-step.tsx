import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useReducedMotion } from 'react-native-reanimated';
import Svg, { Circle, Path, Polyline, Text as SvgText } from 'react-native-svg';

import { KanaPageLayout } from '@/components/lesson/kana-page-layout';
import { palette, type } from '@/constants/kokoro-theme';
import { KANA_TRACING, type TracePoint } from '@/data/kana-tracing';
import type { LessonContentStep } from '@/types/learning';

type CharacterTraceStepData = Extract<LessonContentStep, { type: 'character_trace' }>;

/**
 * How much the canvas helps.
 * - full: first trace of a kana. Numbered start dot, moving guide, grey strokes.
 * - shape: a later trace of the same kana. Only the faint shape; the start dot and moving guide
 *   come back for a stroke only after the learner misses it.
 */
export type TraceGuidance = 'full' | 'shape';

const STROKE_TODO = '#DDD5CA';
const STROKE_CURRENT = '#B8AEA1';
const HINT_FADE_MS = 180;
const SETTLE_MS = 320;

const distance = (first: TracePoint, second: TracePoint) =>
  Math.hypot(first[0] - second[0], first[1] - second[1]);

const lineLength = (points: readonly TracePoint[]) => points.slice(1).reduce(
  (total, point, index) => total + distance(points[index], point),
  0,
);

function pointAlong(points: readonly TracePoint[], progress: number): TracePoint {
  if (points.length < 2) return points[0] || [0, 0];
  const target = lineLength(points) * Math.max(0, Math.min(1, progress));
  let travelled = 0;

  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];
    const segmentLength = distance(start, end);
    if (travelled + segmentLength >= target) {
      const segmentProgress = segmentLength ? (target - travelled) / segmentLength : 0;
      return [
        start[0] + ((end[0] - start[0]) * segmentProgress),
        start[1] + ((end[1] - start[1]) * segmentProgress),
      ];
    }
    travelled += segmentLength;
  }

  return points[points.length - 1];
}

const sampleLine = (points: readonly TracePoint[], count = 72) => Array.from(
  { length: count },
  (_, index) => pointAlong(points, index / (count - 1)),
);

function validateStroke(attempt: readonly TracePoint[], expectedPoints: readonly TracePoint[]) {
  if (attempt.length < 2) return false;

  const expected = sampleLine(expectedPoints);
  const actual = sampleLine(attempt);
  const expectedLength = lineLength(expectedPoints);
  const actualLength = lineLength(attempt);
  const lengthRatio = expectedLength ? actualLength / expectedLength : 0;

  if (distance(actual[0], expected[0]) > 150) return false;
  if (distance(actual[actual.length - 1], expected[expected.length - 1]) > 190) return false;
  if (lengthRatio < 0.5 || lengthRatio > 1.85) return false;

  const closePointCount = actual.filter((point) => (
    Math.min(...expected.map((expectedPoint) => distance(point, expectedPoint))) <= 115
  )).length;
  if (closePointCount / actual.length < 0.7) return false;

  let actualCursor = 0;
  for (const progress of [0.12, 0.32, 0.52, 0.72, 0.9]) {
    const checkpoint = pointAlong(expectedPoints, progress);
    const foundIndex = actual.findIndex((point, index) => (
      index >= actualCursor && distance(point, checkpoint) <= 145
    ));
    if (foundIndex < 0) return false;
    actualCursor = foundIndex;
  }

  return true;
}

const pointsAttribute = (points: readonly TracePoint[]) => points
  .map(([x, y]) => `${Math.round(x)},${Math.round(y)}`)
  .join(' ');

function smoothPath(points: readonly TracePoint[]) {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;
  if (points.length === 2) return `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]}`;

  const commands = [`M ${points[0][0]} ${points[0][1]}`];
  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midpoint: TracePoint = [(current[0] + next[0]) / 2, (current[1] + next[1]) / 2];
    commands.push(`Q ${current[0]} ${current[1]} ${midpoint[0]} ${midpoint[1]}`);
  }
  const finalPoint = points[points.length - 1];
  commands.push(`L ${finalPoint[0]} ${finalPoint[1]}`);
  return commands.join(' ');
}

/** Screen readers still hear what the guides show. Never lets a missing native method break tracing. */
function announce(text: string) {
  try {
    AccessibilityInfo.announceForAccessibility?.(text);
  } catch {
    // Announcements are a nicety; tracing must keep working without them.
  }
}

const triggerHaptic = (feedback: Promise<void>) => {
  void feedback.catch(() => undefined);
};

export function CharacterTraceStep({
  step,
  completedInitially,
  onCompletionChange,
  guidance = 'full',
}: {
  step: CharacterTraceStepData;
  completedInitially: boolean;
  onCompletionChange: (completed: boolean) => void;
  guidance?: TraceGuidance;
}) {
  const definition = KANA_TRACING[step.tracingKey];
  const [canvasSize, setCanvasSize] = useState(320);
  const [completedCount, setCompletedCount] = useState(
    completedInitially && definition ? definition.strokes.length : 0,
  );
  const [attemptPoints, setAttemptPoints] = useState<TracePoint[]>([]);
  const [guidePoint, setGuidePoint] = useState<TracePoint | null>(null);
  // One short line under the canvas, shown only after a missed stroke.
  const [hint, setHint] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  // A stroke the learner missed in shape mode gets its start dot and moving guide back.
  const [missedStroke, setMissedStroke] = useState<number | null>(null);
  const attemptRef = useRef<TracePoint[]>([]);
  const guideProgress = useRef(new Animated.Value(0)).current;
  const [hintOpacity] = useState(() => new Animated.Value(0));
  const [settle] = useState(() => new Animated.Value(0));
  const reduceMotion = useReducedMotion();

  const isComplete = Boolean(definition && completedCount >= definition.strokes.length);
  const currentStroke = definition?.strokes[Math.min(completedCount, definition.strokes.length - 1)];
  const currentStrokePoints = currentStroke?.points || [];
  const showGuides = guidance === 'full' || missedStroke === completedCount;

  useEffect(() => {
    Animated.timing(hintOpacity, {
      toValue: hint ? 1 : 0,
      duration: reduceMotion ? 0 : HINT_FADE_MS,
      useNativeDriver: true,
    }).start();
  }, [hint, hintOpacity, reduceMotion]);

  useEffect(() => {
    if (!currentStroke || isComplete || !showGuides) {
      setGuidePoint(null);
      return undefined;
    }

    guideProgress.setValue(0);
    const listenerId = guideProgress.addListener(({ value }) => {
      setGuidePoint(pointAlong(currentStroke.points, value));
    });
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(guideProgress, { toValue: 1, duration: 1700, useNativeDriver: false }),
      Animated.delay(350),
    ]));
    animation.start();

    return () => {
      animation.stop();
      guideProgress.removeListener(listenerId);
    };
  }, [currentStroke, guideProgress, isComplete, showGuides]);

  if (!definition) {
    return (
      <View>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.hint}>Tracing data for {step.character} is unavailable.</Text>
      </View>
    );
  }

  /** The finished character takes a small breath as the last stroke turns to ink. */
  const playSettle = () => {
    if (reduceMotion) return;
    settle.setValue(0);
    Animated.timing(settle, { toValue: 1, duration: SETTLE_MS, useNativeDriver: true }).start();
  };

  const toSourcePoint = (x: number, y: number): TracePoint => {
    const scale = definition.viewBoxSize / canvasSize;
    return [x * scale, y * scale];
  };

  const startAttempt = (x: number, y: number) => {
    if (isComplete) return;
    const point = toSourcePoint(x, y);
    attemptRef.current = [point];
    setAttemptPoints([point]);
  };

  const continueAttempt = (x: number, y: number) => {
    if (isComplete || !attemptRef.current.length) return;
    const point = toSourcePoint(x, y);
    const previous = attemptRef.current[attemptRef.current.length - 1];
    if (distance(previous, point) < 7) return;
    attemptRef.current = [...attemptRef.current, point];
    setAttemptPoints(attemptRef.current);
  };

  const finishAttempt = () => {
    if (isComplete || !currentStroke) return;
    const attempt = attemptRef.current;
    const accepted = validateStroke(attempt, currentStroke.points);
    attemptRef.current = [];
    setAttemptPoints([]);
    // A tap or a tiny slip is not a real attempt, so it gets no correction.
    if (attempt.length < 2) return;

    if (!accepted) {
      const startedWrong = distance(attempt[0], currentStroke.points[0]) > 150;
      const line = startedWrong ? 'Start at the dot.' : 'Follow the stroke all the way to its end.';
      setFailedAttempts((count) => count + 1);
      setMissedStroke(completedCount);
      setHint(line);
      announce(line);
      triggerHaptic(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
      return;
    }

    const nextCount = completedCount + 1;
    setCompletedCount(nextCount);
    setHint(null);
    if (nextCount >= definition.strokes.length) {
      announce(`You traced ${step.character}.`);
      onCompletionChange(true);
      playSettle();
      triggerHaptic(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    } else {
      announce(`Stroke ${nextCount} of ${definition.strokes.length} done.`);
      triggerHaptic(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
    }
  };


  const resetTracing = () => {
    attemptRef.current = [];
    setAttemptPoints([]);
    setCompletedCount(0);
    setHint(null);
    setMissedStroke(null);
    onCompletionChange(false);
    guideProgress.setValue(0);
    triggerHaptic(Haptics.selectionAsync());
  };

  const completeWithGuide = () => {
    setAttemptPoints([]);
    setCompletedCount(definition.strokes.length);
    setHint(null);
    announce(`Stroke guide completed for ${step.character}.`);
    onCompletionChange(true);
    playSettle();
    triggerHaptic(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
  };

  const panGesture = Gesture.Pan()
    .enabled(!isComplete)
    .minDistance(0)
    .runOnJS(true)
    .onBegin(({ x, y }) => startAttempt(x, y))
    .onUpdate(({ x, y }) => continueAttempt(x, y))
    .onFinalize(finishAttempt);

  const startPoint = currentStrokePoints[0];
  const guideScale = canvasSize / definition.viewBoxSize;

  const settleScale = settle.interpolate({ inputRange: [0, 0.4, 1], outputRange: [1, 1.03, 1] });

  return (
    <KanaPageLayout
      title={step.title}
      titleAccessory={(
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset tracing"
          hitSlop={10}
          onPress={resetTracing}
          style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}>
          <Ionicons name="refresh" size={18} color={palette.muted} />
        </Pressable>
      )}
      footer={(
        <View>
          {/* Space is kept for the line so nothing shifts when it appears. */}
          <Animated.Text
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[styles.hint, { opacity: hintOpacity }]}>
            {hint ?? ' '}
          </Animated.Text>

          {/* Reward finishing over precision: after two misses the learner may let the guide finish. */}
          {!isComplete && failedAttempts >= 2 ? (
            <Pressable
              accessibilityRole="button"
              onPress={completeWithGuide}
              style={({ pressed }) => [styles.guideAlternative, pressed && styles.pressed]}>
              <Text style={styles.guideAlternativeText}>Skip with the stroke guide</Text>
            </Pressable>
          ) : null}
        </View>
      )}>
      {(side) => (
        <GestureDetector gesture={panGesture}>
          <View
            accessible
            accessibilityLabel={`Tracing area for Hiragana ${step.romanization}`}
            accessibilityHint={isComplete ? undefined : `Stroke ${completedCount + 1} of ${definition.strokes.length}`}
            onLayout={() => { if (canvasSize !== side) setCanvasSize(side); }}
            style={[styles.canvasWrap, { width: side, height: side }]}>
            <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale: settleScale }] }]}>
              <Svg width="100%" height="100%" viewBox={`0 0 ${definition.viewBoxSize} ${definition.viewBoxSize}`}>
                {definition.strokes.map((stroke, index) => (
                  <Path
                    key={`guide-${index}`}
                    d={smoothPath(stroke.points)}
                    fill="none"
                    // Grey until traced, then ink: the same grey-to-black idea as the kana row.
                    stroke={index < completedCount
                      ? palette.ink
                      : index === completedCount && showGuides ? STROKE_CURRENT : STROKE_TODO}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={index < completedCount ? 58 : 54}
                  />
                ))}
                {attemptPoints.length > 1 ? (
                  <Polyline
                    fill="none"
                    points={pointsAttribute(attemptPoints)}
                    stroke={palette.ink}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={46}
                  />
                ) : null}
                {!isComplete && showGuides && startPoint ? (
                  <>
                    <Circle cx={startPoint[0]} cy={startPoint[1]} fill={palette.accent} r={55} />
                    <SvgText
                      x={startPoint[0]}
                      y={startPoint[1] + 20}
                      fill={palette.white}
                      fontSize={56}
                      fontWeight="800"
                      textAnchor="middle">
                      {completedCount + 1}
                    </SvgText>
                  </>
                ) : null}
              </Svg>
            </Animated.View>
            {!isComplete && showGuides && guidePoint ? (
              <View
                pointerEvents="none"
                style={[
                  styles.guideDot,
                  {
                    left: (guidePoint[0] * guideScale) - 11,
                    top: (guidePoint[1] * guideScale) - 11,
                  },
                ]}
              />
            ) : null}
          </View>
        </GestureDetector>
      )}
    </KanaPageLayout>
  );
}

const styles = StyleSheet.create({
  title: { color: palette.ink, fontSize: 31, lineHeight: 39, fontFamily: type.display },
  // In the title row, outside the tracing area, so a tap on it never starts a stroke.
  resetButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  canvasWrap: { position: 'relative' },
  guideDot: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: palette.gold,
    borderColor: palette.white,
    borderWidth: 3,
  },
  hint: { minHeight: 22, color: palette.accent, fontSize: 15, lineHeight: 22, fontWeight: '700', textAlign: 'center' },
  guideAlternative: { alignSelf: 'center', minHeight: 40, justifyContent: 'center', marginTop: 5, paddingHorizontal: 12 },
  guideAlternativeText: { color: palette.ink, fontSize: 12, fontWeight: '700', textDecorationLine: 'underline' },
  pressed: { opacity: 0.72 },
});
