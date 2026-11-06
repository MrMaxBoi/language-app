import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KanaHub } from '@/components/lesson/kana-hub';
import { palette, shadow, type } from '@/constants/kokoro-theme';
import { getLessonContent } from '@/services/kokoro-api';
import {
  FIRST_TRY_CREDIT,
  SECOND_LOOK_CREDIT,
  lessonKana,
  practiceHubItems,
} from '@/store/kana-hub-progress';
import { useSessionStore } from '@/store/session-store';

type Feedback = {
  isCorrect: boolean;
  correctAnswer: string;
  explanation?: string | null;
};

/** One turn in the session: a question index, and whether it is the end-of-session second look. */
type QueueEntry = { questionIndex: number; isRetry: boolean };

type TurnRecord = { answer: string; feedback: Feedback };

const choiceTypes = new Set(['multiple_choice', 'meaning_match', 'translation_choice']);

// A struggling session grows once: after this many first-try misses, ask for EXTEND_COUNT
// repair questions. The server caps the whole session at 6. Nothing tells the learner;
// the extra questions read as ordinary ones.
const STRUGGLE_MISSES = 2;
const EXTEND_COUNT = 2;

/**
 * Add new turns after the live one and before any pending second looks, so retries stay last.
 * Answered turns never move, so records keyed by turn position stay valid.
 */
function insertRepairTurns(queue: QueueEntry[], livePosition: number, added: QueueEntry[]) {
  const firstPendingRetry = queue.findIndex((entry, index) => index > livePosition && entry.isRetry);
  const at = firstPendingRetry === -1 ? queue.length : firstPendingRetry;
  return [...queue.slice(0, at), ...added, ...queue.slice(at)];
}

// Mirrors the backend comparison in session.controller.js so a second look is judged identically.
const normalize = (value: string) => value.toLowerCase().trim();

function QuestionDots({ queue, records, position }: {
  queue: QueueEntry[];
  records: Record<number, TurnRecord>;
  position: number;
}) {
  return (
    <View accessible accessibilityLabel={`Question ${position + 1} of ${queue.length}`} style={styles.dots}>
      {queue.map((entry, index) => {
        const record = records[index];
        return (
          <View
            key={`${entry.questionIndex}-${entry.isRetry ? 'retry' : 'first'}`}
            style={[
              styles.dot,
              index === position && styles.currentDot,
              record?.feedback.isCorrect && styles.correctDot,
              record && !record.feedback.isCorrect && styles.missedDot,
            ]}
          />
        );
      })}
    </View>
  );
}

