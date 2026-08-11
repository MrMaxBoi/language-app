import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as Speech from 'expo-speech';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CharacterTraceStep } from '@/components/lesson/character-trace-step';
import { palette, shadow, type } from '@/constants/kokoro-theme';
import { getLessonContent } from '@/services/kokoro-api';
import { useSessionStore } from '@/store/session-store';
import type { LessonContent, LessonContentStep, LessonKanaItem } from '@/types/learning';

const LESSON_ILLUSTRATIONS: Record<string, number> = {
  'vowels-ai-love': require('../../assets/lesson-examples/vowels-ai-love.png'),
  'vowels-ie-house': require('../../assets/lesson-examples/vowels-ie-house.png'),
  'vowels-ue-above': require('../../assets/lesson-examples/vowels-ue-above.png'),
  'vowels-e-picture': require('../../assets/lesson-examples/vowels-e-picture.png'),
  'vowels-ao-blue': require('../../assets/lesson-examples/vowels-ao-blue.png'),
};

function KanaCard({
  item,
  isPlaying,
  playbackBusy,
  onPlay,
}: {
  item: LessonKanaItem;
  isPlaying: boolean;
  playbackBusy: boolean;
  onPlay: (item: LessonKanaItem) => void;
}) {
  return (
    <View style={styles.kanaCard}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Hear ${item.romanization}`}
        accessibilityState={{ busy: isPlaying, disabled: playbackBusy && !isPlaying }}
        disabled={playbackBusy}
        onPress={() => onPlay(item)}
        style={({ pressed }) => [styles.soundButton, isPlaying && styles.activeSoundButton, pressed && styles.pressed]}>
        {isPlaying
          ? <ActivityIndicator size="small" color={palette.white} />
          : <Ionicons name="volume-medium" size={20} color={palette.accent} />}
      </Pressable>
      <Text style={styles.kanaCharacter}>{item.character}</Text>
      <Text style={styles.romanization}>{item.romanization}</Text>
      <Text style={styles.pronunciation}>{item.pronunciationHint}</Text>
      <View style={styles.exampleLine}>
        <Text style={styles.exampleJapanese}>{item.example.japanese}</Text>
        <Text style={styles.exampleText}>{item.example.reading} · {item.example.meaning}</Text>
      </View>
    </View>
  );
}

function IntroductionStep({
  step,
}: {
  step: Extract<LessonContentStep, { type: 'introduction' }>;
}) {
  return (
    <View>
      <Text style={styles.stepTitle}>{step.title}</Text>
      <Text style={styles.stepBody}>{step.body}</Text>
      <View style={styles.vowelPreview}>
        {['あ', 'い', 'う', 'え', 'お'].map((character) => (
          <Text key={character} style={styles.vowelPreviewCharacter}>{character}</Text>
        ))}
      </View>
      {step.callout ? <Text style={styles.callout}>{step.callout}</Text> : null}
    </View>
  );
}

function CharacterFocusStep({
  step,
  isPlaying,
  playbackBusy,
  onPlay,
}: {
  step: Extract<LessonContentStep, { type: 'character_focus' }>;
  isPlaying: boolean;
  playbackBusy: boolean;
  onPlay: () => void;
}) {
  return (
    <View style={styles.focusStep}>
      <Text style={styles.stepTitle}>{step.title}</Text>
      <View style={styles.focusCharacterWrap}>
        <Text style={styles.focusCharacter}>{step.character}</Text>
        <Text style={styles.focusRomanization}>{step.romanization}</Text>
      </View>
      <View style={styles.soundCuePanel}>
        <Text style={styles.soundCueLabel}>SAY IT LIKE</Text>
        <Text style={styles.soundCue}>“{step.soundCue}”</Text>
        <Text style={styles.soundNote}>{step.soundNote}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Hear ${step.romanization}`}
        accessibilityState={{ busy: isPlaying, disabled: playbackBusy && !isPlaying }}
        disabled={playbackBusy}
        onPress={onPlay}
        style={({ pressed }) => [styles.focusSoundButton, isPlaying && styles.activeFocusSoundButton, pressed && styles.pressed]}>
        {isPlaying
          ? <ActivityIndicator size="small" color={palette.white} />
          : <Ionicons name="volume-high" size={22} color={palette.white} />}
        <Text style={styles.focusSoundButtonText}>{isPlaying ? 'Playing...' : `Hear ${step.character}`}</Text>
      </Pressable>
    </View>
  );
}

