import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { palette, type } from '@/constants/kokoro-theme';

export type KanaHubItem = {
  key: string;
  character: string;
  /** Revealed once the learner reaches the kana's own teaching step. Before that the tile is locked. */
  met: boolean;
  /** The kana is being taught on the current lesson step. */
  active?: boolean;
  /** 0..1, earned only in practice from how well the learner answers questions about this kana. */
  ink: number;
  /** Practice asked about this kana at least once. Only shown when the hub is in practice mode. */
  tested?: boolean;
};

/**
 * Unlock choreography, in ms from the moment a kana is first met:
 * the lesson card settles, the dot dissolves, the kana is drawn in grey, then it darkens to ink.
 * The darken beat is the one that matters; the lesson screen plays the kana's sound on it too.
 */
const UNLOCK_SETTLE_MS = 250;
const DOT_OUT_MS = 150;
const DRAW_MS = 250;
const DARKEN_MS = 400;
const RING_MS = 600;
export const KANA_UNLOCK_DARKEN_AT_MS = UNLOCK_SETTLE_MS + DOT_OUT_MS + DRAW_MS;

const TILE_SIZE = 52;
const TILE_GAP = 10;
const ROW_PADDING_TOP = 10;
/** Horizontal room kept free beside the row, so it never touches the screen edges. */
const ROW_SIDE_MARGIN = 24;
const MIN_TILE_SIZE = 34;

/** Tile size for a row of `count` kana on a screen `screenWidth` wide: 52pt, shrinking to fit longer rows. */
export function kanaTileSize(count: number, screenWidth: number): number {
  if (count <= 0) return TILE_SIZE;
  const available = screenWidth - ROW_SIDE_MARGIN * 2 - TILE_GAP * (count - 1);
  return Math.max(MIN_TILE_SIZE, Math.min(TILE_SIZE, Math.floor(available / count)));
}
const LOCKED_GREY = palette.locked;
const MET_OUTLINE = 'rgba(41, 38, 32, 0.28)';

/** The quiet "settle" a tile plays when a finished kana unit collapses into it. */
const SETTLE_MS = 280;

