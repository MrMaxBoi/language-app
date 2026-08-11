# Third-party data notices

## AnimCJK kana stroke data

The normalized median paths in `kana-tracing.ts` are adapted from the Hiragana
SVG files in [AnimCJK](https://github.com/parsimonhi/animCJK).

- Copyright: AnimCJK 2016-2026 FM-SH
- Source files: `svgsJaKana/12354.svg`, `12356.svg`, `12358.svg`, `12360.svg`,
  and `12362.svg`
- License: GNU Lesser General Public License, version 3 or later
- Local license copy: `ANIMCJK_LGPL.txt`

Kokoro stores only the ordered median points needed for the tracing interaction.
The coordinates remain in AnimCJK's original 1024 by 1024 view box.