export default function SessionScreen() {
  const router = useRouter();
  const { sessionId, questions, roadmap, submitAnswer, completeSession } = useSessionStore();
  const hub = useSessionStore((state) => state.hub);
  const inkEarned = useSessionStore((state) => state.inkEarned);
  const inkAsked = useSessionStore((state) => state.inkAsked);
  const beginHub = useSessionStore((state) => state.beginHub);
  const recordInk = useSessionStore((state) => state.recordInk);
  const extendSession = useSessionStore((state) => state.extendSession);
  const [queue, setQueue] = useState<QueueEntry[]>(
    () => questions.map((_, questionIndex) => ({ questionIndex, isRetry: false })),
  );
  const [position, setPosition] = useState(0);
  const [viewPosition, setViewPosition] = useState<number | null>(null);
  const [records, setRecords] = useState<Record<number, TurnRecord>>({});
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  // The repair request, once made. Finishing waits for it so the extra questions are never skipped.
  const extendRequest = useRef<Promise<number> | null>(null);
  // Mirrors `queue` synchronously, so code that resumes after an await sees the latest turns.
  const queueRef = useRef(queue);
  const updateQueue = (change: (current: QueueEntry[]) => QueueEntry[]) => {
    queueRef.current = change(queueRef.current);
    setQueue(queueRef.current);
  };
  // The live turn, read when the repair questions arrive (the learner may have moved on).
  const livePosition = useRef(0);
  useEffect(() => {
    livePosition.current = position;
  }, [position]);

  // Previous only ever shows an earlier turn read-only; the live turn stays at `position`.
  const shownPosition = viewPosition ?? position;
  const isReviewingPast = viewPosition !== null;
  const entry = queue[shownPosition];
  const question = entry ? questions[entry.questionIndex] : undefined;
  const record = records[shownPosition];
  const feedback = record?.feedback || null;
  const shownAnswer = isReviewingPast ? record?.answer || '' : record?.answer ?? answer;
  const isLastTurn = position === queue.length - 1;

  const options = useMemo(
    () => (question?.options || []).map((option) => typeof option === 'string' ? option : option.text).filter(Boolean),
    [question],
  );
  const isChoice = Boolean(question && choiceTypes.has(question.questionType) && options.length > 0);
  const audioText = question?.audioText;
  const [isSpeaking, setIsSpeaking] = useState(false);

  const playQuestionAudio = (text: string) => {
    setIsSpeaking(true);
    const finish = () => setIsSpeaking(false);
    try {
      void Speech.stop();
      Speech.speak(text, { language: 'ja-JP', rate: 0.78, onDone: finish, onStopped: finish, onError: finish });
    } catch {
      finish();
    }
  };

  // A question answered by ear plays its sound once when it opens live; Hear replays it.
  const liveAudio = !isReviewingPast && !feedback ? audioText : undefined;
  useEffect(() => {
    if (!liveAudio) return undefined;
    const timer = setTimeout(() => playQuestionAudio(liveAudio), 350);
    return () => {
      clearTimeout(timer);
      void Speech.stop();
    };
  }, [liveAudio, shownPosition]);

  const title = roadmap?.mode === 'daily_review' ? 'Review of the day' : roadmap?.lessonTitle || 'Practice';
  const scrollEnabled = contentHeight > viewportHeight + 1;

  // Lesson practice shows the lesson's kana row filling with ink; mixed review sessions keep the dots.
  const hubLessonId = roadmap && roadmap.mode !== 'daily_review' && roadmap.mode !== 'review'
    ? roadmap.lessonId
    : undefined;
  const lessonHub = hub && hubLessonId && hub.lessonId === hubLessonId ? hub : null;

  // Practice opened straight from the map skipped teaching, so every kana counts as already met.
  useEffect(() => {
    if (!hubLessonId || lessonHub) return undefined;
    let active = true;
    getLessonContent(hubLessonId)
      .then((content) => {
        const kana = lessonKana(content).map(({ key, character }) => ({ key, character }));
        if (active && kana.length) beginHub(hubLessonId, kana, true);
      })
      .catch(() => undefined); // No teaching content: the dots remain.
    return () => { active = false; };
  }, [beginHub, hubLessonId, lessonHub]);

  const hubItems = useMemo(
    () => lessonHub ? practiceHubItems(lessonHub.kana, lessonHub.met, questions, inkEarned, inkAsked) : [],
    [inkAsked, inkEarned, lessonHub, questions],
  );

  if (!sessionId || !question || !entry) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.emptyState}>
          <Text style={styles.title}>No lesson is open</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.replace('/')}>
            <Text style={styles.primaryButtonText}>Return to map</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const checkAnswer = async () => {
    const trimmed = answer.trim();
    if (!trimmed) return;

    // Second look: practice only. The first attempt already reached the memory model,
    // so this one is judged locally and never submitted, to avoid counting the item twice.
    if (entry.isRetry) {
      const firstTurn = Object.entries(records).find(
        ([turn, value]) => queue[Number(turn)]?.questionIndex === entry.questionIndex && value,
      )?.[1];
      const correctAnswer = firstTurn?.feedback.correctAnswer || '';
      const isCorrect = normalize(trimmed) === normalize(correctAnswer);
      // A recovered miss earns half ink; a second miss earns none. Ink never drains.
      if (isCorrect) recordInk(question.conceptIds || [], SECOND_LOOK_CREDIT);
      setRecords((current) => ({
        ...current,
        [position]: {
          answer: trimmed,
          feedback: {
            isCorrect,
            correctAnswer,
            explanation: firstTurn?.feedback.explanation,
          },
        },
      }));
      return;
    }

    try {
      setSubmitting(true);
      const result = await submitAnswer(question._id || question.questionId, trimmed);
      const nextFeedback = { isCorrect: result.isCorrect, correctAnswer: result.correctAnswer, explanation: result.explanation };
      setRecords((current) => ({ ...current, [position]: { answer: trimmed, feedback: nextFeedback } }));
      recordInk(question.conceptIds || [], result.isCorrect ? FIRST_TRY_CREDIT : 0);
      // A missed question comes back once, at the end of the session.
      if (!result.isCorrect) {
        updateQueue((current) => [...current, { questionIndex: entry.questionIndex, isRetry: true }]);
        requestRepairIfStruggling();
      }
    } catch (error) {
      Alert.alert('Answer could not be checked', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Asked once, as soon as the second first-try miss lands, so the extra questions are
  // usually ready before the learner taps Continue. A failed request just ends as planned.
  const requestRepairIfStruggling = () => {
    if (extendRequest.current) return;
    const earlierMisses = Object.entries(records).filter(
      ([turn, value]) => !queue[Number(turn)]?.isRetry && !value.feedback.isCorrect,
    ).length;
    if (earlierMisses + 1 < STRUGGLE_MISSES) return;

    extendRequest.current = extendSession(EXTEND_COUNT).then(({ firstIndex, added }) => {
      if (added > 0) {
        const turns = Array.from({ length: added }, (_, offset) => ({
          questionIndex: firstIndex + offset,
          isRetry: false,
        }));
        updateQueue((current) => insertRepairTurns(current, livePosition.current, turns));
      }
      return added;
    });
  };

  const continueSession = async () => {
    if (!isLastTurn) {
      setPosition((current) => current + 1);
      setAnswer('');
      return;
    }

    setSubmitting(true);
    // Repair questions still on their way land after this turn: go to them instead of finishing.
    if (extendRequest.current) await extendRequest.current;
    if (queueRef.current.length - 1 > position) {
      setSubmitting(false);
      setPosition((current) => current + 1);
      setAnswer('');
      return;
    }

    const completed = await completeSession();
    setSubmitting(false);
    if (completed) router.replace('/result');
    else Alert.alert('Session could not finish', 'Your answers are saved. Please try again.');
  };

  const goPrevious = () => {
    const target = shownPosition - 1;
    if (target >= 0) setViewPosition(target);
  };

  const returnToCurrent = () => setViewPosition(null);

  const primaryLabel = isReviewingPast
    ? 'Back to your question'
    : feedback
      ? isLastTurn ? 'See your result' : 'Continue'
      : 'Check answer';
  const primaryDisabled = submitting || (!isReviewingPast && !feedback && !answer.trim());
  const onPrimary = isReviewingPast ? returnToCurrent : feedback ? continueSession : checkAnswer;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Leave session"
          onPress={() => router.replace('/')}
          hitSlop={10}
          style={styles.topBarSide}>
          <Ionicons name="close" size={26} color={palette.muted} />
        </Pressable>
        <Text accessibilityRole="header" numberOfLines={1} style={styles.unitTitle}>{title}</Text>
        <View style={styles.topBarSide} />
      </View>
      {hubItems.length ? (
        <KanaHub items={hubItems} showTesting />
      ) : (
        <QuestionDots queue={queue} records={records} position={shownPosition} />
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={scrollEnabled}
        onLayout={({ nativeEvent }) => setViewportHeight(nativeEvent.layout.height)}
        onContentSizeChange={(_, height) => setContentHeight(height)}>
        <View style={styles.stage}>
          {entry.isRetry ? <Text style={styles.secondLook}>One more look</Text> : null}
          <Text style={styles.prompt}>{question.questionText}</Text>
          {audioText ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Hear it again"
              accessibilityState={{ busy: isSpeaking }}
              onPress={() => playQuestionAudio(audioText)}
              style={({ pressed }) => [styles.hearButton, isSpeaking && styles.hearButtonActive, pressed && { opacity: 0.72 }]}>
              <Ionicons name="volume-high" size={20} color={palette.accent} />
              <Text style={styles.hearButtonText}>{isSpeaking ? 'Playing...' : 'Hear it'}</Text>
            </Pressable>
          ) : null}

          {isChoice ? (
            <View style={styles.options}>
              {options.map((option) => {
                const selected = shownAnswer === option;
                const isRightOption = Boolean(feedback) && normalize(option) === normalize(feedback?.correctAnswer || '');
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled: Boolean(feedback) || isReviewingPast }}
                    disabled={Boolean(feedback) || isReviewingPast}
                    onPress={() => setAnswer(option)}
                    style={[
                      styles.option,
                      selected && styles.selectedOption,
                      isRightOption && styles.rightOption,
                      selected && feedback && !feedback.isCorrect && styles.missedOption,
                    ]}>
                    <Text style={[styles.optionText, selected && styles.selectedOptionText, isRightOption && styles.rightOptionText]}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <TextInput
              accessibilityLabel="Your answer"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!feedback && !isReviewingPast}
              onChangeText={setAnswer}
              placeholder="Your answer"
              placeholderTextColor={palette.muted}
              style={styles.input}
              value={shownAnswer}
            />
          )}

          {feedback ? (
            <View style={styles.feedback}>
              <View style={styles.feedbackHeading}>
                <Ionicons
                  name={feedback.isCorrect ? 'checkmark-circle' : 'leaf-outline'}
                  size={20}
                  color={feedback.isCorrect ? palette.success : palette.accent}
                />
                <Text style={[styles.feedbackTitle, feedback.isCorrect ? styles.correctTitle : styles.missedTitle]}>
                  {feedback.isCorrect ? 'That is correct' : 'Keep this one close'}
                </Text>
              </View>
              {!feedback.isCorrect ? <Text style={styles.feedbackText}>Correct answer: {feedback.correctAnswer}</Text> : null}
              {feedback.explanation ? <Text style={styles.feedbackText}>{feedback.explanation}</Text> : null}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        <View style={styles.actions}>
          {shownPosition > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Show the previous question"
              disabled={submitting}
              onPress={goPrevious}
              style={({ pressed }) => [styles.previousButton, pressed && styles.pressed]}>
              <Ionicons name="arrow-back" size={18} color={palette.ink} />
              <Text style={styles.previousButtonText}>Previous</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            disabled={primaryDisabled}
            onPress={onPrimary}
            style={({ pressed }) => [styles.primaryButton, primaryDisabled && styles.disabledButton, pressed && styles.pressed]}>
            {submitting ? <ActivityIndicator color={palette.white} /> : (
              <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.canvas },
  topBar: { minHeight: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  topBarSide: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  unitTitle: { flex: 1, color: palette.accent, fontFamily: type.display, fontSize: 13, fontWeight: '700', letterSpacing: 1.6, textAlign: 'center', textTransform: 'uppercase' },
  dots: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.line },
  currentDot: { width: 20, backgroundColor: palette.accent },
  correctDot: { backgroundColor: palette.success },
  missedDot: { backgroundColor: palette.accentSoft, borderWidth: 1, borderColor: palette.accent },
  scroll: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 6, paddingBottom: 16 },
  stage: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 580,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    ...shadow,
  },
  secondLook: { color: palette.muted, fontSize: 13, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  prompt: { color: palette.ink, fontFamily: type.display, fontSize: 29, lineHeight: 38, textAlign: 'center' },
  // Same outlined style as the listen card's Hear button, so the filled button stays the only loud one.
  hearButton: {
    alignSelf: 'center',
    minHeight: 46,
    marginTop: 14,
    paddingHorizontal: 22,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hearButtonActive: { borderColor: palette.accent, backgroundColor: palette.accentSoft },
  hearButtonText: { color: palette.accent, fontSize: 15, fontWeight: '800' },
  options: { gap: 12, marginTop: 26 },
  option: { minHeight: 56, borderRadius: 8, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.canvas, justifyContent: 'center', paddingHorizontal: 18 },
  selectedOption: { borderColor: palette.accent, backgroundColor: palette.accentSoft },
  rightOption: { borderColor: palette.success, backgroundColor: palette.successSoft },
  missedOption: { borderColor: palette.accent, backgroundColor: palette.accentSoft },
  optionText: { color: palette.ink, fontSize: 17, fontWeight: '700' },
  selectedOptionText: { color: palette.accent },
  rightOptionText: { color: palette.success },
  input: { minHeight: 58, marginTop: 26, borderRadius: 8, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.canvas, color: palette.ink, fontSize: 17, paddingHorizontal: 17 },
  feedback: { marginTop: 20, gap: 4 },
  feedbackHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  feedbackTitle: { fontSize: 16, fontWeight: '800' },
  correctTitle: { color: palette.success },
  missedTitle: { color: palette.accent },
  feedbackText: { color: palette.muted, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  actionBar: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 12, backgroundColor: palette.surface, borderTopWidth: 1, borderTopColor: palette.line },
  actions: { width: '100%', maxWidth: 580, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 10 },
  previousButton: { width: 112, flexShrink: 0, minHeight: 54, borderWidth: 1, borderColor: palette.line, borderRadius: 8, backgroundColor: palette.surface, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' },
  previousButtonText: { color: palette.ink, fontSize: 14, fontWeight: '800' },
  primaryButton: { flex: 1, minWidth: 0, minHeight: 54, borderRadius: 8, backgroundColor: palette.accent, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: palette.white, fontSize: 16, fontWeight: '800' },
  disabledButton: { opacity: 0.45 },
  pressed: { opacity: 0.82 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  title: { color: palette.ink, fontFamily: type.display, fontSize: 25, marginBottom: 20 },
});
