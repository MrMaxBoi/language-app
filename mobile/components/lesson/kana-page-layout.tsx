import { type ReactNode, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, type } from '@/constants/kokoro-theme';

/** Fixed height of the bottom zone, so the character box sits in the same place on every kana page. */
export const KANA_PAGE_FOOTER_HEIGHT = 124;
const MAX_CHARACTER_BOX = 420;
/**
 * Font size of a shown kana as a share of its box. The trace paths span roughly 15-85% of their
 * 1024 viewBox, and Klee One's kana fill about that much of the em, so at this size the shown あ
 * and the traced あ cover the same area.
 */
export const KANA_GLYPH_SCALE = 0.9;

/**
 * The one layout a kana's own pages (listen, trace) share: title pinned to the top, the character
 * in a square box in the middle, and a bottom zone of fixed height. Because the box has the same
 * size and position on every page, the kana stays put when the deck steps from "look" to "draw".
 */
export function KanaPageLayout({
  title,
  titleAccessory,
  children,
  footer,
}: {
  title: string;
  /** A small control at the right end of the title row (the trace page's reset). */
  titleAccessory?: ReactNode;
  /** Renders the character inside the square box; `side` is its width and height in points. */
  children: (side: number) => ReactNode;
  footer: ReactNode;
}) {
  const [side, setSide] = useState<number | null>(null);

  return (
    <View style={styles.page}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {titleAccessory}
      </View>
      <View
        style={styles.middle}
        onLayout={({ nativeEvent }) => {
          const next = Math.floor(Math.min(nativeEvent.layout.width, nativeEvent.layout.height, MAX_CHARACTER_BOX));
          setSide((current) => (current === next ? current : next));
        }}>
        {/* Rendered only once measured, so the box never shows at a wrong size first. */}
        {side ? <View style={{ width: side, height: side }}>{children(side)}</View> : null}
      </View>
      <View style={styles.footer}>{footer}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, color: palette.ink, fontFamily: type.display, fontSize: 31, lineHeight: 39 },
  middle: { flex: 1, minHeight: 120, alignItems: 'center', justifyContent: 'center', marginVertical: 12 },
  // minHeight, not height: a hint that wraps grows the zone instead of spilling over the kana.
  footer: { minHeight: KANA_PAGE_FOOTER_HEIGHT, justifyContent: 'flex-end' },
});
