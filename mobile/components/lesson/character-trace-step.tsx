import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Path, Polyline, Text as SvgText } from 'react-native-svg';

import { palette, type } from '@/constants/kokoro-theme';
import { KANA_TRACING, type TracePoint } from '@/data/kana-tracing';
import type { LessonContentStep } from '@/types/learning';

type CharacterTraceStepData = Extract<LessonContentStep, { type: 'character_trace' }>;

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

const triggerHaptic = (feedback: Promise<void>) => {
  void feedback.catch(() => undefined);
};

export function CharacterTraceStep({
  step,
  completedInitially,
  onCompletionChange,
}: {
  step: CharacterTraceStepData;
  completedInitially: boolean;
  onCompletionChange: (completed: boolean) => void;
}) {
  const definition = KANA_TRACING[step.tracingKey];
  const [canvasSize, setCanvasSize] = useState(320);
  const [completedCount, setCompletedCount] = useState(
    completedInitially && definition ? definition.strokes.length : 0,
  );
  const [attemptPoints, setAttemptPoints] = useState<TracePoint[]>([]);
  const [guidePoint, setGuidePoint] = useState<TracePoint | null>(null);
  const [message, setMessage] = useState('Begin at the numbered dot and follow the moving guide.');
  const attemptRef = useRef<TracePoint[]>([]);
  const guideProgress = useRef(new Animated.Value(0)).current;

  const isComplete = Boolean(definition && completedCount >= definition.strokes.length);
  const currentStroke = definition?.strokes[Math.min(completedCount, definition.strokes.length - 1)];
  const currentStrokePoints = currentStroke?.points || [];

  useEffect(() => {
    if (!currentStroke || isComplete) {
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
  }, [currentStroke, guideProgress, isComplete]);

  if (!definition) {
    return (
      <View>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.message}>Tracing data for {step.character} is unavailable.</Text>
      </View>
    );
  }

  const toSourcePoint = (x: number, y: number): TracePoint => {
    const scale = definition.viewBoxSize / canvasSize;
    return [x * scale, y * scale];
  };

  const startAttempt = (x: number, y: number) => {
    if (isComplete) return;
    const point = toSourcePoint(x, y);
    attemptRef.current = [point];
    setAttemptPoints([point]);
    setMessage(`Trace stroke ${completedCount + 1} to its end.`);
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
    const accepted = validateStroke(attemptRef.current, currentStroke.points);
    attemptRef.current = [];
    setAttemptPoints([]);

    if (!accepted) {
      setMessage('Try again from the numbered dot and stay close to the guide.');
      triggerHaptic(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
      return;
    }

    const nextCount = completedCount + 1;
    setCompletedCount(nextCount);
    if (nextCount >= definition.strokes.length) {
      setMessage(`You traced ${step.character}.`);
      onCompletionChange(true);
      triggerHaptic(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    } else {
      setMessage(`Stroke ${completedCount + 1} complete. Follow the next guide.`);
      triggerHaptic(Haptics.selectionAsync());
    }
  };

  const resetTracing = () => {
    attemptRef.current = [];
    setAttemptPoints([]);
    setCompletedCount(0);
    setMessage('Begin at the numbered dot and follow the moving guide.');
    onCompletionChange(false);
    guideProgress.setValue(0);
    triggerHaptic(Haptics.selectionAsync());
  };

  const completeWithGuide = () => {
    setAttemptPoints([]);
    setCompletedCount(definition.strokes.length);
    setMessage(`Stroke guide completed for ${step.character}.`);
    onCompletionChange(true);
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

  return (
    <View>
      <Text style={styles.title}>{step.title}</Text>
      <View style={styles.traceMetaRow}>
        <Text style={styles.strokeCount}>
          {isComplete ? 'CHARACTER COMPLETE' : `STROKE ${completedCount + 1} OF ${definition.strokes.length}`}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset tracing"
          hitSlop={8}
          onPress={resetTracing}
          style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}>
          <Ionicons name="refresh" size={17} color={palette.accent} />
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      <GestureDetector gesture={panGesture}>
        <View
          accessible
          accessibilityLabel={`Tracing area for Hiragana ${step.romanization}`}
          onLayout={({ nativeEvent }) => setCanvasSize(nativeEvent.layout.width)}
          style={styles.canvasWrap}>
          <Svg width="100%" height="100%" viewBox={`0 0 ${definition.viewBoxSize} ${definition.viewBoxSize}`}>
            {definition.strokes.map((stroke, index) => (
              <Path
                key={`guide-${index}`}
                d={smoothPath(stroke.points)}
                fill="none"
                stroke={index < completedCount ? palette.accent : index === completedCount ? '#B8AEA1' : '#DDD5CA'}
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
            {!isComplete && startPoint ? (
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
          {!isComplete && guidePoint ? (
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
          {isComplete ? (
            <View pointerEvents="none" style={styles.completeMark}>
              <Ionicons name="checkmark" size={28} color={palette.white} />
            </View>
          ) : null}
        </View>
      </GestureDetector>

      <View style={[styles.messageRow, isComplete && styles.completeMessageRow]}>
        <Ionicons
          name={isComplete ? 'checkmark-circle' : 'finger-print-outline'}
          size={20}
          color={isComplete ? palette.success : palette.accent}
        />
        <Text style={styles.message}>{message}</Text>
      </View>

      {!isComplete ? (
        <Pressable
          accessibilityRole="button"
          onPress={completeWithGuide}
          style={({ pressed }) => [styles.guideAlternative, pressed && styles.pressed]}>
          <Text style={styles.guideAlternativeText}>Use the stroke guide instead</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { color: palette.ink, fontSize: 31, lineHeight: 39, fontFamily: type.display },
  traceMetaRow: { marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  strokeCount: { color: palette.accent, fontSize: 11, fontWeight: '900' },
  resetButton: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8 },
  resetText: { color: palette.accent, fontSize: 12, fontWeight: '800' },
  canvasWrap: {
    width: '100%',
    maxWidth: 420,
    aspectRatio: 1,
    alignSelf: 'center',
    marginTop: 8,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderWidth: 1,
    borderRadius: 8,
  },
  guideDot: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: palette.gold,
    borderColor: palette.white,
    borderWidth: 3,
  },
  completeMark: {
    position: 'absolute',
    right: 14,
    top: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.success,
  },
  messageRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: palette.accentSoft,
    borderRadius: 8,
  },
  completeMessageRow: { backgroundColor: palette.successSoft },
  message: { flex: 1, color: palette.ink, fontSize: 13, lineHeight: 19, fontWeight: '700' },
  guideAlternative: { alignSelf: 'center', minHeight: 40, justifyContent: 'center', marginTop: 5, paddingHorizontal: 12 },
  guideAlternativeText: { color: palette.ink, fontSize: 12, fontWeight: '700', textDecorationLine: 'underline' },
  pressed: { opacity: 0.72 },
});