function KanaTile({
  item,
  showTesting,
  settleId,
  size,
}: {
  item: KanaHubItem;
  showTesting: boolean;
  settleId?: number;
  size: number;
}) {
  const box = { width: size, height: size, borderRadius: Math.round(size * 0.27) };
  const scale = size / TILE_SIZE;
  const reduceMotion = useReducedMotion();
  const settle = useSharedValue(0);
  useEffect(() => {
    if (!settleId || reduceMotion) return;
    settle.value = 0;
    settle.value = withTiming(1, { duration: SETTLE_MS, easing: Easing.out(Easing.quad) });
  }, [reduceMotion, settle, settleId]);
  // Swells a touch as the pile lands, then eases back to rest.
  const settleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + 0.14 * Math.sin(Math.PI * settle.value) }],
  }));
  const ink = Math.max(0, Math.min(1, item.ink));
  const isFull = item.met && ink >= 0.999;
  // Grey only ever means "locked". An untested kana stays black and keeps a dashed outline.
  const isUntested = showTesting && item.met && !item.tested;
  const solid = item.met && !isUntested;
  const characterColor = isFull ? palette.success : palette.ink;
  const outlineColor = isFull ? palette.success : MET_OUTLINE;

  // Tiles that mount already met (practice, results, revisits) never replay the unlock.
  const dotOut = useSharedValue(item.met ? 1 : 0);
  const draw = useSharedValue(item.met ? 1 : 0);
  const darken = useSharedValue(item.met ? 1 : 0);
  const solidness = useSharedValue(solid ? 1 : 0);
  const ring = useSharedValue(0);
  const fill = useSharedValue(ink);
  const previousMet = useRef(item.met);
  const unlockingRef = useRef(false);

  useEffect(() => {
    const wasMet = previousMet.current;
    previousMet.current = item.met;
    if (wasMet === item.met) return undefined;

    if (!item.met) {
      // A fresh lesson entry resets the row instantly.
      unlockingRef.current = false;
      dotOut.value = 0;
      draw.value = 0;
      darken.value = 0;
      ring.value = 0;
      return undefined;
    }

    unlockingRef.current = true;
    if (reduceMotion) {
      // No movement: the colour change lands instantly, still in time with the sound and haptic.
      const instant = { duration: 0 };
      dotOut.value = withDelay(KANA_UNLOCK_DARKEN_AT_MS, withTiming(1, instant));
      draw.value = withDelay(KANA_UNLOCK_DARKEN_AT_MS, withTiming(1, instant));
      darken.value = withDelay(KANA_UNLOCK_DARKEN_AT_MS, withTiming(1, instant));
    } else {
      dotOut.value = withDelay(UNLOCK_SETTLE_MS, withTiming(1, { duration: DOT_OUT_MS, easing: Easing.in(Easing.quad) }));
      draw.value = withDelay(UNLOCK_SETTLE_MS + DOT_OUT_MS, withTiming(1, { duration: DRAW_MS, easing: Easing.out(Easing.cubic) }));
      darken.value = withDelay(KANA_UNLOCK_DARKEN_AT_MS, withTiming(1, { duration: DARKEN_MS, easing: Easing.inOut(Easing.quad) }));
      ring.value = 0;
      ring.value = withDelay(KANA_UNLOCK_DARKEN_AT_MS, withTiming(1, { duration: RING_MS, easing: Easing.out(Easing.quad) }));
    }

    const beat = setTimeout(() => {
      unlockingRef.current = false;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      try {
        AccessibilityInfo.announceForAccessibility?.(`New kana unlocked: ${item.character}`);
      } catch {
        // Announcements are a nicety; the unlock must still play without them.
      }
    }, KANA_UNLOCK_DARKEN_AT_MS);
    return () => clearTimeout(beat);
  }, [darken, dotOut, draw, item.character, item.met, reduceMotion, ring]);

  useEffect(() => {
    const target = solid ? 1 : 0;
    if (reduceMotion) {
      solidness.value = unlockingRef.current
        ? withDelay(KANA_UNLOCK_DARKEN_AT_MS, withTiming(target, { duration: 0 }))
        : target;
      return;
    }
    // During an unlock the dashed outline turns solid on the darken beat; otherwise it eases over.
    solidness.value = unlockingRef.current
      ? withDelay(KANA_UNLOCK_DARKEN_AT_MS, withTiming(target, { duration: DARKEN_MS }))
      : withTiming(target, { duration: 300 });
  }, [reduceMotion, solid, solidness]);

  useEffect(() => {
    // Ink rises slowly like it is soaking into paper; skipped entirely for reduced motion.
    fill.value = reduceMotion ? ink : withTiming(ink, { duration: 650, easing: Easing.out(Easing.cubic) });
  }, [fill, ink, reduceMotion]);

  const inkStyle = useAnimatedStyle(() => ({ height: `${fill.value * 100}%` }));
  const dotStyle = useAnimatedStyle(() => ({
    opacity: 1 - dotOut.value,
    transform: [{ scale: 1 - dotOut.value }],
  }));
  const characterStyle = useAnimatedStyle(() => ({
    opacity: draw.value,
    color: interpolateColor(darken.value, [0, 1], [LOCKED_GREY, characterColor]),
    transform: [{ translateY: 2 * (1 - draw.value) }, { scale: 0.9 + 0.1 * draw.value }],
  }));
  const dashedStyle = useAnimatedStyle(() => ({ opacity: 1 - solidness.value }));
  const solidStyle = useAnimatedStyle(() => ({ opacity: solidness.value }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: ring.value > 0 && ring.value < 1 ? 0.35 * (1 - ring.value) : 0,
    transform: [{ scale: 1 + 0.45 * ring.value }],
  }));

  const label = !item.met
    ? 'Locked kana'
    : isUntested
      ? `${item.character}, not tested yet`
      : showTesting
        ? `${item.character}, ${Math.round(ink * 100)} percent inked`
        : `${item.character}${item.active ? ', being taught now' : ''}`;

  return (
    <View accessible accessibilityLabel={label} style={[styles.slot, { width: size, height: size }]}>
      <Animated.View pointerEvents="none" style={[styles.ring, box, ringStyle]} />
      <Animated.View style={[styles.tile, box, item.met && styles.metTile, settleStyle]}>
        <Animated.View pointerEvents="none" style={[styles.ink, inkStyle]} />
        <Animated.View
          pointerEvents="none"
          style={[styles.outline, styles.dashedOutline, { borderRadius: box.borderRadius }, dashedStyle]}
        />
        <Animated.View
          pointerEvents="none"
          style={[styles.outline, { borderRadius: box.borderRadius, borderColor: outlineColor }, solidStyle]}
        />
        <Animated.View pointerEvents="none" style={[styles.lockedDot, dotStyle]} />
        <Animated.Text style={[styles.character, { fontSize: Math.round(26 * scale) }, characterStyle]}>
          {item.character}
        </Animated.Text>
        {isFull ? (
          <View style={styles.check}>
            <Ionicons name="checkmark" size={11} color={palette.white} />
          </View>
        ) : null}
      </Animated.View>
      {item.active ? <View style={styles.activeDot} /> : null}
    </View>
  );
}

/**
 * The unit's kana as a row of tiles. Tiles start locked (dashed outline, one dot), unlock with a
 * short grey-to-ink moment when the lesson teaches the kana, and fill with ink in practice
 * according to how well the learner answers.
 */
export function KanaHub({
  items,
  showTesting = false,
  settle,
}: {
  items: KanaHubItem[];
  showTesting?: boolean;
  /** Play the settle on this tile; a new id replays it. */
  settle?: { key: string; id: number } | null;
}) {
  const { width } = useWindowDimensions();
  if (!items.length) return null;
  const size = kanaTileSize(items.length, width);
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <KanaTile
          key={item.key}
          item={item}
          showTesting={showTesting}
          settleId={settle?.key === item.key ? settle.id : undefined}
          size={size}
        />
      ))}
    </View>
  );
}

/** Tile geometry, so a screen can aim an animation at a tile without measuring it. */
export const KANA_HUB_TILE = { gap: TILE_GAP, paddingTop: ROW_PADDING_TOP } as const;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: TILE_GAP, paddingTop: ROW_PADDING_TOP, paddingBottom: 16 },
  slot: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: palette.accent,
  },
  tile: {
    backgroundColor: 'rgba(255, 252, 246, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  metTile: { backgroundColor: palette.surface },
  outline: { ...StyleSheet.absoluteFill, borderWidth: 1 },
  dashedOutline: { borderStyle: 'dashed', borderColor: palette.line, borderWidth: 1.25 },
  ink: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: palette.successSoft },
  lockedDot: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: LOCKED_GREY },
  character: { fontFamily: type.display, fontSize: 26 },
  check: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: palette.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: { position: 'absolute', bottom: -10, width: 5, height: 5, borderRadius: 2.5, backgroundColor: palette.accent },
});
