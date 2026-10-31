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
  Easing,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CharacterTraceStep, type TraceGuidance } from '@/components/lesson/character-trace-step';
import { KANA_GLYPH_SCALE, KanaPageLayout } from '@/components/lesson/kana-page-layout';
import { KANA_HUB_TILE, KANA_UNLOCK_DARKEN_AT_MS, KanaHub, kanaTileSize, type KanaHubItem } from '@/components/lesson/kana-hub';
import { SceneStep } from '@/components/lesson/scene-step';
import { SynthesisStep } from '@/components/lesson/synthesis-step';
import { palette, shadow, type } from '@/constants/kokoro-theme';
import { getLessonContent } from '@/services/kokoro-api';
import { lessonKana } from '@/store/kana-hub-progress';
import { useSessionStore } from '@/store/session-store';
import type { LessonContent, LessonContentStep, LessonKanaItem } from '@/types/learning';

/**
 * How the stage moves between steps.
 * - fade: the default, for every step that is not inside a kana's deck.
 * - rise: the finished card lifted away; the card behind steps forward and the deck moves up a spot.
 * - return: Previous inside a deck; the card that left comes back down onto the top.
 */
type StageTransition = 'fade' | 'rise' | 'return';

const RISE_MS = 220;
const THROW_ROTATION_DEG = 12;
/**
 * A finished page lifts straight up, shrinks a little and fades away, so the deck thins out by one.
 * It stays centred and the lift stays inside STACK_ROOM.top so the ScrollView never clips it.
 * Previous brings it back down along the same path.
 */
const TUCK_LIFT = 24;
const TUCK_SCALE = 0.93;
const TUCK_OUT_MS = 240;
const TUCK_IN_MS = 320;
/** Previous inside a deck: the top card sinks back into the deck as long as the lift took, so back mirrors forward. */
const SINK_MS = TUCK_OUT_MS;
/** End of a kana unit: the last card shrinks up into its kana-row tile. */
const COLLAPSE_MS = 600;
const FOCUS_FADE_MS = 420;
/** Matches scrollContent.paddingTop, so the collapse can find the pile's position on screen. */
const SCROLL_PADDING_TOP = 6;
/**
 * The cards behind the top card are the kana's pages still to come, so the deck counts down: one
 * card behind for each page left, drawn up to MAX_CARDS_BEHIND. Slot 0 sits directly behind the
 * top card, tilted slightly left; slot 1 sits deeper, tilted slightly right. They are absolutely
 * positioned over the same box as the top card, so they render the same on iOS, Android and web.
 */
type StackLayer = { x: number; y: number; rotateDeg: number; color: string };
// A 1.5deg tilt moves a tall card's corners sideways by about 7px, which STACK_ROOM.side covers.
const STACK_SLOTS: readonly StackLayer[] = [
  { x: 0, y: -10, rotateDeg: -1.5, color: '#F4EDE0' },
  { x: 0, y: -19, rotateDeg: 1.5, color: '#ECE3D3' },
];
/** A third card would not fit in STACK_ROOM.top without shrinking the card; longer units still count down. */
const MAX_CARDS_BEHIND = STACK_SLOTS.length;
/** Room kept around the top card on every step so the deck's edges fit and the card never resizes. */
const STACK_ROOM = { top: 28, side: 12, bottom: 10 };

/**
 * The first trace of a kana in this lesson gets full guides; a later trace of the same kana
 * gets only its faint shape, so support fades as the learner repeats it.
 */
function traceGuidance(steps: LessonContentStep[], index: number): TraceGuidance {
  const current = steps[index];
  if (current?.type !== 'character_trace') return 'full';
  const tracedBefore = steps
    .slice(0, index)
    .some((earlier) => earlier.type === 'character_trace' && earlier.tracingKey === current.tracingKey);
  return tracedBefore ? 'shape' : 'full';
}

/** The kana a step teaches, when it is one of a kana's own pages (listen or trace). */
function kanaPageCharacter(step: LessonContentStep | undefined) {
  return step?.type === 'character_focus' || step?.type === 'character_trace' ? step.character : null;
}

/** Two steps share a deck when both are pages of the same kana and sit next to each other. */
function sameKanaUnit(steps: LessonContentStep[], a: number, b: number) {
  const first = kanaPageCharacter(steps[a]);
  return first !== null && first === kanaPageCharacter(steps[b]);
}

/** How many pages of this kana come after the current one. */
function pagesLeftInUnit(steps: LessonContentStep[], index: number) {
  let left = 0;
  while (sameKanaUnit(steps, index + left, index + left + 1)) left += 1;
  return left;
}