function WordExampleStep({
  step,
  isPlaying,
  playbackBusy,
  onPlay,
}: {
  step: Extract<LessonContentStep, { type: 'word_example' }>;
  isPlaying: boolean;
  playbackBusy: boolean;
  onPlay: () => void;
}) {
  const illustration = LESSON_ILLUSTRATIONS[step.illustrationKey];

  return (
    <View>
      <Text style={styles.stepTitle}>{step.title}</Text>
      <Text style={styles.stepBody}>{step.body}</Text>
      <View style={styles.illustrationFrame}>
        {illustration ? (
          <Image
            source={illustration}
            accessibilityLabel={step.illustrationAlt}
            contentFit="contain"
            transition={180}
            style={styles.exampleIllustration}
          />
        ) : (
          <View style={styles.illustrationFallback}>
            <Ionicons name="image-outline" size={34} color={palette.muted} />
          </View>
        )}
      </View>
      <View style={styles.wordHeading}>
        <View>
          <Text style={styles.exampleWord}>{step.japanese}</Text>
          <Text style={styles.exampleMeaning}>{step.meaning}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Hear ${step.japanese}`}
          accessibilityState={{ busy: isPlaying, disabled: playbackBusy && !isPlaying }}
          disabled={playbackBusy}
          onPress={onPlay}
          style={({ pressed }) => [styles.wordSoundButton, isPlaying && styles.activeWordSoundButton, pressed && styles.pressed]}>
          {isPlaying
            ? <ActivityIndicator size="small" color={palette.white} />
            : <Ionicons name="volume-medium" size={21} color={isPlaying ? palette.white : palette.accent} />}
        </Pressable>
      </View>
      <Text style={styles.breakdownLabel}>SOUND BY SOUND</Text>
      <View style={styles.segmentRow}>
        {step.segments.map((segment, index) => (
          <View key={`${segment.character}-${index}`} style={[styles.segmentChip, segment.isTarget && styles.targetSegmentChip]}>
            <Text style={[styles.segmentCharacter, segment.isTarget && styles.targetSegmentText]}>{segment.character}</Text>
            <Text style={[styles.segmentReading, segment.isTarget && styles.targetSegmentText]}>{segment.romanization}</Text>
          </View>
        ))}
      </View>
      {step.note ? <Text style={styles.exampleNote}>{step.note}</Text> : null}
    </View>
  );
}

function WordContextStep({
  step,
  speakingId,
  onPlayWord,
  onPlaySegment,
}: {
  step: Extract<LessonContentStep, { type: 'word_context' }>;
  speakingId: string | null;
  onPlayWord: () => void;
  onPlaySegment: (index: number, character: string) => void;
}) {
  const illustration = LESSON_ILLUSTRATIONS[step.illustrationKey];
  const wordPlaybackId = `${step.id}-word`;

  return (
    <View style={styles.contextStep}>
      <View style={styles.contextIllustrationWrap}>
        {illustration ? (
          <Image
            source={illustration}
            accessibilityLabel={step.illustrationAlt}
            contentFit="contain"
            transition={180}
            style={styles.contextIllustration}
          />
        ) : (
          <View style={styles.illustrationFallback}>
            <Ionicons name="image-outline" size={34} color={palette.muted} />
          </View>
        )}
      </View>

      <View style={styles.contextWordRow}>
        <View style={styles.contextWordCopy}>
          <Text style={styles.contextWord}>{step.japanese}</Text>
          <Text style={styles.contextMeaning}>{step.meaning}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Hear ${step.japanese}`}
          disabled={Boolean(speakingId)}
          onPress={onPlayWord}
          style={({ pressed }) => [
            styles.contextSoundButton,
            speakingId === wordPlaybackId && styles.activeWordSoundButton,
            pressed && styles.pressed,
          ]}>
          {speakingId === wordPlaybackId
            ? <ActivityIndicator size="small" color={palette.white} />
            : <Ionicons name="volume-high" size={23} color={palette.accent} />}
        </Pressable>
      </View>

      <View style={styles.contextSegments}>
        {step.segments.map((segment, index) => {
          const playbackId = `${step.id}-segment-${index}`;
          const isPlaying = speakingId === playbackId;
          return (
            <Pressable
              key={`${segment.character}-${index}`}
              accessibilityRole="button"
              accessibilityLabel={`Hear ${segment.romanization}`}
              disabled={Boolean(speakingId)}
              onPress={() => onPlaySegment(index, segment.character)}
              style={({ pressed }) => [
                styles.contextSegment,
                isPlaying && styles.activeContextSegment,
                pressed && styles.pressed,
              ]}>
              <Text style={[styles.contextSegmentCharacter, isPlaying && styles.activeContextSegmentText]}>
                {segment.character}
              </Text>
              <Text style={[styles.contextSegmentReading, isPlaying && styles.activeContextSegmentText]}>
                {segment.romanization}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function KanaGroupStep({
  step,
  speakingId,
  onPlayKana,
}: {
  step: Extract<LessonContentStep, { type: 'kana_group' }>;
  speakingId: string | null;
  onPlayKana: (item: LessonKanaItem) => void;
}) {
  return (
    <View>
      <Text style={styles.stepTitle}>{step.title}</Text>
      <Text style={styles.stepBody}>{step.body}</Text>
      <View style={styles.kanaGrid}>
        {step.items.map((item) => (
          <KanaCard
            key={item.conceptId}
            item={item}
            isPlaying={speakingId === item.conceptId}
            playbackBusy={Boolean(speakingId)}
            onPlay={onPlayKana}
          />
        ))}
      </View>
      {step.callout ? <Text style={styles.callout}>{step.callout}</Text> : null}
    </View>
  );
}

function GuidedChoiceStep({
  step,
  selectedAnswer,
  onSelect,
}: {
  step: Extract<LessonContentStep, { type: 'guided_choice' }>;
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
}) {
  const isCorrect = selectedAnswer === step.correctAnswer;

  return (
    <View>
      <Text style={styles.guidedEyebrow}>QUICK CHECK</Text>
      <Text style={styles.stepTitle}>{step.prompt}</Text>
      <Text style={styles.guidedNote}>This is guided practice. It will not affect your progress.</Text>
      <View style={styles.choiceList}>
        {step.choices.map((choice) => {
          const isSelected = selectedAnswer === choice.text;
          const showCorrect = isSelected && choice.isCorrect;
          const showIncorrect = isSelected && !choice.isCorrect;
          return (
            <Pressable
              key={choice.text}
              accessibilityRole="button"
              onPress={() => onSelect(choice.text)}
              style={({ pressed }) => [
                styles.choice,
                showCorrect && styles.correctChoice,
                showIncorrect && styles.incorrectChoice,
                pressed && styles.pressed,
              ]}>
              <Text style={[styles.choiceText, showCorrect && styles.correctChoiceText]}>{choice.text}</Text>
              {showCorrect ? <Ionicons name="checkmark-circle" size={22} color={palette.success} /> : null}
              {showIncorrect ? <Ionicons name="refresh-circle" size={22} color={palette.danger} /> : null}
            </Pressable>
          );
        })}
      </View>
      {selectedAnswer ? (
        <View style={[styles.feedback, isCorrect ? styles.correctFeedback : styles.incorrectFeedback]}>
          <Text style={styles.feedbackTitle}>{isCorrect ? 'That’s it' : 'Take another look'}</Text>
          <Text style={styles.feedbackText}>{isCorrect ? step.explanation : step.hint}</Text>
        </View>
      ) : null}
    </View>
  );
}

function RecapStep({ step, practice, speakingId, onPlay }: {
  step: Extract<LessonContentStep, { type: 'recap' }>;
  practice: LessonContent['practice'];
  speakingId: string | null;
  onPlay: (character: string) => void;
}) {
  return (
    <View>
      <View style={styles.recapMark}>
        <Ionicons name="sparkles" size={28} color={palette.gold} />
      </View>
      <Text style={styles.stepTitle}>{step.title}</Text>
      {step.body ? <Text style={styles.stepBody}>{step.body}</Text> : null}
      <View style={styles.recapRow}>
        {step.items.map((item) => (
          <Pressable
            key={item.character}
            accessibilityRole="button"
            accessibilityLabel={`Hear ${item.romanization}`}
            disabled={Boolean(speakingId)}
            onPress={() => onPlay(item.character)}
            style={({ pressed }) => [
              styles.recapItem,
              speakingId === `recap-${item.character}` && styles.activeRecapItem,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.recapCharacter}>{item.character}</Text>
            <Text style={styles.recapReading}>{item.romanization}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.practicePanel}>
        <Text style={styles.practiceTitle}>{practice.title}</Text>
        <Text style={styles.practiceText}>{practice.description}</Text>
        <View style={styles.practiceMeta}>
          <Ionicons name="help-circle-outline" size={17} color={palette.accent} />
          <Text style={styles.practiceMetaText}>{practice.questionCount} practice questions</Text>
        </View>
      </View>
    </View>
  );
}

export default function LessonScreen() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const [content, setContent] = useState<LessonContent | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [guidedAnswers, setGuidedAnswers] = useState<Record<string, string>>({});
  const [completedTraceSteps, setCompletedTraceSteps] = useState<Record<string, boolean>>({});
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const speechRequestRef = useRef(0);
  const lessonScrollRef = useRef<ScrollView>(null);
  const stepOpacity = useRef(new Animated.Value(1)).current;
  const stepOffset = useRef(new Animated.Value(0)).current;
  const { isStarting, startLesson } = useSessionStore();

  useEffect(() => {
    let active = true;
    setLoading(true);
    getLessonContent(lessonId)
      .then((lessonContent) => {
        if (active) setContent(lessonContent);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not open this lesson.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      speechRequestRef.current += 1;
      void Speech.stop();
    };
  }, [lessonId]);

  useEffect(() => {
    lessonScrollRef.current?.scrollTo({ y: 0, animated: false });
    stepOpacity.setValue(0);
    stepOffset.setValue(10);
    Animated.parallel([
      Animated.timing(stepOpacity, { toValue: 1, duration: 180, useNativeDriver: false }),
      Animated.timing(stepOffset, { toValue: 0, duration: 180, useNativeDriver: false }),
    ]).start();
  }, [stepIndex, stepOffset, stepOpacity]);

  const step = content?.steps[stepIndex] || null;
  const selectedAnswer = step?.type === 'guided_choice' ? guidedAnswers[step.id] || null : null;
  const isLastStep = Boolean(content && stepIndex === content.steps.length - 1);
  const canContinue = step?.type === 'guided_choice'
    ? selectedAnswer === step.correctAnswer
    : step?.type === 'character_trace'
      ? Boolean(completedTraceSteps[step.id])
      : true;
  const progress = useMemo(
    () => content ? Math.round(((stepIndex + 1) / content.steps.length) * 100) : 0,
    [content, stepIndex],
  );

  const playSpeech = async (playbackId: string, text: string) => {
    void Haptics.selectionAsync().catch(() => undefined);
    const requestId = speechRequestRef.current + 1;
    speechRequestRef.current = requestId;
    setSpeakingId(playbackId);

    try {
      if (await Speech.isSpeakingAsync()) await Speech.stop();
      if (speechRequestRef.current !== requestId) return;

      const finishPlayback = () => {
        if (speechRequestRef.current === requestId) setSpeakingId(null);
      };
      const playbackFallback = setTimeout(finishPlayback, 4000);
      const finishWithCleanup = () => {
        clearTimeout(playbackFallback);
        finishPlayback();
      };

      Speech.speak(text, {
        language: 'ja-JP',
        rate: 0.78,
        pitch: 1,
        onDone: finishWithCleanup,
        onStopped: finishWithCleanup,
        onError: finishWithCleanup,
      });
    } catch {
      if (speechRequestRef.current === requestId) setSpeakingId(null);
    }
  };

  const stopSpeech = async () => {
    speechRequestRef.current += 1;
    setSpeakingId(null);
    await Speech.stop();
  };

  const moveForward = async () => {
    if (!content || !step) return;
    if (!isLastStep) {
      await stopSpeech();
      void Haptics.selectionAsync().catch(() => undefined);
      setStepIndex((index) => index + 1);
      return;
    }

    const started = await startLesson(content.lessonId);
    if (started) router.replace('/session');
    else Alert.alert('Practice could not start', useSessionStore.getState().startError || 'Please try again.');
  };

  const moveBack = async () => {
    if (stepIndex === 0) return;
    await stopSpeech();
    void Haptics.selectionAsync().catch(() => undefined);
    setStepIndex((index) => Math.max(0, index - 1));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={palette.accent} />
          <Text style={styles.loadingText}>Preparing your lesson</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !content || !step) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centerState}>
          <Ionicons name="book-outline" size={35} color={palette.accent} />
          <Text style={styles.errorTitle}>This lesson could not open</Text>
          <Text style={styles.errorText}>{error || 'The lesson content is unavailable.'}</Text>
          <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Return to map</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close lesson" hitSlop={10} onPress={() => router.back()}>
          <Ionicons name="close" size={26} color={palette.muted} />
        </Pressable>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.stepCount}>{stepIndex + 1}/{content.steps.length}</Text>
      </View>

      <ScrollView
        ref={lessonScrollRef}
        style={styles.lessonScroll}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={step.type !== 'character_trace'}
        showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.contentColumn,
            { opacity: stepOpacity, transform: [{ translateY: stepOffset }] },
          ]}>
          <Text style={styles.lessonEyebrow}>{content.eyebrow}</Text>
          {step.type === 'introduction' ? <IntroductionStep step={step} /> : null}
          {step.type === 'character_focus' ? (
            <CharacterFocusStep
              step={step}
              isPlaying={speakingId === step.id}
              playbackBusy={Boolean(speakingId)}
              onPlay={() => playSpeech(step.id, step.audioText)}
            />
          ) : null}
          {step.type === 'character_trace' ? (
            <CharacterTraceStep
              key={step.id}
              step={step}
              completedInitially={Boolean(completedTraceSteps[step.id])}
              onCompletionChange={(completed) => setCompletedTraceSteps((current) => ({
                ...current,
                [step.id]: completed,
              }))}
            />
          ) : null}
          {step.type === 'word_example' ? (
            <WordExampleStep
              step={step}
              isPlaying={speakingId === step.id}
              playbackBusy={Boolean(speakingId)}
              onPlay={() => playSpeech(step.id, step.audioText)}
            />
          ) : null}
          {step.type === 'word_context' ? (
            <WordContextStep
              step={step}
              speakingId={speakingId}
              onPlayWord={() => playSpeech(`${step.id}-word`, step.audioText)}
              onPlaySegment={(index, character) => playSpeech(`${step.id}-segment-${index}`, character)}
            />
          ) : null}
          {step.type === 'kana_group' ? (
            <KanaGroupStep
              step={step}
              speakingId={speakingId}
              onPlayKana={(item) => playSpeech(item.conceptId, item.character)}
            />
          ) : null}
          {step.type === 'guided_choice' ? (
            <GuidedChoiceStep
              step={step}
              selectedAnswer={selectedAnswer}
              onSelect={(answer) => setGuidedAnswers((current) => ({ ...current, [step.id]: answer }))}
            />
          ) : null}
          {step.type === 'recap' ? (
            <RecapStep
              step={step}
              practice={content.practice}
              speakingId={speakingId}
              onPlay={(character) => playSpeech(`recap-${character}`, character)}
            />
          ) : null}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerActions}>
          {stepIndex > 0 ? (
            <Pressable
              accessibilityRole="button"
              disabled={isStarting}
              onPress={moveBack}
              style={({ pressed }) => [styles.previousButton, pressed && styles.pressed]}>
              <Ionicons name="arrow-back" size={18} color={palette.ink} />
              <Text style={styles.previousButtonText}>Previous</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            disabled={!canContinue || isStarting}
            onPress={moveForward}
            style={({ pressed }) => [
              styles.primaryButton,
              (!canContinue || isStarting) && styles.disabledButton,
              pressed && canContinue && styles.pressed,
            ]}>
            <Text style={styles.primaryButtonText}>
              {isStarting ? 'Preparing practice...' : isLastStep ? content.practice.ctaLabel : 'Continue'}
            </Text>
            {!isStarting ? <Ionicons name="arrow-forward" size={19} color={palette.white} /> : null}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.canvas },
  header: { minHeight: 58, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  lessonScroll: { flex: 1 },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: palette.line, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: palette.accent },
  stepCount: { minWidth: 30, color: palette.muted, fontSize: 11, fontWeight: '800', textAlign: 'right' },
  scrollContent: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 32 },
  contentColumn: { width: '100%', maxWidth: 580, alignSelf: 'center' },
  lessonEyebrow: { color: palette.accent, fontSize: 10, fontWeight: '900', letterSpacing: 0, marginBottom: 10 },
  introMark: { width: 84, height: 84, borderRadius: 42, backgroundColor: palette.accentSoft, alignItems: 'center', justifyContent: 'center', marginVertical: 18 },
  introKana: { color: palette.accent, fontFamily: type.display, fontSize: 46 },
  stepTitle: { color: palette.ink, fontFamily: type.display, fontSize: 31, lineHeight: 39 },
  stepBody: { color: palette.muted, fontFamily: type.body, fontSize: 16, lineHeight: 25, marginTop: 11 },
  vowelPreview: { flexDirection: 'row', justifyContent: 'space-between', gap: 7, marginTop: 30 },
  vowelPreviewCharacter: { flex: 1, minWidth: 0, color: palette.ink, fontFamily: type.display, fontSize: 34, textAlign: 'center', paddingVertical: 15, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: 8 },
  objectiveList: { gap: 13, marginTop: 24 },
  objectiveRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  objectiveText: { flex: 1, color: palette.ink, fontSize: 14, lineHeight: 21 },
  callout: { color: palette.ink, fontSize: 13, lineHeight: 20, backgroundColor: palette.goldSoft, borderLeftWidth: 3, borderLeftColor: palette.gold, borderRadius: 6, padding: 14, marginTop: 20 },
  focusStep: { alignItems: 'stretch' },
  focusCharacterWrap: { alignItems: 'center', justifyContent: 'center', minHeight: 210, marginTop: 12 },
  focusCharacter: { color: palette.ink, fontFamily: type.display, fontSize: 150, lineHeight: 174 },
  focusRomanization: { color: palette.accent, fontSize: 24, fontWeight: '900', marginTop: -12 },
  soundCuePanel: { alignItems: 'center', backgroundColor: palette.accentSoft, borderWidth: 1, borderColor: palette.accent, borderRadius: 8, paddingVertical: 17, paddingHorizontal: 18 },
  soundCueLabel: { color: palette.accent, fontSize: 10, fontWeight: '900' },
  soundCue: { color: palette.accent, fontFamily: type.display, fontSize: 39, lineHeight: 48, marginTop: 2 },
  soundNote: { color: palette.ink, fontSize: 13, fontWeight: '700', marginTop: 3 },
  focusSoundButton: { minHeight: 56, borderRadius: 8, backgroundColor: palette.accent, marginTop: 16, flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center' },
  activeFocusSoundButton: { backgroundColor: palette.ink },
  focusSoundButtonText: { color: palette.white, fontSize: 15, fontWeight: '900' },
  illustrationFrame: { width: '100%', aspectRatio: 1.45, overflow: 'hidden', borderWidth: 1, borderColor: palette.line, borderRadius: 8, backgroundColor: palette.surface, marginTop: 20, ...shadow },
  exampleIllustration: { width: '100%', height: '100%' },
  illustrationFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  wordHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 18 },
  exampleWord: { color: palette.ink, fontFamily: type.display, fontSize: 48, lineHeight: 56 },
  exampleMeaning: { color: palette.accent, fontSize: 15, fontWeight: '900', textTransform: 'capitalize', marginTop: 1 },
  wordSoundButton: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: palette.accent, backgroundColor: palette.accentSoft, alignItems: 'center', justifyContent: 'center' },
  activeWordSoundButton: { backgroundColor: palette.accent },
  breakdownLabel: { color: palette.muted, fontSize: 10, fontWeight: '900', marginTop: 19, marginBottom: 8 },
  segmentRow: { flexDirection: 'row', gap: 9 },
  segmentChip: { minWidth: 70, minHeight: 66, borderWidth: 1, borderColor: palette.line, borderRadius: 8, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 15, paddingVertical: 8 },
  targetSegmentChip: { borderColor: palette.accent, backgroundColor: palette.accentSoft },
  segmentCharacter: { color: palette.ink, fontSize: 25, fontWeight: '700' },
  segmentReading: { color: palette.muted, fontSize: 11, fontWeight: '800', marginTop: 1 },
  targetSegmentText: { color: palette.accent },
  exampleNote: { color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 11 },
  contextStep: { alignItems: 'stretch', paddingTop: 4 },
  contextIllustrationWrap: { width: '76%', maxWidth: 330, aspectRatio: 1.28, alignSelf: 'center', overflow: 'hidden', justifyContent: 'center', marginTop: 8 },
  contextIllustration: { width: '100%', height: '100%' },
  contextWordRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 18 },
  contextWordCopy: { alignItems: 'center' },
  contextWord: { color: palette.ink, fontFamily: type.display, fontSize: 56, lineHeight: 64 },
  contextMeaning: { color: palette.accent, fontSize: 16, fontWeight: '900', textTransform: 'capitalize', marginTop: 1 },
  contextSoundButton: { width: 54, height: 54, borderRadius: 27, borderWidth: 1, borderColor: palette.accent, backgroundColor: palette.accentSoft, alignItems: 'center', justifyContent: 'center' },
  contextSegments: { flexDirection: 'row', alignSelf: 'center', gap: 10, marginTop: 22 },
  contextSegment: { width: 82, minHeight: 76, borderWidth: 1, borderColor: palette.line, borderRadius: 8, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' },
  activeContextSegment: { borderColor: palette.accent, backgroundColor: palette.accent },
  contextSegmentCharacter: { color: palette.ink, fontSize: 29, fontWeight: '700' },
  contextSegmentReading: { color: palette.accent, fontSize: 12, fontWeight: '900', marginTop: 2 },
  activeContextSegmentText: { color: palette.white },
  kanaGrid: { gap: 14, marginTop: 22 },
  kanaCard: { position: 'relative', backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: 8, padding: 20, ...shadow },
  soundButton: { position: 'absolute', right: 14, top: 14, width: 40, height: 40, borderRadius: 20, backgroundColor: palette.accentSoft, alignItems: 'center', justifyContent: 'center' },
  activeSoundButton: { backgroundColor: palette.accent },
  kanaCharacter: { color: palette.ink, fontFamily: type.display, fontSize: 68, lineHeight: 78 },
  romanization: { color: palette.accent, fontSize: 19, fontWeight: '900' },
  pronunciation: { color: palette.muted, fontSize: 13, lineHeight: 19, marginTop: 7, paddingRight: 30 },
  exampleLine: { flexDirection: 'row', alignItems: 'baseline', gap: 9, borderTopWidth: 1, borderTopColor: palette.line, marginTop: 14, paddingTop: 12 },
  exampleJapanese: { color: palette.ink, fontSize: 21, fontWeight: '700' },
  exampleText: { flex: 1, color: palette.muted, fontSize: 12 },
  guidedEyebrow: { color: palette.gold, fontSize: 11, fontWeight: '900', marginTop: 18, marginBottom: 8 },
  guidedNote: { color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 9 },
  choiceList: { gap: 11, marginTop: 24 },
  choice: { minHeight: 58, borderWidth: 1, borderColor: palette.line, borderRadius: 8, backgroundColor: palette.surface, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  choiceText: { color: palette.ink, fontSize: 19, fontWeight: '700' },
  correctChoice: { borderColor: palette.success, backgroundColor: palette.successSoft },
  incorrectChoice: { borderColor: palette.danger, backgroundColor: palette.accentSoft },
  correctChoiceText: { color: palette.success },
  feedback: { borderRadius: 8, padding: 15, marginTop: 16 },
  correctFeedback: { backgroundColor: palette.successSoft },
  incorrectFeedback: { backgroundColor: palette.accentSoft },
  feedbackTitle: { color: palette.ink, fontSize: 14, fontWeight: '900' },
  feedbackText: { color: palette.muted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  recapMark: { width: 58, height: 58, borderRadius: 29, backgroundColor: palette.goldSoft, alignItems: 'center', justifyContent: 'center', marginVertical: 18 },
  recapRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginTop: 24 },
  recapItem: { flex: 1, minWidth: 0, alignItems: 'center', backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: 8, paddingVertical: 12 },
  activeRecapItem: { borderColor: palette.accent, backgroundColor: palette.accentSoft },
  recapCharacter: { color: palette.ink, fontSize: 26, fontWeight: '700' },
  recapReading: { color: palette.accent, fontSize: 11, fontWeight: '900', marginTop: 3 },
  practicePanel: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: 8, padding: 18, marginTop: 24 },
  practiceTitle: { color: palette.ink, fontFamily: type.display, fontSize: 19 },
  practiceText: { color: palette.muted, fontSize: 13, lineHeight: 20, marginTop: 7 },
  practiceMeta: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14 },
  practiceMetaText: { color: palette.accent, fontSize: 12, fontWeight: '800' },
  footer: { borderTopWidth: 1, borderTopColor: palette.line, backgroundColor: palette.surface, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 12 },
  footerActions: { width: '100%', maxWidth: 580, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 10 },
  previousButton: { width: 112, flexShrink: 0, minHeight: 54, borderWidth: 1, borderColor: palette.line, borderRadius: 8, backgroundColor: palette.surface, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' },
  previousButtonText: { color: palette.ink, fontSize: 14, fontWeight: '800' },
  primaryButton: { flex: 1, minWidth: 0, minHeight: 54, borderRadius: 8, backgroundColor: palette.accent, flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: palette.white, fontSize: 16, fontWeight: '800', textTransform: 'capitalize' },
  disabledButton: { opacity: 0.42 },
  pressed: { opacity: 0.82 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  loadingText: { color: palette.ink, fontFamily: type.display, fontSize: 20, marginTop: 16 },
  errorTitle: { color: palette.ink, fontFamily: type.display, fontSize: 23, marginTop: 18, textAlign: 'center' },
  errorText: { color: palette.muted, fontSize: 14, lineHeight: 21, marginTop: 8, textAlign: 'center' },
  secondaryButton: { minWidth: 150, minHeight: 48, borderWidth: 1, borderColor: palette.line, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  secondaryButtonText: { color: palette.ink, fontSize: 14, fontWeight: '800' },
});