/** The last page of a kana's unit: it collapses into the kana-row tile on Continue. */
function endsKanaUnit(steps: LessonContentStep[], index: number) {
  return kanaPageCharacter(steps[index]) !== null
    && index < steps.length - 1
    && pagesLeftInUnit(steps, index) === 0;
}

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
  speakingId,
  onPlayBeat,
}: {
  step: Extract<LessonContentStep, { type: 'introduction' }>;
  speakingId: string | null;
  onPlayBeat: (index: number, audioText: string) => void;
}) {
  return (
    <View style={styles.introductionStep}>
      <Text style={styles.stepTitle}>{step.title}</Text>
      {step.statements?.length ? (
        <View style={styles.introductionSequence}>
          <Text style={styles.introductionLead}>{step.body}</Text>
          {step.statements.map((statement) => (
            <Text key={statement} style={styles.introductionStatement}>{statement}</Text>
          ))}
          {step.callout ? <Text style={styles.introductionGoal}>{step.callout}</Text> : null}
        </View>
      ) : (
        <>
          <Text style={styles.stepBody}>{step.body}</Text>
          {step.callout ? <Text style={styles.callout}>{step.callout}</Text> : null}
        </>
      )}
      {step.beats?.length ? (
        <View style={styles.beatRow}>
          {step.beats.map((beat, index) => {
            const isPlaying = speakingId === `${step.id}-beat-${index}`;
            return (
              <Pressable
                key={`${beat.label}-${index}`}
                accessibilityRole="button"
                accessibilityLabel={`Hear ${beat.reading}`}
                disabled={Boolean(speakingId)}
                onPress={() => onPlayBeat(index, beat.audioText)}
                style={({ pressed }) => [styles.beat, isPlaying && styles.activeBeat, pressed && styles.pressed]}>
                <Text style={[styles.beatLabel, isPlaying && styles.activeBeatText]}>{beat.label}</Text>
                <Text style={[styles.beatReading, isPlaying && styles.activeBeatText]}>{beat.reading}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
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
  // Same layout as the trace page: the kana sits in the box where the learner will trace it next.
  return (
    <KanaPageLayout
      title={step.title}
      footer={(
        <View style={styles.focusFooter}>
          <Text style={styles.focusRomanization}>{step.romanization}</Text>
          <Text style={styles.soundCue}>
            Say it like “{step.soundCue}”. <Text style={styles.soundNote}>{step.soundNote}</Text>
          </Text>
          {/* Outlined, so Continue stays the only filled button on screen. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Hear ${step.romanization}`}
            accessibilityState={{ busy: isPlaying, disabled: playbackBusy && !isPlaying }}
            disabled={playbackBusy}
            onPress={onPlay}
            style={({ pressed }) => [styles.focusSoundButton, isPlaying && styles.activeFocusSoundButton, pressed && styles.pressed]}>
            {isPlaying
              ? <ActivityIndicator size="small" color={palette.accent} />
              : <Ionicons name="volume-high" size={20} color={palette.accent} />}
            <Text style={styles.focusSoundButtonText}>{isPlaying ? 'Playing...' : `Hear ${step.character}`}</Text>
          </Pressable>
        </View>
      )}>
      {(side) => (
        <Text
          style={[styles.focusCharacter, { fontSize: Math.round(side * KANA_GLYPH_SCALE), lineHeight: side, height: side }]}>
          {step.character}
        </Text>
      )}
    </KanaPageLayout>
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
  isPlaying,
  playbackBusy,
  onPlay,
  onSelect,
}: {
  step: Extract<LessonContentStep, { type: 'guided_choice' }>;
  selectedAnswer: string | null;
  isPlaying: boolean;
  playbackBusy: boolean;
  onPlay: () => void;
  onSelect: (answer: string) => void;
}) {
  const isCorrect = selectedAnswer === step.correctAnswer;
  const isSoundCheck = Boolean(step.audioText);

  return (
    <View>
      <Text style={styles.stepTitle}>{step.prompt}</Text>
      {isSoundCheck ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Play the sound again"
          accessibilityState={{ busy: isPlaying, disabled: playbackBusy && !isPlaying }}
          disabled={playbackBusy}
          onPress={onPlay}
          style={({ pressed }) => [styles.soundCheckButton, isPlaying && styles.activeFocusSoundButton, pressed && styles.pressed]}>
          {isPlaying
            ? <ActivityIndicator size="small" color={palette.white} />
            : <Ionicons name="volume-high" size={30} color={palette.white} />}
        </Pressable>
      ) : null}
      <View style={[styles.choiceList, isSoundCheck && styles.kanaChoiceList]}>
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
                isSoundCheck && styles.kanaChoice,
                showCorrect && styles.correctChoice,
                showIncorrect && styles.incorrectChoice,
                pressed && styles.pressed,
              ]}>
              <Text style={[styles.choiceText, isSoundCheck && styles.kanaChoiceText, showCorrect && styles.correctChoiceText]}>
                {choice.text}
              </Text>
              {!isSoundCheck && showCorrect ? <Ionicons name="checkmark-circle" size={22} color={palette.success} /> : null}
              {!isSoundCheck && showIncorrect ? <Ionicons name="refresh-circle" size={22} color={palette.danger} /> : null}
            </Pressable>
          );
        })}
      </View>
      {/* One quiet line inside the stage: the explanation when right, the hint when not. */}
      {selectedAnswer ? (
        <Text style={[styles.hintLine, isCorrect && styles.correctHintLine]}>
          {isCorrect ? step.explanation : step.hint}
        </Text>
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
      <Text style={styles.practiceTitle}>{practice.title}</Text>
      <Text style={styles.practiceText}>{practice.description}</Text>
    </View>
  );
}

export default function LessonScreen() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const [content, setContent] = useState<LessonContent | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [scrollViewportHeight, setScrollViewportHeight] = useState(0);
  const [scrollContentHeight, setScrollContentHeight] = useState(0);
  const [guidedAnswers, setGuidedAnswers] = useState<Record<string, string>>({});
  const [completedTraceSteps, setCompletedTraceSteps] = useState<Record<string, boolean>>({});
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const speechRequestRef = useRef(0);
  const lessonScrollRef = useRef<ScrollViewInstance>(null);
  const stepOpacity = useRef(new Animated.Value(1)).current;
  const stepOffset = useRef(new Animated.Value(0)).current;
  const stepX = useRef(new Animated.Value(0)).current;
  const stepTilt = useRef(new Animated.Value(0)).current;
  const stepScale = useRef(new Animated.Value(1)).current;
  // Fades only the card's content, so a tucking card turns into blank paper as it goes behind.
  const contentOpacity = useRef(new Animated.Value(1)).current;
  // Shades the top card toward the back-card tone as it sinks into or rises from the deck, so its
  // paper colour changes smoothly instead of popping when it swaps places with a back card.
  const [stageTint] = useState(() => new Animated.Value(0));
  // 0 = every card behind rests in its own slot; 1 = each sits one slot deeper (the deepest fades out).
  // Forward animates 1 -> 0 so the deck moves up a spot; Previous animates 0 -> 1 before the swap.
  const [deckShift] = useState(() => new Animated.Value(0));
  // 0 = the pile in place; 1 = shrunk up into its kana-row tile.
  const collapse = useRef(new Animated.Value(0)).current;
  // Warm focus tint behind the page, on only while a kana's own unit is open.
  const focus = useRef(new Animated.Value(0)).current;
  const [hubSettle, setHubSettle] = useState<{ key: string; id: number } | null>(null);
  // Positions used to aim the collapse at a tile without measuring the tile itself.
  const [hubY, setHubY] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [pileLayout, setPileLayout] = useState<{ y: number; height: number } | null>(null);
  const transitionRef = useRef<StageTransition>('fade');
  const [isTransitioning, setIsTransitioning] = useState(false);
  // The top card's laid-out size. The stack layers copy it as explicit numbers, because stretching an
  // absolutely positioned view with top/bottom insets collapsed it to its padding height on web.
  const [cardSize, setCardSize] = useState<{ width: number; height: number } | null>(null);
  const reduceMotion = useReducedMotion();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { isStarting, startLesson, beginHub, markMet } = useSessionStore();

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

  // The incoming half of every step change; the outgoing half runs in moveForward and moveBack.
  // A plain effect on purpose: native-driven animations started in a layout effect can run before
  // the card's view is reattached to its values, which left the card frozen in its starting pose.
  // Flashes at the swap are avoided instead by the poses moveForward and sinkCard leave behind.
  useEffect(() => {
    lessonScrollRef.current?.scrollTo({ y: 0, animated: false });
    const transition = reduceMotion ? 'fade' : transitionRef.current;
    transitionRef.current = 'fade';
    const native = { useNativeDriver: true };
    let animation: Animated.CompositeAnimation;
    // A collapsed pile is invisible at this point, so the reset lands unseen.
    collapse.setValue(0);
    deckShift.setValue(0);
    contentOpacity.setValue(1);
    stageTint.setValue(0);

    if (transition === 'rise') {
      // The next page was the card directly behind, so it steps forward from that slot, brightening
      // from the back-card tone, while every card behind it moves up one slot.
      const from = STACK_SLOTS[0];
      stepX.setValue(from.x);
      stepTilt.setValue(from.rotateDeg / THROW_ROTATION_DEG);
      stepOpacity.setValue(1);
      stepOffset.setValue(from.y);
      stepScale.setValue(1);
      contentOpacity.setValue(0);
      stageTint.setValue(1);
      deckShift.setValue(1);
      const ease = Easing.out(Easing.cubic);
      animation = Animated.parallel([
        Animated.timing(stepX, { toValue: 0, duration: RISE_MS, easing: ease, ...native }),
        Animated.timing(stepTilt, { toValue: 0, duration: RISE_MS, easing: ease, ...native }),
        Animated.timing(stepOffset, { toValue: 0, duration: RISE_MS, easing: ease, ...native }),
        Animated.timing(stageTint, { toValue: 0, duration: RISE_MS, ...native }),
        Animated.timing(contentOpacity, { toValue: 1, duration: RISE_MS, ...native }),
        Animated.timing(deckShift, { toValue: 0, duration: TUCK_IN_MS, easing: ease, ...native }),
      ]);
    } else if (transition === 'return') {
      // The reverse of the lift: the page that left comes back down from where it faded out and
      // lands on the deck. The cards behind already moved one slot deeper while the old top sank.
      stepX.setValue(0);
      stepTilt.setValue(0);
      stepOffset.setValue(-TUCK_LIFT);
      stepScale.setValue(TUCK_SCALE);
      stepOpacity.setValue(0);
      contentOpacity.setValue(1);
      const ease = Easing.out(Easing.cubic);
      animation = Animated.parallel([
        Animated.timing(stepOffset, { toValue: 0, duration: TUCK_IN_MS, easing: ease, ...native }),
        Animated.timing(stepScale, { toValue: 1, duration: TUCK_IN_MS, easing: ease, ...native }),
        Animated.timing(stepOpacity, { toValue: 1, duration: TUCK_IN_MS, ...native }),
      ]);
    } else {
      stepX.setValue(0);
      stepTilt.setValue(0);
      stepScale.setValue(1);
      stepOpacity.setValue(0);
      stepOffset.setValue(reduceMotion ? 0 : 10);
      animation = Animated.parallel([
        Animated.timing(stepOpacity, { toValue: 1, duration: 180, ...native }),
        Animated.timing(stepOffset, { toValue: 0, duration: 180, ...native }),
      ]);
    }

    animation.start(() => setIsTransitioning(false));
    return () => animation.stop();
    // Only a step change replays the entrance; width and motion settings apply from the next one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  /** A finished page lifts straight up, shrinks a little and fades away, so the deck loses a card. */
  const liftAwayCard = () => new Promise<void>((resolve) => {
    const ease = Easing.out(Easing.cubic);
    Animated.parallel([
      Animated.timing(stepOffset, { toValue: -TUCK_LIFT, duration: TUCK_OUT_MS, easing: ease, useNativeDriver: true }),
      Animated.timing(stepScale, { toValue: TUCK_SCALE, duration: TUCK_OUT_MS, easing: ease, useNativeDriver: true }),
      Animated.timing(stepOpacity, { toValue: 0, duration: TUCK_OUT_MS, useNativeDriver: true }),
    ]).start(() => resolve());
  });

  /**
   * Previous inside a deck: the top card sinks back into the slot directly behind, taking on the
   * back-card tone, while the cards already behind move one slot deeper. Once it lands, the deck
   * is exactly what the previous page shows, so the returning card has room on top.
   */
  const sinkCard = () => new Promise<void>((resolve) => {
    const to = STACK_SLOTS[0];
    const ease = Easing.inOut(Easing.quad);
    Animated.parallel([
      Animated.timing(stepX, { toValue: to.x, duration: SINK_MS, easing: ease, useNativeDriver: true }),
      Animated.timing(stepOffset, { toValue: to.y, duration: SINK_MS, easing: ease, useNativeDriver: true }),
      Animated.timing(stepTilt, { toValue: to.rotateDeg / THROW_ROTATION_DEG, duration: SINK_MS, easing: ease, useNativeDriver: true }),
      Animated.timing(stageTint, { toValue: 1, duration: SINK_MS, useNativeDriver: true }),
      Animated.timing(contentOpacity, { toValue: 0, duration: SINK_MS, useNativeDriver: true }),
      Animated.timing(deckShift, { toValue: 1, duration: SINK_MS, easing: ease, useNativeDriver: true }),
    ]).start(() => resolve());
  });

  /** End of a kana unit: the whole pile shrinks up into its kana-row tile. */
  const collapsePile = () => new Promise<void>((resolve) => {
    Animated.timing(collapse, {
      toValue: 1,
      duration: COLLAPSE_MS,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(() => resolve());
  });

  const step = content?.steps[stepIndex] || null;
  const selectedAnswer = step?.type === 'guided_choice' ? guidedAnswers[step.id] || null : null;
  const isLastStep = Boolean(content && stepIndex === content.steps.length - 1);
  const canContinue = step?.type === 'guided_choice'
    ? selectedAnswer === step.correctAnswer
    : step?.type === 'character_trace'
      ? Boolean(completedTraceSteps[step.id])
      : true;
  // The unit's kana, in teaching order, with the first and last step that teaches each one.
  const hubCharacters = useMemo(() => lessonKana(content), [content]);

  // Every entry into a lesson starts the row blank.
  useEffect(() => {
    if (content) beginHub(content.lessonId, hubCharacters.map(({ key, character }) => ({ key, character })));
  }, [beginHub, content, hubCharacters]);

  // A kana is "met" once the learner reaches its own teaching step; practice reads this later.
  const metKeys = useMemo(
    () => hubCharacters.filter((item) => maxStepReached >= item.firstIndex).map((item) => item.key),
    [hubCharacters, maxStepReached],
  );
  useEffect(() => { markMet(metKeys); }, [markMet, metKeys]);

  // Teaching only reveals kana; ink is earned in practice, so it stays at zero here.
  const hubItems = useMemo<KanaHubItem[]>(() => hubCharacters.map((item) => ({
    key: item.key,
    character: item.character,
    met: metKeys.includes(item.key),
    active: stepIndex >= item.firstIndex && stepIndex <= item.lastIndex,
    ink: 0,
  })), [hubCharacters, metKeys, stepIndex]);

  // One fixed stage by design; scrolling only returns when content cannot fit
  // (small phones, large accessibility text). Tracing never scrolls so gestures stay on the canvas.
  const needsScroll = scrollContentHeight > scrollViewportHeight + 1;
  const scrollEnabled = step?.type !== 'character_trace' && needsScroll;

  const playSpeech = async (playbackId: string, text: string, { haptic = true } = {}) => {
    if (haptic) void Haptics.selectionAsync().catch(() => undefined);
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

  // A sound check speaks its prompt as soon as it appears; the button replays it.
  const soundCheckAudio = step?.type === 'guided_choice' ? step.audioText : undefined;
  const soundCheckId = step?.id;
  useEffect(() => {
    if (!soundCheckAudio || !soundCheckId) return undefined;
    const timer = setTimeout(() => { void playSpeech(soundCheckId, soundCheckAudio); }, 380);
    return () => clearTimeout(timer);
  }, [soundCheckAudio, soundCheckId]);

  // The first time a kana's listen step opens, its sound plays on the hub's darken beat, so the
  // sound, the haptic and the grey-to-ink change land together. Revisits via Previous stay silent.
  const announcedKanaRef = useRef(new Set<string>());
  useEffect(() => { announcedKanaRef.current = new Set(); }, [lessonId]);
  const unlockStep = step?.type === 'character_focus' ? step : null;
  const unlockKey = unlockStep
    ? hubCharacters.find((item) => item.firstIndex === stepIndex)?.key
    : undefined;
  useEffect(() => {
    if (!unlockStep || !unlockKey || announcedKanaRef.current.has(unlockKey)) return undefined;
    announcedKanaRef.current.add(unlockKey);
    const timer = setTimeout(() => {
      void playSpeech(unlockStep.id, unlockStep.audioText, { haptic: false });
    }, KANA_UNLOCK_DARKEN_AT_MS);
    return () => clearTimeout(timer);
  }, [unlockKey, unlockStep]);

  const moveForward = async () => {
    if (!content || !step || isTransitioning) return;
    if (!isLastStep) {
      await stopSpeech();
      void Haptics.selectionAsync().catch(() => undefined);
      setIsTransitioning(true);
      if (sameKanaUnit(content.steps, stepIndex, stepIndex + 1) && !reduceMotion) {
        await liftAwayCard();
        // Before the next page renders, park the stage as the blank card in slot 0 and the deck one
        // slot deeper, which is exactly what is on screen now, so nothing flashes at the swap.
        const slot = STACK_SLOTS[0];
        contentOpacity.setValue(0);
        stageTint.setValue(1);
        stepScale.setValue(1);
        stepX.setValue(slot.x);
        stepOffset.setValue(slot.y);
        stepTilt.setValue(slot.rotateDeg / THROW_ROTATION_DEG);
        stepOpacity.setValue(1);
        deckShift.setValue(1);
        transitionRef.current = 'rise';
      } else if (endsKanaUnit(content.steps, stepIndex) && unitTileKey) {
        // "This kana is done": the content clears, then the pile closes into its tile, which
        // settles with a light tap.
        if (!reduceMotion) {
          await new Promise<void>((resolve) => {
            Animated.timing(contentOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => resolve());
          });
          await collapsePile();
        }
        setHubSettle((current) => ({ key: unitTileKey, id: (current?.id ?? 0) + 1 }));
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      }
      setStepIndex((index) => index + 1);
      setMaxStepReached((reached) => Math.max(reached, stepIndex + 1));
      return;
    }

    const started = await startLesson(content.lessonId);
    if (started) router.replace('/session');
    else Alert.alert('Practice could not start', useSessionStore.getState().startError || 'Please try again.');
  };

  const moveBack = async () => {
    if (!content || stepIndex === 0 || isTransitioning) return;
    await stopSpeech();
    void Haptics.selectionAsync().catch(() => undefined);
    setIsTransitioning(true);
    if (sameKanaUnit(content.steps, stepIndex - 1, stepIndex) && !reduceMotion) {
      await sinkCard();
      transitionRef.current = 'return';
    }
    setStepIndex((index) => Math.max(0, index - 1));
  };

  // A kana's listen card sits on its trace card, and the trace card keeps the tucked listen card
  // behind it, so the pile stays visible for the whole unit. Everything else is a single card.
  // One card behind for each of this kana's pages still to come, so the deck counts down as the
  // learner goes through the unit and is empty on its last page.
  const cardsBehind = content ? Math.min(pagesLeftInUnit(content.steps, stepIndex), MAX_CARDS_BEHIND) : 0;
  const deckSlots = STACK_SLOTS.slice(0, cardsBehind);
  const inKanaUnit = step?.type === 'character_focus' || step?.type === 'character_trace';

  useEffect(() => {
    Animated.timing(focus, {
      toValue: inKanaUnit ? 1 : 0,
      duration: reduceMotion ? 0 : FOCUS_FADE_MS,
      useNativeDriver: true,
    }).start();
  }, [focus, inKanaUnit, reduceMotion]);

  // Aim the collapse at the tile's centre: the row is centred, so its x offset follows from the
  // tile index, and its y from the measured row and pile positions. The ScrollView clips its
  // children, so the shrinking pile is a blank stand-in drawn above it, outside the scroll area.
  const unitTileIndex = inKanaUnit && step && 'character' in step
    ? hubCharacters.findIndex((item) => item.character === step.character)
    : -1;
  const tileSize = kanaTileSize(hubCharacters.length, windowWidth);
  const tilePitch = tileSize + KANA_HUB_TILE.gap;
  const unitTileKey = unitTileIndex >= 0 ? hubCharacters[unitTileIndex].key : undefined;
  const collapseX = unitTileIndex >= 0 ? (unitTileIndex - (hubCharacters.length - 1) / 2) * tilePitch : 0;
  const ghostTop = pileLayout ? scrollY + SCROLL_PADDING_TOP + pileLayout.y + STACK_ROOM.top : 0;
  const collapseY = cardSize
    ? hubY + KANA_HUB_TILE.paddingTop + tileSize / 2 - (ghostTop + cardSize.height / 2)
    : 0;
  const collapseScale = cardSize ? tileSize / cardSize.width : 0.08;
  const showGhost = Boolean(content && cardSize && pileLayout && endsKanaUnit(content.steps, stepIndex));
  // The real pile hides the instant the stand-in takes over.
  const pileMotion = { opacity: collapse.interpolate({ inputRange: [0, 0.001, 1], outputRange: [1, 0, 0] }) };
  const ghostMotion = {
    opacity: collapse.interpolate({ inputRange: [0, 0.001, 0.75, 1], outputRange: [0, 1, 1, 0] }),
    transform: [
      { translateX: collapse.interpolate({ inputRange: [0, 1], outputRange: [0, collapseX] }) },
      { translateY: collapse.interpolate({ inputRange: [0, 1], outputRange: [0, collapseY] }) },
      { scale: collapse.interpolate({ inputRange: [0, 1], outputRange: [1, collapseScale] }) },
    ],
  };
  /**
   * A card behind rests in its own slot at deckShift 0 and one slot deeper at 1. The deepest drawn
   * slot has nowhere deeper to go, so it fades out there instead (and fades in when the deck
   * moves up and a further page comes into view).
   */
  const layerMotion = (slotIndex: number) => {
    const here = STACK_SLOTS[slotIndex];
    const deeper = STACK_SLOTS[slotIndex + 1] ?? here;
    const range = { inputRange: [0, 1] };
    return {
      opacity: STACK_SLOTS[slotIndex + 1] ? 1 : deckShift.interpolate({ ...range, outputRange: [1, 0] }),
      transform: [
        { translateX: deckShift.interpolate({ ...range, outputRange: [here.x, deeper.x] }) },
        { translateY: deckShift.interpolate({ ...range, outputRange: [here.y, deeper.y] }) },
        { rotate: deckShift.interpolate({ ...range, outputRange: [`${here.rotateDeg}deg`, `${deeper.rotateDeg}deg`] }) },
      ],
    };
  };
  const stageMotion = {
    opacity: stepOpacity,
    transform: [
      { translateX: stepX },
      { translateY: stepOffset },
      { rotate: stepTilt.interpolate({ inputRange: [-1, 0], outputRange: [`-${THROW_ROTATION_DEG}deg`, '0deg'] }) },
      { scale: stepScale },
    ],
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
      {/* Warm focus tint and vignette while a kana's own unit is open. Sized from the window, not
          edge pins, because pinned absolute views have collapsed on web before. */}
      <Animated.View
        pointerEvents="none"
        style={[styles.focusVeil, { width: windowWidth, height: windowHeight, opacity: focus }]}
      />
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close lesson"
          hitSlop={10}
          onPress={() => router.back()}
          style={styles.headerSide}>
          <Ionicons name="close" size={26} color={palette.muted} />
        </Pressable>
        <Text accessibilityRole="header" numberOfLines={1} style={styles.unitTitle}>{content.title}</Text>
        <View style={styles.headerSide} />
      </View>
      <View style={styles.hubLayer} onLayout={({ nativeEvent }) => setHubY(nativeEvent.layout.y)}>
        <KanaHub items={hubItems} settle={hubSettle} />
      </View>

      <ScrollView
        ref={lessonScrollRef}
        style={styles.lessonScroll}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={scrollEnabled}
        onLayout={({ nativeEvent }) => {
          setScrollViewportHeight(nativeEvent.layout.height);
          setScrollY(nativeEvent.layout.y);
        }}
        onContentSizeChange={(_, height) => setScrollContentHeight(height)}>
        <Animated.View
          style={[styles.stageStack, pileMotion]}
          onLayout={({ nativeEvent }) => setPileLayout({ y: nativeEvent.layout.y, height: nativeEvent.layout.height })}>
          {cardSize ? (
            // Deepest first so each card paints over the one behind it. They carry no content and
            // are keyed by slot, so a card keeps its identity as the deck moves up or down a spot.
            deckSlots.map((slot, slotIndex) => ({ slot, slotIndex })).reverse().map(({ slot, slotIndex }) => {
              const deeper = STACK_SLOTS[slotIndex + 1];
              return (
                <Animated.View
                  key={`deck-slot-${slotIndex}`}
                  pointerEvents="none"
                  style={[
                    styles.stage,
                    styles.stackLayer,
                    { width: cardSize.width, height: cardSize.height, backgroundColor: slot.color },
                    layerMotion(slotIndex),
                  ]}>
                  {deeper ? (
                    // Shades toward the deeper slot's tone as the card moves into it, so it never pops.
                    <Animated.View
                      style={[
                        styles.stageTint,
                        {
                          width: cardSize.width - 2,
                          height: cardSize.height - 2,
                          backgroundColor: deeper.color,
                          opacity: deckShift,
                        },
                      ]}
                    />
                  ) : null}
                </Animated.View>
              );
            })
          ) : null}
          <Animated.View
            pointerEvents={isTransitioning ? 'none' : 'auto'}
            style={[styles.stage, styles.topCard, stageMotion]}
            onLayout={({ nativeEvent }) => {
              const { width, height } = nativeEvent.layout;
              setCardSize((current) => (
                current && current.width === width && current.height === height ? current : { width, height }
              ));
            }}>
          {cardSize ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.stageTint,
                { width: cardSize.width - 2, height: cardSize.height - 2, opacity: stageTint },
              ]}
            />
          ) : null}
          <Animated.View style={[styles.cardContent, { opacity: contentOpacity }]}>
          {step.type === 'introduction' ? (
            <IntroductionStep
              step={step}
              speakingId={speakingId}
              onPlayBeat={(index, audioText) => playSpeech(`${step.id}-beat-${index}`, audioText)}
            />
          ) : null}
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
              guidance={traceGuidance(content.steps, stepIndex)}
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
              isPlaying={speakingId === step.id}
              playbackBusy={Boolean(speakingId)}
              onPlay={() => playSpeech(step.id, step.audioText || step.prompt)}
              onSelect={(answer) => setGuidedAnswers((current) => ({ ...current, [step.id]: answer }))}
            />
          ) : null}
          {step.type === 'synthesis' ? (
            <SynthesisStep
              step={step}
              illustration={step.illustrationKey ? LESSON_ILLUSTRATIONS[step.illustrationKey] : undefined}
              speakingId={speakingId}
              onPlayWord={() => playSpeech(`${step.id}-word`, step.audioText)}
              onPlaySegment={(index, character) => playSpeech(`${step.id}-segment-${index}`, character)}
            />
          ) : null}
          {step.type === 'scene' ? (
            <SceneStep
              step={step}
              speakingId={speakingId}
              onPlayLine={(index, japanese) => playSpeech(`${step.id}-line-${index}`, japanese)}
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
          </Animated.View>
        </Animated.View>
      </ScrollView>

      {showGhost && cardSize ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.collapseGhost,
            {
              top: ghostTop,
              left: (windowWidth - cardSize.width) / 2,
              width: cardSize.width,
              height: cardSize.height,
            },
            ghostMotion,
          ]}>
          {/* The last page of a unit has no cards behind it, so the stand-in is one sheet. */}
          <View style={[styles.ghostSheet, { width: cardSize.width, height: cardSize.height, backgroundColor: palette.surface }]} />
        </Animated.View>
      ) : null}

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
  header: { minHeight: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  headerSide: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  unitTitle: { flex: 1, color: palette.accent, fontFamily: type.display, fontSize: 13, fontWeight: '700', letterSpacing: 1.6, textAlign: 'center', textTransform: 'uppercase' },
  lessonScroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 6, paddingBottom: 16 },
  // The single stage: same position and footprint on every step. The bottom margin is always kept
  // so a stacked card's edge has room without the stage changing size between steps.
  stageStack: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 580,
    alignSelf: 'center',
    paddingTop: STACK_ROOM.top,
    paddingHorizontal: STACK_ROOM.side,
    paddingBottom: STACK_ROOM.bottom,
  },
  // Sits exactly over the top card's box; width and height are set from its measured size.
  stackLayer: {
    position: 'absolute',
    top: STACK_ROOM.top,
    left: STACK_ROOM.side,
    flexGrow: 0,
    maxWidth: undefined,
    zIndex: 0,
  },
  topCard: { zIndex: 2 },
  // Covers the top card's paper inside its 1px border. Sized from the measured card, not edge pins.
  stageTint: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 15,
    backgroundColor: STACK_SLOTS[0].color,
  },
  // Keeps each step's layout the same as before the content got its own fade layer.
  cardContent: { flexGrow: 1, justifyContent: 'center' },
  hubLayer: { zIndex: 1 },
  // Warm paper tint plus an inset shadow as the vignette (RN 0.81 boxShadow, new architecture).
  focusVeil: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(222, 186, 140, 0.16)',
    boxShadow: 'inset 0 0 160px 24px rgba(96, 64, 30, 0.13)',
  },
  collapseGhost: { position: 'absolute', zIndex: 5 },
  ghostSheet: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 16,
    ...shadow,
  },
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
    paddingVertical: 22,
    ...shadow,
  },
  introductionStep: { justifyContent: 'center' },
  introductionSequence: { marginTop: 30, gap: 22 },
  introductionLead: { color: palette.ink, fontFamily: type.body, fontSize: 23, lineHeight: 33, fontWeight: '700' },
  introductionStatement: { color: palette.ink, fontFamily: type.body, fontSize: 19, lineHeight: 29 },
  introductionGoal: {
    marginTop: 6,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    color: palette.accent,
    fontFamily: type.body,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 25,
  },
  beatRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginTop: 28 },
  beat: { flex: 1, minWidth: 0, minHeight: 58, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: palette.line, borderRadius: 999, backgroundColor: palette.canvas },
  activeBeat: { borderColor: palette.accent, backgroundColor: palette.accent },
  beatLabel: { color: palette.ink, fontFamily: type.display, fontSize: 20 },
  beatReading: { color: palette.muted, fontSize: 11, fontWeight: '800' },
  activeBeatText: { color: palette.white },
  introMark: { width: 84, height: 84, borderRadius: 42, backgroundColor: palette.accentSoft, alignItems: 'center', justifyContent: 'center', marginVertical: 18 },
  introKana: { color: palette.accent, fontFamily: type.display, fontSize: 46 },
  stepTitle: { color: palette.ink, fontFamily: type.display, fontSize: 31, lineHeight: 39 },
  stepBody: { color: palette.muted, fontFamily: type.body, fontSize: 16, lineHeight: 25, marginTop: 11 },
  objectiveList: { gap: 13, marginTop: 24 },
  objectiveRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  objectiveText: { flex: 1, color: palette.ink, fontSize: 14, lineHeight: 21 },
  callout: { color: palette.ink, fontSize: 13, lineHeight: 20, backgroundColor: palette.goldSoft, borderLeftWidth: 3, borderLeftColor: palette.gold, borderRadius: 6, padding: 14, marginTop: 20 },
  // The listen page's bottom zone: romaji as the one accent, the hint as plain text, a quiet Hear.
  focusFooter: { alignItems: 'center', gap: 6 },
  focusCharacter: {
    color: palette.ink,
    fontFamily: type.kana,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  focusRomanization: { color: palette.accent, fontSize: 22, lineHeight: 26, fontWeight: '900' },
  soundCue: { color: palette.ink, fontFamily: type.display, fontSize: 17, lineHeight: 23, textAlign: 'center' },
  soundNote: { color: palette.muted },
  focusSoundButton: {
    alignSelf: 'stretch',
    minHeight: 46,
    marginTop: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFocusSoundButton: { borderColor: palette.accent, backgroundColor: palette.accentSoft },
  focusSoundButtonText: { color: palette.accent, fontSize: 15, fontWeight: '800' },
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
  soundCheckButton: { width: 76, height: 76, borderRadius: 38, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', backgroundColor: palette.accent, marginTop: 22 },
  choiceList: { gap: 11, marginTop: 24 },
  kanaChoiceList: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  kanaChoice: { flex: 1, maxWidth: 110, minHeight: 96, paddingHorizontal: 0, justifyContent: 'center' },
  kanaChoiceText: { fontFamily: type.display, fontSize: 40, fontWeight: '400' },
  hintLine: { color: palette.accent, fontSize: 15, lineHeight: 22, fontWeight: '700', textAlign: 'center', marginTop: 18 },
  correctHintLine: { color: palette.success },
  choice: { minHeight: 58, borderWidth: 1, borderColor: palette.line, borderRadius: 8, backgroundColor: palette.surface, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  choiceText: { color: palette.ink, fontSize: 19, fontWeight: '700' },
  correctChoice: { borderColor: palette.success, backgroundColor: palette.successSoft },
  incorrectChoice: { borderColor: palette.danger, backgroundColor: palette.accentSoft },
  correctChoiceText: { color: palette.success },
  recapRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginTop: 24 },
  recapItem: { flex: 1, minWidth: 0, alignItems: 'center', backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: 8, paddingVertical: 12 },
  activeRecapItem: { borderColor: palette.accent, backgroundColor: palette.accentSoft },
  recapCharacter: { color: palette.ink, fontSize: 26, fontWeight: '700' },
  recapReading: { color: palette.accent, fontSize: 11, fontWeight: '900', marginTop: 3 },
  practiceTitle: { color: palette.ink, fontFamily: type.display, fontSize: 19, marginTop: 28 },
  practiceText: { color: palette.muted, fontSize: 15, lineHeight: 22, marginTop: 6 },
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
